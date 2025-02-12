function openTool(config) {
    console.log(config);
    const windowSize = `width=${config.width},height=${config.height},`;
    const windowFeatures = windowSize + 'scrollbars=no,resizable=no,location=no,toolbar=no,menubar=no,status=no,titlebar=no';
    console.log(windowFeatures);
    const handle = window.open(
        config.url,
        'toolWindow',
        windowFeatures,
    );
    if (!handle) {
        alert('nope');
    }
}  