// Register the service worker
if ('serviceWorker' in navigator) {
    // Wait for the 'load' event to not block other work
    window.addEventListener('load', async () => {
        // Try to register the service worker.
        navigator.serviceWorker.register('serviceworker.js').then(value => {
            console.log('[😎] Service worker registered!', value);
        }, reason => {
            console.log('[😥] Service worker registration failed: ', reason);
        });
    });
}

/**
 * Check if the we are inside the installed application.
 * @returns {boolean|boolean} `true` if inside installed PWA, `false` otherwise.
 */
function insideInstalledApp() {
    return window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
}

/**
 * Force screen size to a specific width and height. Adds an event listener
 * on the window for resize events, and will re-set the size accordingly.
 * @param width The width to force the window
 * @param height The height to force the window
 */
function forceScreenSize(width, height) {
    if (insideInstalledApp()) {
        // Size window after open the app
        window.resizeTo(width, height)

        window.addEventListener('resize', () => {
            window.resizeTo(width, height)
        })
    }
}

// Force Screen Size for the PWA to my liking.
forceScreenSize(1200, 510);