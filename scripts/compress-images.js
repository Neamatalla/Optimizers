import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.resolve(__dirname, '../src/assets');
const quality = 80; // Default quality

async function compressImages() {
    if (!fs.existsSync(assetsDir)) {
        console.error(`Assets directory not found: ${assetsDir}`);
        return;
    }

    const files = fs.readdirSync(assetsDir);

    for (const file of files) {
        const filePath = path.join(assetsDir, file);
        const ext = path.extname(file).toLowerCase();

        if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
            console.log(`Processing ${file}...`);

            const tempPath = path.join(assetsDir, `temp_${file}`);

            try {
                let pipeline = sharp(filePath);

                if (ext === '.jpg' || ext === '.jpeg') {
                    pipeline = pipeline.jpeg({ quality, mozjpeg: true });
                } else if (ext === '.png') {
                    pipeline = pipeline.png({ quality, compressionLevel: 9, adaptiveFiltering: true });
                } else if (ext === '.webp') {
                    pipeline = pipeline.webp({ quality });
                }

                await pipeline.toFile(tempPath);

                const originalStats = fs.statSync(filePath);
                const newStats = fs.statSync(tempPath);

                if (newStats.size < originalStats.size) {
                    fs.renameSync(tempPath, filePath);
                    const savings = ((originalStats.size - newStats.size) / 1024).toFixed(2);
                    console.log(`✅ Compressed ${file}: Saved ${savings} KB`);
                } else {
                    fs.unlinkSync(tempPath);
                    console.log(`⏭️ Skipped ${file}: No size reduction`);
                }
            } catch (err) {
                console.error(`❌ Error processing ${file}:`, err);
                if (fs.existsSync(tempPath)) {
                    fs.unlinkSync(tempPath);
                }
            }
        }
    }
    console.log('🎉 Compression complete!');
}

compressImages();
