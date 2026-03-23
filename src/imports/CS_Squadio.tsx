import svgPaths from "./svg-cs2";
import imgProfilePhoto from "../assets/2cc5b00674c967ea21dbba5d55af8fe6d3656772.png";
import imgIPhone16Pro from "../assets/2ad077971799010c352d92d5752938507aa3d67b.png";
import { useLanguage } from "../app/contexts/LanguageContext";

interface CSProps {
  onNext?: () => void;
  onPrev?: () => void;
}

export default function CS_Squadio({ onNext, onPrev }: CSProps) {
  const { t } = useLanguage();
  return (
    <div className="bg-[#020601] relative overflow-hidden w-full h-full shrink-0">
      
      {/* Red gradient decorative elements at bottom */}
      <div className="absolute h-[100px] right-[-20px] top-[350px] w-[120px] opacity-60">
        <div className="absolute inset-[-77.6%_-77.69%_-82.79%_-55.57%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 346.345 345.773">
            <g opacity="0.8">
              <g filter="url(#filter0_f_1_81_cs2)">
                <path d={svgPaths.p943ba80} fill="#CD1800" />
              </g>
              <g filter="url(#filter1_f_1_81_cs2)">
                <path d={svgPaths.pcc8b6c0} fill="#FF6B57" />
              </g>
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="345.773" id="filter0_f_1_81_cs2" width="346.345" x="0" y="-9.53674e-07">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                <feGaussianBlur result="effect1_foregroundBlur_1_81" stdDeviation="57.6777" />
              </filter>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="103.771" id="filter1_f_1_81_cs2" width="133.591" x="102.419" y="103.212">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                <feGaussianBlur result="effect1_foregroundBlur_1_81" stdDeviation="6.07133" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>

      <div className="absolute h-[100px] left-[-30px] top-[340px] w-[120px] opacity-60">
        <div className="absolute inset-[-79.15%_-55.72%_-71.46%_-73.83%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 362.438 330.568">
            <g opacity="0.8">
              <g filter="url(#filter0_f_1_71_cs2)">
                <path d={svgPaths.p249f35d0} fill="#CD1800" />
              </g>
              <g filter="url(#filter1_f_1_71_cs2)">
                <path d={svgPaths.p1a06b850} fill="#FF6B57" />
              </g>
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="330.568" id="filter0_f_1_71_cs2" width="362.438" x="-1.84505e-06" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                <feGaussianBlur result="effect1_foregroundBlur_1_71" stdDeviation="58.2848" />
              </filter>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="94.6991" id="filter1_f_1_71_cs2" width="134.899" x="125.18" y="110.047">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                <feGaussianBlur result="effect1_foregroundBlur_1_71" stdDeviation="5.70705" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>

      <div className="absolute h-[3px] left-[25%] top-[440px] w-[50%]">
        <div className="absolute inset-[-966.66%_-25.39%_-966.67%_-25.39%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 209.097 74.0703">
            <g>
              <g filter="url(#filter0_f_1_77_cs2)">
                <ellipse cx="104.548" cy="37.0351" fill="url(#paint0_linear_1_77_cs2)" rx="69.3346" ry="1.8214" />
              </g>
              <g filter="url(#filter1_f_1_77_cs2)">
                <ellipse cx="104.548" cy="37.0351" fill="url(#paint1_linear_1_77_cs2)" rx="69.3346" ry="1.8214" />
              </g>
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="44.4422" id="filter0_f_1_77_cs2" width="179.469" x="14.8141" y="14.8141">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                <feGaussianBlur result="effect1_foregroundBlur_1_77" stdDeviation="10.1998" />
              </filter>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="74.0703" id="filter1_f_1_77_cs2" width="209.097" x="1.46822e-06" y="-1.63641e-06">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                <feGaussianBlur result="effect1_foregroundBlur_1_77" stdDeviation="17.6069" />
              </filter>
              <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_77_cs2" x1="35.2137" x2="176.554" y1="36.9623" y2="36.9623">
                <stop stopColor="#FF6B57" />
                <stop offset="1" stopColor="#FF6B57" />
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_77_cs2" x1="35.2137" x2="176.554" y1="36.9623" y2="36.9623">
                <stop stopColor="#FF6B57" />
                <stop offset="1" stopColor="#FF6B57" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="-translate-x-1/2 absolute flex gap-[36px] items-center left-[calc(50%+0.5px)] bottom-[24px] z-[100]">
        {/* Prev Button */}
        <div className="cursor-pointer" onClick={onPrev}>
          <div className="bg-[rgba(255,137,121,0.2)] content-stretch flex flex-col items-center justify-center p-[8px] relative rounded-[116.667px] hover:bg-[rgba(255,137,121,0.4)] transition-colors">
            <div aria-hidden="true" className="absolute border-[#ffc5be] border-[0.583px] border-solid inset-0 pointer-events-none rounded-[116.667px]" />
            <div className="flex items-center justify-center relative shrink-0 size-[24px]">
              <div className="-rotate-90 -scale-y-100 flex-none">
                <div className="overflow-clip relative size-[24px]">
                  <div className="absolute inset-[37.5%_20.83%]">
                    <div className="absolute inset-[-12.76%_-5.47%]">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.5313 7.53126">
                        <path d={svgPaths.p193e1500} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.53125" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Next Button */}
        <div className="cursor-pointer" onClick={onNext}>
          <div className="-scale-y-100 flex-none rotate-180">
            <div className="bg-[rgba(255,137,121,0.2)] content-stretch flex flex-col items-center justify-center p-[8px] relative rounded-[116.667px] hover:bg-[rgba(255,137,121,0.4)] transition-colors">
              <div aria-hidden="true" className="absolute border-[#ffc5be] border-[0.583px] border-solid inset-0 pointer-events-none rounded-[116.667px]" />
              <div className="flex items-center justify-center relative shrink-0 size-[24px]">
                <div className="-rotate-90 -scale-y-100 flex-none">
                  <div className="overflow-clip relative size-[24px]">
                    <div className="absolute inset-[37.5%_20.83%]">
                      <div className="absolute inset-[-12.76%_-5.47%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.5313 7.53126">
                          <path d={svgPaths.p193e1500} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.53125" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content card — positioned BELOW phones to avoid header overlap */}
      <div className="absolute content-stretch flex flex-col gap-[12px] items-start left-[20px] top-[480px] w-[calc(100%-40px)] z-[60]">
        
        {/* Header with profile and company info */}
        <div className="content-stretch flex gap-[12px] h-[62px] items-center relative shrink-0 w-full">
          <div className="relative shrink-0 size-[62px]">
            <img alt="" className="absolute block max-w-none size-full" height="62" src={imgProfilePhoto} width="62" />
          </div>
          <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start justify-center min-h-px min-w-px relative">
            <div className="flex flex-col font-['Sora',sans-serif] font-semibold h-[30px] justify-center leading-[0] relative shrink-0 text-[22px] text-white tracking-[-0.44px] w-full">
              <p className="leading-[47px]">Squadio</p>
            </div>
            <div className="bg-[rgba(255,107,87,0.15)] content-stretch flex items-center justify-center px-[12px] py-[4px] relative rounded-[100px] shrink-0">
              <div className="flex flex-col font-['Sora',sans-serif] font-normal h-[16px] justify-center leading-[0] relative shrink-0 text-[#ffa69a] text-[12px] w-[92px]">
                <p className="leading-[17px]">{t('Hiring Industry')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Challenge and Results sections */}
        <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
          
          {/* Challenge */}
          <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
            <p className="font-['Sora',sans-serif] font-semibold leading-[20px] relative shrink-0 text-[#ffc4bc] text-[14px] w-full">{t('Challenge')}</p>
            <p className="font-['Sora',sans-serif] font-normal leading-[17px] relative shrink-0 text-[12px] text-white/80 w-full">{t('Low conversions due to unclear value, distractions, weak CTAs, and no trust.')}</p>
          </div>

          {/* Results */}
          <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
            <p className="font-['Sora',sans-serif] font-semibold leading-[20px] relative shrink-0 text-[#ffc4bc] text-[14px] w-full">{t('Results')}</p>
            <div className="content-stretch flex items-start justify-between relative shrink-0 text-center w-full">
              <div className="content-stretch flex flex-col gap-[4px] items-start justify-center relative shrink-0">
                <div className="flex flex-col font-['Sora',sans-serif] font-semibold h-[22px] justify-center leading-[0] relative shrink-0 text-[#ff8979] text-[20px] tracking-[-0.96px] w-auto">
                  <p className="leading-[40px]">+44.02%</p>
                </div>
                <p className="font-['Sora',sans-serif] font-normal leading-[15px] relative shrink-0 text-[11px] text-white/70 w-auto">{t('Funnel Progression')}</p>
              </div>
              <div className="content-stretch flex flex-col gap-[4px] items-start justify-center relative shrink-0">
                <div className="flex flex-col font-['Sora',sans-serif] font-semibold h-[22px] justify-center leading-[0] relative shrink-0 text-[#ff8979] text-[20px] tracking-[-0.96px] w-auto">
                  <p className="leading-[40px]">+4.33%</p>
                </div>
                <p className="font-['Sora',sans-serif] font-normal leading-[15px] relative shrink-0 text-[11px] text-white/70 w-auto">{t('Conversion Rate')}</p>
              </div>
              <div className="content-stretch flex flex-col gap-[4px] items-start justify-center relative shrink-0">
                <div className="flex flex-col font-['Sora',sans-serif] font-semibold h-[22px] justify-center leading-[0] relative shrink-0 text-[#ff8979] text-[20px] tracking-[-0.96px] w-auto">
                  <p className="leading-[40px]">+6.49%</p>
                </div>
                <p className="font-['Sora',sans-serif] font-normal leading-[15px] relative shrink-0 text-[11px] text-white/70 w-auto">{t('Boost Engagement')}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Before text */}
      <div className="absolute flex h-[40px] items-center justify-center left-[20%] top-[120px] w-[80px] z-[20]">
        <div className="flex-none rotate-[-15.07deg]">
          <p className="font-['Sora',sans-serif] font-semibold leading-[28px] relative text-[20px] text-[rgba(255,255,255,0.2)] text-center">{t('Before')}</p>
        </div>
      </div>

      {/* After text */}
      <div className="absolute flex h-[40px] items-center justify-center right-[20%] top-[120px] w-[80px] z-[20]">
        <div className="flex-none rotate-[11.21deg]">
          <p className="font-['Sora',sans-serif] font-semibold leading-[28px] relative text-[20px] text-[rgba(255,255,255,0.2)] text-center">{t('After')}</p>
        </div>
      </div>

      {/* Right phone (After) — keep original sprite dimensions */}
      <div className="absolute flex h-[348px] items-center justify-center left-[48%] top-[150px] w-[213px] z-[20]">
        <div className="flex-none rotate-[13.09deg]">
          <div className="h-[324.328px] relative w-[143.281px]">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute h-[141.07%] left-[-104.26%] max-w-none top-[-8.05%] w-[425.75%]" src={imgIPhone16Pro} />
            </div>
          </div>
        </div>
      </div>

      {/* Left phone (Before) — keep original sprite dimensions */}
      <div className="absolute flex h-[349px] items-center justify-center left-[-2%] top-[140px] w-[225px] z-[20]">
        <div className="flex-none rotate-[-15.59deg]">
          <div className="h-[322.631px] relative w-[144.136px]">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute h-[141.81%] left-[-219.03%] max-w-none top-[-34.12%] w-[423.23%]" src={imgIPhone16Pro} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
