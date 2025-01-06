// HTML
const loadingOverlay = document.getElementById('loading-overlay');
const loadingOutput = document.getElementById('loading-output');

// - - - - - - - - - - - - - - -

export function showLoadingOverlay() {
    loadingOverlay.classList.remove('hidden');
    document.body.classList.add('no-scroll');
    loadingLog('Loading...');
}

export function hideLoadingOverlay() {
    loadingOverlay.classList.add('hidden');
    document.body.classList.remove('no-scroll');
}

export function loadingLog(text) {
    loadingOutput.innerHTML = text;
}