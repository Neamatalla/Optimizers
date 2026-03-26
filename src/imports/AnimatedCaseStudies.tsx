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
        if (v > 0.15 && v < 0.85) {
            idx = Math.min(Math.floor(((v - 0.15) / 0.70) * 4), 3);
            idx = Math.max(0, idx);
        }
        if (idx !== activeIndex) setActiveIndex(idx);
    });

    const gateProgress_D = useTransform(scrollYProgress, [0, 0.12, 0.88, 1], [0, 1, 1, 0]);
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
        // Remove activeIndex < 0 return to allow cleaning up visible slides
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

    // Gate Animation States
    const [gateIsTriggered, setGateIsTriggered] = useState(false);
    
    const gateY_Top_Time = useMotionValue(0);
    const gateY_Bot_Time = useMotionValue(0);
    const gateOpacity_Time = useMotionValue(1);
    const titleOpacity_Time = useMotionValue(1); // Start visible
    const titleScale_Time   = useMotionValue(1); // Start at normal scale
    const titleClip_Time    = useMotionValue("inset(0% 0 0% 0)"); // Start fully unclipped
    const barMidColor_M     = useMotionValue('#ffffff');

    // 3. CASE STUDY SLIDES (Controlled by activeMobileIndex_M)
    const [activeMobileIndex_M, setActiveMobileIndex_M] = useState(-1);
    const mSlideOpacities = [useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0)];

    const scaleValue = useMotionValue(typeof window !== 'undefined' ? Math.min(1, (window.innerHeight - 60) / 680) : 1);
    const smoothScale = useSpring(scaleValue, { stiffness: 50, damping: 20 });
    const [mobileScale, setMobileScale] = useState(() => typeof window !== 'undefined' ? Math.min(1, (window.innerHeight - 60) / 680) : 1);
    const lastScaleWidthRef = useRef(0);

    const getStatus = (i: number) => {
        if (i === activeMobileIndex_M) return 'active';
        if (i < activeMobileIndex_M) return 'past';
        return 'future';
    };

    const slideComponents_M = [
        <CS_Squadio key="squadio" contentScale={mobileScale} status={getStatus(0)} />,
        <CS_RibalMagic key="ribal" contentScale={mobileScale} status={getStatus(1)} />,
        <CS_RegalHoney key="regal" contentScale={mobileScale} status={getStatus(2)} />,
        <CS_VitrineFurniture key="vitrine" contentScale={mobileScale} status={getStatus(3)} />
    ];

    useEffect(() => {
        const update = () => {
            const currentWidth = window.innerWidth;
            if (currentWidth !== lastScaleWidthRef.current) {
                lastScaleWidthRef.current = currentWidth;
                const BASE_MOBILE_HEIGHT = 680;
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

    // ── Arrow-based Navigation Logic (Mobile) ──
    const handleNextMobile = () => {
        setActiveMobileIndex_M((prev) => (prev < 3 ? prev + 1 : 0));
    };
    const handlePrevMobile = () => {
        setActiveMobileIndex_M((prev) => (prev > 0 ? prev - 1 : 3));
    };

    // Gate trigger: fires when 50% of the section enters viewport
    useEffect(() => {
        if (!isMobile) return;
        const el = mobileContainerRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !gateIsTriggered) {
                    setGateIsTriggered(true);
                }
            },
            { threshold: 0.5 } // Fired when 50% of the section is visible
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [isMobile, gateIsTriggered]);

    // Handle gate animation
    useEffect(() => {
        if (!isMobile) return;
        if (gateIsTriggered) {

            // Gate opening (1.5s total as requested)
            animate(gateY_Top_Time, -viewportHeight * 0.6, { duration: 1.5, ease: 'easeInOut' });
            animate(gateY_Bot_Time, viewportHeight * 0.6, { duration: 1.5, ease: 'easeInOut' });
            
            // Fade out title
            animate(titleOpacity_Time, 0, { duration: 0.5, delay: 0.5, ease: 'easeIn' });
            animate(titleScale_Time, 0.9, { duration: 0.5, delay: 0.5, ease: 'easeIn' });

            // Fade out gate core near the end
            animate(gateOpacity_Time, 0, { duration: 0.5, delay: 1.0, ease: 'easeIn' });

            // Show first slide after animation completes
            const t = setTimeout(() => {
                setActiveMobileIndex_M(0);
            }, 1500);
            return () => clearTimeout(t);
        }
    }, [gateIsTriggered, isMobile, viewportHeight]);

    // Handle slide element translations (Top Clients style)
    useEffect(() => {
        const D = 1.0, E = 'easeInOut';
        mSlideOpacities.forEach((op, i) => {
            const isActive = i === activeMobileIndex_M;
            // Backgrounds fade in/out
            animate(op, isActive ? 1 : 0, { duration: D, ease: E });
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
                        {slideComponents_M.map((SlideComponent: React.ReactNode, i: number) => (
                            <motion.div key={i} className="cs-mobile-slide-wrapper" style={{ opacity: mSlideOpacities[i] }}>
                                {SlideComponent}
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        className="cs-mobile-gate-bar"
                        style={{
                            y: gateY_Top_Time,
                            opacity: gateOpacity_Time,
                            color: barMidColor_M,
                            zIndex: 130, // Higher than title to hide it
                        }}
                    >
                        {/* Top wing to hide content above the bar */}
                        <div style={{ position: 'absolute', bottom: '5px', left: 0, right: 0, height: '100vh', background: '#020601', zIndex: -1 }} />
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
                            zIndex: 130, // Higher than title to hide it
                        }}
                    >
                        {/* Bottom wing to hide content below the bar */}
                        <div style={{ position: 'absolute', top: '5px', left: 0, right: 0, height: '100vh', background: '#020601', zIndex: -1 }} />
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
                            zIndex: 120 // Between slides (20) and gates (130)
                        }}
                    >
                        <div className="cs-mobile-title-inner">
                            <p>{t('CASE')}</p>
                            <p>{t('STUDIES')}</p>
                        </div>
                    </motion.div>

                    {/* Scroll hint removed - Gate opens automatically, navigation is via arrows */}

                    {/* Next/Prev Arrows (visible when slides are active) */}
                    {(() => {
                        const mColors = ['#ff8979', '#6ae499', '#fcd34d', '#87a2cf'];
                        const activeColor = mColors[activeMobileIndex_M] || '#ffffff';
                        const hoverBg = `${activeColor}33`; // 20% opacity background
                        
                        return (
                        <div 
                            className={`cs-mobile-arrows-container flex items-center justify-between pt-5 ${t('dir') === 'rtl' ? 'flex-row-reverse' : ''}`}
                            style={{ 
                                position: 'absolute', 
                                bottom: '0', 
                                width: '90%', 
                                display: activeMobileIndex_M >= 0 ? 'flex' : 'none', 
                                zIndex: 200, 
                                left: '50%', 
                                transform: 'translateX(-50%)',
                                pointerEvents: 'auto'
                            }}
                        >
                            <button
                                onClick={handlePrevMobile}
                                className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95"
                                style={{ 
                                    backgroundColor: hoverBg, 
                                    border: `1px solid ${activeColor}60`,
                                    color: activeColor,
                                    backdropFilter: 'blur(10px)', 
                                    transition: 'background-color 600ms ease, border-color 600ms ease, color 600ms ease, transform 200ms ease'
                                }}
                                aria-label="Previous slide"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                            </button>

                            <div className="flex gap-2" style={{ transform: 'translateY(5px)' }}>
                                {[0, 1, 2, 3].map((i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveMobileIndex_M(i)}
                                        className="rounded-full transition-all duration-300"
                                        style={{
                                            width: i === activeMobileIndex_M ? '20px' : '8px',
                                            height: '8px',
                                            background: i === activeMobileIndex_M ? activeColor : 'rgba(255,255,255,0.2)',
                                            transition: 'width 400ms ease, background 600ms ease',
                                        }}
                                        aria-label={`Go to slide ${i + 1}`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleNextMobile}
                                className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95"
                                style={{ 
                                    backgroundColor: hoverBg, 
                                    border: `1px solid ${activeColor}60`,
                                    color: activeColor,
                                    backdropFilter: 'blur(10px)', 
                                    transition: 'background-color 600ms ease, border-color 600ms ease, color 600ms ease, transform 200ms ease'
                                }}
                                aria-label="Next slide"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>
                        );
                    })()}
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
