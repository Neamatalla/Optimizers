import { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { useLanguage } from '../app/contexts/LanguageContext';

const labels = [
  "One-size-fits-all",
  "Generic Best Practices",
  "Skipping user feedback",
  "No plan, just tasks",
  "Pure Guesswork",
  "No learning loop",
  "No clear funnel map",
  "Copying Competitors",
  "No Testing",
  "No Tracking Data",
  "No Research"
];

export function AnimatedBeforeCard({ sectionVisible = false }: { sectionVisible?: boolean }) {
  const { language, t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const worldRef = useRef<Matter.World | null>(null);
  const renderRef = useRef<number | null>(null);
  const bodiesRef = useRef<{ body: Matter.Body; label: string; width: number; height: number }[]>([]);

  useEffect(() => {
    if (!sectionVisible || !canvasRef.current || !containerRef.current) return;

    const width = 570;
    const height = 589;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Matter.js setup
    const Engine = Matter.Engine;
    const World = Matter.World;
    const Bodies = Matter.Bodies;
    const Mouse = Matter.Mouse;
    const MouseConstraint = Matter.MouseConstraint;

    const engine = Engine.create();
    const world = engine.world;
    engineRef.current = engine;
    worldRef.current = world;

    // Boundaries
    const thickness = 500;
    const ground = Bodies.rectangle(width / 2, height + thickness / 2, width, thickness, { isStatic: true });
    const wallLeft = Bodies.rectangle(-thickness / 2, height / 2, thickness, height * 10, { isStatic: true });
    const wallRight = Bodies.rectangle(width + thickness / 2, height / 2, thickness, height * 10, { isStatic: true });
    const ceiling = Bodies.rectangle(width / 2, -2000, width, thickness, { isStatic: true });

    World.add(world, [ground, wallLeft, wallRight, ceiling]);

    // Create labels/bodies — translate if Arabic
    const translatedLabels = labels.map(l => language === 'ar' ? (t(l) || l) : l);
    const newBodies = translatedLabels.map((label) => {
      const charWidth = language === 'ar' ? 12 : 10;
      const labelWidth = label.length * charWidth + 40;
      const labelHeight = 50;
      const x = Math.random() * (width - 200) + 100;
      const y = Math.random() * -1500 - 100;

      const body = Bodies.rectangle(x, y, labelWidth, labelHeight, {
        restitution: 0.6,
        friction: 0.1,
        density: 0.003,
        chamfer: { radius: 20 }
      });

      return { body, label, width: labelWidth, height: labelHeight };
    });

    bodiesRef.current = newBodies;
    World.add(world, newBodies.map(b => b.body));

    // Mouse constraint for dragging
    const mouse = Mouse.create(canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false
        }
      }
    });

    World.add(world, mouseConstraint);

    // Remove Matter.js wheel listener so page scrolling isn't blocked
    mouse.element.removeEventListener('wheel', (mouse as any).mousewheel);

    // Animation Loop
    const run = () => {
      Engine.update(engine);
      ctx.clearRect(0, 0, width, height);

      newBodies.forEach(({ body, label, width: bWidth, height: bHeight }) => {
        const { x, y } = body.position;
        const angle = body.angle;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Draw rounded rectangle
        const radius = 20;
        ctx.fillStyle = '#252925';
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        const w = bWidth;
        const h = bHeight;
        ctx.moveTo(-w / 2 + radius, -h / 2);
        ctx.lineTo(w / 2 - radius, -h / 2);
        ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + radius);
        ctx.lineTo(w / 2, h / 2 - radius);
        ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - radius, h / 2);
        ctx.lineTo(-w / 2 + radius, h / 2);
        ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - radius);
        ctx.lineTo(-w / 2, -h / 2 + radius);
        ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + radius, -h / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw text
        ctx.fillStyle = 'white';
        ctx.font = language === 'ar' ? "bold 15px 'KO Sans', 'Sora', sans-serif" : "16px 'Sora', sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.direction = language === 'ar' ? 'rtl' : 'ltr';
        ctx.fillText(label, 0, 0);

        ctx.restore();
      });

      renderRef.current = requestAnimationFrame(run);
    };

    run();

    return () => {
      if (renderRef.current) cancelAnimationFrame(renderRef.current);
      if (engineRef.current) Matter.Engine.clear(engineRef.current);
      if (worldRef.current) Matter.World.clear(worldRef.current, false);
    };
  }, [sectionVisible, language]);

  return (
    <div
      ref={containerRef}
      className="bg-[#020601] h-[589px] overflow-hidden relative rounded-[43px] w-[570px]"
      data-name="Card"
    >
      <canvas
        ref={canvasRef}
        width={570}
        height={589}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
      />
      <div
        className="absolute inset-0 pointer-events-none rounded-[43px] blur-[4px]"
        style={{
          padding: "1.5px",
          background: "linear-gradient(to bottom, transparent 0%, transparent 40%, rgba(255,255,255,0.1) 60%, rgba(255,255,255,0.3) 100%)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-35px_50px_0px_rgba(74,222,128,0.1)]" />
    </div>
  );
}