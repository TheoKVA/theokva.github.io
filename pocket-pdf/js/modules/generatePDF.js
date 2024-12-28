// ============
// GENERATE PDF
// ============

// IMPORTS
import { db, projectSettings } from './db.js'
import { showLoading, hideLoading } from './loading.js';
import { isIOS } from '../utils/helper.js';
import { scanner } from './externalLib.js'

// HTML
const downloadPdfButton = document.getElementById('btn-download-pdf');
const qualitySelect = document.getElementById('export-quality-select');
const compressionSelect = document.getElementById('export-compression-select');
const formatSelect = document.getElementById('export-format-select');

// Make download link
const downloadLink = document.createElement('a');
downloadLink.style = 'display: none'; // Invisible link
document.body.appendChild(downloadLink);
downloadPdfButton.addEventListener("click", function () {
    downloadLink.click(); // Trigger the download
});

// --------
//   MAIN
// --------

export async function generatePDF() {

    console.log('Generate PDF button clicked.');
    showLoading();

    const pdfDoc = await PDFLib.PDFDocument.create();
    console.log('PDF document created.');

    // POPULATE PDF

    // Sort db by pageIndex, skipping holes in the sequence
    const sortedPages = db
        .filter(item => item.pageIndex !== undefined && item.pageIndex >= 0) // Exclude invalid or missing pageIndex
        .sort((a, b) => a.pageIndex - b.pageIndex); // Sort by pageIndex

    for (const pageData of sortedPages) {
        // Extract original image
        const originalImg = new Image();
        originalImg.src = pageData.imageOriginal.source;

        // Wait for the image to load
        await new Promise((resolve) => (originalImg.onload = resolve)); 

        // Extract the size values
        const dpi = pageData.imageParameters?.format?.dpi || projectSettings.format?.dpi;
        const widthMM = pageData.imageParameters?.format?.widthMM || projectSettings.format.widthMM;
        const heightMM = pageData.imageParameters?.format?.heightMM || projectSettings.format.heightMM;
        let widthPx, heightPx;

        // Check if height or width is set to 'auto'
        if (heightMM === 'auto' || widthMM === 'auto') {
            // Calculate dimensions based on corner points
            const { topLeftCorner, topRightCorner, bottomLeftCorner, bottomRightCorner } = pageData.cornerPoints;

            // Calculate aspect ratio from the corners
            const topWidth = Math.sqrt(Math.pow(topRightCorner.x - topLeftCorner.x, 2) + Math.pow(topRightCorner.y - topLeftCorner.y, 2));
            const bottomWidth = Math.sqrt(Math.pow(bottomRightCorner.x - bottomLeftCorner.x, 2) + Math.pow(bottomRightCorner.y - bottomLeftCorner.y, 2));
            const leftHeight = Math.sqrt(Math.pow(bottomLeftCorner.x - topLeftCorner.x, 2) + Math.pow(bottomLeftCorner.y - topLeftCorner.y, 2));
            const rightHeight = Math.sqrt(Math.pow(bottomRightCorner.x - topRightCorner.x, 2) + Math.pow(bottomRightCorner.y - topRightCorner.y, 2));

            const widthCornerRatio = (topWidth + bottomWidth) / 2;
            const heightCornerRatio = (leftHeight + rightHeight) / 2;
            const aspectRatio = widthCornerRatio / heightCornerRatio;

            // If width is auto, derive it from the height
            if (widthMM === 'auto') {
                heightPx = Math.round((heightMM / 25.4) * dpi);
                widthPx = Math.round(heightPx * aspectRatio);
            }
            // If height is auto, derive it from the width
            else {
                widthPx = Math.round((widthMM / 25.4) * dpi);
                heightPx = Math.round(widthPx / aspectRatio);
            }
        } else {
            // Standard width and height calculation
            widthPx = Math.round((widthMM / 25.4) * dpi);
            heightPx = Math.round((heightMM / 25.4) * dpi);
        }

        // Use scanner to extract the paper with rotation taken into account
        const rotation = pageData.imageScaled?.rotation || 0;

        // Prepare canvas dimensions based on rotation
        let finalImageWidth = originalImg.width;
        let finalImageHeight = originalImg.height;

        // Change the aspect ratio if different than 0 or 180
        if (rotation % 180 !== 0) {
            finalImageWidth = originalImg.height;
            finalImageHeight = originalImg.width;
        }

        // Create a rotated canvas for extraction
        const rotatedCanvas = document.createElement('canvas');
        rotatedCanvas.width = finalImageWidth;
        rotatedCanvas.height = finalImageHeight;
        const rotatedCtx = rotatedCanvas.getContext('2d');

        // Apply rotation
        rotatedCtx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
        rotatedCtx.rotate((rotation * Math.PI) / 180);
        rotatedCtx.drawImage(originalImg, -originalImg.width / 2, -originalImg.height / 2);
        
        // Extract paper from the rotated canvas using scanner
        // const extractedCanvas = scanner.extractPaper(rotatedCanvas, widthPx, heightPx, pageData.cornerPoints);
        const extractedCanvas = scanner.extractPaper(rotatedCanvas, widthPx, heightPx, pageData.cornerPoints);

        // Load extracted image into OpenCV for color correction
        const src = cv.imread(extractedCanvas);
        const dst = new cv.Mat();
        src.copyTo(dst);

        // Apply levels adjustments
        applyLevelsToMat(src, dst, pageData.imageParameters.filter);

        // Prepare the canvas
        const finalCanvas = document.createElement('canvas');
        const ctx = finalCanvas.getContext('2d');
        finalCanvas.width = widthPx;
        finalCanvas.height = heightPx;

        // Draw adjusted image on finalCanvas
        cv.imshow(finalCanvas, dst);

        // Clean up OpenCV matrices
        src.delete();
        dst.delete();

        // Compress the final image for the PDF
        const compression = projectSettings.compression || 0.8;
        const imgBytes = await fetch(finalCanvas.toDataURL('image/jpeg', compression)).then(res => res.arrayBuffer());

        // Add the image to the PDF
        const pdfImage = await pdfDoc.embedJpg(imgBytes);
        const page = pdfDoc.addPage([widthPx, heightPx]);
        page.drawImage(pdfImage, {
            x: 0,
            y: 0,
            width: pdfImage.width,
            height: pdfImage.height,
        });

        // Log
        console.log('Image drawn on PDF page.');
    }

    // Save as raw bytes
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    // Prepare download
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'document.pdf';

    // Enable the download button
    downloadPdfButton.disabled = false;

    // Remove the loading element
    hideLoading();

    // iOS-specific handling
    if (isIOS()) {
        // Enable the Share button for supported devices
        if (navigator.share) {
            const file = new File([blob], "document.pdf", { type: 'application/pdf' });
            downloadPdfButton.addEventListener("click", async () => {
                try {
                    // Use the Share API
                    await navigator.share({
                        title: "My PDF document",
                        // text: "Here is the PDF document I generated.",
                        files: [file], // Share the PDF file
                    });
                    console.log("PDF shared successfully!");
                } catch (error) {
                    console.error("Error sharing PDF:", error);
                }
            });
        } 
        else {
            // ok
        }
    } else {
        // Handling for other platforms
        const blobUrl = URL.createObjectURL(blob);

        // Try to open in a new tab (optional fallback)
        const pdfWindow = window.open(blobUrl);
        if (!pdfWindow) {
            console.warn('Popup blocked. Download link enabled instead.');
        }
    }

};


// --------
// SETTINGS
// --------

// Event listener for quality (dpi)
qualitySelect.addEventListener('change', (event) => {
    const newDpi = parseInt(event.target.value, 10);
    projectSettings.format.dpi = newDpi;
    console.log(`Project settings updated: DPI set to ${newDpi}`);
});

// Event listener for compression
compressionSelect.addEventListener('change', (event) => {
    const newCompression = parseFloat(event.target.value);
    projectSettings.compression = newCompression;
    console.log(`Project settings updated: Compression set to ${newCompression}`);
});

// Event listener for format
formatSelect.addEventListener('change', (event) => {
    const selectedOption = event.target.selectedOptions[0]; // Get selected option
    const newFormat = event.target.value;
    const newWidth = parseInt(selectedOption.dataset.width, 10);
    const newHeight = selectedOption.dataset.height === 'auto' ? 'auto' : parseInt(selectedOption.dataset.height, 10);

    projectSettings.format.name = newFormat;
    projectSettings.format.widthMM = newWidth;
    projectSettings.format.heightMM = newHeight;

    console.log(`Project settings updated: Format set to ${newFormat} (${newWidth} x ${newHeight})`);
});


// --------
//  HELPER
// --------
function applyLevelsToMat(src, dst, filter) {
    console.log('Applying levels adjustment with filter:', filter);

    const { black, white, middle, grayscale } = filter;

    if (grayscale) {
        // Convert src to grayscale in-place
        const graySrc = new cv.Mat();
        cv.cvtColor(src, graySrc, cv.COLOR_RGBA2GRAY, 0); // Convert to grayscale
        cv.cvtColor(graySrc, src, cv.COLOR_GRAY2RGBA, 0); // Convert back to RGBA
        graySrc.delete();
    }

    // Create the LUT
    const lut = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
        let value = (i - black) / (white - black); // Scale to 0-1
        value = Math.max(0, Math.min(1, value)); // Clamp between 0 and 1
        value = Math.pow(value, middle); // Apply mid-tone adjustment
        lut[i] = Math.round(value * 255); // Scale back to 0-255
    }

    // Apply the LUT to each pixel
    const srcData = src.data;
    const dstData = dst.data;
    for (let i = 0; i < srcData.length; i++) {
        dstData[i] = lut[srcData[i]];
    }
}