"use client";
import React, { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { InlineWidget } from "react-calendly";
import { useLanguage } from "../app/contexts/LanguageContext";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import imgBookYourFreeStrategySession from "../assets/4885e8a0678713d22d734d0a41f2f71f1b85c0ab.webp";

// --- Validation & Helpers ---
const validateWebsite = (url: string): string => {
  if (!url.trim()) return "";
  let urlToValidate = url.trim();
  if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://')) {
    urlToValidate = 'https://' + urlToValidate;
  }
  try {
    const urlObj = new URL(urlToValidate);
    if (!urlObj.hostname.includes('.')) return "Please enter a valid website URL";
    return "";
  } catch {
    return "Please enter a valid website URL";
  }
};

const validateEmail = (email: string): string => {
  if (!email.trim()) return "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return "";
};

const normalizeWebsiteUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return 'https://' + trimmed;
  }
  return trimmed;
};

// --- Original Design Components (Modified for Props) ---

function Frame5() {
  const { t } = useLanguage();
  return (
    <div className="relative flex flex-col items-center w-full px-0 text-center mt-[40px] lg:mt-[8.3vw]">
      <p className="bg-center bg-clip-text bg-cover bg-no-repeat css-4hzbpn font-['Sora:SemiBold',sans-serif] font-semibold leading-[44px] lg:leading-[84.026px] relative shrink-0 text-[40px] lg:text-[72.022px] text-center tracking-[-1.44px] lg:tracking-[-2.8809px] w-full lg:w-full max-w-[1105px] px-2" style={{ WebkitTextFillColor: "transparent", backgroundImage: `url('${imgBookYourFreeStrategySession}')` }}>
        {t('Book Your Free Strategy Session')}
      </p>
    </div>
  );
}

function StepNumber({ num, isCurrent, isActive }: { num: number, isCurrent: boolean, isActive: boolean }) {
  const opacity = isCurrent ? "1" : isActive ? "0.8" : "0.5";
  const borderColor = isCurrent ? "white" : "rgba(255,255,255,0.5)";
  const textColor = isCurrent ? "white" : isActive ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.5)";

  return (
    <div className="content-stretch flex flex-col items-center justify-center relative rounded-[10px] shrink-0 size-[20px]" style={{ opacity }}>
      <div aria-hidden="true" className="absolute border border-solid inset-0 pointer-events-none rounded-[10px]" style={{ borderColor }} />
      <div className="css-g0mm18 flex flex-col font-['Sora:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[12px] text-center" style={{ color: textColor }}>
        <p className="css-ew64yg leading-[14px]">{num}</p>
      </div>
    </div>
  );
}

function StepText({ title, subtitle, isCurrent, isActive }: { title: string, subtitle: string, isCurrent: boolean, isActive: boolean }) {
  const textColor = isCurrent ? "white" : isActive ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.5)";
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start justify-center leading-[0] relative self-stretch shrink-0 text-center" style={{ color: textColor }}>
      <div className="css-g0mm18 flex flex-col font-['Sora:SemiBold',sans-serif] font-semibold justify-center relative shrink-0 text-[11px] lg:text-[14px]">
        <p className="css-ew64yg leading-[17px]">{title}</p>
      </div>
      <div className="hidden lg:flex css-g0mm18 flex-col font-['Sora:Regular',sans-serif] font-normal justify-center relative shrink-0 text-[12px]">
        <p className="css-ew64yg leading-[14px]">{subtitle}</p>
      </div>
    </div>
  );
}

function StepWrapper({ num, title, subtitle, currentStep, maxStepReached, onStepClick }: any) {
  const isActive = num <= maxStepReached;
  const isCurrent = num === currentStep;

  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative cursor-pointer" onClick={() => isActive && onStepClick(num)}>
      <div className="flex flex-col items-center justify-center size-full">
        <div className="content-stretch flex flex-col items-center justify-center px-[8px] py-[8px] lg:px-[24px] lg:py-[16px] relative w-full">
          <div className="content-stretch flex gap-[8px] lg:gap-[16px] items-center lg:items-start relative shrink-0 w-full">
            <StepNumber num={num} isCurrent={isCurrent} isActive={isActive} />
            <StepText title={title} subtitle={subtitle} isCurrent={isCurrent} isActive={isActive} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileStepCircle({ num, isCurrent, isActive, onClick }: { num: number; isCurrent: boolean; isActive: boolean; onClick: () => void }) {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const borderColor = isCurrent ? "white" : "rgba(255,255,255,0.5)";
  const textColor = isCurrent ? "white" : "rgba(255,255,255,0.5)";
  const labelColor = isCurrent ? "white" : "rgba(255,255,255,0.5)";
  const labels = ["", t("Conversions"), t("Objective"), t("Website"), t("Contact"), t("Schedule")];

  return (
    <div
      className="flex flex-col gap-[14px] items-center cursor-pointer"
      onClick={() => isActive && onClick()}
    >
      <div className="flex items-center justify-center rounded-full size-[26px]" style={{ border: `1px solid ${borderColor}` }}>
        <span className="font-['Sora:Regular',sans-serif] font-normal text-[11px] text-center leading-none" style={{ color: textColor }}>{num}</span>
      </div>
      <span className="font-['Sora:Regular',sans-serif] font-normal text-center break-words w-full px-[2px] text-[11px] leading-[13px]" style={{ color: labelColor }}>{labels[num]}</span>
    </div>
  );
}

function Stepper({ currentStep, maxStepReached, onStepClick }: any) {
  const { t } = useLanguage();
  const steps = [
    { num: 1, title: t("Conversions"), subtitle: t("Conversion Volume") },
    { num: 2, title: t("Objective"), subtitle: t("Business Objective") },
    { num: 3, title: t("Website"), subtitle: t("Website") },
    { num: 4, title: t("Contact"), subtitle: t("Contact Details") },
    { num: 5, title: t("Schedule"), subtitle: t("Schedule") },
  ];

  return (
    <div className="w-full shrink-0" data-name="Stepper">
      {/* Desktop: Full stepper with labels */}
      <div className="hidden lg:flex content-stretch items-start justify-between relative rounded-[6px] w-full">
        {steps.map((s) => (
          <StepWrapper key={s.num} {...s} currentStep={currentStep} maxStepReached={maxStepReached} onStepClick={onStepClick} />
        ))}
        {/* Arrows */}
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx} className="absolute h-0 top-[26px] translate-y-[-50%] w-[40px]" style={{ left: `calc(${idx * 20}% - 20px)` }}>
            <div className="absolute inset-[-0.5px_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 1">
                <path d="M0 0.5H40" stroke="var(--stroke-0, white)" strokeOpacity="0.5" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: Horizontal scrollable row — each bubble in a fixed-width column */}
      <div
        className="flex lg:hidden items-start w-full py-2 overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {steps.map((s) => (
          <div key={s.num} className="flex-none flex justify-center" style={{ minWidth: '20%' }}>
            <MobileStepCircle
              num={s.num}
              isCurrent={s.num === currentStep}
              isActive={s.num <= maxStepReached}
              onClick={() => onStepClick(s.num)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const MobileRadio = ({ isSelected }: { isSelected: boolean }) => (
  isSelected ? (
    <div className="relative rounded-full size-[20px] shrink-0">
      <svg className="block size-full" fill="none" viewBox="0 0 17 17">
        <rect height="15.5" rx="7.75" stroke="#31DA72" strokeWidth="1.5" width="15.5" x="0.75" y="0.75" />
        <circle cx="8.5" cy="8.5" fill="#31DA72" r="5" />
      </svg>
    </div>
  ) : (
    <div className="relative rounded-full size-[20px] shrink-0">
      <div className="absolute inset-[3px] rounded-full border-[1.5px] border-white/60" />
    </div>
  )
);

const OptionCard = ({ text, isSelected, onClick }: { text: string, isSelected: boolean, onClick: () => void }) => (
  <div onClick={onClick} className={`flex flex-col justify-center min-h-[78px] lg:min-h-[150px] py-1.5 lg:py-2 relative rounded-[12px] lg:rounded-[16px] shrink-0 w-full lg:w-[300px] cursor-pointer transition-all duration-300 ${isSelected ? 'scale-[0.97]' : 'lg:hover:scale-[1.02]'}`} style={{ background: isSelected ? 'linear-gradient(90deg, rgba(0, 255, 90, 0.1) 0%, rgba(0, 255, 90, 0.1) 100%), #777' : '#777' }}>
    {/* Mobile layout: radio inline-left of text */}
    <div className="flex lg:hidden flex-row gap-[12px] items-center justify-start p-[16px] rounded-[inherit] w-full min-h-full">
      <MobileRadio isSelected={isSelected} />
      <p className={`flex-1 min-w-0 font-['Sora:Regular',sans-serif] font-normal leading-snug text-[13px] text-start break-words transition-colors duration-300 ${isSelected ? 'text-[#31da72]' : 'text-white'}`}>{text}</p>
    </div>
    {/* Desktop layout: radio inline-left of text */}
    <div className="hidden lg:flex flex-row items-center justify-start gap-[14px] px-[28px] py-[24px] relative rounded-[inherit] w-full min-h-full">
      <div className={`flex-shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-[#31da72]' : 'bg-transparent border-2 border-white/30'}`}>
        {isSelected && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="#020601" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        )}
      </div>
      <p className={`css-4hzbpn font-['Sora:Regular',sans-serif] font-normal leading-tight relative min-w-0 text-[18px] lg:text-[20px] text-start break-words transition-colors duration-300 ${isSelected ? 'text-[#31da72]' : 'text-white'}`}>{text}</p>
    </div>

    {/* Border — default state */}
    {!isSelected && (
      <>
        {/* Mobile: simple white/40 border */}
        <div aria-hidden="true" className="lg:hidden absolute border border-white/40 border-solid inset-0 pointer-events-none rounded-[12px]" />
        {/* Desktop: corner-gradient border */}
        <div
          className="hidden lg:block absolute inset-0 pointer-events-none rounded-[16px]"
          style={{
            padding: "1px",
            background: "radial-gradient(ellipse 50% 60% at 0% 0%, #4ade80 0%, transparent 100%), radial-gradient(ellipse 50% 60% at 100% 100%, #4ade80 0%, transparent 100%)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      </>
    )}

    {/* Selected state border */}
    {isSelected && (
      <>
        {/* Mobile: solid green border */}
        <div aria-hidden="true" className="lg:hidden absolute border border-[#31da72] border-solid inset-0 pointer-events-none rounded-[12px]" />
        {/* Desktop: green border + glow */}
        <div aria-hidden="true" className="hidden lg:block absolute border-2 border-[#31da72] border-solid inset-0 pointer-events-none rounded-[16px]" style={{ boxShadow: '0 0 16px rgba(49,218,114,0.25), inset 0 0 12px rgba(49,218,114,0.08)' }} />
      </>
    )}
  </div>
);


// --- Main Export ---

export default function StrategySession() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [showThankYouMessage, setShowThankYouMessage] = useState(false);
  const [formData, setFormData] = useState({
    conversionVolume: "",
    primaryObjective: "",
    customObjective: "",
    website: "",
    firstName: "",
    email: "",
  });
  const [validationErrors, setValidationErrors] = useState({ website: "", email: "" });

  // Mock mutation for demonstration if no backend is present
  const submitContactMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({ title: "Success!", description: "Information captured! Please choose a slot for our meeting." });
      setCurrentStep(prev => (prev === 4 ? 5 : prev));
      setMaxStepReached(prev => Math.max(prev, 5));
    },
    onError: (error: any) => toast({ title: "Error", description: error.message || "Failed to submit form.", variant: "destructive" }),
  });

  const handleNext = async () => {
    if (submitContactMutation.isPending) return;
    if (currentStep < 5) {
      if (currentStep === 4) {
        submitContactMutation.mutate({
          firstName: formData.firstName,
          email: formData.email,
          website: normalizeWebsiteUrl(formData.website),
          monthlyConversions: formData.conversionVolume,
          challenge: formData.primaryObjective === "Other" ? formData.customObjective : formData.primaryObjective,
        });
      } else {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        setMaxStepReached(prev => Math.max(prev, nextStep));
      }
    }
  };

  const handleBack = () => {
    if (submitContactMutation.isPending) return;
    if (currentStep > 1) {
      submitContactMutation.reset(); // Clear submission state when going back
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSelect = (field: string, value: string) => {
    if (submitContactMutation.isPending) return;
    setFormData(prev => ({ ...prev, [field]: value }));

    if (currentStep === 1 && value === "Fewer Than 100") {
      setTimeout(() => setShowThankYouMessage(true), 300);
      return;
    }

    if (currentStep === 1 || (currentStep === 2 && value !== "Other")) {
      setTimeout(() => {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        setMaxStepReached(prev => Math.max(prev, nextStep));
      }, 300);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "website") setValidationErrors(prev => ({ ...prev, website: validateWebsite(value) }));
    else if (name === "email") setValidationErrors(prev => ({ ...prev, email: validateEmail(value) }));
  };

  const isNextDisabled = () => {
    switch (currentStep) {
      case 1: return !formData.conversionVolume;
      case 2: return !formData.primaryObjective || (formData.primaryObjective === "Other" && !formData.customObjective.trim());
      case 3: return !formData.website || !!validationErrors.website;
      case 4: return !formData.firstName || !formData.email || !!validationErrors.email;
      default: return false;
    }
  };

  const renderCurrentStepContent = () => {
    if (showThankYouMessage) {
      return (
        <div className="flex flex-col items-center gap-8 py-16 text-center w-full">
          <h2 className="text-white text-[34px] font-semibold">{t('Thank you')}</h2>
          <p className="text-white opacity-80 max-w-[700px] text-[20px] leading-relaxed">
            {t('Unfortunately, given the current low conversion volume of your business, our services might not be the optimal fit at this time.')}
          </p>
          <Button
            onClick={() => { setShowThankYouMessage(false); setCurrentStep(1); setMaxStepReached(1); }}
            className="mt-4 px-8 py-4 bg-transparent border border-[#31da72] text-[#31da72] hover:bg-[#31da72]/10 rounded-xl"
          >
            {t('Go Back')}
          </Button>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="flex flex-col gap-[24px] lg:gap-[4.2vw] items-center w-full">
            <p className="css-4hzbpn font-['Sora:SemiBold',sans-serif] font-semibold leading-[22px] lg:leading-[1.3] text-[16px] lg:text-[2.4vw] text-center text-white tracking-[0px] w-full lg:w-auto" style={{ wordSpacing: '3px' }}>
              <span>{t('Number of conversions per')}</span>
              <br className="lg:hidden" />
              <span>{t('MONTH on average?')}</span>
            </p>
            <p className="lg:hidden text-[14px] text-white font-['Sora:Regular',sans-serif] self-start">{t('Select average:')}</p>
            <div className="grid grid-cols-2 gap-[12px] lg:flex lg:flex-col lg:gap-[24px] items-center w-full">
              <div className="contents lg:flex lg:flex-row lg:gap-[24px] lg:w-full lg:justify-center">
                <OptionCard text={t('Fewer Than 100')} isSelected={formData.conversionVolume === "Fewer Than 100"} onClick={() => handleSelect("conversionVolume", "Fewer Than 100")} />
                <OptionCard text={t('From 100 to 1K')} isSelected={formData.conversionVolume === "From 100 to 1K"} onClick={() => handleSelect("conversionVolume", "From 100 to 1K")} />
              </div>
              <div className="contents lg:flex lg:flex-row lg:gap-[24px] lg:w-full lg:justify-center">
                <OptionCard text={t('From 1K to 10K')} isSelected={formData.conversionVolume === "From 1K to 10K"} onClick={() => handleSelect("conversionVolume", "From 1K to 10K")} />
                <OptionCard text={t('10K+')} isSelected={formData.conversionVolume === "10K+"} onClick={() => handleSelect("conversionVolume", "10K+")} />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col gap-[24px] lg:gap-[4.2vw] items-center w-full">
            <p className="css-4hzbpn font-['Sora:SemiBold',sans-serif] font-semibold leading-[22px] lg:leading-[1.3] text-[16px] lg:text-[2.4vw] text-center text-white tracking-[0px] w-full lg:w-auto" style={{ wordSpacing: '3px' }}>{t('What is your primary conversion objective?')}</p>
            <p className="lg:hidden text-[14px] text-white font-['Sora:Regular',sans-serif] self-start">{t('Select objective:')}</p>
            {formData.primaryObjective === "Other" ? (
              <div className="w-full max-w-[400px] flex flex-col gap-4">
                <Input name="customObjective" value={formData.customObjective} onChange={handleInputChange} placeholder={t('Specify your objective...')} className="bg-white/10 border-[#31da72]/30 text-white placeholder:text-white/40 h-9 w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-[12px] lg:flex lg:flex-col lg:gap-[24px] w-full">
                <div className="contents lg:flex lg:flex-row lg:gap-[24px] lg:w-full lg:justify-center">
                  <OptionCard text={t('Signups (SaaS/eLearning)')} isSelected={formData.primaryObjective === "Signups"} onClick={() => handleSelect("primaryObjective", "Signups")} />
                  <OptionCard text={t('Online Sales (eCommerce)')} isSelected={formData.primaryObjective === "Online Sales"} onClick={() => handleSelect("primaryObjective", "Online Sales")} />
                </div>
                <div className="contents lg:flex lg:flex-row lg:gap-[24px] lg:w-full lg:justify-center">
                  <OptionCard text={t('Lead Gen (Professional Services)')} isSelected={formData.primaryObjective === "Lead Gen"} onClick={() => handleSelect("primaryObjective", "Lead Gen")} />
                  <OptionCard text={t('Other')} isSelected={formData.primaryObjective === "Other"} onClick={() => handleSelect("primaryObjective", "Other")} />
                </div>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col gap-[4.2vw] items-center w-full">
            <p className="css-4hzbpn font-['Sora:SemiBold',sans-serif] font-semibold leading-[22px] lg:leading-[1.3] text-[16px] lg:text-[2.4vw] text-center text-white tracking-[0px] w-full lg:w-auto" style={{ wordSpacing: '3px' }}>{t('What is your website?')}</p>
            <div className="w-full max-w-[380px] flex flex-col gap-2">
              <Input name="website" value={formData.website} onChange={handleInputChange} placeholder="https://yourwebsite.com" className={`bg-white/10 border-2 ${validationErrors.website ? 'border-red-500' : 'border-[#31da72]/30'} text-white h-9`} />
              {validationErrors.website && <p className="text-red-500 text-sm">{validationErrors.website}</p>}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col gap-[4.2vw] items-center w-full">
            <p className="css-4hzbpn font-['Sora:SemiBold',sans-serif] font-semibold leading-[22px] lg:leading-[1.3] text-[16px] lg:text-[2.4vw] text-center text-white tracking-[0px] w-full lg:w-auto" style={{ wordSpacing: '3px' }}>{t('Contact Information')}</p>
            <div className="w-full max-w-[380px] flex flex-col gap-6">
              <Input name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder={t('First Name')} className="bg-white/10 border-[#31da72]/30 text-white h-9" />
              <div className="flex flex-col gap-2">
                <Input name="email" value={formData.email} onChange={handleInputChange} placeholder={t('Email')} className={`bg-white/10 border-2 ${validationErrors.email ? 'border-red-500' : 'border-[#31da72]/30'} text-white h-9`} />
                {validationErrors.email && <p className="text-red-500 text-sm">{validationErrors.email}</p>}
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col items-center gap-6 w-full py-8">
            <p className="font-semibold text-[24px] lg:text-[34px] text-white">{t('Schedule Your Strategy Call')}</p>
            <div className="w-full">
              <InlineWidget
                url="https://calendly.com/neamatalla/cro"
                styles={{ height: '700px', width: '100%' }}
                prefill={{ email: formData.email, name: formData.firstName }}
                pageSettings={{ backgroundColor: '1a1a1a', primaryColor: '31da72', textColor: 'ffffff' }}
              />
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="bg-[#020601] relative w-full h-auto pb-[60px] lg:pb-[13.8vw] flex flex-col">
      <Frame5 />

      {/* Card Design - Switched to relative to push sections below it */}
      {/* Card Design - Switched to relative to push sections below it */}
      <div
        className="relative flex flex-col min-h-0 lg:min-h-[50.9vw] h-auto items-center justify-center mx-auto lg:mx-auto rounded-[16px] lg:rounded-[24px] mt-[16px] lg:mt-[2.8vw] w-[96%] md:w-[90%] lg:w-full max-w-[96vw] md:max-w-[800px] lg:max-w-[1240px] z-10 animate-wave-fast"
        data-name="Card"
        style={{
          backgroundImage: "linear-gradient(155.126deg, rgba(255, 255, 255, 0.05) 2.6545%, rgba(255, 255, 255, 0) 44.796%), url('data:image/svg+xml;utf8,<svg viewBox=\\\'0 0 1240 733\\\' xmlns=\\\'http://www.w3.org/2000/svg\\\' preserveAspectRatio=\\\'none\\\'><rect x=\\\'0\\\' y=\\\'0\\\' height=\\\'100%\\\' width=\\\'100%\\\' fill=\\\'url(%23grad)\\\' opacity=\\\'1\\\'/><defs><radialGradient id=\\\'grad\\\' gradientUnits=\\\'userSpaceOnUse\\\' cx=\\\'0\\\' cy=\\\'0\\\' r=\\\'10\\\' gradientTransform=\\\'matrix(196.13 40.783 -59.815 70.828 573.8 102.21)\\\'><stop stop-color=\\\'rgba(0,0,0,1)\\\' offset=\\\'0\\\'/><stop stop-color=\\\'rgba(0,0,0,1)\\\' offset=\\\'0.55823\\\'/><stop stop-color=\\\'rgba(0,0,0,0.3)\\\' offset=\\\'0.73997\\\'/><stop stop-color=\\\'rgba(0,0,0,0)\\\' offset=\\\'1\\\'/></radialGradient></defs></svg>'), linear-gradient(87.1906deg, rgb(66, 102, 164) 0%, rgb(146, 235, 180) 25%, rgb(66, 102, 164) 50%, rgb(146, 235, 180) 75%, rgb(66, 102, 164) 100%)",
          backgroundSize: "100% 100%, 100% 100%, 400% 400%",
          boxShadow: showThankYouMessage ? "0 0 50px rgba(49, 218, 114, 0.1)" : "none"
        }}
      >
        <style>{`
          @keyframes wave-gradient {
            0% { background-position: 0% 0%, 0% 0%, 0% 0%; }
            50% { background-position: 0% 0%, 0% 0%, 100% 100%; }
            100% { background-position: 0% 0%, 0% 0%, 0% 0%; }
          }
          .animate-wave-fast {
            animation: wave-gradient 8s ease-in-out infinite;
          }
        `}</style>
        <div aria-hidden="true" className="absolute border border-transparent lg:border-[1.5px] lg:border-white/40 border-solid inset-0 pointer-events-none rounded-[16px] lg:rounded-[24px]" />

        <div className="content-stretch flex flex-col gap-[16px] lg:gap-[40px] min-h-0 lg:min-h-[645px] h-auto items-center relative shrink-0 w-full pt-[24px] lg:pt-[40px] px-[12px] lg:px-8 pb-[20px] lg:pb-0">
          {!showThankYouMessage && <Stepper currentStep={currentStep} maxStepReached={maxStepReached} onStepClick={setCurrentStep} />}

          <div
            className={`flex-1 w-full flex flex-col items-center justify-center relative transition-all duration-500 ${currentStep === 5 ? 'lg:min-h-[850px]' : 'lg:min-h-[400px]'}`}
          >
            {renderCurrentStepContent()}
          </div>

          <div className="flex items-center justify-center gap-4 py-4 lg:py-4 mb-0 lg:mb-2 w-full h-auto lg:h-[60px]">
            {currentStep > 1 && !showThankYouMessage && (
              <Button onClick={handleBack} disabled={submitContactMutation.isPending} variant="outline" className="px-5 py-2 border-[#31da72] text-[#31da72] bg-black hover:bg-black/80 hover:text-[#31da72] rounded-xl h-auto text-sm font-semibold transition-all">{t('Back')}</Button>
            )}
            {((currentStep === 2 && formData.primaryObjective === "Other") || (currentStep >= 3 && currentStep < 5)) && !showThankYouMessage && (
              <Button onClick={handleNext} disabled={isNextDisabled() || submitContactMutation.isPending} className="px-5 py-2 border border-[#31da72] bg-[#31da72] text-[#020601] hover:bg-[#31da72]/90 rounded-xl h-auto text-sm font-semibold min-w-[80px] transition-all">
                {submitContactMutation.isPending ? t('Submitting...') : t('Next')}
              </Button>
            )}
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-16.5px_36.9px_0px_rgba(255,255,255,0.25)] lg:shadow-[inset_0px_16.5px_36.9px_0px_rgba(255,255,255,0.12)]" />
      </div>
    </div>
  );
}