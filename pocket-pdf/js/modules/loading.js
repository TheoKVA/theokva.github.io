const loadingDIVelem = document.getElementById('loading-overlay');

export function showLoading() {
    const loadingOverlay = loadingDIVelem;
    loadingOverlay.style.display = 'flex';
}

export function hideLoading() {
    const loadingOverlay = loadingDIVelem;
    loadingOverlay.style.display = 'none';
}