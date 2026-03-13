// Paper Upload and Management Controller
class PaperController {
    constructor(apiService) {
        this.api = apiService;
    }

    // Upload paper files
    async uploadPapers(files, metadata) {
        if (!this.api.isAuthenticated()) {
            throw new Error('Authentication required');
        }

        const uploadPromises = files.map(file => {
            const formData = new FormData();
            formData.append('paper', file);
            formData.append('branch', metadata.branch);
            formData.append('semester', metadata.semester);
            formData.append('subject', metadata.subject);
            formData.append('year', metadata.year);
            formData.append('scheme', metadata.scheme);
            formData.append('examType', metadata.examType);
            
            return this.api.uploadFile('/papers/upload', formData);
        });

        return await Promise.all(uploadPromises);
    }

    // Get all papers
    async getPapers(filters = {}) {
        try {
            const queryParams = new URLSearchParams(filters);
            const data = await this.api.request(`/papers?${queryParams}`);
            return data;
        } catch (error) {
            throw new Error('Failed to fetch papers');
        }
    }

    // Get paper by ID
    async getPaperById(paperId) {
        try {
            const data = await this.api.request(`/papers/${paperId}`);
            return data;
        } catch (error) {
            throw new Error('Failed to fetch paper details');
        }
    }

    // Delete paper
    async deletePaper(paperId) {
        if (!this.api.isAuthenticated()) {
            throw new Error('Authentication required');
        }

        try {
            const data = await this.api.request(`/papers/${paperId}`, {
                method: 'DELETE'
            });
            return data;
        } catch (error) {
            throw new Error('Failed to delete paper');
        }
    }
}

// Create global instance
window.paperController = new PaperController(window.apiService);
