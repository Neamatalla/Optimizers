import React from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { CASE_STUDY_DATA, ClientHeader, ChallengeBlock, MetricsBlock, PhoneStack } from './CaseStudyElements';

interface SyncSlideProps {
  activeIndex: number;
  onNext: () => void;
  onPrev: () => void;
}

export default function SyncSlideContainer({ activeIndex, onNext, onPrev }: SyncSlideProps) {
  // Use a spring for the index to make the motion feel fluid and "premium"
  const springIndex = useSpring(activeIndex, {
    stiffness: 100,
    damping: 20,
    mass: 1,
  });

  // Vertical Strip Offsets
  // Strip A (Phones): High speed/distance
  const phoneY = useTransform(springIndex, [0, 1, 2, 3], [0, -788, -1576, -2364]);
  
  // Strip B (Text): Medium speed. Using 400px per slide.
  const textY = useTransform(springIndex, [0, 1, 2, 3], [0, -400, -800, -1200]);

  // Strip C (Background - Full screen height)
  const bgY = useTransform(springIndex, [0, 1, 2, 3], [0, -800, -1600, -2400]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#020601]">
      
      {/* BACKGROUND STRIP (Gradients/Decoratives) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div style={{ y: bgY }} className="relative">
          {CASE_STUDY_DATA.map((data, index) => (
             <div 
               key={data.id} 
               className="h-[800px] w-full absolute left-0 flex items-center justify-center"
               style={{ top: `${index * 800}px` }}
             >
                <div className="absolute inset-0 opacity-40">
                   <div style={{ background: `radial-gradient(circle, ${data.themeColor}33 0%, transparent 70%)` }} 
                        className="absolute w-[400px] h-[400px] -bottom-20 -right-20 blur-3xl" />
                   <div style={{ background: `radial-gradient(circle, ${data.secondaryColor}22 0%, transparent 70%)` }} 
                        className="absolute w-[300px] h-[300px] -bottom-10 -left-10 blur-3xl" />
                </div>
             </div>
          ))}
        </motion.div>
      </div>

      {/* TEXT STRIP (Titles, Metrics, Challenges) */}
      <div className="absolute left-0 right-0 top-[20px] px-[20px] h-[380px] overflow-hidden z-20 pointer-events-none">
        <motion.div style={{ y: textY }} className="relative">
          {CASE_STUDY_DATA.map((data, index) => (
            <div 
              key={data.id} 
              className="h-[400px] absolute left-0 right-0 flex flex-col gap-[20px] py-[20px] shrink-0"
              style={{ top: `${index * 400}px` }}
            >
              <ClientHeader data={data} />
              <div className="flex flex-col gap-[12px]">
                 <ChallengeBlock data={data} />
                 <MetricsBlock data={data} />
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* PHONE STRIP (iPhone Mockups) */}
      <div className="absolute right-0 top-[310px] w-full h-[380px] overflow-hidden z-30 pointer-events-none">
        <motion.div style={{ y: phoneY }} className="relative">
          {CASE_STUDY_DATA.map((data, index) => (
            <div 
              key={data.id} 
              className="h-[788px] absolute left-0 right-0 flex items-center justify-center shrink-0"
              style={{ top: `${index * 788}px` }}
            >
              <PhoneStack data={data} />
            </div>
          ))}
        </motion.div>
      </div>

      {/* NAVIGATION OVERLAY (Static) */}
      <div className="-translate-x-1/2 absolute flex gap-[36px] items-center left-[calc(50%+0.5px)] top-[697.5px] z-[100]">
        {/* Prev Button */}
        <button 
          className="cursor-pointer group appearance-none border-none bg-transparent" 
          onClick={onPrev}
          aria-label="Previous Slide"
        >
          <div className="bg-[rgba(255,137,121,0.2)] flex flex-col items-center justify-center p-[8px] relative rounded-full group-hover:bg-[rgba(255,137,121,0.4)] transition-colors">
            <div className="absolute border-[#ffc5be] border-[0.583px] border-solid inset-0 rounded-full" />
            <ArrowIcon className="-rotate-90 -scale-y-100" />
          </div>
        </button>

        {/* Next Button */}
        <button 
          className={`cursor-pointer group appearance-none border-none bg-transparent ${activeIndex === 3 ? 'opacity-0 pointer-events-none' : ''}`} 
          onClick={onNext}
          aria-label="Next Slide"
        >
          <div className="bg-[rgba(255,137,121,0.2)] flex flex-col items-center justify-center p-[8px] relative rounded-full group-hover:bg-[rgba(255,137,121,0.4)] transition-colors">
            <div className="absolute border-[#ffc5be] border-[0.583px] border-solid inset-0 rounded-full" />
            <ArrowIcon className="rotate-90 scale-y-100" />
          </div>
        </button>
      </div>

    </div>
  );
}

const ArrowIcon = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center relative size-[24px] ${className}`}>
    <div className="overflow-clip relative size-[24px]">
      <div className="absolute inset-[37.5%_20.83%]">
         <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 8">
            <path d="M14 1L7.5 7L1 1" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
         </svg>
      </div>
    </div>
  </div>
);
