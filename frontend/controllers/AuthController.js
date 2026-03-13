// Authentication Controller
class AuthController {
    constructor(apiService) {
        this.api = apiService;
    }

    // Signup user
    async signup(userData) {
        try {
            const data = await this.api.request('/auth/signup', {
                method: 'POST',
                body: JSON.stringify(userData)
            });

            this.api.setAuth(data);
            return data;
        } catch (error) {
            throw new Error(error.message || 'Signup failed');
        }
    }

    // Login user
    async login(credentials) {
        try {
            const data = await this.api.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });

            this.api.setAuth(data);
            return data;
        } catch (error) {
            throw new Error(error.message || 'Login failed');
        }
    }

    // Get GitHub OAuth URL
    async getGitHubAuthUrl() {
        try {
            const data = await this.api.request('/auth/github/login');
            if (!data.auth_url || data.auth_url === 'undefined') {
                throw new Error('GitHub OAuth not configured');
            }
            return data.auth_url;
        } catch (error) {
            throw new Error('GitHub OAuth not configured. Please set up credentials in backend.');
        }
    }

    // Get Google OAuth URL
    async getGoogleAuthUrl() {
        try {
            const data = await this.api.request('/auth/google/login');
            if (!data.auth_url || data.auth_url === 'undefined') {
                throw new Error('Google OAuth not configured');
            }
            return data.auth_url;
        } catch (error) {
            throw new Error('Google OAuth not configured. Please set up credentials in backend.');
        }
    }

    // Handle OAuth callback
    async handleOAuthCallback(provider, code) {
        try {
            const data = await this.api.request(`/auth/${provider}/callback?code=${code}`);
            this.api.setAuth(data);
            return data;
        } catch (error) {
            throw new Error('OAuth authentication failed');
        }
    }

    // Logout user
    async logout() {
        try {
            const token = this.api.getToken();
            if (token) {
                await this.api.request('/auth/logout', {
                    method: 'POST'
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.api.clearAuth();
        }
    }

    // Get current user from server
    async getCurrentUser() {
        try {
            const data = await this.api.request('/auth/me');
            const user = data.user || data;
            localStorage.setItem(this.api.userKey, JSON.stringify(user));
            return user;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    // Check if authenticated
    isAuthenticated() {
        return this.api.isAuthenticated();
    }

    // Get current user
    getUser() {
        return this.api.getUser();
    }

    // Redirect to login if not authenticated
    requireAuth() {
        if (!this.isAuthenticated()) {
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
            window.location.href = '/login.html';
            return false;
        }
        return true;
    }

    // Navigate to protected page
    navigateToProtectedPage(url) {
        if (this.isAuthenticated()) {
            window.location.href = url;
        } else {
            sessionStorage.setItem('redirectAfterLogin', url);
            window.location.href = '/signup.html';
        }
    }

    // Get redirect URL after login
    getRedirectUrl() {
        const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
        sessionStorage.removeItem('redirectAfterLogin');
        return redirectUrl || '/upload.html';
    }
}

// Create global instance
window.authController = new AuthController(window.apiService);
