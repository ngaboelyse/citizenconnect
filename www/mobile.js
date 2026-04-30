// CitizenConnect - Mobile/Capacitor Initialization
// This runs on every page and handles native mobile features.

(function () {
    var isNative = window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();

    // --- Status Bar ---
    function initStatusBar() {
        if (!isNative) return;
        try {
            var StatusBar = window.Capacitor.Plugins.StatusBar;
            if (StatusBar) {
                StatusBar.setStyle({ style: 'DARK' });
                StatusBar.setBackgroundColor({ color: '#023469' });
            }
        } catch (e) { /* plugin not available */ }
    }

    // --- Haptic feedback on button taps ---
    function initHaptics() {
        if (!isNative) return;
        var HapticsPlugin = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics;
        if (!HapticsPlugin) return;

        document.addEventListener('touchstart', function (e) {
            var target = e.target.closest('button, .nav-item, .fab, .report-btn, .activity-card');
            if (target) {
                try { HapticsPlugin.impact({ style: 'LIGHT' }); } catch (err) { /* ignore */ }
            }
        }, { passive: true });
    }

    // --- Prevent pull-to-refresh overscroll on Android ---
    function preventOverscroll() {
        document.body.style.overscrollBehavior = 'none';
    }

    // --- Back button handler (Android) ---
    function initBackButton() {
        if (!isNative) return;
        var App = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
        if (!App) return;

        App.addListener('backButton', function (data) {
            // If we're on login.html, exit the app
            if (window.location.pathname.indexOf('login') !== -1) {
                App.exitApp();
            } else {
                // Otherwise go back
                window.history.back();
            }
        });
    }

    // --- Keyboard adjustments ---
    function initKeyboard() {
        if (!isNative) return;
        var Keyboard = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Keyboard;
        if (!Keyboard) return;

        Keyboard.addListener('keyboardWillShow', function (info) {
            document.body.style.marginBottom = info.keyboardHeight + 'px';
        });

        Keyboard.addListener('keyboardWillHide', function () {
            document.body.style.marginBottom = '';
        });
    }

    // --- Run on DOM ready ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        preventOverscroll();
        if (isNative) {
            initStatusBar();
            initHaptics();
            initBackButton();
            initKeyboard();
        }
    }
})();
