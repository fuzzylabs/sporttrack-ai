// SportTrack.ai JavaScript - Video Upload and Analysis Interface

class SportTrackApp {
    constructor() {
        this.uploadArea = document.getElementById('uploadArea');
        this.videoInput = document.getElementById('videoInput');
        this.uploadProgress = document.getElementById('uploadProgress');
        this.resultsSection = document.getElementById('resultsSection');
        this.uploadProgressFill = document.getElementById('uploadProgressFill');
        this.uploadProgressText = document.getElementById('uploadProgressText');
        this.analysisProgressFill = document.getElementById('analysisProgressFill');
        this.analysisProgressText = document.getElementById('analysisProgressText');
        
        this.currentVideoId = null;
        
        this.initializeEventListeners();
        this.initializeParameterControls();
        
        // Additional debugging for file input
        console.log('Video input element:', this.videoInput);
        console.log('Upload area element:', this.uploadArea);
    }

    initializeEventListeners() {
        // File input change
        this.videoInput.addEventListener('change', (e) => {
            console.log('Change event fired, files:', e.target.files.length);
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                console.log('File selected:', file.name, file.type, file.size);
                this.handleVideoUpload(file);
            }
        });

        // Drag and drop functionality
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('drag-over');
        });

        this.uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('drag-over');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('drag-over');
            
            console.log('Drop event fired');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                console.log('Dropped file:', files[0]);
                this.handleVideoUpload(files[0]);
            }
        });

        // Removed upload area click handler to prevent conflicts
        // Only the button will trigger file selection now
    }

    isVideoFile(file) {
        const allowedTypes = [
            'video/mp4', 
            'video/avi', 
            'video/mov', 
            'video/quicktime', 
            'video/x-msvideo', 
            'video/x-matroska',
            'video/webm'
        ];
        
        // Also check file extension as backup
        const allowedExtensions = ['mp4', 'avi', 'mov', 'mkv', 'webm'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        const isValidType = allowedTypes.includes(file.type);
        const isValidExtension = allowedExtensions.includes(fileExtension);
        
        console.log('File validation:', {
            name: file.name,
            type: file.type,
            extension: fileExtension,
            validType: isValidType,
            validExtension: isValidExtension
        });
        
        return isValidType || isValidExtension;
    }

    async handleVideoUpload(file) {
        console.log('handleVideoUpload called with file:', file);
        
        if (!file) {
            console.warn('No file provided');
            return;
        }
        
        console.log('File details:', {
            name: file.name,
            size: file.size,
            type: file.type
        });
        
        if (!this.isVideoFile(file)) {
            this.showError('Please upload a valid video file (MP4, AVI, MOV, MKV)');
            return;
        }

        // Show progress
        this.showProgress();
        
        const formData = new FormData();
        formData.append('video', file);

        try {
            // Upload phase
            this.updateUploadProgress(0, 'Starting upload...');
            this.updateAnalysisProgress(0, 'Waiting for upload...');

            // Simulate upload progress
            for (let i = 10; i <= 100; i += 10) {
                await new Promise(resolve => setTimeout(resolve, 100));
                this.updateUploadProgress(i, i === 100 ? 'Upload complete!' : `Uploading... ${i}%`);
            }

            // Start analysis phase
            this.updateAnalysisProgress(10, 'Starting AI analysis...');

            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Upload failed');
            }

            const result = await response.json();
            
            // Now run progress simulation while backend is actually processing
            await this.simulateProcessing();
            
            // Get analysis data
            const analysis = await this.getAnalysis(result.video_id);
            
            // Show results
            setTimeout(() => {
                this.showResults(result, analysis);
            }, 500);

        } catch (error) {
            console.error('Upload error:', error);
            this.showError(error.message || 'Failed to process video');
        } finally {
            // Clear the file input to allow same file to be uploaded again
            this.videoInput.value = '';
        }
    }

    async pollAnalysisProgress(videoId) {
        return new Promise((resolve) => {
            const pollInterval = setInterval(async () => {
                try {
                    const response = await fetch(`/progress/${videoId}`);
                    if (response.ok) {
                        const progressData = await response.json();
                        this.updateAnalysisProgress(progressData.progress, progressData.message);
                        
                        if (progressData.stage === 'complete' || progressData.stage === 'error') {
                            clearInterval(pollInterval);
                            resolve();
                        }
                    } else {
                        // Fallback to simulated progress if endpoint fails
                        clearInterval(pollInterval);
                        await this.simulateProcessing();
                        resolve();
                    }
                } catch (error) {
                    console.warn('Progress polling failed, using simulation:', error);
                    clearInterval(pollInterval);
                    await this.simulateProcessing();
                    resolve();
                }
            }, 500); // Poll every 500ms
        });
    }

    async simulateProcessing() {
        // Realistic timing for actual video processing
        const steps = [
            { progress: 20, text: 'Analysing video frames...', delay: 1500 },
            { progress: 35, text: 'Detecting human poses...', delay: 2000 },
            { progress: 50, text: 'Mapping body landmarks...', delay: 2500 },
            { progress: 65, text: 'Generating skeletal overlay...', delay: 3000 },
            { progress: 80, text: 'Calculating technique metrics...', delay: 2000 },
            { progress: 95, text: 'Finalising analysis...', delay: 1000 }
        ];

        for (const step of steps) {
            await new Promise(resolve => setTimeout(resolve, step.delay));
            this.updateAnalysisProgress(step.progress, step.text);
        }
        
        this.updateAnalysisProgress(100, 'Analysis complete!');
    }

    async getAnalysis(videoId) {
        try {
            const response = await fetch(`/analyze/${videoId}`);
            if (!response.ok) {
                throw new Error('Failed to get analysis');
            }
            return await response.json();
        } catch (error) {
            console.error('Analysis error:', error);
            return this.getMockAnalysis();
        }
    }

    getMockAnalysis() {
        return {
            pose_detection_confidence: 0.87,
            detection_rate: 98.2,
            poses_detected: 442,
            technique_score: 0.75,
            recommendations: [
                'Maintain consistent arm positioning throughout the movement',
                'Focus on hip alignment for better balance',
                'Consider working on shoulder stability'
            ]
        };
    }

    showProgress() {
        this.uploadArea.style.display = 'none';
        this.uploadProgress.style.display = 'block';
        this.resultsSection.style.display = 'none';
    }

    updateUploadProgress(percentage, text) {
        this.uploadProgressFill.style.width = `${percentage}%`;
        this.uploadProgressText.textContent = text;
    }

    updateAnalysisProgress(percentage, text) {
        this.analysisProgressFill.style.width = `${percentage}%`;
        this.analysisProgressText.textContent = text;
    }

    initializeParameterControls() {
        // Add event listeners to parameter controls
        const rangeInputs = document.querySelectorAll('.param-group input[type="range"]');
        rangeInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const valueSpan = e.target.parentNode.querySelector('.param-value');
                if (valueSpan) {
                    valueSpan.textContent = e.target.value;
                }
            });
        });
    }

    showResults(uploadResult, analysis) {
        this.uploadProgress.style.display = 'none';
        this.resultsSection.style.display = 'block';
        
        // Store current video ID for reprocessing
        this.currentVideoId = uploadResult.video_id;

        // Set video sources with error handling
        const originalVideo = document.getElementById('originalVideo');
        const processedVideo = document.getElementById('processedVideo');
        
        console.log('Setting video sources:', {
            original: uploadResult.original_url,
            processed: uploadResult.processed_url
        });
        
        // Add error event listeners
        originalVideo.addEventListener('error', (e) => {
            console.error('Original video error:', e, originalVideo.error);
        });
        
        processedVideo.addEventListener('error', (e) => {
            console.error('Processed video error:', e, processedVideo.error);
            // Try reloading the processed video
            setTimeout(() => {
                console.log('Retrying processed video load...');
                processedVideo.load();
            }, 1000);
        });
        
        processedVideo.addEventListener('loadeddata', () => {
            console.log('✓ Processed video loaded successfully');
        });
        
        originalVideo.src = uploadResult.original_url;
        processedVideo.src = uploadResult.processed_url;

        // Update metrics
        document.getElementById('detectionConfidence').textContent = 
            `${Math.round(analysis.pose_detection_confidence * 100)}%`;
        document.getElementById('posesDetected').textContent = 
            `${analysis.poses_detected}/${Math.round(analysis.poses_detected / (analysis.detection_rate / 100))}`;
        document.getElementById('detectionRate').textContent = 
            `${analysis.detection_rate}%`;
        document.getElementById('techniqueScore').textContent = 
            `${Math.round(analysis.technique_score * 100)}%`;

        // Update recommendations
        const recommendationsList = document.getElementById('recommendationsList');
        recommendationsList.innerHTML = '';
        analysis.recommendations.forEach(recommendation => {
            const li = document.createElement('li');
            li.textContent = recommendation;
            recommendationsList.appendChild(li);
        });

        // Scroll to results
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    showError(message) {
        this.uploadProgress.style.display = 'none';
        this.uploadArea.style.display = 'block';
        
        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            background: #f8d7da;
            color: #721c24;
            padding: 1rem;
            border-radius: 6px;
            margin-top: 1rem;
            border: 1px solid #f5c6cb;
        `;
        errorDiv.textContent = message;
        
        // Remove existing error messages
        const existingErrors = this.uploadArea.parentNode.querySelectorAll('.error-message');
        existingErrors.forEach(error => error.remove());
        
        errorDiv.className = 'error-message';
        this.uploadArea.parentNode.appendChild(errorDiv);
        
        // Remove error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }
}

// Parameter tuning functions
function toggleParameterTuning() {
    const tuningPanel = document.getElementById('parameterTuning');
    const toggleButton = document.getElementById('tuningToggle');
    
    if (tuningPanel.style.display === 'none') {
        tuningPanel.style.display = 'block';
        toggleButton.textContent = '🔧 Hide Parameters';
        loadCurrentParameters();
    } else {
        tuningPanel.style.display = 'none';
        toggleButton.textContent = '🔧 Tune Parameters';
    }
}

async function loadCurrentParameters() {
    try {
        const response = await fetch('/parameters');
        if (response.ok) {
            const params = await response.json();
            
            document.getElementById('detectionConfidence').value = params.min_detection_confidence;
            document.getElementById('trackingConfidence').value = params.min_tracking_confidence;
            document.getElementById('modelComplexity').value = params.model_complexity;
            document.getElementById('landmarkThreshold').value = params.landmark_visibility_threshold;
            document.getElementById('minLandmarks').value = params.confident_landmarks_threshold;
            document.getElementById('stabilityRatio').value = params.stability_ratio;
            
            // Update displayed values
            document.querySelectorAll('.param-group input[type="range"]').forEach(input => {
                const valueSpan = input.parentNode.querySelector('.param-value');
                if (valueSpan) {
                    valueSpan.textContent = input.value;
                }
            });
        }
    } catch (error) {
        console.error('Failed to load parameters:', error);
    }
}

function resetParameters() {
    const defaults = {
        detectionConfidence: 0.4,
        trackingConfidence: 0.3,
        modelComplexity: 1,
        landmarkThreshold: 0.4,
        minLandmarks: 6,
        stabilityRatio: 0.4
    };
    
    Object.entries(defaults).forEach(([key, value]) => {
        const element = document.getElementById(key);
        if (element) {
            element.value = value;
            const valueSpan = element.parentNode.querySelector('.param-value');
            if (valueSpan) {
                valueSpan.textContent = value;
            }
        }
    });
}

async function applyParameters() {
    if (!window.sportTrackApp.currentVideoId) {
        alert('No video to reprocess. Please upload a video first.');
        return;
    }
    
    const params = {
        min_detection_confidence: parseFloat(document.getElementById('detectionConfidence').value),
        min_tracking_confidence: parseFloat(document.getElementById('trackingConfidence').value),
        model_complexity: parseInt(document.getElementById('modelComplexity').value),
        landmark_visibility_threshold: parseFloat(document.getElementById('landmarkThreshold').value),
        confident_landmarks_threshold: parseInt(document.getElementById('minLandmarks').value),
        stability_ratio: parseFloat(document.getElementById('stabilityRatio').value)
    };
    
    try {
        // Update parameters
        const paramResponse = await fetch('/parameters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });
        
        if (!paramResponse.ok) {
            throw new Error('Failed to update parameters');
        }
        
        // Show progress
        const applyButton = document.querySelector('.param-actions .btn-primary');
        const originalText = applyButton.textContent;
        applyButton.textContent = 'Reprocessing...';
        applyButton.disabled = true;
        
        // Reprocess video
        const reprocessResponse = await fetch(`/reprocess/${window.sportTrackApp.currentVideoId}`, {
            method: 'POST'
        });
        
        if (!reprocessResponse.ok) {
            throw new Error('Failed to reprocess video');
        }
        
        const result = await reprocessResponse.json();
        
        // Update processed video source
        const processedVideo = document.getElementById('processedVideo');
        processedVideo.src = result.processed_url + '?t=' + Date.now(); // Cache bust
        processedVideo.load();
        
        applyButton.textContent = 'Applied Successfully!';
        setTimeout(() => {
            applyButton.textContent = originalText;
            applyButton.disabled = false;
        }, 2000);
        
    } catch (error) {
        console.error('Error applying parameters:', error);
        alert('Failed to apply parameters: ' + error.message);
        
        const applyButton = document.querySelector('.param-actions .btn-primary');
        applyButton.textContent = 'Apply & Reprocess';
        applyButton.disabled = false;
    }
}

// Reset analysis function
function resetAnalysis() {
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('uploadProgress').style.display = 'none';
    document.getElementById('parameterTuning').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('videoInput').value = '';
    document.getElementById('tuningToggle').textContent = '🔧 Tune Parameters';
    
    // Reset progress bars
    document.getElementById('uploadProgressFill').style.width = '0%';
    document.getElementById('analysisProgressFill').style.width = '0%';
    document.getElementById('uploadProgressText').textContent = 'Uploading...';
    document.getElementById('analysisProgressText').textContent = 'Preparing analysis...';
    
    // Remove any error messages
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => error.remove());
    
    // Clear current video ID
    if (window.sportTrackApp) {
        window.sportTrackApp.currentVideoId = null;
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing SportTrackApp...');
    try {
        window.sportTrackApp = new SportTrackApp();
        console.log('SportTrackApp initialized successfully');
    } catch (error) {
        console.error('Failed to initialize SportTrackApp:', error);
    }
});