import { motion } from 'motion/react';
import img6687D1Be6301F78Fecf93Bc763Bd507De1Ccf48089402Fa4UOYhhM4ZWeg3AkxNwMMdc44TbzMuFvnANywZtcyIzg from "../assets/5c2837e232462b4d4fbcb5d03a7b4d3d04ae2294.webp";
import imgB9B3C47F590C9Afc97BcB866Bad86A72 from "../assets/45fdc402ef0fb2fb47ced0eabff3aed75e3aa444.webp";
import imgImages1 from "../assets/6e44e207c6307c14576d2461f4b45a5b34636399.webp";
import imgGtmLogo from "../assets/26004c4ca0aa9217e8b10d13d1a00858a5377a40.webp";
import imgWoocommerceLogo1 from "../assets/fee97dace625b60b3ce9e2c4d99e573dd08b546b.webp";
import imgGoogleAnalyticsLogo1 from "../assets/f25f918cb55d279ab2ebd206088482f5d51252f4.webp";
import img3583589718ShopifyLogoWhiteTransparent from "../assets/b87711c4af26e07d30baf9f568caa5f7620b97a4.webp";
import imgHotjarIcon from "../assets/539bc2eb95b4f05acea0b086987528846d075244.webp";
import imgMicrosoftClarityIcon from "../assets/7812f405b5a3033730572bd6dae6c5acebab4ea4.webp";
import imgOurPartnersTools from "../assets/e527242af51a4a3d5a76a9787b060a26b6da4a95.webp";

// Define all icons with their fixed positions and properties
const icons = [
    {
        id: 0,
        position: { left: '90%', top: 'calc(50% + 11.6vh)' },
        borderColor: 'rgba(255, 208, 76, 0.2)',
        shadowColor: 'rgba(255, 208, 76, 0.2)',
        insetShadowColor: 'rgba(255, 208, 76, 0.17)',
        glowColor: 'rgba(31, 170, 84, 0.04)',
        image: img6687D1Be6301F78Fecf93Bc763Bd507De1Ccf48089402Fa4UOYhhM4ZWeg3AkxNwMMdc44TbzMuFvnANywZtcyIzg,
        imageStyle: { width: '187.5%', height: '100.2%', left: '0', top: '-0.1%' },
        wrapperSize: { width: '4.7vw', height: '4.7vw' }
    },
    {
        id: 1,
        position: { left: '80%', top: 'calc(50% + 8.6vh)' },
        borderColor: 'rgba(27, 106, 114, 0.4)',
        shadowColor: 'rgba(27, 106, 114, 0.4)',
        insetShadowColor: 'rgba(27, 106, 114, 0.3)',
        glowColor: 'rgba(31, 170, 84, 0.04)',
        image: imgB9B3C47F590C9Afc97BcB866Bad86A72,
        imageStyle: { width: '233.11%', height: '151.69%', left: '-114.9%', top: '-26.4%' },
        wrapperSize: { width: '5.4vw', height: '4.7vw' }
    },
    {
        id: 2,
        position: { left: '70%', top: 'calc(50% + 14.1vh)' },
        borderColor: 'rgba(166, 190, 234, 0.3)',
        shadowColor: 'rgba(197, 210, 233, 0.2)',
        insetShadowColor: 'rgba(197, 210, 233, 0.2)',
        glowColor: 'rgba(31, 170, 84, 0.04)',
        image: imgImages1,
        imageStyle: { width: '177.17%', height: '137.2%', left: '-38.58%', top: '-18.9%' },
        wrapperSize: { width: '3.6vw', height: '4.7vw' }
    },
    {
        id: 3,
        position: { left: '60%', top: 'calc(50% + 12.4vh)' },
        borderColor: 'rgba(66, 133, 244, 0.3)',
        shadowColor: 'rgba(66, 133, 244, 0.25)',
        insetShadowColor: 'rgba(66, 133, 244, 0.25)',
        glowColor: 'rgba(31, 170, 84, 0.04)',
        image: imgGtmLogo,
        imageStyle: { width: '233.58%', height: '131.23%', left: '-72.75%', top: '0' },
        wrapperSize: { width: '4.7vw', height: '4.7vw' }
    },
    {
        id: 4,
        position: { left: '50%', top: 'calc(50% + 10.7vh)' },
        borderColor: 'rgba(155, 92, 143, 0.3)',
        shadowColor: 'rgba(155, 92, 143, 0.3)',
        insetShadowColor: 'rgba(155, 92, 143, 0.3)',
        glowColor: 'rgba(31, 170, 84, 0.04)',
        image: imgWoocommerceLogo1,
        imageStyle: { width: '293.33%', height: '99.69%', left: '0', top: '0' },
        wrapperSize: { width: '6.3vw', height: '3.8vw' }
    },
    {
        id: 5,
        position: { left: '40%', top: 'calc(50% + 15.6vh)' },
        borderColor: 'rgba(227, 116, 0, 0.23)',
        shadowColor: 'rgba(227, 116, 0, 0.23)',
        insetShadowColor: 'rgba(227, 116, 0, 0.2)',
        glowColor: 'rgba(31, 170, 84, 0.04)',
        image: imgGoogleAnalyticsLogo1,
        imageStyle: { width: '196.72%', height: '100%', left: '-49.18%', top: '0' },
        wrapperSize: { width: '4.3vw', height: '4.7vw' }
    },
    {
        id: 6,
        position: { left: '30%', top: 'calc(50% + 15.4vh)' },
        borderColor: 'rgba(149, 190, 70, 0.23)',
        shadowColor: 'rgba(149, 190, 70, 0.2)',
        insetShadowColor: 'rgba(149, 190, 70, 0.2)',
        glowColor: 'rgba(31, 170, 84, 0.04)',
        image: img3583589718ShopifyLogoWhiteTransparent,
        imageStyle: { width: '398.41%', height: '100%', left: '0', top: '0' },
        wrapperSize: { width: '4.1vw', height: '4.7vw' }
    },
    {
        id: 7,
        position: { left: '20%', top: 'calc(50% + 8.8vh)' },
        borderColor: 'rgba(255, 50, 0, 0.2)',
        shadowColor: 'rgba(255, 50, 0, 0.19)',
        insetShadowColor: 'rgba(255, 50, 0, 0.2)',
        glowColor: 'rgba(31, 170, 84, 0.04)',
        image: imgHotjarIcon,
        imageStyle: { width: '100%', height: '100%', objectFit: 'cover' as const, objectPosition: '50% 50%' },
        wrapperSize: { width: '4.7vw', height: '4.7vw' }
    },
    {
        id: 8,
        position: { left: '10%', top: 'calc(50% + 12.2vh)' },
        borderColor: 'rgba(35, 109, 201, 0.25)',
        shadowColor: 'rgba(35, 109, 201, 0.26)',
        insetShadowColor: 'rgba(35, 109, 201, 0.25)',
        glowColor: 'rgba(31, 170, 84, 0.04)',
        image: imgMicrosoftClarityIcon,
        imageStyle: { width: '100%', height: '100%', objectFit: 'cover' as const, objectPosition: '50% 50%' },
        wrapperSize: { width: '4.7vw', height: '4.7vw' }
    },
];

type AnimatedIconProps = {
    icon: typeof icons[0];
    index: number;
};

function AnimatedIcon({ icon, index }: AnimatedIconProps) {
    // Stagger the animation delay for each icon
    const delay = index * 0.15;

    return (
        <div
            className="absolute -translate-x-1/2"
            style={{
                left: icon.position.left,
                top: icon.position.top,
                zIndex: 10
            }}
        >
            <motion.div
                className="border border-solid backdrop-blur-[0.71vw] rounded-[10vw] w-[8.35vw] aspect-square"
                initial={{
                    y: 0,
                    scale: 1,
                }}
                animate={{
                    y: ['0vw', '-4.16vw', '0vw', '-2.43vw', '0vw'],
                    scale: [1, 1.18, 1, 1.1, 1],
                }}
                transition={{
                    duration: 9,
                    delay: delay,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "loop",
                }}
                style={{
                    background: `url('data:image/svg+xml;utf8,<svg viewBox="0 0 135.81 135.81" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><rect x="0" y="0" height="100%" width="100%" fill="url(%23grad${icon.id})" opacity="1"/><defs><radialGradient id="grad${icon.id}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="10" gradientTransform="matrix(9.7595 0 0 6.7906 67.906 0)"><stop stop-color="${icon.glowColor}" offset="0"/><stop stop-color="rgba(31,170,84,0)" offset="1"/></radialGradient></defs></svg>'), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.1) 100%)`,
                }}
            >
                <div className="absolute inset-0 pointer-events-none rounded-[inherit]"
                    style={{ boxShadow: `inset 0px ${0.69}vw ${0.97}vw 0px ${icon.insetShadowColor}` }} />
                <div aria-hidden="true"
                    className="absolute inset-0 pointer-events-none rounded-[10vw] border border-solid"
                    style={{
                        borderColor: icon.borderColor,
                        boxShadow: `0px 0px ${2.01}vw ${0.97}vw ${icon.shadowColor}`
                    }} />
                <div
                    className="flex flex-col items-center justify-center w-full h-full p-[2.2vw] overflow-hidden rounded-[inherit] relative z-10"
                >
                    <div className="relative overflow-hidden shrink-0" style={icon.wrapperSize}>
                        <img
                            src={icon.image}
                            alt=""
                            style={{
                                ...icon.imageStyle,
                                position: 'absolute'
                            }}
                            className="max-w-none pointer-events-none"
                            decoding="async"
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function PartnersAndTools() {
    return (
        <div className="relative w-full h-auto lg:h-screen min-h-[300px] lg:min-h-[600px] bg-[#020601] overflow-hidden py-10 lg:py-0 flex flex-col items-center">
            {/* Content Section — on mobile, show first (default flow order) */}
            <div className="relative lg:absolute left-auto lg:left-1/2 top-auto lg:top-[11.1vh] translate-x-0 lg:-translate-x-1/2 w-full max-w-[90%] lg:max-w-[79.4vw] mx-auto px-4 flex flex-col gap-4 lg:gap-6 items-center text-center z-20 order-1">
                <h1
                    className="font-['Sora',sans-serif] font-semibold text-[28px] lg:text-[4.1vw] leading-[1.2] lg:leading-[4.8vw] tracking-[-0.16vw] bg-cover bg-center bg-no-repeat bg-clip-text text-transparent w-full"
                    style={{ backgroundImage: `url('${imgOurPartnersTools}')` }}
                >
                    Our Partners & Tools
                </h1>
                <p className="font-['Sora',sans-serif] font-normal text-[14px] lg:text-[1.4vw] leading-[1.5] lg:leading-[1.9vw] text-[rgba(255,255,255,0.8)] w-full max-w-[90%] lg:max-w-[53vw]">
                    We work with the most trusted tools and platforms in the GCC and globally to ensure accurate tracking, effective testing, and scalable growth.
                </p>
            </div>

            {/* Mobile: Animated icon grid — float + staggered entrance */}
            <div className="flex lg:hidden flex-wrap justify-center gap-3 mt-6 px-6 order-2">
                {icons.map((icon, index) => (
                    <div
                        key={icon.id}
                        className={`w-[64px] h-[64px] rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center overflow-hidden float-bob float-bob-${index}`}
                    >
                        <div className="relative w-[32px] h-[32px] overflow-hidden">
                            <img
                                src={icon.image}
                                alt=""
                                className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
                                decoding="async"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Animated Icon Circles - Desktop only */}
            <div className="hidden lg:block">
                {icons.map((icon, index) => (
                    <AnimatedIcon
                        key={icon.id}
                        icon={icon}
                        index={index}
                    />
                ))}
            </div>
        </div>
    );
}
