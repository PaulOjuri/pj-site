'use client'

/**
 * CSS-only fallback for when WebGL is unavailable (sandboxed GPU,
 * hardware acceleration off, or unsupported browser).
 *
 * Mimics the shader aesthetic: slow-drifting warm blobs in the paper
 * palette with a faint SVG noise texture overlay.
 */
export function HeroFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Animated blobs — radial gradients that drift like the noise shader */}
      <div className="hero-blob hero-blob-1" />
      <div className="hero-blob hero-blob-2" />
      <div className="hero-blob hero-blob-3" />

      {/* SVG noise grain overlay */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.035]">
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      <style>{`
        .hero-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          will-change: transform;
        }
        .hero-blob-1 {
          width: 70vw;
          height: 70vw;
          top: -20%;
          left: -10%;
          background: radial-gradient(circle, #EAE8E0 0%, transparent 70%);
          animation: blob-drift-1 22s ease-in-out infinite;
        }
        .hero-blob-2 {
          width: 55vw;
          height: 55vw;
          top: 20%;
          right: -15%;
          background: radial-gradient(circle, #E8E2D8 0%, transparent 70%);
          animation: blob-drift-2 28s ease-in-out infinite;
        }
        .hero-blob-3 {
          width: 40vw;
          height: 40vw;
          bottom: 10%;
          left: 30%;
          background: radial-gradient(circle, rgba(200,119,58,0.10) 0%, transparent 70%);
          animation: blob-drift-3 18s ease-in-out infinite;
        }
        @keyframes blob-drift-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(4%, 6%) scale(1.06); }
          66%       { transform: translate(-3%, 3%) scale(0.97); }
        }
        @keyframes blob-drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40%       { transform: translate(-5%, -4%) scale(1.08); }
          70%       { transform: translate(3%, 5%) scale(0.95); }
        }
        @keyframes blob-drift-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(6%, -6%) scale(1.12); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-blob { animation: none; }
        }
      `}</style>
    </div>
  )
}
