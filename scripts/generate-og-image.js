/**
 * Generate an OG image: favicon centered on a black background (1200x630)
 * Uses sharp (already in devDependencies)
 */
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const FAVICON_SIZE = 200; // resize favicon to 200x200 centered

async function main() {
  const faviconPath = path.join(root, 'public', 'favicon.png');
  const outputPath = path.join(root, 'public', 'og-image.png');

  // Resize the favicon to a nice size
  const resizedFavicon = await sharp(faviconPath)
    .resize(FAVICON_SIZE, FAVICON_SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Create a 1200x630 black canvas and composite the favicon centered
  await sharp({
    create: {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      channels: 3,
      background: { r: 2, g: 6, b: 1 } // matches #020601 site bg
    }
  })
    .composite([
      {
        input: resizedFavicon,
        left: Math.round((OG_WIDTH - FAVICON_SIZE) / 2),
        top: Math.round((OG_HEIGHT - FAVICON_SIZE) / 2)
      }
    ])
    .png()
    .toFile(outputPath);

  console.log(`✅ OG image created: ${outputPath}`);
}

main().catch(err => {
  console.error('Failed to generate OG image:', err);
  process.exit(1);
});
