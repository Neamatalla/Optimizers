import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "motion/react";
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
    { name: 'Vitrine Furniture', tag: 'Furniture', tagBg: 'rgba(135,162,207,0.2)', tagColor: '#afc1df', accentColor: '#87a2cf', mockup: imgMockup1, profile: imgProfile1, metrics: [{ value: '+64.5%', label: 'Conversion rate' }, { value: '+19.48%', label: 'Avg. order value' }] },
    { name: 'Ribal Magic', tag: 'Entertainment', tagBg: 'rgba(106,228,153,0.15)', tagColor: '#92ebb4', accentColor: '#6ae499', mockup: imgMockup2, profile: imgProfile2, metrics: [{ value: '+11.9%', label: 'Conversion rate' }, { value: '+5.99%', label: 'Avg. order value' }] },
    { name: 'Squadio', tag: 'Technology', tagBg: 'rgba(255,107,87,0.15)', tagColor: '#ffa69a', accentColor: '#ff8979', mockup: imgMockup3, profile: imgProfile3, metrics: [{ value: '+833%', label: 'Signup Rate' }, { value: '+44.02%', label: 'Funnel Progression' }] },
    { name: 'Regal Honey', tag: 'Food & Beverage', tagBg: 'rgba(252,211,77,0.15)', tagColor: '#fde68a', accentColor: '#fcd34d', mockup: imgMockup4, profile: imgProfile4, metrics: [{ value: '+44.15%', label: 'Conversion rate' }, { value: '+34.6%', label: 'Avg. order value' }] },
    { name: 'Dubai Phone', tag: 'Electronics', tagBg: 'rgba(160,171,187,0.2)', tagColor: '#d0d5dd', accentColor: '#a0abbb', mockup: imgMockup5, profile: imgProfile5, metrics: [{ value: '+65%', label: 'Mobile conversion' }, { value: '+28%', label: 'Retention' }] },
];

const SectionSlide = ({ Section, bgOpacity, contentOpacity, counterY, mockupX, mockupY }: any) => {
    // Sharp visibility gate for rendering
    const isVisible = useTransform(bgOpacity, (v) => (v as number) > 0);

    return (
        <motion.div
            className="tc-slide-wrapper"
            style={{
                display: useTransform(isVisible, (v) => v ? "block" : "none"),
                pointerEvents: useTransform(bgOpacity, (v) => (v as number) > 0.5 ? "auto" : "none"),
                zIndex: 10,
                willChange: 'opacity'
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

    const smoothScroll_desktop = useSpring(scrollYProgress, {
        stiffness: 25,
        damping: 18,
        restDelta: 0.001,
    });

    // On mobile: use raw scroll progress (instant response, no lag)
    // On desktop: use spring for smooth, polished feel
    const smoothScroll = isMobile ? scrollYProgress : smoothScroll_desktop;

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
            if (isSnapping.current) {
                mouseX.set(0);
                mouseY.set(0);
                return;
            }
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

    const [mountedIndices, setMountedIndices] = useState<number[]>([0, 1]);
    const isSnapping = useRef(false);

    // ── Mount/unmount slides based on scroll progress ──
    useEffect(() => {
        const unsubscribe = smoothScroll.on("change", (latest: number) => {
            const active: number[] = [];
            if (latest <= 0.25) active.push(0);
            if (latest >= 0.11 && latest <= 0.49) active.push(1);
            if (latest >= 0.35 && latest <= 0.73) active.push(2);
            if (latest >= 0.59 && latest <= 0.97) active.push(3);
            if (latest >= 0.83) active.push(4);

            setMountedIndices((prev: number[]) => {
                if (prev.length === active.length && prev.every((v, i) => v === active[i])) return prev;
                return active;
            });
        });
        return () => unsubscribe();
    }, [smoothScroll]);

    // ── Wheel-event hijack: one tick = one slide ──
    const SNAP_TARGETS = [0.08, 0.32, 0.56, 0.80, 0.98];
    const LOCK_DURATION = 1800;

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            // Disable scroll hijack on tablet/mobile
            if (window.innerWidth < 1024) return;
            // Only hijack if the sticky wrapper is filling the viewport
            const rect = el.getBoundingClientRect();
            if (rect.top > 0 || rect.bottom < window.innerHeight) return;

            // Ignore tiny trackpad inertia/bounce events — let them pass through
            if (Math.abs(e.deltaY) < 3) return;

            // If already animating, consume the event but do nothing
            if (isSnapping.current) {
                e.preventDefault();
                return;
            }

            const progress = scrollYProgress.get();
            const direction = e.deltaY > 0 ? 1 : -1;

            // Find the current snap index (closest target at or before current progress)
            let currentIdx = 0;
            for (let i = SNAP_TARGETS.length - 1; i >= 0; i--) {
                if (progress >= SNAP_TARGETS[i] - 0.02) {
                    currentIdx = i;
                    break;
                }
            }

            const nextIdx = currentIdx + direction;

            // If scrolling beyond the section bounds, let the page scroll naturally
            if (nextIdx < 0 || nextIdx >= SNAP_TARGETS.length) return;

            e.preventDefault();
            isSnapping.current = true;

            const target = SNAP_TARGETS[nextIdx];
            const containerHeight = el.scrollHeight;
            const viewportHeight = window.innerHeight;
            const containerTop = rect.top + window.scrollY;
            const targetY = containerTop + (target * (containerHeight - viewportHeight));

            window.scrollTo({ top: targetY, behavior: 'instant' });
            setTimeout(() => { isSnapping.current = false; }, LOCK_DURATION);
        };

        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, [scrollYProgress]);

    // ── STABLE TRANSFORM ARRAYS (Prevents re-creation on re-render) ──
    const bgOpacityRefs = useRef([
        [0.00, 0.16, 0.20],
        [0.16, 0.20, 0.24, 0.40, 0.44],
        [0.40, 0.44, 0.48, 0.64, 0.68],
        [0.64, 0.68, 0.72, 0.88, 0.92],
        [0.88, 0.92, 0.96, 1.0],
    ]);

    const counterYRefs = useRef([
        ['0%', '0%', '-100%'],
        ['100%', '100%', '0%', '0%', '-100%'],
        ['100%', '100%', '0%', '0%', '-100%'],
        ['100%', '100%', '0%', '0%', '-100%'],
        ['100%', '100%', '0%', '0%'],
    ]);

    const bgOps = bgOpacityRefs.current.map((range, i) =>
        useTransform(smoothScroll, range, i === 0 ? [1, 1, 0] : i === 4 ? [0, 0, 1, 1] : [0, 0, 1, 1, 0])
    );

    const counterYs = counterYRefs.current.map((output, i) =>
        useTransform(smoothScroll, bgOpacityRefs.current[i], output)
    );

    const visGates = bgOpacityRefs.current.map((range, i) => {
        const r = [...range];
        if (i === 0) return useTransform(smoothScroll, [0.00, 0.20, 0.201], [1, 1, 0]);
        if (i === 4) return useTransform(smoothScroll, [0.919, 0.92, 1.0], [0, 1, 1]);
        return useTransform(smoothScroll, [r[0] - 0.001, r[0], r[3], r[3] + 0.001], [0, 1, 1, 0]);
    });

    // Centralized mockup parallax mockupX/mockupY
    const parallaxGains = bgOpacityRefs.current.map((range, i) =>
        useTransform(smoothScroll, range, i === 0 ? [1, 1, 0] : i === 4 ? [0, 0, 1, 1] : [0, 0, 1, 1, 0])
    );

    // Final mockupX/Y per section
    const mockupXs = parallaxGains.map(gain => useTransform([rawX, gain], ([x, g]) => (x as number) * (g as number)));
    const mockupYs = parallaxGains.map(gain => useTransform([rawY, gain], ([y, g]) => (y as number) * (g as number)));

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
            <div className="bg-[#020601] w-full">
                {/* Section Title */}
                <div className="px-5 pt-10 pb-4">
                    <p
                        className="font-['Sora',sans-serif] font-semibold leading-[1.1] text-[28px] tracking-[-0.02em] bg-center bg-clip-text bg-cover bg-no-repeat text-center"
                        style={{
                            WebkitTextFillColor: "transparent",
                            backgroundImage: `url('${imgTopclientsResults4}')`,
                        }}
                    >
                        <span className="uppercase">T</span>
                        <span>OP </span>
                        <span className="uppercase">C</span>
                        <span>LIENTS & </span>
                        <span className="uppercase">R</span>
                        <span>ESULTS</span>
                    </p>
                </div>

                {/* Carousel Container */}
                <div
                    className="relative w-full"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Left Arrow */}
                    <button
                        onClick={() => goToSlide(activeSlide > 0 ? activeSlide - 1 : clientData.length - 1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 active:bg-white/20 transition-colors"
                        aria-label="Previous client"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>

                    {/* Right Arrow */}
                    <button
                        onClick={() => goToSlide(activeSlide < clientData.length - 1 ? activeSlide + 1 : 0)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 active:bg-white/20 transition-colors"
                        aria-label="Next client"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                    </button>

                    {/* Crossfade Cards — all rendered, stacked via CSS grid */}
                    <div className="grid" style={{ gridTemplateColumns: '1fr', gridTemplateRows: '1fr' }}>
                        {clientData.map((c, i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center px-12 pt-4 pb-2 gap-4"
                                style={{
                                    gridColumn: 1,
                                    gridRow: 1,
                                    opacity: i === activeSlide ? 1 : 0,
                                    visibility: i === activeSlide ? 'visible' : 'hidden',
                                    transform: i === activeSlide ? 'scale(1)' : 'scale(0.97)',
                                    transition: 'opacity 500ms ease, transform 500ms ease, visibility 0s linear ' + (i === activeSlide ? '0s' : '500ms'),
                                }}
                            >
                                {/* Brand Header */}
                                <div className="flex items-center gap-3 w-full max-w-[300px]">
                                    <img alt="" className="size-[40px] rounded-full object-cover shrink-0" src={c.profile} decoding="async" />
                                    <div className="flex flex-col gap-0.5">
                                        <p className="font-['Sora',sans-serif] font-semibold text-[17px] text-white tracking-[-0.02em] leading-[1.2]">{c.name}</p>
                                        <div className="flex items-center justify-center px-[8px] py-[2px] rounded-[100px] w-fit" style={{ background: c.tagBg }}>
                                            <p className="font-['Sora',sans-serif] font-normal text-[10px]" style={{ color: c.tagColor }}>{c.tag}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Phone Mockup — fills width, natural height */}
                                <div className="w-full relative shrink-0">
                                    <img
                                        alt=""
                                        className="w-full h-auto drop-shadow-[0px_16px_32px_rgba(0,0,0,0.5)]"
                                        src={c.mockup}
                                        decoding="async"
                                    />
                                </div>

                                {/* Metrics — 2 pills side by side */}
                                <div className="flex gap-6 w-full max-w-[300px] justify-center">
                                    {c.metrics.map((m, mi) => (
                                        <div key={mi} className="flex flex-col gap-0.5 items-center">
                                            <p className="font-['Sora',sans-serif] font-semibold text-[24px] tracking-[-0.04em] leading-tight" style={{ color: c.accentColor }}>{m.value}</p>
                                            <p className="font-['Sora',sans-serif] font-normal text-[10px] text-white/60 text-center">{m.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pagination Dots + Swipe Hint */}
                <div className="flex flex-col items-center gap-2 py-3">
                    <div className="flex justify-center gap-2">
                        {clientData.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goToSlide(i)}
                                className={`rounded-full transition-all duration-300 ${i === activeSlide
                                    ? 'w-6 h-2 bg-[#6ae499]'
                                    : 'w-2 h-2 bg-white/30'
                                    }`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                    <p className="font-['Sora',sans-serif] font-normal text-[10px] text-white/30 tracking-wide">
                        Swipe to explore
                    </p>
                </div>
            </div>
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
                        className="absolute bg-center bg-clip-text bg-cover bg-no-repeat font-['Sora',sans-serif] font-semibold leading-[1.1] left-[5.5vw] lowercase tracking-[-0.04em]"
                        style={{
                            WebkitTextFillColor: "transparent",
                            backgroundImage: `url('${imgTopclientsResults4}')`,
                            textShadow: 'none',
                            fontSize: '5.58vw',
                            top: '5vw',
                        }}
                    >
                        <span className="uppercase">T</span>
                        <span>OP </span>
                        <span className="uppercase">C</span>
                        <span>LIENTS & </span>
                        <span className="uppercase">R</span>
                        <span>ESULTS</span>
                    </p>
                </div>

                {/* Persistent CTA */}
                <div className="tc-persistent-ui hidden lg:block" style={{ zIndex: 50 }}>
                    <div className="absolute left-[5.5vw] flex flex-col items-start" style={{ bottom: '5vw', gap: '1.5vw' }}>
                        <p className="font-['Sora',sans-serif] font-normal leading-normal text-white" style={{ fontSize: '1.46vw' }}>
                            Ready to be our next success story?
                        </p>
                        <div
                            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-[rgba(2,6,1,0.7)] backdrop-blur-md h-auto relative rounded-[100px] border border-[#6ae499]/50 cursor-pointer hover:scale-105 hover:bg-[rgba(106,228,153,0.1)] transition-all shadow-[0px_0px_30px_0px_rgba(106,228,153,0.3)]"
                            style={{ padding: '1.17vw 2.34vw' }}
                        >
                            <p className="font-['Sora',sans-serif] font-semibold text-white" style={{ fontSize: '1.58vw' }}>
                                Book Your Free Consultation
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

