// Authentication Guard for Protected Pages
class AuthGuard {
    constructor() {
        this.authService = window.authService;
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem('paperscope_token');
        const user = localStorage.getItem('paperscope_user');
        return !!(token && user);
    }

    // Protect current page - redirect to login if not authenticated
    protectPage() {
        if (!this.isAuthenticated()) {
            // Store the intended destination
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
            // Redirect to login
            window.location.href = '/login.html';
            return false;
        }
        return true;
    }

    // Handle protected navigation
    navigateToProtectedPage(url) {
        if (this.isAuthenticated()) {
            // User is authenticated, navigate to the page
            window.location.href = url;
        } else {
            // User is not authenticated, store intended destination and redirect to signup
            sessionStorage.setItem('redirectAfterLogin', url);
            window.location.href = '/signup.html';
        }
    }

    // Get redirect URL after successful login
    getRedirectUrl() {
        const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
        sessionStorage.removeItem('redirectAfterLogin');
        return redirectUrl || '/upload.html';
    }

    // Clear redirect URL
    clearRedirectUrl() {
        sessionStorage.removeItem('redirectAfterLogin');
    }
}

// Create global instance
window.authGuard = new AuthGuard();
