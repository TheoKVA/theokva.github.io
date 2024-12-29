const loadingDIV = document.getElementById('loading-overlay');
const loadingOutput = document.getElementById('loading-output');

export function showLoading() {
    const loadingOverlay = loadingDIV;
    loadingOverlay.style.display = 'flex';
    loadingLog('Loading...');
}

export function hideLoading() {
    const loadingOverlay = loadingDIV;
    loadingOverlay.style.display = 'none';
}

export function loadingLog(text) {
    loadingOutput.innerHTML = text;
}