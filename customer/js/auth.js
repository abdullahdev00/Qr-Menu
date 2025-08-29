class AuthenticationManager {
    constructor() {
        this.currentUser = null;
        this.authModalElement = null;
        this.profileSidebarElement = null;
        this.authSteps = ['phoneStep', 'otpStep', 'detailsStep', 'addressStep'];
        this.currentStep = 'phoneStep';
        this.currentPhoneNumber = '';
        this.isLoading = false;
        
        this.init();
    }

    init() {
        // Initialize DOM elements
        this.authModalElement = document.getElementById('authModal');
        this.profileSidebarElement = document.getElementById('profileSidebar');
        
        // Load user from localStorage
        this.loadUserFromStorage();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Update UI based on current user state
        this.updateUI();
    }

    setupEventListeners() {
        // Profile toggle button
        const profileToggle = document.getElementById('profileToggle');
        if (profileToggle) {
            profileToggle.addEventListener('click', () => this.toggleProfile());
        }

        // Auth modal close buttons
        this.setupCloseHandlers();

        // Form submissions
        this.setupFormHandlers();

        // Profile sidebar handlers
        this.setupProfileHandlers();

        // Overlay clicks
        this.setupOverlayHandlers();
    }

    setupCloseHandlers() {
        const closeButtons = ['authClose', 'otpClose', 'detailsClose', 'addressClose'];
        closeButtons.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', () => this.closeAuthModal());
            }
        });
    }

    setupFormHandlers() {
        // Phone form
        const phoneForm = document.getElementById('phoneForm');
        if (phoneForm) {
            phoneForm.addEventListener('submit', (e) => this.handlePhoneSubmit(e));
        }

        // OTP form
        const otpForm = document.getElementById('otpForm');
        if (otpForm) {
            otpForm.addEventListener('submit', (e) => this.handleOtpSubmit(e));
        }

        // Details form
        const detailsForm = document.getElementById('detailsForm');
        if (detailsForm) {
            detailsForm.addEventListener('submit', (e) => this.handleDetailsSubmit(e));
        }

        // Address form
        const addressForm = document.getElementById('addressForm');
        if (addressForm) {
            addressForm.addEventListener('submit', (e) => this.handleAddressSubmit(e));
        }

        // Resend OTP button
        const resendOtpBtn = document.getElementById('resendOtpBtn');
        if (resendOtpBtn) {
            resendOtpBtn.addEventListener('click', () => this.resendOTP());
        }

        // Skip address button
        const skipAddressBtn = document.getElementById('skipAddressBtn');
        if (skipAddressBtn) {
            skipAddressBtn.addEventListener('click', () => this.skipAddressStep());
        }
    }

    setupProfileHandlers() {
        // Sign in button
        const signInBtn = document.getElementById('signInBtn');
        if (signInBtn) {
            signInBtn.addEventListener('click', () => this.openAuthModal());
        }

        // Profile close button
        const profileClose = document.getElementById('profileClose');
        if (profileClose) {
            profileClose.addEventListener('click', () => this.closeProfile());
        }

        // Sign out button
        const signOutBtn = document.getElementById('signOutBtn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', () => this.signOut());
        }

        // Profile edit button
        const profileEditBtn = document.getElementById('profileEditBtn');
        if (profileEditBtn) {
            profileEditBtn.addEventListener('click', () => this.editProfile());
        }

        // Add address button
        const addAddressBtn = document.getElementById('addAddressBtn');
        if (addAddressBtn) {
            addAddressBtn.addEventListener('click', () => this.addAddress());
        }
    }

    setupOverlayHandlers() {
        // Auth modal overlay
        const authModalOverlay = document.getElementById('authModalOverlay');
        if (authModalOverlay) {
            authModalOverlay.addEventListener('click', () => this.closeAuthModal());
        }

        // Profile overlay
        const profileOverlay = document.getElementById('profileOverlay');
        if (profileOverlay) {
            profileOverlay.addEventListener('click', () => this.closeProfile());
        }
    }

    // Authentication Flow Methods
    async handlePhoneSubmit(e) {
        e.preventDefault();
        
        if (this.isLoading) return;

        const phoneInput = document.getElementById('phoneInput');
        const phoneNumber = phoneInput.value.trim();

        if (!this.validatePhoneNumber(phoneNumber)) {
            this.showError('Please enter a valid Pakistani mobile number');
            return;
        }

        this.setLoading('sendOtpBtn', true);

        try {
            const response = await fetch('/api/customer-auth/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phoneNumber: phoneNumber,
                    purpose: 'login'
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentPhoneNumber = phoneNumber;
                document.getElementById('phoneDisplay').textContent = phoneNumber;
                this.showStep('otpStep');
                
                // Auto-fill OTP in development mode
                if (data.otp && process.env.NODE_ENV === 'development') {
                    setTimeout(() => {
                        document.getElementById('otpInput').value = data.otp;
                    }, 500);
                }
                
                this.showSuccess('OTP sent successfully');
            } else {
                // If user doesn't exist, try registration
                if (data.error && data.error.includes('not registered')) {
                    await this.sendRegistrationOTP(phoneNumber);
                } else {
                    this.showError(data.error || 'Failed to send OTP');
                }
            }
        } catch (error) {
            console.error('Send OTP error:', error);
            this.showError('Network error. Please try again.');
        } finally {
            this.setLoading('sendOtpBtn', false);
        }
    }

    async sendRegistrationOTP(phoneNumber) {
        try {
            const response = await fetch('/api/customer-auth/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phoneNumber: phoneNumber,
                    purpose: 'registration'
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentPhoneNumber = phoneNumber;
                document.getElementById('phoneDisplay').textContent = phoneNumber;
                this.showStep('otpStep');
                this.showSuccess('Welcome! OTP sent for registration');
                
                // Auto-fill OTP in development mode
                if (data.otp) {
                    setTimeout(() => {
                        document.getElementById('otpInput').value = data.otp;
                    }, 500);
                }
            } else {
                this.showError(data.error || 'Failed to send registration OTP');
            }
        } catch (error) {
            console.error('Registration OTP error:', error);
            this.showError('Network error. Please try again.');
        }
    }

    async handleOtpSubmit(e) {
        e.preventDefault();
        
        if (this.isLoading) return;

        const otpInput = document.getElementById('otpInput');
        const otp = otpInput.value.trim();

        if (!this.validateOTP(otp)) {
            this.showError('Please enter a valid 6-digit OTP');
            return;
        }

        this.setLoading('verifyOtpBtn', true);

        try {
            // Try login first
            let response = await fetch('/api/customer-auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phoneNumber: this.currentPhoneNumber,
                    otp: otp,
                    purpose: 'login'
                })
            });

            let data = await response.json();

            // If login fails because user not found, try registration flow
            if (!response.ok && data.error && data.error.includes('not found')) {
                this.showSuccess('Phone verified! Please complete your profile.');
                this.showStep('detailsStep');
                return;
            }

            if (response.ok) {
                this.currentUser = data.user;
                this.saveUserToStorage();
                
                if (data.isNewUser || !data.user.name) {
                    this.showSuccess('Login successful! Please add your address.');
                    this.showStep('addressStep');
                } else {
                    this.showSuccess('Welcome back! You are signed in.');
                    this.completeAuthentication();
                }
            } else {
                this.showError(data.error || 'Invalid OTP');
            }
        } catch (error) {
            console.error('Verify OTP error:', error);
            this.showError('Network error. Please try again.');
        } finally {
            this.setLoading('verifyOtpBtn', false);
        }
    }

    async handleDetailsSubmit(e) {
        e.preventDefault();
        
        if (this.isLoading) return;

        const nameInput = document.getElementById('nameInput');
        const emailInput = document.getElementById('emailInput');
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();

        if (!name) {
            this.showError('Please enter your name');
            return;
        }

        if (email && !this.validateEmail(email)) {
            this.showError('Please enter a valid email address');
            return;
        }

        this.setLoading('saveDetailsBtn', true);

        try {
            const response = await fetch('/api/customer-auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phoneNumber: this.currentPhoneNumber,
                    otp: document.getElementById('otpInput').value,
                    purpose: 'registration',
                    name: name,
                    email: email || undefined
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentUser = data.user;
                this.saveUserToStorage();
                this.showStep('addressStep');
                this.showSuccess('Profile created successfully');
            } else {
                this.showError(data.error || 'Failed to create profile');
            }
        } catch (error) {
            console.error('Save details error:', error);
            this.showError('Network error. Please try again.');
        } finally {
            this.setLoading('saveDetailsBtn', false);
        }
    }

    async handleAddressSubmit(e) {
        e.preventDefault();
        
        if (this.isLoading) return;

        const formData = {
            customerId: this.currentUser.id,
            title: document.getElementById('addressTitleInput').value.trim(),
            addressLine1: document.getElementById('addressLine1Input').value.trim(),
            addressLine2: document.getElementById('addressLine2Input').value.trim(),
            city: document.getElementById('cityInput').value.trim(),
            area: document.getElementById('areaInput').value.trim(),
            landmark: document.getElementById('landmarkInput').value.trim(),
            isDefault: true
        };

        if (!formData.title || !formData.addressLine1 || !formData.city) {
            this.showError('Please fill in all required fields');
            return;
        }

        this.setLoading('saveAddressBtn', true);

        try {
            const response = await fetch('/api/customer-auth/addresses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                this.completeAuthentication();
                this.showSuccess('Address saved successfully');
            } else {
                this.showError(data.error || 'Failed to save address');
            }
        } catch (error) {
            console.error('Save address error:', error);
            this.showError('Network error. Please try again.');
        } finally {
            this.setLoading('saveAddressBtn', false);
        }
    }

    // Profile Management Methods
    toggleProfile() {
        if (this.currentUser) {
            this.openProfileSidebar();
        } else {
            this.openAuthModal();
        }
    }

    openAuthModal() {
        this.currentStep = 'phoneStep';
        this.showStep('phoneStep');
        this.authModalElement.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeAuthModal() {
        this.authModalElement.classList.remove('active');
        document.body.style.overflow = '';
        this.resetAuthForms();
    }

    openProfileSidebar() {
        this.loadUserAddresses();
        this.profileSidebarElement.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeProfile() {
        this.profileSidebarElement.classList.remove('active');
        document.body.style.overflow = '';
    }

    async loadUserAddresses() {
        if (!this.currentUser) return;

        try {
            const response = await fetch(`/api/customer-auth/addresses?customerId=${this.currentUser.id}`);
            const data = await response.json();

            if (response.ok) {
                this.displayAddresses(data.addresses);
            }
        } catch (error) {
            console.error('Load addresses error:', error);
        }
    }

    displayAddresses(addresses) {
        const addressesList = document.getElementById('addressesList');
        if (!addressesList) return;

        if (addresses.length === 0) {
            addressesList.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No addresses saved</p>';
            return;
        }

        addressesList.innerHTML = addresses.map(address => `
            <div class="address-item ${address.isDefault ? 'default' : ''}" data-address-id="${address.id}">
                <div class="address-title">
                    <i class="fas fa-map-marker-alt"></i>
                    ${address.title}
                    ${address.isDefault ? '<span style="color: var(--accent-gold); font-size: 0.8rem;">(Default)</span>' : ''}
                </div>
                <div class="address-text">
                    ${address.addressLine1}
                    ${address.addressLine2 ? ', ' + address.addressLine2 : ''}
                    <br>
                    ${address.area ? address.area + ', ' : ''}${address.city}
                    ${address.landmark ? '<br>Near ' + address.landmark : ''}
                </div>
                <div class="address-actions">
                    <button class="address-edit" onclick="window.auth.editAddress('${address.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="address-delete" onclick="window.auth.deleteAddress('${address.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Utility Methods
    showStep(stepId) {
        this.authSteps.forEach(step => {
            const element = document.getElementById(step);
            if (element) {
                element.style.display = step === stepId ? 'block' : 'none';
            }
        });
        this.currentStep = stepId;
    }

    setLoading(buttonId, isLoading) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        this.isLoading = isLoading;
        const btnText = button.querySelector('.btn-text');
        const btnLoading = button.querySelector('.btn-loading');

        if (btnText && btnLoading) {
            btnText.style.display = isLoading ? 'none' : 'block';
            btnLoading.style.display = isLoading ? 'block' : 'none';
        }

        button.disabled = isLoading;
    }

    validatePhoneNumber(phone) {
        const pakistaniPhoneRegex = /^(03[0-9]{9}|\+92[0-9]{10})$/;
        return pakistaniPhoneRegex.test(phone);
    }

    validateOTP(otp) {
        return /^[0-9]{6}$/.test(otp);
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showError(message) {
        // Create a toast notification for errors
        this.showToast(message, 'error');
    }

    showSuccess(message) {
        // Create a toast notification for success
        this.showToast(message, 'success');
    }

    showToast(message, type = 'success') {
        // Remove any existing toasts
        const existingToasts = document.querySelectorAll('.auth-toast');
        existingToasts.forEach(toast => toast.remove());

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `auth-toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add toast styles
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
            max-width: 300px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(toast);

        // Show toast with animation
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 4 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 4000);
    }

    completeAuthentication() {
        this.closeAuthModal();
        this.updateUI();
        this.showSuccess('Welcome! You are now signed in.');
    }

    resetAuthForms() {
        const forms = ['phoneForm', 'otpForm', 'detailsForm', 'addressForm'];
        forms.forEach(formId => {
            const form = document.getElementById(formId);
            if (form) form.reset();
        });
    }

    updateUI() {
        const profileNotSignedIn = document.getElementById('profileNotSignedIn');
        const profileSignedIn = document.getElementById('profileSignedIn');
        const profileName = document.getElementById('profileName');
        const profilePhone = document.getElementById('profilePhone');
        const profileEmail = document.getElementById('profileEmail');

        if (this.currentUser) {
            // Show signed in state
            if (profileNotSignedIn) profileNotSignedIn.style.display = 'none';
            if (profileSignedIn) profileSignedIn.style.display = 'block';
            
            // Update profile info
            if (profileName) profileName.textContent = this.currentUser.name || 'User';
            if (profilePhone) profilePhone.textContent = this.currentUser.phoneNumber;
            if (profileEmail) profileEmail.textContent = this.currentUser.email || 'No email provided';
        } else {
            // Show not signed in state
            if (profileNotSignedIn) profileNotSignedIn.style.display = 'block';
            if (profileSignedIn) profileSignedIn.style.display = 'none';
        }
    }

    // Storage Methods
    saveUserToStorage() {
        if (this.currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
    }

    loadUserFromStorage() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    signOut() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUI();
        this.closeProfile();
        this.showSuccess('You have been signed out');
    }

    // Additional Methods
    async resendOTP() {
        if (!this.currentPhoneNumber) return;
        
        try {
            const response = await fetch('/api/customer-auth/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phoneNumber: this.currentPhoneNumber,
                    purpose: this.currentUser ? 'login' : 'registration'
                })
            });

            if (response.ok) {
                this.showSuccess('OTP resent successfully');
            } else {
                this.showError('Failed to resend OTP');
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            this.showError('Network error. Please try again.');
        }
    }

    skipAddressStep() {
        this.completeAuthentication();
    }

    editProfile() {
        // TODO: Implement profile editing
        this.showError('Profile editing not implemented yet');
    }

    addAddress() {
        // TODO: Implement address addition
        this.showError('Adding new address not implemented yet');
    }

    editAddress(addressId) {
        // TODO: Implement address editing
        this.showError('Address editing not implemented yet');
    }

    async deleteAddress(addressId) {
        if (!confirm('Are you sure you want to delete this address?')) return;

        try {
            const response = await fetch('/api/customer-auth/addresses', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    addressId: addressId,
                    customerId: this.currentUser.id
                })
            });

            if (response.ok) {
                this.loadUserAddresses();
                this.showSuccess('Address deleted successfully');
            } else {
                this.showError('Failed to delete address');
            }
        } catch (error) {
            console.error('Delete address error:', error);
            this.showError('Network error. Please try again.');
        }
    }
}

// Initialize authentication manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.auth = new AuthenticationManager();
});