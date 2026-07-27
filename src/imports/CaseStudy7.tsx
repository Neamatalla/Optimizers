import { useLanguage } from "../app/contexts/LanguageContext";
import imgProfilePhoto from "../assets/898dc67341ef07c4d33f536eedbe608a8be5bd9d.png";
import imgBefore from "../assets/case-study-regal-pdp-before.png";
import imgAfter from "../assets/case-study-regal-pdp-after.png";
import PhoneMockupFrame from "./PhoneMockupFrame";

function PhonePair() {
  const { t } = useLanguage();
  return (
    <div className="h-[447px] relative shrink-0 w-full">
      <div className="absolute h-[446px] left-[280.11px] top-0 w-[213px]">
        <p className="-translate-x-1/2 absolute font-['Sora:SemiBold',sans-serif] font-semibold leading-[56px] left-[106.64px] text-[48px] text-[rgba(255,255,255,0.2)] text-center top-0 w-[184px] whitespace-pre-wrap">{t('After')}</p>
        <div className="absolute left-1/2 -translate-x-1/2 top-[36px]">
          <PhoneMockupFrame src={imgAfter} alt="Regal Honey product page after redesign" width={180} height={407} />
        </div>
      </div>
      <div className="absolute h-[447px] left-0 top-0 w-[213px]">
        <p className="-translate-x-1/2 absolute font-['Sora:SemiBold',sans-serif] font-semibold leading-[56px] left-[106.76px] text-[48px] text-[rgba(255,255,255,0.2)] text-center top-0 w-[184px] whitespace-pre-wrap">{t('Before')}</p>
        <div className="absolute left-1/2 -translate-x-1/2 top-[36px]">
          <PhoneMockupFrame src={imgBefore} alt="Regal Honey product page before redesign" width={195} height={407} />
        </div>
      </div>
    </div>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  const { t } = useLanguage();
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center justify-center relative shrink-0">
      <p className="font-['Sora:SemiBold',sans-serif] font-semibold leading-[56px] relative shrink-0 text-[#fcd34d] text-[48px] tracking-[-1.92px] w-full">{value}</p>
      <p className="font-['Sora:Regular',sans-serif] font-normal leading-[25.38px] relative shrink-0 text-[23px] text-white w-full">{t(label)}</p>
    </div>
  );
}

function MetricsRow() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex gap-[48px] items-center justify-center left-1/2 text-center top-[741px] w-[750px]">
      <StatBlock value="+66.0%" label="Revenue" />
      <StatBlock value="+52.6%" label="Conversion Rate" />
      <StatBlock value="+62.3%" label="Revenue per Visitor" />
    </div>
  );
}

function ChallengeBlock() {
  const { t, language } = useLanguage();
  return (
    <div className={`absolute content-stretch flex flex-col gap-[12px] items-start ${language === "ar" ? "right-[64px]" : "left-[64px]"} text-center top-[288px] w-[311px]`}>
      <p className="font-['Sora:SemiBold',sans-serif] font-semibold leading-[21.6px] min-w-full relative shrink-0 text-[#fef3c7] text-[18px] w-[min-content]">{t('Challenge')}</p>
      <p className="font-['Sora:Regular',sans-serif] font-normal leading-[26px] relative shrink-0 text-[20px] text-white w-[311px]">
        {t("The product page wasn't effectively guiding visitors toward purchase. Key trust signals, persuasive content, and conversion-focused elements were missing, leading to lower engagement and preventing users from confidently completing their purchase.")}
      </p>
    </div>
  );
}

function ResultsBlock() {
  const { t, language } = useLanguage();
  return (
    <div className={`absolute content-stretch flex flex-col gap-[12px] items-start ${language === "ar" ? "left-[64px]" : "left-[1065px]"} text-center top-[288px] w-[311px]`}>
      <p className="font-['Sora:SemiBold',sans-serif] font-semibold leading-[21.6px] min-w-full relative shrink-0 text-[#fef3c7] text-[18px] w-[min-content]">{t('Results')}</p>
      <p className="font-['Sora:Regular',sans-serif] font-normal leading-[26px] relative shrink-0 text-[20px] text-white w-[311px]">
        {t('Optimizing the product page with stronger messaging, clearer value propositions, enhanced trust elements, and improved purchase flow increased user confidence, resulting in higher conversions, revenue, and revenue per visitor.')}
      </p>
    </div>
  );
}

function BrandHeader() {
  const { t, language } = useLanguage();
  return (
    <div className={`absolute content-stretch flex gap-[12px] items-center ${language === "ar" ? "right-[64px]" : "left-[64px]"} top-[104px] w-[342px]`}>
      <div className="relative shrink-0 size-[73px]" data-name="Profile Photo">
        <img alt="" className="block max-w-none size-full" height="73" src={imgProfilePhoto} width="73" decoding="async" />
      </div>
      <div className="content-stretch flex flex-col gap-[10px] items-start justify-center relative shrink-0">
        <p className="font-['Sora:SemiBold',sans-serif] font-semibold leading-[34px] relative shrink-0 text-[28px] text-white tracking-[-0.56px] w-[176px] whitespace-pre-wrap">Regal Honey</p>
        <div className="bg-[rgba(252,211,77,0.15)] content-stretch flex items-center justify-center px-[12px] py-[6px] relative rounded-[100px] shrink-0">
          <p className="font-['Sora:Regular',sans-serif] font-normal leading-[17px] relative shrink-0 text-[#fde68a] text-[14px]">{t('Honey Industry')}</p>
        </div>
      </div>
    </div>
  );
}

export default function CaseStudy7() {
  return (
    <div className="bg-[#020601] relative size-full" data-name="Case Study Regal Product Page">
      <div className="absolute content-stretch flex flex-col items-center left-[473.24px] top-[143px] w-[495px]">
        <PhonePair />
      </div>
      <MetricsRow />
      <ChallengeBlock />
      <ResultsBlock />
      <BrandHeader />
    </div>
  );
}
