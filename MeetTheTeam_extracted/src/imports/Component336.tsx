import svgPaths from "./svg-jj0ekm63mz";
import imgMeetTheTeam from "figma:asset/8d66bfd17d6b22ed804f3aa6f56385a2cf9ca5a6.png";
import imgRectangle2 from "figma:asset/50905cbab8a0049200e5897664161da406c1a49e.png";
import imgRectangle3 from "figma:asset/765a8601a5ae7ea522905f072a9e8314e2bc4f62.png";
import imgRectangle4 from "figma:asset/7033d82832982715231067e78a000fa8e0e6682d.png";
import imgRectangle5 from "figma:asset/b3d17287c9ab25ec7eefd2e609fbd8d09cae7004.png";
import imgRectangle6 from "figma:asset/6718d3e970b82de1b878ffd486d988acddd13966.png";

function Lights() {
  return (
    <div className="absolute h-[202.631px] left-[0.78px] overflow-clip top-[0.77px] w-[158.448px]" data-name="Lights">
      <div className="absolute bg-black h-[202.631px] left-0 rounded-[11.427px] top-0 w-[158.448px]">
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_3.047px_18.282px_-5.332px_#5f82bf]" />
      </div>
      <div className="absolute h-[202.631px] left-0 rounded-[11.427px] top-0 w-[158.448px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[11.427px]">
          <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0)] inset-0 rounded-[11.427px] to-black" />
          <img alt="" className="absolute max-w-none object-cover opacity-50 rounded-[11.427px] size-full" src={imgRectangle2} />
        </div>
      </div>
    </div>
  );
}

function BgElements() {
  return (
    <div className="absolute contents left-[-147.82px] top-[-175.97px]" data-name="Bg Elements">
      <div className="absolute flex h-[560.224px] items-center justify-center left-[-147.06px] mix-blend-screen top-[-175.2px] w-[484.52px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-[72.8deg]">
          <div className="h-[360.174px] relative w-[474.954px]" data-name="Light greyish">
            <div className="absolute inset-[-15.65%_-11.86%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 587.658 472.877">
                <g filter="url(#filter0_f_1_331)" id="Light greyish" style={{ mixBlendMode: "screen" }}>
                  <path d={svgPaths.p3c9714f0} fill="url(#paint0_radial_1_331)" fillOpacity="0.4" />
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

function Text() {
  return (
    <div className="-translate-x-1/2 absolute contents left-[calc(50%-65.28px)] top-[9.89px]" data-name="Text">
      <div className="-translate-x-1/2 absolute flex h-[139px] items-center justify-center left-[calc(50%-55.61px)] top-[10.65px] w-[16px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <p className="bg-clip-text bg-gradient-to-b font-['Sora:SemiBold',sans-serif] font-semibold from-[43.103%] from-white leading-[15.334px] relative text-[12.668px] text-[transparent] text-center to-[rgba(255,255,255,0)] tracking-[-0.2534px] whitespace-nowrap">Mohamed Neamatalla</p>
        </div>
      </div>
      <div className="-translate-x-1/2 absolute flex h-[84px] items-center justify-center left-[calc(50%-76.95px)] top-[37.98px] w-[12px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <p className="font-['Sora:Regular',sans-serif] font-normal leading-[11.334px] relative text-[11px] text-[rgba(255,255,255,0.5)] text-center whitespace-nowrap">{`Founder & CEO`}</p>
        </div>
      </div>
    </div>
  );
}

function Card() {
  return (
    <div className="border-[#5f82bf] border-[0.762px] border-solid h-[159.972px] overflow-clip relative rounded-[12.188px] w-[204.916px]" data-name="Card">
      <BgElements />
      <Text />
    </div>
  );
}

function Safer() {
  return (
    <div className="absolute h-[203.49px] left-[20px] rounded-[17.181px] top-[80px] w-[160px]" data-name="Safer">
      <Lights />
      <div className="absolute flex h-[204.916px] items-center justify-center left-[0.02px] top-[0.01px] w-[159.972px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <Card />
        </div>
      </div>
    </div>
  );
}

function Lights1() {
  return (
    <div className="absolute h-[202.143px] left-[0.77px] overflow-clip top-[0.77px] w-[158.066px]" data-name="Lights">
      <div className="absolute bg-black h-[202.143px] left-0 rounded-[11.399px] top-0 w-[158.066px]">
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_3.04px_18.238px_-5.32px_#ffa69a]" />
      </div>
      <div className="absolute h-[202.143px] left-0 rounded-[11.399px] top-0 w-[158.066px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[11.399px]">
          <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0)] inset-0 rounded-[11.399px] to-black" />
          <img alt="" className="absolute max-w-none object-cover opacity-50 rounded-[11.399px] size-full" src={imgRectangle3} />
        </div>
      </div>
    </div>
  );
}

function BgElements1() {
  return (
    <div className="absolute contents left-[-147.45px] top-[-175.55px]" data-name="Bg Elements">
      <div className="absolute flex h-[558.875px] items-center justify-center left-[-146.69px] mix-blend-screen top-[-174.79px] w-[483.354px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-[72.8deg]">
          <div className="h-[359.307px] relative w-[473.811px]" data-name="Light greyish">
            <div className="absolute inset-[-15.65%_-11.86%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 586.243 471.738">
                <g filter="url(#filter0_f_1_325)" id="Light greyish" style={{ mixBlendMode: "screen" }}>
                  <path d={svgPaths.p30f98800} fill="url(#paint0_radial_1_325)" fillOpacity="0.4" />
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

function Text1() {
  return (
    <div className="-translate-x-1/2 absolute contents left-[calc(50%-65.14px)] top-[25.22px]" data-name="Text">
      <div className="-translate-x-1/2 absolute flex h-[74px] items-center justify-center left-[calc(50%-55.5px)] top-[43.22px] w-[16px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <p className="bg-clip-text bg-gradient-to-b font-['Sora:SemiBold',sans-serif] font-semibold from-[43.103%] from-white leading-[15.296px] relative text-[12.636px] text-[transparent] text-center to-[rgba(255,255,255,0)] tracking-[-0.2527px] whitespace-nowrap">Alia Mahran</p>
        </div>
      </div>
      <div className="-translate-x-1/2 absolute flex h-[109px] items-center justify-center left-[calc(50%-76.77px)] top-[25.98px] w-[12px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <p className="font-['Sora:Regular',sans-serif] font-normal leading-[11.306px] relative text-[11px] text-[rgba(255,255,255,0.5)] text-center whitespace-nowrap">Operation Manager</p>
        </div>
      </div>
    </div>
  );
}

function Card1() {
  return (
    <div className="border-[#ffa69a] border-[0.76px] border-solid h-[159.586px] overflow-clip relative rounded-[12.159px] w-[204.423px]" data-name="Card">
      <BgElements1 />
      <Text1 />
    </div>
  );
}

function Safer1() {
  return (
    <div className="absolute h-[203px] left-[calc(50%+7.5px)] rounded-[18.238px] top-[80px] w-[159.615px]" data-name="Safer">
      <Lights1 />
      <div className="absolute flex h-[204.423px] items-center justify-center left-[0.02px] top-[0.01px] w-[159.586px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <Card1 />
        </div>
      </div>
    </div>
  );
}

function Lights2() {
  return (
    <div className="absolute h-[203.139px] left-[0.78px] overflow-clip top-[0.78px] w-[158.845px]" data-name="Lights">
      <div className="absolute bg-black h-[203.139px] left-0 rounded-[11.455px] top-0 w-[158.845px]">
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_3.055px_18.328px_-5.346px_#fde68a]" />
      </div>
      <div className="absolute h-[203.139px] left-0 rounded-[11.455px] top-0 w-[158.845px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[11.455px]">
          <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0)] inset-0 rounded-[11.455px] to-black" />
          <div className="absolute inset-0 opacity-50 overflow-hidden rounded-[11.455px]">
            <img alt="" className="absolute h-[100.47%] left-[-15.83%] max-w-none top-[-0.12%] w-[131.25%]" src={imgRectangle4} />
          </div>
        </div>
      </div>
    </div>
  );
}

function BgElements2() {
  return (
    <div className="absolute contents left-[-148.18px] top-[-176.41px]" data-name="Bg Elements">
      <div className="absolute flex h-[561.628px] items-center justify-center left-[-147.42px] mix-blend-screen top-[-175.65px] w-[485.735px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-[72.8deg]">
          <div className="h-[361.077px] relative w-[476.145px]" data-name="Light greyish">
            <div className="absolute inset-[-15.65%_-11.86%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 589.131 474.062">
                <g filter="url(#filter0_f_1_323)" id="Light greyish" style={{ mixBlendMode: "screen" }}>
                  <path d={svgPaths.p1b3e6200} fill="url(#paint0_radial_1_323)" fillOpacity="0.4" />
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

function Text2() {
  return (
    <div className="-translate-x-1/2 absolute contents left-[calc(50%-65.43px)] top-[37.99px]" data-name="Text">
      <div className="-translate-x-1/2 absolute flex h-[82px] items-center justify-center left-[calc(50%-55.73px)] top-[38.76px] w-[16px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <p className="bg-clip-text bg-gradient-to-b font-['Sora:SemiBold',sans-serif] font-semibold from-[43.103%] from-white leading-[15.372px] relative text-[12.698px] text-[transparent] text-center to-[rgba(255,255,255,0)] tracking-[-0.254px] whitespace-nowrap">Omar Maged</p>
        </div>
      </div>
      <div className="-translate-x-1/2 absolute flex h-[78px] items-center justify-center left-[calc(50%-77.13px)] top-[40.98px] w-[12px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <p className="font-['Sora:Regular',sans-serif] font-normal leading-[11.362px] relative text-[11px] text-[rgba(255,255,255,0.5)] text-center whitespace-nowrap">Tech Manager</p>
        </div>
      </div>
    </div>
  );
}

function Card2() {
  return (
    <div className="border-[#fcd34d] border-[0.764px] border-solid h-[160.373px] overflow-clip relative rounded-[12.219px] w-[205.43px]" data-name="Card">
      <BgElements2 />
      <Text2 />
    </div>
  );
}

function Safer2() {
  return (
    <div className="absolute h-[204px] left-[20px] rounded-[18.328px] top-[298px] w-[160.401px]" data-name="Safer">
      <Lights2 />
      <div className="absolute flex h-[205.43px] items-center justify-center left-[0.02px] top-[0.01px] w-[160.373px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <Card2 />
        </div>
      </div>
    </div>
  );
}

function Lights3() {
  return (
    <div className="absolute h-[202.631px] left-[0.78px] overflow-clip top-[0.77px] w-[158.448px]" data-name="Lights">
      <div className="absolute bg-black h-[202.631px] left-0 rounded-[11.427px] top-0 w-[158.448px]">
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_3.047px_18.282px_-5.332px_#92ebb4]" />
      </div>
      <div className="absolute h-[202.631px] left-0 rounded-[11.427px] top-0 w-[158.448px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[11.427px]">
          <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0)] inset-0 rounded-[11.427px] to-black" />
          <img alt="" className="absolute max-w-none object-cover opacity-50 rounded-[11.427px] size-full" src={imgRectangle5} />
        </div>
      </div>
    </div>
  );
}

function BgElements3() {
  return (
    <div className="absolute contents left-[-147.82px] top-[-175.97px]" data-name="Bg Elements">
      <div className="absolute flex h-[560.224px] items-center justify-center left-[-147.05px] mix-blend-screen top-[-175.21px] w-[484.52px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-[72.8deg]">
          <div className="h-[360.174px] relative w-[474.954px]" data-name="Light greyish">
            <div className="absolute inset-[-15.65%_-11.86%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 587.658 472.877">
                <g filter="url(#filter0_f_1_315)" id="Light greyish" style={{ mixBlendMode: "screen" }}>
                  <path d={svgPaths.p24716d00} fill="url(#paint0_radial_1_315)" fillOpacity="0.4" />
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

function Text3() {
  return (
    <div className="-translate-x-1/2 absolute contents left-[calc(50%-65.28px)] top-[29.22px]" data-name="Text">
      <div className="-translate-x-1/2 absolute flex h-[88px] items-center justify-center left-[calc(50%-55.61px)] top-[36px] w-[16px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <p className="bg-clip-text bg-gradient-to-b font-['Sora:SemiBold',sans-serif] font-semibold from-[43.103%] from-white leading-[15.334px] relative text-[12.667px] text-[transparent] text-center to-[rgba(255,255,255,0)] tracking-[-0.2533px] whitespace-nowrap">Alaa Abdullah</p>
        </div>
      </div>
      <div className="-translate-x-1/2 absolute flex h-[101px] items-center justify-center left-[calc(50%-76.95px)] top-[29.98px] w-[12px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <p className="font-['Sora:Regular',sans-serif] font-normal leading-[11.334px] relative text-[11px] text-[rgba(255,255,255,0.5)] text-center whitespace-nowrap">Quality Assurance</p>
        </div>
      </div>
    </div>
  );
}

function Card3() {
  return (
    <div className="border-[#92ebb4] border-[0.762px] border-solid h-[159.972px] overflow-clip relative rounded-[12.188px] w-[204.916px]" data-name="Card">
      <BgElements3 />
      <Text3 />
    </div>
  );
}

function Safer3() {
  return (
    <div className="absolute h-[203.49px] left-[calc(50%+7.5px)] rounded-[18.282px] top-[298.25px] w-[160px]" data-name="Safer">
      <Lights3 />
      <div className="absolute flex h-[204.916px] items-center justify-center left-[0.02px] top-[0.01px] w-[159.972px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <Card3 />
        </div>
      </div>
    </div>
  );
}

function Lights4() {
  return (
    <div className="absolute h-[202.631px] left-[0.78px] overflow-clip top-[0.77px] w-[158.448px]" data-name="Lights">
      <div className="absolute bg-black h-[202.631px] left-0 rounded-[11.427px] top-0 w-[158.448px]">
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_3.047px_18.282px_-5.332px_rgba(255,164,55,0.8)]" />
      </div>
      <div className="absolute h-[202.631px] left-0 rounded-[11.427px] top-0 w-[158.448px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[11.427px]">
          <div className="absolute bg-gradient-to-b from-[rgba(0,0,0,0)] inset-0 rounded-[11.427px] to-black" />
          <img alt="" className="absolute max-w-none object-cover opacity-50 rounded-[11.427px] size-full" src={imgRectangle6} />
        </div>
      </div>
    </div>
  );
}

function BgElements4() {
  return (
    <div className="absolute contents left-[-147.82px] top-[-175.97px]" data-name="Bg Elements">
      <div className="absolute flex h-[560.224px] items-center justify-center left-[-147.06px] mix-blend-screen top-[-175.21px] w-[484.52px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-[72.8deg]">
          <div className="h-[360.174px] relative w-[474.955px]" data-name="Light greyish">
            <div className="absolute inset-[-15.65%_-11.86%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 587.658 472.877">
                <g filter="url(#filter0_f_1_335)" id="Light greyish" style={{ mixBlendMode: "screen" }}>
                  <path d={svgPaths.p1d11f480} fill="url(#paint0_radial_1_335)" fillOpacity="0.4" />
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

function Text4() {
  return (
    <div className="-translate-x-1/2 absolute contents left-[calc(50%-65.19px)] top-[33.24px]" data-name="Text">
      <div className="-translate-x-1/2 absolute flex h-[92px] items-center justify-center left-[calc(50%-55.61px)] top-[34.01px] w-[16px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <p className="bg-clip-text bg-gradient-to-b font-['Sora:SemiBold',sans-serif] font-semibold from-[43.103%] from-white leading-[15.333px] relative text-[12.667px] text-[transparent] text-center to-[rgba(255,255,255,0)] tracking-[-0.2533px] whitespace-nowrap">Mariam Chadii</p>
        </div>
      </div>
      <div className="-translate-x-1/2 absolute flex h-[62px] items-center justify-center left-[calc(50%-76.77px)] top-[48.98px] w-[12px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "19" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <p className="font-['Sora:Regular',sans-serif] font-normal leading-[11.333px] relative text-[11px] text-[rgba(255,255,255,0.5)] text-center whitespace-nowrap">UI/UX Lead</p>
        </div>
      </div>
    </div>
  );
}

function Card4() {
  return (
    <div className="border-[0.762px] border-[rgba(255,164,55,0.7)] border-solid h-[159.972px] overflow-clip relative rounded-[12.188px] w-[204.916px]" data-name="Card">
      <BgElements4 />
      <Text4 />
    </div>
  );
}

function Safer4() {
  return (
    <div className="-translate-x-1/2 absolute h-[203.49px] left-[calc(50%+0.5px)] rounded-[18.282px] top-[516.75px] w-[160px]" data-name="Safer">
      <Lights4 />
      <div className="absolute flex h-[204.916px] items-center justify-center left-[0.02px] top-[0.01px] w-[159.972px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "57" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <Card4 />
        </div>
      </div>
    </div>
  );
}

export default function Component() {
  return (
    <div className="bg-[#020601] relative size-full" data-name="Component 336">
      <p className="-translate-x-1/2 absolute bg-center bg-clip-text bg-cover bg-no-repeat font-['Sora:SemiBold',sans-serif] font-semibold h-[39px] leading-[48px] left-[187.5px] text-[46px] text-[transparent] text-center top-[40px] tracking-[-1.84px] w-[335px]" style={{ backgroundImage: `url('${imgMeetTheTeam}')` }}>
        Meet The Team
      </p>
      <Safer />
      <Safer1 />
      <Safer2 />
      <Safer3 />
      <Safer4 />
    </div>
  );
}