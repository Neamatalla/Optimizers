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
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1100);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // ── Viewport height ──
    const [viewportHeight, setViewportHeight] = useState(844);
    useEffect(() => {
        const update = () => setViewportHeight(window.innerHeight);
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

    const gateProgress_D   = useTransform(scrollYProgress, [0, 0.12], [0, 1]);
    const leftBarX_D       = useTransform(gateProgress_D, [0, 1], [-BAR_WIDTH / 2, -BAR_OPEN_PX - BAR_WIDTH / 2]);
    const rightBarX_D      = useTransform(gateProgress_D, [0, 1], [BAR_WIDTH / 2, BAR_OPEN_PX + BAR_WIDTH / 2]);
    const leftSkew_D       = useTransform(gateProgress_D, [0, 1], [0, -40]);
    const rightSkew_D      = useTransform(gateProgress_D, [0, 1], [0, 40]);
    const titleClipPct_D   = useTransform(gateProgress_D, [0, 1], [50, 3]);
    const titleClipPath_D  = useTransform(titleClipPct_D, (v: number) => `inset(0 ${v}% 0 ${v}%)`);
    const titleOpacity_D   = useTransform(scrollYProgress, [0, 0.06, 0.10, 0.15], [0, 1, 1, 0]);
    const titleY_D         = useTransform(gateProgress_D, [0, 1], ['40%', '0%']);
    const barColor_D       = useTransform(roundedScroll, [0.10, 0.20, 0.38, 0.62, 0.82], ['#ffffff', '#ff8979', '#6ae499', '#fcd34d', '#5a8cd6']);
    const scrollHintOpacity_D = useTransform(roundedScroll, [0, 0.05], [1, 0]);

    // Desktop slides states
    const slideYs       = [useMotionValue('30%'), useMotionValue('30%'), useMotionValue('30%'), useMotionValue('30%')];
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
    // MOBILE TIMED OPENING — Triggered by scroll
    // ══════════════════════════════════════════════════════
    const { scrollYProgress: mobileScrollProgress } = useScroll({
        target: mobileContainerRef,
        offset: ["start start", "end end"]
    });

    const smoothProgress_M = useSpring(mobileScrollProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

    const [hasOpened, setHasOpened] = useState(false);
    
    // Motion Values for timed animation
    const gateY_Top_Time = useMotionValue(0);
    const gateY_Bot_Time = useMotionValue(0);
    const gateOpacity_Time = useMotionValue(1);
    const titleOpacity_Time = useMotionValue(0);
    const titleScale_Time = useMotionValue(0.85);
    const titleClip_Time = useMotionValue("inset(50% 0 50% 0)");

    // Trigger Logic
    useMotionValueEvent(mobileScrollProgress, "change", (v) => {
        if (!isMobile) return;
        if (v > 0.02 && !hasOpened) {
            setHasOpened(true);
            
            // 1. Gate Opens (Timed)
            animate(gateY_Top_Time, -viewportHeight * 0.55, { duration: 0.8, ease: [0.33, 1, 0.68, 1] });
            animate(gateY_Bot_Time, viewportHeight * 0.55, { duration: 0.8, ease: [0.33, 1, 0.68, 1] });
            animate(gateOpacity_Time, 0, { delay: 0.8, duration: 0.4 });

            // 2. Title Sequence (Timed & Staggered)
            animate(titleOpacity_Time, 1, { delay: 0.5, duration: 0.6 });
            animate(titleScale_Time, 1, { delay: 0.5, duration: 0.6 });
            animate(titleClip_Time, "inset(0% 0 0% 0)", { delay: 0.5, duration: 0.8 });
            
            // 3. Title Fades (After it's seen)
            animate(titleOpacity_Time, 0, { delay: 1.8, duration: 0.5 });
        }
        
        // Optionally reset if they scroll back to absolute top
        if (v < 0.01 && hasOpened) {
            setHasOpened(false);
            animate(gateY_Top_Time, 0, { duration: 0.5 });
            animate(gateY_Bot_Time, 0, { duration: 0.5 });
            animate(gateOpacity_Time, 1, { duration: 0.3 });
            animate(titleOpacity_Time, 0, { duration: 0.3 });
            animate(titleClip_Time, "inset(50% 0 50% 0)", { duration: 0.1 });
        }
    });

    // 3. CASE STUDY SLIDES (Scroll-based starting at 0.15)
    // Slide 1: 0.15 -> 0.35
    const s1Opacity = useTransform(smoothProgress_M, [0.15, 0.20, 0.30, 0.35], [0, 1, 1, 0]);
    const s1Y       = useTransform(smoothProgress_M, [0.15, 0.20, 0.30, 0.35], ["15%", "0%", "0%", "-15%"]);
    
    // Slide 2: 0.36 -> 0.56
    const s2Opacity = useTransform(smoothProgress_M, [0.36, 0.41, 0.51, 0.56], [0, 1, 1, 0]);
    const s2Y       = useTransform(smoothProgress_M, [0.36, 0.41, 0.51, 0.56], ["15%", "0%", "0%", "-15%"]);
    
    // Slide 3: 0.57 -> 0.77
    const s3Opacity = useTransform(smoothProgress_M, [0.57, 0.62, 0.72, 0.77], [0, 1, 1, 0]);
    const s3Y       = useTransform(smoothProgress_M, [0.57, 0.62, 0.72, 0.77], ["15%", "0%", "0%", "-15%"]);
    
    // Slide 4: 0.78 -> 1.0
    const s4Opacity = useTransform(smoothProgress_M, [0.78, 0.83, 0.98, 1.0], [0, 1, 1, 1]);
    const s4Y       = useTransform(smoothProgress_M, [0.78, 0.83, 0.98, 1.0], ["15%", "0%", "0%", "0%"]);

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
                        <motion.div className="cs-mobile-slide-wrapper" style={{ opacity: s1Opacity, y: s1Y }}>
                            <CS_Squadio />
                        </motion.div>
                        <motion.div className="cs-mobile-slide-wrapper" style={{ opacity: s2Opacity, y: s2Y }}>
                            <CS_RibalMagic />
                        </motion.div>
                        <motion.div className="cs-mobile-slide-wrapper" style={{ opacity: s3Opacity, y: s3Y }}>
                            <CS_RegalHoney />
                        </motion.div>
                        <motion.div className="cs-mobile-slide-wrapper" style={{ opacity: s4Opacity, y: s4Y }}>
                            <CS_VitrineFurniture />
                        </motion.div>
                    </div>

                    <motion.div
                        className="cs-mobile-gate-bar"
                        style={{
                            y: gateY_Top_Time,
                            opacity: gateOpacity_Time,
                            backgroundColor: '#ffffff',
                            width: '100vw',
                            height: '12px',
                            left: 0,
                            top: '50%',
                            marginTop: '-16px',
                            zIndex: 100,
                        }}
                    >
                        <div style={{ position: 'absolute', inset: 0, background: 'white', boxShadow: '0 0 15px rgba(255,255,255,0.4)' }} />
                    </motion.div>

                    <motion.div
                        className="cs-mobile-gate-bar"
                        style={{
                            y: gateY_Bot_Time,
                            opacity: gateOpacity_Time,
                            backgroundColor: '#ffffff',
                            width: '100vw',
                            height: '12px',
                            left: 0,
                            top: '50%',
                            marginTop: '-16px',
                            zIndex: 100,
                        }}
                    >
                        <div style={{ position: 'absolute', inset: 0, background: 'white', boxShadow: '0 0 15px rgba(255,255,255,0.4)' }} />
                    </motion.div>

                    <motion.div
                        className="cs-mobile-title-wrapper"
                        style={{
                            opacity: titleOpacity_Time,
                            scale: titleScale_Time,
                            clipPath: titleClip_Time,
                            zIndex: 80
                        }}
                    >
                        <h2 className="cs-mobile-headline">
                            CASE STUDIES
                        </h2>
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

                                <motion.div className="cs-ground-glow cs-ground-glow--left"  style={{ backgroundColor: barColor_D, x: leftBarX_D,  skewX: leftSkew_D  }} />
                                <motion.div className="cs-ground-glow cs-ground-glow--right" style={{ backgroundColor: barColor_D, x: rightBarX_D, skewX: rightSkew_D }} />
                                <motion.div className="cs-floor-ellipse" style={{ backgroundColor: barColor_D }} />

                                <motion.div className="t-gate-wrapper t-gate-wrapper--left"  style={{ color: barColor_D, x: leftBarX_D  }}>
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
