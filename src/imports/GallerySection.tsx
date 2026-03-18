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

// Panoramic high-density cloud
const COLUMNS = 21;
const ROWS = 15;
const RADIUS = 1100; // Deep concave radius
const ANGLE_STEP = 6.5; // Tighter angular spacing for more columns
const ROW_GAP = 130; // Increased spacing for larger images

export default function GallerySection() {
    return (
        <div className="bg-[#000000] relative w-full h-[800px] lg:h-screen overflow-hidden flex flex-col items-center justify-center">
            {/* Static Header - The "Window" Glass */}
            <p className="absolute z-30 bg-clip-text bg-gradient-to-b css-4hzbpn font-['Sora',sans-serif] font-semibold from-[rgba(255,255,255,0.8)] leading-none left-0 text-[12vw] lg:text-[145px] text-center to-[rgba(255,255,255,0.1)] top-[-0.05em] tracking-[-2.3px] lg:tracking-[-6.5px] w-full pointer-events-none select-none"
                style={{ WebkitTextFillColor: "transparent", textShadow: '0 10px 40px rgba(0,0,0,0.6)' }}>
                Behind The Scenes
            </p>

            {/* 3D Scene Root */}
            <div className="relative w-full h-full flex items-center justify-center overflow-visible"
                style={{ perspective: '2200px' }}>

                {/* The oscillating grid container */}
                <motion.div
                    className="relative w-0 h-0 flex items-center justify-center"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{
                        rotateY: [-22, 22], // Drastic sweep
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
                    {/* Cylindrical Image Mapping */}
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
                                        width: '75px', // Increased from 60px
                                        height: '100px', // Increased from 80px
                                        // Concave wall transformation
                                        transform: `rotateY(${angle}deg) translateZ(${RADIUS}px) translateY(${yPos}px)`,
                                        transformStyle: 'preserve-3d',
                                        left: '-37.5px', // Adjusted offset
                                        top: '-50px' // Adjusted offset
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

            {/* atmosphere & depth fades - made responsive */}
            <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent to-black opacity-50 lg:opacity-60 z-10" />
            <div className="absolute bottom-0 left-0 w-full h-[12.5vw] lg:h-[17.3vw] z-25 pointer-events-none bg-gradient-to-t from-[#000000] to-transparent via-[#000000]/80" />
            <div className="absolute top-0 left-0 w-full h-[12.5vw] lg:h-[17.3vw] z-25 pointer-events-none bg-gradient-to-b from-[#000000] to-transparent via-[#000000]/80" />

            {/* Wide Varded Vignette - Narrower on mobile and desktop */}
            <div className="absolute inset-y-0 left-0 w-[15%] lg:w-[20%] z-25 bg-gradient-to-r from-black to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-[15%] lg:w-[20%] z-25 bg-gradient-to-l from-black to-transparent pointer-events-none" />
        </div>
    );
}
