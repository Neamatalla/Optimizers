import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionValueEvent, animate } from 'framer-motion';
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
const BAR_OPEN_PX = CONTENT_WIDTH / 2 - CONTENT_WIDTH * 0.03;
const BAR_WIDTH = 12;

export default function AnimatedCaseStudies() {
    // ── Refs ──
    const desktopRef = useRef<HTMLDivElement>(null);
    const mobileContainerRef = useRef<HTMLDivElement>(null);
    const { t } = useLanguage();

    // ── Mobile detection ──
    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 1100 : false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1100);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // ── Viewport height (Stabilized for mobile address bar jitter) ──
    const [viewportHeight, setViewportHeight] = useState(() => typeof window !== 'undefined' ? window.innerHeight : 844);
    const lastWidthRef = useRef(0);

    useEffect(() => {
        const update = () => {
            const currentWidth = window.innerWidth;
            if (currentWidth !== lastWidthRef.current) {
                lastWidthRef.current = currentWidth;
                setViewportHeight(window.innerHeight);
            }
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    // ══════════════════════════════════════════════════════
    // DESKTOP scroll logic
    // ══════════════════════════════════════════════════════
    const { scrollYProgress } = useScroll({
        target: desktopRef,
        offset: ['start 0.4', 'end end'],
    });

    const roundedScroll = useSpring(scrollYProgress, {
        stiffness: 25,
        damping: 18,
        restDelta: 0.001,
    });

    const [activeIndex, setActiveIndex] = useState(-1);
    useMotionValueEvent(scrollYProgress, 'change', (v) => {
        if (isMobile) return;
        let idx = -1;
        if (v > 0.15) {
            idx = Math.min(Math.floor(((v - 0.15) / 0.85) / 0.25), 3);
            idx = Math.max(0, idx);
        }
        if (idx !== activeIndex) setActiveIndex(idx);
    });

    const gateProgress_D = useTransform(scrollYProgress, [0, 0.12], [0, 1]);
    const leftBarX_D = useTransform(gateProgress_D, [0, 1], [-BAR_WIDTH / 2, -BAR_OPEN_PX - BAR_WIDTH / 2]);
    const rightBarX_D = useTransform(gateProgress_D, [0, 1], [BAR_WIDTH / 2, BAR_OPEN_PX + BAR_WIDTH / 2]);
    const leftSkew_D = useTransform(gateProgress_D, [0, 1], [0, -40]);
    const rightSkew_D = useTransform(gateProgress_D, [0, 1], [0, 40]);
    const titleClipPct_D = useTransform(gateProgress_D, [0, 1], [50, 3]);
    const titleClipPath_D = useTransform(titleClipPct_D, (v: number) => `inset(0 ${v}% 0 ${v}%)`);
    const titleOpacity_D = useTransform(scrollYProgress, [0, 0.06, 0.10, 0.15], [0, 1, 1, 0]);
    const titleY_D = useTransform(gateProgress_D, [0, 1], ['40%', '0%']);
    const barColor_D = useTransform(roundedScroll, [0.10, 0.20, 0.38, 0.62, 0.82], ['#ffffff', '#ff8979', '#6ae499', '#fcd34d', '#5a8cd6']);
    const scrollHintOpacity_D = useTransform(roundedScroll, [0, 0.05], [1, 0]);

    // Desktop slides states
    const slideYs = [useMotionValue('30%'), useMotionValue('30%'), useMotionValue('30%'), useMotionValue('30%')];
    const slideOpacities = [useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0)];
    useEffect(() => {
        if (activeIndex < 0) return;
        const D = 1.0, E = 'easeInOut';
        slideOpacities.forEach((op, i) => {
            animate(op, i === activeIndex ? 1 : 0, { duration: D, ease: E });
            animate(slideYs[i], i < activeIndex ? '-30%' : i > activeIndex ? '30%' : '0%', { duration: D, ease: E });
        });
    }, [activeIndex]);

    const [desktopScale, setDesktopScale] = useState(1);
    const [isInView, setIsInView] = useState(false);
    useEffect(() => {
        const update = () => {
            if (window.innerWidth < 1100) { setDesktopScale(1); return; }
            setDesktopScale(Math.min(window.innerWidth / CONTENT_WIDTH, window.innerHeight / CONTENT_HEIGHT, 1));
        };
        update();
        const obs = new IntersectionObserver(([e]) => setIsInView(e.isIntersecting), { threshold: 0.01 });
        if (desktopRef.current) obs.observe(desktopRef.current);
        window.addEventListener('resize', update);
        return () => { window.removeEventListener('resize', update); obs.disconnect(); };
    }, []);

    // ══════════════════════════════════════════════════════
    // MOBILE SCROLL-DRIVEN ANIMATION
    // ══════════════════════════════════════════════════════
    const { scrollYProgress: mobileScrollProgress } = useScroll({
        target: mobileContainerRef,
        offset: ["start 0.6", "end end"]
    });

    const smoothProgress_M = useSpring(mobileScrollProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

    // 1. GATE BARS: Open from 0.0 to 0.10
    const gateY_Top_Time = useTransform(smoothProgress_M, [0, 0.10], [0, -viewportHeight * 0.6]);
    const gateY_Bot_Time = useTransform(smoothProgress_M, [0, 0.10], [0, viewportHeight * 0.6]);
    const gateOpacity_Time = useTransform(smoothProgress_M, [0.06, 0.10], [1, 0]);

    // 2. TITLE: Reveal 0.02->0.08, fade-out 0.10->0.14
    const titleOpacity_Time = useTransform(smoothProgress_M, [0.02, 0.08, 0.10, 0.14], [0, 1, 1, 0]);
    const titleScale_Time   = useTransform(smoothProgress_M, [0.02, 0.08], [0.85, 1]);
    const titleClip_Time    = useTransform(smoothProgress_M, [0, 0.08], ["inset(40% 0 40% 0)", "inset(0% 0 0% 0)"]);
    const barMidColor_M     = useTransform(smoothProgress_M, [0.15, 0.35, 0.55, 0.75, 0.90], ['#ffffff', '#ff8979', '#6ae499', '#fcd34d', '#5a8cd6']);


    // 3. CASE STUDY SLIDES (Scroll-Triggered + Responsive Scaling)
    const [activeMobileIndex_M, setActiveMobileIndex_M] = useState(-1);
    const mSlideOpacities = [useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0)];
    const mSlideYs = [useMotionValue('15%'), useMotionValue('15%'), useMotionValue('15%'), useMotionValue('15%')];

    const scaleValue = useMotionValue(typeof window !== 'undefined' ? Math.min(1, (window.innerHeight - 60) / 800) : 1);
    const smoothScale = useSpring(scaleValue, { stiffness: 50, damping: 20 });
    const [mobileScale, setMobileScale] = useState(() => typeof window !== 'undefined' ? Math.min(1, (window.innerHeight - 60) / 800) : 1);
    const lastScaleWidthRef = useRef(0);

    useEffect(() => {
        const update = () => {
            const currentWidth = window.innerWidth;
            if (currentWidth !== lastScaleWidthRef.current) {
                lastScaleWidthRef.current = currentWidth;
                const BASE_MOBILE_HEIGHT = 800;
                const newScale = Math.min(1, (window.innerHeight - 60) / BASE_MOBILE_HEIGHT);
                scaleValue.set(newScale);
            }
        };
        update();
        window.addEventListener('resize', update);
        const unsubscribe = smoothScale.on("change", (v) => setMobileScale(v));
        return () => {
            window.removeEventListener('resize', update);
            unsubscribe();
        };
    }, [smoothScale, scaleValue]);

    useMotionValueEvent(mobileScrollProgress, 'change', (v) => {
        let idx = -1;
        // Adjusted thresholds for exact 20% bands:
        // 0.15-0.35 (Slide 1), 0.35-0.55 (Slide 2), 0.55-0.75 (Slide 3), 0.75-1.0 (Slide 4)
        if (v > 0.15 && v <= 0.35) idx = 0;
        else if (v > 0.35 && v <= 0.55) idx = 1;
        else if (v > 0.55 && v <= 0.75) idx = 2;
        else if (v > 0.75) idx = 3;
        
        if (idx !== activeMobileIndex_M) {
            setActiveMobileIndex_M(idx);
        }
    });

    // ── Strict 1-Slide-Per-Scroll Logic (Mobile) ──
    const isSnappingRef = useRef(false);
    const startYRef = useRef(0);
    const lastVRef = useRef(0);
    useMotionValueEvent(mobileScrollProgress, 'change', (v) => { lastVRef.current = v; });

    useEffect(() => {
        if (!isMobile || !mobileContainerRef.current) return;

        const handleTouchStart = (e: TouchEvent) => {
            startYRef.current = e.touches[0].clientY;
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (isSnappingRef.current) return;
            
            const deltaY = startYRef.current - e.changedTouches[0].clientY;
            const direction = deltaY > 0 ? 'down' : 'up';
            const v = lastVRef.current;
            
            // ── Boundary Logic (Exit Allowed) ──
            // Case 1: Scrolling down past the last slide -> allow normal scroll
            if (direction === 'down' && v > 0.78) return;
            // Case 2: Scrolling up past the first slide -> allow normal scroll
            // Widened to 0.25 to make exiting from Squadio (Slide 1) effortless
            if (direction === 'up' && v < 0.25) return;

            // ── Snap Logic (One Slide Per Scroll) ──
            if (Math.abs(deltaY) > 40) { // Threshold for swipe
                let targetV = -1;
                
                if (direction === 'down') {
                    // Slide thresholds (starts): 0.15 (S1), 0.35 (S2), 0.55 (S3), 0.75 (S4)
                    if (v < 0.15) targetV = 0.15;
                    else if (v < 0.35) targetV = 0.35;
                    else if (v < 0.55) targetV = 0.55;
                    else if (v < 0.75) targetV = 0.75;
                } else {
                    if (v > 0.75) targetV = 0.55;
                    else if (v > 0.55) targetV = 0.35;
                    else if (v > 0.35) targetV = 0.15;
                    // No targetV for v < 0.35 means we fall through and allow free scroll up
                }

                if (targetV !== -1) {
                    isSnappingRef.current = true;
                    // Calculate absolute scroll position for targetV
                    const rect = mobileContainerRef.current.getBoundingClientRect();
                    const containerTop = rect.top + window.pageYOffset;
                    const containerHeight = rect.height;
                    const offsetStart = containerHeight * 0.6 * -1; // Mirroring start 0.6 offset
                    // Actually useScroll offset start 0.6 means v=0 is when start of section is 60% down viewport
                    
                    // Simple approach: animate to target v using motion value?
                    // Better: use window.scrollTo calculation
                    // Fix: Use containerTop (absolute) instead of offsetTop (relative)
                    const currentTargetY = containerTop + (targetV * containerHeight);
                    
                    animate(window.scrollY, currentTargetY, {
                        type: 'spring',
                        stiffness: 45,
                        damping: 20,
                        onUpdate: (latest) => window.scrollTo(0, latest),
                        onComplete: () => { isSnappingRef.current = false; }
                    });
                }
            }
        };

        const container = mobileContainerRef.current;
        container.addEventListener('touchstart', handleTouchStart);
        container.addEventListener('touchend', handleTouchEnd);
        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isMobile, activeMobileIndex_M]);

    useEffect(() => {
        // Updated to 2 seconds as requested by the user
        const D = 2.0, E = 'easeInOut';
        mSlideOpacities.forEach((op, i) => {
            const isActive = i === activeMobileIndex_M;
            const isPast = i < activeMobileIndex_M;
            
            animate(op, isActive ? 1 : 0, { duration: D, ease: E });
            animate(mSlideYs[i], isActive ? '0%' : isPast ? '-15%' : '15%', { duration: D, ease: E });
        });
    }, [activeMobileIndex_M]);

    const hintOpacity_M = useTransform(mobileScrollProgress, [0, 0.05], [1, 0]);

    // ══════════════════════════════════════════════════════
    // UNIFIED RENDER
    // ══════════════════════════════════════════════════════
    return (
        <div className="cs-unified-wrapper" style={{ position: 'relative', width: '100%' }}>
            {/* ── MOBILE VIEW ── */}
            <div
                ref={mobileContainerRef}
                className={`cs-mobile-scroll-container ${!isMobile ? 'cs-hidden' : ''}`}
                style={{ display: isMobile ? 'block' : 'none' }}
            >
                <div className="cs-mobile-sticky-viewport">
                    <div className="cs-mobile-vignette" />

                    <div className="cs-mobile-slides-clip">
                        <motion.div className="cs-mobile-slide-wrapper" style={{ opacity: mSlideOpacities[0], y: mSlideYs[0] }}>
                            <CS_Squadio contentScale={mobileScale} />
                        </motion.div>
                        <motion.div className="cs-mobile-slide-wrapper" style={{ opacity: mSlideOpacities[1], y: mSlideYs[1] }}>
                            <CS_RibalMagic contentScale={mobileScale} />
                        </motion.div>
                        <motion.div className="cs-mobile-slide-wrapper" style={{ opacity: mSlideOpacities[2], y: mSlideYs[2] }}>
                            <CS_RegalHoney contentScale={mobileScale} />
                        </motion.div>
                        <motion.div className="cs-mobile-slide-wrapper" style={{ opacity: mSlideOpacities[3], y: mSlideYs[3] }}>
                            <CS_VitrineFurniture contentScale={mobileScale} />
                        </motion.div>
                    </div>

                    <motion.div
                        className="cs-mobile-gate-bar"
                        style={{
                            y: gateY_Top_Time,
                            opacity: gateOpacity_Time,
                            color: barMidColor_M,
                            zIndex: 100,
                        }}
                    >
                        <div className="cs-mobile-gate-blur-2" />
                        <div className="cs-mobile-gate-blur-1" />
                        <div className="cs-mobile-gate-core" />
                    </motion.div>

                    <motion.div
                        className="cs-mobile-gate-bar"
                        style={{
                            y: gateY_Bot_Time,
                            opacity: gateOpacity_Time,
                            color: barMidColor_M,
                            zIndex: 100,
                        }}
                    >
                        <div className="cs-mobile-gate-blur-2" />
                        <div className="cs-mobile-gate-blur-1" />
                        <div className="cs-mobile-gate-core" />
                    </motion.div>

                    <motion.div
                        className="cs-mobile-title-wrapper"
                        style={{
                            opacity: titleOpacity_Time,
                            scale: titleScale_Time,
                            clipPath: titleClip_Time,
                            zIndex: 110
                        }}
                    >
                        <div className="cs-mobile-title-inner">
                            <p>{t('CASE')}</p>
                            <p>{t('STUDIES')}</p>
                        </div>
                    </motion.div>

                    <motion.div className="cs-mobile-scroll-hint" style={{ opacity: hintOpacity_M }}>
                        <div className="cs-hint-mouse">
                            <div className="cs-hint-wheel" />
                        </div>
                        <span className="cs-hint-text">SCROLL TO UNFOLD</span>
                    </motion.div>
                </div>
            </div>

            {/* ── DESKTOP VIEW (managed by CSS visibility) ── */}
            <div
                ref={desktopRef}
                className={`cs-scroll-container ${isMobile ? 'cs-hidden' : ''}`}
                style={{ display: !isMobile ? 'block' : 'none' }}
            >
                <div className="cs-sticky-wrapper">
                    <div className="cs-spotlight" />
                    <div className="cs-content-box">
                        {isInView && (
                            <div
                                className="cs-content-scaler"
                                style={{ transform: `scale(${desktopScale})`, transformOrigin: 'center center' }}
                            >
                                <div className="cs-slides-clip">
                                    <motion.div className="cs-slide-wrapper" style={{ opacity: slideOpacities[0], y: slideYs[0] }}>
                                        <CaseStudy3 />
                                    </motion.div>
                                    <motion.div className="cs-slide-wrapper" style={{ opacity: slideOpacities[1], y: slideYs[1] }}>
                                        <CaseStudy4 />
                                    </motion.div>
                                    <motion.div className="cs-slide-wrapper" style={{ opacity: slideOpacities[2], y: slideYs[2] }}>
                                        <CaseStudy5 />
                                    </motion.div>
                                    <motion.div className="cs-slide-wrapper" style={{ opacity: slideOpacities[3], y: slideYs[3] }}>
                                        <CaseStudy6 />
                                    </motion.div>
                                </div>

                                <motion.div className="cs-ground-glow cs-ground-glow--left" style={{ backgroundColor: barColor_D, x: leftBarX_D, skewX: leftSkew_D }} />
                                <motion.div className="cs-ground-glow cs-ground-glow--right" style={{ backgroundColor: barColor_D, x: rightBarX_D, skewX: rightSkew_D }} />
                                <motion.div className="cs-floor-ellipse" style={{ backgroundColor: barColor_D }} />

                                <motion.div className="t-gate-wrapper t-gate-wrapper--left" style={{ color: barColor_D, x: leftBarX_D }}>
                                    <div className="t-gate-blur-2" /><div className="t-gate-blur-1" /><div className="t-gate-core" />
                                </motion.div>
                                <motion.div className="t-gate-wrapper t-gate-wrapper--right" style={{ color: barColor_D, x: rightBarX_D }}>
                                    <div className="t-gate-blur-2" /><div className="t-gate-blur-1" /><div className="t-gate-core" />
                                </motion.div>

                                <motion.div className="cs-title-text-gate" style={{ opacity: titleOpacity_D, clipPath: titleClipPath_D, y: titleY_D }}>
                                    <div className="cs-title-inner">
                                        <p style={{ margin: 0 }}>{t('CASE')}</p>
                                        <p style={{ margin: 0 }}>{t('STUDIES')}</p>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </div>

                    <motion.div className="cs-scroll-hint" style={{ opacity: scrollHintOpacity_D }}>
                        <div className="cs-scroll-hint-line" />
                        <span className="cs-scroll-hint-text">{t('Scroll to Open')}</span>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
