import { useRef, useState, useEffect } from "react";
import clsx from "clsx";
import imgOurProvenConversionOptimizationProcess from "../assets/f107a7f40e4d7ea19ffc42c38dbf8e17414a5f3b.webp";
import { AnimatedProcessCard } from "./AnimatedProcessCard";
import { AnimatedBeforeCard } from "./AnimatedBeforeCard";

type ProcessBackgroundImageProps = {
    additionalClassNames?: string;
    noRotation?: boolean;
};

function ProcessBackgroundImage({ children, additionalClassNames = "", noRotation = false }: React.PropsWithChildren<ProcessBackgroundImageProps>) {
    return (
        <div style={{ "--transform-inner-width": "2", "--transform-inner-height": "2" } as React.CSSProperties} className={clsx("flex h-[589px] items-center justify-center relative w-[570px]", additionalClassNames)}>
            <div className={clsx("flex-none", !noRotation && "rotate-[90deg] scale-y-[-100%]")}>{children}</div>
        </div>
    );
}


export default function ProcessWithAnimation() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [sectionVisible, setSectionVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setSectionVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1, rootMargin: '0px 0px' }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div ref={sectionRef} className="bg-[#020601] relative w-full min-h-0 lg:min-h-screen py-10 lg:py-20 shrink-0 overflow-hidden flex flex-col items-center gap-6 lg:gap-10" data-name="Process">

            {/* Title Section */}
            <div className="flex flex-col gap-[24px] lg:gap-[32px] items-center text-center z-10 px-4 max-w-full">
                <p className="bg-center bg-clip-text bg-cover bg-no-repeat font-['Sora:SemiBold',sans-serif] font-semibold leading-[1.2] relative shrink-0 text-[32px] lg:text-[72px] text-center tracking-[-2px] lg:tracking-[-2.88px] w-full max-w-[935px]" style={{ WebkitTextFillColor: "transparent", backgroundImage: `url('${imgOurProvenConversionOptimizationProcess}')` }}>
                    Our Proven Conversion Optimization Process
                </p>
                <p className="font-['Sora:Regular',sans-serif] font-normal leading-[22px] lg:leading-[28px] relative shrink-0 text-[14px] lg:text-[20px] text-[rgba(255,255,255,0.8)] text-center w-full max-w-[797px]">We follow a systematic 6-step approach that has generated millions in additional revenue for e-commerce brands across the GCC.</p>
                {/* CTA button — hidden on mobile to reduce CTA spam */}
                <div className="hidden lg:block">
                    <div className="bg-[#020601] h-[50px] relative rounded-[100px] shrink-0 cursor-pointer hover:scale-105 transition-transform" data-name="Link" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                        <div className="content-stretch flex h-full items-center justify-center overflow-clip px-[28px] py-[12px] relative rounded-[inherit]">
                            <div className="content-stretch flex items-start justify-center pl-0 pr-[0.5px] py-0 relative shrink-0" data-name="div.btn-label">
                                <div className="flex flex-col font-['Sora:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[18px] text-center text-nowrap text-white">
                                    <p className="leading-[21.6px]">Book a Free CRO Audit</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0px_30px_0px_rgba(106,228,153,0.6)]" />
                        <div aria-hidden="true" className="absolute border border-[#6ae499] border-solid inset-0 pointer-events-none rounded-[100px]" />
                    </div>
                </div>
            </div>

            {/* Cards Section */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-[40px] lg:gap-20 w-full px-[16px] lg:px-4 relative mt-10 lg:mt-10">
                {/* Before Card */}
                <div className="flex flex-col items-center relative w-full lg:w-auto max-w-[570px]">
                    <p className="font-['Sora:SemiBold',sans-serif] font-semibold text-[24px] lg:text-[88px] text-[rgba(255,255,255,0.2)] text-center tracking-[3.5px] -mb-[12px] lg:-mb-[50px] relative z-0 pl-[12px] lg:pl-0 self-start lg:self-center">Before</p>
                    <div className="relative z-10 w-full aspect-[570/589]" style={{ containerType: 'inline-size' }}>
                        <div className="origin-top-left" style={{ transform: "scale(min(1, calc(100cqw / 570)))", width: "570px", height: "589px" }}>
                            <ProcessBackgroundImage additionalClassNames="" noRotation={true}>
                                <AnimatedBeforeCard sectionVisible={sectionVisible} />
                            </ProcessBackgroundImage>
                        </div>
                    </div>
                </div>

                {/* After Card */}
                <div className="flex flex-col items-center relative w-full lg:w-auto max-w-[570px] mt-6 lg:mt-0">
                    <p className="font-['Sora:SemiBold',sans-serif] font-semibold text-[24px] lg:text-[88px] text-[rgba(255,255,255,0.2)] text-center tracking-[3.5px] -mb-[12px] lg:-mb-[50px] relative z-0 pl-[12px] lg:pl-0 self-start lg:self-center">After</p>
                    <div className="relative z-10 w-full aspect-[570/589]" style={{ containerType: 'inline-size' }}>
                        <div className="origin-top-left" style={{ transform: "scale(min(1, calc(100cqw / 570)))", width: "570px", height: "589px" }}>
                            <ProcessBackgroundImage additionalClassNames="" noRotation={true}>
                                <AnimatedProcessCard sectionVisible={sectionVisible} />
                            </ProcessBackgroundImage>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
