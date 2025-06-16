class LabMatcher {
    constructor() {
        this.apiBaseUrl = '/api';
        this.currentMode = 'resume'; // 'text' or 'resume'
        this.selectedFile = null;
        this.initializeElements();
        this.bindEvents();
        this.setupFileUpload();
        this.switchToResumeMode(); // Initialize with resume mode active
    }

    initializeElements() {
        // Form elements
        this.searchForm = document.getElementById('searchForm');
        this.keywordsInput = document.getElementById('keywords');
        this.maxResultsSelect = document.getElementById('maxResults');
        this.searchBtn = document.getElementById('searchBtn');
        this.searchText = document.getElementById('searchText');
        this.loadingText = document.getElementById('loadingText');
        
        // Mode toggle elements
        this.textModeBtn = document.getElementById('textModeBtn');
        this.resumeModeBtn = document.getElementById('resumeModeBtn');
        this.textInputSection = document.getElementById('textInputSection');
        this.resumeUploadSection = document.getElementById('resumeUploadSection');
        
        // File upload elements
        this.dropZone = document.getElementById('dropZone');
        this.dropZoneContent = document.getElementById('dropZoneContent');
        this.fileSelectedContent = document.getElementById('fileSelectedContent');
        this.resumeFileInput = document.getElementById('resumeFile');
        this.selectedFileName = document.getElementById('selectedFileName');
        this.removeFileBtn = document.getElementById('removeFileBtn');
        
        // Results and feedback elements
        this.resultsSection = document.getElementById('resultsSection');
        this.resultsContainer = document.getElementById('results');
        this.errorSection = document.getElementById('errorSection');
        this.errorMessage = document.getElementById('errorMessage');
        this.noResultsSection = document.getElementById('noResultsSection');
    }

    bindEvents() {
        // Form submission
        this.searchForm.addEventListener('submit', (e) => this.handleSearch(e));
        
        // Mode toggle buttons
        this.textModeBtn.addEventListener('click', () => this.switchToTextMode());
        this.resumeModeBtn.addEventListener('click', () => this.switchToResumeMode());
        
        // File removal
        this.removeFileBtn.addEventListener('click', () => this.removeSelectedFile());
    }

    setupFileUpload() {
        // Click to upload
        this.dropZone.addEventListener('click', () => {
            this.resumeFileInput.click();
        });

        // File input change
        this.resumeFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // Drag and drop events
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('border-umich-maize', 'bg-blue-50');
        });

        this.dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            if (!this.dropZone.contains(e.relatedTarget)) {
                this.dropZone.classList.remove('border-umich-maize', 'bg-blue-50');
            }
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('border-umich-maize', 'bg-blue-50');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });
    }

    switchToTextMode() {
        this.currentMode = 'text';
        this.textModeBtn.classList.remove('bg-gray-200', 'text-gray-700');
        this.textModeBtn.classList.add('bg-umich-blue', 'text-white');
        this.resumeModeBtn.classList.remove('bg-umich-blue', 'text-white');
        this.resumeModeBtn.classList.add('bg-gray-200', 'text-gray-700');
        
        this.textInputSection.classList.remove('hidden');
        this.resumeUploadSection.classList.add('hidden');
        
        // Clear any selected file
        this.selectedFile = null;
        this.updateFileDisplay();
    }

    switchToResumeMode() {
        this.currentMode = 'resume';
        this.resumeModeBtn.classList.remove('bg-gray-200', 'text-gray-700');
        this.resumeModeBtn.classList.add('bg-umich-blue', 'text-white');
        this.textModeBtn.classList.remove('bg-umich-blue', 'text-white');
        this.textModeBtn.classList.add('bg-gray-200', 'text-gray-700');
        
        this.textInputSection.classList.add('hidden');
        this.resumeUploadSection.classList.remove('hidden');
    }

    handleFileSelect(file) {
        // Validate file type
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
        const allowedExtensions = ['pdf', 'docx', 'doc'];
        const fileExtension = file.name.toLowerCase().split('.').pop();
        
        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
            this.showError('Please select a PDF or Word document (.pdf, .docx, .doc)');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showError('File size must be less than 10MB');
            return;
        }

        this.selectedFile = file;
        this.selectedFileName.textContent = file.name;
        this.updateFileDisplay();
    }

    updateFileDisplay() {
        if (this.selectedFile) {
            this.dropZoneContent.classList.add('hidden');
            this.fileSelectedContent.classList.remove('hidden');
        } else {
            this.dropZoneContent.classList.remove('hidden');
            this.fileSelectedContent.classList.add('hidden');
            this.resumeFileInput.value = '';
        }
    }

    removeSelectedFile() {
        this.selectedFile = null;
        this.updateFileDisplay();
    }

    async handleSearch(event) {
        event.preventDefault();
        
        this.setLoadingState(true);
        this.hideAllSections();
        
        try {
            let labs;
            
            if (this.currentMode === 'text') {
                labs = await this.searchWithText();
            } else {
                labs = await this.searchWithResume();
            }
            
            this.displayResults(labs);
            
        } catch (error) {
            console.error('Search error:', error);
            this.showError(error.message || 'An error occurred while searching for labs.');
        } finally {
            this.setLoadingState(false);
        }
    }

    async searchWithText() {
        const keywords = this.keywordsInput.value.trim();
        const maxResults = parseInt(this.maxResultsSelect.value);
        
        if (!keywords) {
            throw new Error('Please enter your research interests.');
        }
        
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
        
        return await response.json();
    }

    async searchWithResume() {
        const maxResults = parseInt(this.maxResultsSelect.value);
        
        if (!this.selectedFile) {
            throw new Error('Please upload your resume.');
        }
        
        const formData = new FormData();
        formData.append('resume_file', this.selectedFile);
        formData.append('max_results', maxResults.toString());
        formData.append('search_type', 'resume');
        
        const response = await fetch(`${this.apiBaseUrl}/search-labs-with-resume`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Resume analysis failed');
        }
        
        return await response.json();
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
        card.className = 'bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 hover:border-umich-blue relative overflow-hidden';
        
        card.innerHTML = `
            <!-- Subtle accent border -->
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-umich-blue to-umich-maize"></div>
            
            <div class="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                <div class="flex-1">
                    <h3 class="text-xl font-bold text-umich-blue mb-2 flex items-center">
                        ${this.escapeHtml(lab.name)}
                    </h3>
                    <div class="text-gray-600 text-sm mb-3 font-medium">
                        <span class="font-bold text-umich-blue">PROFESSOR: ${this.escapeHtml(lab.professor)}</span>
                        ${lab.location ? ` | <span>LOCATION: ${this.escapeHtml(lab.location)}</span>` : ''}
                    </div>
                </div>
                <div class="md:ml-4 mb-4 md:mb-0">
                    <span class="inline-block bg-umich-blue text-umich-maize px-4 py-2 rounded-full text-sm font-bold border border-umich-maize shadow-sm">
                        MATCH: ${Math.round(similarity_score * 100)}%
                    </span>
                </div>
            </div>
            
            <div class="mb-4">
                <p class="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border-l-4 border-umich-maize">${this.escapeHtml(lab.description)}</p>
            </div>
            
            ${lab.research_areas && lab.research_areas.length > 0 ? `
                <div class="mb-4">
                    <h4 class="text-sm font-bold text-umich-blue uppercase tracking-wide mb-2 flex items-center">
                        RESEARCH AREAS
                    </h4>
                    <div class="flex flex-wrap gap-2">
                        ${lab.research_areas.map(area => `
                            <span class="bg-umich-maize text-umich-blue px-3 py-1 rounded-full text-sm font-semibold border border-umich-blue shadow-sm">
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
                               class="inline-flex items-center bg-umich-blue text-umich-maize hover:bg-umich-blue-light font-semibold text-sm transition-colors px-4 py-2 rounded-lg border border-umich-maize shadow-sm">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                </svg>
                                VISIT WEBSITE
                            </a>
                        ` : ''}
                        ${lab.email ? `
                            <a href="mailto:${this.escapeHtml(lab.email)}" 
                               class="inline-flex items-center bg-umich-maize text-umich-blue hover:bg-umich-maize-dark font-semibold text-sm transition-colors px-4 py-2 rounded-lg border border-umich-blue shadow-sm">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                                CONTACT LAB
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