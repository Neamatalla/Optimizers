import { memo } from "react";
import { motion, useTransform } from "motion/react";
import svgPaths from "@/imports/svg-sec4";
import imgIPhone17 from "../assets/e9bccb8642719980ea958d77f0b65d7871275cae.webp";
import imgProfilePhoto from "../assets/bea2fb523d6f14c71d06c08b5857b1e8c2afdc71.webp";

const Section4 = memo(({ isActive, bgOpacity, contentOpacity, counterY, mockupX, mockupY }: {
    isActive: boolean;
    bgOpacity: any;
    contentOpacity: any;
    counterY?: any;
    mockupX?: any;
    mockupY?: any;
}) => {
    return (
        <div className="relative w-full h-full overflow-hidden" style={{ willChange: 'opacity' }}>
            {/* Background SVG */}
            <motion.div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                data-name="bg_4"
                style={{ opacity: bgOpacity, willChange: 'opacity' }}
            >
                <div className="absolute inset-[-28.23%_-11.01%_-20.96%_-9.99%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2425.07 1598.54">
                        <g id="bg_4" opacity="0.7">
                            <g id="light_4">
                                <path d={svgPaths.p30326f80} stroke="url(#paint0_linear_sec4)" strokeWidth="137.142" filter="url(#filter0_iif_sec4)" />
                            </g>
                            <g id="light2_4">
                                <path d={svgPaths.p1c0fb80} fill="#27211A" filter="url(#filter1_f_sec4)" />
                            </g>
                        </g>
                        <defs>
                            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" id="filter0_iif_sec4">
                                <feGaussianBlur stdDeviation="20" />
                            </filter>
                            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" id="filter1_f_sec4">
                                <feGaussianBlur stdDeviation="20" />
                            </filter>
                            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_sec4" x1="1829.54" x2="586.351" y1="477.125" y2="1492.92">
                                <stop stopColor="#04060A" />
                                <stop offset="0.403657" stopColor="#FCD34D" />
                                <stop offset="0.615" stopColor="#372D16" />
                                <stop offset="1" stopColor="#04060A" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </motion.div>

            {/* Content Container */}
            <motion.div className="absolute inset-0 pointer-events-none z-10" style={{ opacity: contentOpacity, willChange: 'opacity' }}>

                {/* ═══ DESKTOP LAYOUT ═══ */}
                <div className="hidden lg:block">
                    <div className="absolute left-[15vw] top-[15vh] w-[70vw] h-[80vh] z-0 pointer-events-none overflow-hidden">
                        <motion.div style={{ y: counterY || 0, willChange: 'transform' }} className="w-full h-full">
                            <motion.img alt="" style={{ x: mockupX || 0, y: mockupY || 0, willChange: 'transform' }} className="absolute inset-0 max-w-none object-contain pointer-events-none size-full drop-shadow-[0px_40px_80px_rgba(0,0,0,0.6)]" src={imgIPhone17} decoding="async" loading="eager" />
                        </motion.div>
                    </div>
                    <div className="absolute left-[5.5vw] top-[30vh] flex flex-col gap-[6vh] w-[25vw] min-w-[300px] z-10" style={{ pointerEvents: "auto", maxHeight: 'calc(70vh - 15vw)', overflow: 'hidden' }}>
                        <div className="overflow-hidden w-full">
                            <motion.div style={{ y: counterY || 0, willChange: 'transform' }}>
                                <div className="content-stretch flex flex-col gap-[3vh] items-start relative shrink-0 w-full">
                                    <div className="content-stretch flex gap-[1.5vh] h-auto items-center relative shrink-0 w-full">
                                        <div className="relative shrink-0 size-[7.3vh] min-w-[50px] min-h-[50px]">
                                            <img alt="" className="block max-w-none size-full" src={imgProfilePhoto} decoding="async" />
                                        </div>
                                        <div className="content-stretch flex flex-col gap-[1vh] items-start justify-center relative shrink-0">
                                            <div className="flex flex-col font-['Sora',sans-serif] font-semibold h-auto justify-center leading-[1.2] relative shrink-0 text-[32px] text-white tracking-[-0.02em] w-full"><p>Regal Honey</p></div>
                                            <div className="bg-[rgba(252,211,77,0.15)] content-stretch flex items-center justify-center px-[12px] py-[6px] relative rounded-[100px] shrink-0">
                                                <p className="font-['Sora',sans-serif] font-normal leading-normal relative shrink-0 text-[#fde68a] text-[14px]">Food & Beverage</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="content-stretch flex items-center justify-center relative shrink-0 w-full">
                                        <p className="font-['Sora',sans-serif] font-normal leading-relaxed relative shrink-0 text-[18px] text-white w-full">Premium honey retailer offering natural and organic honey products across Kuwait.</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                        <div className="overflow-hidden w-[20vw] min-w-[250px]">
                            <motion.div style={{ y: counterY || 0, willChange: 'transform' }}>
                                <div className="content-stretch flex flex-col gap-[2.4vh] items-start relative shrink-0 w-full">
                                    <div className="content-stretch flex flex-col gap-[0.8vh] items-start relative shrink-0 w-full">
                                        <p className="font-['Sora',sans-serif] font-semibold leading-normal min-w-full relative shrink-0 text-[#fde68a] text-[18px]">Our Goal:</p>
                                        <p className="font-['Sora',sans-serif] font-normal leading-normal relative shrink-0 text-[14px] text-white">ECR uplift across all product categories.</p>
                                    </div>
                                    <div className="content-stretch flex flex-col gap-[0.8vh] items-start relative shrink-0 w-full">
                                        <p className="font-['Sora',sans-serif] font-semibold leading-normal min-w-full relative shrink-0 text-[#fde68a] text-[18px]">Areas of Improvement:</p>
                                        <p className="font-['Sora',sans-serif] font-normal leading-normal relative shrink-0 text-[14px] text-white">Homepage, product details page.</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                    <div className="absolute right-[5.5vw] top-[40vh] w-[18vw] min-w-[220px] z-10 overflow-hidden" style={{ pointerEvents: "auto" }}>
                        <motion.div style={{ y: counterY || 0, willChange: 'transform' }}>
                            <div className="content-stretch flex flex-col gap-[4.8vh] items-start relative shrink-0 w-full">
                                <div className="content-stretch flex flex-col gap-[0.8vh] items-start justify-center relative shrink-0 w-full">
                                    <p className="font-['Sora',sans-serif] font-semibold leading-tight relative shrink-0 text-[#fcd34d] text-[48px] tracking-[-0.04em]">+44.15%</p>
                                    <p className="font-['Sora',sans-serif] font-normal leading-normal relative shrink-0 text-[18px] text-white">E-commerce conversion rate</p>
                                </div>
                                <div className="content-stretch flex flex-col gap-[0.8vh] items-start justify-center relative shrink-0 w-full">
                                    <p className="font-['Sora',sans-serif] font-semibold leading-tight relative shrink-0 text-[#fcd34d] text-[48px] tracking-[-0.04em]">+34.6%</p>
                                    <p className="font-['Sora',sans-serif] font-normal leading-normal relative shrink-0 text-[18px] text-white">Average order value</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* ═══ MOBILE LAYOUT ═══ */}
                <div className="lg:hidden absolute inset-0 flex flex-col items-center px-5 pt-[6vh] pb-6 gap-3 w-full pointer-events-auto overflow-y-auto">
                    <div className="flex items-center gap-3 w-full max-w-[320px]">
                        <div className="relative shrink-0 size-[44px]">
                            <img alt="" className="block max-w-none size-full rounded-full" src={imgProfilePhoto} decoding="async" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <p className="font-['Sora',sans-serif] font-semibold text-[18px] text-white tracking-[-0.02em] leading-[1.2]">Regal Honey</p>
                            <div className="bg-[rgba(252,211,77,0.15)] flex items-center justify-center px-[8px] py-[3px] rounded-[100px] w-fit">
                                <p className="font-['Sora',sans-serif] font-normal text-[11px] text-[#fde68a]">Food & Beverage</p>
                            </div>
                        </div>
                    </div>
                    <p className="font-['Sora',sans-serif] font-normal leading-relaxed text-[13px] text-white/80 text-center max-w-[320px]">Premium honey retailer offering natural and organic honey products across Kuwait.</p>
                    <div className="w-[55vw] max-w-[240px] aspect-[9/16] relative shrink-0">
                        <img alt="" className="w-full h-full object-contain drop-shadow-[0px_20px_40px_rgba(0,0,0,0.6)]" src={imgIPhone17} decoding="async" />
                    </div>
                    <div className="flex gap-6 w-full max-w-[320px] justify-center">
                        <div className="flex flex-col gap-0.5 items-center">
                            <p className="font-['Sora',sans-serif] font-semibold text-[#fcd34d] text-[26px] tracking-[-0.04em] leading-tight">+44.15%</p>
                            <p className="font-['Sora',sans-serif] font-normal text-[11px] text-white/70 text-center">Conversion rate</p>
                        </div>
                        <div className="flex flex-col gap-0.5 items-center">
                            <p className="font-['Sora',sans-serif] font-semibold text-[#fcd34d] text-[26px] tracking-[-0.04em] leading-tight">+34.6%</p>
                            <p className="font-['Sora',sans-serif] font-normal text-[11px] text-white/70 text-center">Avg. order value</p>
                        </div>
                    </div>
                    <div className="flex gap-6 w-full max-w-[320px]">
                        <div className="flex flex-col gap-0.5 flex-1">
                            <p className="font-['Sora',sans-serif] font-semibold text-[#fde68a] text-[13px]">Our Goal:</p>
                            <p className="font-['Sora',sans-serif] font-normal text-[11px] text-white/80">ECR uplift across all product categories.</p>
                        </div>
                        <div className="flex flex-col gap-0.5 flex-1">
                            <p className="font-['Sora',sans-serif] font-semibold text-[#fde68a] text-[13px]">Areas of Improvement:</p>
                            <p className="font-['Sora',sans-serif] font-normal text-[11px] text-white/80">Homepage, product details page.</p>
                        </div>
                    </div>
                </div>

            </motion.div>
        </div>
    );
});

export default Section4;
