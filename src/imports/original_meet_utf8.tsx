import React, { useState, useEffect } from "react";
import svgPaths from "./svg-67sjau8p5h";
import imgRectangle2 from "../assets/8beafb71ac0e56f696268857cdb1244ee06d2dcc.png";
import imgRectangle3 from "../assets/4f11d4feb717671a4fc30f59979ff4c1bbb1eeb2.png";
import imgRectangle4 from "../assets/2360b5bdc64c7364378a5a9d57d3b75bc52915d7.png";
import imgRectangle5 from "../assets/74dadc14d70527de322c8a12cd44546b63f3fcd5.png";
import imgLiftapp from "../assets/3ea05da11c2980d6a66b2e7e7d24667e55eea21a.png";

function Lights() {
    return (
        <div className="absolute h-[303.926px] left-[1.16px] overflow-clip top-[1.16px] w-[237.656px]" data-name="Lights">
            <div className="absolute bg-[#050505] h-[303.926px] left-0 rounded-[17.139px] top-0 w-[237.656px]">
                <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_4.57px_27.422px_-7.998px_rgba(95,130,191,0.8)]" />
            </div>
            <div className="absolute h-[387px] left-[calc(50%-0.49px)] rounded-[17.139px] top-[-5.41px] translate-x-[-50%] w-[303px]">
                <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[17.139px]">
                    <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0)] inset-0 rounded-[17.139px] to-black" />
                    <div className="absolute inset-0 opacity-80 overflow-hidden rounded-[17.139px]">
                        <img alt="" className="absolute h-full left-[-13.94%] max-w-none top-0 w-[127.88%]" src={imgRectangle2} />
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
                                    <path d={svgPaths.p4ca9700} fill="url(#paint0_radial_1_328)" fillOpacity="0.4" />
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
                    <p className="css-ew64yg font-['Sora:Regular',sans-serif] font-normal leading-[17px] relative text-[14px] text-[rgba(255,255,255,0.5)] text-center">{`Founder & CEO`}</p>
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

function Safer() {
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
}

function Lights1() {
    return (
        <div className="absolute h-[303.946px] left-[1.16px] overflow-clip top-[1.16px] w-[237.672px]" data-name="Lights">
            <div className="absolute bg-[#050505] h-[303.946px] left-0 rounded-[17.14px] top-0 w-[237.672px]">
                <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_4.571px_27.424px_-7.999px_rgba(255,166,154,0.6)]" />
            </div>
            <div className="absolute h-[368px] left-[calc(50%+0.02px)] rounded-[17.14px] top-[-9.39px] translate-x-[-50%] w-[288px]">
                <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[17.14px]">
                    <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0)] inset-0 rounded-[17.14px] to-black" />
                    <img alt="" className="absolute max-w-none object-cover opacity-80 rounded-[17.14px] size-full" src={imgRectangle3} />
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
                                    <path d={svgPaths.p35b78a00} fill="url(#paint0_radial_1_322)" fillOpacity="0.3" />
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
                    <p className="css-ew64yg font-['Sora:Regular',sans-serif] font-normal leading-[17px] relative text-[14px] text-[rgba(255,255,255,0.5)] text-center">Operation Manager</p>
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

function Safer1() {
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
}

function Lights2() {
    return (
        <div className="absolute h-[303.946px] left-[1.16px] overflow-clip top-[1.17px] w-[237.672px]" data-name="Lights">
            <div className="absolute bg-[#050505] h-[303.946px] left-0 rounded-[17.14px] top-0 w-[237.672px]">
                <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_4.571px_27.424px_-7.999px_rgba(253,230,138,0.6)]" />
            </div>
            <div className="absolute h-[367px] left-[calc(50%-11.48px)] rounded-[17.14px] top-[-4.41px] translate-x-[-50%] w-[287px]">
                <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[17.14px]">
                    <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0)] inset-0 rounded-[17.14px] to-black" />
                    <div className="absolute inset-0 opacity-80 overflow-hidden rounded-[17.14px]">
                        <img alt="" className="absolute h-[100.47%] left-[-15.83%] max-w-none top-[-0.12%] w-[131.25%]" src={imgRectangle4} />
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
                                    <path d={svgPaths.p35b78a00} fill="url(#paint0_radial_1_324)" fillOpacity="0.3" />
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
                    <p className="css-ew64yg font-['Sora:Regular',sans-serif] font-normal leading-[17px] relative text-[14px] text-[rgba(255,255,255,0.5)] text-center">Tech Manager</p>
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

function Safer2() {
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
}

function Lights3() {
    return (
        <div className="absolute h-[303.946px] left-[1.16px] overflow-clip top-[1.16px] w-[237.672px]" data-name="Lights">
            <div className="absolute bg-[#050505] h-[303.946px] left-0 rounded-[17.14px] top-0 w-[237.672px]">
                <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_4.571px_27.424px_-7.999px_rgba(255,164,55,0.6)]" />
            </div>
            <div className="absolute h-[325px] left-[calc(50%+0.02px)] rounded-[17.14px] top-[-10.4px] translate-x-[-50%] w-[254px]">
                <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[17.14px]">
                    <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0)] inset-0 rounded-[17.14px] to-black" />
                    <img alt="" className="absolute max-w-none object-cover opacity-80 rounded-[17.14px] size-full" src={imgRectangle5} />
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
                                    <path d={svgPaths.p35b78a00} fill="url(#paint0_radial_1_312)" fillOpacity="0.3" />
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
                    <p className="css-ew64yg font-['Sora:Regular',sans-serif] font-normal leading-[17px] relative text-[14px] text-[rgba(255,255,255,0.5)] text-center">UI/UX Lead</p>
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

function Safer3() {
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
}

function Lights4() {
    return (
        <div className="absolute h-[303.931px] left-[1.16px] overflow-clip top-[1.16px] w-[237.66px]" data-name="Lights">
            <div className="absolute bg-[#050505] h-[303.931px] left-0 rounded-[17.139px] top-0 w-[237.66px]">
                <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_4.57px_27.422px_-7.998px_rgba(146,235,180,0.6)]" />
            </div>
            <div className="absolute bottom-[-3.67px] h-[259px] left-[calc(50%+0.02px)] translate-x-[-50%] w-[270px]" data-name="liftapp">
                <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                    <div className="absolute bg-gradient-to-b from-[25.977%] from-[rgba(0,0,0,0)] inset-0 to-[106.06%] to-black" />
                    <div className="absolute inset-0 opacity-80 overflow-hidden">
                        <img alt="" className="absolute h-[146.22%] left-[-22.56%] max-w-none top-[-24.25%] w-[144.28%]" src={imgLiftapp} />
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
                                    <path d={svgPaths.p85e3500} fill="url(#paint0_radial_1_338)" fillOpacity="0.3" />
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
                    <p className="css-ew64yg font-['Sora:Regular',sans-serif] font-normal leading-[17px] relative text-[14px] text-[rgba(255,255,255,0.5)] text-center">Quality Assurance</p>
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

function Safer4() {
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
}

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

const CANVAS_WIDTH = 1440;
const CANVAS_HEIGHT = 650;

export default function MeetTheTeam() {
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const update = () => {
            const scaleX = (window.innerWidth - 60) / CANVAS_WIDTH;
            // Removed Math.min(..., 1) to allow upscaling to full width
            setScale(scaleX);
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    const scaledHeight = CANVAS_HEIGHT * scale;

    return (
        <div
            className="bg-[#020601] relative w-full overflow-hidden"
            style={{ height: `${scaledHeight}px` }}
        >
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
                    Meet The Team
                </p>
                <div className="relative z-10 w-full">
                    <Frame1 />
                </div>
            </div>
        </div>
    );
}
