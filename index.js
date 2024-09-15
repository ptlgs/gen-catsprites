const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

async function combineImages(inputFolder, outputFile, numColumns = 2, imageSize = 100) {
    try {
        // Read all PNG files in the input folder
        const files = await fs.readdir(inputFolder);
        const imageFiles = files
            .filter(file => file.endsWith('.png'))
            .sort((a, b) => {
                const numA = parseInt(path.parse(a).name);
                const numB = parseInt(path.parse(b).name);
                return numA - numB;
            });

        // Calculate the size of the output image
        const numImages = imageFiles.length;
        const numRows = Math.ceil(numImages / numColumns);
        const outputWidth = numColumns * imageSize;
        const outputHeight = numRows * imageSize;

        // Create a blank canvas
        const canvas = sharp({
            create: {
                width: outputWidth,
                height: outputHeight,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            }
        });

        // Process each image and create an array of image objects
        const compositeArray = await Promise.all(imageFiles.map(async (file, index) => {
            const img = await sharp(path.join(inputFolder, file))
                .resize(imageSize, imageSize, { fit: 'cover' })
                .toBuffer();

            const row = Math.floor(index / numColumns);
            const col = index % numColumns;

            return {
                input: img,
                top: row * imageSize,
                left: col * imageSize
            };
        }));

        // Composite all images onto the canvas
        const result = await canvas.composite(compositeArray).toFile(outputFile);
        console.log(`Combined image saved as ${outputFile}`);
        return result;
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// Usage
const inputFolder = './images'; // Current directory
const outputFile = 'catsprites.png';
combineImages(inputFolder, outputFile);
