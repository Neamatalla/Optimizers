import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionValueEvent, animate } from 'motion/react';
import { useLanguage } from '../app/contexts/LanguageContext';
import '../styles/case-studies-animations.css';

import CaseStudy3 from './CaseStudy3';
import CaseStudy4 from './CaseStudy4';
import CaseStudy5 from './CaseStudy5';
import CaseStudy6 from './CaseStudy6';

import CS_Squadio from './CS_Squadio';
import CS_RibalMagic from './CS_RibalMagic';
import CS_RegalHoney from './CS_RegalHoney';
import CS_VitrineFurniture from './CS_VitrineFurniture';


const CONTENT_WIDTH = 1440;
const CONTENT_HEIGHT = 935.24;
// Bars open to 3% from each edge of the 1440px content
const BAR_OPEN_PX = CONTENT_WIDTH / 2 - CONTENT_WIDTH * 0.03; // ~677px from center
// Bar width in px — used to bake centering into the motion x (CSS transform is overridden by motion)
const BAR_WIDTH = 12;

// One color per case study — matches the desktop barColor stops
const MOBILE_CARD_COLORS = ['#ff8979', '#6ae499', '#fcd34d', '#5a8cd6'];

export default function AnimatedCaseStudies() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mobileScrollRef = useRef<HTMLDivElement>(null);
    const { t } = useLanguage();

    // ── Mobile active slide (0-3 = case studies, -1 = before cards section) ──
    const [activeMobileSlide, setActiveMobileSlide] = useState(-1);
    // Ref to avoid stale closure in useMotionValueEvent
    const activeMobileSlideRef = useRef(-1);

    // ── Mobile detection ──
    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // ── Mobile scroll tracking ──
    const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 390);
    useEffect(() => {
        const updateVW = () => setViewportWidth(window.innerWidth);
        updateVW();
        window.addEventListener('resize', updateVW);
        return () => window.removeEventListener('resize', updateVW);
    }, []);

    const { scrollYProgress: mobileScrollProgress } = useScroll({
        target: mobileScrollRef,
        offset: ['start start', 'end end'],
    });
    // Container is 500vh. Total scroll = 400vh.
    //   0.00→0.10 : Gate bars open
    //   0.03→0.08 : Title fades in
    //   0.08→0.20 : Title holds
    //   0.20→0.28 : Title fades out; slide 0 fades in (cross-dissolve)
    //   0.40       : Slide 1 activates
    //   0.60       : Slide 2 activates
    //   0.80       : Slide 3 activates

    // Gate opens: 0.00→0.10
    const mobileGateProgress = useTransform(mobileScrollProgress, [0.00, 0.10], [0, 1]);

    // Title: fade in 0.03→0.08, hold 0.08→0.20, fade out 0.20→0.28
    const mobileTitleOpacity = useTransform(mobileScrollProgress, [0.03, 0.08, 0.20, 0.28], [0, 1, 1, 0]);
    const mobileTitleY = useTransform(mobileGateProgress, [0, 1], [60, 0]);
    const mobileTitleClipPct = useTransform(mobileGateProgress, [0, 1], [50, 0]);
    const mobileTitleClipPath = useTransform(mobileTitleClipPct, (v: number) => `inset(0 ${v}% 0 ${v}%)`);
    const mobileTitleScale = useTransform(mobileGateProgress, [0, 1], [0.9, 1]);

    // Gate bar positions — keep bars ~12px from each edge (mirrors desktop's 3% margin)
    const mobileBarOpenPx = viewportWidth / 2 - 12;
    const mobileLeftBarX = useTransform(mobileGateProgress, [0, 1], [0, -mobileBarOpenPx]);
    const mobileRightBarX = useTransform(mobileGateProgress, [0, 1], [0, mobileBarOpenPx]);

    // Gate bar opacity
    const mobileBarOpacity = useTransform(mobileScrollProgress, [0.00, 0.03], [0, 1]);

    // Cards container: always visible (no scroll-driven fade-in).
    // Gate bars at z-60 sit on top; the case study is visible underneath as bars open.
    // This matches desktop behavior where slides are always present behind the bars.
    const mobileCardsOpacity = useMotionValue(1);

    // Scroll hint visible briefly (0.00→0.06)
    const mobileScrollHintOpacity = useTransform(mobileScrollProgress, [0.00, 0.06], [1, 0]);

    // ── Mobile gate bar color — white during gate/title, then case-study color ──
    const mobileBarColor = useMotionValue('#ffffff');

    // Track active slide via scroll progress.
    // Slides start at 0.20 — cross-dissolving with title fade-out (0.20→0.28).
    // Distribute 4 slides evenly across 0.20 → 1.00 (range = 0.80, 0.25 per slide).
    useMotionValueEvent(mobileScrollProgress, 'change', (latest) => {
        let index = -1;
        if (latest > 0.20) {
            const progressRatio = (latest - 0.20) / 0.80;
            index = Math.min(Math.floor(progressRatio / 0.25), 3);
            index = Math.max(0, index);
        }
        if (index !== activeMobileSlideRef.current) {
            activeMobileSlideRef.current = index;
            setActiveMobileSlide(index);
        }
    });

    // Animate bar color when slide changes
    useEffect(() => {
        if (activeMobileSlide >= 0) {
            animate(mobileBarColor, MOBILE_CARD_COLORS[activeMobileSlide], { duration: 0.5, ease: 'easeInOut' });
        } else {
            animate(mobileBarColor, '#ffffff', { duration: 0.3, ease: 'easeInOut' });
        }
    }, [activeMobileSlide]);

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


    // ── Desktop slide triggering (scroll-driven) ──
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

    // Desktop slide motion values
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
        const DURATION = 0.5;
        const EASE = "easeInOut";

        slideOpacities.forEach((opacity, i) => {
            animate(opacity, i === activeIndex ? 1 : 0, { duration: DURATION, ease: EASE });
            const targetY = i < activeIndex ? '-30%' : (i > activeIndex ? '30%' : '0%');
            animate(slideYs[i], targetY, { duration: DURATION, ease: EASE });
        });
    }, [activeIndex, isMobile]);

    // Mobile slide motion values — all start invisible (dark background shows gate/title).
    // Slides fade in starting at progress 0.20 as title fades out.
    const mobileSlideYs = [
        useMotionValue('30%'),
        useMotionValue('30%'),
        useMotionValue('30%'),
        useMotionValue('30%'),
    ];

    const mobileSlideOpacities = [
        useMotionValue(0),
        useMotionValue(0),
        useMotionValue(0),
        useMotionValue(0),
    ];

    useEffect(() => {
        if (!isMobile) return;
        // Do nothing until a slide is activated — keep dark background until progress 0.20
        if (activeMobileSlide < 0) return;

        const DURATION = 0.5;
        const EASE = 'easeInOut';

        mobileSlideOpacities.forEach((opacity, i) => {
            animate(opacity, i === activeMobileSlide ? 1 : 0, { duration: DURATION, ease: EASE });
            const targetY = i < activeMobileSlide ? '-30%' : (i === activeMobileSlide ? '0%' : '30%');
            animate(mobileSlideYs[i], targetY, { duration: DURATION, ease: EASE });
        });
    }, [activeMobileSlide, isMobile]);

    const slide1Y = slideYs[0];
    const slide2Y = slideYs[1];
    const slide3Y = slideYs[2];
    const slide4Y = slideYs[3];

    const slide1Opacity = slideOpacities[0];
    const slide2Opacity = slideOpacities[1];
    const slide3Opacity = slideOpacities[2];
    const slide4Opacity = slideOpacities[3];

    const scrollHintOpacity = useTransform(roundedScroll, [0, 0.05], [1, 0]);


    // ══════ MOBILE: Scroll-driven case studies (exact mirror of desktop) ══════
    if (isMobile) {
        return (
            <div ref={mobileScrollRef} className="cs-mobile-scroll-container">
                <div className="cs-mobile-sticky-viewport">
                    {/* Vignette overlay */}
                    <div className="cs-mobile-vignette" />

                    {/* ── Ground Reflections ── */}
                    <motion.div
                        className="cs-mobile-ground-glow"
                        style={{ backgroundColor: mobileBarColor, x: mobileLeftBarX, opacity: mobileBarOpacity }}
                    />
                    <motion.div
                        className="cs-mobile-ground-glow"
                        style={{ backgroundColor: mobileBarColor, x: mobileRightBarX, opacity: mobileBarOpacity }}
                    />

                    {/* ── Floor Ellipse ── */}
                    <motion.div
                        className="cs-mobile-floor-ellipse"
                        style={{ backgroundColor: mobileBarColor, opacity: mobileBarOpacity }}
                    />

                    {/* ── Case Study Slides (scroll-driven, same as desktop) ── */}
                    <motion.div
                        className="cs-mobile-cards-container"
                        style={{ opacity: mobileCardsOpacity }}
                    >
                        <div className="cs-mobile-slides-clip">
                            <motion.div className="cs-mobile-slide-wrapper" style={{ opacity: mobileSlideOpacities[0], y: mobileSlideYs[0] }}>
                                <CS_Squadio />
                            </motion.div>
                            <motion.div className="cs-mobile-slide-wrapper" style={{ opacity: mobileSlideOpacities[1], y: mobileSlideYs[1] }}>
                                <CS_RibalMagic />
                            </motion.div>
                            <motion.div className="cs-mobile-slide-wrapper" style={{ opacity: mobileSlideOpacities[2], y: mobileSlideYs[2] }}>
                                <CS_RegalHoney />
                            </motion.div>
                            <motion.div className="cs-mobile-slide-wrapper" style={{ opacity: mobileSlideOpacities[3], y: mobileSlideYs[3] }}>
                                <CS_VitrineFurniture />
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* ── Gate Bars (3-div glow structure, same as desktop) ── */}
                    <motion.div
                        className="cs-mobile-gate-bar"
                        style={{ color: mobileBarColor, x: mobileLeftBarX, opacity: mobileBarOpacity }}
                    >
                        <div className="cs-mobile-gate-blur-2" />
                        <div className="cs-mobile-gate-blur-1" />
                        <div className="cs-mobile-gate-core" />
                    </motion.div>
                    <motion.div
                        className="cs-mobile-gate-bar"
                        style={{ color: mobileBarColor, x: mobileRightBarX, opacity: mobileBarOpacity }}
                    >
                        <div className="cs-mobile-gate-blur-2" />
                        <div className="cs-mobile-gate-blur-1" />
                        <div className="cs-mobile-gate-core" />
                    </motion.div>

                    {/* ── Title Text ── */}
                    <motion.div
                        className="cs-mobile-title-wrapper"
                        style={{
                            opacity: mobileTitleOpacity,
                            y: mobileTitleY,
                            clipPath: mobileTitleClipPath,
                            scale: mobileTitleScale,
                        }}
                    >
                        <div className="cs-mobile-title-inner">
                            <p>{t('CASE')}</p>
                            <p>{t('STUDIES')}</p>
                        </div>
                    </motion.div>

                    {/* ── Scroll Hint ── */}
                    <motion.div
                        className="cs-mobile-scroll-hint"
                        style={{ opacity: mobileScrollHintOpacity }}
                    >
                        <div className="cs-mobile-scroll-hint-line" />
                        <span className="cs-mobile-scroll-hint-text">{t('Scroll to Open')}</span>
                    </motion.div>
                </div>
            </div>
        );
    }

    // ══════ DESKTOP ══════
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
                                    <p style={{ margin: 0 }}>{t('CASE')}</p>
                                    <p style={{ margin: 0 }}>{t('STUDIES')}</p>
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
                    <span className="cs-scroll-hint-text">{t('Scroll to Open')}</span>
                </motion.div>
            </div>
        </div>
    );
}
