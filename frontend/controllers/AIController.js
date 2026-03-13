// AI Analysis Controller
class AIController {
    constructor(apiService) {
        this.api = apiService;
    }

    // Analyze paper with AI
    async analyzePaper(paperId) {
        if (!this.api.isAuthenticated()) {
            throw new Error('Authentication required');
        }

        try {
            const data = await this.api.request(`/ai/analyze/${paperId}`, {
                method: 'POST'
            });
            return data;
        } catch (error) {
            throw new Error(error.message || 'Analysis failed');
        }
    }

    // Analyze multiple papers to find repeated questions
    async analyzeMultiplePapers(paperIds) {
        if (!this.api.isAuthenticated()) {
            throw new Error('Authentication required');
        }

        if (!paperIds || paperIds.length < 2) {
            throw new Error('Please select at least 2 papers to compare');
        }

        try {
            const data = await this.api.request('/ai/analyze-multiple', {
                method: 'POST',
                body: JSON.stringify({ paperIds })
            });
            return data;
        } catch (error) {
            throw new Error(error.message || 'Multi-paper analysis failed');
        }
    }

    // Get study recommendations
    async getRecommendations(paperId) {
        if (!this.api.isAuthenticated()) {
            throw new Error('Authentication required');
        }

        try {
            const data = await this.api.request(`/ai/recommendations/${paperId}`, {
                method: 'POST'
            });
            return data;
        } catch (error) {
            throw new Error(error.message || 'Failed to get recommendations');
        }
    }

    // Ask AI a question
    async askAI(question, context = '') {
        if (!this.api.isAuthenticated()) {
            throw new Error('Authentication required');
        }

        try {
            const data = await this.api.request('/ai/ask', {
                method: 'POST',
                body: JSON.stringify({ question, context })
            });
            return data;
        } catch (error) {
            throw new Error('Failed to get AI response');
        }
    }

    // Get analysis history
    async getAnalysisHistory(filters = {}) {
        if (!this.api.isAuthenticated()) {
            throw new Error('Authentication required');
        }

        try {
            const queryParams = new URLSearchParams(filters);
            const data = await this.api.request(`/ai/history?${queryParams}`);
            return data;
        } catch (error) {
            throw new Error('Failed to fetch analysis history');
        }
    }
}

// Create global instance
window.aiController = new AIController(window.apiService);
