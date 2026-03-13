// Authentication Service
class AuthService {
    constructor() {
        this.baseURL = 'http://localhost:8000/api';
        this.tokenKey = 'paperscope_token';
        this.userKey = 'paperscope_user';
    }

    // Get stored token
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    // Get stored user
    getUser() {
        const userData = localStorage.getItem(this.userKey);
        return userData ? JSON.parse(userData) : null;
    }

    // Store authentication data
    setAuth(tokenData) {
        const token = tokenData.token || tokenData.access_token;
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(tokenData.user));
    }
    
    // Signup user
    async signup(userData) {
        try {
            const response = await fetch(`${this.baseURL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            this.setAuth(data);
            return data;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    }

    // Login user
    async login(credentials) {
        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            this.setAuth(data);
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Clear authentication data
    clearAuth() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = this.getToken();
        const user = this.getUser();
        return !!(token && user);
    }

    // Get GitHub OAuth URL
    async getGitHubAuthUrl() {
        try {
            const response = await fetch(`${this.baseURL}/auth/github/login`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            if (!data.auth_url || data.auth_url === 'undefined') {
                throw new Error('OAuth not configured: GitHub Client ID/Secret not set in backend .env file');
            }
            return data.auth_url;
        } catch (error) {
            console.error('Error getting GitHub auth URL:', error);
            throw new Error('GitHub OAuth not configured. Please set up OAuth credentials in the backend.');
        }
    }

    // Get Google OAuth URL
    async getGoogleAuthUrl() {
        try {
            const response = await fetch(`${this.baseURL}/auth/google/login`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            if (!data.auth_url || data.auth_url === 'undefined') {
                throw new Error('OAuth not configured: Google Client ID/Secret not set in backend .env file');
            }
            return data.auth_url;
        } catch (error) {
            console.error('Error getting Google auth URL:', error);
            throw new Error('Google OAuth not configured. Please set up OAuth credentials in the backend.');
        }
    }

    // Handle OAuth callback
    async handleOAuthCallback(provider, code) {
        try {
            const response = await fetch(`${this.baseURL}/auth/${provider}/callback?code=${code}`);
            if (!response.ok) {
                throw new Error(`OAuth callback failed: ${response.statusText}`);
            }
            const tokenData = await response.json();
            this.setAuth(tokenData);
            return tokenData;
        } catch (error) {
            console.error('Error handling OAuth callback:', error);
            throw error;
        }
    }

    // Logout user
    async logout() {
        try {
            const token = this.getToken();
            if (token) {
                await fetch(`${this.baseURL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            this.clearAuth();
        }
    }

    // Get current user from server
    async getCurrentUser() {
        const token = this.getToken();
        if (!token) return null;

        try {
            const response = await fetch(`${this.baseURL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.clearAuth();
                }
                return null;
            }

            const data = await response.json();
            const user = data.user || data;
            localStorage.setItem(this.userKey, JSON.stringify(user));
            return user;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }
    
    // Upload file (question paper)
    async uploadFile(formData) {
        const token = this.getToken();
        if (!token) {
            throw new Error('Not authenticated');
        }

        try {
            const response = await fetch(`${this.baseURL}/papers/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData // Don't set Content-Type, let browser set it with boundary
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Upload failed');
            }

            return data;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }

    // Get all papers
    async getPapers(filters = {}) {
        try {
            const queryParams = new URLSearchParams(filters);
            const response = await fetch(`${this.baseURL}/papers?${queryParams}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch papers');
            }

            return data;
        } catch (error) {
            console.error('Error fetching papers:', error);
            throw error;
        }
    }

    // Analyze paper with AI
    async analyzePaper(paperId) {
        const token = this.getToken();
        if (!token) {
            throw new Error('Not authenticated');
        }

        try {
            const response = await fetch(`${this.baseURL}/ai/analyze/${paperId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Analysis failed');
            }

            return data;
        } catch (error) {
            console.error('Analysis error:', error);
            throw error;
        }
    }

    // Ask AI a question
    async askAI(question, context = '') {
        const token = this.getToken();
        if (!token) {
            throw new Error('Not authenticated');
        }

        try {
            const response = await fetch(`${this.baseURL}/ai/ask`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question, context })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get answer');
            }

            return data;
        } catch (error) {
            console.error('AI question error:', error);
            throw error;
        }
    }

    // Make authenticated API request
    async apiRequest(url, options = {}) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseURL}${url}`, {
            ...options,
            headers
        });

        if (response.status === 401) {
            this.clearAuth();
            window.location.href = '/login.html';
            return null;
        }

        return response;
    }

    // Redirect to login if not authenticated
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    }

    // Initialize OAuth callback handling
    initOAuthCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const provider = this.getProviderFromURL();

        if (code && provider) {
            this.handleOAuthCallback(provider, code)
                .then(tokenData => {
                    // Remove OAuth params from URL
                    const url = new URL(window.location);
                    url.searchParams.delete('code');
                    url.searchParams.delete('state');
                    window.history.replaceState({}, document.title, url);

                    // Show success message and redirect to intended page
                    alert(`Welcome ${tokenData.user.name}! You have been logged in successfully.`);
                    const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || '/upload.html';
                    sessionStorage.removeItem('redirectAfterLogin');
                    window.location.href = redirectUrl;
                })
                .catch(error => {
                    console.error('OAuth callback error:', error);
                    alert('Authentication failed. Please try again.');
                    window.location.href = '/login.html';
                });
        }
    }

    // Get provider from current URL path
    getProviderFromURL() {
        const path = window.location.pathname;
        if (path.includes('github')) return 'github';
        if (path.includes('google')) return 'google';
        return null;
    }
}

// Create global auth service instance
const authService = new AuthService();

// Auto-initialize OAuth callback on page load
document.addEventListener('DOMContentLoaded', () => {
    authService.initOAuthCallback();
});

// Export for use in other scripts
window.authService = authService;
