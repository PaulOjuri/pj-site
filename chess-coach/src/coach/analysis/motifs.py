"""Rule-based tactical motif tagger over engine principal variations (spec §7.3).

`detect_motifs(board, pv)` replays a PV from `board` (side to move = the beneficiary) and
derives motifs from what physically happens: captures and their exchange values, piece
geometry before/after each move, checks, vacated lines. It is deliberately conservative:
a motif is reported only when the line is decisive (mate, or a material swing >= 2 pawns
net of what was already hanging), because a confidently wrong tag is worse than none (§13).

Attribution (`tag_player_error`): for an error by the player at ply i
  own_tactic_missed       the engine's best line for the player executes a motif
  opponent_tactic_missed  the opponent's best reply to the played move executes a motif
  blunder_committed       neither: an evaluation loss without a tactical shape (positional)
"""
from __future__ import annotations

from dataclasses import dataclass, field

import chess

TAGGER_VERSION = "1"

VALUES = {chess.PAWN: 1, chess.KNIGHT: 3, chess.BISHOP: 3, chess.ROOK: 5, chess.QUEEN: 9, chess.KING: 0}
DECISIVE_GAIN = 2          # pawns of net material a line must win to count as a tactic
MAX_PV_PLIES = 8

# Motifs the tagger can emit. Anything not in here is unimplemented and must not appear in
# leak scoring (the validation report enforces the 0.7 precision floor per motif).
IMPLEMENTED = {
    "mate_in_n", "back_rank", "smothered_mate", "hanging_piece", "fork", "knight_fork", "pawn_fork",
    "queen_fork", "royal_fork", "pin", "absolute_pin", "relative_pin", "skewer", "discovered_attack",
    "discovered_check", "double_check", "trapped_piece", "removal_of_defender", "deflection",
    "zwischenzug", "sacrifice", "underpromotion", "promotion", "perpetual", "stalemate_trick",
    "x_ray", "clearance", "desperado", "overloaded_piece",
}


@dataclass
class MotifHit:
    motif: str
    attribution: str          # own_tactic_missed | opponent_tactic_missed | blunder_committed
    ply: int                  # the player's error ply
    fen: str                  # position the line starts from
    line: list[str]           # UCI moves of the line that executes the motif
    detail: str = ""


# --- material and exchange helpers ------------------------------------------------------

def material(board: chess.Board, color: chess.Color) -> int:
    return sum(VALUES[pt] * len(board.pieces(pt, color)) for pt in VALUES)


def balance(board: chess.Board, pov: chess.Color) -> int:
    return material(board, pov) - material(board, not pov)


def see(board: chess.Board, move: chess.Move) -> int:
    """Static exchange evaluation of `move` from the mover's perspective, in pawns.

    Iteratively swaps least-valuable attackers on the target square. Good enough for
    deciding whether a capture is 'free', 'even' or a sacrifice.
    """
    target = move.to_square
    b = board.copy(stack=False)
    gain = []
    captured = b.piece_at(target)
    gain.append(VALUES[captured.piece_type] if captured else 0)
    if move.promotion:
        gain[0] += VALUES[move.promotion] - 1
    mover_piece = b.piece_at(move.from_square)
    if mover_piece is None:
        return 0
    b.push(move)
    piece_on_square_value = VALUES[move.promotion or mover_piece.piece_type]
    side = b.turn
    while True:
        attackers = [sq for sq in b.attackers(side, target) if b.piece_at(sq) is not None]
        if not attackers:
            break
        sq = min(attackers, key=lambda s: VALUES[b.piece_at(s).piece_type])
        gain.append(piece_on_square_value - gain[-1])
        piece_on_square_value = VALUES[b.piece_at(sq).piece_type]
        cap = chess.Move(sq, target)
        if cap not in b.legal_moves:
            # pinned / illegal recapture: cannot continue the exchange
            gain.pop()
            break
        b.push(cap)
        side = b.turn
    # standard swap-list resolution
    n = len(gain)
    for i in range(n - 1, 0, -1):
        gain[i - 1] = -max(-gain[i - 1], gain[i])
    return gain[0]


def _defenders(board: chess.Board, sq: chess.Square, color: chess.Color) -> int:
    return len(board.attackers(color, sq))


def attacked_targets(board: chess.Board, sq: chess.Square) -> list[chess.Square]:
    """Enemy pieces attacked by the piece on `sq` that are undefended or worth more than it."""
    piece = board.piece_at(sq)
    if piece is None:
        return []
    out = []
    for t in board.attacks(sq):
        victim = board.piece_at(t)
        if victim is None or victim.color == piece.color:
            continue
        if victim.piece_type == chess.KING:
            out.append(t)
        elif VALUES[victim.piece_type] > VALUES[piece.piece_type] or _defenders(board, t, victim.color) == 0:
            out.append(t)
    return out


def _ray_between(a: chess.Square, b: chess.Square) -> list[chess.Square]:
    return list(chess.SquareSet(chess.between(a, b)))


def _pins_and_skewers(board: chess.Board, sq: chess.Square) -> tuple[set[str], list[str]]:
    """Pins/skewers created by the slider on `sq` against the enemy along each ray."""
    piece = board.piece_at(sq)
    tags: set[str] = set()
    details: list[str] = []
    if piece is None or piece.piece_type not in (chess.BISHOP, chess.ROOK, chess.QUEEN):
        return tags, details
    enemy = not piece.color
    directions = []
    if piece.piece_type in (chess.BISHOP, chess.QUEEN):
        directions += [(1, 1), (1, -1), (-1, 1), (-1, -1)]
    if piece.piece_type in (chess.ROOK, chess.QUEEN):
        directions += [(1, 0), (-1, 0), (0, 1), (0, -1)]
    f0, r0 = chess.square_file(sq), chess.square_rank(sq)
    for df, dr in directions:
        f, r = f0 + df, r0 + dr
        first = second = None
        while 0 <= f < 8 and 0 <= r < 8:
            s = chess.square(f, r)
            p = board.piece_at(s)
            if p is not None:
                if first is None:
                    first = (s, p)
                    if p.color != enemy:
                        break
                else:
                    second = (s, p)
                    break
            f, r = f + df, r + dr
        if first and second and first[1].color == enemy and second[1].color == enemy:
            v1, v2 = VALUES[first[1].piece_type], VALUES[second[1].piece_type]
            k1, k2 = first[1].piece_type == chess.KING, second[1].piece_type == chess.KING
            if k2:
                tags.update({"pin", "absolute_pin"})
                details.append(f"{chess.piece_name(first[1].piece_type)} pinned to king")
            elif k1 or v1 > v2:
                tags.add("skewer")
                details.append(f"{chess.piece_name(first[1].piece_type)} skewered to {chess.piece_name(second[1].piece_type)}")
            elif v2 > v1 and v2 > VALUES[piece.piece_type]:
                tags.update({"pin", "relative_pin"})
                details.append(f"{chess.piece_name(first[1].piece_type)} pinned to {chess.piece_name(second[1].piece_type)}")
    return tags, details


def _mate_shape(board: chess.Board) -> set[str]:
    """Given a checkmated board, name the mate pattern if it is a classic one."""
    tags = {"mate_in_n"}
    king = board.king(board.turn)
    checkers = list(board.checkers())
    if len(checkers) != 1:
        return tags
    checker = board.piece_at(checkers[0])
    kr = chess.square_rank(king)
    back_rank = 0 if board.turn == chess.WHITE else 7
    if checker.piece_type in (chess.ROOK, chess.QUEEN) and kr == back_rank and chess.square_rank(checkers[0]) == back_rank:
        # king boxed by own pawns/pieces on the second rank
        step = 1 if board.turn == chess.WHITE else -1
        front = [chess.square(f, kr + step) for f in range(max(0, chess.square_file(king) - 1), min(8, chess.square_file(king) + 2))]
        if all(board.piece_at(s) is not None and board.piece_at(s).color == board.turn for s in front):
            tags.add("back_rank")
    if checker.piece_type == chess.KNIGHT:
        neigh = [s for s in chess.SquareSet(chess.BB_KING_ATTACKS[king])]
        if all(board.piece_at(s) is not None and board.piece_at(s).color == board.turn for s in neigh):
            tags.add("smothered_mate")
    return tags


# --- main detector ------------------------------------------------------------------------

def _our_captures(states: list[dict]) -> list[dict]:
    return [st for st in states if st["by_us"] and st["captured"] is not None]


def _captured_squares(states: list[dict]) -> set[chess.Square]:
    return {st["move"].to_square for st in _our_captures(states)}


def _capture_see_from(board: chess.Board, piece_sq: chess.Square, target: chess.Square) -> int | None:
    """SEE of the piece on `piece_sq` capturing on `target` in `board`, or None if not legal."""
    mv = chess.Move(piece_sq, target)
    if mv not in board.legal_moves:
        return None
    return see(board, mv)


def detect_motifs(board: chess.Board, pv: list[str], *, already_hanging: int = 0,
                  force_decisive: bool = False) -> tuple[set[str], list[str]]:
    """Return (motifs, details) for the line `pv` played from `board` by the side to move.

    A motif is only reported when the line *exploits* it: the forked / pinned / skewered /
    trapped piece is actually captured later in the line, or the line mates.
    `already_hanging` is material the beneficiary could take trivially before the line.
    """
    tags: set[str] = set()
    details: list[str] = []
    if not pv:
        return tags, details
    b = board.copy()
    us = b.turn
    start_balance = balance(b, us)
    moves = []
    probe = b.copy(stack=False)
    for u in pv[:MAX_PV_PLIES]:
        try:
            mv = chess.Move.from_uci(u)
        except ValueError:
            break
        if mv not in probe.legal_moves:
            break
        moves.append(mv)
        probe.push(mv)
    if not moves:
        return tags, details

    first = moves[0]
    mover = b.piece_at(first.from_square)
    captured_first = b.piece_at(first.to_square)
    first_see = see(b, first)
    gives_check_first = b.gives_check(first)

    recaptures = []
    if b.move_stack:
        last = b.peek()
        recaptures = [m for m in b.legal_moves if m.to_square == last.to_square and b.is_capture(m)]

    states = []
    for idx, mv in enumerate(moves):
        piece = b.piece_at(mv.from_square)
        cap = b.piece_at(mv.to_square)
        is_check = b.gives_check(mv)
        b.push(mv)
        states.append({"idx": idx, "move": mv, "piece": piece, "captured": cap, "check": is_check,
                       "board": b.copy(stack=False), "by_us": (idx % 2 == 0),
                       "repetition": b.is_repetition(2)})
        if b.is_game_over():
            break

    end = states[-1]["board"]
    end_balance = balance(end, us)
    net_gain = end_balance - start_balance - already_hanging
    is_mate = end.is_checkmate() and end.turn != us
    # The engine eval can vouch for lines whose payoff lies beyond the stored PV (long attacks).
    decisive = is_mate or net_gain >= DECISIVE_GAIN or force_decisive
    our_caps = _our_captures(states)
    cap_squares = _captured_squares(states)

    # --- terminal shapes -------------------------------------------------------------
    if is_mate:
        tags |= _mate_shape(end)
        details.append(f"mate in {(len(states) + 1) // 2}")
    elif end.is_stalemate():
        tags.add("stalemate_trick")
    elif any(st["repetition"] for st in states) and net_gain <= 0:
        tags.add("perpetual")

    if not decisive and not tags:
        return tags, details

    after_first = states[0]["board"]
    if first.promotion:
        tags.add("promotion")
        if first.promotion != chess.QUEEN:
            tags.add("underpromotion")
    elif any(st["move"].promotion for st in states if st["by_us"]):
        tags.add("promotion")

    # Fork: our move attacks >= 2 targets and the line then captures one of them (or mates).
    for st in [s_ for s_ in states if s_["by_us"]][:2]:
        bd, mv, piece = st["board"], st["move"], st["piece"]
        if piece is None or piece.piece_type == chess.KING:
            continue
        targets = attacked_targets(bd, mv.to_square)
        if len(targets) < 2:
            continue
        later_caps = {s2["move"].to_square for s2 in our_caps if s2["idx"] > st["idx"] and s2["move"].from_square == mv.to_square
                      or (s2["idx"] > st["idx"] and s2["move"].to_square in targets)}
        cashed = bool(later_caps & set(targets))
        king_in = any(bd.piece_at(t).piece_type == chess.KING for t in targets)
        # the forking piece must survive: not capturable for free unless it gives check
        safe = see(states[st["idx"] - 1]["board"] if st["idx"] else board, mv) >= 0 or st["check"]
        if cashed and safe and not (is_mate and len(states) <= 1):
            tags.add("fork")
            name = {chess.KNIGHT: "knight_fork", chess.PAWN: "pawn_fork", chess.QUEEN: "queen_fork"}.get(piece.piece_type)
            if name:
                tags.add(name)
            if king_in:
                tags.add("royal_fork")
            details.append(f"{chess.piece_name(piece.piece_type)} forks " + ", ".join(chess.square_name(t) for t in targets))
            break

    # Pins / skewers: created by one of our first two moves, and the target piece is later captured.
    for st in [s_ for s_ in states if s_["by_us"]][:2]:
        bd, mv = st["board"], st["move"]
        ptags, pdet, victims = _pins_and_skewers_with_victims(bd, mv.to_square)
        later = {s2["move"].to_square for s2 in our_caps if s2["idx"] > st["idx"]}
        # a skewer is cashed by the same slider on our very next move, along the same ray
        next_ours = next((s2 for s2 in states if s2["idx"] == st["idx"] + 2), None)
        for tag, victim_sq, d in victims:
            if tag == "skewer":
                if next_ours is not None and next_ours["captured"] is not None \
                        and next_ours["move"].from_square == mv.to_square and next_ours["move"].to_square == victim_sq:
                    tags.add("skewer")
                    details.append(d)
            elif victim_sq in later or (is_mate and tag == "absolute_pin"):
                tags.update({"pin", tag})
                details.append(d)

    # Exploiting an existing absolute pin: after one of our moves, an enemy piece is pinned to its
    # king, we attack it with something cheaper (or a pawn), and the line wins it.
    for st in [s_ for s_ in states if s_["by_us"]][:3]:
        bd = st["board"]
        later = {s2["move"].to_square for s2 in our_caps if s2["idx"] > st["idx"]}
        for sq in later:
            v = bd.piece_at(sq)
            if v is None or v.color == us or v.piece_type == chess.KING or not bd.is_pinned(not us, sq):
                continue
            attackers = [a for a in bd.attackers(us, sq) if VALUES[bd.piece_at(a).piece_type] < VALUES[v.piece_type]
                         or bd.piece_at(a).piece_type == chess.PAWN]
            if attackers:
                tags.update({"pin", "absolute_pin"})
                details.append(f"pinned {chess.piece_name(v.piece_type)} on {chess.square_name(sq)} attacked and won")
                break
        if "pin" in tags:
            break

    # Discovered attack / check: unmasked by our first move, and the newly attacked piece is captured
    # (or it is the king and the move also wins material / mates).
    if mover is not None:
        unmasked = []
        for sq in after_first.pieces(chess.BISHOP, us) | after_first.pieces(chess.ROOK, us) | after_first.pieces(chess.QUEEN, us):
            if sq == first.to_square:
                continue
            new = after_first.attacks(sq) & ~board.attacks(sq)
            for t in new:
                v = after_first.piece_at(t)
                if v is not None and v.color != us:
                    unmasked.append((t, v))
        for t, v in unmasked:
            if v.piece_type == chess.KING:
                if decisive and (captured_first is not None or len(attacked_targets(after_first, first.to_square)) >= 1 or is_mate):
                    tags.add("discovered_check")
                    details.append("discovered check")
            elif t in cap_squares and VALUES[v.piece_type] >= 3:
                tags.add("discovered_attack")
                details.append(f"discovered attack on {chess.square_name(t)}")
    if len(after_first.checkers()) >= 2 and decisive:
        tags.add("double_check")

    # Sacrifice: at some point after the opponent's reply we are down >= 2 relative to the
    # start, and the line still ends decisively. SEE alone is fooled by refused captures.
    dips = [balance(st["board"], us) - start_balance for st in states if not st["by_us"]]
    persistent = any(dips[i] <= -2 and dips[i + 1] <= -2 for i in range(len(dips) - 1))
    sac_into_mate = is_mate and bool(dips) and dips[-1] <= -2
    if decisive and (persistent or sac_into_mate):
        tags.add("sacrifice")
        details.append(f"gives up {-min(dips)} before winning it back")

    # Zwischenzug: a recapture is available, we play a forcing move elsewhere first, then recapture.
    if recaptures and first not in recaptures and (gives_check_first or (captured_first is not None and first_see >= 0)) \
            and len(moves) >= 3 and any(moves[2].to_square == r.to_square for r in recaptures):
        tags.add("zwischenzug")

    # Removal of the defender / deflection / overload: our capture on X (move 3) was not
    # available or was losing before, and becomes winning because move 1 removed or
    # dragged away a defender of X.
    if len(states) >= 3 and states[2]["captured"] is not None and not is_mate or (len(states) >= 3 and states[2]["captured"] is not None and is_mate and len(states) > 3):
        x = moves[2].to_square
        attacker_sq = moves[2].from_square
        # the same piece capturing on X from the start position (if it could)
        before_see = _capture_see_from(board, attacker_sq, x) if board.piece_at(attacker_sq) is not None else None
        now_see = see(states[1]["board"], moves[2])
        victim_before = board.piece_at(x)
        improved = (before_see is None or before_see <= 0) and now_see > 0 and victim_before is not None \
            and victim_before.color != us and VALUES[victim_before.piece_type] >= 3
        if improved:
            reply = states[1]["move"]
            defenders_before = set(board.attackers(not us, x))
            if captured_first is not None and first.to_square in defenders_before:
                tags.add("removal_of_defender")
                details.append(f"captures the defender of {chess.square_name(x)}")
            elif reply.from_square in defenders_before:
                if reply.to_square == first.to_square and captured_first is not None:
                    tags.add("overloaded_piece")
                else:
                    tags.add("deflection")
                details.append(f"defender of {chess.square_name(x)} dragged away")

    # Trapped piece: after our first move an enemy piece (>= minor) is attacked, cannot be taken
    # for free right now, has no safe square, and we win it within the line.
    if not is_mate and not gives_check_first:
        for s2 in our_caps:
            if s2["idx"] < 2 or VALUES[s2["captured"].piece_type] < 3:
                continue
            victim_sq = s2["move"].to_square
            victim = after_first.piece_at(victim_sq)
            if victim is None or victim.color == us or victim.piece_type != s2["captured"].piece_type:
                continue
            if victim.piece_type == chess.KING:
                continue
            tmp = after_first.copy(stack=False)     # opponent to move
            if not tmp.is_attacked_by(us, victim_sq):
                continue
            # the trap must be new: created by our move, not pre-existing
            if board.is_attacked_by(us, victim_sq) and board.piece_at(victim_sq) == victim:
                pre = board.copy(stack=False)
                pre.turn = not us
                pre_escapes = [m for m in pre.legal_moves if m.from_square == victim_sq
                               and see(pre, m) >= 0 and (not pre.is_attacked_by(us, m.to_square) or pre.is_capture(m))]
                if not pre_escapes:
                    continue
            # not simply hanging: a capture right now is not a free win for us
            immediate = max((see(board, m) for m in board.legal_moves if m.to_square == victim_sq), default=-99)
            if immediate > 0:
                continue
            escapes = [m for m in tmp.legal_moves if m.from_square == victim_sq]
            safe = [m for m in escapes if see(tmp, m) >= 0 and
                    (not tmp.is_attacked_by(us, m.to_square) or tmp.is_capture(m))]
            if not safe:
                tags.add("trapped_piece")
                details.append(f"{chess.piece_name(victim.piece_type)} on {chess.square_name(victim_sq)} trapped")
            break

    # Hanging piece: the first move takes something that was free, and that is the whole tactic.
    if (captured_first is not None and first_see >= 2 and not is_mate
            and not tags & {"fork", "discovered_attack", "discovered_check", "pin", "skewer", "trapped_piece",
                            "deflection", "removal_of_defender", "overloaded_piece", "zwischenzug", "sacrifice"}):
        if _defenders(board, first.to_square, not us) == 0:
            tags.add("hanging_piece")
            details.append(f"{chess.piece_name(captured_first.piece_type)} on {chess.square_name(first.to_square)} undefended")
        elif VALUES[captured_first.piece_type] > VALUES[mover.piece_type]:
            tags.add("hanging_piece")
            details.append(f"{chess.piece_name(captured_first.piece_type)} on {chess.square_name(first.to_square)} insufficiently defended")

    # Clearance: a quiet vacating move whose square is used by another piece of ours two plies later.
    if mover is not None and captured_first is None and not gives_check_first and len(states) >= 3 and decisive:
        if moves[2].to_square == first.from_square and states[2]["captured"] is not None:
            tags.add("clearance")

    return tags, details


def _pins_and_skewers_with_victims(board: chess.Board, sq: chess.Square):
    """Like _pins_and_skewers but also returns (tag, victim_square, detail) per ray."""
    piece = board.piece_at(sq)
    tags: set[str] = set()
    details: list[str] = []
    victims: list[tuple[str, chess.Square, str]] = []
    if piece is None or piece.piece_type not in (chess.BISHOP, chess.ROOK, chess.QUEEN):
        return tags, details, victims
    enemy = not piece.color
    directions = []
    if piece.piece_type in (chess.BISHOP, chess.QUEEN):
        directions += [(1, 1), (1, -1), (-1, 1), (-1, -1)]
    if piece.piece_type in (chess.ROOK, chess.QUEEN):
        directions += [(1, 0), (-1, 0), (0, 1), (0, -1)]
    f0, r0 = chess.square_file(sq), chess.square_rank(sq)
    for df, dr in directions:
        f, r = f0 + df, r0 + dr
        first = second = None
        while 0 <= f < 8 and 0 <= r < 8:
            s = chess.square(f, r)
            p = board.piece_at(s)
            if p is not None:
                if first is None:
                    first = (s, p)
                    if p.color != enemy:
                        break
                else:
                    second = (s, p)
                    break
            f, r = f + df, r + dr
        if first and second and first[1].color == enemy and second[1].color == enemy:
            v1, v2 = VALUES[first[1].piece_type], VALUES[second[1].piece_type]
            k1, k2 = first[1].piece_type == chess.KING, second[1].piece_type == chess.KING
            n1, n2 = chess.piece_name(first[1].piece_type), chess.piece_name(second[1].piece_type)
            if k2 and v1 >= 1:
                victims.append(("absolute_pin", first[0], f"{n1} pinned to king"))
            elif (k1 or v1 > v2) and v2 >= 3:
                victims.append(("skewer", second[0], f"{n1} skewered to {n2}"))
            elif v2 > v1 and v2 > VALUES[piece.piece_type]:
                victims.append(("relative_pin", first[0], f"{n1} pinned to {n2}"))
    return tags, details, victims


# --- attribution over a game's records --------------------------------------------------------

def hanging_before(board: chess.Board) -> int:
    """Best trivially winnable material for the side to move (max SEE over captures), in pawns."""
    best = 0
    for m in board.legal_moves:
        if board.is_capture(m):
            best = max(best, see(board, m))
    return best


def tag_player_error(records: list, i: int, player_color: str) -> list[MotifHit]:
    """Tag the player's error at record index i. `records` are MoveRecord-like dicts/objects."""
    rec = records[i]
    get = (lambda r, k: r[k]) if isinstance(rec, dict) else (lambda r, k: getattr(r, k))
    if get(rec, "color") != player_color or get(rec, "classification") not in ("mistake", "blunder"):
        return []
    hits: list[MotifHit] = []
    board = chess.Board(get(rec, "fen_before"))
    # Mistakes and blunders are decisive by definition of the eval swing; the PV may be too
    # short to show the material payoff of a long attack.
    decisive = get(rec, "classification") in ("mistake", "blunder")

    # 1. What the player should have played.
    best_pv = get(rec, "best_pv") or []
    if best_pv:
        tags, det = detect_motifs(board, best_pv, force_decisive=decisive)
        for t in sorted(tags):
            hits.append(MotifHit(t, "own_tactic_missed", i, board.fen(), list(best_pv[:MAX_PV_PLIES]), "; ".join(det)))

    # 2. What the played move allowed: the opponent's best line from the next record.
    if i + 1 < len(records):
        nxt = records[i + 1]
        opp_board = chess.Board(get(nxt, "fen_before"))
        opp_pv = get(nxt, "best_pv") or []
        if opp_pv:
            tags, det = detect_motifs(opp_board, opp_pv, force_decisive=decisive)
            for t in sorted(tags):
                hits.append(MotifHit(t, "opponent_tactic_missed", i, opp_board.fen(), list(opp_pv[:MAX_PV_PLIES]), "; ".join(det)))

    if not hits:
        hits.append(MotifHit("positional", "blunder_committed", i, board.fen(), [get(rec, "uci")], "no tactical shape detected"))
    return hits
