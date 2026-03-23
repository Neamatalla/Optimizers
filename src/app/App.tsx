import React, { Suspense } from "react";
import imgOurServices from "../assets/462979b8a94cb599bf6cf91c5d11489a30eeae28.webp";
import Component333 from "@/imports/Component333";
import ProcessWithAnimation from "@/imports/ProcessWithAnimation";
import Table from "@/imports/Table";
import Frame2147223150 from "@/imports/Frame2147223150";
import StrategySession from "@/imports/StrategySession";
import Footer from "@/imports/Footer";
import AnimatedHeroSection from "@/imports/AnimatedHeroSection";
import HeaderSection from "@/imports/HeaderSection";
import { HeaderNav } from "@/imports/Frame2147223128";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/app/components/ui/sonner";
import ScrollToTopButton from "@/app/components/ScrollToTopButton";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import "../styles/services.css";

// Lazy-loaded components (below the fold)
const ROICalculator = React.lazy(() => import("@/imports/ROICalculator"));
const MeetTheTeam = React.lazy(() => import("@/imports/MeetTheTeam"));
const PartnersAndTools = React.lazy(() => import("@/imports/PartnersAndTools"));
const GallerySection = React.lazy(() => import("@/imports/GallerySection"));
const FAQSection = React.lazy(() => import("@/imports/FAQSection"));
const AnimatedCaseStudies = React.lazy(() => import("@/imports/AnimatedCaseStudies"));

interface ServiceCardProps {
  number: string;
  title: string;
  description: string;
  isLarger?: boolean;
}

function CardGlow() {
  return (
    <div className="absolute right-[-100px] top-[-50px] w-[450px] h-[340px] pointer-events-none opacity-60">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 450.537 338.494">
        <g id="Frame 2147223090">
          <g filter="url(#filter0_f_1_15933_card)" id="Ellipse 1224">
            <ellipse cx="179.269" cy="192.25" fill="#6AE499" fillOpacity="0.8" rx="86" ry="32" transform="rotate(24.7207 179.269 192.25)" />
          </g>
          <g filter="url(#filter1_f_1_15933_card)" id="Ellipse 1224_2">
            <ellipse cx="229.273" cy="185.249" fill="#FDE68A" rx="86" ry="32" transform="rotate(24.7207 229.273 185.249)" />
          </g>
          <g filter="url(#filter2_f_1_15933_card)" id="Ellipse 1225">
            <ellipse cx="271.267" cy="146.244" fill="#FFA69A" rx="86" ry="32" transform="rotate(24.7207 271.267 146.244)" />
          </g>
        </g>
        <defs>
          <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="292.488" id="filter0_f_1_15933_card" width="358.539" x="0" y="46.0061">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
            <feGaussianBlur result="effect1_foregroundBlur_1_15933" stdDeviation="50" />
          </filter>
          <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="292.488" id="filter1_f_1_15933_card" width="358.539" x="50.004" y="39.0045">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
            <feGaussianBlur result="effect1_foregroundBlur_1_15933" stdDeviation="50" />
          </filter>
          <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="292.488" id="filter2_f_1_15933_card" width="358.539" x="91.9977" y="0">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
            <feGaussianBlur result="effect1_foregroundBlur_1_15933" stdDeviation="50" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

function ServiceCard({ number, title, description, isLarger }: ServiceCardProps) {
  return (
    <div className="bg-[#0f120e] relative rounded-[16px] w-full max-w-[657px] overflow-hidden shrink-0 tap-feedback-card" style={{ height: isLarger ? '195px' : '174px' }}>
      <div className="flex items-center gap-[24px] p-[32px] h-full relative z-10">
        {/* Number */}
        <div
          className="flex flex-col justify-center leading-[0] shrink-0"
          style={{
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: '72px',
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: '-2.88px',
            width: '101px'
          }}
        >
          <p className="leading-[80px] m-0">{number}</p>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-[16px] items-start flex-1">
          <p
            className="m-0 font-semibold"
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '28px',
              lineHeight: '34px',
              letterSpacing: '-0.56px',
              color: 'white',
              maxWidth: '450px'
            }}
          >
            {title}
          </p>

          {/* Divider Line */}
          <div className="h-0 w-full relative">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block w-full h-[1px]" fill="none" preserveAspectRatio="none" viewBox="0 0 468 1">
                <line stroke="#0A391C" strokeWidth="1" x1="0" x2="468" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>

          <p
            className="m-0 font-normal"
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '18px',
              lineHeight: '21.6px',
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '468px'
            }}
          >
            {description}
          </p>
        </div>
      </div>
      <CardGlow />
      {/* Border Overlay with corner highlights */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[16px]"
        style={{
          padding: "1px",
          background: "linear-gradient(135deg, #4ade80 0%, transparent 20%, transparent 80%, #4ade80 100%)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
    </div>
  );
}

/** Mobile version of the service card (vertical stack) */
function MobileServiceCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="service-card-wrapper w-full relative">
      <div className="service-card-inner">
        {/* Number */}
        <div className="service-card-number">
          {number}
        </div>

        {/* Text Content */}
        <div className="service-card-content">
          <div className="service-card-title">{title}</div>
          <div className="service-card-separator"></div>
          <div className="service-card-desc">{description}</div>
        </div>

        {/* Gradient Blob */}
        <div className="service-card-blob">
          <svg width="200" height="150" viewBox="0 0 200 150" fill="none" style={{ width: '100%', height: '100%' }}>
            <g filter="url(#blob-filter0)">
              <ellipse cx="80" cy="75" rx="50" ry="20" transform="rotate(25 80 75)" fill="#6AE499" fillOpacity="0.8"/>
            </g>
            <g filter="url(#blob-filter1)">
              <ellipse cx="100" cy="70" rx="45" ry="18" transform="rotate(25 100 70)" fill="#FDE68A" fillOpacity="0.9"/>
            </g>
            <g filter="url(#blob-filter2)">
              <ellipse cx="115" cy="60" rx="40" ry="15" transform="rotate(25 115 60)" fill="#FFA69A" fillOpacity="0.8"/>
            </g>
            <defs>
              <filter id="blob-filter0" x="0" y="0" width="200" height="150" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feGaussianBlur stdDeviation="30" result="effect1_foregroundBlur"/>
              </filter>
              <filter id="blob-filter1" x="0" y="0" width="200" height="150" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feGaussianBlur stdDeviation="30" result="effect1_foregroundBlur"/>
              </filter>
              <filter id="blob-filter2" x="0" y="0" width="200" height="150" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                <feGaussianBlur stdDeviation="30" result="effect1_foregroundBlur"/>
              </filter>
            </defs>
          </svg>
        </div>
      </div>

      {/* Border Overlay with corner highlights matching Desktop */ }
      <div
        className="absolute inset-0 pointer-events-none rounded-[12px] z-20"
        style={{
          padding: "1px",
          background: "linear-gradient(135deg, #4ade80 0%, transparent 20%, transparent 80%, #4ade80 100%)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
    </div>
  );
}

/** Wrapper that adds scroll-triggered reveal with stagger on mobile */
function RevealServiceCards({ services }: { services: ServiceCardProps[] }) {
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  return (
    <div ref={ref} className="flex flex-col w-full items-center lg:items-start gap-[2.8vw] lg:gap-[5vw]">
      {services.map((service, index) => (
        <div
          key={index}
          className={`${isVisible ? 'reveal-visible' : 'reveal-hidden'} reveal-stagger-${index}`}
        >
          <ServiceCard {...service} />
        </div>
      ))}
    </div>
  );
}

const queryClient = new QueryClient();

export default function App() {
  const services = [
    // ... (services data unchanged)
    {
      number: "01",
      title: "Landing Page Optimization",
      description: "Design and refine landing pages built to maximize conversions",
      isLarger: false
    },
    {
      number: "02",
      title: "CRO Audits",
      description: "Analyze your funnel to spot leaks, friction points, and hidden opportunities",
      isLarger: false
    },
    {
      number: "03",
      title: "Data-Driven Design (UI/UX)",
      description: "Designs built for customers, rooted in analytics, consumer psychology, and Arabic UX best practices",
      isLarger: true
    },
    {
      number: "04",
      title: "A/B Testing",
      description: "Run systematic experiments to discover which design, copy, or flow converts best",
      isLarger: false
    },
    {
      number: "05",
      title: "GA4 Implementation & Tracking",
      description: "Set up advanced tracking to measure every step of the customer journey",
      isLarger: false
    },
    {
      number: "06",
      title: "Ongoing CRO Programs",
      description: "A continuous cycle of research, testing, and improvement that boost results over time",
      isLarger: false
    }
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <div className="global-persistent-header">
        <HeaderNav />
      </div>
      <div className="bg-[#020601] w-full min-h-screen relative flex flex-col">
        <HeaderSection />
        <div style={{ position: 'relative', background: '#020601' }}>
          
          {/* Unified Services Section for Navigation */}
          <div id="services" style={{ scrollMarginTop: '100px' }}>
            {/* MOBILE ONLY (< lg) - Pure Vertical Stack */}
            <div className="flex lg:hidden flex-col items-center w-full bg-[#020601] py-10">
              {/* Mobile Header elements using imported services.css styles */}
              <div className="header-section">
                <h1 className="services-title" style={{ backgroundImage: `url('${imgOurServices}')` }}>
                  Our Services
                </h1>
                <p className="services-description">
                  We follow a systematic 6-step approach that has generated millions in additional revenue for e-commerce brands across the GCC.
                </p>
                <button
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="audit-button hidden lg:block"
                >
                  Book a Free CRO Audit
                </button>
              </div>

              {/* Mobile Cards rendering vertically with CSS classes */}
              <div className="cards-container z-10">
                {services.map((service, idx) => (
                  <MobileServiceCard key={idx} {...service} />
                ))}
              </div>
            </div>

            {/* DESKTOP ONLY (>= lg) - Sticky Left / Scrolling Right */}
            <div className="hidden lg:flex flex-row gap-[7vw] p-[7vw] items-start">
              {/* Left Side - Text */}
              <div className="flex flex-col gap-[2.2vw] w-[37.3vw] shrink-0 items-start text-left sticky top-10 self-start h-fit z-10">
                <div
                  className="relative min-w-full w-[min-content]"
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 600,
                    fontSize: 'clamp(60px, 10vw, 100px)',
                    lineHeight: '1.1',
                    letterSpacing: '-4px',
                    backgroundImage: `url('${imgOurServices}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    color: 'transparent'
                  }}
                >
                  <p className="mb-0 m-0">Our</p>
                  <p className="m-0">Services</p>
                </div>
                <p
                  className="m-0 w-[460px]"
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 400,
                    fontSize: '20px',
                    lineHeight: '28px',
                    color: 'rgba(255,255,255,0.8)'
                  }}
                >
                  We follow a systematic 6-step approach that has generated millions in additional revenue for e-commerce brands across the GCC.
                </p>
                <button
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-[#020601] h-[50px] rounded-[100px] px-[28px] py-[12px] border border-[#6ae499] relative overflow-hidden w-fit cursor-pointer hover:scale-105 transition-transform"
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 600,
                    fontSize: '18px',
                    lineHeight: '21.6px',
                    color: 'white',
                    boxShadow: 'inset 0px 0px 30px 0px rgba(106,228,153,0.6)'
                  }}
                >
                  Book a Free CRO Audit
                </button>
              </div>

              {/* Right Side - Service Cards */}
              <RevealServiceCards services={services} />
            </div>
          </div>
          
          <div id="case-studies">
            <AnimatedHeroSection />
          </div>
          <Component333 />
          <div className="content-visibility-auto">
            <ProcessWithAnimation />
          </div>
          <div className="content-visibility-auto">
            <Table />
          </div>
          <Suspense fallback={<div className="w-full min-h-[100px]" />}>
            <AnimatedCaseStudies />
          </Suspense>
          <div className="content-visibility-auto">
            <Frame2147223150 />
          </div>
          <div id="roi-calculator" className="content-visibility-auto">
            <Suspense fallback={<div className="w-full min-h-[100px]" />}>
              <ROICalculator />
            </Suspense>
          </div>
          <Suspense fallback={<div className="w-full min-h-[100px]" />}>
            <div className="content-visibility-auto">
              <PartnersAndTools />
            </div>
          </Suspense>
          <div className="relative w-full h-auto content-visibility-auto" id="contact">
            <StrategySession />
          </div>
          <div id="team" className="content-visibility-auto">
            <Suspense fallback={<div className="w-full min-h-[100px]" />}>
              <MeetTheTeam />
            </Suspense>
          </div>
          <Suspense fallback={<div className="w-full min-h-[100px]" />}>
            <div className="content-visibility-auto">
              <FAQSection />
            </div>
          </Suspense>
          <Suspense fallback={<div className="w-full min-h-[100px]" />}>
            <div className="content-visibility-auto">
              <GallerySection />
            </div>
          </Suspense>
          <Footer />
        </div>
      </div>
      <ScrollToTopButton />
      <Toaster />
    </QueryClientProvider>
  );
}
