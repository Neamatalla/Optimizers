import fs from 'node:fs';

const mobileFile = 'C:/Users/Omar Maged/Desktop/OptimizersLandingPage/MeetTheTeam_extracted/src/imports/Component336.tsx';
const desktopFile = 'C:/Users/Omar Maged/Desktop/OptimizersLandingPage/src/imports/MeetTheTeam.tsx';

let mobileCode = fs.readFileSync(mobileFile, 'utf8');

// Remove original imports and export default
mobileCode = mobileCode.replace(/import svgPaths from ".\/svg-jj0ekm63mz";/g, '');
mobileCode = mobileCode.replace(/import img.+?;/g, '');
mobileCode = mobileCode.replace(/export default function Component\(\) \{[\s\S]*\}\s*$/, '');

// Rename components to avoid clashes with desktop
const components = ['Lights', 'BgElements', 'Text', 'Card', 'Safer'];
for (const comp of components) {
    for (let count = 0; count <= 4; count++) {
        const suf = count === 0 ? '' : count.toString();
        const regex = new RegExp(`\\b${comp}${suf}\\b`, 'g');
        mobileCode = mobileCode.replace(regex, `Mobile${comp}${suf}`);
    }
}

// Rename svg paths
mobileCode = mobileCode.replace(/svgPaths\.p/g, 'svgMobilePaths.p');

// Replace image variables based on mapping
// Mobile 2 -> Desktop imgRectangle2
// Mobile 3 -> Desktop imgRectangle3
// Mobile 4 -> Desktop imgRectangle4
// Mobile 5 (Alaa) -> Desktop imgLiftapp
// Mobile 6 (Mariam) -> Desktop imgRectangle5
mobileCode = mobileCode.replace(/imgRectangle5/g, 'imgLiftapp');
mobileCode = mobileCode.replace(/imgRectangle6/g, 'imgRectangle5');

// Now read desktop file
let desktopCode = fs.readFileSync(desktopFile, 'utf8');

// Insert the new svg import
desktopCode = desktopCode.replace(
    /import svgPaths from "\.\/svg-67sjau8p5h";/,
    'import svgPaths from "./svg-67sjau8p5h";\nimport svgMobilePaths from "./svg-mobile-meet";'
);

// Insert mobile code just before CANVAS_WIDTH
const insertionPoint = desktopCode.indexOf('const CANVAS_WIDTH = 1440;');
desktopCode = desktopCode.slice(0, insertionPoint) + mobileCode + '\n' + desktopCode.slice(insertionPoint);

// Replace the mobile block inside the return statement
const startReturn = desktopCode.indexOf('{/* Mobile: Clean 2-column grid */}');
const endReturn = desktopCode.indexOf('{/* Desktop: Scaled canvas */}');

const newMobileJSX = `{/* Mobile: Responsive Grid from Figma */}
            <div className="lg:hidden relative w-full h-[760px] max-w-[375px] mx-auto overflow-hidden">
                <p className="absolute top-[40px] left-1/2 -translate-x-1/2 w-[335px] text-center font-['Sora',sans-serif] font-semibold text-[46px] leading-[48px] tracking-[-1.84px] bg-clip-text text-transparent bg-gradient-to-b from-[rgba(255,255,255,0.6)] to-[rgba(20,23,19,0.5)] z-10">
                    Meet The Team
                </p>
                <MobileSafer />
                <MobileSafer1 />
                <MobileSafer2 />
                <MobileSafer3 />
                <MobileSafer4 />
            </div>

            `;

desktopCode = desktopCode.slice(0, startReturn) + newMobileJSX + desktopCode.slice(endReturn);

fs.writeFileSync(desktopFile, desktopCode);
console.log('Merge complete!');
