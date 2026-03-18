import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import {
    BackgroundLayer,
    HeroTextLayer,
    MobileHeroContent,
    TabletLayer,
    MobileTabletLayer,
    HeaderNav,
} from "./Frame2147223128";

const CANVAS_WIDTH = 1440;
const TABLET_BOTTOM = 933 + 662; // tablet top + tablet height in canvas coords

export default function HeaderSection() {
    const [scale, setScale] = useState(1);
    const [viewportH, setViewportH] = useState(800);
    const [isMobile, setIsMobile] = useState(false);
    const [isInView, setIsInView] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const tabletLayerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const update = () => {
            const s = Math.min(window.innerWidth / CANVAS_WIDTH, 1);
            setScale(s);
            setViewportH(window.innerHeight);
            setIsMobile(window.innerWidth < 768);
        };
        update();

        const observer = new IntersectionObserver(
            ([entry]) => setIsInView(entry.isIntersecting),
            { threshold: 0.01 }
        );
        if (scrollContainerRef.current) observer.observe(scrollContainerRef.current);

        window.addEventListener("resize", update);
        return () => {
            window.removeEventListener("resize", update);
            observer.disconnect();
        };
    }, []);

    // Scroll progress: 0 at top, 1 at bottom of scroll container
    const { scrollYProgress } = useScroll({
        target: scrollContainerRef,
        offset: ["start start", "end end"],
    });

    // --- Hero Text Animations ---
    const heroScale = useTransform(scrollYProgress, [0, 0.3, 0.7], [1, 0.85, 0.65]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.25, 0.6], [1, 0.7, 0]);
    const heroY = useTransform(scrollYProgress, [0, 0.3, 0.7], [0, -40, -120]);

    // --- Tablet Animations (viewport-height-aware) ---
    const canvasViewportH = viewportH / scale;
    const tabletEndY = Math.min(-750, -(TABLET_BOTTOM - canvasViewportH + 20));
    const tabletMidY = (50 + tabletEndY) / 2;
    const tabletY = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [300, 50, tabletMidY, tabletEndY]);
    const tabletScale = useTransform(scrollYProgress, [0, 0.4, 1], [0.85, 0.95, 1]);

    /* ═══════════════════════════════════════════
       MOBILE LAYOUT — simple flex column, no canvas
       ═══════════════════════════════════════════ */
    if (isMobile) {
        return (
            <div ref={scrollContainerRef} className="mobile-hero-container">
                {/* Background — absolute, covers entire section */}
                <div className="mobile-hero-bg">
                    <BackgroundLayer />
                </div>

                {/* Video — above fold, before hero text */}
                <div className="mobile-hero-video">
                    <MobileTabletLayer />
                </div>

                {/* Content — natural flow, below video */}
                <div className="mobile-hero-content">
                    <MobileHeroContent />
                </div>
            </div>
        );
    }

    /* ═══════════════════════════════════════════
       DESKTOP LAYOUT — canvas-based scroll animation
       ═══════════════════════════════════════════ */
    return (
        <div ref={scrollContainerRef} className="header-scroll-container">
            {isInView && (
                <div className="header-sticky-viewport">
                    {/* Clipped container: background, hero text, nav (overflow:clip in CSS) */}
                    <div className="header-content-box">
                        <div
                            className="header-content-scaler"
                            style={{
                                transform: `scale(${scale})`,
                                transformOrigin: "top center",
                            }}
                        >
                            {/* Layer 3 – Background (static, lowest z-index) */}
                            <div className="header-scroll-layer header-bg-layer">
                                <BackgroundLayer />
                            </div>

                            {/* Layer 1 – Hero Text (scales down + fades on scroll) */}
                            <motion.div
                                className="header-scroll-layer header-hero-layer"
                                style={{
                                    scale: heroScale,
                                    opacity: heroOpacity,
                                    y: heroY,
                                }}
                            >
                                <HeroTextLayer />
                            </motion.div>
                        </div>
                    </div>

                    {/* UN-clipped container: tablet layer (NOT inside overflow:clip) */}
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            pointerEvents: "none",
                            zIndex: 3,
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <div
                            style={{
                                width: 1440,
                                height: 1595,
                                flexShrink: 0,
                                position: "relative",
                                transform: `scale(${scale})`,
                                transformOrigin: "top center",
                            }}
                        >
                            <motion.div
                                ref={tabletLayerRef}
                                className="header-scroll-layer header-tablet-layer"
                                style={{
                                    y: tabletY,
                                    scale: tabletScale,
                                }}
                            >
                                <TabletLayer />
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
