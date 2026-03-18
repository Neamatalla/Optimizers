import { useState, useEffect } from "react";
import svgPaths from "./svg-8x44mv6a2l";
import imgWhatMakesCroTheSmarterInvestment from "../assets/1495296c1372cb62f4b13afc83f9acb3d1d29faf.webp";
import { imgAnimatedBeam } from "./svg-cfo9w";

const CANVAS_WIDTH = 1440;
const CANVAS_HEIGHT = 1000;

function Frame() {
  return (
    <div className="relative lg:absolute content-stretch flex flex-col items-center lg:left-0 w-full p-4 lg:p-0">
      <p className="bg-center bg-clip-text bg-cover bg-no-repeat css-4hzbpn font-['Sora:SemiBold',sans-serif] font-semibold leading-[1.2] lg:leading-[69.35px] relative shrink-0 text-[32px] lg:text-[59.443px] text-center tracking-[-2.3777px] w-full" style={{ WebkitTextFillColor: "transparent", backgroundImage: `url('${imgWhatMakesCroTheSmarterInvestment}')` }}>
        What Makes CRO the Smarter Investment
      </p>
    </div>
  );
}

function Beam() {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[400%] pointer-events-none animate-rotate-glow">
      <div
        className="absolute inset-0"
        style={{
          background: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, #31da72 20deg, transparent 40deg, transparent 180deg, #31da72 200deg, transparent 220deg, transparent 360deg)",
          filter: "blur(4px)",
        }}
      />
      <style>{`
        @keyframes rotate-glow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-rotate-glow {
          animation: rotate-glow 12s linear infinite;
        }
      `}</style>
    </div>
  );
}

function AnimatedBeam() {
  return (
    <div
      className="absolute inset-0 pointer-events-none mask-no-repeat"
      style={{
        maskImage: `url('${imgAnimatedBeam}')`,
        WebkitMaskImage: `url('${imgAnimatedBeam}')`,
        maskSize: "100% 100%",
        WebkitMaskSize: "100% 100%"
      }}
    >
      <Beam />
    </div>
  );
}

function BorderBeam() {
  return (
    <div className="absolute inset-[-1px] pointer-events-none rounded-[inherit]" data-name="Border Beam">
      <AnimatedBeam />
    </div>
  );
}

function Head() {
  return (
    <div className="content-stretch flex h-[72px] items-center overflow-clip p-[8px] lg:p-[16px] relative shrink-0 w-[30%]" data-name="Head">
      <p className="css-ew64yg font-['Sora:SemiBold',sans-serif] font-semibold leading-[16px] lg:leading-[28px] relative shrink-0 text-[12px] lg:text-[21px] text-white tracking-[-0.42px]">Feature / Pain Point</p>
    </div>
  );
}

function Head1() {
  return (
    <div className="content-stretch flex h-[72px] items-center justify-center overflow-clip p-[4px] lg:p-[16px] relative shrink-0 w-[23.33%]" data-name="Head">
      <p className="css-4hzbpn flex-[1_0_0] font-['Sora:SemiBold',sans-serif] font-semibold leading-[16px] lg:leading-[21.6px] min-h-px min-w-px relative text-[12px] lg:text-[21px] text-center text-white tracking-[-0.42px]">Running Ads</p>
    </div>
  );
}

function Head2() {
  return (
    <div className="content-stretch flex h-[72px] items-center justify-center overflow-clip p-[4px] lg:p-[16px] relative shrink-0 w-[23.33%]" data-name="Head">
      <p className="css-4hzbpn flex-[1_0_0] font-['Sora:SemiBold',sans-serif] font-semibold leading-[16px] lg:leading-[21.6px] min-h-px min-w-px relative text-[12px] lg:text-[21px] text-center text-white tracking-[-0.42px]">Website Redesign</p>
    </div>
  );
}

function Head3() {
  return (
    <div className="content-stretch flex h-[72px] items-center justify-center overflow-clip p-[4px] lg:p-[16px] relative shrink-0 w-[23.33%]" data-name="Head">
      <p className="css-4hzbpn flex-[1_0_0] font-['Sora:SemiBold',sans-serif] font-semibold leading-[16px] lg:leading-[28px] min-h-px min-w-px relative text-[12px] lg:text-[21px] text-center text-white tracking-[-0.42px]">Conversion Optimization</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex h-[88px] items-center relative shrink-0 w-full">
      <Head />
      <Head1 />
      <Head2 />
      <Head3 />
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-1px_0px_0px_#0a391c]" />
    </div>
  );
}

function Item() {
  return (
    <div className="content-stretch flex h-[56px] items-center overflow-clip px-[16px] relative shrink-0 w-[30%]" data-name="Item">
      <div className="flex flex-col font-['Sora:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[#b8c0cc] text-[18px] w-full">
        <p className="css-4hzbpn leading-[21.6px]">Revenue Growth Without More Ad Spend</p>
      </div>
    </div>
  );
}

function CloseCircle() {
  return (
    <div className="relative shrink-0 size-[44px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
        <g>
          <g filter="url(#filter-close)">
            <path d={svgPaths.p866e000} fill="#FF4329" fillOpacity="0.05" />
          </g>
          <path d={svgPaths.p866e000} stroke="url(#paint-close)" strokeLinecap="round" strokeWidth="0.7" />
          <path d={svgPaths.pda98b40} fill="#FF6B57" />
        </g>
        <defs>
          <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="37.3667" id="filter-close" width="37.3667" x="3.31406" y="3.31797">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
            <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
            <feOffset dy="117.333" />
            <feGaussianBlur stdDeviation="22.9167" />
            <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
            <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.262745 0 0 0 0 0.160784 0 0 0 0.15 0" />
            <feBlend in2="shape" mode="normal" result="effect1_innerShadow" />
          </filter>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint-close" x1="21.9974" x2="21.9974" y1="3.66797" y2="40.3346">
            <stop stopColor="#FF6B57" />
            <stop offset="1" stopColor="#671A10" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function CheckCircle() {
  return (
    <div className="relative shrink-0 size-[44px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
        <g>
          <g filter="url(#filter-check)">
            <path d={svgPaths.p866e000} fill="#6AE499" fillOpacity="0.05" />
          </g>
          <path d={svgPaths.p866e000} stroke="url(#paint-check)" strokeLinecap="round" strokeWidth="0.7" />
          <path d={svgPaths.p7626100} fill="#6AE499" />
        </g>
        <defs>
          <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="37.3667" id="filter-check" width="37.3667" x="3.31406" y="3.31797">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
            <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
            <feOffset dy="117.333" />
            <feGaussianBlur stdDeviation="22.9167" />
            <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.415686 0 0 0 0 0.894118 0 0 0 0 0.6 0 0 0 0.15 0" />
            <feBlend in2="shape" mode="normal" result="effect1_innerShadow" />
          </filter>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint-check" x1="21.9974" x2="21.9974" y1="3.66797" y2="40.3346">
            <stop stopColor="#6AE499" />
            <stop offset="1" stopColor="#0F5228" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function TableRow({ label, ads, redesign, cro }: { label: string; ads: boolean; redesign: boolean; cro: boolean }) {
  return (
    <div className="content-stretch flex min-h-[60px] lg:h-[80px] items-center relative shrink-0 w-full py-2 lg:py-0">
      <div className="content-stretch flex items-center px-[8px] lg:px-[16px] w-[30%]">
        <p className="font-['Sora:SemiBold',sans-serif] font-semibold text-[#b8c0cc] text-[13px] lg:text-[18px] leading-[17px] lg:leading-[22px]">{label}</p>
      </div>
      <div className="flex justify-center items-center w-[23.33%]">{ads ? <CheckCircle /> : <CloseCircle />}</div>
      <div className="flex justify-center items-center w-[23.33%]">{redesign ? <CheckCircle /> : <CloseCircle />}</div>
      <div className="flex justify-center items-center w-[23.33%]">{cro ? <CheckCircle /> : <CloseCircle />}</div>
    </div>
  );
}

function Divider() {
  return (
    <div className="h-0 relative shrink-0 w-full">
      <div className="absolute inset-[-1px_0_0_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1176 1">
          <line stroke="url(#paint0_linear_divider)" strokeOpacity="0.17" x2="1176" y1="0.5" y2="0.5" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_divider" x1="0" x2="1176" y1="1.5" y2="1.5">
              <stop stopColor="#6AE499" />
              <stop offset="0.298077" stopColor="#FF8979" />
              <stop offset="0.615385" stopColor="#FCD34D" />
              <stop offset="1" stopColor="#FEF3C7" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

const tableData = [
  { label: "Revenue Growth Without More Ad Spend", ads: false, redesign: false, cro: true },
  { label: "Low Risk / Data-Driven Decisions", ads: false, redesign: false, cro: true },
  { label: "Fast, Sustainable Results", ads: false, redesign: false, cro: true },
  { label: "Improves All Marketing Channels", ads: false, redesign: false, cro: true },
  { label: "Cost Efficiency / Higher ROI", ads: false, redesign: false, cro: true },
  { label: "Ongoing Improvements (Not One-Off)", ads: false, redesign: false, cro: true }
];

function Frame9() {
  return (
    <div className="relative lg:absolute flex flex-col items-start lg:left-0 w-full overflow-x-auto pb-8 lg:pb-0 px-4 lg:px-0 scrollbar-hide">
      <div className="w-full px-4 lg:px-10">
        <Frame1 />
        {tableData.map((row, idx) => (
          <div key={idx} className="w-full">
            <TableRow {...row} />
            {idx < tableData.length - 1 && <Divider />}
          </div>
        ))}
      </div>
    </div>
  );
}

function Frame8() {
  return (
    <div className="relative lg:absolute flex flex-col items-start lg:left-0 overflow-x-auto lg:overflow-visible lg:rounded-[8px] lg:top-[44px] w-full scrollbar-hide">
      <div className="w-full">
        <Frame9 />
      </div>
    </div>
  );
}

function OverlayBorderShadow() {
  return (
    <div className="absolute h-[640px] left-[30px] right-[30px] max-w-[1200px] mx-auto rounded-[24px] top-[8vw]" data-name="Overlay+Border+Shadow">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Frame8 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#282b27] border-solid inset-[-1px] pointer-events-none rounded-[25px] shadow-[0px_4px_48px_0px_rgba(255,255,255,0.05),0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
      <BorderBeam />
    </div>
  );
}

export default function Table() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const scaleX = window.innerWidth / CANVAS_WIDTH;
      const scaleY = window.innerHeight / CANVAS_HEIGHT;
      setScale(Math.min(scaleX, scaleY, 1));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div className="bg-[#020601] relative w-full shrink-0 overflow-hidden" data-name="Table">
      {/* Mobile View */}
      <div className="lg:hidden flex flex-col gap-10 py-10 px-4">
        <Frame />
        <div className="mt-4">
          <Frame8 />
        </div>
      </div>

      {/* Desktop View — full width layout */}
      <div
        className="hidden lg:block relative w-full overflow-hidden"
        style={{ minHeight: `${950}px` }}
      >
        <div className="relative w-full h-full pt-[5.5vw] pb-[7vw]">
          <Frame />
          <div className="relative h-[55.5vw] mt-[2vw]">
            <OverlayBorderShadow />
          </div>
        </div>
      </div>
    </div>
  );
}
