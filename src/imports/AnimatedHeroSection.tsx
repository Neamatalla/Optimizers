import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionValueEvent, animate } from "motion/react";
import { useLanguage } from "../app/contexts/LanguageContext";
import Section1 from "./Section1";
import Section2 from "./Section2";
import Section3 from "./Section3";
import Section4 from "./Section4";
import Section5 from "./Section5";
import imgTopclientsResults4 from "../assets/f6cb95ddf6fbcaa6d79196a0ac804e1747a8b1c4.webp";
import '../styles/top-clients-scroll.css';

// Mobile carousel client data — mockup + profile images from each Section
import imgMockup1 from "../assets/dc7b94025c6990629360e685e3f89e4c1a875b87.webp";
import imgProfile1 from "../assets/b05b5665ef7392ecc34632f1fe3e5a3f0f5ca9ea.webp";
import imgMockup2 from "../assets/d2910da25aaf2e477099caca0265707a5d96d1ef.webp";
import imgProfile2 from "../assets/bde38689905fa705ea1cd171fd5425c46f8945de.webp";
import imgMockup3 from "../assets/7fec2f6c58d89e9db3710f48675539245c39f654.webp";
import imgProfile3 from "../assets/8e66717815099dcf56c5ab45c85dd101fbc09713.webp";
import imgMockup4 from "../assets/e9bccb8642719980ea958d77f0b65d7871275cae.webp";
import imgProfile4 from "../assets/bea2fb523d6f14c71d06c08b5857b1e8c2afdc71.webp";
import imgMockup5 from "../assets/9f8f278f482336f0475810eb8d279e3e1acb7ca6.webp";
import imgProfile5 from "../assets/28ae360f5ef1294530a445760980d0b0cc4fce99.webp";

const clientData = [
    { name: 'Vitrine Furniture', tag: 'Furniture', tagBg: 'rgba(135,162,207,0.2)', tagColor: '#afc1df', accentColor: '#87a2cf', mockup: imgMockup1, profile: imgProfile1, goal: 'Increase homepage engagement & conversions.', areas: 'Homepage layout, product visibility.', metrics: [{ value: '+64.5%', label: 'Conversion rate' }, { value: '+19.48%', label: 'Avg. order value' }] },
    { name: 'Ribal Magic', tag: 'Entertainment', tagBg: 'rgba(106,228,153,0.15)', tagColor: '#92ebb4', accentColor: '#6ae499', mockup: imgMockup2, profile: imgProfile2, goal: 'Reduce cart abandonment & increase AOV.', areas: 'Checkout flow, product pages.', metrics: [{ value: '+11.9%', label: 'E-commerce conversion rate' }, { value: '+5.99%', label: 'Average order value' }] },
    { name: 'Squadio', tag: 'Technology', tagBg: 'rgba(255,107,87,0.15)', tagColor: '#ffa69a', accentColor: '#ff8979', mockup: imgMockup3, profile: imgProfile3, goal: 'Clarify value proposition & build trust.', areas: 'Homepage navigation, CTAs, trust signals.', metrics: [{ value: '+833%', label: 'Signup Rate' }, { value: '+44.02%', label: 'Funnel Progression' }] },
    { name: 'Regal Honey', tag: 'Food & Beverage', tagBg: 'rgba(252,211,77,0.15)', tagColor: '#fde68a', accentColor: '#fcd34d', mockup: imgMockup4, profile: imgProfile4, goal: 'Build brand trust & educate customers.', areas: 'Product details, video reviews.', metrics: [{ value: '+44.15%', label: 'Conversion rate' }, { value: '+34.6%', label: 'Avg. order value' }] },
    { name: 'Dubai Phone', tag: 'Electronics', tagBg: 'rgba(160,171,187,0.2)', tagColor: '#d0d5dd', accentColor: '#a0abbb', mockup: imgMockup5, profile: imgProfile5, goal: 'Optimize mobile shopping experience.', areas: 'Mobile checkout flow, retention.', metrics: [{ value: '+65%', label: 'Mobile conversion' }, { value: '+28%', label: 'Retention' }] },
];

const SectionSlide = ({ Section, bgOpacity, contentOpacity, counterY, mockupX, mockupY }: any) => {
    return (
        <motion.div
            className="tc-slide-wrapper"
            style={{
                display: useTransform(bgOpacity, (v) => (v as number) > 0 ? "block" : "none"),
                pointerEvents: useTransform(bgOpacity, (v) => (v as number) > 0.5 ? "auto" : "none"),
                zIndex: 10,
                willChange: 'transform, opacity',
            }}
        >
            {/* Background Layer moved inside Section via renderMode */}
            <Section
                isActive={true}
                renderMode="full"
                bgOpacity={bgOpacity}
                contentOpacity={contentOpacity}
                counterY={counterY}
                mockupX={mockupX}
                mockupY={mockupY}
            />
        </motion.div>
    );
};

const sections = [Section1, Section2, Section3, Section4, Section5];

export default function AnimatedHeroSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);
    const { language, t } = useLanguage();

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    });

    // ── Mouse tracking for Parallax ──
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    // Centralize parallax transforms
    const rawX = useTransform(smoothMouseX, [-0.5, 0.5], [-60, 60]);
    const rawY = useTransform(smoothMouseY, [-0.5, 0.5], [-60, 60]);

    const [isInView, setIsInView] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIsInView(entry.isIntersecting);
        }, { threshold: 0.05 });
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isInView) return;
        const handleMouseMove = (e: MouseEvent) => {
            const mouseX_raw = e.clientX / window.innerWidth;
            const mouseY_raw = e.clientY / window.innerHeight;
            const dx = mouseX_raw - 0.5;
            const dy = mouseY_raw - 0.55;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const radius = 0.35;
            const weight = Math.max(0, 1 - (distance / radius));
            mouseX.set(-dx * weight);
            mouseY.set(-(mouseY_raw - 0.5) * weight);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [isInView, mouseX, mouseY]);

    // ── Time-Based Triggering ──
    const [activeIndex, setActiveIndex] = useState(0);
    const [mountedIndices, setMountedIndices] = useState<number[]>([0, 1, 2, 3, 4]);

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        if (isMobile) return;
        // Distribute 5 slides over 0.0 to 1.0 (each gets 0.2 of the scroll height)
        const index = Math.min(Math.floor(latest / 0.2), 4);
        if (index !== activeIndex) setActiveIndex(Math.max(0, index));
    });

    const bgOps = [
        useMotionValue(1),
        useMotionValue(0),
        useMotionValue(0),
        useMotionValue(0),
        useMotionValue(0)
    ];

    const visGates = [
        useMotionValue(1),
        useMotionValue(0),
        useMotionValue(0),
        useMotionValue(0),
        useMotionValue(0)
    ];

    const counterYs = [
        useMotionValue('0%'),
        useMotionValue('100%'),
        useMotionValue('100%'),
        useMotionValue('100%'),
        useMotionValue('100%')
    ];

    useEffect(() => {
        if (isMobile) return;
        const DURATION = 1; // 1s best for Top Clients text counting and reveal
        const EASE = "easeInOut";

        sections.forEach((_, i) => {
            animate(bgOps[i], i === activeIndex ? 1 : 0, { duration: DURATION, ease: EASE });
            animate(visGates[i], i === activeIndex ? 1 : 0, { duration: DURATION, ease: EASE });

            let targetY = i < activeIndex ? '-100%' : (i > activeIndex ? '100%' : '0%');
            animate(counterYs[i], targetY, { duration: DURATION, ease: EASE });
        });
    }, [activeIndex, isMobile]);

    // Final mockupX/Y per section based on visibility (bgOps)
    const mockupXs = bgOps.map(gain => useTransform([rawX, gain], ([x, g]) => (x as number) * (g as number)));
    const mockupYs = bgOps.map(gain => useTransform([rawY, gain], ([y, g]) => (y as number) * (g as number)));

    // ══════ MOBILE: Auto-rotating carousel — compact single viewport ══════
    const [activeSlide, setActiveSlide] = useState(0);
    const touchStartX = useRef<number | null>(null);
    const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Auto-rotate every 4 seconds
    useEffect(() => {
        if (!isMobile) return;
        autoPlayRef.current = setInterval(() => {
            setActiveSlide(prev => (prev + 1) % sections.length);
        }, 4000);
        return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
    }, [isMobile]);

    const resetAutoPlay = () => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        autoPlayRef.current = setInterval(() => {
            setActiveSlide(prev => (prev + 1) % sections.length);
        }, 4000);
    };

    const goToSlide = (idx: number) => {
        setActiveSlide(idx);
        resetAutoPlay();
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0 && activeSlide < sections.length - 1) goToSlide(activeSlide + 1);
            else if (diff < 0 && activeSlide > 0) goToSlide(activeSlide - 1);
        }
        touchStartX.current = null;
    };

    if (isMobile) {
        const client = clientData[activeSlide];
        return (
            <>
                <style>{`
                @keyframes watermarkScroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
                <div className="bg-[#020601] w-full h-[100dvh] pt-[8dvh] pb-[4dvh] flex flex-col justify-between relative overflow-hidden" style={{ isolation: 'isolate' }}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Section Title */}
                    <div className="relative px-5 flex flex-col items-center gap-2 flex-shrink-0 z-30 mb-4" style={{ isolation: 'isolate' }}>
                        <p
                            className="font-['Sora',sans-serif] font-bold leading-[1.1] text-[32px] tracking-[-0.04em] bg-center bg-clip-text bg-cover bg-no-repeat text-center"
                            style={{
                                WebkitTextFillColor: "transparent",
                                backgroundImage: `url('${imgTopclientsResults4}')`,
                            }}
                        >
                            {language === 'ar' ? (
                                <span>أفضل العملاء والنتائج</span>
                            ) : (
                                <>
                                    <span className="uppercase">T</span>
                                    <span>OP </span>
                                    <span className="uppercase">C</span>
                                    <span>LIENTS & </span>
                                    <span className="uppercase">R</span>
                                    <span>ESULTS</span>
                                </>
                            )}
                        </p>

                    </div>

                    {/* Removed fixed spacer to use relative flow */}

                    <div className="relative z-10 flex-1 flex flex-col justify-end w-full max-w-[500px] mx-auto mt-2">
                        {/* Phone mockup — relative flex layout */}
                        <div className="relative z-20 flex justify-center w-full min-h-0 items-end pointer-events-none mb-[-12vh]">
                            <div className="relative w-full h-full flex justify-center items-end">
                                {clientData.map((c, i) => (
                                    <div
                                        key={i}
                                        className="absolute bottom-0 w-[85%]"
                                        style={{
                                            opacity: i === activeSlide ? 1 : 0,
                                            transform: i === activeSlide ? 'translateY(0)' : 'translateY(20px)',
                                            transition: i === activeSlide
                                                ? 'opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)'
                                                : 'opacity 300ms ease-out, transform 300ms ease-out',
                                            pointerEvents: i === activeSlide ? 'auto' : 'none',
                                        }}
                                    >
                                        <img
                                            alt={c.name}
                                            className="w-full h-auto drop-shadow-[0px_24px_48px_rgba(0,0,0,0.7)]"
                                            src={c.mockup}
                                            decoding="async"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Gradient card — bottom bound via flex-shrink */}
                        <div className="relative rounded-[28px] overflow-hidden mx-4 flex-shrink-0 pointer-events-auto"
                            style={{
                                background: `linear-gradient(180deg, ${clientData[activeSlide].accentColor}50 0%, ${clientData[activeSlide].accentColor}1A 100%)`,
                                boxShadow: `0px 10px 40px -10px ${clientData[activeSlide].accentColor}50`,
                                transition: 'background 800ms ease, box-shadow 800ms ease',
                            }}
                        >
                            {/* Gradient border */}
                            <div className="absolute inset-0 rounded-[28px] pointer-events-none"
                                style={{
                                    boxShadow: `inset 0 0 0 1px ${clientData[activeSlide].accentColor}40`,
                                    transition: 'box-shadow 800ms ease',
                                }}
                            />

                            {/* Scrolling watermark text */}
                            <div 
                                className="absolute inset-x-0 overflow-hidden pointer-events-none" 
                                style={{ 
                                    paddingTop: '8dvh',
                                    maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 20%, black 50%, rgba(0,0,0,0.4) 80%, transparent 100%)',
                                    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 20%, black 50%, rgba(0,0,0,0.4) 80%, transparent 100%)'
                                }}
                            >
                                <div className="grid" style={{ gridTemplateColumns: '1fr', gridTemplateRows: '1fr' }}>
                                    {clientData.map((c, i) => (
                                        <div
                                            key={i}
                                            className="whitespace-nowrap"
                                            style={{
                                                gridColumn: 1,
                                                gridRow: 1,
                                                opacity: i === activeSlide ? 0.15 : 0,
                                                transition: 'opacity 800ms ease',
                                                animation: 'watermarkScroll 25s linear infinite',
                                            }}
                                        >
                                            {[...Array(6)].map((_, j) => (
                                                <span
                                                    key={j}
                                                    className="font-['Sora',sans-serif] font-bold select-none inline-flex items-center gap-4"
                                                    style={{
                                                        fontSize: '84px',
                                                        letterSpacing: '0.05em',
                                                        color: '#ffffff',
                                                        paddingRight: '60px',
                                                    }}
                                                >
                                                    {c.name}
                                                </span>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Card content — dynamic vertical padding */}
                            <div className="relative z-[1] pt-[12vh] pb-4 px-5">

                                {/* Goals and Improvement */}
                                <div className="grid mb-5" style={{ gridTemplateColumns: '1fr', gridTemplateRows: '1fr' }}>
                                    {clientData.map((c, i) => (
                                        <div
                                            key={i}
                                            className="flex flex-col gap-3"
                                            style={{
                                                gridColumn: 1,
                                                gridRow: 1,
                                                opacity: i === activeSlide ? 1 : 0,
                                                transform: i === activeSlide ? 'translateY(0)' : 'translateY(8px)',
                                                transition: i === activeSlide
                                                    ? 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) 200ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 200ms'
                                                    : 'opacity 300ms ease-out, transform 300ms ease-out',
                                            }}
                                        >
                                            <div>
                                                <p className="font-['Sora',sans-serif] font-bold text-[16px] mb-1" style={{ color: c.tagColor }}>{t('Our Goal:')}</p>
                                                <p className="font-['Sora',sans-serif] font-normal text-[14px] text-white/90 leading-[1.3] line-clamp-2">{t(c.goal)}</p>
                                            </div>
                                            <div>
                                                <p className="font-['Sora',sans-serif] font-bold text-[16px] mb-1" style={{ color: c.tagColor }}>{t('Areas of Improvement:')}</p>
                                                <p className="font-['Sora',sans-serif] font-normal text-[14px] text-white/90 leading-[1.3] line-clamp-2">{t(c.areas)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Metrics */}
                                <div className="grid" style={{ gridTemplateColumns: '1fr', gridTemplateRows: '1fr' }}>
                                    {clientData.map((c, i) => (
                                        <div
                                            key={i}
                                            className="flex gap-4 justify-center"
                                            style={{
                                                gridColumn: 1,
                                                gridRow: 1,
                                                opacity: i === activeSlide ? 1 : 0,
                                                transform: i === activeSlide ? 'translateY(0)' : 'translateY(12px)',
                                                transition: i === activeSlide
                                                    ? 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) 300ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 300ms'
                                                    : 'opacity 300ms ease-out, transform 300ms ease-out',
                                            }}
                                        >
                                            {c.metrics.map((m, mi) => (
                                                <div key={mi}
                                                    className="flex flex-col items-start gap-0.5 flex-1 py-1"
                                                >
                                                    <p className="font-['Sora',sans-serif] font-bold text-[30px] tracking-[-0.04em] leading-tight" style={{ color: c.accentColor }}>{m.value}</p>
                                                    <p className="font-['Sora',sans-serif] font-medium text-[12px] text-white/90 text-left leading-[1.3]">{t(m.label)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination and Arrows */}
                                <div className={`flex items-center justify-between pt-5 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                    <button
                                        onClick={() => goToSlide(activeSlide === 0 ? sections.length - 1 : activeSlide - 1)}
                                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                                        style={{ backgroundColor: `${clientData[activeSlide].accentColor}40`, transition: 'background-color 800ms ease' }}
                                        aria-label="Previous slide"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                            <polyline points="15 18 9 12 15 6"></polyline>
                                        </svg>
                                    </button>

                                    <div className="flex gap-2">
                                        {clientData.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => goToSlide(i)}
                                                className="rounded-full transition-all duration-300"
                                                style={{
                                                    width: i === activeSlide ? '20px' : '8px',
                                                    height: '8px',
                                                    background: i === activeSlide ? clientData[activeSlide].accentColor : 'rgba(255,255,255,0.2)',
                                                }}
                                                aria-label={`Go to slide ${i + 1}`}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => goToSlide((activeSlide + 1) % sections.length)}
                                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                                        style={{ backgroundColor: `${clientData[activeSlide].accentColor}40`, transition: 'background-color 800ms ease' }}
                                        aria-label="Next slide"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                            <polyline points="9 18 15 12 9 6"></polyline>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div ref={containerRef} className="tc-scroll-container">
            <div className="tc-sticky-wrapper">
                {/* Unified Section Layer */}
                {sections.map((Section, i) => mountedIndices.includes(i) && (
                    <SectionSlide
                        key={`slide-${i}`}
                        Section={Section}
                        bgOpacity={bgOps[i]}
                        contentOpacity={visGates[i]}
                        counterY={counterYs[i]}
                        mockupX={mockupXs[i]}
                        mockupY={mockupYs[i]}
                    />
                ))}

                {/* Persistent Title */}
                <div className="tc-persistent-ui hidden lg:block" style={{ zIndex: 20 }}>
                    <p
                        className={`absolute bg-center bg-clip-text bg-cover bg-no-repeat font-['Sora',sans-serif] font-semibold leading-[1.1] lowercase tracking-[-0.04em]`}
                        style={{
                            WebkitTextFillColor: "transparent",
                            backgroundImage: `url('${imgTopclientsResults4}')`,
                            textShadow: 'none',
                            fontSize: '5.58vw',
                            top: '5vw',
                            ...(language === 'ar' ? { right: '5.5vw', textAlign: 'right' as const } : { left: '5.5vw' }),
                        }}
                    >
                        {language === 'ar' ? (
                            <span>أفضل العملاء والنتائج</span>
                        ) : (
                            <>
                                <span className="uppercase">T</span>
                                <span>OP </span>
                                <span className="uppercase">C</span>
                                <span>LIENTS & </span>
                                <span className="uppercase">R</span>
                                <span>ESULTS</span>
                            </>
                        )}
                    </p>
                </div>

                {/* Persistent CTA */}
                <div className="tc-persistent-ui hidden lg:block" style={{ zIndex: 50 }}>
                    <div className={`absolute flex flex-col ${language === 'ar' ? 'items-end' : 'items-start'}`} style={{ bottom: '5vw', gap: '1.5vw', ...(language === 'ar' ? { right: '5.5vw' } : { left: '5.5vw' }) }}>

                        <div
                            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-[rgba(2,6,1,0.7)] backdrop-blur-md h-auto relative rounded-[100px] border border-[#6ae499]/50 cursor-pointer hover:scale-105 hover:bg-[rgba(106,228,153,0.1)] transition-all shadow-[0px_0px_30px_0px_rgba(106,228,153,0.3)]"
                            style={{ padding: '1.17vw 2.34vw' }}
                        >
                            <p className="font-['Sora',sans-serif] font-semibold text-white" style={{ fontSize: '1.58vw' }}>
                                {language === 'ar' ? 'احجز استشارتك المجانية الآن' : 'Book Your Free Consultation'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

