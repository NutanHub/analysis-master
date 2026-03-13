// Application Initialization
class App {
    constructor() {
        this.initializeApp();
    }

    initializeApp() {
        // Load all required scripts
        this.loadScript('models/ApiService.js');
        this.loadScript('controllers/AuthController.js');
        this.loadScript('controllers/PaperController.js');
        this.loadScript('controllers/AIController.js');
        this.loadScript('components/Navbar.js');
        this.loadScript('components/Footer.js');
        this.loadScript('utils/helpers.js');
        
        // Initialize OAuth callback handling
        document.addEventListener('DOMContentLoaded', () => {
            this.handleOAuthCallback();
            this.injectComponents();
        });
    }

    loadScript(src) {
        const script = document.createElement('script');
        script.src = `/${src}`;
        script.async = false;
        document.head.appendChild(script);
    }

    handleOAuthCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const provider = this.getProviderFromURL();

        if (code && provider) {
            window.authController.handleOAuthCallback(provider, code)
                .then(tokenData => {
                    // Remove OAuth params from URL
                    const url = new URL(window.location);
                    url.searchParams.delete('code');
                    url.searchParams.delete('state');
                    window.history.replaceState({}, document.title, url);

                    // Redirect to intended page
                    const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/views/upload.html';
                    sessionStorage.removeItem('redirectAfterLogin');
                    utils.showToast(`Welcome ${tokenData.user.name}!`, 'success');
                    setTimeout(() => {
                        window.location.href = redirectUrl;
                    }, 1500);
                })
                .catch(error => {
                    console.error('OAuth callback error:', error);
                    utils.showToast('Authentication failed. Please try again.', 'error');
                    window.location.href = '/views/login.html';
                });
        }
    }

    getProviderFromURL() {
        const path = window.location.pathname;
        if (path.includes('github')) return 'github';
        if (path.includes('google')) return 'google';
        return null;
    }

    injectComponents() {
        // Inject navbar and footer if containers exist
        if (window.navbarComponent) {
            window.navbarComponent.inject();
        }
        if (window.footerComponent) {
            window.footerComponent.inject();
        }
    }
}

// Initialize app
new App();
