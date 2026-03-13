// API Service - Centralized backend communication
class ApiService {
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

    // Generic API request method
    async request(endpoint, options = {}) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers
            });

            // Handle unauthorized
            if (response.status === 401) {
                this.clearAuth();
                window.location.href = '/login.html';
                throw new Error('Unauthorized - Please login again');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    // Upload file (with FormData)
    async uploadFile(endpoint, formData) {
        const token = this.getToken();
        
        if (!token) {
            throw new Error('Not authenticated');
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
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
}

// Create global instance
window.apiService = new ApiService();
