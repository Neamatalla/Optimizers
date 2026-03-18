import svgPaths from "../imports/svg-b7s26w7uh3";
import imgFrequentlyAskedQuestions from "figma:asset/c99f81d2182c6749e9b2c210527ba0ddc78c7cee.png";

function DivBtnLabel() {
  return (
    <div className="content-stretch flex items-start justify-center pr-[0.5px] relative shrink-0" data-name="div.btn-label">
      <div className="flex flex-col font-['Sora',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white whitespace-nowrap">
        <p className="leading-[21.6px]">Still have questions? Book a Call</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="bg-[#020601] relative rounded-[100px] shrink-0" data-name="Link">
      <div className="content-stretch flex items-center justify-center overflow-clip px-[24px] py-[12px] relative rounded-[inherit]">
        <DivBtnLabel />
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0px_30px_0px_rgba(106,228,153,0.6)]" />
      <div aria-hidden="true" className="absolute border border-[#6ae499] border-solid inset-0 pointer-events-none rounded-[100px]" />
    </div>
  );
}

function Frame() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex flex-col gap-[20px] items-center left-1/2 top-[calc(50%-272px)] w-[335px]">
      <p className="bg-center bg-clip-text bg-cover bg-no-repeat font-['Sora',sans-serif] font-semibold leading-[40px] min-w-full relative shrink-0 text-[36px] text-[transparent] text-center tracking-[-1.44px] w-[min-content]" style={{ backgroundImage: `url('${imgFrequentlyAskedQuestions}')` }}>
        Frequently Asked Questions
      </p>
      <Link />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[12px] items-start min-h-px min-w-px relative">
      <p className="font-['Sora',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[16px] text-white w-full">What ROI can I expect?</p>
      <p className="font-['Sora',sans-serif] font-normal leading-[19px] relative shrink-0 text-[14px] text-[rgba(255,255,255,0.7)] w-full">On average, our clients see a 10–30% increase in annual revenue and cover the cost of our services within 6 months.</p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
      <Frame3 />
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none">
          <div className="overflow-clip relative size-[20px]" data-name="Linear / Arrows / Alt Arrow Down">
            <div className="absolute inset-[37.5%_20.83%]" data-name="Vector">
              <div className="absolute inset-[-12.5%_-5.36%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.9167 6.25001">
                  <path d={svgPaths.p3dd17100} id="Vector" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="bg-[rgba(81,81,81,0.2)] relative rounded-[12px] shrink-0 w-[335px]">
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip p-[16px] relative rounded-[inherit] w-full">
        <Frame4 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#31da72] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
      <p className="font-['Sora',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[16px] text-white w-full">How quickly will I see results?</p>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
      <Frame7 />
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Linear / Arrows / Alt Arrow Down">
        <div className="absolute inset-[37.5%_20.83%]" data-name="Vector">
          <div className="absolute inset-[-12.5%_-5.36%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.9167 6.25001">
              <path d={svgPaths.p3dd17100} id="Vector" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame5() {
  return (
    <div className="bg-[rgba(81,81,81,0.2)] relative rounded-[12px] shrink-0 w-[335px]">
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip p-[16px] relative rounded-[inherit] w-full">
        <Frame6 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#31da72] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
      <p className="font-['Sora',sans-serif] font-semibold leading-[22px] relative shrink-0 text-[16px] text-white w-full">What's the minimum commitment?</p>
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
      <Frame10 />
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Linear / Arrows / Alt Arrow Down">
        <div className="absolute inset-[37.5%_20.83%]" data-name="Vector">
          <div className="absolute inset-[-12.5%_-5.36%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.9167 6.25001">
              <path d={svgPaths.p3dd17100} id="Vector" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame8() {
  return (
    <div className="bg-[rgba(81,81,81,0.2)] relative rounded-[12px] shrink-0 w-[335px]">
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip p-[16px] relative rounded-[inherit] w-full">
        <Frame9 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#31da72] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
      <p className="font-['Sora',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[16px] text-white w-full">Why is CRO a monthly service?</p>
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
      <Frame13 />
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Linear / Arrows / Alt Arrow Down">
        <div className="absolute inset-[37.5%_20.83%]" data-name="Vector">
          <div className="absolute inset-[-12.5%_-5.36%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.9167 6.25001">
              <path d={svgPaths.p3dd17100} id="Vector" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame11() {
  return (
    <div className="bg-[rgba(81,81,81,0.2)] relative rounded-[12px] shrink-0 w-[335px]">
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip p-[16px] relative rounded-[inherit] w-full">
        <Frame12 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#31da72] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Frame16() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
      <p className="font-['Sora',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[16px] text-white w-full">Is CRO only for big stores?</p>
    </div>
  );
}

function Frame15() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
      <Frame16 />
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Linear / Arrows / Alt Arrow Down">
        <div className="absolute inset-[37.5%_20.83%]" data-name="Vector">
          <div className="absolute inset-[-12.5%_-5.36%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.9167 6.25001">
              <path d={svgPaths.p3dd17100} id="Vector" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame14() {
  return (
    <div className="bg-[rgba(81,81,81,0.2)] relative rounded-[12px] shrink-0 w-[335px]">
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip p-[16px] relative rounded-[inherit] w-full">
        <Frame15 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#31da72] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Frame19() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative">
      <p className="font-['Sora',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[16px] text-white w-full">What metrics do you track?</p>
    </div>
  );
}

function Frame18() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
      <Frame19 />
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="Linear / Arrows / Alt Arrow Down">
        <div className="absolute inset-[37.5%_20.83%]" data-name="Vector">
          <div className="absolute inset-[-12.5%_-5.36%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.9167 6.25001">
              <path d={svgPaths.p3dd17100} id="Vector" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame17() {
  return (
    <div className="bg-[rgba(81,81,81,0.2)] relative rounded-[12px] shrink-0 w-[335px]">
      <div className="content-stretch flex flex-col items-center justify-center overflow-clip p-[16px] relative rounded-[inherit] w-full">
        <Frame18 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#31da72] border-solid inset-0 pointer-events-none rounded-[12px]" />
    </div>
  );
}

function Frame1() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex flex-col gap-[12px] items-end left-1/2 top-[242px]">
      <Frame2 />
      <Frame5 />
      <Frame8 />
      <Frame11 />
      <Frame14 />
      <Frame17 />
    </div>
  );
}

export default function App() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-[#020601] relative w-[375px] h-[786px] overflow-hidden" data-name="Component 337">
        <Frame />
        <Frame1 />
      </div>
    </div>
  );
}
