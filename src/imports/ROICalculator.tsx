import React, { useState, useMemo } from "react";
import imgRoiCalculator from "../assets/5522a305e991d2984d5522a9865ed717796014a0.webp";
import { useLanguage } from "../app/contexts/LanguageContext";

// ─── SVG paths for Saudi Riyal symbol (from Calculator project) ───
const sarPaths = {
  // Large ~40px
  large1: "M23.9781 35.5421C23.2906 36.9622 22.8362 38.5032 22.6621 40.1193L37.2098 37.2383C37.8972 35.8186 38.3513 34.2772 38.5257 32.6611L23.9781 35.5421Z",
  large2: "M37.2076 28.5992C37.895 27.1795 38.3494 25.6381 38.5235 24.022L27.1913 26.2673V21.951L37.2072 19.968C37.8947 18.5483 38.3491 17.0069 38.5232 15.3908L27.191 17.6343V2.11126C25.4546 3.01955 23.9124 4.22858 22.6589 5.65471V18.532L18.1268 19.4294V0C16.3903 0.907972 14.8482 2.11732 13.5946 3.54345V20.3266L3.454 22.3341C2.76656 23.7538 2.31181 25.2952 2.13738 26.9113L13.5946 24.6429V30.0786L1.31594 32.5095C0.628499 33.9292 0.174088 35.4706 0 37.0867L12.8524 34.5422C13.8986 34.3395 14.7978 33.7632 15.3825 32.9702L17.7395 29.7147C17.9842 29.3779 18.1268 28.9711 18.1268 28.5337V23.7455L22.6589 22.8481V31.4808L37.2076 28.5992Z",
  // Medium ~28px
  med1: "M16.7379 24.8109C16.2581 25.8022 15.9409 26.8779 15.8193 28.0061L25.9744 25.995C26.4543 25.0039 26.7713 23.9279 26.893 22.7998L16.7379 24.8109Z",
  med2: "M25.973 19.9639C26.4529 18.9728 26.7701 17.8968 26.8916 16.7687L18.9811 18.3361V15.323L25.9728 13.9388C26.4526 12.9478 26.7698 11.8718 26.8914 10.7437L18.9809 12.3097V1.47378C17.7687 2.10782 16.6922 2.95179 15.8172 3.94731V12.9364L12.6535 13.5629V0C11.4414 0.633816 10.3649 1.47801 9.48983 2.47353V14.1891L2.41109 15.5904C1.93122 16.5815 1.61377 17.6575 1.49201 18.7856L9.48983 17.2022V20.9966L0.918602 22.6935C0.438728 23.6845 0.121523 24.7605 0 25.8886L8.97168 24.1124C9.70202 23.9709 10.3297 23.5686 10.7378 23.0151L12.3832 20.7425C12.554 20.5074 12.6535 20.2235 12.6535 19.9182V16.5757L15.8172 15.9493V21.9754L25.973 19.9639Z",
  // Small ~14px
  small1: "M9.31647 13.8108C9.04937 14.3625 8.87282 14.9613 8.80518 15.5892L14.4575 14.4698C14.7246 13.9182 14.9011 13.3193 14.9688 12.6914L9.31647 13.8108Z",
  small2: "M14.4567 11.1129C14.7238 10.5613 14.9003 9.96242 14.968 9.3345L10.565 10.2069V8.52982L14.4565 7.75938C14.7236 7.20775 14.9002 6.60886 14.9678 5.98094L10.5648 6.85261V0.821287C9.89014 1.1742 9.29097 1.64395 8.8039 2.19806V7.20142L7.04299 7.55012V0.000976562C6.36832 0.353761 5.76914 0.823644 5.28208 1.37775V7.89868L1.34202 8.67868C1.07492 9.23031 0.898232 9.8292 0.830459 10.4571L5.28208 9.57577V11.6878L0.511297 12.6322C0.244198 13.1839 0.0676404 13.7828 0 14.4107L4.99367 13.422C5.40018 13.3433 5.74957 13.1194 5.97672 12.8112L6.89253 11.5464C6.9876 11.4155 7.04299 11.2575 7.04299 11.0875V9.22708L8.8039 8.87839V12.2326L14.4567 11.1129Z",
};

const LIFT_OPTIONS = [10, 20, 30, 40, 50];
const CURRENCIES = ["SAR", "USD", "EGP", "AED"];

const defaultValues = {
  currency: "SAR",
  monthlyUsers: 50000,
  currentCR: 2.4,
  currentAOV: 350,
  selectedLift: 20,
};

// ─── Saudi Riyal SVG components ───
function SarLarge() {
  return (
    <div className="h-[22px] lg:h-[40px] relative shrink-0 w-[20px] lg:w-[36px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 38.53 40.12">
        <path d={sarPaths.large1} fill="white" />
        <path d={sarPaths.large2} fill="white" />
      </svg>
    </div>
  );
}

function SarMed({ color = "white" }: { color?: string }) {
  return (
    <div className="h-[16px] lg:h-[28px] relative shrink-0 w-[14px] lg:w-[26px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 26.9 28">
        <path d={sarPaths.med1} fill={color} />
        <path d={sarPaths.med2} fill={color} />
      </svg>
    </div>
  );
}

function SarSmall({ color = "rgba(255,255,255,0.7)" }: { color?: string }) {
  return (
    <div className="h-[15px] relative shrink-0 w-[14px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 15.59">
        <path d={sarPaths.small1} fill={color} />
        <path d={sarPaths.small2} fill={color} />
      </svg>
    </div>
  );
}

// ─── Currency display helper ───
function CurrencySymbol({ currency, size = "small", color }: { currency: string; size?: "large" | "med" | "small"; color?: string }) {
  if (currency === "SAR") {
    if (size === "large") return <SarLarge />;
    if (size === "med") return <SarMed color={color} />;
    return <SarSmall color={color} />;
  }
  const textSize = size === "large" ? "text-[36px]" : size === "med" ? "text-[24px]" : "text-[14px]";
  return <span className={`${textSize} font-semibold`} style={{ color: color || "white" }}>{currency}</span>;
}

// ─── Stepper Input ───
function StepperInput({
  value,
  onChange,
  step,
  min = 0,
  suffix,
  displayFormatter,
}: {
  value: number;
  onChange: (v: number) => void;
  step: number;
  min?: number;
  suffix?: string;
  displayFormatter?: (v: number) => string;
}) {
  const [focused, setFocused] = React.useState(false);

  const dec = () => onChange(parseFloat((Math.max(min, value - step)).toFixed(2)));
  const inc = () => onChange(parseFloat((value + step).toFixed(2)));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    const v = suffix === "%" ? parseFloat(raw) : parseInt(raw);
    onChange(isNaN(v) ? 0 : Math.max(min, v));
  };

  const displayValue = focused
    ? String(value)
    : displayFormatter
    ? displayFormatter(value)
    : suffix
    ? String(value)
    : String(value);

  const btnStyle = {
    background: "rgba(255,255,255,0.1)",
    border: "0.5px solid rgba(255,255,255,0.2)",
  };
  const inputBg = "linear-gradient(90deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.30) 100%)";

  return (
    <div className="flex items-center w-full">
      {/* Editable input */}
      <div
        className="flex-1 h-[40px] lg:h-[52px] rounded-[12px] relative flex items-center justify-center gap-1"
        style={{ background: inputBg, border: `1px solid ${focused ? "rgba(106,228,153,0.6)" : "rgba(255,255,255,0.38)"}`, transition: "border-color 0.2s" }}
      >
        <input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={handleChange}
          className="bg-transparent text-center text-white font-['Sora'] font-semibold text-[14px] lg:text-[16px] focus:outline-none w-full px-2"
        />
        {suffix && <span className="text-white/60 font-semibold text-[14px] shrink-0 px-2">{suffix}</span>}
      </div>
    </div>
  );
}


// ─── Main Calculator content ───
function CalculatorContent() {
  const { t, language } = useLanguage();
  const [currency, setCurrency] = useState(defaultValues.currency);
  const [monthlyUsers, setMonthlyUsers] = useState(defaultValues.monthlyUsers);
  const [currentCR, setCurrentCR] = useState(defaultValues.currentCR);
  const [currentAOV, setCurrentAOV] = useState(defaultValues.currentAOV);
  const [selectedLift, setSelectedLift] = useState(defaultValues.selectedLift);

  const handleReset = () => {
    setCurrency(defaultValues.currency);
    setMonthlyUsers(defaultValues.monthlyUsers);
    setCurrentCR(defaultValues.currentCR);
    setCurrentAOV(defaultValues.currentAOV);
    setSelectedLift(defaultValues.selectedLift);
  };

  const results = useMemo(() => {
    const baseRevenue = monthlyUsers * (currentCR / 100) * currentAOV;
    const projectedRevenue = baseRevenue * (1 + selectedLift / 100);
    const additionalRevenue = projectedRevenue - baseRevenue;
    const additionalOrders = Math.round(monthlyUsers * (currentCR / 100) * (selectedLift / 100));
    const progressFraction = projectedRevenue > 0 ? Math.min(baseRevenue / projectedRevenue, 1) : 0;
    return {
      baseRevenue: Math.round(baseRevenue),
      projectedRevenue: Math.round(projectedRevenue),
      additionalRevenue: Math.round(additionalRevenue),
      additionalOrders,
      progressFraction,
    };
  }, [monthlyUsers, currentCR, currentAOV, selectedLift]);

  const fmt = (v: number) => v.toLocaleString();

  const inputRowBg = "rgba(255,255,255,0.06)";
  const inputRowBorder = "1px solid rgba(255,255,255,0.12)";

  // Currency tab pill style
  const getCurrencyStyle = (c: string): React.CSSProperties =>
    c === currency
      ? { background: "#6ae499", color: "#020601", fontWeight: 600, borderRadius: "10px" }
      : { color: "rgba(255,255,255,0.6)", borderRadius: "10px" };

  return (
    <div className="flex flex-col gap-[20px] lg:gap-8 w-full items-center">
      {/* ─── Title ─── */}
      <p
        className="bg-center bg-clip-text bg-cover bg-no-repeat font-['Sora'] font-semibold text-[38px] lg:text-[56px] text-transparent text-center tracking-[-1.76px] lg:tracking-[-2.5px] leading-tight w-[94%] md:w-[90%] lg:w-full max-w-[350px] md:max-w-[800px] lg:max-w-none"
        style={{ backgroundImage: `url('${imgRoiCalculator}')` }}
      >
        {t('ROI Calculator')}
      </p>

      {/* ─── Currency selector ─── */}
      <div
        className="flex items-center px-[8px] py-[6px] lg:p-[6px] rounded-[12px] lg:rounded-[16px] w-[94%] md:w-[90%] lg:w-auto max-w-[350px] md:max-w-[800px] lg:max-w-none"
        style={{
          background: "rgba(255,255,255,0.26)",
          border: "1px solid rgba(255,255,255,0.38)",
        }}
      >
        {CURRENCIES.map((c) => (
          <button
            key={c}
            onClick={() => setCurrency(c)}
            className="flex-1 lg:flex-none px-[6px] lg:px-[32px] py-[4px] lg:py-[10px] text-[14px] lg:text-[18px] font-['Sora'] transition-all duration-200"
            style={getCurrencyStyle(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* ─── Projected Revenue (big display) ─── */}
      <div className="flex flex-col items-center gap-[12px] lg:gap-4 w-full">
        <p className="font-['Sora'] font-semibold text-[14px] lg:text-[20px] text-center text-white tracking-[0.56px] lg:tracking-[1.5px] uppercase">
          {t('Projected Monthly Revenue')}
        </p>
        <div className="flex items-center gap-[12px] lg:gap-6 justify-center">
          <p className="font-['Sora'] font-bold text-[32px] lg:text-[72px] text-white tracking-[-2px] leading-none">
            {fmt(results.projectedRevenue)}
          </p>
          {currency === "SAR" ? (
            <CurrencySymbol currency="SAR" size="large" />
          ) : (
            <span className="font-['Sora'] font-bold text-[20px] lg:text-[48px] text-white opacity-80">{currency}</span>
          )}
        </div>
      </div>

      {/* ─── 3 Input fields ─── */}
      <div className="flex flex-row gap-[9px] lg:gap-[44px] items-start w-[94%] md:w-[90%] lg:w-full max-w-[350px] md:max-w-[800px] lg:max-w-none justify-center">
        {/* Visitors */}
        <div className="flex flex-col gap-[6px] lg:gap-3 flex-1 lg:flex-none lg:w-[220px]">
          <p className="font-['Sora'] font-normal text-[12px] lg:text-[18px] text-center text-white">{t('Visitors')}</p>
          <StepperInput
            value={monthlyUsers}
            onChange={setMonthlyUsers}
            step={1000}
            min={0}
            displayFormatter={(v) => v.toLocaleString()}
          />
        </div>

        {/* Conv. % */}
        <div className="flex flex-col gap-[6px] lg:gap-3 flex-1 lg:flex-none lg:w-[220px]">
          <p className="font-['Sora'] font-normal text-[12px] lg:text-[18px] text-center text-white">{t('Conv. %')}</p>
          <StepperInput
            value={currentCR}
            onChange={setCurrentCR}
            step={0.1}
            min={0}
            suffix="%"
          />
        </div>

        {/* Avg Order */}
        <div className="flex flex-col gap-[6px] lg:gap-3 flex-1 lg:flex-none lg:w-[220px]">
          <p className="font-['Sora'] font-normal text-[12px] lg:text-[18px] text-center text-white">{t('Avg Order')}</p>
          <StepperInput
            value={currentAOV}
            onChange={setCurrentAOV}
            step={10}
            min={0}
            displayFormatter={(v) => v.toLocaleString()}
          />
        </div>
      </div>

      {/* ─── Lift selector ─── */}
      <div
        className="flex items-center justify-between px-[8px] lg:px-[24px] py-[6px] lg:py-[10px] rounded-[12px] lg:rounded-[16px] w-[94%] md:w-[90%] lg:w-full max-w-[350px] md:max-w-[800px] lg:max-w-[780px]"
        style={{
          background: "rgba(255,255,255,0.26)",
          border: "1px solid rgba(255,255,255,0.38)",
        }}
      >
        {LIFT_OPTIONS.map((lift) => (
          <button
            key={lift}
            onClick={() => setSelectedLift(lift)}
            className="px-[6px] lg:px-[24px] py-[6px] lg:py-[10px] font-['Sora'] text-[14px] lg:text-[18px] rounded-[8px] lg:rounded-[12px] transition-all duration-200"
            style={
              lift === selectedLift
                ? { background: "#6ae499", color: "#020601", fontWeight: 600 }
                : { color: "rgba(255,255,255,0.6)" }
            }
          >
            {lift}%{lift === selectedLift ? ` ${t('Lift')}` : ""}
          </button>
        ))}
      </div>

      {/* ─── Additional metrics row ─── */}
      <div className="flex items-start justify-between w-[94%] md:w-[90%] lg:w-full max-w-[350px] md:max-w-[800px] lg:max-w-[780px]">
        {/* Additional Revenue */}
        <div className={`flex flex-col gap-[4px] lg:gap-3 ${language === 'ar' ? 'items-start' : 'items-start'}`}>
          <p className={`font-['Sora'] font-normal text-[12px] lg:text-[16px] text-white tracking-[-0.12px] ${language === 'ar' ? 'text-right' : 'text-center'}`}>{t('Additional Revenue')}</p>
          <div className="flex items-center gap-[8px] lg:gap-3">
            <p className="font-['Sora'] font-semibold text-[20px] lg:text-[40px] text-[#6ae499] tracking-[-0.8px] lg:tracking-[-1px] leading-none">
              +{fmt(results.additionalRevenue)}
            </p>
            {currency === "SAR" ? (
              <CurrencySymbol currency="SAR" size="med" color="#6ae499" />
            ) : (
              <span className="font-['Sora'] font-semibold text-[14px] lg:text-[20px] text-[#6ae499]">{currency}</span>
            )}
          </div>
        </div>

        {/* Additional Orders */}
        <div className={`flex flex-col gap-[4px] lg:gap-3 ${language === 'ar' ? 'items-start max-md:!items-start' : 'items-end lg:items-start'}`}>
          <p className={`font-['Sora'] font-normal text-[12px] lg:text-[16px] text-white tracking-[-0.12px] ${language === 'ar' ? 'text-right' : 'text-center'}`}>{t('Additional Orders')}</p>
          <div className="flex items-center gap-[8px] lg:gap-2 text-white">
            <p className="font-['Sora'] font-semibold text-[20px] lg:text-[40px] tracking-[-0.8px] lg:tracking-[-1px] leading-none">
              +{fmt(results.additionalOrders)}
            </p>
            <p className="font-['Sora'] font-normal text-[12px] lg:text-[16px] opacity-70 self-end pb-1">{t('/month')}</p>
          </div>
        </div>
      </div>

      {/* ─── Progress bar ─── */}
      <div className="flex flex-col gap-[8px] lg:gap-3 w-[94%] md:w-[90%] lg:w-full max-w-[350px] md:max-w-[800px] lg:max-w-[780px]">
        {/* Labels */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[4px] lg:gap-2">
            <span className="font-['Sora'] font-normal text-[12px] lg:text-[16px] text-white/60">
              {fmt(results.baseRevenue)}
            </span>
            {currency === "SAR" ? (
              <CurrencySmallInline />
            ) : (
              <span className="text-[12px] text-white/50">{currency}</span>
            )}
            <span className="font-['Sora'] text-[12px] lg:text-[14px] text-white/40">{t('Base')}</span>
          </div>
          <div className="flex items-center gap-[4px] lg:gap-2">
            <span className="font-['Sora'] font-normal text-[12px] lg:text-[16px] text-[#6ae499]">
              {fmt(results.projectedRevenue)}
            </span>
            {currency === "SAR" ? (
              <CurrencySmallInline green />
            ) : (
              <span className="text-[12px] text-[#6ae499]">{currency}</span>
            )}
            <span className="font-['Sora'] text-[12px] lg:text-[14px] text-[#6ae499]">{t('Projected')}</span>
          </div>
        </div>

        {/* Bar */}
        <div className={`relative h-[8px] lg:h-[12px] w-full rounded-[300px] bg-[#505150] overflow-hidden ${language === 'ar' ? 'transform scale-x-[-1]' : ''}`}>
          {/* Base portion (grey-blue) */}
          <div
            className="absolute left-0 top-0 h-full rounded-[300px] transition-all duration-500"
            style={{
              width: `${results.progressFraction * 100}%`,
              background: language === 'ar' ? "linear-gradient(-90deg, #494e55, #6e7470)" : "linear-gradient(90deg, #494e55, #6e7470)",
            }}
          />
          {/* Projected extension (green) */}
          <div
            className="absolute top-0 h-full rounded-[300px] transition-all duration-500"
            style={{
              left: `${results.progressFraction * 100}%`,
              right: 0,
              background: "#6ae499",
              opacity: results.progressFraction < 1 ? 1 : 0,
            }}
          />
        </div>

        <p className={`font-['Sora'] font-normal text-[12px] lg:text-[14px] text-white/40 ${language === 'ar' ? 'text-right' : 'text-center'}`}>
          {t('Tap values to recalculate')}
        </p>
      </div>

      {/* ─── Reset ─── */}
      <button
        onClick={handleReset}
        className="text-white/40 font-['Sora'] text-[13px] font-medium underline underline-offset-2 self-center active:text-white/60 transition-colors hover:text-white/60"
      >
        {t('Reset to defaults')}
      </button>
    </div>
  );
}

// Small inline SAR for progress labels
function CurrencySmallInline({ green }: { green?: boolean }) {
  const color = green ? "#6ae499" : "rgba(255,255,255,0.5)";
  return (
    <div className="h-[14px] relative shrink-0 w-[13px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 15.59">
        <path d={sarPaths.small1} fill={color} />
        <path d={sarPaths.small2} fill={color} />
      </svg>
    </div>
  );
}

function Card() {
  return (
    <div
      className="content-stretch flex flex-col items-center justify-center px-4 pt-7 pb-9 lg:px-16 lg:py-14 relative rounded-[16px] lg:rounded-[24px] w-full max-w-[1240px] overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(12,18,10,1) 0%, rgba(2,6,1,1) 100%)",
        border: "1.5px solid rgba(255,255,255,0.18)",
      }}
    >
      <style>{`
        @keyframes roi-top-wave {
          0%   { background-position: 0% 0%; }
          50%  { background-position: 100% 0%; }
          100% { background-position: 0% 0%; }
        }
        .animate-roi-top-strip {
          animation: roi-top-wave 8s ease-in-out infinite;
        }
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>

      {/* ── Animated top glow panel — same wave as booking section ── */}
      <div
        className="absolute top-0 left-0 right-0 h-[160px] lg:h-[240px] animate-roi-top-strip pointer-events-none rounded-t-[22px]"
        style={{
          backgroundImage:
            "linear-gradient(87.1906deg, rgb(66, 102, 164) 0%, rgb(146, 235, 180) 25%, rgb(66, 102, 164) 50%, rgb(146, 235, 180) 75%, rgb(66, 102, 164) 100%)",
          backgroundSize: "400% 100%",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* Top inner white glow — spreads the panel light inward */}
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_16.5px_36.9px_0px_rgba(255,255,255,0.4)]" />

      <div className="relative w-full">
        <CalculatorContent />
      </div>
    </div>
  );
}


export default function ROICalculator() {
  return (
    <div className="bg-[#020601] relative w-full flex items-center justify-center py-2 lg:py-16 px-4 overflow-hidden">
      <div className="w-full max-w-[1240px]">
        <Card />
      </div>
    </div>
  );
}
