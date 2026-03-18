import { useRef, useState, useEffect } from "react";
import clsx from "clsx";
import imgOurProvenConversionOptimizationProcess from "../assets/f107a7f40e4d7ea19ffc42c38dbf8e17414a5f3b.webp";
import { AnimatedProcessCard } from "./AnimatedProcessCard";
import { AnimatedBeforeCard } from "./AnimatedBeforeCard";

type ProcessBackgroundImageProps = {
    additionalClassNames?: string;
    noRotation?: boolean;
};

function ProcessBackgroundImage({ children, additionalClassNames = "", noRotation = false }: React.PropsWithChildren<ProcessBackgroundImageProps>) {
    return (
        <div style={{ "--transform-inner-width": "2", "--transform-inner-height": "2" } as React.CSSProperties} className={clsx("flex h-[589px] items-center justify-center relative w-[570px]", additionalClassNames)}>
            <div className={clsx("flex-none", !noRotation && "rotate-[90deg] scale-y-[-100%]")}>{children}</div>
        </div>
    );
}

// Before card labels with chaos styling
const beforeItems = [
    { label: "One-size-fits-all", top: '6%', left: '3%', rotate: '-18deg', opacity: 0.6, strike: false, glow: false },
    { label: "Generic Best Practices", top: '15%', left: '42%', rotate: '11deg', opacity: 0.9, strike: true, glow: false },
    { label: "Skipping user feedback", top: '3%', left: '58%', rotate: '-7deg', opacity: 0.5, strike: false, glow: true },
    { label: "No plan, just tasks", top: '26%', left: '10%', rotate: '22deg', opacity: 1, strike: false, glow: true },
    { label: "Pure Guesswork", top: '35%', left: '50%', rotate: '-16deg', opacity: 0.7, strike: true, glow: false },
    { label: "No learning loop", top: '45%', left: '4%', rotate: '8deg', opacity: 0.55, strike: false, glow: false },
    { label: "No clear funnel map", top: '50%', left: '44%', rotate: '-12deg', opacity: 0.85, strike: false, glow: true },
    { label: "Copying Competitors", top: '60%', left: '16%', rotate: '19deg', opacity: 0.65, strike: true, glow: false },
    { label: "No Testing", top: '68%', left: '56%', rotate: '-9deg', opacity: 1, strike: false, glow: false },
    { label: "No Tracking Data", top: '76%', left: '2%', rotate: '5deg', opacity: 0.5, strike: false, glow: true },
    { label: "No Research", top: '83%', left: '38%', rotate: '-22deg', opacity: 0.75, strike: false, glow: false },
];

// After card steps (organized process)
const afterSteps = [
    { name: "Discovery", color: "#6ae499", num: "01" },
    { name: "Research", color: "#ffd700", num: "02" },
    { name: "Ideation", color: "#3b82f6", num: "03" },
    { name: "Prioritization", color: "#ef4444", num: "04" },
    { name: "Experimentation", color: "#9ca3af", num: "05" },
    { name: "Results", color: "#f97316", num: "06" },
];

export default function ProcessWithAnimation() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [sectionVisible, setSectionVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 1024);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setSectionVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0, rootMargin: isMobile ? '200px 0px 200px 0px' : '-80% 0px 0px 0px' }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        let timer: ReturnType<typeof setTimeout> | undefined;
        if (isMobile) {
            timer = setTimeout(() => setSectionVisible(true), 1000);
        }

        return () => {
            observer.disconnect();
            if (timer) clearTimeout(timer);
        };
    }, [isMobile]);

    // Calculate After step positions for SVG path
    const radius = 95;
    const afterPositions = afterSteps.map((_, i) => {
        const angle = (i * 60) - 90;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;
        return { x, y };
    });

    // SVG path connecting all steps (hexagon)
    const svgPath = afterPositions.map((pos, i) => {
        const cmd = i === 0 ? 'M' : 'L';
        return `${cmd} ${140 + pos.x} ${140 + pos.y}`;
    }).join(' ') + ' Z';

    return (
        <div ref={sectionRef} className="bg-[#020601] relative w-full min-h-0 lg:min-h-screen py-10 lg:py-20 shrink-0 overflow-hidden flex flex-col items-center gap-6 lg:gap-10" data-name="Process">

            {/* Title Section */}
            <div className="flex flex-col gap-[24px] lg:gap-[32px] items-center text-center z-10 px-4 max-w-full">
                <p className="bg-center bg-clip-text bg-cover bg-no-repeat font-['Sora:SemiBold',sans-serif] font-semibold leading-[1.2] relative shrink-0 text-[32px] lg:text-[72px] text-center tracking-[-2px] lg:tracking-[-2.88px] w-full max-w-[935px]" style={{ WebkitTextFillColor: "transparent", backgroundImage: `url('${imgOurProvenConversionOptimizationProcess}')` }}>
                    Our Proven Conversion Optimization Process
                </p>
                <p className="font-['Sora:Regular',sans-serif] font-normal leading-[22px] lg:leading-[28px] relative shrink-0 text-[14px] lg:text-[20px] text-[rgba(255,255,255,0.8)] text-center w-full max-w-[797px]">We follow a systematic 6-step approach that has generated millions in additional revenue for e-commerce brands across the GCC.</p>
                {/* CTA button — hidden on mobile to reduce CTA spam */}
                <div className="hidden lg:block">
                    <div className="bg-[#020601] h-[50px] relative rounded-[100px] shrink-0 cursor-pointer hover:scale-105 transition-transform" data-name="Link" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                        <div className="content-stretch flex h-full items-center justify-center overflow-clip px-[28px] py-[12px] relative rounded-[inherit]">
                            <div className="content-stretch flex items-start justify-center pl-0 pr-[0.5px] py-0 relative shrink-0" data-name="div.btn-label">
                                <div className="flex flex-col font-['Sora:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[18px] text-center text-nowrap text-white">
                                    <p className="leading-[21.6px]">Book a Free CRO Audit</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0px_30px_0px_rgba(106,228,153,0.6)]" />
                        <div aria-hidden="true" className="absolute border border-[#6ae499] border-solid inset-0 pointer-events-none rounded-[100px]" />
                    </div>
                </div>
            </div>

            {/* Cards Section */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-0 lg:gap-20 w-full px-2 lg:px-4 relative mt-0 lg:mt-10">
                {/* Before Card */}
                <div className="flex flex-col items-center relative w-full lg:w-auto">
                    <p className="font-['Sora:SemiBold',sans-serif] font-semibold text-[24px] lg:text-[88px] text-[rgba(255,255,255,0.2)] text-center tracking-[3.5px] -mb-[12px] lg:-mb-[50px] relative z-0">Before</p>
                    <div className="relative z-10 w-full lg:w-auto flex justify-center">
                        {isMobile ? (
                            /* Mobile Before Card — chaotic scattered labels */
                            <div className="w-[85vw] max-w-[340px] h-[280px] rounded-[24px] bg-[#0a0a0a] border border-red-900/30 relative overflow-hidden">
                                {/* Chaotic diagonal warning stripes */}
                                <div className="absolute inset-0 opacity-[0.03]" style={{
                                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, #ff3333 20px, #ff3333 22px)',
                                }} />

                                {beforeItems.map((item, i) => (
                                    <div
                                        key={i}
                                        className="absolute px-2.5 py-1 rounded-lg border transition-all duration-700"
                                        style={{
                                            top: item.top,
                                            left: item.left,
                                            transform: `rotate(${item.rotate})`,
                                            opacity: sectionVisible ? item.opacity : 0,
                                            transitionDelay: `${i * 60}ms`,
                                            background: item.glow ? 'rgba(60,20,20,0.8)' : 'rgba(37,41,37,0.8)',
                                            borderColor: item.glow ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.12)',
                                            boxShadow: item.glow ? '0 0 8px rgba(239,68,68,0.15)' : 'none',
                                        }}
                                    >
                                        <p className={`font-['Sora',sans-serif] text-[9px] whitespace-nowrap ${item.strike ? 'line-through text-white/40' : 'text-white/80'}`}>{item.label}</p>
                                    </div>
                                ))}

                                {/* Red corner warning glow */}
                                <div className="absolute top-0 right-0 w-[80px] h-[80px] bg-radial-[at_100%_0%] from-red-600/10 to-transparent rounded-tr-[24px]" />
                                <div className="absolute bottom-0 left-0 w-[120px] h-[80px] bg-gradient-to-tr from-red-600/8 to-transparent rounded-bl-[24px]" />

                                {/* Faint "X" overlay */}
                                <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 340 280" fill="none">
                                    <line x1="20" y1="20" x2="320" y2="260" stroke="#ff3333" strokeWidth="2" />
                                    <line x1="320" y1="20" x2="20" y2="260" stroke="#ff3333" strokeWidth="2" />
                                </svg>
                            </div>
                        ) : (
                            <ProcessBackgroundImage additionalClassNames="" noRotation={true}>
                                <AnimatedBeforeCard sectionVisible={sectionVisible} />
                            </ProcessBackgroundImage>
                        )}
                    </div>
                </div>

                {/* After Card */}
                <div className="flex flex-col items-center relative w-full lg:w-auto mt-6 lg:mt-0">
                    <p className="font-['Sora:SemiBold',sans-serif] font-semibold text-[24px] lg:text-[88px] text-[rgba(255,255,255,0.2)] text-center tracking-[3.5px] -mb-[12px] lg:-mb-[50px] relative z-0">After</p>
                    <div className="relative z-10 w-full lg:w-auto flex justify-center">
                        {isMobile ? (
                            /* Mobile After Card — organized process steps with connecting path */
                            <div className="w-[85vw] max-w-[340px] h-[280px] rounded-[24px] bg-[#0a0a0a] border border-[#6ae499]/20 relative overflow-hidden flex items-center justify-center">
                                {/* SVG connecting path with neon traveling light */}
                                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 280 280" fill="none" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '280px', height: '280px', position: 'absolute' }}>
                                    <defs>
                                        <filter id="neonGlow">
                                            <feGaussianBlur stdDeviation="4" result="blur" />
                                            <feMerge>
                                                <feMergeNode in="blur" />
                                                <feMergeNode in="blur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                        <filter id="dotGlow">
                                            <feGaussianBlur stdDeviation="6" result="blur" />
                                            <feMerge>
                                                <feMergeNode in="blur" />
                                                <feMergeNode in="blur" />
                                                <feMergeNode in="blur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                        {/* Gradient for the traveling trail */}
                                        <linearGradient id="trailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#6ae499" stopOpacity="0" />
                                            <stop offset="80%" stopColor="#6ae499" stopOpacity="0.6" />
                                            <stop offset="100%" stopColor="#6ae499" stopOpacity="1" />
                                        </linearGradient>
                                    </defs>

                                    {/* Base path — subtle neon line */}
                                    <path
                                        d={svgPath}
                                        stroke="#6ae499"
                                        strokeWidth="1.5"
                                        strokeOpacity={sectionVisible ? 0.35 : 0}
                                        fill="none"
                                        strokeDasharray="600"
                                        strokeDashoffset={sectionVisible ? 0 : 600}
                                        style={{ transition: 'stroke-dashoffset 2s ease-in-out 0.3s, stroke-opacity 0.5s ease' }}
                                    />
                                    {/* Neon glow layer */}
                                    <path
                                        d={svgPath}
                                        stroke="#6ae499"
                                        strokeWidth="3"
                                        strokeOpacity={sectionVisible ? 0.15 : 0}
                                        fill="none"
                                        filter="url(#neonGlow)"
                                        strokeDasharray="600"
                                        strokeDashoffset={sectionVisible ? 0 : 600}
                                        style={{ transition: 'stroke-dashoffset 2s ease-in-out 0.3s, stroke-opacity 0.5s ease' }}
                                    />

                                    {/* Traveling neon trail — short bright segment that orbits */}
                                    {sectionVisible && (
                                        <>
                                            <path
                                                d={svgPath}
                                                stroke="#6ae499"
                                                strokeWidth="2.5"
                                                strokeOpacity="0.9"
                                                fill="none"
                                                filter="url(#neonGlow)"
                                                strokeDasharray="60 540"
                                                strokeLinecap="round"
                                            >
                                                <animate
                                                    attributeName="stroke-dashoffset"
                                                    values="600;0"
                                                    dur="4s"
                                                    repeatCount="indefinite"
                                                    calcMode="linear"
                                                />
                                            </path>

                                            {/* Bright traveling dot */}
                                            <circle r="3" fill="#6ae499" filter="url(#dotGlow)">
                                                <animateMotion
                                                    path={svgPath}
                                                    dur="4s"
                                                    repeatCount="indefinite"
                                                    calcMode="linear"
                                                />
                                            </circle>
                                        </>
                                    )}

                                    {/* Small directional arrows at midpoints of each edge */}
                                    {sectionVisible && afterPositions.map((pos, i) => {
                                        const next = afterPositions[(i + 1) % afterPositions.length];
                                        const midX = 140 + (pos.x + next.x) / 2;
                                        const midY = 140 + (pos.y + next.y) / 2;
                                        const angle = Math.atan2(next.y - pos.y, next.x - pos.x) * (180 / Math.PI);
                                        return (
                                            <g key={i} transform={`translate(${midX}, ${midY}) rotate(${angle})`} opacity="0.4">
                                                <path d="M-3,-3 L3,0 L-3,3" fill="#6ae499" />
                                            </g>
                                        );
                                    })}
                                </svg>

                                {/* Central orb glow */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <div className="w-20 h-20 rounded-full bg-[#6ae499] opacity-15 blur-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6ae499] to-[#3b82f6] shadow-[0_0_16px_rgba(106,228,153,0.4)] relative z-10" />
                                </div>

                                {/* Process step labels arranged in circle */}
                                {afterSteps.map((step, i) => {
                                    const pos = afterPositions[i];
                                    return (
                                        <div
                                            key={step.name}
                                            className="absolute px-2.5 py-1 rounded-xl bg-[rgba(10,10,10,0.96)] border border-solid transition-all duration-700"
                                            style={{
                                                left: `calc(50% + ${pos.x}px)`,
                                                top: `calc(50% + ${pos.y}px)`,
                                                transform: 'translate(-50%, -50%)',
                                                borderColor: sectionVisible ? `${step.color}50` : 'rgba(255,255,255,0.1)',
                                                boxShadow: sectionVisible ? `inset 0 0 6px ${step.color}20, 0 0 10px ${step.color}10` : 'none',
                                                opacity: sectionVisible ? 1 : 0,
                                                transitionDelay: `${i * 120}ms`,
                                            }}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-['Sora',sans-serif] font-bold text-[8px] opacity-40" style={{ color: step.color }}>{step.num}</span>
                                                <p className="font-['Sora',sans-serif] font-medium text-[11px] text-white whitespace-nowrap">{step.name}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {/* Green glow from bottom */}
                                <div className="absolute bottom-0 left-0 w-full h-[80px] bg-gradient-to-t from-[#6ae499]/8 to-transparent rounded-b-[24px]" />
                            </div>
                        ) : (
                            <ProcessBackgroundImage additionalClassNames="" noRotation={true}>
                                <AnimatedProcessCard sectionVisible={sectionVisible} />
                            </ProcessBackgroundImage>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
