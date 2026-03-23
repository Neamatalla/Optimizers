import React, { useState, useEffect } from "react";
import svgPaths from "./svg-67sjau8p5h";
import svgMobilePaths from "./svg-mobile-meet";
import imgRectangle2 from "../assets/8beafb71ac0e56f696268857cdb1244ee06d2dcc.webp";
import imgRectangle3 from "../assets/4f11d4feb717671a4fc30f59979ff4c1bbb1eeb2.webp";
import imgRectangle4 from "../assets/2360b5bdc64c7364378a5a9d57d3b75bc52915d7.webp";
import imgRectangle5 from "../assets/74dadc14d70527de322c8a12cd44546b63f3fcd5.webp";
import imgLiftapp from "../assets/3ea05da11c2980d6a66b2e7e7d24667e55eea21a.webp";
import { useLanguage } from "../app/contexts/LanguageContext";

function Lights() {
    return (
        <div className="absolute h-[303.926px] left-[1.16px] overflow-clip top-[1.16px] w-[237.656px]" data-name="Lights">
            <div className="absolute bg-[#050505] h-[303.926px] left-0 rounded-[17.139px] top-0 w-[237.656px]">
                <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_4.57px_27.422px_-7.998px_rgba(95,130,191,0.4)]" />
            </div>
            <div className="absolute h-[387px] left-[calc(50%-0.49px)] rounded-[17.139px] top-[-5.41px] translate-x-[-50%] w-[303px]">
                <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[17.139px]">
                    <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0)] inset-0 rounded-[17.139px] to-black" />
                    <div className="absolute inset-0 overflow-hidden rounded-[17.139px]">
                        <img alt="" className="absolute max-w-none object-cover size-full scale-[1.3] origin-top" src={imgRectangle2} decoding="async" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function BgElements() {
    return (
        <div className="absolute contents left-[-221.37px] top-[-263.59px]" data-name="Bg Elements">
            <div className="absolute flex h-[840.281px] items-center justify-center left-[-220.57px] mix-blend-screen top-[-262.79px] w-[726.733px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
                <div className="flex-none rotate-[72.8deg]">
                    <div className="h-[540.226px] relative w-[712.385px]" data-name="Light greyish">
                        <div className="absolute inset-[-15.65%_-11.86%]">
                            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 881.429 709.269">
                                <g filter="url(#filter0_f_1_328)" id="Light greyish" style={{ mixBlendMode: "screen" }}>
                                    <path d={svgPaths.p4ca9700} fill="url(#paint0_radial_1_328)" fillOpacity="0.15" />
                                </g>
                                <defs>
                                    <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="709.269" id="filter0_f_1_328" width="881.429" x="0" y="0">
                                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                        <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                                        <feGaussianBlur result="effect1_foregroundBlur_1_328" stdDeviation="42.2609" />
                                    </filter>
                                    <radialGradient cx="0" cy="0" gradientTransform="matrix(-240.141 -255.655 255.432 -240.393 540.249 366.256)" gradientUnits="userSpaceOnUse" id="paint0_radial_1_328" r="1">
                                        <stop offset="0.409332" stopColor="#5F82BF" />
                                        <stop offset="1" stopOpacity="0" />
                                        <stop offset="1" stopColor="#2D2E32" stopOpacity="0" />
                                    </radialGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Text() {
    const { t } = useLanguage();
    return (
        <div className="absolute contents left-[calc(50%-97.41px)] top-[15.18px] translate-x-[-50%]" data-name="Text">
            <div className="absolute flex h-[208px] items-center justify-center left-[calc(50%-82.91px)] top-[15.98px] translate-x-[-50%] w-[23px]" style={{ "--transform-inner-width": "157.59375", "--transform-inner-height": "19" } as React.CSSProperties}>
                <div className="flex-none rotate-[90deg]">
                    <p className="bg-clip-text bg-gradient-to-b css-ew64yg font-['Sora:SemiBold',sans-serif] font-semibold from-[43.103%] from-white leading-[23px] relative text-[19px] text-center to-[rgba(255,255,255,0)] tracking-[-0.38px]" style={{ WebkitTextFillColor: "transparent" }}>
                        Mohamed Neamatalla
                    </p>
                </div>
            </div>
            <div className="absolute flex h-[107px] items-center justify-center left-[calc(50%-114.91px)] top-[65.98px] translate-x-[-50%] w-[17px]" style={{ "--transform-inner-width": "111.984375", "--transform-inner-height": "19" } as React.CSSProperties}>
                <div className="flex-none rotate-[90deg]">
                    <p className="css-ew64yg font-['Sora:Regular',sans-serif] font-normal leading-[17px] relative text-[14px] text-[rgba(255,255,255,0.5)] text-center">{t('Founder & CEO')}</p>
                </div>
            </div>
        </div>
    );
}

function Card() {
    return (
        <div className="h-[239.942px] overflow-clip relative rounded-[18.281px] w-[307.354px]" data-name="Card">
            <div
                className="absolute inset-0 pointer-events-none rounded-[18.281px]"
                style={{
                    padding: "0.8px",
                    background: "linear-gradient(to left, #5f82bf 0%, #5f82bf 30%, transparent 100%)",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                }}
            />
            <BgElements />
            <Text />
        </div>
    );
}

const Safer = React.memo(function Safer() {
    return (
        <div className="h-[305.215px] relative rounded-[25.77px] shrink-0 w-[239.984px]" data-name="Safer">
            <Lights />
            <div className="absolute flex h-[307.354px] items-center justify-center left-[0.02px] top-[0.02px] w-[239.942px]" style={{ "--transform-inner-width": "157.59375", "--transform-inner-height": "38" } as React.CSSProperties}>
                <div className="flex-none rotate-[-90deg]">
                    <Card />
                </div>
            </div>
        </div>
    );
});

function Lights1() {
    return (
        <div className="absolute h-[303.946px] left-[1.16px] overflow-clip top-[1.16px] w-[237.672px]" data-name="Lights">
            <div className="absolute bg-[#050505] h-[303.946px] left-0 rounded-[17.14px] top-0 w-[237.672px]">
                <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_4.571px_27.424px_-7.999px_rgba(255,166,154,0.4)]" />
            </div>
            <div className="absolute h-[368px] left-[calc(50%+0.02px)] rounded-[17.14px] top-[-9.39px] translate-x-[-50%] w-[288px]">
                <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[17.14px]">
                    <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0)] inset-0 rounded-[17.14px] to-black" />
                    <img alt="" className="absolute max-w-none object-cover rounded-[17.14px] size-full scale-[1.3] origin-top" src={imgRectangle3} decoding="async" />
                </div>
            </div>
        </div>
    );
}

function BgElements1() {
    return (
        <div className="absolute contents left-[-221.37px] top-[-263.61px]" data-name="Bg Elements">
            <div className="absolute flex h-[840.336px] items-center justify-center left-[-220.57px] mix-blend-screen top-[-262.81px] w-[726.781px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
                <div className="flex-none rotate-[72.8deg]">
                    <div className="h-[540.261px] relative w-[712.432px]" data-name="Light greyish">
                        <div className="absolute inset-[-15.65%_-11.86%]">
                            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 881.486 709.315">
                                <g filter="url(#filter0_f_1_322)" id="Light greyish" style={{ mixBlendMode: "screen" }}>
                                    <path d={svgPaths.p35b78a00} fill="url(#paint0_radial_1_322)" fillOpacity="0.15" />
                                </g>
                                <defs>
                                    <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="709.315" id="filter0_f_1_322" width="881.486" x="0" y="0">
                                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                        <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                                        <feGaussianBlur result="effect1_foregroundBlur_1_322" stdDeviation="42.2637" />
                                    </filter>
                                    <radialGradient cx="0" cy="0" gradientTransform="matrix(-240.157 -255.672 255.448 -240.409 540.284 366.28)" gradientUnits="userSpaceOnUse" id="paint0_radial_1_322" r="1">
                                        <stop offset="0.409332" stopColor="#FFA69A" />
                                        <stop offset="1" stopOpacity="0" />
                                        <stop offset="1" stopColor="#2D2E32" stopOpacity="0" />
                                    </radialGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Text1() {
    const { t } = useLanguage();
    return (
        <div className="absolute contents left-[calc(50%-97.42px)] top-[50.19px] translate-x-[-50%]" data-name="Text">
            <div className="absolute flex h-[111px] items-center justify-center left-[calc(50%-82.92px)] top-[64.99px] translate-x-[-50%] w-[23px]" style={{ "--transform-inner-width": "85.15625", "--transform-inner-height": "19" } as React.CSSProperties}>
                <div className="flex-none rotate-[90deg]">
                    <p className="bg-clip-text bg-gradient-to-b css-ew64yg font-['Sora:SemiBold',sans-serif] font-semibold from-[43.103%] from-white leading-[23px] relative text-[19px] text-center to-[rgba(255,255,255,0)] tracking-[-0.38px]" style={{ WebkitTextFillColor: "transparent" }}>
                        Alia Mahran
                    </p>
                </div>
            </div>
            <div className="absolute flex h-[138px] items-center justify-center left-[calc(50%-114.92px)] top-[50.99px] translate-x-[-50%] w-[17px]" style={{ "--transform-inner-width": "139.875", "--transform-inner-height": "19" } as React.CSSProperties}>
                <div className="flex-none rotate-[90deg]">
                    <p className="css-ew64yg font-['Sora:Regular',sans-serif] font-normal leading-[17px] relative text-[14px] text-[rgba(255,255,255,0.5)] text-center">{t('Operation Manager')}</p>
                </div>
            </div>
        </div>
    );
}

function Card1() {
    return (
        <div className="h-[239.957px] overflow-clip relative rounded-[18.282px] w-[307.374px]" data-name="Card">
            <div
                className="absolute inset-0 pointer-events-none rounded-[18.282px]"
                style={{
                    padding: "0.8px",
                    background: "linear-gradient(to left, #ffa69a 0%, #ffa69a 30%, transparent 100%)",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                }}
            />
            <BgElements1 />
            <Text1 />
        </div>
    );
}

const Safer1 = React.memo(function Safer1() {
    return (
        <div className="h-[305.235px] relative rounded-[27.424px] shrink-0 w-[240px]" data-name="Safer">
            <Lights1 />
            <div className="absolute flex h-[307.374px] items-center justify-center left-[0.02px] top-[0.02px] w-[239.957px]" style={{ "--transform-inner-width": "139.875", "--transform-inner-height": "38" } as React.CSSProperties}>
                <div className="flex-none rotate-[-90deg]">
                    <Card1 />
                </div>
            </div>
        </div>
    );
});

function Lights2() {
    return (
        <div className="absolute h-[303.946px] left-[1.16px] overflow-clip top-[1.17px] w-[237.672px]" data-name="Lights">
            <div className="absolute bg-[#050505] h-[303.946px] left-0 rounded-[17.14px] top-0 w-[237.672px]">
                <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_4.571px_27.424px_-7.999px_rgba(253,230,138,0.4)]" />
            </div>
            <div className="absolute h-[367px] left-[calc(50%-11.48px)] rounded-[17.14px] top-[-4.41px] translate-x-[-50%] w-[287px]">
                <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[17.14px]">
                    <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0)] inset-0 rounded-[17.14px] to-black" />
                    <div className="absolute inset-0 overflow-hidden rounded-[17.14px]">
                        <img alt="" className="absolute max-w-none object-cover size-full scale-[1.25] origin-top" src={imgRectangle4} decoding="async" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function BgElements2() {
    return (
        <div className="absolute contents left-[-221.38px] top-[-263.61px]" data-name="Bg Elements">
            <div className="absolute flex h-[840.336px] items-center justify-center left-[-220.58px] mix-blend-screen top-[-262.81px] w-[726.781px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
                <div className="flex-none rotate-[72.8deg]">
                    <div className="h-[540.261px] relative w-[712.432px]" data-name="Light greyish">
                        <div className="absolute inset-[-15.65%_-11.86%]">
                            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 881.486 709.315">
                                <g filter="url(#filter0_f_1_324)" id="Light greyish" style={{ mixBlendMode: "screen" }}>
                                    <path d={svgPaths.p35b78a00} fill="url(#paint0_radial_1_324)" fillOpacity="0.15" />
                                </g>
                                <defs>
                                    <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="709.315" id="filter0_f_1_324" width="881.486" x="0" y="0">
                                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                        <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                                        <feGaussianBlur result="effect1_foregroundBlur_1_324" stdDeviation="42.2637" />
                                    </filter>
                                    <radialGradient cx="0" cy="0" gradientTransform="matrix(-240.157 -255.672 255.448 -240.409 540.284 366.28)" gradientUnits="userSpaceOnUse" id="paint0_radial_1_324" r="1">
                                        <stop offset="0.409332" stopColor="#FDE68A" />
                                        <stop offset="1" stopOpacity="0" />
                                        <stop offset="1" stopColor="#2D2E32" stopOpacity="0" />
                                    </radialGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Text2() {
    const { t } = useLanguage();
    return (
        <div className="absolute contents left-[calc(50%-97.42px)] top-[57.19px] translate-x-[-50%]" data-name="Text">
            <div className="absolute flex h-[123px] items-center justify-center left-[calc(50%-82.92px)] top-[57.99px] translate-x-[-50%] w-[23px]" style={{ "--transform-inner-width": "94.09375", "--transform-inner-height": "19" } as React.CSSProperties}>
                <div className="flex-none rotate-[90deg]">
                    <p className="bg-clip-text bg-gradient-to-b css-ew64yg font-['Sora:SemiBold',sans-serif] font-semibold from-[43.103%] from-white leading-[23px] relative text-[19px] text-center to-[rgba(255,255,255,0)] tracking-[-0.38px]" style={{ WebkitTextFillColor: "transparent" }}>
                        Omar Maged
                    </p>
                </div>
            </div>
            <div className="absolute flex h-[99px] items-center justify-center left-[calc(50%-114.92px)] top-[69.99px] translate-x-[-50%] w-[17px]" style={{ "--transform-inner-width": "102.796875", "--transform-inner-height": "19" } as React.CSSProperties}>
                <div className="flex-none rotate-[90deg]">
                    <p className="css-ew64yg font-['Sora:Regular',sans-serif] font-normal leading-[17px] relative text-[14px] text-[rgba(255,255,255,0.5)] text-center">{t('Tech Manager')}</p>
                </div>
            </div>
        </div>
    );
}

function Card2() {
    return (
        <div className="h-[239.957px] overflow-clip relative rounded-[18.282px] w-[307.374px]" data-name="Card">
            <div
                className="absolute inset-0 pointer-events-none rounded-[18.282px]"
                style={{
                    padding: "0.8px",
                    background: "linear-gradient(to left, #fcd34d 0%, #fcd34d 30%, transparent 100%)",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                }}
            />
            <BgElements2 />
            <Text2 />
        </div>
    );
}

const Safer2 = React.memo(function Safer2() {
    return (
        <div className="h-[305.235px] relative rounded-[27.424px] shrink-0 w-[240px]" data-name="Safer">
            <Lights2 />
            <div className="absolute flex h-[307.374px] items-center justify-center left-[0.02px] top-[0.02px] w-[239.957px]" style={{ "--transform-inner-width": "102.796875", "--transform-inner-height": "38" } as React.CSSProperties}>
                <div className="flex-none rotate-[-90deg]">
                    <Card2 />
                </div>
            </div>
        </div>
    );
});

function Lights3() {
    return (
        <div className="absolute h-[303.946px] left-[1.16px] overflow-clip top-[1.16px] w-[237.672px]" data-name="Lights">
            <div className="absolute bg-[#050505] h-[303.946px] left-0 rounded-[17.14px] top-0 w-[237.672px]">
                <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_4.571px_27.424px_-7.999px_rgba(255,164,55,0.4)]" />
            </div>
            <div className="absolute h-[325px] left-[calc(50%+0.02px)] rounded-[17.14px] top-[-10.4px] translate-x-[-50%] w-[254px]">
                <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[17.14px]">
                    <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0)] inset-0 rounded-[17.14px] to-black" />
                    <img alt="" className="absolute max-w-none object-cover rounded-[17.14px] size-full scale-[1.3] origin-top" src={imgRectangle5} decoding="async" />
                </div>
            </div>
        </div>
    );
}

function BgElements3() {
    return (
        <div className="absolute contents left-[-221.39px] top-[-263.61px]" data-name="Bg Elements">
            <div className="absolute flex h-[840.336px] items-center justify-center left-[-220.59px] mix-blend-screen top-[-262.81px] w-[726.781px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
                <div className="flex-none rotate-[72.8deg]">
                    <div className="h-[540.261px] relative w-[712.432px]" data-name="Light greyish">
                        <div className="absolute inset-[-15.65%_-11.86%]">
                            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 881.486 709.315">
                                <g filter="url(#filter0_f_1_312)" id="Light greyish" style={{ mixBlendMode: "screen" }}>
                                    <path d={svgPaths.p35b78a00} fill="url(#paint0_radial_1_312)" fillOpacity="0.15" />
                                </g>
                                <defs>
                                    <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="709.315" id="filter0_f_1_312" width="881.486" x="0" y="0">
                                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                        <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                                        <feGaussianBlur result="effect1_foregroundBlur_1_312" stdDeviation="42.2637" />
                                    </filter>
                                    <radialGradient cx="0" cy="0" gradientTransform="matrix(-240.157 -255.672 255.448 -240.409 540.284 366.28)" gradientUnits="userSpaceOnUse" id="paint0_radial_1_312" r="1">
                                        <stop offset="0.409332" stopColor="#FFA437" />
                                        <stop offset="1" stopOpacity="0" />
                                        <stop offset="1" stopColor="#2D2E32" stopOpacity="0" />
                                    </radialGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Text3() {
    const { t } = useLanguage();
    return (
        <div className="absolute contents left-[calc(50%-98.04px)] top-[50.21px] translate-x-[-50%]" data-name="Text">
            <div className="absolute flex h-[137px] items-center justify-center left-[calc(50%-82.92px)] top-[51.01px] translate-x-[-50%] w-[23px]" style={{ "--transform-inner-width": "103.46875", "--transform-inner-height": "19" } as React.CSSProperties}>
                <div className="flex-none rotate-[90deg]">
                    <p className="bg-clip-text bg-gradient-to-b css-ew64yg font-['Sora:SemiBold',sans-serif] font-semibold from-[43.103%] from-white leading-[23px] relative text-[19px] text-center to-[rgba(255,255,255,0)] tracking-[-0.38px]" style={{ WebkitTextFillColor: "transparent" }}>
                        Mariam Chadii
                    </p>
                </div>
            </div>
            <div className="absolute flex h-[78px] items-center justify-center left-[calc(50%-116.16px)] top-[79.23px] translate-x-[-50%] w-[17px]" style={{ "--transform-inner-width": "81.46875", "--transform-inner-height": "19" } as React.CSSProperties}>
                <div className="flex-none rotate-[90deg]">
                    <p className="css-ew64yg font-['Sora:Regular',sans-serif] font-normal leading-[17px] relative text-[14px] text-[rgba(255,255,255,0.5)] text-center">{t('UI/UX Lead')}</p>
                </div>
            </div>
        </div>
    );
}

function Card3() {
    return (
        <div className="h-[239.957px] overflow-clip relative rounded-[18.282px] w-[307.374px]" data-name="Card">
            <div
                className="absolute inset-0 pointer-events-none rounded-[18.282px]"
                style={{
                    padding: "0.8px",
                    background: "linear-gradient(to left, rgba(255,164,55,0.7) 0%, rgba(255,164,55,0.7) 30%, transparent 100%)",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                }}
            />
            <BgElements3 />
            <Text3 />
        </div>
    );
}

const Safer3 = React.memo(function Safer3() {
    return (
        <div className="h-[305.235px] relative rounded-[27.424px] shrink-0 w-[240px]" data-name="Safer">
            <Lights3 />
            <div className="absolute flex h-[307.374px] items-center justify-center left-[0.02px] top-[0.02px] w-[239.957px]" style={{ "--transform-inner-width": "103.46875", "--transform-inner-height": "38" } as React.CSSProperties}>
                <div className="flex-none rotate-[-90deg]">
                    <Card3 />
                </div>
            </div>
        </div>
    );
});

function Lights4() {
    return (
        <div className="absolute h-[303.931px] left-[1.16px] overflow-clip top-[1.16px] w-[237.66px]" data-name="Lights">
            <div className="absolute bg-[#050505] h-[303.931px] left-0 rounded-[17.139px] top-0 w-[237.66px]">
                <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_4.57px_27.422px_-7.998px_rgba(146,235,180,0.4)]" />
            </div>
            <div className="absolute bottom-[-3.67px] h-[259px] left-[calc(50%+0.02px)] translate-x-[-50%] w-[270px]" data-name="liftapp">
                <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                    <div className="absolute bg-gradient-to-b from-[25.977%] from-[rgba(0,0,0,0)] inset-0 to-[106.06%] to-black" />
                    <div className="absolute inset-0 overflow-hidden">
                        <img alt="" className="absolute max-w-none object-cover size-full scale-[1.25] origin-top" src={imgLiftapp} decoding="async" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function BgElements4() {
    return (
        <div className="absolute contents left-[-221.37px] top-[-263.6px]" data-name="Bg Elements">
            <div className="absolute flex h-[840.295px] items-center justify-center left-[-220.57px] mix-blend-screen top-[-262.8px] w-[726.745px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
                <div className="flex-none rotate-[72.8deg]">
                    <div className="h-[540.234px] relative w-[712.397px]" data-name="Light greyish">
                        <div className="absolute inset-[-15.65%_-11.86%]">
                            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 881.443 709.281">
                                <g filter="url(#filter0_f_1_338)" id="Light greyish" style={{ mixBlendMode: "screen" }}>
                                    <path d={svgPaths.p85e3500} fill="url(#paint0_radial_1_338)" fillOpacity="0.15" />
                                </g>
                                <defs>
                                    <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="709.281" id="filter0_f_1_338" width="881.443" x="0" y="0">
                                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                        <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                                        <feGaussianBlur result="effect1_foregroundBlur_1_338" stdDeviation="42.2616" />
                                    </filter>
                                    <radialGradient cx="0" cy="0" gradientTransform="matrix(-240.145 -255.659 255.436 -240.397 540.257 366.262)" gradientUnits="userSpaceOnUse" id="paint0_radial_1_338" r="1">
                                        <stop offset="0.409332" stopColor="#92EBB4" />
                                        <stop offset="1" stopOpacity="0" />
                                        <stop offset="1" stopColor="#2D2E32" stopOpacity="0" />
                                    </radialGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Text4() {
    const { t } = useLanguage();
    return (
        <div className="absolute contents left-[calc(50%-97.42px)] top-[53.19px] translate-x-[-50%]" data-name="Text">
            <div className="absolute flex h-[131px] items-center justify-center left-[calc(50%-82.92px)] top-[53.99px] translate-x-[-50%] w-[23px]" style={{ "--transform-inner-width": "99.03125", "--transform-inner-height": "19" } as React.CSSProperties}>
                <div className="flex-none rotate-[90deg]">
                    <p className="bg-clip-text bg-gradient-to-b css-ew64yg font-['Sora:SemiBold',sans-serif] font-semibold from-[43.103%] from-white leading-[23px] relative text-[19px] text-center to-[rgba(255,255,255,0)] tracking-[-0.38px]" style={{ WebkitTextFillColor: "transparent" }}>
                        Alaa Abdullah
                    </p>
                </div>
            </div>
            <div className="absolute flex h-[129px] items-center justify-center left-[calc(50%-114.92px)] top-[54.99px] translate-x-[-50%] w-[17px]" style={{ "--transform-inner-width": "131.09375", "--transform-inner-height": "19" } as React.CSSProperties}>
                <div className="flex-none rotate-[90deg]">
                    <p className="css-ew64yg font-['Sora:Regular',sans-serif] font-normal leading-[17px] relative text-[14px] text-[rgba(255,255,255,0.5)] text-center">{t('Quality Assurance')}</p>
                </div>
            </div>
        </div>
    );
}

function Card4() {
    return (
        <div className="h-[239.946px] overflow-clip relative rounded-[18.282px] w-[307.359px]" data-name="Card">
            <div
                className="absolute inset-0 pointer-events-none rounded-[18.282px]"
                style={{
                    padding: "0.8px",
                    background: "linear-gradient(to left, #92ebb4 0%, #92ebb4 30%, transparent 100%)",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                }}
            />
            <BgElements4 />
            <Text4 />
        </div>
    );
}

const Safer4 = React.memo(function Safer4() {
    return (
        <div className="h-[305.22px] relative rounded-[27.422px] shrink-0 w-[239.988px]" data-name="Safer">
            <Lights4 />
            <div className="absolute flex h-[307.359px] items-center justify-center left-[0.02px] top-[0.01px] w-[239.946px]" style={{ "--transform-inner-width": "131.09375", "--transform-inner-height": "38" } as React.CSSProperties}>
                <div className="flex-none rotate-[-90deg]">
                    <Card4 />
                </div>
            </div>
        </div>
    );
});

function Frame1() {
    return (
        <div className="flex flex-wrap gap-[24px] items-center justify-center w-full px-4">
            <Safer />
            <Safer1 />
            <Safer2 />
            <Safer3 />
            <Safer4 />
        </div>
    );
}









function MobileLights() {
  return (
    <div className="absolute h-[202.631px] left-[0.78px] overflow-clip top-[0.77px] w-[158.448px]" data-name="MobileLights">
      <div className="absolute bg-black h-[202.631px] left-0 rounded-[11.427px] top-0 w-[158.448px]">
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_3.047px_18.282px_-5.332px_rgba(95,130,191,0.5)]" />
      </div>
      <div className="absolute h-[202.631px] left-0 rounded-[11.427px] top-0 w-[158.448px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[11.427px]">
          <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0)] inset-0 rounded-[11.427px] to-black" />
          <img alt="" className="absolute max-w-none object-cover rounded-[11.427px] size-full scale-[1.3] origin-top" src={imgRectangle2} />
        </div>
      </div>
    </div>
  );
}

function MobileBgElements() {
  return (
    <div className="absolute contents left-[-147.82px] top-[-175.97px]" data-name="Bg Elements">
      <div className="absolute flex h-[560.224px] items-center justify-center left-[-147.06px] mix-blend-screen top-[-175.2px] w-[484.52px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-[72.8deg]">
          <div className="h-[360.174px] relative w-[474.954px]" data-name="Light greyish">
            <div className="absolute inset-[-15.65%_-11.86%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 587.658 472.877">
                <g filter="url(#filter0_f_1_331)" id="Light greyish" style={{ mixBlendMode: "screen" }}>
                  <path d={svgMobilePaths.p3c9714f0} fill="url(#paint0_radial_1_331)" fillOpacity="0.2" />
                </g>
                <defs>
                  <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="472.877" id="filter0_f_1_331" width="587.658" x="0" y="0">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                    <feGaussianBlur result="effect1_foregroundBlur_1_331" stdDeviation="28.1759" />
                  </filter>
                  <radialGradient cx="0" cy="0" gradientTransform="matrix(-160.105 -170.448 170.299 -160.273 360.189 244.187)" gradientUnits="userSpaceOnUse" id="paint0_radial_1_331" r="1">
                    <stop offset="0.409332" stopColor="#5F82BF" />
                    <stop offset="1" stopOpacity="0" />
                    <stop offset="1" stopColor="#2D2E32" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileText() {
  const { t } = useLanguage();
  return (
    <div className="-translate-x-1/2 absolute contents left-[calc(50%-65.28px)] top-[9.89px]" data-name="MobileText">
      <div className="-translate-x-1/2 absolute flex h-[139px] items-center justify-center left-[calc(50%-55.61px)] top-[10.65px] w-[16px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <p className="bg-clip-text bg-gradient-to-b font-['Sora:SemiBold',sans-serif] font-semibold from-[43.103%] from-white leading-[15.334px] relative text-[12.668px] text-[transparent] text-center to-[rgba(255,255,255,0)] tracking-[-0.2534px] whitespace-nowrap">Mohamed Neamatalla</p>
        </div>
      </div>
      <div className="-translate-x-1/2 absolute flex h-[84px] items-center justify-center left-[calc(50%-76.95px)] top-[37.98px] w-[12px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <p className="font-['Sora:Regular',sans-serif] font-normal leading-[11.334px] relative text-[11px] text-[rgba(255,255,255,0.5)] text-center whitespace-nowrap">{t('Founder & CEO')}</p>
        </div>
      </div>
    </div>
  );
}

function MobileCard() {
  return (
    <div className="border-[#5f82bf] border-[0.762px] border-solid h-[159.972px] overflow-clip relative rounded-[12.188px] w-[204.916px]" data-name="MobileCard">
      <MobileBgElements />
      <MobileText />
    </div>
  );
}

function MobileSafer() {
  return (
    <div className="absolute h-[203.49px] left-[20px] rounded-[17.181px] top-[80px] w-[160px]" data-name="MobileSafer">
      <MobileLights />
      <div className="absolute flex h-[204.916px] items-center justify-center left-[0.02px] top-[0.01px] w-[159.972px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <MobileCard />
        </div>
      </div>
    </div>
  );
}

function MobileLights1() {
  return (
    <div className="absolute h-[202.143px] left-[0.77px] overflow-clip top-[0.77px] w-[158.066px]" data-name="MobileLights">
      <div className="absolute bg-black h-[202.143px] left-0 rounded-[11.399px] top-0 w-[158.066px]">
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_3.04px_18.238px_-5.32px_rgba(255,166,154,0.5)]" />
      </div>
      <div className="absolute h-[202.143px] left-0 rounded-[11.399px] top-0 w-[158.066px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[11.399px]">
          <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0)] inset-0 rounded-[11.399px] to-black" />
          <img alt="" className="absolute max-w-none object-cover rounded-[11.399px] size-full scale-[1.3] origin-top" src={imgRectangle3} />
        </div>
      </div>
    </div>
  );
}

function MobileBgElements1() {
  return (
    <div className="absolute contents left-[-147.45px] top-[-175.55px]" data-name="Bg Elements">
      <div className="absolute flex h-[558.875px] items-center justify-center left-[-146.69px] mix-blend-screen top-[-174.79px] w-[483.354px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-[72.8deg]">
          <div className="h-[359.307px] relative w-[473.811px]" data-name="Light greyish">
            <div className="absolute inset-[-15.65%_-11.86%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 586.243 471.738">
                <g filter="url(#filter0_f_1_325)" id="Light greyish" style={{ mixBlendMode: "screen" }}>
                  <path d={svgMobilePaths.p30f98800} fill="url(#paint0_radial_1_325)" fillOpacity="0.2" />
                </g>
                <defs>
                  <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="471.738" id="filter0_f_1_325" width="586.243" x="0" y="0">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                    <feGaussianBlur result="effect1_foregroundBlur_1_325" stdDeviation="28.1079" />
                  </filter>
                  <radialGradient cx="0" cy="0" gradientTransform="matrix(-159.719 -170.037 169.889 -159.887 359.322 243.599)" gradientUnits="userSpaceOnUse" id="paint0_radial_1_325" r="1">
                    <stop offset="0.409332" stopColor="#FFA69A" />
                    <stop offset="1" stopOpacity="0" />
                    <stop offset="1" stopColor="#2D2E32" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileText1() {
  const { t } = useLanguage();
  return (
    <div className="-translate-x-1/2 absolute contents left-[calc(50%-65.14px)] top-[25.22px]" data-name="MobileText">
      <div className="-translate-x-1/2 absolute flex h-[74px] items-center justify-center left-[calc(50%-55.5px)] top-[43.22px] w-[16px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <p className="bg-clip-text bg-gradient-to-b font-['Sora:SemiBold',sans-serif] font-semibold from-[43.103%] from-white leading-[15.296px] relative text-[12.636px] text-[transparent] text-center to-[rgba(255,255,255,0)] tracking-[-0.2527px] whitespace-nowrap">Alia Mahran</p>
        </div>
      </div>
      <div className="-translate-x-1/2 absolute flex h-[109px] items-center justify-center left-[calc(50%-76.77px)] top-[25.98px] w-[12px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <p className="font-['Sora:Regular',sans-serif] font-normal leading-[11.306px] relative text-[11px] text-[rgba(255,255,255,0.5)] text-center whitespace-nowrap">{t('Operation Manager')}</p>
        </div>
      </div>
    </div>
  );
}

function MobileCard1() {
  return (
    <div className="border-[#ffa69a] border-[0.76px] border-solid h-[159.586px] overflow-clip relative rounded-[12.159px] w-[204.423px]" data-name="MobileCard">
      <MobileBgElements1 />
      <MobileText1 />
    </div>
  );
}

function MobileSafer1() {
  return (
    <div className="absolute h-[203px] left-[calc(50%+7.5px)] rounded-[18.238px] top-[80px] w-[159.615px]" data-name="MobileSafer">
      <MobileLights1 />
      <div className="absolute flex h-[204.423px] items-center justify-center left-[0.02px] top-[0.01px] w-[159.586px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <MobileCard1 />
        </div>
      </div>
    </div>
  );
}

function MobileLights2() {
  return (
    <div className="absolute h-[203.139px] left-[0.78px] overflow-clip top-[0.78px] w-[158.845px]" data-name="MobileLights">
      <div className="absolute bg-black h-[203.139px] left-0 rounded-[11.455px] top-0 w-[158.845px]">
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_3.055px_18.328px_-5.346px_rgba(253,230,138,0.5)]" />
      </div>
      <div className="absolute h-[203.139px] left-0 rounded-[11.455px] top-0 w-[158.845px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[11.455px]">
          <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0)] inset-0 rounded-[11.455px] to-black" />
          <div className="absolute inset-0 overflow-hidden rounded-[11.455px]">
            <img alt="" className="absolute max-w-none object-cover rounded-[11.455px] size-full scale-[1.25] origin-top" src={imgRectangle4} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileBgElements2() {
  return (
    <div className="absolute contents left-[-148.18px] top-[-176.41px]" data-name="Bg Elements">
      <div className="absolute flex h-[561.628px] items-center justify-center left-[-147.42px] mix-blend-screen top-[-175.65px] w-[485.735px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-[72.8deg]">
          <div className="h-[361.077px] relative w-[476.145px]" data-name="Light greyish">
            <div className="absolute inset-[-15.65%_-11.86%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 589.131 474.062">
                <g filter="url(#filter0_f_1_323)" id="Light greyish" style={{ mixBlendMode: "screen" }}>
                  <path d={svgMobilePaths.p1b3e6200} fill="url(#paint0_radial_1_323)" fillOpacity="0.2" />
                </g>
                <defs>
                  <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="474.062" id="filter0_f_1_323" width="589.131" x="0" y="0">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                    <feGaussianBlur result="effect1_foregroundBlur_1_323" stdDeviation="28.2464" />
                  </filter>
                  <radialGradient cx="0" cy="0" gradientTransform="matrix(-160.506 -170.875 170.726 -160.674 361.092 244.799)" gradientUnits="userSpaceOnUse" id="paint0_radial_1_323" r="1">
                    <stop offset="0.409332" stopColor="#FDE68A" />
                    <stop offset="1" stopOpacity="0" />
                    <stop offset="1" stopColor="#2D2E32" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileText2() {
  const { t } = useLanguage();
  return (
    <div className="-translate-x-1/2 absolute contents left-[calc(50%-65.43px)] top-[37.99px]" data-name="MobileText">
      <div className="-translate-x-1/2 absolute flex h-[82px] items-center justify-center left-[calc(50%-55.73px)] top-[38.76px] w-[16px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <p className="bg-clip-text bg-gradient-to-b font-['Sora:SemiBold',sans-serif] font-semibold from-[43.103%] from-white leading-[15.372px] relative text-[12.698px] text-[transparent] text-center to-[rgba(255,255,255,0)] tracking-[-0.254px] whitespace-nowrap">Omar Maged</p>
        </div>
      </div>
      <div className="-translate-x-1/2 absolute flex h-[78px] items-center justify-center left-[calc(50%-77.13px)] top-[40.98px] w-[12px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <p className="font-['Sora:Regular',sans-serif] font-normal leading-[11.362px] relative text-[11px] text-[rgba(255,255,255,0.5)] text-center whitespace-nowrap">{t('Tech Manager')}</p>
        </div>
      </div>
    </div>
  );
}

function MobileCard2() {
  return (
    <div className="border-[#fcd34d] border-[0.764px] border-solid h-[160.373px] overflow-clip relative rounded-[12.219px] w-[205.43px]" data-name="MobileCard">
      <MobileBgElements2 />
      <MobileText2 />
    </div>
  );
}

function MobileSafer2() {
  return (
    <div className="absolute h-[204px] left-[20px] rounded-[18.328px] top-[298px] w-[160.401px]" data-name="MobileSafer">
      <MobileLights2 />
      <div className="absolute flex h-[205.43px] items-center justify-center left-[0.02px] top-[0.01px] w-[160.373px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <MobileCard2 />
        </div>
      </div>
    </div>
  );
}

function MobileLights3() {
  return (
    <div className="absolute h-[202.631px] left-[0.78px] overflow-clip top-[0.77px] w-[158.448px]" data-name="MobileLights">
      <div className="absolute bg-black h-[202.631px] left-0 rounded-[11.427px] top-0 w-[158.448px]">
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_3.047px_18.282px_-5.332px_rgba(146,235,180,0.5)]" />
      </div>
      <div className="absolute h-[202.631px] left-0 rounded-[11.427px] top-0 w-[158.448px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[11.427px]">
          <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0)] inset-0 rounded-[11.427px] to-black" />
          <img alt="" className="absolute max-w-none object-cover rounded-[11.427px] size-full scale-[1.25] origin-top" src={imgLiftapp} />
        </div>
      </div>
    </div>
  );
}

function MobileBgElements3() {
  return (
    <div className="absolute contents left-[-147.82px] top-[-175.97px]" data-name="Bg Elements">
      <div className="absolute flex h-[560.224px] items-center justify-center left-[-147.05px] mix-blend-screen top-[-175.21px] w-[484.52px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-[72.8deg]">
          <div className="h-[360.174px] relative w-[474.954px]" data-name="Light greyish">
            <div className="absolute inset-[-15.65%_-11.86%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 587.658 472.877">
                <g filter="url(#filter0_f_1_315)" id="Light greyish" style={{ mixBlendMode: "screen" }}>
                  <path d={svgMobilePaths.p24716d00} fill="url(#paint0_radial_1_315)" fillOpacity="0.2" />
                </g>
                <defs>
                  <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="472.877" id="filter0_f_1_315" width="587.658" x="0" y="0">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                    <feGaussianBlur result="effect1_foregroundBlur_1_315" stdDeviation="28.1758" />
                  </filter>
                  <radialGradient cx="0" cy="0" gradientTransform="matrix(-160.105 -170.448 170.299 -160.273 360.189 244.187)" gradientUnits="userSpaceOnUse" id="paint0_radial_1_315" r="1">
                    <stop offset="0.409332" stopColor="#92EBB4" />
                    <stop offset="1" stopOpacity="0" />
                    <stop offset="1" stopColor="#2D2E32" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileText3() {
  const { t } = useLanguage();
  return (
    <div className="-translate-x-1/2 absolute contents left-[calc(50%-65.28px)] top-[29.22px]" data-name="MobileText">
      <div className="-translate-x-1/2 absolute flex h-[88px] items-center justify-center left-[calc(50%-55.61px)] top-[36px] w-[16px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <p className="bg-clip-text bg-gradient-to-b font-['Sora:SemiBold',sans-serif] font-semibold from-[43.103%] from-white leading-[15.334px] relative text-[12.667px] text-[transparent] text-center to-[rgba(255,255,255,0)] tracking-[-0.2533px] whitespace-nowrap">Alaa Abdullah</p>
        </div>
      </div>
      <div className="-translate-x-1/2 absolute flex h-[101px] items-center justify-center left-[calc(50%-76.95px)] top-[29.98px] w-[12px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <p className="font-['Sora:Regular',sans-serif] font-normal leading-[11.334px] relative text-[11px] text-[rgba(255,255,255,0.5)] text-center whitespace-nowrap">{t('Quality Assurance')}</p>
        </div>
      </div>
    </div>
  );
}

function MobileCard3() {
  return (
    <div className="border-[#92ebb4] border-[0.762px] border-solid h-[159.972px] overflow-clip relative rounded-[12.188px] w-[204.916px]" data-name="MobileCard">
      <MobileBgElements3 />
      <MobileText3 />
    </div>
  );
}

function MobileSafer3() {
  return (
    <div className="absolute h-[203.49px] left-[calc(50%+7.5px)] rounded-[18.282px] top-[298.25px] w-[160px]" data-name="MobileSafer">
      <MobileLights3 />
      <div className="absolute flex h-[204.916px] items-center justify-center left-[0.02px] top-[0.01px] w-[159.972px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <MobileCard3 />
        </div>
      </div>
    </div>
  );
}

function MobileLights4() {
  return (
    <div className="absolute h-[202.631px] left-[0.78px] overflow-clip top-[0.77px] w-[158.448px]" data-name="MobileLights">
      <div className="absolute bg-black h-[202.631px] left-0 rounded-[11.427px] top-0 w-[158.448px]">
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_3.047px_18.282px_-5.332px_rgba(255,164,55,0.4)]" />
      </div>
      <div className="absolute h-[202.631px] left-0 rounded-[11.427px] top-0 w-[158.448px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[11.427px]">
          <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0)] inset-0 rounded-[11.427px] to-black" />
          <img alt="" className="absolute max-w-none object-cover rounded-[11.427px] size-full scale-[1.3] origin-top" src={imgRectangle5} />
        </div>
      </div>
    </div>
  );
}

function MobileBgElements4() {
  return (
    <div className="absolute contents left-[-147.82px] top-[-175.97px]" data-name="Bg Elements">
      <div className="absolute flex h-[560.224px] items-center justify-center left-[-147.06px] mix-blend-screen top-[-175.21px] w-[484.52px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-[72.8deg]">
          <div className="h-[360.174px] relative w-[474.955px]" data-name="Light greyish">
            <div className="absolute inset-[-15.65%_-11.86%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 587.658 472.877">
                <g filter="url(#filter0_f_1_335)" id="Light greyish" style={{ mixBlendMode: "screen" }}>
                  <path d={svgMobilePaths.p1d11f480} fill="url(#paint0_radial_1_335)" fillOpacity="0.2" />
                </g>
                <defs>
                  <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="472.877" id="filter0_f_1_335" width="587.658" x="0" y="0">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                    <feGaussianBlur result="effect1_foregroundBlur_1_335" stdDeviation="28.1758" />
                  </filter>
                  <radialGradient cx="0" cy="0" gradientTransform="matrix(-160.105 -170.448 170.299 -160.273 360.189 244.187)" gradientUnits="userSpaceOnUse" id="paint0_radial_1_335" r="1">
                    <stop offset="0.409332" stopColor="#FFA437" />
                    <stop offset="1" stopOpacity="0" />
                    <stop offset="1" stopColor="#2D2E32" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileText4() {
  const { t } = useLanguage();
  return (
    <div className="-translate-x-1/2 absolute contents left-[calc(50%-65.19px)] top-[33.24px]" data-name="MobileText">
      <div className="-translate-x-1/2 absolute flex h-[92px] items-center justify-center left-[calc(50%-55.61px)] top-[34.01px] w-[16px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <p className="bg-clip-text bg-gradient-to-b font-['Sora:SemiBold',sans-serif] font-semibold from-[43.103%] from-white leading-[15.333px] relative text-[12.667px] text-[transparent] text-center to-[rgba(255,255,255,0)] tracking-[-0.2533px] whitespace-nowrap">Mariam Chadii</p>
        </div>
      </div>
      <div className="-translate-x-1/2 absolute flex h-[62px] items-center justify-center left-[calc(50%-76.77px)] top-[48.98px] w-[12px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <p className="font-['Sora:Regular',sans-serif] font-normal leading-[11.333px] relative text-[11px] text-[rgba(255,255,255,0.5)] text-center whitespace-nowrap">{t('UI/UX Lead')}</p>
        </div>
      </div>
    </div>
  );
}

function MobileCard4() {
  return (
    <div className="border-[0.762px] border-[rgba(255,164,55,0.7)] border-solid h-[159.972px] overflow-clip relative rounded-[12.188px] w-[204.916px]" data-name="MobileCard">
      <MobileBgElements4 />
      <MobileText4 />
    </div>
  );
}

function MobileSafer4() {
  return (
    <div className="-translate-x-1/2 absolute h-[203.49px] left-[calc(50%+0.5px)] rounded-[18.282px] top-[516.75px] w-[160px]" data-name="MobileSafer">
      <MobileLights4 />
      <div className="absolute flex h-[204.916px] items-center justify-center left-[0.02px] top-[0.01px] w-[159.972px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <MobileCard4 />
        </div>
      </div>
    </div>
  );
}


const CANVAS_WIDTH = 1440;
const CANVAS_HEIGHT = 650;

export default function MeetTheTeam() {
    const { t } = useLanguage();
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const update = () => {
            const scaleX = (window.innerWidth - 60) / CANVAS_WIDTH;
            // On mobile, ensure minimum readable scale
            const minScale = window.innerWidth < 768 ? 0.35 : 0;
            setScale(Math.max(scaleX, minScale));
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    const scaledHeight = CANVAS_HEIGHT * scale;

    const teamMembers = [
        { name: "Mohamed Neamatalla", role: "Founder & CEO", image: imgRectangle2, color: "#5F82BF" },
        { name: "Alia Mahran", role: "Operation Manager", image: imgRectangle3, color: "#FFA69A" },
        { name: "Omar Maged", role: "Tech Manager", image: imgRectangle4, color: "#FDE68A" },
        { name: "Mariam Chadii", role: "UI/UX Lead", image: imgRectangle5, color: "#FFA437" },
        { name: "Alaa Abdullah", role: "Quality Assurance", image: imgLiftapp, color: "#92EBB4" },
    ];

    return (
        <div className="bg-[#020601] relative w-full overflow-hidden">
            {/* Mobile: Responsive Grid from Figma */}
            <div 
                className="lg:hidden relative w-full h-[760px] max-w-[375px] mx-auto overflow-hidden"
                style={{
                    transform: window.innerWidth >= 768 ? `scale(${Math.min(window.innerWidth / 400, 1.8)})` : 'none',
                    transformOrigin: 'top center',
                    height: window.innerWidth >= 768 ? `${760 * Math.min(window.innerWidth / 400, 1.8)}px` : '760px'
                }}
            >
                <p className="absolute top-[40px] left-1/2 -translate-x-1/2 w-[335px] text-center font-['Sora',sans-serif] font-semibold text-[46px] leading-[48px] tracking-[-1.84px] bg-clip-text text-transparent bg-gradient-to-b from-[rgba(255,255,255,0.6)] to-[rgba(20,23,19,0.5)] z-10">
                    {t('Meet The Team')}
                </p>
                <MobileSafer />
                <MobileSafer1 />
                <MobileSafer2 />
                <MobileSafer3 />
                <MobileSafer4 />
            </div>

            {/* Desktop: Scaled canvas */}
            <div className="hidden lg:block" style={{ height: `${scaledHeight}px` }}>
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center"
                    style={{
                        width: `${CANVAS_WIDTH}px`,
                        height: `${CANVAS_HEIGHT}px`,
                        transform: `scale(${scale})`,
                        transformOrigin: "top center"
                    }}
                >
                    <p className="bg-clip-text bg-gradient-to-b font-['Sora',sans-serif] font-semibold from-[rgba(255,255,255,0.5)] leading-[165px] text-[168px] text-center to-[rgba(20,23,19,0.5)] tracking-[-6.72px] text-transparent w-full z-0 mb-[1px] select-none pointer-events-none mt-[40px]">
                        {t('Meet The Team')}
                    </p>
                    <div className="relative z-10 w-full">
                        <Frame1 />
                    </div>
                </div>
            </div>
        </div>
    );
}
