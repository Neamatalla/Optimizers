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

    // Corner blockers — invisible circles placed at the arc centres of the 43px border-radius.
    // They physically push word cards away from the corner zones that would otherwise be
    // clipped by overflow-hidden + border-radius, ensuring every card is always fully visible.
    const CR = 43; // must match rounded-[43px] on the container
    const cornerOpts = { isStatic: true, collisionFilter: { category: 0x0002 } };
    const cornerTL = Bodies.circle(CR, CR, CR, cornerOpts);
    const cornerTR = Bodies.circle(width - CR, CR, CR, cornerOpts);
    const cornerBL = Bodies.circle(CR, height - CR, CR, cornerOpts);
    const cornerBR = Bodies.circle(width - CR, height - CR, CR, cornerOpts);

    World.add(world, [ground, wallLeft, wallRight, ceiling, cornerTL, cornerTR, cornerBL, cornerBR]);

    // Helper for text wrapping
    const getWrappedLines = (text: string, maxWidth: number, font: string) => {
      ctx.font = font;
      const words = text.split(' ');
      const lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
          currentLine += " " + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      return lines;
    };

    // Create labels/bodies — translate if Arabic
    const translatedLabels = labels.map(l => language === 'ar' ? (t(l) || l) : l);
    const CARD_WIDTH = 180;
    const FONT_SIZE = 16;
    const font = language === 'ar' 
      ? `bold ${FONT_SIZE}px 'KO Sans', 'Sora', sans-serif` 
      : `${FONT_SIZE}px 'Sora', sans-serif`;
    
    const newBodies = translatedLabels.map((label) => {
      const lines = getWrappedLines(label, CARD_WIDTH - 20, font);
      const labelWidth = CARD_WIDTH;
      const lineHeight = FONT_SIZE + 6;
      const labelHeight = lines.length * lineHeight + 20;
      const x = Math.random() * (width - 200) + 100;
      const y = Math.random() * -1500 - 100;

      const body = Bodies.rectangle(x, y, labelWidth, labelHeight, {
        restitution: 0.6,
        friction: 0.1,
        density: 0.003,
        chamfer: { radius: 0 }
      });

      return { body, label, width: labelWidth, height: labelHeight, lines };
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

    // Ensure Matter.js mouse tracks CSS scale correctly
    Matter.Events.on(engine, 'beforeUpdate', () => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      Matter.Mouse.setScale(mouse, { x: scaleX, y: scaleY });
    });

    // Custom touch listener to allow scrolling when not grabbing a dynamic word body
    // We use capture phase and stopImmediatePropagation to PREVENT Matter.js from
    // seeing touches on empty space and aggressively calling preventDefault().
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      // Matter.js needs exact mapping scale due to CSS transforming
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;

      const bodies = Matter.Composite.allBodies(engine.world);
      // Only check collisions against non-static bodies (the words)
      const dynamicBodies = bodies.filter(b => !b.isStatic);
      const hit = Matter.Query.point(dynamicBodies, { x, y }).length > 0;

      if (hit) {
        isDragging = true;
        // Proceed with dragging, we'll let Matter.js see it but we can prevent default manually to lock scroll
        if (e.cancelable) e.preventDefault();
      } else {
        isDragging = false;
        // Don't let Matter.js see this touch so it doesn't block scrolling!
        e.stopImmediatePropagation();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        if (e.cancelable) e.preventDefault();
      } else {
        e.stopImmediatePropagation();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDragging) {
        e.stopImmediatePropagation();
      }
      isDragging = false;
    };

    // Attach in capture phase before Matter.js!
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false, capture: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false, capture: true });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false, capture: true });

    // Animation Loop
    const run = () => {
      Engine.update(engine);
      ctx.clearRect(0, 0, width, height);

      newBodies.forEach(({ body, label, width: bWidth, height: bHeight, lines }) => {
        const { x, y } = body.position;
        const angle = body.angle;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Draw rectangle with pointy corners
        ctx.fillStyle = '#252925';
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1.5;

        const w = bWidth;
        const h = bHeight;
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, 10);
        ctx.fill();
        ctx.stroke();

        // Draw text
        ctx.fillStyle = 'white';
        ctx.font = font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.direction = language === 'ar' ? 'rtl' : 'ltr';
        
        const lineHeight = FONT_SIZE + 4;
        const totalTextHeight = lines.length * lineHeight;
        const startY = -(totalTextHeight / 2) + (lineHeight / 2);

        lines.forEach((line, i) => {
          ctx.fillText(line, 0, startY + i * lineHeight);
        });

        ctx.restore();
      });

      renderRef.current = requestAnimationFrame(run);
    };

    run();

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart, { capture: true });
      canvas.removeEventListener('touchmove', handleTouchMove, { capture: true });
      canvas.removeEventListener('touchend', handleTouchEnd, { capture: true });
      canvas.removeEventListener('touchcancel', handleTouchEnd, { capture: true });
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
      {/* Grey light/flare that "dulls out" the bottom - Increased intensity */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px] pointer-events-none flex items-end justify-center overflow-hidden rounded-b-[43px]">
        <div
          className="w-[120%] h-[150px] blur-[100px] opacity-40 translate-y-20"
          style={{ background: 'radial-gradient(ellipse at center, #bbbbbb 0%, transparent 75%)' }}
        />
      </div>

      <div
        className="absolute inset-0 pointer-events-none rounded-[43px] blur-[4px]"
        style={{
          padding: "1.5px",
          background: "linear-gradient(to bottom, transparent 0%, transparent 40%, rgba(128,128,128,0.2) 60%, rgba(128,128,128,0.4) 100%)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <div 
        className="absolute inset-0 pointer-events-none rounded-[inherit]" 
        style={{ boxShadow: "inset 0px -120px 200px -60px rgba(128,128,128,0.3)" }}
      />
    </div>
  );
}