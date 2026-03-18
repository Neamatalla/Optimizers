import React from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/app/components/ui/accordion";
import imgFrequentlyAskedQuestions from "../assets/666a6dfa4c8f6032da118c9f1f873233b2397282.webp";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const faqData = [
    {
        id: "item-1",
        question: "What ROI can I expect?",
        answer:
            "On average, our clients see a 10–30% increase in annual revenue and cover the cost of our services within 6 months.",
        defaultOpen: true,
    },
    {
        id: "item-2",
        question: "How quickly will I see results?",
        answer:
            "Most stores see measurable improvements in as little as 3 months — with bigger gains from continuous testing.",
        defaultOpen: false,
    },
    {
        id: "item-3",
        question: "What's the minimum commitment?",
        answer:
            "Just 6 months — enough to run real experiments and lock in lasting results. Many clients stay for years because of consistent growth.",
        defaultOpen: false,
    },
    {
        id: "item-4",
        question: "Why is CRO a monthly service?",
        answer:
            "Because conversion optimization is not a one-time fix — it's a continuous cycle of research, testing, and scaling what works.",
        defaultOpen: false,
    },
    {
        id: "item-5",
        question: "Is CRO only for big stores?",
        answer:
            "Not at all. Any store spending on ads or getting steady traffic can benefit from CRO. Smaller stores often see ROI even faster.",
        defaultOpen: false,
    },
    {
        id: "item-6",
        question: "What metrics do you track?",
        answer:
            "Conversion rate, revenue per visitor, average order value, cart abandonment, and customer lifetime value.",
        defaultOpen: false,
    },
];

function DivBtnLabel() {
    return (
        <div className="content-stretch flex items-start justify-center pr-[0.5px] relative shrink-0" data-name="div.btn-label">
            <div className="css-g0mm18 flex flex-col font-['Sora:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[14px] lg:text-[18px] text-center text-white whitespace-nowrap lg:whitespace-normal">
                <p className="css-ew64yg leading-[21.6px]">Still have questions? Book a Call</p>
            </div>
        </div>
    );
}

function Link() {
    return (
        <div className="bg-[#020601] h-[50px] relative rounded-[100px] shrink-0 cursor-pointer hover:opacity-80 transition-opacity shadow-[0px_0px_25px_rgba(106,228,153,0.3)]" data-name="Link" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
            <div className="content-stretch flex h-full items-center justify-center overflow-clip px-[24px] lg:px-[28px] py-[12px] relative rounded-[inherit]">
                <DivBtnLabel />
            </div>
            <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0px_30px_0px_rgba(106,228,153,0.6)]" />
            <div aria-hidden="true" className="absolute border border-[#6ae499] border-solid inset-0 pointer-events-none rounded-[100px]" />
        </div>
    );
}

function Frame19() {
    return (
        <div className="relative flex flex-col gap-[20px] lg:gap-[2.2vw] xl:gap-[3.3vw] items-center lg:items-start w-full lg:w-[31.25vw] shrink-0">
            <p className="bg-center bg-clip-text bg-cover bg-no-repeat css-4hzbpn font-['Sora:SemiBold',sans-serif] font-semibold leading-[40px] lg:leading-[1.1] min-w-full relative shrink-0 text-[36px] lg:text-[78px] text-center lg:text-left tracking-[-1.44px] lg:tracking-[-2px] w-full" style={{ WebkitTextFillColor: "transparent", backgroundImage: `url('${imgFrequentlyAskedQuestions}')` }}>
                Frequently{" "}Asked{" "}Questions
            </p>
            <Link />
        </div>
    );
}

export default function FAQSection() {
    const [headingRef, headingVisible] = useScrollReveal<HTMLDivElement>();
    const [accordionRef, accordionVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.08 });

    return (
        <div className="bg-[#020601] relative size-full min-h-screen pt-[60px] lg:pt-[7vw] pb-[40px] lg:pb-0 px-[20px] lg:px-[2.1vw] overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-[32px] lg:gap-32 items-center lg:items-start lg:w-[85%] lg:max-w-[1440px] mx-auto">
                <div ref={headingRef} className={headingVisible ? 'reveal-visible' : 'reveal-hidden'}>
                    <Frame19 />
                </div>
                <div ref={accordionRef} className={`flex flex-col w-full max-w-[335px] lg:max-w-none gap-[12px] lg:gap-4 ${accordionVisible ? 'reveal-visible' : 'reveal-hidden'} reveal-stagger-1`}>
                    <Accordion
                        type="single"
                        collapsible
                        defaultValue="item-1"
                        className="flex flex-col gap-[12px] lg:gap-4 w-full"
                    >
                        {faqData.map((faq, index) => (
                            <AccordionItem
                                key={faq.id}
                                value={faq.id}
                                className={`relative rounded-[12px] lg:rounded-[16px] shrink-0 bg-[rgba(81,81,81,0.2)] lg:bg-[#0a0f0a] overflow-hidden group ${accordionVisible ? 'reveal-visible' : 'reveal-hidden'} reveal-stagger-${index}`}
                            >
                                {/* Border: gradient corner highlights for all viewports */}
                                <div
                                    className="absolute inset-0 pointer-events-none rounded-[12px] lg:rounded-[16px]"
                                    style={{
                                        padding: "1px",
                                        background: "radial-gradient(ellipse 50% 60% at 0% 0%, #4ade80 0%, transparent 100%), radial-gradient(ellipse 50% 60% at 100% 100%, #4ade80 0%, transparent 100%)",
                                        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                        WebkitMaskComposite: "xor",
                                        maskComposite: "exclude",
                                    }}
                                />

                                <AccordionTrigger className="flex items-center justify-between gap-[8px] lg:gap-4 w-full p-[16px] lg:p-[32px] hover:no-underline [&[data-state=open]>svg]:rotate-180 [&>svg]:size-5 lg:[&>svg]:size-8 [&>svg]:text-white [&[data-state=open]_.question-text]:text-white text-white font-['Sora',sans-serif] cursor-pointer">
                                    <div className="question-text text-[16px] lg:text-[24px] font-semibold lg:font-bold leading-[24px] lg:leading-tight text-left transition-colors duration-300">
                                        {faq.question}
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent className="w-full pb-[16px] lg:pb-[32px] px-[16px] lg:px-[32px] pt-0">
                                    <div className="text-[14px] lg:text-[18px] font-normal leading-[19px] lg:leading-relaxed text-[rgba(255,255,255,0.7)] text-left font-['Sora',sans-serif]">
                                        {faq.answer}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </div>
    );
}
