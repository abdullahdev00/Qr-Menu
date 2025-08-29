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

        // Delete account button
        const deleteAccountBtn = document.getElementById('deleteAccountBtn');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', () => this.deleteAccount());
        }

        // Set password button
        const setPasswordBtn = document.getElementById('setPasswordBtn');
        if (setPasswordBtn) {
            setPasswordBtn.addEventListener('click', () => this.setPassword());
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
                // Show password login option for existing users
                this.showPasswordLogin();
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
        const passwordInput = document.getElementById('passwordInput');
        const confirmPasswordInput = document.getElementById('confirmPasswordInput');
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput ? passwordInput.value : '';
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

        if (!name) {
            this.showError('Please enter your name');
            return;
        }

        if (email && !this.validateEmail(email)) {
            this.showError('Please enter a valid email address');
            return;
        }

        // Validate password if provided
        if (password) {
            if (password.length < 6) {
                this.showError('Password must be at least 6 characters long');
                return;
            }

            if (password !== confirmPassword) {
                this.showError('Passwords do not match');
                return;
            }
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
                
                // If password was provided, set it
                if (password) {
                    try {
                        const passwordResponse = await fetch('/api/customer-auth/set-password', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                phoneNumber: this.currentPhoneNumber,
                                password: password,
                                confirmPassword: confirmPassword
                            })
                        });
                        
                        if (!passwordResponse.ok) {
                            console.error('Failed to set password during registration');
                        }
                    } catch (passwordError) {
                        console.error('Password setting error:', passwordError);
                    }
                }
                
                this.showStep('addressStep');
                this.showSuccess('Profile created successfully!');
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
        this.showPasswordLogin(); // Add password login option
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

    showPasswordLogin() {
        const phoneStep = document.getElementById('phoneStep');
        const currentPhoneDisplay = phoneStep.querySelector('p');
        currentPhoneDisplay.innerHTML = `Account found for <strong>${this.currentPhoneNumber}</strong>`;
        
        // Add password login option
        const existingPasswordOption = document.getElementById('passwordLoginOption');
        if (!existingPasswordOption) {
            const passwordOptionHtml = `
                <div id="passwordLoginOption" class="password-login-option">
                    <hr style="margin: var(--spacing-lg) 0; border: none; border-top: 1px solid rgba(255,255,255,0.1);">
                    <h4 style="color: var(--accent-gold); margin-bottom: var(--spacing-md);">Quick Login with Password</h4>
                    <form id="passwordLoginForm">
                        <div class="form-group">
                            <input type="password" id="quickPasswordInput" placeholder="Enter your password" data-testid="input-quick-password" required>
                        </div>
                        <button type="submit" class="auth-btn secondary" style="margin-bottom: var(--spacing-sm);" data-testid="button-password-login">
                            <span class="btn-text">Login with Password</span>
                            <div class="btn-loading" style="display: none;">
                                <div class="loading-spinner"></div>
                            </div>
                        </button>
                    </form>
                    <p style="color: var(--text-secondary); font-size: 0.85rem; text-align: center;">
                        Or continue with OTP verification below
                    </p>
                </div>
            `;
            
            const phoneForm = document.getElementById('phoneForm');
            phoneForm.insertAdjacentHTML('afterend', passwordOptionHtml);
            
            // Add event listener for password login
            document.getElementById('passwordLoginForm').addEventListener('submit', (e) => this.handlePasswordLogin(e));
        }
    }

    async handlePasswordLogin(e) {
        e.preventDefault();
        
        const passwordInput = document.getElementById('quickPasswordInput');
        const password = passwordInput.value;
        
        if (!password) {
            this.showError('Please enter your password');
            return;
        }
        
        try {
            const response = await fetch('/api/customer-auth/password-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phoneNumber: this.currentPhoneNumber,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentUser = data.user;
                this.saveUserToStorage();
                this.showSuccess('Welcome back! You are signed in.');
                this.completeAuthentication();
            } else {
                this.showError(data.error || 'Invalid password');
            }
        } catch (error) {
            console.error('Password login error:', error);
            this.showError('Network error. Please try again.');
        }
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

    // Address Management Methods
    async addAddress() {
        this.showAddAddressModal();
    }

    showAddAddressModal() {
        const modalHtml = `
            <div class="edit-modal" id="addAddressModal">
                <div class="modal-overlay" onclick="window.auth.closeAddressModal()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Add New Address</h3>
                        <button class="modal-close" onclick="window.auth.closeAddressModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="addAddressForm">
                            <div class="form-group">
                                <label for="addTitle">Address Title</label>
                                <input type="text" id="addTitle" placeholder="e.g., Home, Office" required>
                            </div>
                            <div class="form-group">
                                <label for="addAddressLine1">Address Line 1</label>
                                <input type="text" id="addAddressLine1" placeholder="Street address" required>
                            </div>
                            <div class="form-group">
                                <label for="addCity">City</label>
                                <input type="text" id="addCity" placeholder="City name" required>
                            </div>
                            <button type="submit" class="auth-btn primary">
                                <span class="btn-text">Add Address</span>
                                <div class="btn-loading" style="display: none;">
                                    <div class="loading-spinner"></div>
                                </div>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.getElementById('addAddressModal').style.display = 'flex';
        
        // Add form submit handler
        document.getElementById('addAddressForm').addEventListener('submit', (e) => this.handleAddAddressSubmit(e));
    }

    async handleAddAddressSubmit(e) {
        e.preventDefault();
        
        const addressTitle = document.getElementById('addTitle').value.trim();
        const addressLine1 = document.getElementById('addAddressLine1').value.trim();
        const city = document.getElementById('addCity').value.trim();

        try {
            const response = await fetch('/api/customer-auth/addresses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customerId: this.currentUser.id,
                    title: addressTitle,
                    addressLine1: addressLine1,
                    city: city,
                    isDefault: false
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.closeAddressModal();
                this.showSuccess('Address added successfully');
                this.loadUserAddresses(); // Refresh address list
            } else {
                this.showError(data.error || 'Failed to add address');
            }
        } catch (error) {
            console.error('Add address error:', error);
            this.showError('Network error. Please try again.');
        }
    }

    closeAddressModal() {
        const modal = document.getElementById('addAddressModal');
        if (modal) {
            modal.remove();
        }
    }

    async editAddress(addressId) {
        try {
            // Get current address data
            const response = await fetch(`/api/customer-auth/addresses?customerId=${this.currentUser.id}`);
            const data = await response.json();
            
            if (!response.ok) {
                this.showError('Failed to load address data');
                return;
            }

            const address = data.addresses.find(addr => addr.id === addressId);
            if (!address) {
                this.showError('Address not found');
                return;
            }

            // Prompt for new values
            const newTitle = prompt('Address Title:', address.title);
            if (newTitle === null) return; // User cancelled

            const newAddressLine1 = prompt('Address Line 1:', address.addressLine1);
            if (newAddressLine1 === null) return;

            const newCity = prompt('City:', address.city);
            if (newCity === null) return;

            // Update address
            const updateResponse = await fetch(`/api/customer-auth/addresses/${addressId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: newTitle,
                    addressLine1: newAddressLine1,
                    city: newCity
                })
            });

            const updateData = await updateResponse.json();

            if (updateResponse.ok) {
                this.showSuccess('Address updated successfully');
                this.loadUserAddresses(); // Refresh address list
            } else {
                this.showError(updateData.error || 'Failed to update address');
            }
        } catch (error) {
            console.error('Edit address error:', error);
            this.showError('Network error. Please try again.');
        }
    }

    async deleteAddress(addressId) {
        this.showConfirmDialog(
            'Delete Address', 
            'Are you sure you want to delete this address?', 
            () => this.confirmDeleteAddress(addressId)
        );
    }

    async confirmDeleteAddress(addressId) {

        try {
            const response = await fetch(`/api/customer-auth/addresses/${addressId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                this.showSuccess('Address deleted successfully');
                this.loadUserAddresses(); // Refresh address list
            } else {
                this.showError(data.error || 'Failed to delete address');
            }
        } catch (error) {
            console.error('Delete address error:', error);
            this.showError('Network error. Please try again.');
        }
    }

    async editProfile() {
        this.showEditProfileModal();
    }

    showEditProfileModal() {
        // Create edit profile modal
        const modalHtml = `
            <div class="edit-modal" id="editProfileModal">
                <div class="modal-overlay" onclick="window.auth.closeEditModal()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Edit Profile</h3>
                        <button class="modal-close" onclick="window.auth.closeEditModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="editProfileForm">
                            <div class="form-group">
                                <label for="editName">Full Name</label>
                                <input type="text" id="editName" value="${this.currentUser.name || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="editEmail">Email (Optional)</label>
                                <input type="email" id="editEmail" value="${this.currentUser.email || ''}">
                            </div>
                            <button type="submit" class="auth-btn primary">
                                <span class="btn-text">Update Profile</span>
                                <div class="btn-loading" style="display: none;">
                                    <div class="loading-spinner"></div>
                                </div>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.getElementById('editProfileModal').style.display = 'flex';
        
        // Add form submit handler
        document.getElementById('editProfileForm').addEventListener('submit', (e) => this.handleEditProfileSubmit(e));
    }

    async handleEditProfileSubmit(e) {
        e.preventDefault();
        
        const newName = document.getElementById('editName').value.trim();
        const newEmail = document.getElementById('editEmail').value.trim();

        // Validate email if provided
        if (newEmail && !this.validateEmail(newEmail)) {
            this.showError('Please enter a valid email address');
            return;
        }

        try {
            const response = await fetch('/api/customer-auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phoneNumber: this.currentUser.phoneNumber,
                    name: newName,
                    email: newEmail
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Update current user data
                this.currentUser = { ...this.currentUser, ...data.user };
                this.saveUserToStorage();
                this.updateUI();
                this.closeEditModal();
                this.showSuccess('Profile updated successfully');
            } else {
                this.showError(data.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Edit profile error:', error);
            this.showError('Network error. Please try again.');
        }
    }

    closeEditModal() {
        const modal = document.getElementById('editProfileModal');
        if (modal) {
            modal.remove();
        }
    }
    }

    async deleteAccount() {
        this.showConfirmDialog(
            'Delete Account', 
            'Are you sure you want to delete your account? This action cannot be undone.', 
            () => this.showDeleteConfirmation()
        );
    }

    showDeleteConfirmation() {
        const modalHtml = `
            <div class="edit-modal" id="deleteConfirmModal">
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Confirm Account Deletion</h3>
                    </div>
                    <div class="modal-body">
                        <p>Type <strong>DELETE</strong> to confirm:</p>
                        <input type="text" id="deleteConfirmInput" placeholder="Type DELETE">
                        <div class="modal-actions">
                            <button class="auth-btn danger" onclick="window.auth.confirmDeleteAccount()">
                                Delete Account
                            </button>
                            <button class="auth-btn secondary" onclick="window.auth.closeDeleteModal()">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.getElementById('deleteConfirmModal').style.display = 'flex';
    }

    async confirmDeleteAccount() {
        const confirmText = document.getElementById('deleteConfirmInput').value;
        if (confirmText !== 'DELETE') {
            this.showError('Please type DELETE to confirm');
            return;
        }

        this.closeDeleteModal();

        try {
            const response = await fetch('/api/customer-auth/profile', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phoneNumber: this.currentUser.phoneNumber
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.signOut();
                this.showSuccess('Account deleted successfully');
            } else {
                this.showError(data.error || 'Failed to delete account');
            }
        } catch (error) {
            console.error('Delete account error:', error);
            this.showError('Network error. Please try again.');
        }
    }

    // Password Authentication Methods
    async showPasswordLogin() {
        // Add password login option to phone step
        const phoneStep = document.getElementById('phoneStep');
        if (!phoneStep) return;

        // Check if password login form already exists
        if (document.getElementById('passwordLoginForm')) {
            document.getElementById('passwordLoginToggle').style.display = 'block';
            return;
        }

        // Add password login toggle
        const phoneForm = document.getElementById('phoneForm');
        if (phoneForm) {
            const passwordToggle = document.createElement('div');
            passwordToggle.id = 'passwordLoginToggle';
            passwordToggle.innerHTML = `
                <div style="text-align: center; margin: 15px 0;">
                    <button type="button" id="usePasswordBtn" style="
                        background: none;
                        border: 1px solid var(--accent-gold);
                        color: var(--accent-gold);
                        padding: 8px 16px;
                        border-radius: 6px;
                        font-size: 14px;
                        cursor: pointer;
                    ">Use Password Instead</button>
                </div>
            `;
            phoneForm.parentNode.appendChild(passwordToggle);

            // Add password login form
            const passwordForm = document.createElement('div');
            passwordForm.id = 'passwordLoginForm';
            passwordForm.style.display = 'none';
            passwordForm.innerHTML = `
                <form id="passwordForm">
                    <div class="form-group">
                        <label for="loginPhone">Phone Number</label>
                        <input type="tel" id="loginPhone" placeholder="03xxxxxxxxx or +92xxxxxxxxxx" required>
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">Password</label>
                        <input type="password" id="loginPassword" placeholder="Enter your password" required>
                    </div>
                    <button type="submit" id="passwordLoginBtn" class="auth-btn primary">
                        <span class="btn-text">Sign In</span>
                        <div class="btn-loading" style="display: none;">
                            <div class="loading-spinner"></div>
                        </div>
                    </button>
                    <div style="text-align: center; margin-top: 15px;">
                        <button type="button" id="backToOtpBtn" style="
                            background: none;
                            border: none;
                            color: var(--text-secondary);
                            font-size: 14px;
                            cursor: pointer;
                        ">Back to OTP Login</button>
                    </div>
                </form>
            `;
            phoneStep.appendChild(passwordForm);

            // Add event listeners
            document.getElementById('usePasswordBtn').addEventListener('click', () => {
                document.getElementById('phoneForm').style.display = 'none';
                document.getElementById('passwordLoginToggle').style.display = 'none';
                document.getElementById('passwordLoginForm').style.display = 'block';
            });

            document.getElementById('backToOtpBtn').addEventListener('click', () => {
                document.getElementById('phoneForm').style.display = 'block';
                document.getElementById('passwordLoginToggle').style.display = 'block';
                document.getElementById('passwordLoginForm').style.display = 'none';
            });

            document.getElementById('passwordForm').addEventListener('submit', (e) => this.handlePasswordLogin(e));
        }
    }

    async handlePasswordLogin(e) {
        e.preventDefault();
        
        const phone = document.getElementById('loginPhone').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!this.validatePhoneNumber(phone)) {
            this.showError('Please enter a valid Pakistani phone number');
            return;
        }

        if (!password) {
            this.showError('Please enter your password');
            return;
        }

        this.setLoading('passwordLoginBtn', true);

        try {
            const response = await fetch('/api/customer-auth/password-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phoneNumber: phone,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentUser = data.user;
                this.saveUserToStorage();
                this.completeAuthentication();
            } else {
                this.showError(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Password login error:', error);
            this.showError('Network error. Please try again.');
        } finally {
            this.setLoading('passwordLoginBtn', false);
        }
    }

    async setPassword() {
        if (!this.currentUser) {
            this.showError('Please sign in first');
            return;
        }

        this.showSetPasswordModal();
    }

    showSetPasswordModal() {
        const modalHtml = `
            <div class="edit-modal" id="setPasswordModal">
                <div class="modal-overlay" onclick="window.auth.closePasswordModal()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Set Password</h3>
                        <button class="modal-close" onclick="window.auth.closePasswordModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="setPasswordForm">
                            <div class="form-group">
                                <label for="newPassword">New Password</label>
                                <input type="password" id="newPassword" placeholder="Minimum 6 characters" required>
                            </div>
                            <div class="form-group">
                                <label for="confirmNewPassword">Confirm Password</label>
                                <input type="password" id="confirmNewPassword" placeholder="Re-enter password" required>
                            </div>
                            <button type="submit" class="auth-btn primary">
                                <span class="btn-text">Set Password</span>
                                <div class="btn-loading" style="display: none;">
                                    <div class="loading-spinner"></div>
                                </div>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.getElementById('setPasswordModal').style.display = 'flex';
        
        // Add form submit handler
        document.getElementById('setPasswordForm').addEventListener('submit', (e) => this.handleSetPasswordSubmit(e));
    }

    async handleSetPasswordSubmit(e) {
        e.preventDefault();
        
        const password = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmNewPassword').value;

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('/api/customer-auth/set-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phoneNumber: this.currentUser.phoneNumber,
                    password: password,
                    confirmPassword: confirmPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.closePasswordModal();
                this.showSuccess('Password set successfully! You can now login with your password.');
            } else {
                this.showError(data.error || 'Failed to set password');
            }
        } catch (error) {
            console.error('Set password error:', error);
            this.showError('Network error. Please try again.');
        }
    }

    closePasswordModal() {
        const modal = document.getElementById('setPasswordModal');
        if (modal) {
            modal.remove();
        }
    }

    closeDeleteModal() {
        const modal = document.getElementById('deleteConfirmModal');
        if (modal) {
            modal.remove();
        }
    }

    showConfirmDialog(title, message, onConfirm) {
        const modalHtml = `
            <div class="edit-modal" id="confirmDialog">
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${title}</h3>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                        <div class="modal-actions">
                            <button class="auth-btn danger" onclick="window.auth.confirmDialogAction()">
                                Yes
                            </button>
                            <button class="auth-btn secondary" onclick="window.auth.closeConfirmDialog()">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.confirmCallback = onConfirm;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.getElementById('confirmDialog').style.display = 'flex';
    }

    confirmDialogAction() {
        this.closeConfirmDialog();
        if (this.confirmCallback) {
            this.confirmCallback();
        }
    }

    closeConfirmDialog() {
        const modal = document.getElementById('confirmDialog');
        if (modal) {
            modal.remove();
        }
        this.confirmCallback = null;
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

    async editAddress(addressId) {
        try {
            // Get current address data
            const response = await fetch(`/api/customer-auth/addresses?customerId=${this.currentUser.id}`);
            const data = await response.json();
            
            if (!response.ok) {
                this.showError('Failed to load address data');
                return;
            }

            const address = data.addresses.find(addr => addr.id === addressId);
            if (!address) {
                this.showError('Address not found');
                return;
            }

            this.showEditAddressModal(address);
        } catch (error) {
            console.error('Edit address error:', error);
            this.showError('Network error. Please try again.');
        }
    }

    showEditAddressModal(address) {
        const modalHtml = `
            <div class="edit-modal" id="editAddressModal">
                <div class="modal-overlay" onclick="window.auth.closeEditAddressModal()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Edit Address</h3>
                        <button class="modal-close" onclick="window.auth.closeEditAddressModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="editAddressForm">
                            <div class="form-group">
                                <label for="editAddressTitle">Address Title</label>
                                <input type="text" id="editAddressTitle" value="${address.title}" required>
                            </div>
                            <div class="form-group">
                                <label for="editAddressLine1">Address Line 1</label>
                                <input type="text" id="editAddressLine1" value="${address.addressLine1}" required>
                            </div>
                            <div class="form-group">
                                <label for="editAddressCity">City</label>
                                <input type="text" id="editAddressCity" value="${address.city}" required>
                            </div>
                            <button type="submit" class="auth-btn primary">
                                <span class="btn-text">Update Address</span>
                                <div class="btn-loading" style="display: none;">
                                    <div class="loading-spinner"></div>
                                </div>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.getElementById('editAddressModal').style.display = 'flex';
        
        // Add form submit handler
        document.getElementById('editAddressForm').addEventListener('submit', (e) => this.handleEditAddressSubmit(e, address.id));
    }

    async handleEditAddressSubmit(e, addressId) {
        e.preventDefault();
        
        const title = document.getElementById('editAddressTitle').value.trim();
        const addressLine1 = document.getElementById('editAddressLine1').value.trim();
        const city = document.getElementById('editAddressCity').value.trim();

        try {
            const response = await fetch(`/api/customer-auth/addresses/${addressId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: title,
                    addressLine1: addressLine1,
                    city: city
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.closeEditAddressModal();
                this.showSuccess('Address updated successfully');
                this.loadUserAddresses(); // Refresh address list
            } else {
                this.showError(data.error || 'Failed to update address');
            }
        } catch (error) {
            console.error('Edit address error:', error);
            this.showError('Network error. Please try again.');
        }
    }

    closeEditAddressModal() {
        const modal = document.getElementById('editAddressModal');
        if (modal) {
            modal.remove();
        }
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