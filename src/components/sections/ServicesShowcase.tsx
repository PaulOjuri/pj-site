interface Service {
  id: string
  title: string
  description: string
  deliverables: string[]
  price?: string
}

interface ServicesShowcaseProps {
  services: Service[]
}

export function ServicesShowcase({ services }: ServicesShowcaseProps) {
  return (
    <section style={{ padding: 'clamp(4rem, 8vw, 8rem) 0' }}>
      <div className="container-site">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {services.map((service, i) => (
            <div
              key={service.id}
              style={{
                borderTop: i === 0 ? '1px solid var(--line)' : undefined,
                borderBottom: '1px solid var(--line)',
                padding: 'clamp(2rem, 4vw, 3.5rem) 0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                gap: 'clamp(1.5rem, 4vw, 3rem)',
              }}
            >
              <div>
                <p
                  className="font-mono"
                  style={{
                    fontSize: '0.8rem',
                    letterSpacing: '0.12em',
                    color: 'var(--text-faint)',
                    marginBottom: '1rem',
                  }}
                >
                  {service.id}
                </p>
                <h2
                  style={{
                    fontSize: 'clamp(1.25rem, 2.5vw, 2rem)',
                    fontWeight: 400,
                    lineHeight: 1.1,
                    color: 'var(--text)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {service.title}
                </h2>
              </div>
              <div>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.75,
                    marginBottom: '1.5rem',
                  }}
                >
                  {service.description}
                </p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', listStyle: 'none' }}>
                  {service.deliverables.map((d) => (
                    <li
                      key={d}
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-faint)',
                        paddingLeft: '1rem',
                        position: 'relative',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          left: 0,
                          color: 'var(--accent)',
                        }}
                      >
                        ·
                      </span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
