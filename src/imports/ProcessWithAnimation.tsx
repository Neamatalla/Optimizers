import { useRef, useState, useEffect } from "react";
import clsx from "clsx";
import imgOurProvenConversionOptimizationProcess from "../assets/f107a7f40e4d7ea19ffc42c38dbf8e17414a5f3b.webp";
import { AnimatedProcessCard } from "./AnimatedProcessCard";
import { AnimatedBeforeCard } from "./AnimatedBeforeCard";
import { useLanguage } from "../app/contexts/LanguageContext";

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

/* ──────────── Mobile-specific cards ──────────── */

const beforeLabels = [
    "One-size-fits-all", "Generic Best Practices", "Skipping user feedback",
    "No plan, just tasks", "Pure Guesswork", "No learning loop",
    "No clear funnel map", "Copying Competitors", "No Testing",
    "No Tracking Data", "No Research"
];

const afterLabels = [
    { name: "Discovery", color: "#4ade80", icon: "🔍", step: 1 },
    { name: "Research", color: "#60a5fa", icon: "📊", step: 2 },
    { name: "Ideation", color: "#f472b6", icon: "💡", step: 3 },
    { name: "Prioritization", color: "#facc15", icon: "🎯", step: 4 },
    { name: "Experimentation", color: "#c084fc", icon: "🧪", step: 5 },
    { name: "Results", color: "#fb923c", icon: "📈", step: 6 },
];

/* ---------- BEFORE: Chaotic, messy, overwhelming ---------- */
function MobileBeforeCard() {
    const { language, t } = useLanguage();

    // Deterministic "random" positions for chaotic scatter
    const chaosPositions = [
        { x: 5, y: 8, rot: -7, z: 3 },
        { x: 48, y: 2, rot: 12, z: 1 },
        { x: 15, y: 35, rot: -4, z: 5 },
        { x: 55, y: 28, rot: 8, z: 2 },
        { x: 2, y: 58, rot: -11, z: 4 },
        { x: 42, y: 52, rot: 6, z: 6 },
        { x: 65, y: 48, rot: -9, z: 1 },
        { x: 8, y: 78, rot: 14, z: 3 },
        { x: 50, y: 72, rot: -5, z: 7 },
        { x: 30, y: 85, rot: 10, z: 2 },
        { x: 68, y: 80, rot: -8, z: 5 },
    ];

    return (
        <div className="relative w-full rounded-[24px] bg-[#0a0806] border border-red-900/30 overflow-hidden" style={{ minHeight: '360px' }}>
            {/* Noisy background grain texture */}
            <div className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundSize: '128px 128px',
                }}
            />

            {/* Danger red pulse glow behind everything */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[100px] opacity-[0.12] bg-red-600 pointer-events-none animate-pulse" />

            {/* Warning/danger diagonal stripes at top */}
            <div className="absolute top-0 left-0 right-0 h-[3px] opacity-40"
                style={{
                    background: 'repeating-linear-gradient(90deg, #ef4444 0px, #ef4444 8px, transparent 8px, transparent 16px)',
                }}
            />

            {/* Scattered chaotic pills — absolute positioned for real messiness */}
            <div className="relative w-full h-full" style={{ minHeight: '360px' }}>
                {beforeLabels.map((label, i) => {
                    const translatedLabel = language === 'ar' ? (t(label) || label) : label;
                    const pos = chaosPositions[i];
                    const opacity = 0.5 + (i % 3) * 0.2; // Varying opacity = depth chaos

                    return (
                        <div
                            key={i}
                            className="absolute px-3.5 py-2 rounded-lg border text-[12px] font-['Sora',sans-serif] whitespace-nowrap"
                            style={{
                                left: `${pos.x}%`,
                                top: `${pos.y}%`,
                                transform: `rotate(${pos.rot}deg)`,
                                zIndex: pos.z,
                                backgroundColor: 'rgba(30, 20, 18, 0.9)',
                                borderColor: `rgba(239, 68, 68, ${0.15 + (i % 3) * 0.1})`,
                                color: `rgba(255, 255, 255, ${opacity})`,
                                boxShadow: i % 3 === 0 ? '0 0 15px rgba(239, 68, 68, 0.08)' : 'none',
                            }}
                        >
                            {translatedLabel}
                        </div>
                    );
                })}

                {/* Overlapping crossed-out lines for extra chaos feel */}
                <div className="absolute top-[45%] left-[10%] w-[80%] h-[1px] bg-red-500/10 rotate-[15deg]" />
                <div className="absolute top-[55%] left-[5%] w-[70%] h-[1px] bg-red-500/8 -rotate-[8deg]" />

                {/* "?" symbols scattered */}
                <div className="absolute top-[20%] right-[8%] text-red-500/20 text-[28px] font-bold rotate-12">?</div>
                <div className="absolute bottom-[25%] left-[30%] text-red-500/15 text-[22px] font-bold -rotate-[20deg]">?</div>
                <div className="absolute top-[60%] right-[25%] text-red-500/12 text-[18px] font-bold rotate-[35deg]">?</div>
            </div>

            {/* Heavy red danger glow from bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-[120px] pointer-events-none"
                style={{
                    background: 'linear-gradient(to top, rgba(220, 38, 38, 0.12) 0%, transparent 100%)',
                }}
            />

            {/* Fading border with red tint */}
            <div
                className="absolute inset-0 pointer-events-none rounded-[inherit]"
                style={{
                    padding: "1.5px",
                    background: "linear-gradient(to bottom, transparent 0%, transparent 30%, rgba(239,68,68,0.15) 60%, rgba(239,68,68,0.3) 100%)",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                }}
            />
            <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-40px_60px_0px_rgba(220,38,38,0.12)]" />
        </div>
    );
}

/* ---------- AFTER: Clean, systematic, step-by-step ---------- */
function MobileAfterCard() {
    const { language, t } = useLanguage();
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % afterLabels.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    const activeColor = afterLabels[activeIndex].color;

    return (
        <div className="relative w-full rounded-[24px] bg-[#020601] border border-white/10 overflow-hidden flex flex-col items-center gap-0 py-7 px-5" style={{ minHeight: '360px' }}>

            {/* Central orb — smaller, above the steps */}
            <div className="relative flex items-center justify-center mb-6">
                <div className="absolute size-[120px] rounded-full blur-[40px] opacity-20 transition-all duration-1000" style={{ background: `radial-gradient(circle, ${activeColor} 0%, transparent 70%)` }} />
                <div className="absolute size-14 rounded-full blur-xl opacity-30 transition-all duration-1000" style={{ background: activeColor }} />
                <div className="relative size-12 rounded-full shadow-[0_0_25px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden">
                    <div className="absolute inset-0 transition-all duration-1000" style={{ background: `radial-gradient(circle at 35% 35%, ${activeColor} 0%, ${activeColor}66 40%, #000 90%)` }} />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                </div>
            </div>

            {/* Vertical step flow — the "organized process" feel */}
            <div className="relative w-full max-w-[300px] flex flex-col items-center z-10">
                {/* Connecting vertical line */}
                <div className="absolute left-[24px] top-[20px] bottom-[20px] w-[1px]"
                    style={{
                        background: `linear-gradient(to bottom, transparent, ${activeColor}33, ${activeColor}22, transparent)`,
                    }}
                />

                {afterLabels.map((label, i) => {
                    const translatedLabel = language === 'ar' ? (t(label.name) || label.name) : label.name;
                    const isActive = i === activeIndex;
                    const isPast = i < activeIndex;

                    return (
                        <div
                            key={label.name}
                            className="flex items-center gap-3 w-full py-[10px] transition-all duration-700 ease-out relative"
                            style={{
                                opacity: isActive ? 1 : isPast ? 0.65 : 0.4,
                                transform: isActive ? 'translateX(4px)' : 'translateX(0)',
                            }}
                        >
                            {/* Step number circle */}
                            <div
                                className="relative flex-shrink-0 size-[48px] rounded-full flex items-center justify-center text-[11px] font-['Sora',sans-serif] font-bold transition-all duration-700 border"
                                style={{
                                    borderColor: isActive ? label.color : isPast ? `${label.color}55` : 'rgba(255,255,255,0.08)',
                                    backgroundColor: isActive ? `${label.color}18` : 'rgba(10,10,10,0.8)',
                                    boxShadow: isActive ? `0 0 20px ${label.color}25, inset 0 0 10px ${label.color}10` : 'none',
                                }}
                            >
                                <span className="text-[16px]">{label.icon}</span>
                                {/* Active ring pulse */}
                                {isActive && (
                                    <div className="absolute inset-[-3px] rounded-full border animate-ping opacity-20" style={{ borderColor: label.color }} />
                                )}
                            </div>

                            {/* Label text */}
                            <div className="flex flex-col gap-0.5">
                                <span
                                    className="text-[10px] font-['Sora',sans-serif] font-bold uppercase tracking-[2px] transition-colors duration-700"
                                    style={{ color: isActive ? label.color : 'rgba(255,255,255,0.3)' }}
                                >
                                    Step {label.step}
                                </span>
                                <span
                                    className="text-[15px] font-['Sora',sans-serif] font-semibold text-white transition-all duration-700"
                                    style={{
                                        opacity: isActive ? 1 : 0.6,
                                    }}
                                >
                                    {translatedLabel}
                                </span>
                            </div>

                            {/* Active indicator arrow */}
                            {isActive && (
                                <div className="ml-auto text-[14px] transition-all duration-500" style={{ color: label.color }}>
                                    ▸
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Bottom glow — color follows active step */}
            <div
                className="absolute inset-0 rounded-[inherit] opacity-25 pointer-events-none transition-all duration-1000"
                style={{ boxShadow: `inset 0px -80px 120px -40px ${activeColor}` }}
            />

            {/* Fading border */}
            <div
                className="absolute inset-0 pointer-events-none rounded-[inherit]"
                style={{
                    padding: "1.5px",
                    background: `linear-gradient(to bottom, transparent 0%, transparent 40%, ${activeColor}1a 60%, ${activeColor}4d 100%)`,
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                }}
            />
        </div>
    );
}

/* ──────────── Main component ──────────── */

export default function ProcessWithAnimation() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [sectionVisible, setSectionVisible] = useState(false);

    useEffect(() => {
        // On mobile, force-enable animations immediately
        if (window.innerWidth < 1024) {
            setSectionVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setSectionVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.05, rootMargin: '200px 0px' }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

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
            <div className="flex flex-col lg:flex-row items-center justify-center gap-[40px] lg:gap-20 w-full px-[16px] lg:px-4 relative mt-10 lg:mt-10">

                {/* Before Card */}
                <div className="flex flex-col items-center relative w-full lg:w-auto max-w-[570px]">
                    <p className="font-['Sora:SemiBold',sans-serif] font-semibold text-[24px] lg:text-[88px] text-[rgba(255,255,255,0.2)] text-center tracking-[3.5px] -mb-[12px] lg:-mb-[50px] relative z-0 pl-[12px] lg:pl-0 self-start lg:self-center">Before</p>
                    {/* Mobile: chaotic card */}
                    <div className="lg:hidden relative z-10 w-full">
                        <MobileBeforeCard />
                    </div>
                    {/* Desktop: animated card */}
                    <div className="hidden lg:flex relative z-10 justify-center">
                        <ProcessBackgroundImage additionalClassNames="" noRotation={true}>
                            <AnimatedBeforeCard sectionVisible={sectionVisible} />
                        </ProcessBackgroundImage>
                    </div>
                </div>

                {/* After Card */}
                <div className="flex flex-col items-center relative w-full lg:w-auto max-w-[570px] mt-6 lg:mt-0">
                    <p className="font-['Sora:SemiBold',sans-serif] font-semibold text-[24px] lg:text-[88px] text-[rgba(255,255,255,0.2)] text-center tracking-[3.5px] -mb-[12px] lg:-mb-[50px] relative z-0 pl-[12px] lg:pl-0 self-start lg:self-center">After</p>
                    {/* Mobile: organized step-by-step card */}
                    <div className="lg:hidden relative z-10 w-full">
                        <MobileAfterCard />
                    </div>
                    {/* Desktop: animated card */}
                    <div className="hidden lg:flex relative z-10 justify-center">
                        <ProcessBackgroundImage additionalClassNames="" noRotation={true}>
                            <AnimatedProcessCard sectionVisible={sectionVisible} />
                        </ProcessBackgroundImage>
                    </div>
                </div>
            </div>
        </div>
    );
}
