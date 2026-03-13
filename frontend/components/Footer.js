// Shared Footer Component
class FooterComponent {
    render() {
        return `
        <footer class="footer">
            <div class="footer-content">
                <div class="footer-brand">
                    <h3><span class="text-dark">Analysis</span><span class="text-gradient">Hub</span></h3>
                    <p>AI-powered question paper analysis platform helping students achieve academic success through smart exam preparation.</p>
                    <div class="social-links">
                        <a href="#" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
                        <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                        <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
                        <a href="#" aria-label="GitHub"><i class="fab fa-github"></i></a>
                    </div>
                </div>
                
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="index.html">Home</a></li>
                        <li><a href="#" onclick="window.authController.navigateToProtectedPage('/upload.html'); return false;">Upload</a></li>
                        <li><a href="contact.html">Contact</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h4>Legal</h4>
                    <ul>
                        <li><a href="#">Privacy Policy</a></li>
                        <li><a href="#">Terms of Service</a></li>
                        <li><a href="#">Cookie Policy</a></li>
                    </ul>
                </div>
                
                <div class="footer-section">
                    <h4>Support</h4>
                    <ul>
                        <li><a href="contact.html">Contact Us</a></li>
                        <li><a href="#">FAQs</a></li>
                        <li><a href="#">Help Center</a></li>
                    </ul>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} MSBTE PaperHub. All rights reserved.</p>
            </div>
        </footer>
        `;
    }

    inject(containerId = 'footer-container') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = this.render();
        }
    }
}

// Create global instance
window.footerComponent = new FooterComponent();
