import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TradeEasy — Personal Options Signal Tool',
  description:
    'A semi-automated options research tool. Deterministic screens, Claude thesis, human approval gate, IBKR bracket orders.',
}

const PIPELINE_STEPS = [
  { num: '01', label: 'SCAN WATCHLIST / ANALYZE TICKER', sub: 'CLI: optsig scan · optsig analyze TICKER', highlight: false },
  { num: '02', label: '4 DETERMINISTIC SCREENS', sub: 'yfinance · price trend · IV/HV · volume · momentum', highlight: false },
  { num: '03', label: 'CLAUDE THESIS', sub: 'claude-opus-4-8 · structured output · prompt-cached system prompt', highlight: false },
  { num: '04', label: 'RISK GATE + GREEKS', sub: 'Black-Scholes · position sizing · stop-loss · all recomputed', highlight: false },
  { num: '05', label: 'HUMAN APPROVAL QUEUE', sub: 'Streamlit UI · full ticket review · my decision', highlight: true },
  { num: '06', label: 'IBKR BRACKET ORDER — transmit=False', sub: 'ib_async · paper trading · manual transmit', highlight: false },
]

const PRINCIPLES = [
  {
    title: 'Claude reasons. Python calculates.',
    body: 'The model proposes a thesis and a structure. It never computes Greeks, position sizes, or stop-losses. Every number it suggests is discarded and recomputed deterministically.',
  },
  {
    title: 'Human approval is mandatory.',
    body: 'The system\'s output is a queue of proposals. Nothing becomes actionable until I approve it. On approval, a bracket order stages to IBKR paper trading with transmit=False. Final transmit is always mine.',
  },
  {
    title: 'Defined risk only.',
    body: 'Allowed structures: long_call, long_put, call_debit_spread, put_debit_spread. Naked positions and undefined-risk structures are rejected in the system prompt and re-validated in code.',
  },
  {
    title: 'Audit everything.',
    body: 'Every proposal — input bundle, raw model output, recomputed risk, my decision, fills — is persisted to SQLite. This is how I learn whether the signals are any good.',
  },
]

const STACK = [
  { name: 'Python 3.11', desc: 'core runtime, pure deterministic modules' },
  { name: 'yfinance', desc: 'delayed screening data, on-disk cache, rate-limited' },
  { name: 'Anthropic SDK', desc: 'claude-opus-4-8 for thesis, prompt caching on system prompt' },
  { name: 'ib_async', desc: 'IBKR bracket orders, paper trading, transmit=False' },
  { name: 'Streamlit', desc: 'local approval queue UI' },
  { name: 'SQLite', desc: 'proposals, decisions, runs, fills — zero infrastructure' },
  { name: 'Click', desc: 'CLI: optsig scan / optsig analyze TICKER' },
  { name: 'Black-Scholes (hand-rolled)', desc: 'Greeks, expected move, prob ITM — pure Python, unit tested' },
]

const EXAMPLE_JSON = `{
  "ticker": "NVDA",
  "structure": "call_debit_spread",
  "risk_type": "medium",
  "entry": {
    "net_debit_per_contract": 620,
    "contracts": 2
  },
  "risk": {
    "max_loss": 1240,
    "max_gain": 1760,
    "risk_reward": 1.42
  },
  "stop_loss": {
    "premium_stop_per_contract": 310,
    "underlying_stop": 122.4
  },
  "greeks": {
    "delta": 0.31,
    "theta": -3.1,
    "vega": 11.2,
    "source": "black_scholes"
  },
  "horizon": {
    "dte": 57,
    "manage_by": "2026-08-01"
  },
  "thesis": "...3-4 sentences from Claude grounded in the data bundle...",
  "confidence": 0.68,
  "status": "pending"
}`

function renderJson(raw: string) {
  // Tokenise JSON for simple syntax colouring — keys in accent, string values in muted, numbers/booleans in text
  const lines = raw.split('\n')
  return lines.map((line, i) => {
    // Key match: "key":
    const keyMatch = line.match(/^(\s*)("[\w_]+")(\s*:\s*)(.*)$/)
    if (keyMatch) {
      const [, indent, key, colon, rest] = keyMatch
      const isStringValue = rest.trim().startsWith('"') && (rest.trim().endsWith('"') || rest.trim().endsWith('",'))
      const isNumOrBool = /^(-?[\d.]+|true|false),?$/.test(rest.trim())
      return (
        <span key={i} style={{ display: 'block' }}>
          {indent}
          <span style={{ color: 'var(--accent)' }}>{key}</span>
          <span style={{ color: 'var(--text-faint)' }}>{colon}</span>
          {isStringValue ? (
            <span style={{ color: 'var(--text-muted)' }}>{rest}</span>
          ) : isNumOrBool ? (
            <span style={{ color: 'var(--text)' }}>{rest}</span>
          ) : (
            <span style={{ color: 'var(--text-faint)' }}>{rest}</span>
          )}
        </span>
      )
    }
    return (
      <span key={i} style={{ display: 'block', color: 'var(--text-faint)' }}>
        {line}
      </span>
    )
  })
}

export default function TradeEasyPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        style={{
          background: 'var(--bg)',
          minHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          paddingBottom: 'clamp(4rem, 8vw, 7rem)',
        }}
      >
        <div className="container-site">
          <p
            className="font-mono"
            style={{
              fontSize: '0.8rem',
              letterSpacing: '0.15em',
              color: 'var(--accent)',
              marginBottom: '2rem',
            }}
          >
            TRADEEASY — PERSONAL OPTIONS TOOL
          </p>

          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(3rem, 8vw, 7rem)',
              lineHeight: 0.92,
              color: 'var(--text)',
              textTransform: 'uppercase',
              marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)',
            }}
          >
            OPTIONS SIGNALS.
            <br />
            YOUR CALL.
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-body-stack), system-ui, sans-serif',
              fontSize: 'clamp(1rem, 1.3vw, 1.25rem)',
              color: 'var(--text-muted)',
              maxWidth: '600px',
              lineHeight: 1.65,
              marginBottom: '2.5rem',
            }}
          >
            A semi-automated research tool that generates directional options ideas, runs them through
            a deterministic risk gate, and queues them for my review. Claude provides the thesis.
            Python owns every number. I pull the trigger.
          </p>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <a href="#" className="link-accent" style={{ fontSize: '0.9rem', letterSpacing: '0.02em' }}>
              View on GitHub →
            </a>
            <a href="#" className="link-accent" style={{ fontSize: '0.9rem', letterSpacing: '0.02em' }}>
              Read the brief →
            </a>
          </div>
        </div>

        <div className="container-site" style={{ marginTop: 'clamp(4rem, 8vw, 7rem)' }}>
          <div className="hairline" />
        </div>
      </section>

      {/* ── PIPELINE ─────────────────────────────────────────── */}
      <section style={{ background: 'var(--bg)', paddingBlock: 'clamp(5rem, 10vw, 10rem)' }}>
        <div className="container-site">
          <p
            className="font-mono"
            style={{
              fontSize: '0.8rem',
              letterSpacing: '0.15em',
              color: 'var(--text-faint)',
              marginBottom: '3rem',
            }}
          >
            PIPELINE — TWO MODES, ONE ENGINE
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
              gap: 'clamp(3rem, 6vw, 6rem)',
              alignItems: 'start',
            }}
          >
            {/* Vertical timeline */}
            <div style={{ position: 'relative' }}>
              {/* Connecting line */}
              <div
                style={{
                  position: 'absolute',
                  left: '1.5rem',
                  top: '3rem',
                  bottom: '3rem',
                  width: '1px',
                  background: 'linear-gradient(to bottom, var(--accent), var(--line))',
                }}
                aria-hidden="true"
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {PIPELINE_STEPS.map((step, i) => (
                  <div
                    key={step.num}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '3rem 1fr',
                      gap: '1.25rem',
                      alignItems: 'start',
                      paddingBlock: step.highlight ? '1.75rem' : '1.25rem',
                      paddingInline: step.highlight ? '1rem 1.5rem' : '0 1rem',
                      marginInline: step.highlight ? '-1rem' : '0',
                      background: step.highlight ? 'var(--bg-elevated)' : 'transparent',
                      border: step.highlight ? '1px solid var(--accent)' : 'none',
                      borderRadius: step.highlight ? '2px' : '0',
                      position: 'relative',
                      zIndex: step.highlight ? 1 : 0,
                    }}
                  >
                    {/* Number dot */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '0.2rem' }}>
                      <div
                        style={{
                          width: '2rem',
                          height: '2rem',
                          borderRadius: '50%',
                          background: step.highlight ? 'var(--accent)' : 'var(--bg-elevated)',
                          border: step.highlight ? 'none' : '1px solid var(--line-strong)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <span
                          className="font-mono"
                          style={{
                            fontSize: '0.75rem',
                            letterSpacing: '0.05em',
                            color: step.highlight ? 'var(--bg)' : 'var(--text-faint)',
                            fontWeight: 700,
                          }}
                        >
                          {i + 1}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p
                        className="font-mono"
                        style={{
                          fontSize: step.highlight ? '0.8rem' : '0.72rem',
                          letterSpacing: '0.1em',
                          color: step.highlight ? 'var(--accent)' : 'var(--text)',
                          marginBottom: '0.4rem',
                          fontWeight: step.highlight ? 700 : 400,
                        }}
                      >
                        {step.label}
                      </p>
                      <p
                        style={{
                          fontFamily: 'var(--font-body-stack), system-ui, sans-serif',
                          fontSize: '0.8rem',
                          color: 'var(--text-faint)',
                          lineHeight: 1.5,
                        }}
                      >
                        {step.sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Aside text */}
            <div style={{ paddingTop: 'clamp(0rem, 2vw, 3rem)' }}>
              <h2
                className="font-display"
                style={{
                  fontSize: 'clamp(1.75rem, 3.5vw, 3rem)',
                  lineHeight: 0.95,
                  color: 'var(--text)',
                  marginBottom: '1.5rem',
                }}
              >
                TWO ENTRY POINTS.
                <br />
                ONE RISK MODEL.
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-body-stack), system-ui, sans-serif',
                  fontSize: 'clamp(0.9rem, 1vw, 1rem)',
                  color: 'var(--text-muted)',
                  lineHeight: 1.75,
                  marginBottom: '1.5rem',
                  maxWidth: '45ch',
                }}
              >
                <strong style={{ color: 'var(--text)' }}>optsig scan</strong> sweeps the full watchlist
                through all four screens and queues every name that clears.{' '}
                <strong style={{ color: 'var(--text)' }}>optsig analyze TICKER</strong> runs the same
                engine on a single name, on demand.
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body-stack), system-ui, sans-serif',
                  fontSize: 'clamp(0.9rem, 1vw, 1rem)',
                  color: 'var(--text-muted)',
                  lineHeight: 1.75,
                  maxWidth: '45ch',
                }}
              >
                Either path terminates at the same approval queue. The engine is the same. The risk
                gate is the same. The human step is the same.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRINCIPLES ───────────────────────────────────────── */}
      <section style={{ background: 'var(--bg-elevated)', paddingBlock: 'clamp(5rem, 10vw, 10rem)' }}>
        <div className="container-site">
          <p
            className="font-mono"
            style={{
              fontSize: '0.8rem',
              letterSpacing: '0.15em',
              color: 'var(--text-faint)',
              marginBottom: '1.5rem',
            }}
          >
            DESIGN PRINCIPLES
          </p>

          <h2
            className="font-display"
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 3.5rem)',
              lineHeight: 0.95,
              color: 'var(--text)',
              marginBottom: 'clamp(3rem, 6vw, 6rem)',
            }}
          >
            RULES THE SYSTEM
            <br />
            CANNOT BREAK.
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
              gap: 'clamp(1.5rem, 3vw, 2.5rem)',
            }}
          >
            {PRINCIPLES.map((p, i) => (
              <article
                key={i}
                style={{
                  padding: 'clamp(1.5rem, 3vw, 2.5rem)',
                  border: '1px solid var(--line)',
                  background: 'var(--bg)',
                }}
              >
                <p
                  className="font-mono"
                  style={{
                    fontSize: '0.75rem',
                    letterSpacing: '0.15em',
                    color: 'var(--accent)',
                    marginBottom: '1rem',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3
                  style={{
                    fontFamily: 'var(--font-body-stack), system-ui, sans-serif',
                    fontSize: 'clamp(0.95rem, 1.2vw, 1.1rem)',
                    color: 'var(--text)',
                    fontWeight: 600,
                    lineHeight: 1.3,
                    marginBottom: '1rem',
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-body-stack), system-ui, sans-serif',
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.7,
                  }}
                >
                  {p.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ───────────────────────────────────────── */}
      <section style={{ background: 'var(--bg)', paddingBlock: 'clamp(5rem, 10vw, 10rem)' }}>
        <div className="container-site">
          <p
            className="font-mono"
            style={{
              fontSize: '0.8rem',
              letterSpacing: '0.15em',
              color: 'var(--text-faint)',
              marginBottom: '3rem',
            }}
          >
            TECH STACK
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
              gap: 'clamp(3rem, 6vw, 6rem)',
              alignItems: 'start',
            }}
          >
            {/* Stack list */}
            <div>
              {STACK.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    paddingBlock: '1rem',
                    borderBottom: '1px solid var(--line)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: '0.72rem',
                        letterSpacing: '0.08em',
                        color: 'var(--text)',
                        flexShrink: 0,
                      }}
                    >
                      {item.name}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-body-stack), system-ui, sans-serif',
                        fontSize: '0.82rem',
                        color: 'var(--text-faint)',
                        lineHeight: 1.5,
                      }}
                    >
                      {item.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Architecture prose */}
            <div>
              <h2
                className="font-display"
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                  lineHeight: 0.95,
                  color: 'var(--text)',
                  marginBottom: '1.5rem',
                }}
              >
                INTENTIONALLY
                <br />
                HYBRID.
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-body-stack), system-ui, sans-serif',
                  fontSize: 'clamp(0.9rem, 1vw, 1rem)',
                  color: 'var(--text-muted)',
                  lineHeight: 1.75,
                  marginBottom: '1.5rem',
                  maxWidth: '48ch',
                }}
              >
                The data layer is intentionally hybrid. yfinance handles cheap broad screening — the
                kind of data pull you do across 20+ names. Only names that clear a deterministic
                screen get routed to IBKR for real-time quotes and broker Greeks. This keeps the tool
                under Yahoo&apos;s rate limit and off IBKR&apos;s market-data line limits.
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body-stack), system-ui, sans-serif',
                  fontSize: 'clamp(0.9rem, 1vw, 1rem)',
                  color: 'var(--text-muted)',
                  lineHeight: 1.75,
                  maxWidth: '48ch',
                }}
              >
                IV rank is a known proxy: yfinance doesn&apos;t provide historical implied vol, so
                the screen uses IV/HV ratio as a stand-in. It&apos;s labeled as such everywhere. A
                real IV rank source can drop in without touching the engine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROPOSAL SCHEMA ──────────────────────────────────── */}
      <section style={{ background: 'var(--bg-elevated)', paddingBlock: 'clamp(5rem, 10vw, 10rem)' }}>
        <div className="container-site">
          <p
            className="font-mono"
            style={{
              fontSize: '0.8rem',
              letterSpacing: '0.15em',
              color: 'var(--text-faint)',
              marginBottom: '1.5rem',
            }}
          >
            PROPOSAL SCHEMA — §5B
          </p>

          <h2
            className="font-display"
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 3.5rem)',
              lineHeight: 0.95,
              color: 'var(--text)',
              marginBottom: 'clamp(2.5rem, 5vw, 4rem)',
            }}
          >
            EVERY IDEA IS A COMPLETE
            <br />
            DECISION-READY TICKET.
          </h2>

          <div
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--line-strong)',
              padding: 'clamp(1.5rem, 3vw, 2.5rem)',
              overflowX: 'auto',
            }}
          >
            <pre
              className="font-mono"
              style={{
                fontSize: 'clamp(0.72rem, 1vw, 0.85rem)',
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              <code>{renderJson(EXAMPLE_JSON)}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* ── DISCLAIMER ───────────────────────────────────────── */}
      <section
        style={{
          background: 'var(--bg-inset)',
          paddingBlock: 'clamp(4rem, 8vw, 8rem)',
          textAlign: 'center',
        }}
      >
        <div className="container-site">
          <p
            className="font-mono"
            style={{
              fontSize: '0.8rem',
              letterSpacing: '0.2em',
              color: 'var(--accent)',
              marginBottom: '1.5rem',
            }}
          >
            PERSONAL USE ONLY — NOT TRADING ADVICE
          </p>

          <p
            style={{
              fontFamily: 'var(--font-body-stack), system-ui, sans-serif',
              fontSize: 'clamp(0.9rem, 1.1vw, 1.05rem)',
              color: 'var(--text-muted)',
              lineHeight: 1.7,
              maxWidth: '60ch',
              marginInline: 'auto',
              marginBottom: '2rem',
            }}
          >
            This is a personal research tool for my own capital. It does not give financial advice.
            All trade decisions are mine. Data is delayed. IV/HV ratio is a proxy. The system can
            and will be wrong.
          </p>

          <a href="#" className="link-accent" style={{ fontSize: '0.9rem', letterSpacing: '0.02em' }}>
            View source →
          </a>
        </div>
      </section>
    </>
  )
}
