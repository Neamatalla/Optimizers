import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, useMotionValue, useMotionValueEvent, animate, AnimatePresence } from 'motion/react';
import '../styles/case-studies-animations.css';

import CaseStudy3 from './CaseStudy3';
import CaseStudy4 from './CaseStudy4';
import CaseStudy5 from './CaseStudy5';
import CaseStudy6 from './CaseStudy6';

import Component414 from './Component414';
import CS_Squadio from './CS_Squadio';
import CS_RibalMagic from './CS_RibalMagic';
import CS_RegalHoney from './CS_RegalHoney';
import CS_VitrineFurniture from './CS_VitrineFurniture';

const TimerTrigger = ({ isOpened, onComplete }: { isOpened: boolean, onComplete: () => void }) => {
    useEffect(() => {
        if (isOpened) {
            const timer = setTimeout(onComplete, 6000);
            return () => clearTimeout(timer);
        }
    }, [isOpened, onComplete]);
    return null;
};

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

    // ── Mobile State ──
    const [isOpened, setIsOpened] = useState(false);
    const [isGateComplete, setIsGateComplete] = useState(false);
    const [activeMobileIndex, setActiveMobileIndex] = useState(0);

    const mobileComponents = [
        CS_Squadio,
        CS_RibalMagic,
        CS_RegalHoney,
        CS_VitrineFurniture,
    ];

    const handleMobileNext = () => {
        setActiveMobileIndex((prev) => (prev + 1) % mobileComponents.length);
    };

    const handleMobilePrev = () => {
        setActiveMobileIndex((prev) => (prev - 1 + mobileComponents.length) % mobileComponents.length);
    };

    const ActiveMobileComponent = mobileComponents[activeMobileIndex];

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

    // ══════ MOBILE: Interactive mobile case studies ══════
    if (isMobile) {
        return (
            <div className="min-h-screen flex flex-col items-center bg-[#020601] overflow-hidden">
                <div className="w-full h-[100dvh] relative flex flex-col items-center justify-center shrink-0">
                    
                    {/* Gate and Title Section */}
                    <AnimatePresence>
                        {!isGateComplete && (
                            <motion.div 
                                className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden"
                                onMouseEnter={() => setIsOpened(true)}
                                onTouchStart={() => setIsOpened(true)}
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                            >
                                <Component414 isOpened={isOpened} setIsOpened={setIsOpened} />
                                
                                {/* Timer for switching to carousel */}
                                <TimerTrigger isOpened={isOpened} onComplete={() => setIsGateComplete(true)} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Content Section (Carousel) */}
                    <AnimatePresence mode="wait">
                        {isGateComplete && (
                            <motion.div
                                key={activeMobileIndex}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="absolute inset-0"
                            >
                                <ActiveMobileComponent onNext={handleMobileNext} onPrev={handleMobilePrev} />
                            </motion.div>
                        )}
                    </AnimatePresence>
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

