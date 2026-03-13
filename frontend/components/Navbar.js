// Shared Navbar Component
class NavbarComponent {
    constructor() {
        this.currentPage = window.location.pathname.split('/').pop() || 'index.html';
    }

    render(isAuthenticated = false, user = null) {
        return `
        <nav class="navbar">
            <a href="index.html" class="logo">
                <div class="logo-icon"><i class="fas fa-clipboard-check"></i></div>
                <span><span class="text-dark">Analysis</span><span class="text-gradient">Hub</span></span>
            </a>
            
            <ul class="nav-links">
                <li><a href="index.html" class="${this.currentPage === 'index.html' ? 'active' : ''}">
                    <i class="fas fa-home"></i> Home
                </a></li>
                ${isAuthenticated ? `
                    <li><a href="upload.html" class="${this.currentPage === 'upload.html' ? 'active' : ''}">
                        <i class="fas fa-upload"></i> Upload
                    </a></li>
                ` : ''}
                <li><a href="contact.html" class="${this.currentPage === 'contact.html' ? 'active' : ''}">
                    <i class="fas fa-envelope"></i> Contact
                </a></li>
            </ul>
            
            <div class="nav-buttons">
                ${isAuthenticated && user ? `
                    <div class="user-menu">
                        <img src="${this.getAvatarUrl(user)}" alt="${user.name}" class="user-avatar" />
                        <span class="user-name">${user.name}</span>
                        <button onclick="handleLogout()" class="btn-logout">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                ` : `
                    <a href="login.html" class="btn-secondary">
                        <i class="fas fa-sign-in-alt"></i> Log In
                    </a>
                    <a href="signup.html" class="btn-primary">
                        <i class="fas fa-user-plus"></i> Sign Up
                    </a>
                `}
            </div>
        </nav>
        `;
    }

    getAvatarUrl(user) {
        if (user.avatar_url) return user.avatar_url;
        const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%236366f1'/%3E%3Ctext x='20' y='26' font-family='Arial' font-size='18' fill='white' text-anchor='middle'%3E${initial}%3C/text%3E%3C/svg%3E`;
    }

    inject(containerId = 'navbar-container') {
        const container = document.getElementById(containerId);
        if (container) {
            const isAuth = window.authController.isAuthenticated();
            const user = window.authController.getUser();
            container.innerHTML = this.render(isAuth, user);
        }
    }
}

// Global logout handler
async function handleLogout() {
    try {
        await window.authController.logout();
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Create global instance
window.navbarComponent = new NavbarComponent();
