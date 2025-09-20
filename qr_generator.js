class QRGenerator {
    constructor() {
        this.qr = null;
        this.history = JSON.parse(localStorage.getItem('qr-history') || '[]');
        this.analytics = JSON.parse(localStorage.getItem('qr-analytics') || '{}');
        this.recognition = null;
        this.stream = null;
        this.scannerActive = false;
        
        this.initializeElements();
        this.bindEvents();
        this.initializeColorPresets();
        this.initializeFAB();
        this.initializeNotifications();
        this.initializeVoiceRecognition();
        this.updateAnalytics();
    }

    initializeElements() {
        this.textInput = document.getElementById('text-input');
        this.sizeSelect = document.getElementById('size-select');
        this.errorLevel = document.getElementById('error-level');
        this.qrStyle = document.getElementById('qr-style');
        this.colorInput = document.getElementById('color-input');
        this.bgColorInput = document.getElementById('bg-color-input');
        this.generateBtn = document.getElementById('generate-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.qrContainer = document.getElementById('qr-container');
        this.qrInfo = document.getElementById('qr-info');
        this.downloadSection = document.getElementById('download-section');
        this.downloadPng = document.getElementById('download-png');
        this.downloadSvg = document.getElementById('download-svg');
        this.downloadPdf = document.getElementById('download-pdf');
        this.copyLink = document.getElementById('copy-link');
        this.shareQr = document.getElementById('share-qr');
        this.charCount = document.getElementById('char-count');
        this.contentType = document.getElementById('content-type');
        this.qrSizeInfo = document.getElementById('qr-size-info');
        this.qrErrorInfo = document.getElementById('qr-error-info');
        this.qrContentInfo = document.getElementById('qr-content-info');
        this.qrTimestamp = document.getElementById('qr-timestamp');
        
        // AI Suggestions
        this.aiSuggestions = document.getElementById('ai-suggestions');
        this.suggestionsList = document.getElementById('suggestions-list');
        
        // Batch processing
        this.batchInput = document.getElementById('batch-input');
        this.batchGenerate = document.getElementById('batch-generate');
        this.batchResults = document.getElementById('batch-results');
        
        // Scanner elements
        this.scanQr = document.getElementById('scan-qr');
        this.qrScanner = document.getElementById('qr-scanner');
        this.scannerVideo = document.getElementById('scanner-video');
        this.stopScanner = document.getElementById('stop-scanner');
        
        // Voice input
        this.voiceInput = document.getElementById('voice-input');
        this.voiceStatus = document.getElementById('voice-status');
        
        // Logo upload
        this.logoUpload = document.getElementById('logo-upload');
        this.logoBtn = document.getElementById('logo-btn');
        this.logoPreview = document.getElementById('logo-preview');
        
        // Modal elements
        this.initializeModalElements();
    }

    initializeModalElements() {
        // WiFi modal
        this.wifiModal = document.getElementById('wifi-modal');
        this.wifiSsid = document.getElementById('wifi-ssid');
        this.wifiPassword = document.getElementById('wifi-password');
        this.wifiSecurity = document.getElementById('wifi-security');
        this.wifiHidden = document.getElementById('wifi-hidden');
        this.wifiGenerate = document.getElementById('wifi-generate');
        this.wifiCancel = document.getElementById('wifi-cancel');
        
        // WhatsApp modal
        this.whatsappModal = document.getElementById('whatsapp-modal');
        this.whatsappPhone = document.getElementById('whatsapp-phone');
        this.whatsappMessage = document.getElementById('whatsapp-message');
        this.whatsappGenerate = document.getElementById('whatsapp-generate');
        this.whatsappCancel = document.getElementById('whatsapp-cancel');
        
        // VCard modal
        this.vcardModal = document.getElementById('vcard-modal');
        this.vcardFirstname = document.getElementById('vcard-firstname');
        this.vcardLastname = document.getElementById('vcard-lastname');
        this.vcardPhone = document.getElementById('vcard-phone');
        this.vcardEmail = document.getElementById('vcard-email');
        this.vcardCompany = document.getElementById('vcard-company');
        this.vcardTitle = document.getElementById('vcard-title');
        this.vcardWebsite = document.getElementById('vcard-website');
        this.vcardGenerate = document.getElementById('vcard-generate');
        this.vcardCancel = document.getElementById('vcard-cancel');
        
        // Event modal
        this.eventModal = document.getElementById('event-modal');
        this.eventTitle = document.getElementById('event-title');
        this.eventStart = document.getElementById('event-start');
        this.eventEnd = document.getElementById('event-end');
        this.eventLocation = document.getElementById('event-location');
        this.eventDescription = document.getElementById('event-description');
        this.eventGenerate = document.getElementById('event-generate');
        this.eventCancel = document.getElementById('event-cancel');
        
        // History modal
        this.historyModal = document.getElementById('history-modal');
        this.historySearch = document.getElementById('history-search');
        this.historyList = document.getElementById('history-list');
        this.clearHistory = document.getElementById('clear-history');
        
        // Analytics modal
        this.analyticsModal = document.getElementById('analytics-modal');
        this.totalGenerated = document.getElementById('total-generated');
        this.mostUsedType = document.getElementById('most-used-type');
        this.averageSize = document.getElementById('average-size');
        this.totalDownloads = document.getElementById('total-downloads');
        this.analyticsChart = document.getElementById('analytics-chart');
        
        // Close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });
        
        // Modal overlays
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeAllModals();
            });
        });
    }

    bindEvents() {
        // Basic generation events
        this.generateBtn.addEventListener('click', () => this.generateQR());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.downloadPng.addEventListener('click', () => this.downloadQR('png'));
        this.downloadSvg.addEventListener('click', () => this.downloadQR('svg'));
        this.downloadPdf.addEventListener('click', () => this.downloadPDF());
        this.copyLink.addEventListener('click', () => this.copyQRLink());
        this.shareQr.addEventListener('click', () => this.shareQR());
        
        // Input events
        this.textInput.addEventListener('input', () => {
            this.updateInputInfo();
            this.generateAISuggestions(this.textInput.value);
        });
        this.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.generateQR();
            }
        });

        // Real-time generation
        [this.sizeSelect, this.errorLevel, this.qrStyle, this.colorInput, this.bgColorInput].forEach(el => {
            el.addEventListener('change', () => {
                if (this.qr) this.generateQR();
            });
        });

        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handlePreset(btn.dataset.preset));
        });

        // Batch processing
        this.batchGenerate.addEventListener('click', () => this.generateBatchQR());

        // Scanner events
        this.scanQr.addEventListener('click', () => this.startScanner());
        this.stopScanner.addEventListener('click', () => this.stopScanner());

        // Voice input
        this.voiceInput.addEventListener('click', () => this.startVoiceRecognition());

        // Logo upload
        this.logoBtn.addEventListener('click', () => this.logoUpload.click());
        this.logoUpload.addEventListener('change', (e) => this.handleLogoUpload(e));

        // Modal events
        this.bindModalEvents();

        // Initialize input info
        this.updateInputInfo();
    }

    bindModalEvents() {
        // WiFi modal events
        this.wifiGenerate.addEventListener('click', () => this.generateWiFiQR());
        this.wifiCancel.addEventListener('click', () => this.closeWiFiModal());

        // WhatsApp modal events
        this.whatsappGenerate.addEventListener('click', () => this.generateWhatsAppQR());
        this.whatsappCancel.addEventListener('click', () => this.closeWhatsAppModal());

        // VCard modal events
        this.vcardGenerate.addEventListener('click', () => this.generateVCardQR());
        this.vcardCancel.addEventListener('click', () => this.closeAllModals());

        // Event modal events
        this.eventGenerate.addEventListener('click', () => this.generateEventQR());
        this.eventCancel.addEventListener('click', () => this.closeAllModals());

        // History modal events
        this.historySearch.addEventListener('input', () => this.filterHistory());
        this.clearHistory.addEventListener('click', () => this.clearHistoryData());
    }

    // Handle logo upload
    handleLogoUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.logoPreview.innerHTML = `<img src="${e.target.result}" alt="Logo">`;
                this.logoPreview.style.display = 'block';
                this.logoBtn.innerHTML = '<i class="fas fa-check"></i> Logo Added';
                
                // Store logo for QR generation
                this.logoData = e.target.result;
                
                if (this.qr) this.generateQR();
            };
            reader.readAsDataURL(file);
        }
    }

    // Filter history
    filterHistory() {
        const search = this.historySearch.value.toLowerCase();
        const items = this.historyList.querySelectorAll('.history-item');
        
        items.forEach(item => {
            const text = item.querySelector('.history-item-text').textContent.toLowerCase();
            item.style.display = text.includes(search) ? 'flex' : 'none';
        });
    }

    // Clear history data
    clearHistoryData() {
        this.history = [];
        localStorage.removeItem('qr-history');
        this.renderHistory();
        this.showNotification('History cleared', 'success');
    }

    initializeColorPresets() {
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.addEventListener('click', () => {
                const color = preset.dataset.color;
                const isBackground = preset.closest('.option-group').querySelector('label').textContent.includes('Background');
                
                if (isBackground) {
                    this.bgColorInput.value = color;
                } else {
                    this.colorInput.value = color;
                }
                
                // Update active state
                preset.parentElement.querySelectorAll('.color-preset').forEach(p => p.classList.remove('active'));
                preset.classList.add('active');
                
                if (this.qr) this.generateQR();
            });
        });
    }

    updateInputInfo() {
        const text = this.textInput.value;
        const charCount = text.length;
        const contentType = this.detectContentType(text);
        
        this.charCount.textContent = `${charCount} characters`;
        this.contentType.textContent = contentType;
        this.contentType.className = `content-type-${contentType.toLowerCase()}`;
    }

    detectContentType(text) {
        if (!text) return 'Text';
        
        const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        
        if (urlRegex.test(text)) return 'URL';
        if (emailRegex.test(text)) return 'Email';
        if (phoneRegex.test(text.replace(/[\s\-\(\)]/g, ''))) return 'Phone';
        if (text.startsWith('WIFI:')) return 'WiFi';
        
        return 'Text';
    }

    // Initialize FAB (Floating Action Button)
    initializeFAB() {
        const mainFab = document.getElementById('main-fab');
        const fabMenu = document.querySelector('.fab-menu');
        
        mainFab.addEventListener('click', () => {
            mainFab.classList.toggle('active');
            fabMenu.classList.toggle('active');
        });
        
        // FAB menu items
        document.getElementById('history-fab').addEventListener('click', () => this.showHistory());
        document.getElementById('analytics-fab').addEventListener('click', () => this.showAnalytics());
        document.getElementById('templates-fab').addEventListener('click', () => this.showTemplates());
        document.getElementById('settings-fab').addEventListener('click', () => this.showSettings());
    }

    // Initialize notification system
    initializeNotifications() {
        this.notificationContainer = document.getElementById('notification-container');
    }

    // Show notification
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            ${message}
            <button class="close">&times;</button>
        `;
        
        this.notificationContainer.appendChild(notification);
        
        const closeBtn = notification.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            this.notificationContainer.removeChild(notification);
        });
        
        setTimeout(() => {
            if (this.notificationContainer.contains(notification)) {
                this.notificationContainer.removeChild(notification);
            }
        }, duration);
    }

    // Initialize voice recognition
    initializeVoiceRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            this.recognition.onresult = (event) => {
                const result = event.results[0][0].transcript;
                this.textInput.value = result;
                this.updateInputInfo();
                this.stopVoiceRecognition();
                this.showNotification('Voice input captured successfully!', 'success');
            };
            
            this.recognition.onerror = (event) => {
                this.stopVoiceRecognition();
                this.showNotification('Voice recognition failed: ' + event.error, 'error');
            };
        }
    }

    // Start voice recognition
    startVoiceRecognition() {
        if (this.recognition) {
            this.recognition.start();
            this.voiceInput.classList.add('recording');
            this.voiceStatus.style.display = 'flex';
            this.showNotification('Listening for voice input...', 'info');
        } else {
            this.showNotification('Voice recognition not supported in this browser', 'error');
        }
    }

    // Stop voice recognition
    stopVoiceRecognition() {
        if (this.recognition) {
            this.recognition.stop();
            this.voiceInput.classList.remove('recording');
            this.voiceStatus.style.display = 'none';
        }
    }

    // Start QR scanner
    async startScanner() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            this.scannerVideo.srcObject = this.stream;
            this.qrScanner.style.display = 'block';
            this.scannerActive = true;
            this.scanForQR();
        } catch (error) {
            this.showNotification('Camera access denied or not available', 'error');
        }
    }

    // Scan for QR codes
    scanForQR() {
        if (!this.scannerActive) return;
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        const scan = () => {
            if (this.scannerActive) {
                canvas.width = this.scannerVideo.videoWidth;
                canvas.height = this.scannerVideo.videoHeight;
                context.drawImage(this.scannerVideo, 0, 0);
                
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                
                if (code) {
                    this.textInput.value = code.data;
                    this.updateInputInfo();
                    this.stopScanner();
                    this.generateQR();
                    this.showNotification('QR code scanned successfully!', 'success');
                } else {
                    requestAnimationFrame(scan);
                }
            }
        };
        
        requestAnimationFrame(scan);
    }

    // Stop scanner
    stopScanner() {
        this.scannerActive = false;
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        this.qrScanner.style.display = 'none';
    }

    // Generate AI suggestions
    generateAISuggestions(text) {
        const suggestions = [];
        const contentType = this.detectContentType(text);
        
        switch (contentType) {
            case 'URL':
                suggestions.push('Add campaign tracking parameters');
                suggestions.push('Create shortened URL version');
                suggestions.push('Generate social media variants');
                break;
            case 'Email':
                suggestions.push('Add subject line');
                suggestions.push('Create mailto link with body');
                suggestions.push('Add CC/BCC recipients');
                break;
            case 'Phone':
                suggestions.push('Add international prefix');
                suggestions.push('Create tel: link');
                suggestions.push('Add extension number');
                break;
            case 'Text':
                suggestions.push('Convert to URL');
                suggestions.push('Add contact information');
                suggestions.push('Create event invitation');
                break;
        }
        
        this.displaySuggestions(suggestions);
    }

    // Display AI suggestions
    displaySuggestions(suggestions) {
        this.suggestionsList.innerHTML = '';
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = suggestion;
            item.addEventListener('click', () => this.applySuggestion(suggestion));
            this.suggestionsList.appendChild(item);
        });
        this.aiSuggestions.style.display = 'block';
    }

    // Apply suggestion
    applySuggestion(suggestion) {
        // This is a placeholder for AI suggestion implementation
        this.showNotification(`Applied suggestion: ${suggestion}`, 'info');
    }

    // Generate batch QR codes
    generateBatchQR() {
        const texts = this.batchInput.value.split('\n').filter(text => text.trim());
        if (texts.length === 0) {
            this.showNotification('Please enter texts for batch generation', 'error');
            return;
        }
        
        this.batchResults.innerHTML = '';
        this.showLoadingOverlay();
        
        const batchPromises = texts.map(text => this.generateBatchItem(text.trim()));
        
        Promise.all(batchPromises).then(() => {
            this.hideLoadingOverlay();
            this.showNotification(`Generated ${texts.length} QR codes successfully!`, 'success');
        });
    }

    // Generate individual batch item
    generateBatchItem(text) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const qr = new QRious({
                element: canvas,
                value: text,
                size: 150,
                foreground: this.colorInput.value,
                background: this.bgColorInput.value,
                level: this.errorLevel.value
            });
            
            const batchItem = document.createElement('div');
            batchItem.className = 'batch-item';
            batchItem.innerHTML = `
                ${canvas.outerHTML}
                <div class="batch-item-text">${text}</div>
                <button onclick="this.parentNode.querySelector('canvas').toBlob(blob => {
                    if (window.URL && window.URL.createObjectURL) {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'qr-batch-${Date.now()}.png';
                        a.click();
                        window.URL.revokeObjectURL(url);
                    } else {
                        // Fallback for browsers without URL API
                        const reader = new FileReader();
                        reader.onload = function() {
                            const a = document.createElement('a');
                            a.href = reader.result;
                            a.download = 'qr-batch-${Date.now()}.png';
                            a.click();
                        };
                        reader.readAsDataURL(blob);
                    }
                })" class="download-btn secondary">
                    <i class="fas fa-download"></i>
                </button>
            `;
            
            this.batchResults.appendChild(batchItem);
            resolve();
        });
    }

    // Generate WiFi QR
    generateWiFiQR() {
        const ssid = this.wifiSsid.value.trim();
        const password = this.wifiPassword.value.trim();
        const security = this.wifiSecurity.value;
        const hidden = this.wifiHidden.checked;

        if (!ssid) {
            this.showNotification('Please enter a WiFi network name (SSID)', 'error');
            return;
        }

        // Create WiFi QR code format: WIFI:T:WPA;S:mynetwork;P:mypassword;H:false;
        let wifiString = `WIFI:T:${security};S:${ssid};`;
        
        if (password && security !== 'nopass') {
            wifiString += `P:${password};`;
        }
        
        wifiString += `H:${hidden};`;

        // Set the text input and generate QR
        this.textInput.value = wifiString;
        this.generateQR();
        
        // Close modal and show success message
        this.closeWiFiModal();
        this.showNotification('WiFi QR code generated successfully!', 'success');
    }

    closeWiFiModal() {
        this.wifiModal.style.display = 'none';
        // Reset form
        this.wifiSsid.value = '';
        this.wifiPassword.value = '';
        this.wifiSecurity.value = 'WPA';
        this.wifiHidden.checked = false;
    }

    // Generate WhatsApp QR
    generateWhatsAppQR() {
        const phone = this.whatsappPhone.value.trim();
        const message = this.whatsappMessage.value.trim();

        if (!phone) {
            this.showNotification('Please enter a phone number', 'error');
            return;
        }

        // Remove any non-numeric characters except + for international format
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        
        // Create WhatsApp URL format
        let whatsappUrl = `https://wa.me/${cleanPhone}`;
        
        if (message) {
            whatsappUrl += `?text=${encodeURIComponent(message)}`;
        }

        // Set the text input and generate QR
        this.textInput.value = whatsappUrl;
        this.generateQR();
        
        // Close modal and show success message
        this.closeWhatsAppModal();
        this.showNotification('WhatsApp QR code generated successfully!', 'success');
    }

    closeWhatsAppModal() {
        this.whatsappModal.style.display = 'none';
        // Reset form
        this.whatsappPhone.value = '';
        this.whatsappMessage.value = '';
    }

    closeAllModals() {
        // Close all modals by setting display to none
        const modals = [
            this.wifiModal,
            this.whatsappModal,
            this.vcardModal,
            this.eventModal,
            this.historyModal,
            this.analyticsModal
        ];
        
        modals.forEach(modal => {
            if (modal) {
                modal.style.display = 'none';
            }
        });
        
        // Reset all forms
        this.resetAllForms();
    }

    resetAllForms() {
        // Reset WiFi form
        if (this.wifiSsid) this.wifiSsid.value = '';
        if (this.wifiPassword) this.wifiPassword.value = '';
        if (this.wifiSecurity) this.wifiSecurity.value = 'WPA';
        if (this.wifiHidden) this.wifiHidden.checked = false;
        
        // Reset WhatsApp form
        if (this.whatsappPhone) this.whatsappPhone.value = '';
        if (this.whatsappMessage) this.whatsappMessage.value = '';
        
        // Reset VCard form
        if (this.vcardFirstname) this.vcardFirstname.value = '';
        if (this.vcardLastname) this.vcardLastname.value = '';
        if (this.vcardPhone) this.vcardPhone.value = '';
        if (this.vcardEmail) this.vcardEmail.value = '';
        if (this.vcardCompany) this.vcardCompany.value = '';
        if (this.vcardTitle) this.vcardTitle.value = '';
        if (this.vcardWebsite) this.vcardWebsite.value = '';
        
        // Reset Event form
        if (this.eventTitle) this.eventTitle.value = '';
        if (this.eventStart) this.eventStart.value = '';
        if (this.eventEnd) this.eventEnd.value = '';
        if (this.eventLocation) this.eventLocation.value = '';
        if (this.eventDescription) this.eventDescription.value = '';
    }

    // Generate VCard
    generateVCardQR() {
        const firstname = this.vcardFirstname.value.trim();
        const lastname = this.vcardLastname.value.trim();
        const phone = this.vcardPhone.value.trim();
        const email = this.vcardEmail.value.trim();
        const company = this.vcardCompany.value.trim();
        const title = this.vcardTitle.value.trim();
        const website = this.vcardWebsite.value.trim();

        if (!firstname && !lastname && !phone && !email) {
            this.showNotification('Please enter at least a name, phone number, or email address', 'error');
            return;
        }

        // Create vCard format
        let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
        
        if (firstname || lastname) {
            vcard += `FN:${firstname} ${lastname}\n`;
            vcard += `N:${lastname};${firstname};;;\n`;
        }
        
        if (phone) {
            vcard += `TEL:${phone}\n`;
        }
        
        if (email) {
            vcard += `EMAIL:${email}\n`;
        }
        
        if (company) {
            vcard += `ORG:${company}\n`;
        }
        
        if (title) {
            vcard += `TITLE:${title}\n`;
        }
        
        if (website) {
            vcard += `URL:${website}\n`;
        }
        
        vcard += 'END:VCARD';

        // Set the text input and generate QR
        this.textInput.value = vcard;
        this.generateQR();
        
        // Close modal and show success message
        this.closeAllModals();
        this.showNotification('Contact QR code generated successfully!', 'success');
    }

    // Generate Event QR
    generateEventQR() {
        const title = this.eventTitle.value.trim();
        const start = this.eventStart.value;
        const end = this.eventEnd.value;
        const location = this.eventLocation.value.trim();
        const description = this.eventDescription.value.trim();

        if (!title || !start) {
            this.showNotification('Please enter an event title and start date/time', 'error');
            return;
        }

        // Convert datetime-local to the required format
        const startDate = new Date(start);
        const endDate = end ? new Date(end) : new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1 hour duration

        const formatDate = (date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        // Create iCalendar format
        let ical = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//QR Generator//EN\n';
        ical += 'BEGIN:VEVENT\n';
        ical += `DTSTART:${formatDate(startDate)}\n`;
        ical += `DTEND:${formatDate(endDate)}\n`;
        ical += `SUMMARY:${title}\n`;
        
        if (location) {
            ical += `LOCATION:${location}\n`;
        }
        
        if (description) {
            ical += `DESCRIPTION:${description}\n`;
        }
        
        ical += 'END:VEVENT\nEND:VCALENDAR';

        // Set the text input and generate QR
        this.textInput.value = ical;
        this.generateQR();
        
        // Close modal and show success message
        this.closeAllModals();
        this.showNotification('Event QR code generated successfully!', 'success');
    }

    // History and Analytics functions
    showHistory() {
        this.historyModal.style.display = 'block';
        this.renderHistory();
    }

    showAnalytics() {
        this.analyticsModal.style.display = 'block';
        this.renderAnalytics();
    }

    showTemplates() {
        this.showNotification('Templates feature coming soon!', 'info');
    }

    showSettings() {
        this.showNotification('Settings feature coming soon!', 'info');
    }

    renderHistory() {
        this.historyList.innerHTML = '';
        
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<div class="history-empty">No QR codes generated yet</div>';
            return;
        }

        this.history.reverse().forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-item-content">
                    <div class="history-item-text">${item.text}</div>
                    <div class="history-item-meta">
                        <span class="history-item-date">${item.timestamp}</span>
                        <span class="history-item-type">${item.type || 'Text'}</span>
                    </div>
                </div>
                <div class="history-item-actions">
                    <button class="history-use-btn" onclick="qrGen.useHistoryItem(${index})">
                        <i class="fas fa-redo"></i>
                    </button>
                    <button class="history-delete-btn" onclick="qrGen.deleteHistoryItem(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            this.historyList.appendChild(historyItem);
        });
    }

    renderAnalytics() {
        this.totalGenerated.textContent = this.analytics.totalGenerated || 0;
        this.totalDownloads.textContent = this.analytics.totalDownloads || 0;
        
        // Find most used type
        const types = this.analytics.types || {};
        const mostUsedType = Object.keys(types).reduce((a, b) => types[a] > types[b] ? a : b, 'None');
        this.mostUsedType.textContent = mostUsedType;
        
        // Calculate average size
        const sizes = this.analytics.sizes || [];
        const avgSize = sizes.length > 0 ? Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length) : 0;
        this.averageSize.textContent = avgSize ? `${avgSize}px` : 'N/A';
    }

    updateAnalytics() {
        // Initialize analytics if not exists
        if (!this.analytics.totalGenerated) this.analytics.totalGenerated = 0;
        if (!this.analytics.totalDownloads) this.analytics.totalDownloads = 0;
        if (!this.analytics.types) this.analytics.types = {};
        if (!this.analytics.sizes) this.analytics.sizes = [];
        
        // Save to localStorage
        localStorage.setItem('qr-analytics', JSON.stringify(this.analytics));
    }

    useHistoryItem(index) {
        const item = this.history.reverse()[index];
        this.textInput.value = item.text;
        this.colorInput.value = item.color || '#000000';
        this.bgColorInput.value = item.backgroundColor || '#ffffff';
        this.generateQR();
        this.closeAllModals();
    }

    deleteHistoryItem(index) {
        this.history.reverse().splice(index, 1);
        this.history.reverse();
        localStorage.setItem('qr-history', JSON.stringify(this.history));
        this.renderHistory();
        this.showNotification('History item deleted', 'success');
    }

    // Enhanced handle preset with new types
    handlePreset(preset) {
        switch(preset) {
            case 'url':
                this.textInput.value = 'https://example.com';
                this.textInput.focus();
                break;
            case 'email':
                this.textInput.value = 'mailto:example@email.com';
                this.textInput.focus();
                break;
            case 'phone':
                this.textInput.value = 'tel:+1234567890';
                this.textInput.focus();
                break;
            case 'sms':
                this.textInput.value = 'sms:+1234567890?body=Hello';
                this.textInput.focus();
                break;
            case 'whatsapp':
                this.whatsappModal.style.display = 'block';
                this.whatsappPhone.focus();
                break;
            case 'wifi':
                this.wifiModal.style.display = 'block';
                this.wifiSsid.focus();
                break;
            case 'vcard':
                this.vcardModal.style.display = 'block';
                this.vcardFirstname.focus();
                break;
            case 'event':
                this.eventModal.style.display = 'block';
                this.eventTitle.focus();
                break;
            case 'location':
                this.textInput.value = 'geo:40.7128,-74.0060';
                this.textInput.focus();
                break;
        }
        this.updateInputInfo();
    }

    // Clear all input fields and reset UI
    clearAll() {
        if (this.textInput) this.textInput.value = '';
        if (this.logoPreview) this.logoPreview.innerHTML = '';
        if (this.logoBtn) this.logoBtn.innerHTML = '<i class="fas fa-image"></i> Add Logo';
        this.logoData = null;
        if (this.qrContainer) this.qrContainer.innerHTML = '';
        if (this.downloadSection) this.downloadSection.style.display = 'none';
        if (this.qrInfo) this.qrInfo.style.display = 'none';
        this.updateInputInfo();
        this.showNotification('Cleared all fields', 'info');
    }

    // Save QR code data to history
    saveToHistory(text, color, backgroundColor) {
        if (!text) return;
        const item = {
            text,
            color,
            backgroundColor,
            timestamp: new Date().toLocaleString(),
            type: this.detectContentType(text)
        };
        this.history.push(item);
        if (this.history.length > 50) this.history.shift(); // Limit history size
        localStorage.setItem('qr-history', JSON.stringify(this.history));
    }

    generateQR() {
        const text = this.textInput.value.trim();
        
        if (!text) {
            this.showNotification('Please enter some text or URL', 'error');
            return;
        }

        this.showLoading();

        try {
            // Check if QRious is available
            if (typeof QRious === 'undefined') {
                throw new Error('QRious library is not loaded');
            }

            const size = parseInt(this.sizeSelect.value);
            const errorLevel = this.errorLevel.value;
            const foreground = this.colorInput.value;
            const background = this.bgColorInput.value;
            const contentType = this.detectContentType(text);

            // Clear previous QR code
            this.qrContainer.innerHTML = '';

            // Create new QR code with style
            const canvas = this.createCanvas();
            this.qr = new QRious({
                element: canvas,
                value: text,
                size: size,
                foreground: foreground,
                background: background,
                level: errorLevel
            });

            // Apply styling based on selected style
            this.applyQRStyle(canvas);

            // Add logo if available
            if (this.logoData) {
                this.addLogoToQR(canvas);
            }

            // Update info display
            this.updateQRInfo(size, errorLevel, contentType);
            this.qrTimestamp.textContent = new Date().toLocaleString();

            // Save to history
            this.saveToHistory(text, foreground, background);

            // Update analytics
            this.analytics.totalGenerated++;
            if (!this.analytics.types[contentType]) {
                this.analytics.types[contentType] = 0;
            }
            this.analytics.types[contentType]++;
            this.analytics.sizes.push(size);
            this.updateAnalytics();

            // Show the QR code with animation
            this.showQRCode();
            
            // Show download section and info
            this.downloadSection.style.display = 'block';
            this.qrInfo.style.display = 'block';
            this.downloadSection.classList.add('fade-in-up');
            this.qrInfo.classList.add('fade-in-up');

            // Track event
            this.trackEvent('QR Generation', 'Generate', contentType);

        } catch (error) {
            this.showError('Error generating QR code: ' + error.message);
        }
    }

    // Apply QR style
    applyQRStyle(canvas) {
        const ctx = canvas.getContext('2d');
        const style = this.qrStyle.value;
        
        switch (style) {
            case 'rounded':
                // Apply rounded corners effect
                this.applyRoundedStyle(ctx, canvas);
                break;
            case 'dots':
                // Apply dots style
                this.applyDotsStyle(ctx, canvas);
                break;
            case 'gradient':
                // Apply gradient effect
                this.applyGradientStyle(ctx, canvas);
                break;
            // 'square' is default, no additional processing needed
        }
    }

    // Apply rounded style
    applyRoundedStyle(ctx, canvas) {
        // This is a simplified implementation
        // In a real app, you'd implement proper rounded corner rendering
        ctx.globalCompositeOperation = 'source-over';
    }

    // Apply dots style
    applyDotsStyle(ctx, canvas) {
        // This is a simplified implementation
        // In a real app, you'd convert squares to dots
        ctx.globalCompositeOperation = 'source-over';
    }

    // Apply gradient style
    applyGradientStyle(ctx, canvas) {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, this.colorInput.value);
        gradient.addColorStop(1, this.adjustColor(this.colorInput.value, -30));
        
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Add logo to QR code
    addLogoToQR(canvas) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            const logoSize = canvas.width * 0.15; // 15% of QR size
            const x = (canvas.width - logoSize) / 2;
            const y = (canvas.height - logoSize) / 2;
            
            // Draw white background for logo
            ctx.fillStyle = 'white';
            ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10);
            
            // Draw logo
            ctx.drawImage(img, x, y, logoSize, logoSize);
        };
        
        img.src = this.logoData;
    }

    // Adjust color brightness
    adjustColor(color, amount) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * amount);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    // Track events
    trackEvent(category, action, label) {
        // Enhanced analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label
            });
        }
        
        // Custom analytics
        const event = {
            category,
            action,
            label,
            timestamp: Date.now()
        };
        
        const events = JSON.parse(localStorage.getItem('qr-events') || '[]');
        events.push(event);
        localStorage.setItem('qr-events', JSON.stringify(events));
    }

    updateQRInfo(size, errorLevel, contentType) {
        this.qrSizeInfo.textContent = `${size}x${size}`;
        
        const errorLevels = {
            'L': 'Low (7%)',
            'M': 'Medium (15%)',
            'Q': 'High (25%)',
            'H': 'Highest (30%)'
        };
        this.qrErrorInfo.textContent = errorLevels[errorLevel];
        this.qrContentInfo.textContent = contentType;
    }

    downloadQR(format = 'png') {
        if (!this.qr) return;

        try {
            const canvas = this.qrContainer.querySelector('canvas');
            
            if (format === 'png') {
                const link = document.createElement('a');
                link.download = `qr-code-${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                this.showDownloadSuccess('PNG');
            } else if (format === 'svg') {
                // Create SVG version
                const svgQR = new QRious({
                    value: this.textInput.value.trim(),
                    size: parseInt(this.sizeSelect.value),
                    foreground: this.colorInput.value,
                    background: this.bgColorInput.value,
                    level: this.errorLevel.value,
                    mime: 'image/svg+xml'
                });
                
                const svgData = svgQR.toDataURL();
                const link = document.createElement('a');
                link.download = `qr-code-${Date.now()}.svg`;
                link.href = svgData;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                this.showDownloadSuccess('SVG');
            }
            
        } catch (error) {
            this.showError('Error downloading QR code: ' + error.message);
        }
    }

    async copyQRLink() {
        if (!this.qr) return;

        try {
            const canvas = this.qrContainer.querySelector('canvas');
            const dataURL = canvas.toDataURL('image/png');
            
            // Create a blob from the canvas
            const response = await fetch(dataURL);
            const blob = await response.blob();
            
            // Copy to clipboard
            await navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ]);
            
            this.showDownloadSuccess('Link copied to clipboard!');
        } catch (error) {
            // Fallback: copy data URL
            try {
                const canvas = this.qrContainer.querySelector('canvas');
                const dataURL = canvas.toDataURL('image/png');
                await navigator.clipboard.writeText(dataURL);
                this.showDownloadSuccess('Data URL copied to clipboard!');
            } catch (fallbackError) {
                this.showError('Could not copy to clipboard');
            }
        }
    }

    createCanvas() {
        const canvas = document.createElement('canvas');
        this.qrContainer.appendChild(canvas);
        return canvas;
    }

    showLoading() {
        this.generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        this.generateBtn.disabled = true;
        this.qrContainer.classList.add('loading');
    }

    showQRCode() {
        this.generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate QR Code';
        this.generateBtn.disabled = false;
        this.qrContainer.classList.remove('loading');
        this.qrContainer.classList.add('fade-in-up');
        
        // Show success message briefly
        this.showSuccessMessage();
    }

    showSuccessMessage() {
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.innerHTML = '<i class="fas fa-check-circle"></i> QR Code generated successfully!';
        successMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            successMsg.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => document.body.removeChild(successMsg), 300);
        }, 3000);
    }

    showError(message) {
        this.generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate QR Code';
        this.generateBtn.disabled = false;
        this.qrContainer.classList.remove('loading');
        
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        errorMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(errorMsg);
        
        setTimeout(() => {
            errorMsg.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => document.body.removeChild(errorMsg), 300);
        }, 5000);
    }

    downloadQR() {
        if (!this.qr) return;

        try {
            // Get the canvas element
            const canvas = this.qrContainer.querySelector('canvas');
            
            // Create download link
            const link = document.createElement('a');
            link.download = `qr-code-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Show download success message
            this.showDownloadSuccess();
            
        } catch (error) {
            this.showError('Error downloading QR code: ' + error.message);
        }
    }

    showDownloadSuccess() {
        const successMsg = document.createElement('div');
        successMsg.className = 'download-success-message';
        successMsg.innerHTML = '<i class="fas fa-download"></i> QR Code downloaded successfully!';
        successMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #17a2b8;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            successMsg.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => document.body.removeChild(successMsg), 300);
        }, 3000);
    }
}

// Add CSS animations for notifications
const notificationStyles = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;

// Add notification styles to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Utility functions
const QRUtils = {
    validateURL: (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    },

    detectContentType: (text) => {
        if (QRUtils.validateURL(text)) {
            return 'URL';
        } else if (text.includes('@') && text.includes('.')) {
            return 'Email';
        } else if (/^\+?\d[\d\s\-\(\)]+$/.test(text)) {
            return 'Phone';
        } else {
            return 'Text';
        }
    },

    getQRTypeIcon: (type) => {
        const icons = {
            'URL': 'fas fa-link',
            'Email': 'fas fa-envelope',
            'Phone': 'fas fa-phone',
            'Text': 'fas fa-font'
        };
        return icons[type] || 'fas fa-font';
    }
};

// Initialize the Enhanced QR Generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if QRious library is loaded
    if (typeof QRious === 'undefined') {
        console.error('QRious library not loaded. Please check if the script is included.');
        document.body.innerHTML += '<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #ff6b6b; color: white; padding: 20px; border-radius: 10px; z-index: 9999;">Error: QRious library not loaded. Please refresh the page.</div>';
        return;
    }
    
    try {
        window.qrGenerator = new QRGenerator();
    } catch (error) {
        console.error('Failed to initialize QR Generator:', error);
        document.body.innerHTML += '<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #ff6b6b; color: white; padding: 20px; border-radius: 10px; z-index: 9999;">Error initializing QR Generator: ' + error.message + '</div>';
    }
    
    // Add service worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    }
    
    // Add install prompt for PWA
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install button
        const installBtn = document.createElement('button');
        installBtn.textContent = 'Install App';
        installBtn.className = 'install-btn';
        installBtn.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 30px;
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const result = await deferredPrompt.userChoice;
                if (result.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                deferredPrompt = null;
                document.body.removeChild(installBtn);
            }
        });
        
        document.body.appendChild(installBtn);
    });
    
    // Add keyboard shortcuts help
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F1') {
            e.preventDefault();
            showKeyboardShortcuts();
        }
    });
    
    function showKeyboardShortcuts() {
        const shortcuts = `
            <div class="shortcuts-modal">
                <h3>Keyboard Shortcuts</h3>
                <div class="shortcuts-list">
                    <div><kbd>Ctrl + Enter</kbd> - Generate QR Code</div>
                    <div><kbd>Ctrl + S</kbd> - Download PNG</div>
                    <div><kbd>Ctrl + Shift + S</kbd> - Download SVG</div>
                    <div><kbd>Escape</kbd> - Clear All</div>
                    <div><kbd>F1</kbd> - Show this help</div>
                </div>
            </div>
        `;
        
        qrGenerator.showNotification(shortcuts, 'info', 10000);
    }
    
    console.log('🎉 Advanced QR Generator with AI features loaded successfully!');
    console.log('Features: Voice Input, QR Scanning, Batch Processing, Analytics, History, and more!');
});

// Enhanced keyboard shortcuts and additional functionality
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to generate QR
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('generate-btn').click();
    }
    
    // Ctrl/Cmd + S to download QR as PNG
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const downloadBtn = document.getElementById('download-png');
        if (downloadBtn && downloadBtn.offsetParent !== null) {
            downloadBtn.click();
        }
    }
    
    // Ctrl/Cmd + Shift + S to download as SVG
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        const downloadBtn = document.getElementById('download-svg');
        if (downloadBtn && downloadBtn.offsetParent !== null) {
            downloadBtn.click();
        }
    }
    
    // Escape to clear
    if (e.key === 'Escape') {
        const textInput = document.getElementById('text-input');
        if (textInput.value) {
            document.getElementById('clear-btn').click();
        }
    }
});

// Add drag and drop functionality
const dropZone = document.getElementById('text-input');
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#667eea';
    dropZone.style.background = '#f0f4ff';
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#e1e5e9';
    dropZone.style.background = '#f8f9fa';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#e1e5e9';
    dropZone.style.background = '#f8f9fa';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (e) => {
                dropZone.value = e.target.result;
                dropZone.dispatchEvent(new Event('input'));
            };
            reader.readAsText(file);
        }
    }
});

// Add theme toggle functionality
const themeToggle = document.createElement('button');
themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
themeToggle.className = 'theme-toggle';
themeToggle.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    padding: 10px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 1000;
    backdrop-filter: blur(10px);
`;

document.body.appendChild(themeToggle);

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

// Add dark theme styles
const darkThemeStyles = `
    .dark-theme {
        background: linear-gradient(135deg, #2c3e50 0%, #4a6741 100%);
    }
    
    .dark-theme .generator-card {
        background: #34495e;
        color: white;
    }
    
    .dark-theme .input-group label,
    .dark-theme .option-group label {
        color: #ecf0f1;
    }
    
    .dark-theme #text-input {
        background: #2c3e50;
        color: white;
        border-color: #555;
    }
    
    .dark-theme #text-input:focus {
        background: #34495e;
    }
    
    .dark-theme .qr-container {
        background: #2c3e50;
        border-color: #555;
    }
    
    .dark-theme .qr-info {
        background: #2c3e50;
        color: #ecf0f1;
    }
    
    .dark-theme .preset-btn {
        background: #2c3e50;
        color: #ecf0f1;
        border-color: #555;
    }
    
    .dark-theme .preset-btn:hover {
        background: #667eea;
        border-color: #667eea;
    }
    
    .dark-theme select {
        background: #2c3e50;
        color: white;
        border-color: #555;
    }
    
    .dark-theme .features h2 {
        color: #ecf0f1;
    }
`;

const darkStyleSheet = document.createElement('style');
darkStyleSheet.textContent = darkThemeStyles;
document.head.appendChild(darkStyleSheet);

// Add PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}

// Add analytics tracking (placeholder)
function trackEvent(category, action, label) {
    // This is where you would integrate with your analytics service
    console.log(`Analytics: ${category} - ${action} - ${label}`);
}

// Track QR generation
const originalGenerateQR = QRGenerator.prototype.generateQR;
QRGenerator.prototype.generateQR = function() {
    trackEvent('QR Generator', 'Generate', this.detectContentType(this.textInput.value));
    return originalGenerateQR.call(this);
};

// Add tooltips
const tooltipStyle = `
    .tooltip {
        position: relative;
        display: inline-block;
    }
    
    .tooltip .tooltiptext {
        visibility: hidden;
        width: 200px;
        background-color: #555;
        color: white;
        text-align: center;
        border-radius: 6px;
        padding: 8px;
        position: absolute;
        z-index: 1;
        bottom: 125%;
        left: 50%;
        margin-left: -100px;
        opacity: 0;
        transition: opacity 0.3s;
        font-size: 12px;
    }
    
    .tooltip:hover .tooltiptext {
        visibility: visible;
        opacity: 1;
    }
`;

const tooltipStyleSheet = document.createElement('style');
tooltipStyleSheet.textContent = tooltipStyle;
document.head.appendChild(tooltipStyleSheet);

// Add error correction level tooltips
document.getElementById('error-level').parentNode.classList.add('tooltip');
const errorTooltip = document.createElement('span');
errorTooltip.className = 'tooltiptext';
errorTooltip.textContent = 'Higher error correction allows QR codes to be read even when damaged or partially obscured';
document.getElementById('error-level').parentNode.appendChild(errorTooltip);

console.log('Enhanced QR Generator loaded successfully!');