class LabMatcher {
    constructor() {
        this.apiBaseUrl = '/api';
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.searchForm = document.getElementById('searchForm');
        this.keywordsInput = document.getElementById('keywords');
        this.maxResultsSelect = document.getElementById('maxResults');
        this.searchBtn = document.getElementById('searchBtn');
        this.searchText = document.getElementById('searchText');
        this.loadingText = document.getElementById('loadingText');
        
        this.resultsSection = document.getElementById('resultsSection');
        this.resultsContainer = document.getElementById('results');
        this.errorSection = document.getElementById('errorSection');
        this.errorMessage = document.getElementById('errorMessage');
        this.noResultsSection = document.getElementById('noResultsSection');
    }

    bindEvents() {
        this.searchForm.addEventListener('submit', (e) => this.handleSearch(e));
    }

    async handleSearch(event) {
        event.preventDefault();
        
        const keywords = this.keywordsInput.value.trim();
        const maxResults = parseInt(this.maxResultsSelect.value);
        
        if (!keywords) {
            this.showError('Please enter your research interests.');
            return;
        }
        
        this.setLoadingState(true);
        this.hideAllSections();
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/search-labs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    keywords: keywords,
                    max_results: maxResults
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Search failed');
            }
            
            const labs = await response.json();
            this.displayResults(labs);
            
        } catch (error) {
            console.error('Search error:', error);
            this.showError(error.message || 'An error occurred while searching for labs.');
        } finally {
            this.setLoadingState(false);
        }
    }

    displayResults(labs) {
        if (labs.length === 0) {
            this.showNoResults();
            return;
        }
        
        this.resultsContainer.innerHTML = '';
        
        labs.forEach(labMatch => {
            const labCard = this.createLabCard(labMatch);
            this.resultsContainer.appendChild(labCard);
        });
        
        this.resultsSection.classList.remove('hidden');
    }

    createLabCard(labMatch) {
        const { lab, similarity_score } = labMatch;
        
        const card = document.createElement('div');
        card.className = 'bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200';
        
        card.innerHTML = `
            <div class="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                <div class="flex-1">
                    <h3 class="text-xl font-bold text-gray-800 mb-2">${this.escapeHtml(lab.name)}</h3>
                    <div class="text-gray-600 text-sm mb-3">
                        <span class="font-semibold">${this.escapeHtml(lab.professor)}</span> • 
                        <span>${this.escapeHtml(lab.department)}, ${this.escapeHtml(lab.university)}</span>
                        ${lab.location ? ` • <span>${this.escapeHtml(lab.location)}</span>` : ''}
                    </div>
                </div>
                <div class="md:ml-4 mb-4 md:mb-0">
                    <span class="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        ${Math.round(similarity_score * 100)}% match
                    </span>
                </div>
            </div>
            
            <div class="mb-4">
                <p class="text-gray-700 leading-relaxed">${this.escapeHtml(lab.description)}</p>
            </div>
            
            ${lab.research_areas && lab.research_areas.length > 0 ? `
                <div class="mb-4">
                    <h4 class="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Research Areas</h4>
                    <div class="flex flex-wrap gap-2">
                        ${lab.research_areas.map(area => `
                            <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                ${this.escapeHtml(area)}
                            </span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${(lab.website || lab.email) ? `
                <div class="pt-4 border-t border-gray-200">
                    <div class="flex flex-wrap gap-4">
                        ${lab.website ? `
                            <a href="${this.escapeHtml(lab.website)}" 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                </svg>
                                Website
                            </a>
                        ` : ''}
                        ${lab.email ? `
                            <a href="mailto:${this.escapeHtml(lab.email)}" 
                               class="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                                Contact
                            </a>
                        ` : ''}
                    </div>
                </div>
            ` : ''}
        `;
        
        return card;
    }

    showError(message) {
        this.hideAllSections();
        this.errorMessage.textContent = message;
        this.errorSection.classList.remove('hidden');
    }

    showNoResults() {
        this.hideAllSections();
        this.noResultsSection.classList.remove('hidden');
    }

    hideAllSections() {
        this.resultsSection.classList.add('hidden');
        this.errorSection.classList.add('hidden');
        this.noResultsSection.classList.add('hidden');
    }

    setLoadingState(isLoading) {
        this.searchBtn.disabled = isLoading;
        
        if (isLoading) {
            this.searchText.classList.add('hidden');
            this.loadingText.classList.remove('hidden');
        } else {
            this.searchText.classList.remove('hidden');
            this.loadingText.classList.add('hidden');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LabMatcher();
}); 