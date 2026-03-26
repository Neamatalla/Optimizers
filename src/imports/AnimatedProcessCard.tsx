import { useState, useEffect, createContext, useContext } from 'react';
import { useLanguage } from '../app/contexts/LanguageContext';

// ── Scale context so ProcessCardScaler can inject scale without prop-drilling ──
export const CardScaleContext = createContext(1);

const colorSchemes = [
  // Green
  { border: 'rgba(106, 228, 153, 0.35)', orb: '#6ae499' },
  // Yellow
  { border: 'rgba(255, 215, 0, 0.35)',   orb: '#ffd700' },
  // Blue
  { border: 'rgba(59, 130, 246, 0.35)',  orb: '#3b82f6' },
  // Red
  { border: 'rgba(239, 68, 68, 0.35)',   orb: '#ef4444' },
  // Gray
  { border: 'rgba(156, 163, 175, 0.35)', orb: '#9ca3af' },
  // Orange
  { border: 'rgba(249, 115, 22, 0.35)',  orb: '#f97316' },
];

/* ── Single orbiting label pill ── */
type LabelProps = {
  children: React.ReactNode;
  angle: number;
  colorIndex: number;
  isActive: boolean;
  cx: number; // center X in px (already scaled)
  cy: number; // center Y in px (already scaled)
  r: number;  // orbit radius in px (already scaled)
  scale: number;
};

function AnimatedLabel({ children, angle, colorIndex, isActive, cx, cy, r, scale }: LabelProps) {
  const rad = (angle * Math.PI) / 180;
  const x = cx + r * Math.cos(rad);
  const y = cy + r * Math.sin(rad);

  const scheme = colorSchemes[colorIndex % colorSchemes.length];

  // pill sizing — scaled from a 200×auto base (wide enough for "Experimentation" on one line)
  const pillW  = Math.round(200 * scale);
  const padV   = Math.round(10 * scale);
  const padH   = Math.round(16 * scale);
  const radius = Math.round(10 * scale);
  const fs     = Math.max(11, Math.round(14 * scale));

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        // Only animate transform — never backdrop-filter, box-shadow, or border-color
        transform: `translate3d(calc(${x}px - 50%), calc(${y}px - 50%), 0)`,
        transition: 'transform 850ms cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'transform',
        zIndex: isActive ? 30 : 20,
        // Force GPU layer on iOS
        WebkitTransform: `translate3d(calc(${x}px - 50%), calc(${y}px - 50%), 0)`,
      }}
    >
      <div
        style={{
          width: pillW,
          padding: `${padV}px ${padH}px`,
          borderRadius: radius,
          // Switch border/shadow instantly (no transition) to stay in sync with orb color
          border: `1px solid ${isActive ? scheme.border : 'rgba(255,255,255,0.12)'}`,
          backgroundColor: 'rgba(8, 8, 8, 0.96)',
          boxShadow: isActive
            ? `inset 0px -5px 10px -3px ${scheme.orb}bb, inset 0 0 8px ${scheme.orb}33`
            : 'none',
          // NO backdrop-blur — it kills compositing performance on iOS Safari
        }}
      >
        <p
          style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 500,
            fontSize: fs,
            lineHeight: 1.35,
            textAlign: 'center',
            color: '#ffffff',
            margin: 0,
            whiteSpace: 'nowrap',
            letterSpacing: '0.02em',
          }}
        >
          {children}
        </p>
      </div>
    </div>
  );
}

/* ── Main card ── */
export function AnimatedProcessCard({ sectionVisible = false }: { sectionVisible?: boolean }) {
  const { t } = useLanguage();
  const scale = useContext(CardScaleContext);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!sectionVisible) return;
    const id = setInterval(() => setRotation(prev => prev + 60), 2000);
    return () => clearInterval(id);
  }, [sectionVisible]);

  // ── Dimensions scaled natively — NO CSS transform on the card ──
  const W  = Math.round(570 * scale);
  const H  = Math.round(589 * scale);
  const cx = Math.round(285 * scale);
  const cy = Math.round(294.5 * scale);
  const r  = Math.round(175 * scale);
  const orbSize  = Math.round(128 * scale);
  const ringSize = Math.round(350 * scale);
  const br = Math.round(43 * scale);

  const labels = [
    { name: 'Discovery',      baseAngle: 270 },
    { name: 'Research',       baseAngle: 210 },
    { name: 'Ideation',       baseAngle: 150 },
    { name: 'Prioritization', baseAngle: 90  },
    { name: 'Experimentation',baseAngle: 30  },
    { name: 'Results',        baseAngle: 330 },
  ];

  const topIdx = labels.findIndex(l => Math.abs((l.baseAngle + rotation) % 360 - 270) < 1);
  const activeIndex = topIdx !== -1 ? topIdx : 0;

  return (
    <div
      data-name="Card"
      style={{
        width: W,
        height: H,
        position: 'relative',
        borderRadius: br,
        backgroundColor: '#020601',
        // overflow VISIBLE on card root — backgrounds clipped below
        overflow: 'visible',
        flexShrink: 0,
      }}
    >
      {/* ── Background glows — own overflow-hidden wrapper ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: br,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {colorSchemes.map((scheme, idx) => {
          const active = activeIndex === idx;
          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                inset: 0,
                // Faster cross-fade = color stays in sync with label movement
                opacity: active ? 1 : 0,
                transition: 'opacity 400ms ease-in-out',
                willChange: 'opacity',
                pointerEvents: 'none',
              }}
            >
              {/* Central orb area */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Large outer glow */}
                <div
                  style={{
                    position: 'absolute',
                    width: orbSize * 3,
                    height: orbSize * 3,
                    borderRadius: '50%',
                    filter: 'blur(80px)',
                    opacity: 0.22,
                    background: `radial-gradient(circle, ${scheme.orb} 0%, transparent 70%)`,
                  }}
                />
                {/* Core blur */}
                <div
                  style={{
                    position: 'absolute',
                    width: Math.round(orbSize * 1.25),
                    height: Math.round(orbSize * 1.25),
                    borderRadius: '50%',
                    filter: `blur(${Math.round(28 * scale)}px)`,
                    opacity: 0.42,
                    background: scheme.orb,
                  }}
                />
                {/* Solid orb */}
                <div
                  style={{
                    position: 'relative',
                    width: orbSize,
                    height: orbSize,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.06)',
                    boxShadow: '0 0 30px rgba(0,0,0,0.5)',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: `radial-gradient(circle at 35% 35%, ${scheme.orb} 0%, ${scheme.orb}88 40%, #000 90%)`,
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 100%)',
                    }}
                  />
                </div>
              </div>

              {/* Edge glow */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: br,
                  opacity: 0.3,
                  boxShadow: `inset 0px -120px 200px -60px ${scheme.orb}`,
                  pointerEvents: 'none',
                }}
              />

              {/* Bottom flare */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100%',
                  height: '50%',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: '120%',
                    height: '26%',
                    filter: `blur(${Math.round(80 * scale)}px)`,
                    opacity: 0.4,
                    transform: `translateY(${Math.round(20 * scale)}px)`,
                    background: `radial-gradient(ellipse at center, ${scheme.orb} 0%, transparent 75%)`,
                  }}
                />
              </div>

              {/* Fading border */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: br,
                  filter: 'blur(4px)',
                  padding: '1.5px',
                  background: `linear-gradient(to bottom, transparent 0%, transparent 40%, ${scheme.orb}1a 60%, ${scheme.orb}55 100%)`,
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  zIndex: 40,
                  pointerEvents: 'none',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Orbit ring guide */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: ringSize,
          height: ringSize,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Label orbit layer — overflow: visible, no transform scale ── */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
        {labels.map((label, index) => {
          const angle = label.baseAngle + rotation;
          const norm  = angle % 360;
          const isActive = Math.abs(norm - 270) < 1;
          return (
            <AnimatedLabel
              key={label.name}
              angle={angle}
              colorIndex={index % 6}
              isActive={isActive}
              cx={cx}
              cy={cy}
              r={r}
              scale={scale}
            >
              {t(label.name)}
            </AnimatedLabel>
          );
        })}
      </div>
    </div>
  );
}