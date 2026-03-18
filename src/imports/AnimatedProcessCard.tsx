import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';

type ColorScheme = {
  bg: string;
  text: string;
  border: string;
  shadow: string;
  orb: string;
};

const colorSchemes: ColorScheme[] = [
  // Green
  {
    bg: '#0a0a0a',
    text: '#ffffff',
    border: 'rgba(106, 228, 153, 0.3)',
    shadow: '0 0 15px rgba(106, 228, 153, 0.2)',
    orb: '#6ae499'
  },
  // Yellow
  {
    bg: '#0a0a0a',
    text: '#ffffff',
    border: 'rgba(255, 215, 0, 0.3)',
    shadow: '0 0 15px rgba(255, 215, 0, 0.2)',
    orb: '#ffd700'
  },
  // Blue
  {
    bg: '#0a0a0a',
    text: '#ffffff',
    border: 'rgba(59, 130, 246, 0.3)',
    shadow: '0 0 15px rgba(59, 130, 246, 0.2)',
    orb: '#3b82f6'
  },
  // Red
  {
    bg: '#0a0a0a',
    text: '#ffffff',
    border: 'rgba(239, 68, 68, 0.3)',
    shadow: '0 0 15px rgba(239, 68, 68, 0.2)',
    orb: '#ef4444'
  },
  // Gray
  {
    bg: '#0a0a0a',
    text: '#ffffff',
    border: 'rgba(156, 163, 175, 0.3)',
    shadow: '0 0 15px rgba(156, 163, 175, 0.2)',
    orb: '#9ca3af'
  },
  // Orange
  {
    bg: '#0a0a0a',
    text: '#ffffff',
    border: 'rgba(249, 115, 22, 0.3)',
    shadow: '0 0 15px rgba(249, 115, 22, 0.2)',
    orb: '#f97316'
  }
];

type AnimatedLabelProps = {
  children: React.ReactNode;
  angle: number;
  colorIndex: number;
  isActive: boolean;
};

function AnimatedLabel({ children, angle, colorIndex, isActive }: AnimatedLabelProps) {
  const radius = 175; // Distance from center
  const centerX = 285; // Center of 570
  const centerY = 294.5; // Center of 589

  const x = centerX + radius * Math.cos((angle * Math.PI) / 180);
  const y = centerY + radius * Math.sin((angle * Math.PI) / 180);

  const colorScheme = colorSchemes[colorIndex % colorSchemes.length];

  return (
    <div
      className="absolute flex items-center justify-center transition-all duration-1000 ease-in-out"
      style={{
        transform: `translate3d(calc(${x}px - 50%), calc(${y}px - 50%), 0)`,
        left: 0,
        top: 0,
        zIndex: isActive ? 30 : 20,
      }}
    >
      <div
        className="backdrop-blur-xl px-8 py-3.5 rounded-xl border border-solid transition-all duration-700 ease-out overflow-hidden"
        style={{
          backgroundColor: 'rgba(10, 10, 10, 0.96)',
          borderColor: isActive ? colorScheme.border : 'rgba(255, 255, 255, 0.1)',
          boxShadow: isActive
            ? `0 10px 30px -10px rgba(0,0,0,0.5), inset 0px -6px 10px -4px ${colorScheme.orb}, inset 0 0 8px ${colorScheme.orb}15`
            : 'none'
        }}
      >
        <p className="font-['Sora',sans-serif] font-medium text-[16px] text-center whitespace-nowrap tracking-wide text-white">
          {children}
        </p>
      </div>
    </div>
  );
}

export function AnimatedProcessCard({ sectionVisible = false }: { sectionVisible?: boolean }) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!sectionVisible) return;
    const interval = setInterval(() => {
      // Indefinite increment to avoid coordinate jumps in CSS transitions at 360->0
      setRotation(prev => prev + 60);
    }, 2000);
    return () => clearInterval(interval);
  }, [sectionVisible]);

  const labels = [
    { name: 'Discovery', baseAngle: 270 },
    { name: 'Research', baseAngle: 210 },
    { name: 'Ideation', baseAngle: 150 },
    { name: 'Prioritization', baseAngle: 90 },
    { name: 'Experimentation', baseAngle: 30 },
    { name: 'Results', baseAngle: 330 }
  ];

  // Color Logic:
  // Find which label is at the top (270°) position.
  const topLabelIndex = labels.findIndex(l => {
    const currentPos = (l.baseAngle + rotation) % 360;
    return Math.abs(currentPos - 270) < 1;
  });

  const activeIndex = topLabelIndex !== -1 ? topLabelIndex : 0;

  return (
    <div
      className="h-[589px] overflow-hidden relative rounded-[43px] w-[570px] bg-[#020601]"
      data-name="Card"
    >
      {/* Dynamic Background/Theme Layers for smooth cross-fade */}
      {colorSchemes.map((scheme, idx) => {
        const isActive = activeIndex === idx;
        return (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none"
            style={{ opacity: isActive ? 1 : 0 }}
          >
            {/* Central Orb - Multi-layered glow */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full h-full flex items-center justify-center">
              {/* Large Outer Glow */}
              <div
                className="absolute size-[400px] rounded-full blur-[80px] opacity-20"
                style={{ background: `radial-gradient(circle, ${scheme.orb} 0%, transparent 70%)` }}
              />
              {/* Core Glow */}
              <div
                className="absolute size-40 rounded-full blur-3xl opacity-40"
                style={{ background: scheme.orb }}
              />
              {/* Central Orb Solid Core */}
              <div className="relative size-32 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, ${scheme.orb} 0%, ${scheme.orb}66 40%, #000 90%)`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              </div>
            </div>

            {/* Intensified Edge Glow */}
            <div
              className="absolute inset-0 rounded-[inherit] opacity-30"
              style={{ boxShadow: `inset 0px -120px 200px -60px ${scheme.orb}` }}
            />

            {/* Intense Bottom Flare */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px] pointer-events-none flex items-end justify-center">
              <div
                className="w-[120%] h-[150px] blur-[100px] opacity-40 translate-y-20"
                style={{ background: `radial-gradient(ellipse at center, ${scheme.orb} 0%, transparent 75%)` }}
              />
            </div>
            {/* Dynamic Fading Border Overlay - Moved inside for color matching */}
            <div
              className="absolute inset-0 pointer-events-none rounded-[inherit] blur-[4px]"
              style={{
                padding: "1.5px",
                background: `linear-gradient(to bottom, transparent 0%, transparent 40%, ${scheme.orb}1a 60%, ${scheme.orb}4d 100%)`,
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                zIndex: 40,
              }}
            />
          </div>
        );
      })}

      {/* Circle outline */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[350px] rounded-full border border-white/5 pointer-events-none" />

      {/* Animated labels */}
      {labels.map((label, index) => {
        const currentAngle = (label.baseAngle + rotation); // Use full rotation for smooth transitions
        const normalizedAngle = currentAngle % 360;
        const isCurrentlyActive = Math.abs(normalizedAngle - 270) < 1;

        // Each label keeps its original color
        const labelColorIndex = index % 6;

        return (
          <AnimatedLabel
            key={label.name}
            angle={currentAngle}
            colorIndex={labelColorIndex}
            isActive={isCurrentlyActive}
          >
            {label.name}
          </AnimatedLabel>
        );
      })}
    </div>
  );
}