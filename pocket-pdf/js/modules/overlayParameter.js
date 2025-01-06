// HTML
const parameterOverlay = document.getElementById('parameter-overlay');

// - - - - - - - - - - - - - - -

// SHOW UI
export function showParameterOverlay() {
    parameterOverlay.classList.remove('hidden');
    document.body.classList.add('no-scroll');
}
// HIDE UI
export function hideParameterOverlay() {
    parameterOverlay.classList.add('hidden');
    document.body.classList.remove('no-scroll');
}
