import React from 'react';
import svgCs2 from './svg-cs2';
import svgCs3 from './svg-cs3';
import svgCs4 from './svg-cs4';
import svgCs5 from './svg-cs5';

import imgProfile1 from '../assets/2cc5b00674c967ea21dbba5d55af8fe6d3656772.png';
import imgProfile2 from '../assets/e6537bb81663fe2012b59144a2601a88d06d8c09.png';
import imgProfile3 from '../assets/898dc67341ef07c4d33f536eedbe608a8be5bd9d.png';
import imgProfile4 from '../assets/e4f4c75f98a50211733a99f07e7b06ed4444b841.png';

import imgPhone1 from '../assets/2ad077971799010c352d92d5752938507aa3d67b.png';
import imgPhone2 from '../assets/e4fc715b1cc2d43844292b34806acf28012b855a.png';
import imgPhone3 from '../assets/89ec4336fe22eb880a63008a67d56fd4de9e831b.png';
import imgPhone4 from '../assets/226f5471c2ace7a43fd3bc806eb9213e795a038b.png';

export const CASE_STUDY_DATA = [
  {
    id: 'squadio',
    name: 'Squadio',
    industry: 'Hiring Industry',
    challenge: 'Low conversions due to unclear value, distractions, weak CTAs, and no trust.',
    metrics: [
      { label: 'Funnel Progression', value: '+44.02%' },
      { label: 'Conversion Rate', value: '+4.33%' },
      { label: 'Boost Engagement', value: '+6.49%' },
    ],
    themeColor: '#FF6B57', // Red
    secondaryColor: '#CD1800',
    headerTextColor: '#ffc4bc',
    badgeBg: 'rgba(255,107,87,0.15)',
    badgeText: '#ffa69a',
    profileImg: imgProfile1,
    phoneImg: imgPhone1,
    svgs: svgCs2,
  },
  {
    id: 'ribal',
    name: 'Ribal Magic',
    industry: 'Home Appliances Industry',
    challenge: 'PDPs lacked clarity and urgency; weak CTAs led users to bounce early.',
    metrics: [
      { label: 'Conversion Rate', value: '+8.95%' },
      { label: 'Revenue Growth', value: '+9.41%' },
      { label: 'Products per Visitor', value: '+9.43%' },
    ],
    themeColor: '#31DA72', // Green
    secondaryColor: '#92EBB4',
    headerTextColor: '#cdf6dd',
    badgeBg: 'rgba(106,228,153,0.15)',
    badgeText: '#92ebb4',
    profileImg: imgProfile2,
    phoneImg: imgPhone2,
    svgs: svgCs3,
  },
  {
    id: 'regal',
    name: 'Regal Honey',
    industry: 'Honey Industry',
    challenge: 'Customers browsed but hesitated to buy due to unclear info and low trust.',
    metrics: [
      { label: 'Conversion Rate', value: '+6.4%' },
      { label: 'Revenue per Visitor', value: '+8.03%' },
      { label: 'Products per Visitor', value: '+6.42%' },
    ],
    themeColor: '#FBBF24', // Yellow
    secondaryColor: '#FCD34D',
    headerTextColor: '#fef3c7',
    badgeBg: 'rgba(252,211,77,0.15)',
    badgeText: '#fde68a',
    profileImg: imgProfile3,
    phoneImg: imgPhone3,
    svgs: svgCs4,
  },
  {
    id: 'vitrine',
    name: 'Vitrine Furniture',
    industry: 'Furniture Industry',
    challenge: 'Users skipping PLPs converted more; homepage buried products too deep.',
    metrics: [
      { label: 'Conversion Rate', value: '+28.47%' },
      { label: 'Revenue per Visitor', value: '+70.73%' },
      { label: 'Products per Visitor', value: '+23.88%' },
    ],
    themeColor: '#5F82BF', // Blue
    secondaryColor: '#87A2CF',
    headerTextColor: '#afc1df',
    badgeBg: 'rgba(135,162,207,0.2)',
    badgeText: '#afc1df',
    profileImg: imgProfile4,
    phoneImg: imgPhone4,
    svgs: svgCs5,
  },
];

export const ClientHeader = ({ data }: { data: typeof CASE_STUDY_DATA[0] }) => (
  <div className="flex gap-[12px] h-[62px] items-center relative shrink-0 w-full">
    <div className="relative shrink-0 size-[62px]">
      <img alt="" className="absolute block max-w-none size-full" height="62" src={data.profileImg} width="62" />
    </div>
    <div className="flex flex-[1_0_0] flex-col gap-[8px] items-start justify-center min-h-px min-w-px relative">
      <div className="flex flex-col font-['Sora',sans-serif] font-semibold h-[30px] justify-center leading-[0] relative shrink-0 text-[22px] text-white tracking-[-0.44px] w-full">
        <p className="leading-[47px]">{data.name}</p>
      </div>
      <div style={{ backgroundColor: data.badgeBg }} className="flex items-center justify-center px-[12px] py-[4px] relative rounded-[100px] shrink-0">
        <div style={{ color: data.badgeText }} className="flex flex-col font-['Sora',sans-serif] font-normal h-[16px] justify-center leading-[0] relative shrink-0 text-[12px]">
          <p className="leading-[17px] whitespace-nowrap">{data.industry}</p>
        </div>
      </div>
    </div>
  </div>
);

export const ChallengeBlock = ({ data }: { data: typeof CASE_STUDY_DATA[0] }) => (
  <div className="flex flex-col gap-[6px] items-start relative shrink-0 w-full">
    <p style={{ color: data.headerTextColor }} className="font-['Sora',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[16px] w-full">Challenge</p>
    <p className="font-['Sora',sans-serif] font-normal leading-[19px] relative shrink-0 text-[14px] text-white w-full">{data.challenge}</p>
  </div>
);

export const MetricsBlock = ({ data }: { data: typeof CASE_STUDY_DATA[0] }) => (
  <div className="flex flex-col gap-[6px] items-start relative shrink-0 w-full">
    <p style={{ color: data.headerTextColor }} className="font-['Sora',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[16px] w-full">Results</p>
    <div className="flex items-start justify-between relative shrink-0 text-center w-full">
      {data.metrics.map((metric, idx) => (
        <div key={idx} className="flex flex-col gap-[4px] items-start justify-center relative shrink-0">
          <div style={{ color: data.themeColor }} className="flex flex-col font-['Sora',sans-serif] font-semibold h-[26px] justify-center leading-[0] relative shrink-0 text-[24px] tracking-[-0.96px]">
            <p className="leading-[56px]">{metric.value}</p>
          </div>
          <p className="font-['Sora',sans-serif] font-normal leading-[17px] relative shrink-0 text-[14px] text-white text-left w-[85px]">{metric.label}</p>
        </div>
      ))}
    </div>
  </div>
);

export const PhoneStack = ({ data }: { data: typeof CASE_STUDY_DATA[0] }) => {
  // Special positioning and sizing for Vitrine Furniture's phone as requested
  const isVitrine = data.id === 'vitrine';
  const leftPhoneContainerStyle = isVitrine ? { left: '30px', top: '30px' } : {};
  const leftPhoneSizeClass = isVitrine ? 'h-[320px] w-[145px]' : 'h-[322px] w-[144px]';
  const rightPhoneSizeClass = isVitrine ? 'h-[323px] w-[143px]' : 'h-[324px] w-[143px]';

  return (
    <div className="relative w-full h-[350px]">
      {/* Before text */}
      <div className="-translate-x-1/2 absolute flex h-[69.676px] items-center justify-center left-[82px] top-[-30px] w-[119px]">
        <div className="flex-none rotate-[-15deg]">
          <p className="font-['Sora',sans-serif] font-semibold leading-[41px] relative text-[32px] text-[rgba(255,255,255,0.2)] text-center">Before</p>
        </div>
      </div>

      {/* After text */}
      <div className="-translate-x-1/2 absolute flex h-[60px] items-center justify-center right-[30px] top-[-15px] w-[105px]">
        <div className="flex-none rotate-[11deg]">
          <p className="font-['Sora',sans-serif] font-semibold leading-[41px] relative text-[32px] text-[rgba(255,255,255,0.2)] text-center">After</p>
        </div>
      </div>

      {/* Right phone (After) */}
      <div className="absolute flex h-[348px] items-center justify-center right-[20px] top-[15px] w-[213px]">
        <div className="flex-none rotate-[13deg]">
          <div className={`${rightPhoneSizeClass} relative`}>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute h-[141%] left-[-104%] max-w-none top-[-8%] w-[425%]" src={data.phoneImg} />
            </div>
          </div>
        </div>
      </div>

      {/* Left phone (Before) */}
      <div className="absolute flex h-[349px] items-center justify-center left-[10px] top-[0px] w-[225px]">
        <div className="flex-none rotate-[-15deg]">
          <div className={`${leftPhoneSizeClass} relative`} style={leftPhoneContainerStyle}>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img alt="" className="absolute h-[141%] left-[-219%] max-w-none top-[-34%] w-[423%]" src={data.phoneImg} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
