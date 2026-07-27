interface PhoneMockupFrameProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export default function PhoneMockupFrame({ src, alt, width, height }: PhoneMockupFrameProps) {
  const bezel = Math.round(width * 0.045);
  const screenRadius = Math.round(width * 0.13);
  const outerRadius = screenRadius + bezel;
  const notchWidth = Math.round(width * 0.34);
  const notchHeight = Math.round(width * 0.06);

  return (
    <div
      className="relative shrink-0"
      style={{
        width,
        height,
        padding: bezel,
        borderRadius: outerRadius,
        background: '#050505',
        border: '1.5px solid rgba(255,255,255,0.3)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.15)',
      }}
    >
      {/* Side buttons */}
      <div style={{ position: 'absolute', left: -1, top: height * 0.16, width: 2, height: height * 0.045, background: '#1c1c1e', borderRadius: 2 }} />
      <div style={{ position: 'absolute', left: -1, top: height * 0.24, width: 2, height: height * 0.075, background: '#1c1c1e', borderRadius: 2 }} />
      <div style={{ position: 'absolute', right: -1, top: height * 0.2, width: 2, height: height * 0.09, background: '#1c1c1e', borderRadius: 2 }} />

      <div
        className="relative size-full overflow-hidden bg-black"
        style={{ borderRadius: screenRadius }}
      >
        <img alt={alt} src={src} className="absolute inset-0 size-full object-cover object-top" decoding="async" />
        <div
          style={{
            position: 'absolute',
            top: bezel * 0.6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: notchWidth,
            height: notchHeight,
            background: '#000',
            borderRadius: notchHeight,
          }}
        />
      </div>
    </div>
  );
}
