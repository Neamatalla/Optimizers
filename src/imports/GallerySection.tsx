import { motion } from 'motion/react';
import imgRectangle14 from "../assets/d8b337a511649b176cd435e218aaa7b2a33d3cb6.webp";
import imgRectangle12 from "../assets/1e2bc48a17b1656347bb46caabfa6e2bd1c24845.webp";
import imgRectangle9 from "../assets/046c40b816efa7bf2571f96406a150d0f81ede99.webp";
import imgRectangle10 from "../assets/7ad949482f63f44db04299f5bf254873f728d7ff.webp";
import imgRectangle4 from "../assets/6a25f990938672a3e0fa2a719fc1700b87c73068.webp";
import imgRectangle11 from "../assets/79e7969f09efccab8e047c24086054abb50ee7e2.webp";
import imgRectangle13 from "../assets/a8a44a44a12d34e1d02ae948d49a3667ae53eb82.webp";
import imgRectangle15 from "../assets/7a88678bdda77cc2cf07f6b07429257ff47b65de.webp";
import imgRectangle16 from "../assets/5950a3ddf2a6ec9b701c5efd3ec463328161175a.webp";
import imgRectangle17 from "../assets/0f2c3f5ca49e9394bfe08c7f7dd7175f5ef586bd.webp";
import imgRectangle18 from "../assets/eb353270e89d942c0cb7aca6776f63e80f7bbe5e.webp";
import imgRectangle19 from "../assets/212c2c3f9e91b0f640a3c4744397715ee2bd1eb1.webp";

const ALL_IMAGES = [
    imgRectangle14, imgRectangle12, imgRectangle9, imgRectangle10,
    imgRectangle4, imgRectangle11, imgRectangle13, imgRectangle15,
    imgRectangle16, imgRectangle17, imgRectangle18, imgRectangle19
];

// Desktop 3D config
const COLUMNS = 21;
const ROWS = 15;
const RADIUS = 1100;
const ANGLE_STEP = 6.5;
const ROW_GAP = 130;

// Mobile 2D grid config - from reference design
const MOBILE_COLS = 9;
const MOBILE_ROWS_PER_COL = 8;
const MOBILE_IMG_W = 44.811;
const MOBILE_IMG_H = 57.759;
const MOBILE_COL_GAP = 36.731;
// Column positions from the reference (left, top offsets for each column)
const MOBILE_COL_POSITIONS = [
    { left: -73.36, top: -225.4 },
    { left: -6.83, top: -158.61 },
    { left: 84.17, top: -183.19 },
    { left: 150.69, top: -116.4 },
    { left: 241.7, top: -140.98 },
    { left: 308.22, top: -74.19 },
    { left: 399.22, top: -98.77 },
    { left: 465.75, top: -31.98 },
    { left: 556.75, top: -56.56 },
];

// Each column uses a different shuffled order of images
const MOBILE_COL_IMAGE_ORDERS = [
    [0, 1, 2, 3, 4, 5, 6, 7],   // col 0
    [3, 6, 5, 0, 7, 1, 2, 4],   // col 1
    [4, 7, 1, 3, 2, 5, 0, 6],   // col 2
    [5, 3, 8, 6, 0, 9, 2, 10],  // col 3
    [0, 6, 7, 1, 5, 4, 11, 3],  // col 4
    [5, 2, 11, 3, 7, 1, 7, 0],  // col 5
    [3, 6, 0, 9, 10, 9, 5, 11], // col 6
    [0, 5, 4, 11, 2, 1, 7, 3],  // col 7
    [2, 1, 6, 7, 3, 0, 5, 4],   // col 8
];

/** Mobile gallery column - vertical strip of images */
function MobileColumn({ colIndex }: { colIndex: number }) {
    const imageOrder = MOBILE_COL_IMAGE_ORDERS[colIndex];
    return (
        <div className="flex flex-col" style={{ gap: `${MOBILE_COL_GAP}px` }}>
            {imageOrder.map((imgIdx, rowIdx) => (
                    <div
                        key={`m-${colIndex}-${rowIdx}`}
                        className="relative shrink-0"
                        style={{ width: `${MOBILE_IMG_W}px`, height: `${MOBILE_IMG_H}px`, transformStyle: 'preserve-3d' }}
                    >
                        <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute bg-[rgba(0,0,0,0)] inset-0" />
                        <img
                            alt=""
                            className="absolute max-w-none object-cover w-full h-full"
                            src={ALL_IMAGES[imgIdx % ALL_IMAGES.length]}
                            decoding="async"
                            loading="lazy"
                        />
                    </div>
                    </div>
            ))}
        </div>
    );
}

/** Mobile 2D tilted grid - matches reference Figma design */
function MobileGalleryGrid() {
    return (
        <div
            className="absolute overflow-auto"
            style={{
                width: '718.574px',
                height: '474.002px',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
            }}
        >
            {MOBILE_COL_POSITIONS.map((pos, colIndex) => (
                <div
                    key={`mcol-${colIndex}`}
                    className="absolute flex items-center justify-center"
                    style={{
                        width: '229.423px',
                        height: '706.276px',
                        left: `${pos.left}px`,
                        top: `${pos.top}px`,
                    }}
                >
                    <div className="flex-none" style={{ transform: 'rotate(15deg)' }}>
                        <MobileColumn colIndex={colIndex} />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function GallerySection() {
    return (
        <div className="bg-[#000000] relative w-full h-[339px] lg:h-screen overflow-hidden flex flex-col items-center justify-center">
            {/* Static Header */}
            <p className="absolute z-30 bg-clip-text bg-gradient-to-b css-4hzbpn font-['Sora',sans-serif] font-semibold from-[rgba(255,255,255,0.8)] leading-none left-0 text-[37px] lg:text-[145px] text-center to-[rgba(255,255,255,0.1)] top-[40px] lg:top-[-0.05em] tracking-[-1.48px] lg:tracking-[-6.5px] w-full pointer-events-none select-none"
                style={{ WebkitTextFillColor: "transparent", textShadow: '0 10px 40px rgba(0,0,0,0.6)' }}>
                Behind The Scenes
            </p>

            {/* ========== DESKTOP: 3D Cylindrical Gallery (lg+) ========== */}
            <div className="hidden lg:flex relative w-full h-full items-center justify-center overflow-visible"
                style={{ perspective: '2200px' }}>
                <motion.div
                    className="relative w-0 h-0 flex items-center justify-center"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{
                        rotateY: [-22, 22],
                        rotateX: [-5, 5],
                    }}
                    transition={{
                        rotateY: {
                            duration: 15,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: [0.4, 0, 0.2, 1]
                        },
                        rotateX: {
                            duration: 18,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut"
                        }
                    }}
                >
                    {Array.from({ length: COLUMNS }).map((_, colIndex) => {
                        const angle = (colIndex - Math.floor(COLUMNS / 2)) * ANGLE_STEP;
                        return Array.from({ length: ROWS }).map((_, rowIndex) => {
                            const stagger = (colIndex % 2) * (ROW_GAP / 2);
                            const yPos = (rowIndex - (ROWS - 1) / 2) * ROW_GAP + stagger;
                            const imageIndex = (colIndex * ROWS + rowIndex) % ALL_IMAGES.length;
                            const image = ALL_IMAGES[imageIndex];
                            return (
                                <motion.div
                                    key={`${colIndex}-${rowIndex}`}
                                    className="absolute"
                                    whileHover={{ zIndex: 100 }}
                                    style={{
                                        width: '75px',
                                        height: '100px',
                                        transform: `rotateY(${angle}deg) translateZ(${RADIUS}px) translateY(${yPos}px)`,
                                        transformStyle: 'preserve-3d',
                                        left: '-37.5px',
                                        top: '-50px'
                                    }}
                                >
                                    <motion.div
                                        className="w-full h-full overflow-hidden rounded-[4px] border border-white/[0.03] bg-neutral-900/40"
                                        whileHover={{ borderColor: 'rgba(255,255,255,0.4)', zIndex: 50 }}
                                        style={{
                                            backfaceVisibility: 'hidden',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.9)',
                                            transformStyle: 'preserve-3d'
                                        }}
                                    >
                                        <img
                                            src={image}
                                            alt={`Gallery item ${imageIndex}`}
                                            className="w-full h-full object-cover pointer-events-none grayscale-[20%] hover:grayscale-0 transition-all duration-300"
                                            decoding="async"
                                        />
                                    </motion.div>
                                </motion.div>
                            );
                        });
                    })}
                </motion.div>
            </div>

            {/* ========== MOBILE: 2D Tilted Grid (<lg) ========== */}
            <div className="lg:hidden absolute w-full overflow-clip"
                style={{
                    height: '216.548px',
                    bottom: '40.45px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    maxWidth: '335px',
                }}
            >
                {/* Oscillating animation container removed - animation now on images */}
                <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ perspective: '800px', transformStyle: 'preserve-3d' }}
                >
                    <motion.div 
                        className="absolute inset-0" 
                        style={{ transformStyle: 'preserve-3d', transformOrigin: 'center center' }}
                        animate={{
                            rotateY: [-22, 22],
                            rotateX: [-5, 5],
                            x: [-200, 200],
                        }}
                        transition={{
                            rotateY: {
                                duration: 15,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: [0.4, 0, 0.2, 1]
                            },
                            rotateX: {
                                duration: 18,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut"
                            },
                            x: {
                                duration: 15,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: [0.4, 0, 0.2, 1]
                            }
                        }}
                    >
                        <div
                            className="absolute"
                            style={{
                                width: '335px',
                                height: '216.548px',
                                left: '50%',
                                top: '50%',
                                transform: 'translate(-50%, -50%)',
                                transformStyle: 'preserve-3d'
                            }}
                        >
                            <MobileGalleryGrid />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ========== Atmosphere & depth fades ========== */}
            {/* Desktop atmospheric effects */}
            <div className="hidden lg:block absolute inset-0 pointer-events-none bg-radial-gradient from-transparent to-black opacity-60 z-10" />
            <div className="hidden lg:block absolute bottom-0 left-0 w-full h-[17.3vw] z-25 pointer-events-none bg-gradient-to-t from-[#000000] to-transparent via-[#000000]/80" />
            <div className="hidden lg:block absolute top-0 left-0 w-full h-[17.3vw] z-25 pointer-events-none bg-gradient-to-b from-[#000000] to-transparent via-[#000000]/80" />
            <div className="hidden lg:block absolute inset-y-0 left-0 w-[20%] z-25 bg-gradient-to-r from-black to-transparent pointer-events-none" />
            <div className="hidden lg:block absolute inset-y-0 right-0 w-[20%] z-25 bg-gradient-to-l from-black to-transparent pointer-events-none" />

            {/* Mobile atmospheric effects - bottom ellipse blur + side fades */}
            <div className="lg:hidden absolute bottom-[-0.33px] left-1/2 -translate-x-1/2 w-[762px] h-[87.331px] z-20 pointer-events-none">
                <div className="absolute inset-[-51.81%_-5.94%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 852.499 177.83">
                        <g filter="url(#filter_mob_bot)">
                            <ellipse cx="426.249" cy="88.9151" fill="#000000" rx="381" ry="43.6657" />
                        </g>
                        <defs>
                            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="177.83" id="filter_mob_bot" width="852.499" x="0" y="0">
                                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                                <feGaussianBlur result="effect1_foregroundBlur" stdDeviation="22.625" />
                            </filter>
                        </defs>
                    </svg>
                </div>
            </div>
            {/* Mobile side fades - rotated ellipses */}
            <div className="lg:hidden absolute right-[-15px] top-1/2 -translate-y-1/2 w-[114.888px] h-[309px] z-20 pointer-events-none -rotate-90 origin-center" style={{ transform: 'translateY(-50%) rotate(-90deg)' }}>
                <div className="absolute inset-[-25.45%_-9.46%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 367.467 173.356">
                        <g filter="url(#filter_mob_r)">
                            <ellipse cx="183.734" cy="86.6779" fill="#000000" rx="154.5" ry="57.4442" />
                        </g>
                        <defs>
                            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="173.356" id="filter_mob_r" width="367.467" x="0" y="0">
                                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                                <feGaussianBlur result="effect1_foregroundBlur" stdDeviation="14.6168" />
                            </filter>
                        </defs>
                    </svg>
                </div>
            </div>
            <div className="lg:hidden absolute left-[-50px] top-1/2 -translate-y-1/2 w-[114.888px] h-[309px] z-20 pointer-events-none" style={{ transform: 'translateY(-50%) rotate(-90deg)' }}>
                <div className="absolute inset-[-25.45%_-9.46%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 367.467 173.356">
                        <g filter="url(#filter_mob_l)">
                            <ellipse cx="183.734" cy="86.6779" fill="#000000" rx="154.5" ry="57.4442" />
                        </g>
                        <defs>
                            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="173.356" id="filter_mob_l" width="367.467" x="0" y="0">
                                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                                <feGaussianBlur result="effect1_foregroundBlur" stdDeviation="14.6168" />
                            </filter>
                        </defs>
                    </svg>
                </div>
            </div>
        </div>
    );
}
