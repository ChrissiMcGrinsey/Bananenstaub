const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sourceDir = './sourceImages';
const destinationDir = './resizedImages';
const MAX_SIZE = 5120 * 1024; // 5120 KB in Bytes

const resolutions = [
        { width: 1200, height: 630, prefix: 'facebook' },
        { width: 1200, height: 1200, prefix: 'instagram' },
        { width: 1200, height: 675, prefix: 'twitter'},
        { width: 468, height: 60, prefix: 'banner'},
        { width: 728, height: 90, prefix: 'leaderboard'},
        { width: 300, height: 250, prefix: 'mediumRectangle'},
        { width: 300, height: 600, prefix: 'halfPage'},
        { width: 320, height: 50, prefix: 'mobileLeaderboard'},
        { width: 320, height: 100, prefix: 'largeMobileBanner'},
        { width: 320, height: 320, prefix: 'mobileSquare'},
        { width: 320, height: 480, prefix: 'smartphone'},
        { width: 480, height: 320, prefix: 'smartphone'},
        { width: 160, height: 600, prefix: 'wideSkyscraper'},
        { width: 120, height: 600, prefix: 'skyscraper'},
        { width: 1080, height: 1920, prefix: 'story'},
        { width: 1920, height: 1080, prefix: 'landscape'},
        { width: 1080, height: 1080, prefix: 'square'},
    ]

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
if(files.length > 0){
files.forEach(file => {
    const filePath = path.join(sourceDir, file);

    if (['.jpg', '.png'].includes(path.extname(file))) {
 
        for(let resolution of resolutions) {
            const fileName = `${resolution.prefix}-${path.basename(file, path.extname(file))}_${resolution.width}x${resolution.height}.webp`;
            const outputPath = path.join(destinationDir, fileName);
            resizeImageWithMaxSize(filePath,
                outputPath,
                resolution.width, 
                resolution.height).catch(err => {
                console.error(`Fehler beim Bearbeiten von ${file} für ${resolution.prefix}:`, err);
                });
        }
    }
});
} else {
    console.log('Keine Bilder gefunden.');
}

console.log('Bilder wurden verarbeitet und im Ordner resizedImages gespeichert.');
