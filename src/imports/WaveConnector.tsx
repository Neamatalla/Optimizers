import React, { useEffect, useRef } from 'react';

interface WaveConnectorProps {
    width?: number;
    height?: number;
    className?: string;
}

const WaveConnector: React.FC<WaveConnectorProps> = ({ width, height = 40, className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const timeRef = useRef<number>(0);
    const animationFrameRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const updateDimensions = () => {
            // Fallback to prop width if provided, otherwise use container width
            const currentWidth = width || container.offsetWidth;
            const currentHeight = height || container.offsetHeight;

            const dpr = window.devicePixelRatio || 1;
            canvas.width = currentWidth * dpr;
            canvas.height = currentHeight * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = `${currentWidth}px`;
            canvas.style.height = `${currentHeight}px`;

            return { currentWidth, currentHeight };
        };

        let dimensions = updateDimensions();

        // Handle Resize
        const resizeObserver = new ResizeObserver(() => {
            dimensions = updateDimensions();
        });
        resizeObserver.observe(container);

        const render = () => {
            timeRef.current += 0.05;
            const { currentWidth, currentHeight } = dimensions;

            ctx.clearRect(0, 0, currentWidth, currentHeight);

            // Create gradients
            const gradient1 = ctx.createLinearGradient(0, 0, currentWidth, 0);
            gradient1.addColorStop(0, '#FF6B57');
            gradient1.addColorStop(0.33, '#FCD34D');
            gradient1.addColorStop(0.66, '#31DA72');
            gradient1.addColorStop(1, '#624DE3');

            const gradient2 = ctx.createLinearGradient(0, 0, currentWidth, 0);
            gradient2.addColorStop(0, '#FCD34D');
            gradient2.addColorStop(0.5, '#31DA72');
            gradient2.addColorStop(1, '#FF6B57');

            // Draw multiple interlaced sine waves
            const drawWave = (offset: number, amplitude: number, frequency: number, strokeStyle: string | CanvasGradient, lineWidth: number) => {
                ctx.beginPath();
                ctx.lineWidth = lineWidth;
                ctx.strokeStyle = strokeStyle;
                ctx.lineCap = 'round';

                const k = (2 * Math.PI) / (currentWidth / 1.5); // Ensure ~1.5 waves per width for aesthetics

                for (let x = 0; x <= currentWidth; x++) {
                    const y = currentHeight / 2 + amplitude * Math.sin(x * k + timeRef.current + offset);
                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            };

            // Wave 1
            drawWave(0, 8, 0, gradient1, 1.5); // Frequency handled in drawWave now

            // Wave 2 (Phase shifted)
            drawWave(Math.PI, 8, 0, gradient2, 1.5);

            // Wave 3 (Slightly different frequency for organic variation)
            drawWave(Math.PI / 2, 6, 0, 'rgba(255,255,255,0.3)', 0.5);

            animationFrameRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            resizeObserver.disconnect();
        };
    }, [width, height]);

    return (
        <div ref={containerRef} className={`${className} relative overflow-hidden flex items-center justify-center`}>
            <canvas ref={canvasRef} />
        </div>
    );
};

export default WaveConnector;
