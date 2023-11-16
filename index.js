const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sourceDir = './sourceImages';
const destinationDir = './resizedImages';
const MAX_SIZE = 5120 * 1024; // 5120 KB in Bytes

if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir);
}

const files = fs.readdirSync(sourceDir);

const resizeImageWithMaxSize = (inputPath, outputPath, width, height) => {
    let currentQuality = 90; // Startwert

    const resizeAndCheck = () => {
        return sharp(inputPath)
            .resize(width, height, { fit: 'cover', position: 'center' })
            .sharpen()
            .webp({ quality: currentQuality })
            .toBuffer()
            .then(buffer => {
                if (buffer.length > MAX_SIZE && currentQuality > 10) {
                    currentQuality -= 5; // Qualität um 5% verringern
                    return resizeAndCheck(); // Rekursiv erneut versuchen
                }
                return fs.promises.writeFile(outputPath, buffer);
            });
    };

    return resizeAndCheck();
};

files.forEach(file => {
    const filePath = path.join(sourceDir, file);
    const outputPathLandscape = path.join(destinationDir, 'landscape_' + path.basename(file, path.extname(file)) + '.webp');
    const outputPathSquare = path.join(destinationDir, 'square_' + path.basename(file, path.extname(file)) + '.webp');

    if (['.jpg', '.png'].includes(path.extname(file))) {
        resizeImageWithMaxSize(filePath, outputPathLandscape, 1200, 628).catch(err => {
            console.error(`Fehler beim Bearbeiten von ${file} für Landscape:`, err);
        });

        resizeImageWithMaxSize(filePath, outputPathSquare, 1200, 1200).catch(err => {
            console.error(`Fehler beim Bearbeiten von ${file} für Square:`, err);
        });
    }
});

console.log('Bilder wurden verarbeitet und im Ordner resizedImages gespeichert.');
