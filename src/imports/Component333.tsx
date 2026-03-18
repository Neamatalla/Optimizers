import svgPaths from "./svg-qeyjw9p68s";
import imgWhyChooseOurCroAgency from "../assets/b17a09a1da837a217fffce56dd8a2a3ec3e8dbd7.webp";
import WaveConnector from "./WaveConnector";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useIsMobile } from "@/app/components/ui/use-mobile";

function MaskBase() {
  return (
    <div className="absolute h-[136px] left-[8px] top-[2px] w-[96px]" data-name="mask-base">
      <div className="absolute bg-[#d9d9d9] blur-[8px] h-[120px] left-[8px] top-[8px] w-[80px]" data-name="mask" />
    </div>
  );
}

function SnakeBase() {
  return (
    <div className="absolute h-[24px] left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[160px]" data-name="snake-base">
      <div className="absolute inset-[-17.71%_-2.5%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 168 32.5">
          <g id="snake-base">
            <g filter="url(#filter0_f_1_674)" id="Line" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint0_linear_1_674)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter1_f_1_674)" id="Line_2" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint1_linear_1_674)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter2_f_1_674)" id="Line_3" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint2_linear_1_674)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter3_f_1_674)" id="Line_4" opacity="0.8">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint3_linear_1_674)" strokeWidth="0.5" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="26.5" id="filter0_f_1_674" width="162" x="3" y="3">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_674" stdDeviation="0.5" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="28.5" id="filter1_f_1_674" width="164" x="2" y="2">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_674" stdDeviation="1" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32.5" id="filter2_f_1_674" width="168" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_674" stdDeviation="2" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32.5" id="filter3_f_1_674" width="168" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_674" stdDeviation="2" />
            </filter>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_674" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_674" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_1_674" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_1_674" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function SnakeFastest() {
  return (
    <div className="absolute h-[140px] left-0 overflow-clip top-0 w-[480px]" data-name="snake-fastest">
      <MaskBase />
      <SnakeBase />
    </div>
  );
}

function MaskBase1() {
  return (
    <div className="absolute h-[136px] left-[8px] top-[2px] w-[96px]" data-name="mask-base">
      <div className="absolute bg-[#d9d9d9] blur-[8px] h-[120px] left-[8px] top-[8px] w-[80px]" data-name="mask" />
    </div>
  );
}

function SnakeBase1() {
  return (
    <div className="h-[24px] relative w-[160px]" data-name="snake-base">
      <div className="absolute inset-[-17.71%_-2.5%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 168 32.5">
          <g id="snake-base">
            <g filter="url(#filter0_f_1_649)" id="Line" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint0_linear_1_649)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter1_f_1_649)" id="Line_2" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint1_linear_1_649)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter2_f_1_649)" id="Line_3" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint2_linear_1_649)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter3_f_1_649)" id="Line_4" opacity="0.8">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint3_linear_1_649)" strokeWidth="0.5" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="26.5" id="filter0_f_1_649" width="162" x="3" y="3">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_649" stdDeviation="0.5" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="28.5" id="filter1_f_1_649" width="164" x="2" y="2">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_649" stdDeviation="1" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32.5" id="filter2_f_1_649" width="168" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_649" stdDeviation="2" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32.5" id="filter3_f_1_649" width="168" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_649" stdDeviation="2" />
            </filter>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_649" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_649" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_1_649" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_1_649" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function SnakeFast() {
  return (
    <div className="absolute h-[140px] left-0 overflow-clip top-0 w-[480px]" data-name="snake-fast">
      <MaskBase1 />
      <div className="absolute flex h-[24px] items-center justify-center left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[160px]">
        <div className="flex-none rotate-[180deg]">
          <SnakeBase1 />
        </div>
      </div>
    </div>
  );
}

function MaskBase2() {
  return (
    <div className="absolute h-[136px] left-[8px] top-[2px] w-[96px]" data-name="mask-base">
      <div className="absolute bg-[#d9d9d9] blur-[8px] h-[120px] left-[8px] top-[8px] w-[80px]" data-name="mask" />
    </div>
  );
}

function SnakeBase2() {
  return (
    <div className="absolute h-[24px] left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[160px]" data-name="snake-base">
      <div className="absolute inset-[-17.71%_-2.5%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 168 32.5">
          <g id="snake-base">
            <g filter="url(#filter0_f_1_674)" id="Line" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint0_linear_1_674)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter1_f_1_674)" id="Line_2" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint1_linear_1_674)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter2_f_1_674)" id="Line_3" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint2_linear_1_674)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter3_f_1_674)" id="Line_4" opacity="0.8">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint3_linear_1_674)" strokeWidth="0.5" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="26.5" id="filter0_f_1_674" width="162" x="3" y="3">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_674" stdDeviation="0.5" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="28.5" id="filter1_f_1_674" width="164" x="2" y="2">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_674" stdDeviation="1" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32.5" id="filter2_f_1_674" width="168" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_674" stdDeviation="2" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32.5" id="filter3_f_1_674" width="168" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_674" stdDeviation="2" />
            </filter>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_674" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_674" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_1_674" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_1_674" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function SnakeSlow() {
  return (
    <div className="absolute h-[140px] left-0 overflow-clip top-[24px] w-[480px]" data-name="snake-slow">
      <MaskBase2 />
      <SnakeBase2 />
    </div>
  );
}

function MaskBase3() {
  return (
    <div className="absolute h-[136px] left-[8px] top-[2px] w-[96px]" data-name="mask-base">
      <div className="absolute bg-[#d9d9d9] blur-[8px] h-[120px] left-[8px] top-[8px] w-[80px]" data-name="mask" />
    </div>
  );
}

function SnakeBase3() {
  return (
    <div className="h-[24px] relative w-[160px]" data-name="snake-base">
      <div className="absolute inset-[-17.71%_-2.5%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 168 32.5">
          <g id="snake-base">
            <g filter="url(#filter0_f_1_649)" id="Line" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint0_linear_1_649)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter1_f_1_649)" id="Line_2" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint1_linear_1_649)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter2_f_1_649)" id="Line_3" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint2_linear_1_649)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter3_f_1_649)" id="Line_4" opacity="0.8">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint3_linear_1_649)" strokeWidth="0.5" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="26.5" id="filter0_f_1_649" width="162" x="3" y="3">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_649" stdDeviation="0.5" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="28.5" id="filter1_f_1_649" width="164" x="2" y="2">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_649" stdDeviation="1" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32.5" id="filter2_f_1_649" width="168" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_649" stdDeviation="2" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32.5" id="filter3_f_1_649" width="168" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_649" stdDeviation="2" />
            </filter>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_649" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_649" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_1_649" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_1_649" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function SnakeSlowest() {
  return (
    <div className="absolute h-[140px] left-0 overflow-clip top-[24px] w-[480px]" data-name="snake-slowest">
      <MaskBase3 />
      <div className="absolute flex h-[24px] items-center justify-center left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[160px]">
        <div className="flex-none rotate-[180deg]">
          <SnakeBase3 />
        </div>
      </div>
    </div>
  );
}

function Frame7() {
  return (
    <div className="absolute hidden lg:flex h-[40px] left-[300px] 2xl:left-[260px] top-[660px] w-[calc(25%-240px)] 2xl:w-[146px] items-center justify-center pointer-events-none z-0">
      <WaveConnector height={40} className="w-full h-full opacity-50" />
    </div>
  );
}

function MaskBase4() {
  return (
    <div className="absolute h-[136px] left-[8px] top-[2px] w-[96px]" data-name="mask-base">
      <div className="absolute bg-[#d9d9d9] blur-[8px] h-[120px] left-[8px] top-[8px] w-[80px]" data-name="mask" />
    </div>
  );
}

function SnakeBase4() {
  return (
    <div className="absolute h-[24px] left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[160px]" data-name="snake-base">
      <div className="absolute inset-[-17.71%_-2.5%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 168 32.5">
          <g id="snake-base">
            <g filter="url(#filter0_f_1_674)" id="Line" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint0_linear_1_674)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter1_f_1_674)" id="Line_2" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint1_linear_1_674)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter2_f_1_674)" id="Line_3" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint2_linear_1_674)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter3_f_1_674)" id="Line_4" opacity="0.8">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint3_linear_1_674)" strokeWidth="0.5" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="26.5" id="filter0_f_1_674" width="162" x="3" y="3">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_674" stdDeviation="0.5" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="28.5" id="filter1_f_1_674" width="164" x="2" y="2">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_674" stdDeviation="1" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32.5" id="filter2_f_1_674" width="168" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_674" stdDeviation="2" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32.5" id="filter3_f_1_674" width="168" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_674" stdDeviation="2" />
            </filter>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_674" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_674" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_1_674" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_1_674" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function SnakeFastest1() {
  return (
    <div className="absolute h-[140px] left-0 overflow-clip top-0 w-[480px]" data-name="snake-fastest">
      <MaskBase4 />
      <SnakeBase4 />
    </div>
  );
}

function MaskBase5() {
  return (
    <div className="absolute h-[136px] left-[8px] top-[2px] w-[96px]" data-name="mask-base">
      <div className="absolute bg-[#d9d9d9] blur-[8px] h-[120px] left-[8px] top-[8px] w-[80px]" data-name="mask" />
    </div>
  );
}

function SnakeBase5() {
  return (
    <div className="h-[24px] relative w-[160px]" data-name="snake-base">
      <div className="absolute inset-[-17.71%_-2.5%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 168 32.5">
          <g id="snake-base">
            <g filter="url(#filter0_f_1_649)" id="Line" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint0_linear_1_649)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter1_f_1_649)" id="Line_2" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint1_linear_1_649)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter2_f_1_649)" id="Line_3" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint2_linear_1_649)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter3_f_1_649)" id="Line_4" opacity="0.8">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint3_linear_1_649)" strokeWidth="0.5" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="26.5" id="filter0_f_1_649" width="162" x="3" y="3">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_649" stdDeviation="0.5" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="28.5" id="filter1_f_1_649" width="164" x="2" y="2">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_649" stdDeviation="1" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32.5" id="filter2_f_1_649" width="168" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_649" stdDeviation="2" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32.5" id="filter3_f_1_649" width="168" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_649" stdDeviation="2" />
            </filter>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_649" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_649" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_1_649" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_1_649" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function SnakeFast1() {
  return (
    <div className="absolute h-[140px] left-0 overflow-clip top-0 w-[480px]" data-name="snake-fast">
      <MaskBase5 />
      <div className="absolute flex h-[24px] items-center justify-center left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[160px]">
        <div className="flex-none rotate-[180deg]">
          <SnakeBase5 />
        </div>
      </div>
    </div>
  );
}

function MaskBase6() {
  return (
    <div className="absolute h-[136px] left-[8px] top-[2px] w-[96px]" data-name="mask-base">
      <div className="absolute bg-[#d9d9d9] blur-[8px] h-[120px] left-[8px] top-[8px] w-[80px]" data-name="mask" />
    </div>
  );
}

function SnakeBase6() {
  return (
    <div className="absolute h-[24px] left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[160px]" data-name="snake-base">
      <div className="absolute inset-[-17.71%_-2.5%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 168 32.5">
          <g id="snake-base">
            <g filter="url(#filter0_f_1_674)" id="Line" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint0_linear_1_674)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter1_f_1_674)" id="Line_2" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint1_linear_1_674)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter2_f_1_674)" id="Line_3" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint2_linear_1_674)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter3_f_1_674)" id="Line_4" opacity="0.8">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint3_linear_1_674)" strokeWidth="0.5" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="26.5" id="filter0_f_1_674" width="162" x="3" y="3">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_674" stdDeviation="0.5" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="28.5" id="filter1_f_1_674" width="164" x="2" y="2">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_674" stdDeviation="1" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32.5" id="filter2_f_1_674" width="168" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_674" stdDeviation="2" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32.5" id="filter3_f_1_674" width="168" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_674" stdDeviation="2" />
            </filter>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_674" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_674" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_1_674" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_1_674" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function SnakeSlow1() {
  return (
    <div className="absolute h-[140px] left-0 overflow-clip top-[24px] w-[480px]" data-name="snake-slow">
      <MaskBase6 />
      <SnakeBase6 />
    </div>
  );
}

function MaskBase7() {
  return (
    <div className="absolute h-[136px] left-[8px] top-[2px] w-[96px]" data-name="mask-base">
      <div className="absolute bg-[#d9d9d9] blur-[8px] h-[120px] left-[8px] top-[8px] w-[80px]" data-name="mask" />
    </div>
  );
}

function SnakeBase7() {
  return (
    <div className="h-[24px] relative w-[160px]" data-name="snake-base">
      <div className="absolute inset-[-17.71%_-2.5%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 168 32.5">
          <g id="snake-base">
            <g filter="url(#filter0_f_1_649)" id="Line" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint0_linear_1_649)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter1_f_1_649)" id="Line_2" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint1_linear_1_649)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter2_f_1_649)" id="Line_3" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint2_linear_1_649)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter3_f_1_649)" id="Line_4" opacity="0.8">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint3_linear_1_649)" strokeWidth="0.5" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="26.5" id="filter0_f_1_649" width="162" x="3" y="3">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_649" stdDeviation="0.5" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="28.5" id="filter1_f_1_649" width="164" x="2" y="2">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_649" stdDeviation="1" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32.5" id="filter2_f_1_649" width="168" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_649" stdDeviation="2" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32.5" id="filter3_f_1_649" width="168" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_649" stdDeviation="2" />
            </filter>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_649" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_649" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_1_649" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_1_649" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function SnakeSlowest1() {
  return (
    <div className="absolute h-[140px] left-0 overflow-clip top-[24px] w-[480px]" data-name="snake-slowest">
      <MaskBase7 />
      <div className="absolute flex h-[24px] items-center justify-center left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[160px]">
        <div className="flex-none rotate-[180deg]">
          <SnakeBase7 />
        </div>
      </div>
    </div>
  );
}

function Frame9() {
  return (
    <div className="absolute hidden lg:flex h-[40px] left-[calc(25%+300px)] 2xl:left-[646px] top-[660px] w-[calc(25%-240px)] 2xl:w-[147px] items-center justify-center pointer-events-none z-0">
      <WaveConnector height={40} className="w-full h-full opacity-50" />
    </div>
  );
}

function MaskBase8() {
  return (
    <div className="absolute h-[136px] left-[8px] top-[2px] w-[96px]" data-name="mask-base">
      <div className="absolute bg-[#d9d9d9] blur-[8px] h-[120px] left-[8px] top-[8px] w-[80px]" data-name="mask" />
    </div>
  );
}

function SnakeBase8() {
  return (
    <div className="absolute h-[24px] left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[160px]" data-name="snake-base">
      <div className="absolute inset-[-17.71%_-2.5%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 168 32.5">
          <g id="snake-base">
            <g filter="url(#filter0_f_1_674)" id="Line" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint0_linear_1_674)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter1_f_1_674)" id="Line_2" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint1_linear_1_674)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter2_f_1_674)" id="Line_3" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint2_linear_1_674)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter3_f_1_674)" id="Line_4" opacity="0.8">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint3_linear_1_674)" strokeWidth="0.5" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="26.5" id="filter0_f_1_674" width="162" x="3" y="3">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_674" stdDeviation="0.5" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="28.5" id="filter1_f_1_674" width="164" x="2" y="2">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_674" stdDeviation="1" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32.5" id="filter2_f_1_674" width="168" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_674" stdDeviation="2" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32.5" id="filter3_f_1_674" width="168" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_674" stdDeviation="2" />
            </filter>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_674" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_674" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_1_674" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_1_674" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function SnakeFastest2() {
  return (
    <div className="absolute h-[140px] left-0 overflow-clip top-0 w-[480px]" data-name="snake-fastest">
      <MaskBase8 />
      <SnakeBase8 />
    </div>
  );
}

function MaskBase9() {
  return (
    <div className="absolute h-[136px] left-[8px] top-[2px] w-[96px]" data-name="mask-base">
      <div className="absolute bg-[#d9d9d9] blur-[8px] h-[120px] left-[8px] top-[8px] w-[80px]" data-name="mask" />
    </div>
  );
}

function SnakeBase9() {
  return (
    <div className="h-[24px] relative w-[160px]" data-name="snake-base">
      <div className="absolute inset-[-17.71%_-2.5%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 168 32.5">
          <g id="snake-base">
            <g filter="url(#filter0_f_1_649)" id="Line" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint0_linear_1_649)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter1_f_1_649)" id="Line_2" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint1_linear_1_649)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter2_f_1_649)" id="Line_3" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint2_linear_1_649)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter3_f_1_649)" id="Line_4" opacity="0.8">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint3_linear_1_649)" strokeWidth="0.5" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="26.5" id="filter0_f_1_649" width="162" x="3" y="3">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_649" stdDeviation="0.5" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="28.5" id="filter1_f_1_649" width="164" x="2" y="2">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_649" stdDeviation="1" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32.5" id="filter2_f_1_649" width="168" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_649" stdDeviation="2" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32.5" id="filter3_f_1_649" width="168" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_649" stdDeviation="2" />
            </filter>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_649" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_649" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_1_649" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_1_649" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function SnakeFast2() {
  return (
    <div className="absolute h-[140px] left-0 overflow-clip top-0 w-[480px]" data-name="snake-fast">
      <MaskBase9 />
      <div className="absolute flex h-[24px] items-center justify-center left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[160px]">
        <div className="flex-none rotate-[180deg]">
          <SnakeBase9 />
        </div>
      </div>
    </div>
  );
}

function MaskBase10() {
  return (
    <div className="absolute h-[136px] left-[8px] top-[2px] w-[96px]" data-name="mask-base">
      <div className="absolute bg-[#d9d9d9] blur-[8px] h-[120px] left-[8px] top-[8px] w-[80px]" data-name="mask" />
    </div>
  );
}

function SnakeBase10() {
  return (
    <div className="absolute h-[24px] left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[160px]" data-name="snake-base">
      <div className="absolute inset-[-17.71%_-2.5%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 168 32.5">
          <g id="snake-base">
            <g filter="url(#filter0_f_1_674)" id="Line" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint0_linear_1_674)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter1_f_1_674)" id="Line_2" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint1_linear_1_674)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter2_f_1_674)" id="Line_3" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint2_linear_1_674)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter3_f_1_674)" id="Line_4" opacity="0.8">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint3_linear_1_674)" strokeWidth="0.5" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="26.5" id="filter0_f_1_674" width="162" x="3" y="3">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_674" stdDeviation="0.5" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="28.5" id="filter1_f_1_674" width="164" x="2" y="2">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_674" stdDeviation="1" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32.5" id="filter2_f_1_674" width="168" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_674" stdDeviation="2" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32.5" id="filter3_f_1_674" width="168" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_674" stdDeviation="2" />
            </filter>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_674" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_674" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_1_674" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_1_674" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function SnakeSlow2() {
  return (
    <div className="absolute h-[140px] left-0 overflow-clip top-[24px] w-[480px]" data-name="snake-slow">
      <MaskBase10 />
      <SnakeBase10 />
    </div>
  );
}

function MaskBase11() {
  return (
    <div className="absolute h-[136px] left-[8px] top-[2px] w-[96px]" data-name="mask-base">
      <div className="absolute bg-[#d9d9d9] blur-[8px] h-[120px] left-[8px] top-[8px] w-[80px]" data-name="mask" />
    </div>
  );
}

function SnakeBase11() {
  return (
    <div className="h-[24px] relative w-[160px]" data-name="snake-base">
      <div className="absolute inset-[-17.71%_-2.5%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 168 32.5">
          <g id="snake-base">
            <g filter="url(#filter0_f_1_649)" id="Line" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint0_linear_1_649)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter1_f_1_649)" id="Line_2" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint1_linear_1_649)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter2_f_1_649)" id="Line_3" opacity="0.6">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint2_linear_1_649)" strokeWidth="0.5" />
            </g>
            <g filter="url(#filter3_f_1_649)" id="Line_4" opacity="0.8">
              <path d={svgPaths.p1896a6e0} stroke="url(#paint3_linear_1_649)" strokeWidth="0.5" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="26.5" id="filter0_f_1_649" width="162" x="3" y="3">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_649" stdDeviation="0.5" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="28.5" id="filter1_f_1_649" width="164" x="2" y="2">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_649" stdDeviation="1" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32.5" id="filter2_f_1_649" width="168" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_649" stdDeviation="2" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="32.5" id="filter3_f_1_649" width="168" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_649" stdDeviation="2" />
            </filter>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_649" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_649" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_1_649" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_1_649" x1="-1.54913" x2="176.948" y1="4.25" y2="4.25">
              <stop stopColor="#FF6B57" stopOpacity="0" />
              <stop offset="0.19307" stopColor="#FCD34D" />
              <stop offset="0.265625" stopColor="#31DA72" />
              <stop offset="0.552083" stopColor="#FF6B57" />
              <stop offset="0.75" stopColor="#FCD34D" />
              <stop offset="0.864583" stopColor="#31DA72" />
              <stop offset="0.979167" stopColor="#624DE3" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function SnakeSlowest2() {
  return (
    <div className="absolute h-[140px] left-0 overflow-clip top-[24px] w-[480px]" data-name="snake-slowest">
      <MaskBase11 />
      <div className="absolute flex h-[24px] items-center justify-center left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[160px]">
        <div className="flex-none rotate-[180deg]">
          <SnakeBase11 />
        </div>
      </div>
    </div>
  );
}

function Frame8() {
  return (
    <div className="absolute hidden lg:flex h-[40px] left-[calc(50%+300px)] 2xl:left-[1033px] top-[660px] w-[calc(25%-240px)] 2xl:w-[147px] items-center justify-center pointer-events-none z-0">
      <WaveConnector height={40} className="w-full h-full opacity-50" />
    </div>
  );
}

function Lights() {
  return (
    <div className="absolute h-[284px] left-px overflow-clip top-px w-[238px]" data-name="Lights">
      <div className="absolute bg-black h-[284px] left-0 rounded-[17.139px] top-0 w-[238px]">
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_4.57px_27.422px_-7.998px_#5b626d]" />
      </div>
      <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0)] h-[284px] left-0 rounded-[17.139px] to-black top-0 w-[238px]" />
    </div>
  );
}

function BgElements() {
  return (
    <div className="absolute contents left-[-245.08px] top-[-263.92px]" data-name="Bg Elements">
      <div className="absolute flex h-[840.281px] items-center justify-center left-[-243.94px] mix-blend-screen top-[-262.77px] w-[726.733px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-[72.8deg]">
          <div className="h-[540.226px] relative w-[712.385px]" data-name="Light greyish">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
              <g id="Light greyish" style={{ mixBlendMode: "screen" }}></g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="col-1 h-[59.421px] ml-0 mt-0 relative row-1 w-[46.25px]">
      <div className="absolute inset-[-91.6%_-118.59%_-53.59%_-118.05%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 155.693 145.693">
          <g id="Group 295">
            <g filter="url(#filter0_f_1_639)" id="Vector">
              <path d={svgPaths.p14d51e00} fill="url(#paint0_linear_1_639)" />
            </g>
            <path d={svgPaths.p1712a700} fill="url(#paint1_linear_1_639)" id="Vector_2" />
            <g data-figma-bg-blur-radius="9.14105" filter="url(#filter1_d_1_639)" id="Vector_3">
              <path d={svgPaths.pd48c00} fill="url(#paint2_linear_1_639)" shapeRendering="crispEdges" />
              <path d={svgPaths.p1f443900} shapeRendering="crispEdges" stroke="url(#paint3_linear_1_639)" strokeWidth="2.28526" />
            </g>
            <g filter="url(#filter2_di_1_639)" id="Vector (Stroke)">
              <path clipRule="evenodd" d={svgPaths.pcc95f60} fill="url(#paint4_linear_1_639)" fillRule="evenodd" shapeRendering="crispEdges" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="145.693" id="filter0_f_1_639" width="155.693" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_639" stdDeviation="27.4232" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="79.5153" id="filter1_d_1_639" width="64.2822" x="45.4551" y="52.5857">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="9.14105" />
              <feGaussianBlur stdDeviation="4.57053" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_639" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_639" mode="normal" result="shape" />
            </filter>
            <clipPath id="bgblur_0_1_639_clip_path" transform="translate(-45.4551 -52.5857)">
              <path d={svgPaths.pd48c00} />
            </clipPath>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="24.6878" id="filter2_di_1_639" width="26.0225" x="66.5017" y="76.6925">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="2.28526" />
              <feGaussianBlur stdDeviation="1.71395" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_639" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_639" mode="normal" result="shape" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="18.2821" />
              <feGaussianBlur stdDeviation="4.57053" />
              <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
              <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0" />
              <feBlend in2="shape" mode="normal" result="effect2_innerShadow_1_639" />
            </filter>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_639" x1="72.0963" x2="78.274" y1="72.8463" y2="28.0506">
              <stop stopColor="#3C8CE7" />
              <stop offset="1" stopColor="#00EAFF" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_639" x1="72.8055" x2="83.2765" y1="76.0331" y2="23.3204">
              <stop stopColor="#5F82BF" />
              <stop offset="1" stopColor="#AFC1DF" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_1_639" x1="47.6962" x2="106.933" y1="119.069" y2="69.1524">
              <stop stopColor="white" stopOpacity="0.2" />
              <stop offset="1" stopColor="white" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_1_639" x1="95.9963" x2="48.3211" y1="119.069" y2="68.9019">
              <stop stopColor="white" stopOpacity="0" />
              <stop offset="1" stopColor="white" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint4_linear_1_639" x1="76.6379" x2="79.9897" y1="93.2681" y2="73.6821">
              <stop stopColor="white" stopOpacity="0.2" />
              <stop offset="1" stopColor="white" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Group1() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] opacity-60 relative shrink-0">
      <Group />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 text-center w-full">
      <p className="css-4hzbpn font-['Sora:SemiBold',sans-serif] font-semibold leading-[21.6px] relative shrink-0 text-[18px] text-white w-full">100% Guarantee</p>
      <div className="font-['Sora:Regular',sans-serif] font-normal leading-[17px] relative shrink-0 text-[14px] text-[rgba(255,255,255,0.8)] w-full">
        <p className="css-4hzbpn mb-0">{`If we don’t improve your conversions, you don’t `}</p>
        <p className="css-4hzbpn">pay</p>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center relative w-[208px]">
      <Group1 />
      <Frame2 />
    </div>
  );
}

function Card() {
  return (
    <div className="h-[240px] overflow-clip relative rounded-[24px] shadow-[0px_2px_28.8px_0px_rgba(253,230,138,0.1),0px_2px_17.6px_0px_rgba(146,235,180,0.1)] w-[284px] max-md:!w-full max-md:!h-auto p-[1.143px] group" data-name="Card">
      {/* Gradient Border Overlay */}
      <div className="absolute inset-0 rounded-[24px] pointer-events-none p-[1.143px] bg-gradient-to-b from-[#6ae499] via-[#fde68a] to-[#ff6b57] opacity-60 group-hover:opacity-100 transition-opacity blur-[2px]" />
      {/* Inner Black Background to create the 'border' look */}
      <div className="absolute inset-[1.143px] bg-[#020601] rounded-[23px] z-0" />

      <div className="relative z-10 size-full overflow-hidden rounded-[23px]">
        <BgElements />
        <div className="absolute flex h-[208px] items-center justify-center left-[78.44px] top-[14.86px] w-[168.421px]" style={{ "--transform-inner-width": "467.171875", "--transform-inner-height": "38" } as React.CSSProperties}>
          <div className="flex-none rotate-[90deg]">
            <Frame3 />
          </div>
        </div>
      </div>

      {/* Inner Glow/Shadow */}
      <div className="absolute inset-0 pointer-events-none rounded-[24px] shadow-[inset_0px_0px_20px_rgba(106,228,153,0.15)]" />
    </div>
  );
}

function Safer() {
  return (
    <div className="relative lg:absolute h-[284px] lg:left-[calc(50%+60px)] 2xl:left-[793px] rounded-[24px] lg:top-[550px] w-[240px] max-md:!w-full" data-name="Safer">
      <Lights />
      <div className="absolute flex h-[284px] items-center justify-center left-0 top-0 w-[240px]" style={{ "--transform-inner-width": "467.171875", "--transform-inner-height": "38" } as React.CSSProperties}>
        <div className="flex-none rotate-[-90deg]">
          <Card />
        </div>
      </div>
    </div>
  );
}

function Lights1() {
  return (
    <div className="absolute h-[284px] left-px overflow-clip top-px w-[238px]" data-name="Lights">
      <div className="absolute bg-black h-[284px] left-0 rounded-[17.139px] top-0 w-[238px]">
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_4.57px_27.422px_-7.998px_#5b626d]" />
      </div>
      <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0)] h-[284px] left-0 rounded-[17.139px] to-black top-0 w-[238px]" />
    </div>
  );
}

function BgElements1() {
  return (
    <div className="absolute contents left-[-245.08px] top-[-263.92px]" data-name="Bg Elements">
      <div className="absolute flex h-[840.281px] items-center justify-center left-[-243.94px] mix-blend-screen top-[-262.77px] w-[726.733px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-[72.8deg]">
          <div className="h-[540.226px] relative w-[712.385px]" data-name="Light greyish">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
              <g id="Light greyish" style={{ mixBlendMode: "screen" }}></g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group4() {
  return (
    <div className="h-[60.254px] relative shrink-0 w-[82.274px]">
      <div className="absolute inset-[-57.55%_-51.28%_-84.03%_-56.41%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 170.876 145.561">
          <g id="Group 322" opacity="0.6">
            <g filter="url(#filter0_f_1_655)" id="Union">
              <path clipRule="evenodd" d={svgPaths.pfa697f0} fill="url(#paint0_linear_1_655)" fillRule="evenodd" />
            </g>
            <path clipRule="evenodd" d={svgPaths.pe18ed00} fill="url(#paint1_linear_1_655)" fillRule="evenodd" id="Union_2" />
            <g data-figma-bg-blur-radius="10.5479" filter="url(#filter1_d_1_655)" id="Polygon 1">
              <path d={svgPaths.p2f162d00} fill="url(#paint2_linear_1_655)" shapeRendering="crispEdges" />
              <path d={svgPaths.p327ad780} shapeRendering="crispEdges" stroke="url(#paint3_linear_1_655)" strokeWidth="2.10959" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="145.561" id="filter0_f_1_655" width="170.876" x="-4.76837e-07" y="1.90735e-06">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_655" stdDeviation="25.315" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="55.9238" id="filter1_d_1_655" width="55.9238" x="71.4501" y="35.9879">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dx="2.10959" />
              <feGaussianBlur stdDeviation="4.21917" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.48 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_655" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_655" mode="normal" result="shape" />
            </filter>
            <clipPath id="bgblur_0_1_655_clip_path" transform="translate(-71.4501 -35.9879)">
              <path d={svgPaths.p2f162d00} />
            </clipPath>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_655" x1="130.036" x2="47.5971" y1="41.3035" y2="89.7727">
              <stop stopColor="#B0F1C9" />
              <stop offset="1" stopColor="#0A391C" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_655" x1="113.786" x2="45.5652" y1="49.4065" y2="91.4467">
              <stop stopColor="#0A391C" />
              <stop offset="1" stopColor="#92EBB4" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_1_655" x1="67.7787" x2="128.685" y1="60.393" y2="61.7465">
              <stop stopColor="white" stopOpacity="0.2" />
              <stop offset="1" stopColor="white" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_1_655" x1="96.2015" x2="100.939" y1="88.8158" y2="35.354">
              <stop stopColor="white" stopOpacity="0" />
              <stop offset="1" stopColor="white" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 text-center w-full">
      <p className="css-4hzbpn font-['Sora:SemiBold',sans-serif] font-semibold leading-[21.6px] relative shrink-0 text-[18px] text-white w-full">Fastest Setup, Continuous Growth</p>
      <div className="font-['Sora:Regular',sans-serif] font-normal leading-[17px] relative shrink-0 text-[14px] text-[rgba(255,255,255,0.8)] w-full">
        <p className="css-4hzbpn mb-0">{`Your first experiments live in just 14 days, with ongoing `}</p>
        <p className="css-4hzbpn">testing cycles for sustained impact</p>
      </div>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center relative w-[208px]">
      <Group4 />
      <Frame4 />
    </div>
  );
}

function Card1() {
  return (
    <div className="h-[240px] overflow-clip relative rounded-[24px] shadow-[0px_2px_28.8px_0px_rgba(253,230,138,0.1),0px_2px_17.6px_0px_rgba(146,235,180,0.1)] w-[284px] max-md:!w-full max-md:!h-auto p-[1.143px] group" data-name="Card">
      {/* Gradient Border Overlay */}
      <div className="absolute inset-0 rounded-[24px] pointer-events-none p-[1.143px] bg-gradient-to-b from-[#6ae499] via-[#fde68a] to-[#ff6b57] opacity-60 group-hover:opacity-100 transition-opacity blur-[2px]" />
      {/* Inner Black Background */}
      <div className="absolute inset-[1.143px] bg-[#020601] rounded-[23px] z-0" />

      <div className="relative z-10 size-full overflow-hidden rounded-[23px]">
        <BgElements1 />
        <div className="absolute flex h-[208px] items-center justify-center left-[38.6px] top-[14.86px] w-[208.254px]" style={{ "--transform-inner-width": "647.15625", "--transform-inner-height": "38" } as React.CSSProperties}>
          <div className="flex-none rotate-[90deg]">
            <Frame5 />
          </div>
        </div>
      </div>

      {/* Inner Glow */}
      <div className="absolute inset-0 pointer-events-none rounded-[24px] shadow-[inset_0px_0px_20px_rgba(106,228,153,0.15)]" />
    </div>
  );
}

function Safer1() {
  return (
    <div className="relative lg:absolute h-[284px] lg:left-[calc(75%+60px)] 2xl:left-[1180px] rounded-[24px] lg:top-[550px] w-[240px] max-md:!w-full" data-name="Safer">
      <Lights1 />
      <div className="absolute flex h-[284px] items-center justify-center left-0 top-0 w-[240px]" style={{ "--transform-inner-width": "647.15625", "--transform-inner-height": "38" } as React.CSSProperties}>
        <div className="flex-none rotate-[-90deg]">
          <Card1 />
        </div>
      </div>
    </div>
  );
}

function Lights2() {
  return (
    <div className="absolute h-[284px] left-px overflow-clip top-px w-[238px]" data-name="Lights">
      <div className="absolute bg-black h-[284px] left-0 rounded-[17.139px] top-0 w-[238px]">
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_4.57px_27.422px_-7.998px_#5b626d]" />
      </div>
      <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0)] h-[284px] left-0 rounded-[17.139px] to-black top-0 w-[238px]" />
    </div>
  );
}

function BgElements2() {
  return (
    <div className="absolute contents left-[-245.08px] top-[-263.92px]" data-name="Bg Elements">
      <div className="absolute flex h-[840.281px] items-center justify-center left-[-243.94px] mix-blend-screen top-[-262.77px] w-[726.733px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-[72.8deg]">
          <div className="h-[540.226px] relative w-[712.385px]" data-name="Light greyish">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
              <g id="Light greyish" style={{ mixBlendMode: "screen" }}></g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group3() {
  return (
    <div className="h-[59.081px] relative shrink-0 w-[57.002px]">
      <div className="absolute inset-[-74.58%_-110.7%_-107.28%_-108.1%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 181.721 166.525">
          <g id="Group 320" opacity="0.6">
            <g id="Group 266">
              <path d={svgPaths.p29d15f00} fill="url(#paint0_linear_1_630)" id="Vector" />
              <path d={svgPaths.p2db79500} fill="url(#paint1_linear_1_630)" id="Vector_2" />
            </g>
            <g filter="url(#filter0_f_1_630)" id="Vector_3">
              <path d={svgPaths.p35469000} fill="url(#paint2_linear_1_630)" />
            </g>
            <g id="Group 265">
              <g data-figma-bg-blur-radius="10.4716" filter="url(#filter1_d_1_630)" id="Vector_4">
                <path d={svgPaths.p6f2b180} fill="url(#paint3_linear_1_630)" shapeRendering="crispEdges" />
                <path d={svgPaths.p1e20ec00} shapeRendering="crispEdges" stroke="url(#paint4_linear_1_630)" strokeWidth="2.61791" />
              </g>
              <g data-figma-bg-blur-radius="10.4716" filter="url(#filter2_d_1_630)" id="Vector_5">
                <path d={svgPaths.p1b846000} fill="url(#paint5_linear_1_630)" shapeRendering="crispEdges" />
                <path d={svgPaths.p34d8cf00} shapeRendering="crispEdges" stroke="url(#paint6_linear_1_630)" strokeWidth="2.61791" />
              </g>
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="166.525" id="filter0_f_1_630" width="181.721" x="-9.53674e-07" y="-1.90735e-06">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_630" stdDeviation="34.0328" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="57.9334" id="filter1_d_1_630" width="73.1634" x="51.1451" y="66.154">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="10.4716" />
              <feGaussianBlur stdDeviation="5.23581" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_630" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_630" mode="normal" result="shape" />
            </filter>
            <clipPath id="bgblur_0_1_630_clip_path" transform="translate(-51.1451 -66.154)">
              <path d={svgPaths.p6f2b180} />
            </clipPath>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="57.7494" id="filter2_d_1_630" width="47.2778" x="64.0917" y="33.592">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="10.4716" />
              <feGaussianBlur stdDeviation="5.23581" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_630" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_630" mode="normal" result="shape" />
            </filter>
            <clipPath id="bgblur_1_1_630_clip_path" transform="translate(-64.0917 -33.592)">
              <path d={svgPaths.p1b846000} />
            </clipPath>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_630" x1="101.603" x2="101.185" y1="106.505" y2="73.4449">
              <stop stopColor="#FCD34D" />
              <stop offset="1" stopColor="#FEF3C7" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_630" x1="101.602" x2="100.825" y1="82.943" y2="49.8954">
              <stop stopColor="#FCD34D" />
              <stop offset="1" stopColor="#FEF3C7" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_1_630" x1="90.8638" x2="90.0048" y1="115.184" y2="60.3564">
              <stop stopColor="#FCD34D" />
              <stop offset="1" stopColor="#FEF3C7" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_1_630" x1="53.7837" x2="79.0698" y1="105.796" y2="58.1676">
              <stop stopColor="white" stopOpacity="0.2" />
              <stop offset="1" stopColor="white" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint4_linear_1_630" x1="108.615" x2="91.1556" y1="105.796" y2="64.73">
              <stop stopColor="white" stopOpacity="0" />
              <stop offset="1" stopColor="white" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint5_linear_1_630" x1="70.6132" x2="100.898" y1="73.0316" y2="44.0636">
              <stop stopColor="white" stopOpacity="0.2" />
              <stop offset="1" stopColor="white" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint6_linear_1_630" x1="98.2645" x2="74.5634" y1="73.0316" y2="44.722">
              <stop stopColor="white" stopOpacity="0" />
              <stop offset="1" stopColor="white" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 text-center w-full">
      <p className="css-4hzbpn font-['Sora:SemiBold',sans-serif] font-semibold leading-[21.6px] relative shrink-0 text-[18px] text-white w-full">Specialized Expertise</p>
      <p className="css-4hzbpn font-['Sora:Regular',sans-serif] font-normal leading-[17px] relative shrink-0 text-[14px] text-[rgba(255,255,255,0.8)] w-full">Certified CRO specialists with deep understanding of Arabic users, cultural nuances, and GCC market behavior</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center relative w-[208px]">
      <Group3 />
      <Frame6 />
    </div>
  );
}

function Card2() {
  return (
    <div className="h-[240px] overflow-clip relative rounded-[24px] shadow-[0px_2px_28.8px_0px_rgba(253,230,138,0.1),0px_2px_17.6px_0px_rgba(146,235,180,0.1)] w-[284px] max-md:!w-full max-md:!h-auto p-[1.143px] group" data-name="Card">
      {/* Gradient Border Overlay */}
      <div className="absolute inset-0 rounded-[24px] pointer-events-none p-[1.143px] bg-gradient-to-b from-[#6ae499] via-[#fde68a] to-[#ff6b57] opacity-60 group-hover:opacity-100 transition-opacity blur-[2px]" />
      {/* Inner Black Background */}
      <div className="absolute inset-[1.143px] bg-[#020601] rounded-[23px] z-0" />

      <div className="relative z-10 size-full overflow-hidden rounded-[23px]">
        <BgElements2 />
        <div className="absolute flex h-[208px] items-center justify-center left-[44.77px] top-[14.86px] w-[202.081px]" style={{ "--transform-inner-width": "954.921875", "--transform-inner-height": "19" } as React.CSSProperties}>
          <div className="flex-none rotate-[90deg]">
            <Frame1 />
          </div>
        </div>
      </div>

      {/* Inner Glow */}
      <div className="absolute inset-0 pointer-events-none rounded-[24px] shadow-[inset_0px_0px_20px_rgba(106,228,153,0.15)]" />
    </div>
  );
}

function Safer2() {
  return (
    <div className="relative lg:absolute h-[284px] lg:left-[calc(25%+60px)] 2xl:left-[406px] rounded-[24px] lg:top-[550px] w-[240px] max-md:!w-full" data-name="Safer">
      <Lights2 />
      <div className="absolute flex h-[284px] items-center justify-center left-0 top-0 w-[240px]" style={{ "--transform-inner-width": "954.921875", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-[-90deg]">
          <Card2 />
        </div>
      </div>
    </div>
  );
}

function Lights3() {
  return (
    <div className="absolute h-[284px] left-px overflow-clip top-px w-[238px]" data-name="Lights">
      <div className="absolute bg-black h-[284px] left-0 rounded-[17.139px] top-0 w-[238px]">
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_4.57px_27.422px_-7.998px_#5b626d]" />
      </div>
      <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0)] h-[284px] left-0 rounded-[17.139px] to-black top-0 w-[238px]" />
    </div>
  );
}

function BgElements3() {
  return (
    <div className="absolute contents left-[-245.08px] top-[-263.92px]" data-name="Bg Elements">
      <div className="absolute flex h-[840.281px] items-center justify-center left-[-243.94px] mix-blend-screen top-[-262.77px] w-[726.733px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-[72.8deg]">
          <div className="h-[540.226px] relative w-[712.385px]" data-name="Light greyish">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
              <g id="Light greyish" style={{ mixBlendMode: "screen" }}></g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group2() {
  return (
    <div className="h-[58.754px] relative shrink-0 w-[64px]">
      <div className="absolute inset-[-59.57%_-50.12%_-58.94%_-41.51%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 122.637 128.386">
          <g id="Group 315" opacity="0.6">
            <g filter="url(#filter0_f_1_662)" id="Group 102">
              <g data-figma-bg-blur-radius="10" filter="url(#filter1_d_1_662)" id="Rectangle 37">
                <path d={svgPaths.p2a4e8780} fill="url(#paint0_linear_1_662)" fillOpacity="0.6" shapeRendering="crispEdges" />
              </g>
              <g data-figma-bg-blur-radius="10" filter="url(#filter2_d_1_662)" id="Rectangle 38">
                <path d={svgPaths.p3261ea00} fill="url(#paint1_linear_1_662)" fillOpacity="0.6" shapeRendering="crispEdges" />
              </g>
            </g>
            <g data-figma-bg-blur-radius="10" filter="url(#filter3_d_1_662)" id="Rectangle 35">
              <path d={svgPaths.p3721c380} fill="url(#paint2_linear_1_662)" />
            </g>
            <g data-figma-bg-blur-radius="10" filter="url(#filter4_d_1_662)" id="Rectangle 36">
              <path d={svgPaths.p1d865980} fill="url(#paint3_linear_1_662)" />
            </g>
            <g data-figma-bg-blur-radius="12.5" filter="url(#filter5_d_1_662)" id="Rectangle 33">
              <path d={svgPaths.p17d4e5c0} fill="url(#paint4_linear_1_662)" shapeRendering="crispEdges" />
              <path d={svgPaths.p27f3aa00} shapeRendering="crispEdges" stroke="url(#paint5_linear_1_662)" strokeWidth="2.5" />
            </g>
            <g filter="url(#filter6_di_1_662)" id="Rectangle 10">
              <rect fill="url(#paint6_linear_1_662)" height="16" rx="0.5" shapeRendering="crispEdges" width="5.33333" x="50.562" y="53.7492" />
            </g>
            <g filter="url(#filter7_di_1_662)" id="Rectangle 16">
              <rect fill="url(#paint7_linear_1_662)" height="10.6667" rx="0.5" shapeRendering="crispEdges" width="5.33333" x="39.8925" y="59.0875" />
            </g>
            <g filter="url(#filter8_di_1_662)" id="Rectangle 11">
              <rect fill="url(#paint8_linear_1_662)" height="24" rx="0.5" shapeRendering="crispEdges" width="5.33333" x="61.2254" y="45.7512" />
            </g>
            <g filter="url(#filter9_di_1_662)" id="Rectangle 12">
              <rect fill="url(#paint9_linear_1_662)" height="18.6667" rx="0.5" shapeRendering="crispEdges" width="5.33333" x="71.8949" y="51.0782" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="128.386" id="filter0_f_1_662" width="122.637" x="0" y="-9.76368e-07">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_662" stdDeviation="17.5" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="88.3861" id="filter1_d_1_662" width="52.9269" x="44.7105" y="25">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="10" />
              <feGaussianBlur stdDeviation="5" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_662" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_662" mode="normal" result="shape" />
            </filter>
            <clipPath id="bgblur_0_1_662_clip_path" transform="translate(-44.7105 -25)">
              <path d={svgPaths.p2a4e8780} />
            </clipPath>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="86.1021" id="filter2_d_1_662" width="61.7947" x="25" y="26.1707">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="10" />
              <feGaussianBlur stdDeviation="5" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_662" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_662" mode="normal" result="shape" />
            </filter>
            <clipPath id="bgblur_1_1_662_clip_path" transform="translate(-25 -26.1707)">
              <path d={svgPaths.p3261ea00} />
            </clipPath>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="48.6667" id="filter3_d_1_662" width="30.0318" x="48.8817" y="65.0873">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="10" />
              <feGaussianBlur stdDeviation="5" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_662" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_662" mode="normal" result="shape" />
            </filter>
            <clipPath id="bgblur_2_1_662_clip_path" transform="translate(-48.8817 -65.0873)">
              <path d={svgPaths.p3721c380} />
            </clipPath>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="48.6667" id="filter4_d_1_662" width="30.0318" x="38.215" y="65.0873">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="10" />
              <feGaussianBlur stdDeviation="5" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_662" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_662" mode="normal" result="shape" />
            </filter>
            <clipPath id="bgblur_3_1_662_clip_path" transform="translate(-38.215 -65.0873)">
              <path d={svgPaths.p1d865980} />
            </clipPath>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="77.8333" id="filter5_d_1_662" width="89" x="14.0638" y="22.5809">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="10" />
              <feGaussianBlur stdDeviation="5" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_662" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_662" mode="normal" result="shape" />
            </filter>
            <clipPath id="bgblur_4_1_662_clip_path" transform="translate(-14.0638 -22.5809)">
              <path d={svgPaths.p17d4e5c0} />
            </clipPath>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="27.25" id="filter6_di_1_662" width="12.8333" x="46.812" y="52.4992">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="2.5" />
              <feGaussianBlur stdDeviation="1.875" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_662" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_662" mode="normal" result="shape" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="20" />
              <feGaussianBlur stdDeviation="5" />
              <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
              <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0" />
              <feBlend in2="shape" mode="normal" result="effect2_innerShadow_1_662" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="21.9167" id="filter7_di_1_662" width="12.8333" x="36.1425" y="57.8375">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="2.5" />
              <feGaussianBlur stdDeviation="1.875" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_662" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_662" mode="normal" result="shape" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="20" />
              <feGaussianBlur stdDeviation="5" />
              <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
              <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0" />
              <feBlend in2="shape" mode="normal" result="effect2_innerShadow_1_662" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="35.25" id="filter8_di_1_662" width="12.8333" x="57.4754" y="44.5012">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="2.5" />
              <feGaussianBlur stdDeviation="1.875" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_662" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_662" mode="normal" result="shape" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="20" />
              <feGaussianBlur stdDeviation="5" />
              <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
              <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0" />
              <feBlend in2="shape" mode="normal" result="effect2_innerShadow_1_662" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="29.9167" id="filter9_di_1_662" width="12.8333" x="68.1449" y="49.8282">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="2.5" />
              <feGaussianBlur stdDeviation="1.875" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_662" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_662" mode="normal" result="shape" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="20" />
              <feGaussianBlur stdDeviation="5" />
              <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
              <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0" />
              <feBlend in2="shape" mode="normal" result="effect2_innerShadow_1_662" />
            </filter>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_662" x1="64.5623" x2="106.816" y1="35" y2="56.8491">
              <stop stopColor="#891000" />
              <stop offset="1" stopColor="#FF8979" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_662" x1="77.2307" x2="23.1671" y1="36.1707" y2="77.287">
              <stop stopColor="#FFC4BC" />
              <stop offset="1" stopColor="#FF8979" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_1_662" x1="59.8976" x2="74.99" y1="75.0873" y2="84.8602">
              <stop stopColor="#891000" />
              <stop offset="1" stopColor="#FF8979" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_1_662" x1="58.5643" x2="42.4822" y1="75.0873" y2="84.277">
              <stop stopColor="#FFC4BC" />
              <stop offset="1" stopColor="#FF8979" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint4_linear_1_662" x1="100.164" x2="50.248" y1="30.5475" y2="97.953">
              <stop stopColor="white" stopOpacity="0.2" />
              <stop offset="1" stopColor="white" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint5_linear_1_662" x1="32.9638" x2="69.3309" y1="30.5475" y2="91.8725">
              <stop stopColor="white" stopOpacity="0" />
              <stop offset="1" stopColor="white" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint6_linear_1_662" x1="49.762" x2="60.4231" y1="71.3492" y2="67.95">
              <stop stopColor="white" stopOpacity="0.2" />
              <stop offset="1" stopColor="white" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint7_linear_1_662" x1="39.0925" x2="48.6511" y1="70.8208" y2="66.2494">
              <stop stopColor="white" stopOpacity="0.2" />
              <stop offset="1" stopColor="white" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint8_linear_1_662" x1="60.4254" x2="71.6626" y1="72.1512" y2="69.7626">
              <stop stopColor="white" stopOpacity="0.2" />
              <stop offset="1" stopColor="white" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint9_linear_1_662" x1="71.0949" x2="82.0236" y1="71.6115" y2="68.6248">
              <stop stopColor="white" stopOpacity="0.2" />
              <stop offset="1" stopColor="white" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center relative shrink-0 text-center w-full">
      <p className="css-4hzbpn font-['Sora:SemiBold',sans-serif] font-semibold leading-[21.6px] min-w-full relative shrink-0 text-[18px] text-white w-[min-content]">Proven Track Record</p>
      <p className="css-4hzbpn font-['Sora:Regular',sans-serif] font-normal leading-[17px] relative shrink-0 text-[14px] text-[rgba(255,255,255,0.8)] w-[205px]">8+ years helping brands achieve an average 35% lift in conversion rates</p>
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center relative w-[208px]">
      <Group2 />
      <Frame10 />
    </div>
  );
}

function Card3() {
  return (
    <div className="h-[240px] overflow-clip relative rounded-[24px] shadow-[0px_2px_28.8px_0px_rgba(253,230,138,0.1),0px_2px_17.6px_0px_rgba(146,235,180,0.1)] w-[284px] max-md:!w-full max-md:!h-auto p-[1.143px] group" data-name="Card">
      {/* Gradient Border Overlay */}
      <div className="absolute inset-0 rounded-[24px] pointer-events-none p-[1.143px] bg-gradient-to-b from-[#6ae499] via-[#fde68a] to-[#ff6b57] opacity-60 group-hover:opacity-100 transition-opacity blur-[2px]" />
      {/* Inner Black Background */}
      <div className="absolute inset-[1.143px] bg-[#020601] rounded-[23px] z-0" />

      <div className="relative z-10 size-full overflow-hidden rounded-[23px]">
        <BgElements3 />
        <div className="absolute flex h-[208px] items-center justify-center left-[78.87px] top-[14.86px] w-[167.754px]" style={{ "--transform-inner-width": "669.359375", "--transform-inner-height": "19" } as React.CSSProperties}>
          <div className="flex-none rotate-[90deg]">
            <Frame11 />
          </div>
        </div>
      </div>

      {/* Inner Glow */}
      <div className="absolute inset-0 pointer-events-none rounded-[24px] shadow-[inset_0px_0px_20px_rgba(106,228,153,0.15)]" />
    </div>
  );
}

function Safer3() {
  return (
    <div className="relative lg:absolute h-[284px] lg:left-[60px] 2xl:left-[20px] rounded-[24px] lg:top-[550px] w-[240px] max-md:!w-full" data-name="Safer">
      <Lights3 />
      <div className="absolute flex h-[284px] items-center justify-center left-0 top-0 w-[240px]" style={{ "--transform-inner-width": "669.359375", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-[-90deg]">
          <Card3 />
        </div>
      </div>
    </div>
  );
}

function DivBtnLabel() {
  return (
    <div className="content-stretch flex items-start justify-center pr-[0.5px] relative shrink-0" data-name="div.btn-label">
      <div className="css-g0mm18 flex flex-col font-['Sora:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[18px] text-center text-white">
        <p className="css-ew64yg leading-[21.6px]">Get Your Free CRO Audit</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="bg-[#020601] h-[50px] relative rounded-[100px] shrink-0 cursor-pointer hover:scale-105 transition-transform cta-glow-pulse tap-feedback" data-name="Link" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
      <div className="content-stretch flex h-full items-center justify-center overflow-clip px-[28px] py-[12px] relative rounded-[inherit]">
        <DivBtnLabel />
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0px_30px_0px_rgba(106,228,153,0.6)]" />
      <div aria-hidden="true" className="absolute border border-[#6ae499] border-solid inset-0 pointer-events-none rounded-[100px]" />
    </div>
  );
}

function Frame() {
  return (
    <div className="relative lg:absolute content-stretch flex flex-col gap-[32px] items-center lg:left-[calc(50%+0.5px)] lg:top-[calc(50%-212px)] lg:translate-x-[-50%] lg:translate-y-[-50%] z-10 p-6 lg:p-0">
      <p className="bg-center bg-clip-text bg-cover bg-no-repeat css-ew64yg font-['Sora:SemiBold',sans-serif] font-semibold leading-[1.2] lg:leading-[72px] relative shrink-0 text-[40px] lg:text-[72px] text-center tracking-[-2.88px] w-full max-w-[900px]" style={{ WebkitTextFillColor: "transparent", backgroundImage: `url('${imgWhyChooseOurCroAgency}')` }}>
        Why Choose Our CRO Agency?
      </p>
      <p className="css-4hzbpn font-['Sora:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[16px] lg:text-[20px] text-[rgba(255,255,255,0.8)] text-center w-full max-w-[797px]">We don’t just run tests - we deliver measurable business growth.</p>
      <Link />
    </div>
  );
}


const whyChooseCards: { title: string; description: string; Icon: () => React.JSX.Element }[] = [
  {
    title: "100% Guarantee",
    description: "If we don't improve your conversions, you don't pay",
    Icon: Group1,
  },
  {
    title: "Fastest Setup, Continuous Growth",
    description: "Your first experiments live in just 14 days, with ongoing testing cycles for sustained impact",
    Icon: Group4,
  },
  {
    title: "Proven Track Record",
    description: "8+ years helping brands achieve an average 35% lift in conversion rates",
    Icon: Group2,
  },
  {
    title: "Specialized Expertise",
    description: "Certified CRO specialists with deep understanding of Arabic users, cultural nuances, and GCC market behavior",
    Icon: Group3,
  },
];

function MobileWhyChooseCards() {
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  return (
    <div ref={ref} className="grid grid-cols-2 gap-[15px] px-5 pb-8">
      {whyChooseCards.map((card, i) => {
        const Icon = card.Icon;
        return (
          <div
            key={i}
            className="relative rounded-[16px] overflow-hidden p-[1.143px] shadow-[0px_2px_28.8px_0px_rgba(253,230,138,0.1),0px_2px_17.6px_0px_rgba(146,235,180,0.1)]"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 120}ms, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 120}ms`,
            }}
          >
            {/* Gradient Border Overlay */}
            <div className="absolute inset-0 rounded-[16px] pointer-events-none bg-gradient-to-b from-[#6ae499] via-[#fde68a] to-[#ff6b57] opacity-60 blur-[2px]" />
            {/* Inner Black Background */}
            <div className="absolute inset-[1.143px] bg-[#020601] rounded-[15px] z-0" />
            {/* Content */}
            <div className="relative z-10 rounded-[15px] overflow-hidden">
              {/* Lights overlay */}
              <div className="absolute inset-0 bg-black rounded-[15px]">
                <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_4.57px_27.422px_-7.998px_#5b626d]" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black rounded-[15px]" />
              {/* Card content */}
              <div className="relative z-10 flex flex-col items-center gap-5 text-center px-3 py-6">
                <div className="scale-[0.5] origin-center shrink-0 -my-4">
                  <Icon />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="font-['Sora',sans-serif] font-semibold text-[14px] text-white leading-[18px]">{card.title}</p>
                  <p className="font-['Sora',sans-serif] font-normal text-[12px] text-white/80 leading-[17px]">{card.description}</p>
                </div>
              </div>
            </div>
            {/* Inner Glow */}
            <div className="absolute inset-0 pointer-events-none rounded-[16px] shadow-[inset_0px_0px_20px_rgba(106,228,153,0.15)]" />
          </div>
        );
      })}
    </div>
  );
}

export default function Component() {
  const isMobile = useIsMobile();
  return (
    <div className="bg-[#020601] relative w-full min-h-0 lg:min-h-[1000px] shrink-0 overflow-hidden" data-name="Component 333">
      <div className="relative lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:top-0 lg:w-[1440px] lg:h-full z-10 w-full flex flex-wrap justify-center gap-6 px-4 py-8 lg:block lg:p-0">
        <Frame7 />
        <Frame9 />
        <Frame8 />
        {/* Desktop cards - conditionally rendered to avoid duplicate SVG IDs */}
        {!isMobile && <>
          <Safer />
          <Safer1 />
          <Safer2 />
          <Safer3 />
        </>}
      </div>
      {/* Heading — renders before mobile cards */}
      <Frame />
      {/* Mobile cards — conditionally rendered to avoid duplicate SVG IDs */}
      {isMobile && <MobileWhyChooseCards />}
    </div>
  );
}