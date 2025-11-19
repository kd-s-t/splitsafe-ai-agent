#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Image optimization script for better performance
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const OPTIMIZED_DIR = path.join(PUBLIC_DIR, 'optimized');

// Supported image formats
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];

// Image optimization settings
const OPTIMIZATION_SETTINGS = {
    jpg: {
        quality: 85,
        progressive: true,
        mozjpeg: true
    },
    png: {
        quality: 90,
        compressionLevel: 9
    },
    webp: {
        quality: 85,
        lossless: false
    }
};

function ensureOptimizedDir() {
    if (!fs.existsSync(OPTIMIZED_DIR)) {
        fs.mkdirSync(OPTIMIZED_DIR, { recursive: true });
    }
}

function getImageFiles(dir) {
    const files = [];

    function traverse(currentDir) {
        const items = fs.readdirSync(currentDir);

        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                traverse(fullPath);
            } else if (stat.isFile()) {
                const ext = path.extname(item).toLowerCase();
                if (SUPPORTED_FORMATS.includes(ext)) {
                    files.push(fullPath);
                }
            }
        }
    }

    traverse(dir);
    return files;
}

function optimizeImage(inputPath, outputPath) {
    const ext = path.extname(inputPath).toLowerCase();
    const relativePath = path.relative(PUBLIC_DIR, inputPath);

    console.log(`Optimizing: ${relativePath}`);

    try {
        // Create output directory if it doesn't exist
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Use sharp for optimization (if available) or fallback to basic copy
        try {
            const sharp = require('sharp');

            let pipeline = sharp(inputPath);

            switch (ext) {
                case '.jpg':
                case '.jpeg':
                    pipeline = pipeline.jpeg(OPTIMIZATION_SETTINGS.jpg);
                    break;
                case '.png':
                    pipeline = pipeline.png(OPTIMIZATION_SETTINGS.png);
                    break;
                case '.webp':
                    pipeline = pipeline.webp(OPTIMIZATION_SETTINGS.webp);
                    break;
                case '.svg':
                    // For SVG, just copy as is
                    fs.copyFileSync(inputPath, outputPath);
                    return;
            }

            pipeline.toFile(outputPath);

        } catch (sharpError) {
            console.warn(`Sharp not available, copying ${relativePath} as is`);
            fs.copyFileSync(inputPath, outputPath);
        }

    } catch (error) {
        console.error(`Error optimizing ${relativePath}:`, error.message);
    }
}

function generateWebPImages(inputPath, outputPath) {
    const ext = path.extname(inputPath).toLowerCase();

    if (ext === '.svg') return; // Skip SVG files

    const webpPath = outputPath.replace(/\.[^.]+$/, '.webp');

    try {
        const sharp = require('sharp');
        sharp(inputPath)
            .webp(OPTIMIZATION_SETTINGS.webp)
            .toFile(webpPath);

        console.log(`Generated WebP: ${path.relative(PUBLIC_DIR, webpPath)}`);
    } catch (error) {
        console.warn(`Could not generate WebP for ${inputPath}:`, error.message);
    }
}

function generateResponsiveImages(inputPath, outputPath) {
    const ext = path.extname(inputPath).toLowerCase();

    if (ext === '.svg') return; // Skip SVG files

    const sizes = [320, 640, 768, 1024, 1280, 1920];
    const baseName = path.basename(outputPath, path.extname(outputPath));
    const outputDir = path.dirname(outputPath);

    try {
        const sharp = require('sharp');

        for (const size of sizes) {
            const responsivePath = path.join(outputDir, `${baseName}-${size}w${path.extname(outputPath)}`);

            sharp(inputPath)
                .resize(size, null, { withoutEnlargement: true })
                .toFile(responsivePath);

            console.log(`Generated responsive: ${path.relative(PUBLIC_DIR, responsivePath)}`);
        }
    } catch (error) {
        console.warn(`Could not generate responsive images for ${inputPath}:`, error.message);
    }
}

function main() {
    console.log('🚀 Starting image optimization...');

    ensureOptimizedDir();

    const imageFiles = getImageFiles(PUBLIC_DIR);
    console.log(`Found ${imageFiles.length} images to optimize`);

    let optimizedCount = 0;

    for (const imagePath of imageFiles) {
        const relativePath = path.relative(PUBLIC_DIR, imagePath);
        const outputPath = path.join(OPTIMIZED_DIR, relativePath);

        // Skip if already optimized and newer
        if (fs.existsSync(outputPath)) {
            const inputStat = fs.statSync(imagePath);
            const outputStat = fs.statSync(outputPath);

            if (outputStat.mtime > inputStat.mtime) {
                console.log(`Skipping (already optimized): ${relativePath}`);
                continue;
            }
        }

        optimizeImage(imagePath, outputPath);
        generateWebPImages(imagePath, outputPath);
        generateResponsiveImages(imagePath, outputPath);

        optimizedCount++;
    }

    console.log(`✅ Optimized ${optimizedCount} images`);
    console.log(`📁 Optimized images saved to: ${path.relative(process.cwd(), OPTIMIZED_DIR)}`);

    // Generate optimization report
    const report = {
        timestamp: new Date().toISOString(),
        totalImages: imageFiles.length,
        optimizedImages: optimizedCount,
        outputDirectory: OPTIMIZED_DIR
    };

    fs.writeFileSync(
        path.join(OPTIMIZED_DIR, 'optimization-report.json'),
        JSON.stringify(report, null, 2)
    );

    console.log('📊 Optimization report saved');
}

if (require.main === module) {
    main();
}

module.exports = { optimizeImage, generateWebPImages, generateResponsiveImages };
