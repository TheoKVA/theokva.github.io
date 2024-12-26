// ==========
// FILE INPUT
// ==========

// IMPORTS
import { showLoading } from './loading.js';
import { scanner } from './externalLib.js'
import { showParameters } from '../main.js'

// HTML
const fileInputDIV = document.getElementById('js-fileInput');



export function handleAddBtn() {
    console.log('handleAddBtn()');
    fileInputDIV.value = '';
    fileInputDIV.click();
};

export function handleFileDragover(e) {
    e.preventDefault(); // Prevent default behavior (e.g., open file in browser)
    e.dataTransfer.dropEffect = 'copy'; // Indicate that a copy is expected
};

export function handleFileDrop(e) {
    e.preventDefault(); // Prevent default behavior
    const files = e.dataTransfer.files;

    // Check if there are any image files
    for (const file of files) {
        if (file.type.startsWith('image/')) {
            console.log('Image file dropped.');

            // Create a FileList-like object and trigger the file input's change event
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);

            // Update the file input's files property
            fileInputDIV.files = dataTransfer.files;

            // Trigger the change event manually
            fileInputDIV.dispatchEvent(new Event('change'));
            break;
        }
    }
};

// when click on fileinput
export async function handleFileInput(e) {
    const files = e.target.files;
    console.log('handleFileInput()', files);
    
    for (const file of files) {
        showLoading();
        console.log('Processing file:', file.name);

        const reader = new FileReader();
        reader.onload = async (e) => {

            let imgSrc = e.target.result;

            // If the file is HEIC, convert it
            if (file.type === 'image/heic' || file.type === 'image/heif') {
                console.log('HEIC image conversion..');
                try {
                    const heicToJpg = await heic2any({ blob: file, toType: 'image/jpeg' });
                    imgSrc = URL.createObjectURL(heicToJpg);
                    console.log('HEIC image converted to JPEG:');
                } catch (error) {
                    console.error('Error converting HEIC to JPEG:', error);
                }
            }

            const img = new Image();
            img.src = imgSrc;
            img.onload = () => {
                console.log('Image loaded for processing:');

                // Convert image to OpenCV mat
                const mat = cv.imread(img);
                // console.log('Converted image to cv.Mat.');

                // Find the paper contour
                const contour = scanner.findPaperContour(mat);
                // console.log('Paper contour detected:', contour);

                // Get corner points from the contour
                const cornerPoints = scanner.getCornerPoints(contour);
                console.log('Corner points detected:', cornerPoints);

                // Call showParameters to fine tune the corners
                showParameters(-1, imgSrc, cornerPoints);
            };
        };

        reader.readAsDataURL(file);
    }
};