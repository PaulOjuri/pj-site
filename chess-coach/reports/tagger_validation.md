# Motif tagger validation — 2026-09-21

Tagger v1, 3000 Lichess puzzles sampled (rating 1400–2200, popularity ≥ 50, seed 260703).
Precision is a lower bound (Lichess labels are not exhaustive). A motif is eligible for leak scoring only when precision ≥ 0.7 on ≥ 20 labelled puzzles.

| Lichess theme | our motif(s) | support | tagged | precision | recall | eligible |
|---|---|---:|---:|---:|---:|:-:|
| fork | fork | 358 | 315 | 0.71 | 0.63 | yes |
| pin | pin | 239 | 40 | 0.62 | 0.10 | no |
| skewer | skewer | 61 | 63 | 0.75 | 0.77 | yes |
| discoveredAttack | discovered_attack, discovered_check | 177 | 122 | 0.76 | 0.53 | yes |
| doubleCheck | double_check | 27 | 16 | 1.00 | 0.59 | yes |
| backRankMate | back_rank | 17 | 34 | 0.50 | 1.00 | no |
| smotheredMate | smothered_mate | 3 | 3 | 1.00 | 1.00 | no |
| hangingPiece | hanging_piece | 97 | 203 | 0.42 | 0.88 | no |
| trappedPiece | trapped_piece | 64 | 28 | 0.32 | 0.14 | no |
| sacrifice | sacrifice | 299 | 256 | 0.83 | 0.71 | yes |
| deflection | deflection | 175 | 103 | 0.38 | 0.22 | no |
| capturingDefender | removal_of_defender | 25 | 40 | 0.15 | 0.24 | no |
| clearance | clearance | 52 | 2 | 0.00 | 0.00 | no |
| intermezzo | zwischenzug | 49 | 100 | 0.34 | 0.69 | no |
| promotion | promotion | 86 | 71 | 1.00 | 0.83 | yes |
| underPromotion | underpromotion | 0 | 0 | — | — | no |
| mate | mate_in_n | 425 | 424 | 1.00 | 0.99 | yes |
| xRayAttack | x_ray | 20 | 0 | — | 0.00 | no |

**Eligible for leak scoring:** discovered_attack, discovered_check, double_check, fork, knight_fork, mate_in_n, pawn_fork, promotion, queen_fork, royal_fork, sacrifice, skewer

Motifs without a Lichess counterpart (validated only by unit tests, excluded from scoring): absolute_pin, desperado, knight_fork, overloaded_piece, pawn_fork, perpetual, queen_fork, relative_pin, royal_fork, stalemate_trick
