import { useLanguage } from "../app/contexts/LanguageContext";
import svgPaths from "./svg-8wsjqhowl2";
import imgBeOurNextSuccessStory from "../assets/835347f279bfb9f2ab07e91b8dc25069bcb6dcb2.webp";

function DivBtnLabel() {
  const { t } = useLanguage();
  return (
    <div className="content-stretch flex items-start justify-center pr-[0.5px] relative shrink-0" data-name="div.btn-label">
      <div className="css-g0mm18 flex flex-col font-['Sora:SemiBold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[18px] text-center text-white">
        <p className="css-ew64yg leading-[21.6px]">{t("Let's Write Your Success Story")}</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="bg-[#020601] h-[50px] relative rounded-[100px] shrink-0 cursor-pointer hover:scale-105 transition-transform" data-name="Link" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
      <div className="content-stretch flex h-full items-center justify-center overflow-clip px-[28px] py-[12px] relative rounded-[inherit]">
        <DivBtnLabel />
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0px_30px_0px_rgba(255,255,255,0.5)]" />
      <div aria-hidden="true" className="absolute border border-solid border-white inset-0 pointer-events-none rounded-[100px]" />
    </div>
  );
}

function Frame16() {
  const { t } = useLanguage();
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full px-4">
      <p className="css-4hzbpn font-['Sora:Regular',sans-serif] font-normal leading-[1.4] lg:leading-[28px] relative shrink-0 text-[16px] lg:text-[20px] text-[rgba(255,255,255,0.9)] text-center w-full max-w-[690px]">{t("See how we've helped e-commerce stores like yours boost conversions, lower costs, and unlock hidden revenue.")}</p>
      <div className="hidden lg:block"><Link /></div>
    </div>
  );
}

function Frame1() {
  const { t } = useLanguage();
  return (
    <div className="backdrop-blur-[20px] content-stretch flex flex-col gap-[32px] items-center justify-center relative rounded-[12px] shrink-0">
      <p className="bg-center bg-clip-text bg-cover bg-no-repeat css-ew64yg font-['Sora:SemiBold',sans-serif] font-semibold leading-[1.2] lg:leading-[92px] relative shrink-0 text-[40px] lg:text-[72.022px] tracking-[-1px] lg:tracking-[-2.8809px] text-center p-2" style={{ WebkitTextFillColor: "transparent", backgroundImage: `url('${imgBeOurNextSuccessStory}')` }}>
        {t('Be Our Next Success Story')}
      </p>
      <Frame16 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="h-[25.568px] relative shrink-0 w-[138px]">
      <div className="absolute inset-[0_-0.1%_0_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 138.145 25.5678">
          <g id="Frame 2131328421">
            <path d={svgPaths.p2bb91600} fill="var(--fill-0, white)" id="Vector" />
            <path d={svgPaths.p2bffc980} fill="var(--fill-0, white)" id="Vector_2" />
            <path d={svgPaths.p204f1e00} fill="var(--fill-0, white)" id="Vector_3" />
            <path d={svgPaths.pbb12f10} fill="var(--fill-0, white)" id="Vector_4" />
            <path d={svgPaths.p2e190800} fill="var(--fill-0, white)" id="Vector_5" />
            <path d={svgPaths.p2d26bac0} fill="var(--fill-0, white)" id="Vector_6" />
            <path d={svgPaths.pcd08c00} fill="var(--fill-0, white)" id="Vector_7" />
            <path d={svgPaths.p18111b00} fill="var(--fill-0, white)" id="Vector_8" />
            <path d={svgPaths.p2df56f00} fill="var(--fill-0, white)" id="Vector_9" />
            <path d={svgPaths.p18177d70} fill="var(--fill-0, white)" id="Vector_10" />
            <path d={svgPaths.p5f24a00} fill="var(--fill-0, white)" id="Vector_11" />
            <path d={svgPaths.p37a2c300} fill="var(--fill-0, white)" id="Vector_12" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[4.644px] relative shrink-0">
      <Frame2 />
    </div>
  );
}

function Component6239Ba0290D29F5D0A709E8BFacebookSvg() {
  return (
    <div className="relative shrink-0 size-[23.641px]" data-name="6239ba0290d29f5d0a709e8b_Facebook.svg">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.6413 23.6413">
        <g id="6239ba0290d29f5d0a709e8b_Facebook.svg">
          <path d={svgPaths.p226aba00} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Component6239Ba0290D29F5D0A709E8BFacebookSvgFill() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[23.641px]" data-name="6239ba0290d29f5d0a709e8b_Facebook.svg fill">
      <Component6239Ba0290D29F5D0A709E8BFacebookSvg />
    </div>
  );
}

function Component6239Ba0290D29F5D0A709E8BFacebookSvg1() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[47.28260803222656px] overflow-clip relative shrink-0" data-name="6239ba0290d29f5d0a709e8b_Facebook.svg">
      <Component6239Ba0290D29F5D0A709E8BFacebookSvgFill />
    </div>
  );
}

function Link1() {
  return (
    <a className="bg-[rgba(255,255,255,0.12)] content-stretch flex items-center justify-center max-h-[444.4565124511719px] max-w-[444.4565124511719px] p-[11.821px] relative rounded-[23.641px] shrink-0 size-[40px]" data-name="Link" href="https://www.facebook.com/">
      <Component6239Ba0290D29F5D0A709E8BFacebookSvg1 />
    </a>
  );
}

function Component6239Ba027A3Bbd1Ec055Fda8TwitterSvg() {
  return (
    <div className="relative shrink-0 size-[23.641px]" data-name="6239ba027a3bbd1ec055fda8_Twitter.svg">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.6413 23.6413">
        <g id="6239ba027a3bbd1ec055fda8_Twitter.svg">
          <path d={svgPaths.p2990fd00} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Component6239Ba027A3Bbd1Ec055Fda8TwitterSvgFill() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[23.641px]" data-name="6239ba027a3bbd1ec055fda8_Twitter.svg fill">
      <Component6239Ba027A3Bbd1Ec055Fda8TwitterSvg />
    </div>
  );
}

function Component6239Ba027A3Bbd1Ec055Fda8TwitterSvg1() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[47.28260803222656px] overflow-clip relative shrink-0" data-name="6239ba027a3bbd1ec055fda8_Twitter.svg">
      <Component6239Ba027A3Bbd1Ec055Fda8TwitterSvgFill />
    </div>
  );
}

function Link2() {
  return (
    <a className="bg-[rgba(255,255,255,0.12)] content-stretch flex items-center justify-center max-h-[444.4565124511719px] max-w-[444.4565124511719px] p-[11.821px] relative rounded-[23.641px] shrink-0 size-[40px]" data-name="Link" href="https://www.twitter.com/">
      <Component6239Ba027A3Bbd1Ec055Fda8TwitterSvg1 />
    </a>
  );
}

function Component6239Ba027547Cf7Eb7430709LinkedinSvg() {
  return (
    <div className="relative shrink-0 size-[23.641px]" data-name="6239ba027547cf7eb7430709_Linkedin.svg">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.6413 23.6413">
        <g id="6239ba027547cf7eb7430709_Linkedin.svg">
          <path d={svgPaths.p1079ff00} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Component6239Ba027547Cf7Eb7430709LinkedinSvgFill() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[23.641px]" data-name="6239ba027547cf7eb7430709_Linkedin.svg fill">
      <Component6239Ba027547Cf7Eb7430709LinkedinSvg />
    </div>
  );
}

function Component6239Ba027547Cf7Eb7430709LinkedinSvg1() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[47.28260803222656px] overflow-clip relative shrink-0" data-name="6239ba027547cf7eb7430709_Linkedin.svg">
      <Component6239Ba027547Cf7Eb7430709LinkedinSvgFill />
    </div>
  );
}

function Link3() {
  return (
    <a className="bg-[rgba(255,255,255,0.12)] content-stretch flex items-center justify-center max-h-[444.4565124511719px] max-w-[444.4565124511719px] p-[11.821px] relative rounded-[23.641px] shrink-0 size-[40px]" data-name="Link" href="https://www.linkedin.com/">
      <Component6239Ba027547Cf7Eb7430709LinkedinSvg1 />
    </a>
  );
}

function Component6239Ba03Ad9611637A539Ec3InstagramSvg() {
  return (
    <div className="relative shrink-0 size-[23.641px]" data-name="6239ba03ad9611637a539ec3_Instagram.svg">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.6413 23.6413">
        <g id="6239ba03ad9611637a539ec3_Instagram.svg">
          <path d={svgPaths.p39bb0700} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Component6239Ba03Ad9611637A539Ec3InstagramSvgFill() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[23.641px]" data-name="6239ba03ad9611637a539ec3_Instagram.svg fill">
      <Component6239Ba03Ad9611637A539Ec3InstagramSvg />
    </div>
  );
}

function Component6239Ba03Ad9611637A539Ec3InstagramSvg1() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[47.28260803222656px] overflow-clip relative shrink-0" data-name="6239ba03ad9611637a539ec3_Instagram.svg">
      <Component6239Ba03Ad9611637A539Ec3InstagramSvgFill />
    </div>
  );
}

function Link4() {
  return (
    <a className="bg-[rgba(255,255,255,0.12)] content-stretch flex items-center justify-center max-h-[444.4565124511719px] max-w-[444.4565124511719px] p-[11.821px] relative rounded-[23.641px] shrink-0 size-[40px]" data-name="Link" href="https://www.instagram.com/">
      <Component6239Ba03Ad9611637A539Ec3InstagramSvg1 />
    </a>
  );
}

function DivSocialMediaContainer() {
  return (
    <div className="content-stretch cursor-pointer flex gap-[8px] items-center relative shrink-0" data-name="div.social-media-container">
      <Link1 />
      <Link2 />
      <Link3 />
      <Link4 />
    </div>
  );
}

function Frame() {
  const { t } = useLanguage();
  return (
    <div className="content-stretch flex flex-col gap-[18px] items-start py-px relative shrink-0" data-name="frame">
      <Frame3 />
      <div className="flex flex-col font-['Sora:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[14px] text-white w-[250px]">
        <p className="css-4hzbpn leading-[17px]">{t('Leading CRO agency specializing in GCC e-commerce optimization. ')}</p>
      </div>
      <DivSocialMediaContainer />
    </div>
  );
}

function Frame4() {
  const { t } = useLanguage();
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 text-[14px] w-full">
      <div className="flex flex-col justify-center relative shrink-0 w-full cursor-pointer hover:underline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <p className="css-4hzbpn leading-[17px]">{t('About')}</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 w-full cursor-pointer hover:underline" onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>
        <p className="css-4hzbpn leading-[17px]">{t('Services')}</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 w-full cursor-pointer hover:underline" onClick={() => document.getElementById('roi-calculator')?.scrollIntoView({ behavior: 'smooth' })}>
        <p className="css-4hzbpn leading-[17px]">{t('ROI Calculator')}</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 w-full cursor-pointer hover:underline" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
        <p className="css-4hzbpn leading-[17px]">{t('Contact')}</p>
      </div>
    </div>
  );
}

function Frame5() {
  const { t } = useLanguage();
  return (
    <div className="content-stretch flex flex-col font-['Sora:Regular',sans-serif] font-normal gap-[24px] items-start leading-[0] relative shrink-0 text-white w-[109px]">
      <div className="flex flex-col justify-center relative shrink-0 text-[18px] w-full">
        <p className="css-4hzbpn leading-[21.6px]">{t('Quick Links')}</p>
      </div>
      <Frame4 />
    </div>
  );
}

function Frame7() {
  const { t } = useLanguage();
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 text-[14px]">
      <div className="css-g0mm18 flex flex-col justify-center relative shrink-0">
        <p className="css-ew64yg leading-[17px]">{t('Conversion Rate Optimization')}</p>
      </div>
      <div className="flex flex-col justify-center min-w-full relative shrink-0 w-[min-content]">
        <p className="css-4hzbpn leading-[17px]">{t('A/B Testing')}</p>
      </div>
      <div className="flex flex-col justify-center min-w-full relative shrink-0 w-[min-content]">
        <p className="css-4hzbpn leading-[17px]">{t('User Experience Design')}</p>
      </div>
      <div className="flex flex-col justify-center min-w-full relative shrink-0 w-[min-content]">
        <p className="css-4hzbpn leading-[17px]">{t('Analytics & Tracking')}</p>
      </div>
    </div>
  );
}

function Frame6() {
  const { t } = useLanguage();
  return (
    <div className="content-stretch flex flex-col font-['Sora:Regular',sans-serif] font-normal gap-[24px] items-start leading-[0] relative shrink-0 text-white">
      <div className="flex flex-col justify-center min-w-full relative shrink-0 text-[18px] w-[min-content]">
        <p className="css-4hzbpn leading-[21.6px]">{t('Services')}</p>
      </div>
      <Frame7 />
    </div>
  );
}

function CommunicationLocationOn() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Communication / location_on">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Two Tone / Communication / location_on">
          <g id="Path"></g>
          <g id="ð¹ Secondary Color"></g>
          <path clipRule="evenodd" d={svgPaths.p4380b00} fill="var(--fill-0, white)" fillRule="evenodd" id="ð¹ Primary Color" />
        </g>
      </svg>
    </div>
  );
}

function Frame8() {
  const { t } = useLanguage();
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
      <CommunicationLocationOn />
      <div className="flex flex-col font-['Sora:Regular',sans-serif] font-normal justify-center leading-[0] relative self-stretch shrink-0 text-[14px] text-white w-[268px]">
        <p className="css-4hzbpn leading-[17px]">{t('Ras Al Khaimah Economic Zone Office')}</p>
      </div>
    </div>
  );
}

function CommunicationLocationOn1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Communication / location_on">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Two Tone / Communication / location_on">
          <g id="Path"></g>
          <g id="ð¹ Secondary Color"></g>
          <path clipRule="evenodd" d={svgPaths.p4380b00} fill="var(--fill-0, white)" fillRule="evenodd" id="ð¹ Primary Color" />
        </g>
      </svg>
    </div>
  );
}

function Frame9() {
  const { t } = useLanguage();
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0 w-full">
      <CommunicationLocationOn1 />
      <div className="flex flex-col font-['Sora:Regular',sans-serif] font-normal justify-center leading-[0] relative self-stretch shrink-0 text-[14px] text-white w-[271px]">
        <p className="css-4hzbpn leading-[17px]">{t('Office Business Hub, New Cairo, Egypt')}</p>
      </div>
    </div>
  );
}

function CommunicationCall() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Communication / call">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Outlined / Communication / call">
          <g id="Path"></g>
          <path clipRule="evenodd" d={svgPaths.p11492e00} fill="var(--fill-0, white)" fillRule="evenodd" id="ð¹ Icon Color" />
        </g>
      </svg>
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0">
      <CommunicationCall />
      <div className="flex flex-col font-['Sora:Regular',sans-serif] font-normal justify-center leading-[0] relative self-stretch shrink-0 text-[14px] text-white w-[115px]">
        <p className="css-4hzbpn leading-[17px]">+971 564800881</p>
      </div>
    </div>
  );
}

function CommunicationCall1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Communication / call">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Outlined / Communication / call">
          <g id="Path"></g>
          <path clipRule="evenodd" d={svgPaths.p11492e00} fill="var(--fill-0, white)" fillRule="evenodd" id="ð¹ Icon Color" />
        </g>
      </svg>
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0">
      <CommunicationCall1 />
      <div className="flex flex-col font-['Sora:Regular',sans-serif] font-normal justify-center leading-[0] relative self-stretch shrink-0 text-[14px] text-white w-[120px]">
        <p className="css-4hzbpn leading-[17px]">+2 01021001000</p>
      </div>
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-[303px]">
      <Frame8 />
      <Frame9 />
      <Frame11 />
      <Frame12 />
    </div>
  );
}

function Frame10() {
  const { t } = useLanguage();
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0">
      <div className="flex flex-col font-['Sora:Regular',sans-serif] font-normal justify-center leading-[0] min-w-full relative shrink-0 text-[18px] text-white w-[min-content]">
        <p className="css-4hzbpn leading-[21.6px]">{t('Contact Us')}</p>
      </div>
      <Frame13 />
    </div>
  );
}

function Frame14() {
  return (
    <div className="content-stretch flex flex-col lg:flex-row gap-10 items-start justify-between relative shrink-0 w-full max-w-[1308px]">
      <Frame />
      <Frame5 />
      <Frame6 />
      <Frame10 />
    </div>
  );
}

function Frame15() {
  return (
    <div className="relative shrink-0 w-full max-w-[1416px] mx-auto">
      <div className="w-full h-auto">
        <svg className="block w-full h-auto" fill="none" viewBox="0 0 1416 196.726">
          <g id="Frame 2147223088">
            <path d={svgPaths.p18f66e80} fill="url(#paint0_linear_1_185)" id="Vector" />
            <path d={svgPaths.p13199580} fill="url(#paint1_linear_1_185)" id="Vector_2" />
            <path d={svgPaths.p2100c480} fill="url(#paint2_linear_1_185)" id="Vector_3" />
            <path d={svgPaths.p210e1600} fill="url(#paint3_linear_1_185)" id="Vector_4" />
            <path d={svgPaths.p82bd200} fill="url(#paint4_linear_1_185)" id="Vector_5" />
            <path d={svgPaths.p2c1fc000} fill="url(#paint5_linear_1_185)" id="Vector_6" />
            <path d={svgPaths.p136c8800} fill="url(#paint6_linear_1_185)" id="Vector_7" />
            <path d={svgPaths.p4744100} fill="url(#paint7_linear_1_185)" id="Vector_8" />
            <path d={svgPaths.p1e1ba400} fill="var(--fill-0, white)" id="Vector_9" />
            <path d={svgPaths.p4884030} fill="url(#paint8_linear_1_185)" id="Vector_10" />
            <path d={svgPaths.p1cb7a80} fill="url(#paint9_linear_1_185)" id="Vector_11" />
            <path d={svgPaths.p32074780} fill="var(--fill-0, white)" id="Vector_12" />
            <g id="Ellipse 1223"></g>
          </g>
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_185" x1="402.775" x2="402.775" y1="-84.8687" y2="141.703">
              <stop />
              <stop offset="1" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_185" x1="516.054" x2="516.054" y1="-86.8155" y2="141.65">
              <stop />
              <stop offset="1" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_1_185" x1="665.401" x2="665.401" y1="-86.8161" y2="141.651">
              <stop />
              <stop offset="1" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_1_185" x1="814.484" x2="814.484" y1="-86.8155" y2="141.65">
              <stop />
              <stop offset="1" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint4_linear_1_185" x1="935.219" x2="935.219" y1="-84.0858" y2="140.593">
              <stop />
              <stop offset="1" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint5_linear_1_185" x1="1079.72" x2="1079.72" y1="-84.0858" y2="140.593">
              <stop />
              <stop offset="1" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint6_linear_1_185" x1="1221.57" x2="1221.57" y1="-84.8687" y2="141.703">
              <stop />
              <stop offset="1" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint7_linear_1_185" x1="1366.66" x2="1366.66" y1="-91.7482" y2="143.659">
              <stop />
              <stop offset="1" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint8_linear_1_185" x1="77.3107" x2="77.3107" y1="-94.8379" y2="154.921">
              <stop />
              <stop offset="1" stopOpacity="0" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint9_linear_1_185" x1="244.093" x2="244.093" y1="-135.981" y2="192.922">
              <stop />
              <stop offset="1" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <div className="bg-[#020601] content-stretch flex flex-col gap-[60px] lg:gap-[100px] items-center justify-end pb-[12px] pt-[60px] lg:pt-[100px] px-[12px] relative w-full min-h-screen" data-name="Footer">
      <div className="absolute blur-[45px] bottom-[0.23px] h-full left-0 right-0" data-name="Gradient+Blur" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\\\'0 0 1440 928\\\' xmlns=\\\'http://www.w3.org/2000/svg\\\' preserveAspectRatio=\\\'none\\\'><rect x=\\\'0\\\' y=\\\'0\\\' height=\\\'100%\\\' width=\\\'100%\\\' fill=\\\'url(%23grad)\\\' opacity=\\\'1\\\'/><defs><radialGradient id=\\\'grad\\\' gradientUnits=\\\'userSpaceOnUse\\\' cx=\\\'0\\\' cy=\\\'0\\\' r=\\\'10\\\' gradientTransform=\\\'matrix(187.2 0 0 99.417 720 92.8)\\\'><stop stop-color=\\\'rgba(0,0,0,0)\\\' offset=\\\'0.3741\\\'/><stop stop-color=\\\'rgba(24,33,48,0.25)\\\' offset=\\\'0.45005\\\'/><stop stop-color=\\\'rgba(48,65,96,0.5)\\\' offset=\\\'0.52599\\\'/><stop stop-color=\\\'rgba(71,98,143,0.75)\\\' offset=\\\'0.60194\\\'/><stop stop-color=\\\'rgba(95,130,191,1)\\\' offset=\\\'0.67788\\\'/><stop stop-color=\\\'rgba(121,183,186,1)\\\' offset=\\\'0.74519\\\'/><stop stop-color=\\\'rgba(146,235,180,1)\\\' offset=\\\'0.8125\\\'/><stop stop-color=\\\'rgba(201,245,218,1)\\\' offset=\\\'0.90625\\\'/><stop stop-color=\\\'rgba(255,255,255,1)\\\' offset=\\\'1\\\'/></radialGradient></defs></svg>')" }} />
      <Frame1 />
      <Frame14 />
      <Frame15 />
    </div>
  );
}