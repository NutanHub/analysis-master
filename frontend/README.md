# MSBTE PaperHub Frontend - MVC Architecture

## 📁 Project Structure

```
frontend/
├── app.js                      # Main application initialization
├── index.html                  # Root redirect file
├── package.json                # Dependencies and scripts
│
├── models/                     # Data models and API services
│   └── ApiService.js          # Centralized backend API communication
│
├── controllers/                # Business logic controllers
│   ├── AuthController.js      # Authentication logic
│   ├── PaperController.js     # Paper management logic
│   └── AIController.js        # AI analysis logic
│
├── views/                      # HTML pages
│   ├── index.html             # Homepage
│   ├── login.html             # Login page
│   ├── signup.html            # Signup page
│   ├── upload.html            # Upload page (protected)
│   ├── analysis.html          # Analysis page
│   ├── results.html           # Results page
│   └── contact.html           # Contact page
│
├── components/                 # Reusable UI components
│   ├── Navbar.js              # Navigation bar component
│   └── Footer.js              # Footer component
│
├── utils/                      # Utility functions
│   └── helpers.js             # Helper functions (toast, loading, etc.)
│
├── styles/                     # CSS files
│   └── components.css         # Shared component styles
│
└── js/                        # Legacy scripts (to be refactored)
    ├── auth.js                # Old auth service (deprecated)
    └── auth-guard.js          # Auth guard (deprecated)
```

## 🏗️ MVC Architecture

### Models
- **ApiService.js**: Handles all HTTP requests to the backend API
  - Manages authentication tokens
  - Provides generic request methods
  - Handles file uploads

### Controllers
- **AuthController**: Manages user authentication
  - Login/Signup
  - OAuth (GitHub/Google)
  - Session management
  - Protected routes

- **PaperController**: Manages question papers
  - Upload papers
  - Fetch papers list
  - Delete papers

- **AIController**: Manages AI analysis
  - Analyze papers
  - Ask AI questions
  - Get analysis history

### Views
- Clean HTML pages that use controllers for logic
- Use shared components for consistent UI
- Minimal inline JavaScript

### Components
- **Navbar**: Dynamic navigation with auth state
- **Footer**: Consistent footer across pages
- Reusable, modular design

## 🚀 Getting Started

### Install Dependencies
```bash
cd frontend
npm install
```

### Development Server
```bash
npm run dev
```
Server runs on: http://localhost:5173

### Production Build
```bash
npm run build
```

## 🔐 Authentication Flow

1. User visits protected page (e.g., `/views/upload.html`)
2. **AuthController** checks authentication status
3. If not authenticated → redirect to `/views/signup.html`
4. After signup/login → redirect back to intended page
5. OAuth providers (GitHub/Google) supported

## 🔗 Backend Integration

All API calls go through **ApiService**:
```javascript
// Example: Login
await window.authController.login({
    emailOrUsername: 'user@example.com',
    password: 'password123'
});

// Example: Upload paper
await window.paperController.uploadPapers(files, metadata);

// Example: Analyze paper
await window.aiController.analyzePaper(paperId);
```

## 📝 Page Structure

Each page includes:
1. Navbar container: `<div id="navbar-container"></div>`
2. Main content area
3. Footer container: `<div id="footer-container"></div>`
4. Script includes:
   - `/app.js` (initializes MVC)
   - `/styles/components.css` (shared styles)

## 🛠️ Utilities

Available via `window.utils`:
- `showToast(message, type)` - Show notifications
- `showLoading(message)` - Show loading spinner
- `hideLoading()` - Hide loading spinner
- `formatDate(date)` - Format dates
- `formatFileSize(bytes)` - Format file sizes
- `validateEmail(email)` - Validate email addresses

## 🔄 Migration from Old Structure

**Removed files** (test/demo):
- test.html
- demo-auth.html
- flow-test.html
- icon-test.html
- nav.html
- oauth-info.html
- blog.html
- about.html
- product.html

**Deprecated scripts** (use controllers instead):
- `/js/auth.js` → Use `AuthController`
- `/js/auth-guard.js` → Use `AuthController.requireAuth()`

## 📱 Responsive Design

All components are mobile-responsive with breakpoints at:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🎨 Theming

Colors:
- Primary: #6366f1 (Indigo)
- Secondary: #8b5cf6 (Purple)
- Success: #10b981 (Green)
- Error: #ef4444 (Red)
- Dark: #1f2937 (Gray-dark)

## 📄 License

MIT License - See LICENSE file for details
