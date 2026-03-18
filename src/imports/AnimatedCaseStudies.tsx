import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, useMotionValue, useMotionValueEvent, animate } from 'motion/react';
import '../styles/case-studies-animations.css';

import CaseStudy3 from './CaseStudy3';
import CaseStudy4 from './CaseStudy4';
import CaseStudy5 from './CaseStudy5';
import CaseStudy6 from './CaseStudy6';

// Mobile case study data — extracted from CaseStudy3/4/5/6
const mobileCaseStudies = [
    {
        brand: 'Squadio',
        industry: 'Hiring Industry',
        industryColor: '#ff8979',
        industryBg: 'rgba(255,107,87,0.15)',
        challenge: 'The homepage had low conversions due to unclear value proposition, distracting navigation, weak CTAs, and missing trust signals.',
        hypothesis: 'Clarifying the value proposition, simplifying navigation, enhancing CTAs, and showcasing credibility would improve conversions.',
        stats: [
            { value: '+44.02%', label: 'Funnel Progression', color: '#ff8979' },
            { value: '+4.33%', label: 'Conversion Rate', color: '#ff8979' },
        ],
    },
    {
        brand: 'Ribal Magic',
        industry: 'Home Appliances',
        industryColor: '#6ae499',
        industryBg: 'rgba(106,228,153,0.15)',
        challenge: 'PDPs lacked visual clarity and structure, failed to create urgency, and weak CTAs caused users to bounce.',
        hypothesis: 'Improving PDP clarity with better imagery, structured info, reviews, and stronger CTAs would drive conversions.',
        stats: [
            { value: '+8.95%', label: 'Conversion Rate', color: '#6ae499' },
            { value: '+9.41%', label: 'Revenue Growth', color: '#6ae499' },
        ],
    },
    {
        brand: 'Regal Honey',
        industry: 'Honey Industry',
        industryColor: '#fcd34d',
        industryBg: 'rgba(252,211,77,0.15)',
        challenge: 'Customers hesitated to buy; unclear product info and low brand trust left questions about quality and benefits.',
        hypothesis: 'Using transparent videos and clear explanations of ingredients and benefits would build trust and drive purchases.',
        stats: [
            { value: '+6.4%', label: 'Conversion Rate', color: '#fcd34d' },
            { value: '+8.03%', label: 'Revenue per Visitor', color: '#fcd34d' },
        ],
    },
    {
        brand: 'Vitrine Furniture',
        industry: 'Furniture Industry',
        industryColor: '#87a2cf',
        industryBg: 'rgba(135,162,207,0.2)',
        challenge: 'The homepage buried products too deeply, limiting visibility and missing opportunities to guide users toward conversion.',
        hypothesis: 'Surfacing products on the homepage with ratings, CTAs, and best sellers would boost engagement and conversions.',
        stats: [
            { value: '+28.47%', label: 'Conversion Rate', color: '#87a2cf' },
            { value: '+70.73%', label: 'Revenue per Visitor', color: '#87a2cf' },
        ],
    },
];

const CONTENT_WIDTH = 1440;
const CONTENT_HEIGHT = 935.24;
// Bars open to 3% from each edge of the 1440px content
const BAR_OPEN_PX = CONTENT_WIDTH / 2 - CONTENT_WIDTH * 0.03; // ~677px from center
// Bar width in px — used to bake centering into the motion x (CSS transform is overridden by motion)
const BAR_WIDTH = 12;

export default function AnimatedCaseStudies() {
    const containerRef = useRef<HTMLDivElement>(null);

    // ── Mobile detection ──
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // ── Compute scale so the 1440px content fits the viewport exactly ──
    const [scale, setScale] = useState(1);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const update = () => {
            if (window.innerWidth < 1024) {
                setScale(1);
                return;
            }
            const scaleX = window.innerWidth / CONTENT_WIDTH;
            const scaleY = window.innerHeight / CONTENT_HEIGHT;
            setScale(Math.min(scaleX, scaleY, 1));
        };
        update();

        const observer = new IntersectionObserver(
            ([entry]) => setIsInView(entry.isIntersecting),
            { threshold: 0.01 }
        );
        if (containerRef.current) observer.observe(containerRef.current);

        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('resize', update);
            observer.disconnect();
        };
    }, []);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start 0.4', 'end end'],
    });

    const roundedScroll = useSpring(scrollYProgress, {
        stiffness: 25,
        damping: 18,
        restDelta: 0.001,
    });

    // slideScroll: raw on mobile for instant transitions, spring on desktop for smooth crossfade
    const slideScroll = isMobile ? scrollYProgress : roundedScroll;

    // ── Time-Based Triggering (Slides) ──
    const [activeIndex, setActiveIndex] = useState(-1);

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        if (isMobile) return;

        let index = -1;
        // Gate finishes around 0.15. Start slides after that.
        if (latest > 0.15) {
            // Distribute 4 slides across the remaining 0.85
            const progressRatio = (latest - 0.15) / 0.85;
            index = Math.min(Math.floor(progressRatio / 0.25), 3);
            index = Math.max(0, index);
        }

        if (index !== activeIndex) setActiveIndex(index);
    });

    const gateProgress = useTransform(scrollYProgress, [0, 0.12], [0, 1]);

    const leftBarX = useTransform(gateProgress, [0, 1], [-BAR_WIDTH / 2, -BAR_OPEN_PX - BAR_WIDTH / 2]);
    const rightBarX = useTransform(gateProgress, [0, 1], [BAR_WIDTH / 2, BAR_OPEN_PX + BAR_WIDTH / 2]);

    const leftSkew = useTransform(gateProgress, [0, 1], [0, -40]);
    const rightSkew = useTransform(gateProgress, [0, 1], [0, 40]);

    const titleClipPct = useTransform(gateProgress, [0, 1], [50, 3]);
    const titleClipPath = useTransform(titleClipPct, (v: number) => `inset(0 ${v}% 0 ${v}%)`);

    const titleOpacity = useTransform(scrollYProgress, [0, 0.06, 0.10, 0.15], [0, 1, 1, 0]);
    const titleY = useTransform(gateProgress, [0, 1], ['40%', '0%']);

    const barColor = useTransform(
        roundedScroll,
        [0.10, 0.20, 0.38, 0.62, 0.82],
        ['#ffffff', '#ff8979', '#6ae499', '#fcd34d', '#5a8cd6']
    );

    const slideYs = [
        useMotionValue('30%'),
        useMotionValue('30%'),
        useMotionValue('30%'),
        useMotionValue('30%')
    ];

    const slideOpacities = [
        useMotionValue(0),
        useMotionValue(0),
        useMotionValue(0),
        useMotionValue(0)
    ];

    useEffect(() => {
        if (isMobile) return;
        const DURATION = 0.5; // 0.5s best for quick high-impact visuals
        const EASE = "easeInOut";

        slideOpacities.forEach((opacity, i) => {
            animate(opacity, i === activeIndex ? 1 : 0, { duration: DURATION, ease: EASE });
            let targetY = i < activeIndex ? '-30%' : (i > activeIndex ? '30%' : '0%');
            animate(slideYs[i], targetY, { duration: DURATION, ease: EASE });
        });
    }, [activeIndex, isMobile]);

    const slide1Y = slideYs[0];
    const slide2Y = slideYs[1];
    const slide3Y = slideYs[2];
    const slide4Y = slideYs[3];

    const slide1Opacity = slideOpacities[0];
    const slide2Opacity = slideOpacities[1];
    const slide3Opacity = slideOpacities[2];
    const slide4Opacity = slideOpacities[3];

    const scrollHintOpacity = useTransform(roundedScroll, [0, 0.05], [1, 0]);

    // ══════ MOBILE: Simple section with entrance animations (zero dead space) ══════
    if (isMobile) {
        return (
            <div className="relative w-full py-12 px-4" style={{ background: '#020601' }}>
                {/* Section Header with decorative neon bars */}
                <motion.div
                    className="relative flex items-center justify-center mb-8"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Left neon bar */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-[3px] h-[40px] rounded-full"
                        style={{ color: '#6ae499' }}
                    >
                        <div className="t-gate-blur-2" />
                        <div className="t-gate-blur-1" />
                        <div className="t-gate-core" />
                    </div>

                    <h2 className="font-['Sora',sans-serif] font-bold text-[36px] tracking-[-2px] text-center leading-tight"
                        style={{
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(100,100,100,0.7) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        Case Studies
                    </h2>

                    {/* Right neon bar */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-[3px] h-[40px] rounded-full"
                        style={{ color: '#6ae499' }}
                    >
                        <div className="t-gate-blur-2" />
                        <div className="t-gate-blur-1" />
                        <div className="t-gate-core" />
                    </div>
                </motion.div>

                {/* Case Study Cards */}
                <div className="flex flex-col gap-5">
                    {mobileCaseStudies.map((cs, i) => (
                        <motion.div
                            key={i}
                            className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.15 }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                        >
                            <div className="p-5 pb-3">
                                <div className="flex items-center gap-3 mb-3">
                                    <h3 className="font-['Sora',sans-serif] font-semibold text-[22px] text-white tracking-[-0.02em]">
                                        {cs.brand}
                                    </h3>
                                    <span
                                        className="text-[12px] font-['Sora',sans-serif] px-3 py-1 rounded-full"
                                        style={{ backgroundColor: cs.industryBg, color: cs.industryColor }}
                                    >
                                        {cs.industry}
                                    </span>
                                </div>
                                <div className="mb-3">
                                    <p className="font-['Sora',sans-serif] font-semibold text-[13px] mb-1" style={{ color: cs.industryColor }}>Challenge</p>
                                    <p className="font-['Sora',sans-serif] text-[13px] text-white/70 leading-relaxed">{cs.challenge}</p>
                                </div>
                                <div>
                                    <p className="font-['Sora',sans-serif] font-semibold text-[13px] mb-1" style={{ color: cs.industryColor }}>Hypothesis</p>
                                    <p className="font-['Sora',sans-serif] text-[13px] text-white/70 leading-relaxed">{cs.hypothesis}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 px-5 py-4 border-t border-white/5">
                                {cs.stats.map((stat, j) => (
                                    <div key={j} className="flex-1">
                                        <p className="font-['Sora',sans-serif] font-bold text-[24px] tracking-[-0.02em]" style={{ color: stat.color }}>{stat.value}</p>
                                        <p className="font-['Sora',sans-serif] text-[11px] text-white/50">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="cs-scroll-container">
            <div className="cs-sticky-wrapper">
                {/* Spotlight — always covers full viewport */}
                <div className="cs-spotlight" />

                <div className="cs-content-box">
                    {isInView && (
                        <div
                            className="cs-content-scaler"
                            style={{
                                transform: `scale(${scale})`,
                                transformOrigin: 'center center',
                            }}
                        >
                            {/* Slides */}
                            <div className="cs-slides-clip">
                                <motion.div className="cs-slide-wrapper" style={{ opacity: slide1Opacity, y: slide1Y }}>
                                    <CaseStudy3 />
                                </motion.div>
                                <motion.div className="cs-slide-wrapper" style={{ opacity: slide2Opacity, y: slide2Y }}>
                                    <CaseStudy4 />
                                </motion.div>
                                <motion.div className="cs-slide-wrapper" style={{ opacity: slide3Opacity, y: slide3Y }}>
                                    <CaseStudy5 />
                                </motion.div>
                                <motion.div className="cs-slide-wrapper" style={{ opacity: slide4Opacity, y: slide4Y }}>
                                    <CaseStudy6 />
                                </motion.div>
                            </div>

                            {/* Ground Reflections */}
                            <motion.div
                                className="cs-ground-glow cs-ground-glow--left"
                                style={{ backgroundColor: barColor, x: leftBarX, skewX: leftSkew }}
                            />
                            <motion.div
                                className="cs-ground-glow cs-ground-glow--right"
                                style={{ backgroundColor: barColor, x: rightBarX, skewX: rightSkew }}
                            />

                            {/* Center floor ellipse */}
                            <motion.div className="cs-floor-ellipse" style={{ backgroundColor: barColor }} />

                            {/* Left Gate Bar */}
                            <motion.div
                                className="t-gate-wrapper t-gate-wrapper--left"
                                style={{ color: barColor, x: leftBarX }}
                            >
                                <div className="t-gate-blur-2" />
                                <div className="t-gate-blur-1" />
                                <div className="t-gate-core" />
                            </motion.div>

                            {/* Right Gate Bar */}
                            <motion.div
                                className="t-gate-wrapper t-gate-wrapper--right"
                                style={{ color: barColor, x: rightBarX }}
                            >
                                <div className="t-gate-blur-2" />
                                <div className="t-gate-blur-1" />
                                <div className="t-gate-core" />
                            </motion.div>

                            {/* Title Text */}
                            <motion.div
                                className="cs-title-text-gate"
                                style={{ opacity: titleOpacity, clipPath: titleClipPath, y: titleY }}
                            >
                                <div className="cs-title-inner">
                                    <p style={{ margin: 0 }}>CASE</p>
                                    <p style={{ margin: 0 }}>STUDIES</p>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </div>

                {/* Scroll Hint */}
                <motion.div
                    className="cs-scroll-hint"
                    style={{ opacity: scrollHintOpacity }}
                >
                    <div className="cs-scroll-hint-line" />
                    <span className="cs-scroll-hint-text">Scroll to Open</span>
                </motion.div>
            </div>
        </div>
    );
}

