import React from "react";
import { motion } from "motion/react";
import svgPaths from "./svg-cs2";
import imgProfilePhoto from "../assets/2cc5b00674c967ea21dbba5d55af8fe6d3656772.png";
import imgIPhone16Pro from "../assets/2ad077971799010c352d92d5752938507aa3d67b.png";
import { useLanguage } from "../app/contexts/LanguageContext";

interface CSProps {
  onNext?: () => void;
  onPrev?: () => void;
  contentScale?: number;
  contentY?: any;
  status?: 'past' | 'active' | 'future';
}

const CLIP_EASE: any = [0.16, 1, 0.3, 1];

export default function CS_Squadio({ onNext, onPrev, contentScale = 1, contentY, status = 'future' }: CSProps) {
  const { t } = useLanguage();
  const isActive = status === 'active';
  const yPos = status === 'active' ? "0%" : status === 'past' ? "-100%" : "100%";

  return (
    <div className="bg-[#020601] relative overflow-hidden w-full h-full shrink-0">
      
      {/* Background Gradients (Unscaled) */}
      <div className="absolute h-[132.791px] left-[calc(75%-18.73px)] top-[657.52px] w-[148.475px]">
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

      <div className="absolute h-[134.193px] left-[-35px] top-[646px] w-[159.107px]">
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

      <div className="absolute h-[3.643px] left-[calc(25%+28.26px)] top-[660.55px] w-[138.669px]">
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

      {/* Scalable Content Layer */}
      <div style={{ 
        transform: `scale(${contentScale})`, 
        transformOrigin: 'center center',
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        <motion.div style={{ y: contentY, pointerEvents: 'auto', width: '100%', height: '100%', position: 'relative' }}>
          {/* Main content card */}
          <div className="absolute content-stretch flex flex-col gap-[20px] items-start left-[20px] top-[40px] w-[calc(100%-40px)] z-[60]">
            <div className="content-stretch flex gap-[12px] h-[62px] items-center relative shrink-0 w-full">
              <div className="relative shrink-0 size-[62px] overflow-hidden">
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: yPos }}
                  transition={{ duration: 0.8, ease: CLIP_EASE }}
                  className="size-full"
                >
                  <img alt="" className="absolute block max-w-none size-full" height="62" src={imgProfilePhoto} width="62" />
                </motion.div>
              </div>
              <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start justify-center min-h-px min-w-px relative">
                <div className="flex flex-col font-['Sora',sans-serif] font-semibold h-[30px] justify-center leading-[0] relative shrink-0 text-[25px] text-white tracking-[-0.44px] w-full overflow-hidden">
                  <motion.p 
                    initial={{ y: "100%" }}
                    animate={{ y: yPos }}
                    transition={{ duration: 0.8, ease: CLIP_EASE }}
                    className="leading-[47px]"
                  >
                    Squadio
                  </motion.p>
                </div>
                <div className="bg-[rgba(255,107,87,0.15)] content-stretch flex items-center justify-center px-[12px] py-[4px] relative rounded-[100px] shrink-0">
                  <motion.div 
                    initial={{ y: "100%" }}
                    animate={{ y: yPos }}
                    transition={{ duration: 0.8, ease: CLIP_EASE }}
                    className="flex flex-col font-['Sora',sans-serif] font-normal h-[16px] justify-center leading-[0] relative shrink-0 text-[#ffa69a] text-[13px] whitespace-nowrap"
                  >
                    <p className="leading-[17px] whitespace-nowrap">{t('Hiring Industry')}</p>
                  </motion.div>
                </div>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
              <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
                <div className="overflow-hidden w-full">
                  <motion.p 
                    initial={{ y: "100%" }}
                    animate={{ y: yPos }}
                    transition={{ duration: 0.8, ease: CLIP_EASE }}
                    className="font-['Sora',sans-serif] font-semibold leading-[20px] relative shrink-0 text-[#ffc4bc] text-[16px] w-full"
                  >
                    {t('Challenge')}
                  </motion.p>
                </div>
                <div className="overflow-hidden w-full">
                  <motion.p 
                    initial={{ y: "100%" }}
                    animate={{ y: yPos }}
                    transition={{ duration: 0.8, ease: CLIP_EASE }}
                    className="font-['Sora',sans-serif] font-normal leading-[18px] relative shrink-0 text-[13px] text-white/80 w-full"
                  >
                    {t('Low conversions due to unclear value, distractions, weak CTAs, and no trust.')}
                  </motion.p>
                </div>
              </div>
              <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
                <div className="overflow-hidden w-full">
                  <motion.p 
                    initial={{ y: "100%" }}
                    animate={{ y: yPos }}
                    transition={{ duration: 0.8, ease: CLIP_EASE }}
                    className="font-['Sora',sans-serif] font-semibold leading-[20px] relative shrink-0 text-[#ffc4bc] text-[16px] w-full"
                  >
                    {t('Results')}
                  </motion.p>
                </div>
                <div className="content-stretch flex items-start justify-between relative shrink-0 text-center w-full">
                  <div className="content-stretch flex flex-col gap-[4px] items-center justify-center relative shrink-0">
                    <div className="flex flex-col font-['Sora',sans-serif] font-semibold h-[22px] justify-center leading-[0] relative shrink-0 text-[#ff8979] text-[20px] tracking-[-0.96px] w-auto overflow-hidden">
                      <motion.p 
                        initial={{ y: "100%" }}
                        animate={{ y: yPos }}
                        transition={{ duration: 0.8, ease: CLIP_EASE }}
                        className="leading-[40px]"
                      >
                        +44.02%
                      </motion.p>
                    </div>
                    <div className="overflow-hidden">
                      <motion.p 
                        initial={{ y: "100%" }}
                        animate={{ y: yPos }}
                        transition={{ duration: 0.8, ease: CLIP_EASE }}
                        className="font-['Sora',sans-serif] font-normal leading-[15px] relative shrink-0 text-[13px] text-white/70 max-w-[90px] text-center"
                      >
                        {t('Funnel Progression')}
                      </motion.p>
                    </div>
                  </div>
                  <div className="content-stretch flex flex-col gap-[4px] items-center justify-center relative shrink-0">
                    <div className="flex flex-col font-['Sora',sans-serif] font-semibold h-[22px] justify-center leading-[0] relative shrink-0 text-[#ff8979] text-[20px] tracking-[-0.96px] w-auto overflow-hidden">
                      <motion.p 
                        initial={{ y: "100%" }}
                        animate={{ y: yPos }}
                        transition={{ duration: 0.8, ease: CLIP_EASE }}
                        className="leading-[40px]"
                      >
                        +4.33%
                      </motion.p>
                    </div>
                    <div className="overflow-hidden">
                      <motion.p 
                        initial={{ y: "100%" }}
                        animate={{ y: yPos }}
                        transition={{ duration: 0.8, ease: CLIP_EASE }}
                        className="font-['Sora',sans-serif] font-normal leading-[15px] relative shrink-0 text-[13px] text-white/70 max-w-[90px] text-center"
                      >
                        {t('Conversion Rate')}
                      </motion.p>
                    </div>
                  </div>
                  <div className="content-stretch flex flex-col gap-[4px] items-center justify-center relative shrink-0">
                    <div className="flex flex-col font-['Sora',sans-serif] font-semibold h-[22px] justify-center leading-[0] relative shrink-0 text-[#ff8979] text-[20px] tracking-[-0.96px] w-auto overflow-hidden">
                      <motion.p 
                        initial={{ y: "100%" }}
                        animate={{ y: yPos }}
                        transition={{ duration: 0.8, ease: CLIP_EASE }}
                        className="leading-[40px]"
                      >
                        +6.49%
                      </motion.p>
                    </div>
                <div className="overflow-hidden">
                      <motion.p 
                        initial={{ y: "100%" }}
                        animate={{ y: yPos }}
                        transition={{ duration: 0.8, ease: CLIP_EASE }}
                        className="font-['Sora',sans-serif] font-normal leading-[15px] relative shrink-0 text-[13px] text-white/70 max-w-[90px] text-center"
                      >
                        {t('Boost Engagement')}
                      </motion.p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="-translate-x-1/2 absolute flex h-[69.676px] items-center justify-center left-[82.71px] top-[312px] w-[119.068px] z-[20] overflow-hidden">
            <motion.div 
              initial={{ y: "100%", rotate: -15.07 }}
              animate={{ y: yPos, rotate: -15.07 }}
              transition={{ duration: 0.8, ease: CLIP_EASE }}
              className="flex-none"
            >
              <p className="font-['Sora',sans-serif] font-semibold leading-[41.862px] relative text-[32px] text-[rgba(255,255,255,0.2)] text-center w-[112px]">{t('Before')}</p>
            </motion.div>
          </div>
          <div className="-translate-x-1/2 absolute flex h-[60.439px] items-center justify-center left-[calc(66.67%+37.64px)] top-[326.84px] w-[105.275px] z-[20] overflow-hidden">
            <motion.div 
              initial={{ y: "100%", rotate: 11.21 }}
              animate={{ y: yPos, rotate: 11.21 }}
              transition={{ duration: 0.8, ease: CLIP_EASE }}
              className="flex-none"
            >
              <p className="font-['Sora',sans-serif] font-semibold leading-[41.862px] relative text-[32px] text-[rgba(255,255,255,0.2)] text-center w-[99px]">{t('After')}</p>
            </motion.div>
          </div>
          <div className="absolute flex h-[345.046px] items-center justify-center left-[calc(33.33%+19px)] top-[344px] w-[211.985px] z-[20] overflow-hidden">
            <motion.div 
              initial={{ y: "100%", rotate: 13.09 }}
              animate={{ y: yPos, rotate: 13.09 }}
              transition={{ duration: 0.8, ease: CLIP_EASE }}
              className="flex-none"
            >
              <div className="h-[321px] relative w-[143px]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[141.07%] left-[-104.26%] max-w-none top-[-8.05%] w-[425.75%]" src={imgIPhone16Pro} />
                </div>
              </div>
            </motion.div>
          </div>
          <div className="absolute flex h-[346.39px] items-center justify-center left-[19px] top-[329px] w-[222.776px] z-[20] overflow-hidden">
            <motion.div 
              initial={{ y: "100%", rotate: -15.59 }}
              animate={{ y: yPos, rotate: -15.59 }}
              transition={{ duration: 0.8, ease: CLIP_EASE }}
              className="flex-none"
            >
              <div className="h-[320px] relative w-[142px]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img alt="" className="absolute h-[141.81%] left-[-219.03%] max-w-none top-[-34.12%] w-[423.23%]" src={imgIPhone16Pro} />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
