// Main Application JavaScript
class MenuApp {
    constructor() {
        this.currentCategory = 'all';
        this.currentSort = 'popular';
        this.searchQuery = '';
        this.filters = {
            priceMin: 0,
            priceMax: 2000,
            dietary: [],
            spiceLevel: null,
            minRating: 0
        };
        this.menuItems = [];
        this.filteredItems = [];
        this.displayedItems = [];
        this.itemsPerPage = 20;
        this.currentPage = 1;
        this.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        this.categories = [];
        // Default to single-column which means multi-column grid on desktop (confusing naming)
        this.currentLayout = localStorage.getItem('menuLayout') || 'single-column';
        
        // Theme management
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        
        // QR scan detection (will be set asynchronously)
        this.tableNumber = null;
        this.isQRScan = false;
        this.restaurantId = this.getRestaurantFromURL();
        
        // Order history management
        this.orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        this.currentOrders = JSON.parse(localStorage.getItem('currentOrders') || '[]');
        
        // WebSocket connection for real-time updates
        this.websocket = null;
        this.customerId = this.getCustomerIdFromStorage();
        
        // Initialize bound event handlers
        this._boundToggleHandler = null;
        
        this.init();
    }

    async init() {
        this.initializeTheme(); // Initialize theme first
        this.bindEvents();
        this.initializeLayout();
        
        // Handle QR scan first (now async)
        this.tableNumber = await this.getTableFromURL();
        this.isQRScan = !!this.tableNumber;
        this.handleQRScan();
        
        // Load order history from localStorage at startup
        this.loadOrderHistoryFromStorage();
        
        this.generateSkeletonCards();
        await this.loadMenuItems();
        this.renderMenuItems();
        this.updateFavoriteButtons();
        this.updateCategoryTabs();
        this.updateOrderHistoryIcon();
        this.initializeWebSocket();
    }
    
    loadOrderHistoryFromStorage() {
        try {
            console.log('🔍 DEBUG - Loading order history from storage...');
            const storedHistory = localStorage.getItem('orderHistory');
            const storedCurrentOrders = localStorage.getItem('currentOrders');
            
            console.log('🔍 DEBUG - storedHistory raw:', storedHistory);
            console.log('🔍 DEBUG - storedCurrentOrders raw:', storedCurrentOrders);
            
            if (storedHistory) {
                this.orderHistory = JSON.parse(storedHistory);
                console.log('📋 Loaded order history from localStorage:', this.orderHistory.length, 'orders');
                console.log('📋 First order preview:', this.orderHistory[0]);
            } else {
                console.log('⚠️ No orderHistory found in localStorage');
                this.orderHistory = [];
            }
            
            if (storedCurrentOrders) {
                this.currentOrders = JSON.parse(storedCurrentOrders);
                console.log('📋 Loaded current orders from localStorage:', this.currentOrders.length, 'orders');
            } else {
                console.log('⚠️ No currentOrders found in localStorage');
                this.currentOrders = [];
            }
        } catch (error) {
            console.error('Error loading order history from storage:', error);
            this.orderHistory = [];
            this.currentOrders = [];
        }
    }

    bindEvents() {
        // Header events
        const searchToggle = document.getElementById('searchToggle');
        const cartToggle = document.getElementById('cartToggle');
        const themeToggle = document.getElementById('themeToggle');
        
        if (searchToggle) searchToggle.addEventListener('click', this.toggleSearch.bind(this));
        if (cartToggle) cartToggle.addEventListener('click', this.toggleCart.bind(this));
        if (themeToggle) themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        
        // Order history events
        const orderHistoryToggle = document.getElementById('orderHistoryToggle');
        if (orderHistoryToggle) orderHistoryToggle.addEventListener('click', this.toggleOrderHistory.bind(this));
        
        // Order history sidebar close events
        const orderHistoryCloseBtn = document.getElementById('orderHistorySidebarClose');
        const orderHistoryOverlayEl = document.getElementById('orderHistoryOverlay');
        if (orderHistoryCloseBtn) orderHistoryCloseBtn.addEventListener('click', this.closeOrderHistory.bind(this));
        if (orderHistoryOverlayEl) orderHistoryOverlayEl.addEventListener('click', this.closeOrderHistory.bind(this));

        // Search events (both desktop and mobile)
        const searchInput = document.getElementById('searchInput');
        const mobileSearchInput = document.getElementById('mobileSearchInput');
        
        if (searchInput) searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
        if (mobileSearchInput) mobileSearchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
        
        const searchClear = document.getElementById('searchClear');
        const mobileSearchClear = document.getElementById('mobileSearchClear');
        
        if (searchClear) searchClear.addEventListener('click', this.clearSearch.bind(this));
        if (mobileSearchClear) mobileSearchClear.addEventListener('click', this.clearSearch.bind(this));

        // Category events
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', this.handleCategoryChange.bind(this));
        });

        // Filter events
        const filterToggle = document.getElementById('filterToggle');
        const sortSelect = document.getElementById('sortSelect');
        
        if (filterToggle) filterToggle.addEventListener('click', this.toggleFilterSidebar.bind(this));
        if (sortSelect) sortSelect.addEventListener('change', this.handleSortChange.bind(this));

        // Filter sidebar events
        const filterClose = document.getElementById('filterClose');
        const filterOverlay = document.getElementById('filterOverlay');
        const applyFilters = document.getElementById('applyFilters');
        const resetFilters = document.getElementById('resetFilters');
        
        if (filterClose) filterClose.addEventListener('click', this.closeFilterSidebar.bind(this));
        if (filterOverlay) filterOverlay.addEventListener('click', this.closeFilterSidebar.bind(this));
        if (applyFilters) applyFilters.addEventListener('click', this.applyFilters.bind(this));
        if (resetFilters) resetFilters.addEventListener('click', this.resetFilters.bind(this));

        // Modal events
        const modalClose = document.getElementById('modalClose');
        const modalOverlay = document.getElementById('modalOverlay');
        
        if (modalClose) modalClose.addEventListener('click', this.closeModal.bind(this));
        if (modalOverlay) modalOverlay.addEventListener('click', this.closeModal.bind(this));

        // Load more
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) loadMoreBtn.addEventListener('click', this.loadMoreItems.bind(this));

        // Clear filters
        const clearFiltersBtn = document.getElementById('clearFiltersBtn');
        if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', this.clearAllFilters.bind(this));

        // Layout toggle
        const layoutToggle = document.getElementById('layoutToggle');
        if (layoutToggle) {
            layoutToggle.addEventListener('click', this.toggleLayout.bind(this));
        }

        // Order history modal events (if modal exists)
        const orderHistoryCloseModal = document.getElementById('orderHistoryModalClose');
        const orderHistoryOverlayModal = document.getElementById('orderHistoryOverlay');
        
        if (orderHistoryCloseModal) orderHistoryCloseModal.addEventListener('click', this.closeOrderHistory.bind(this));
        if (orderHistoryOverlayModal) orderHistoryOverlayModal.addEventListener('click', this.closeOrderHistory.bind(this));

        // Escape key handling
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeFilterSidebar();
                this.closeSearch();
                this.closeOrderHistory();
            }
        });

        // Scroll events
        window.addEventListener('scroll', this.handleScroll.bind(this));
    }

    // QR scan detection functions with secure decoding
    async getTableFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedTable = urlParams.get('t'); // Use 't' instead of 'table'
        const legacyTable = urlParams.get('table'); // Support legacy links temporarily
        
        if (encodedTable) {
            // Verify this encoded table is valid and QR code is active
            const isValid = await this.validateEncodedTable(encodedTable);
            if (isValid) {
                return isValid.tableNumber;
            } else {
                // Only show inactive message if there WAS a QR parameter but it was invalid/inactive
                this.showInactiveQRMessage();
                return null;
            }
        }
        
        // Legacy support - but show warning
        if (legacyTable) {
            console.warn('Legacy table parameter detected - please regenerate QR codes for security');
            return legacyTable;
        }
        
        // No QR parameters - this is normal browsing, don't show any error message
        return null;
    }
    
    async validateEncodedTable(encodedParam) {
        try {
            const response = await fetch('/api/customer/validate-table', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    encodedTable: encodedParam,
                    restaurantSlug: this.getRestaurantFromURL()
                })
            });
            
            const data = await response.json();
            return data.success ? data : null;
        } catch (error) {
            console.error('Error validating table:', error);
            return null;
        }
    }
    
    showInactiveQRMessage() {
        const body = document.body;
        const messageDiv = document.createElement('div');
        messageDiv.className = 'inactive-qr-message';
        messageDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                color: white;
                text-align: center;
                padding: 20px;
            ">
                <div style="max-width: 400px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #f39c12; margin-bottom: 20px;"></i>
                    <h2 style="margin-bottom: 15px;">QR Code Inactive</h2>
                    <p style="margin-bottom: 20px;">This QR code has been deactivated by the restaurant. Please ask staff for assistance or scan a different QR code.</p>
                    <button onclick="window.location.reload()" style="
                        background: #d4af37;
                        color: black;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-weight: bold;
                        cursor: pointer;
                    ">Try Again</button>
                </div>
            </div>
        `;
        body.appendChild(messageDiv);
    }

    getRestaurantFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const restaurantParam = urlParams.get('restaurant');
        if (restaurantParam) {
            return restaurantParam;
        }
        
        // Extract restaurant slug from URL path
        const path = window.location.pathname;
        const slug = path.split('/')[1];
        if (slug && slug !== 'customer' && slug !== '') {
            return slug; // Return slug which will be converted to ID by API
        }
        
        return null;
    }

    handleQRScan() {
        if (this.isQRScan) {
            // Hide profile button for QR scan users
            const profileToggle = document.getElementById('profileToggle');
            if (profileToggle) {
                profileToggle.style.display = 'none';
            }
            
            // Show table number indicator
            this.showTableIndicator();
            
            console.log(`QR Scan detected - Table: ${this.tableNumber}, Restaurant: ${this.restaurantId}`);
        }
    }

    showTableIndicator() {
        const header = document.querySelector('.header-container');
        if (header && this.tableNumber) {
            // Check if table indicator already exists
            const existingIndicator = header.querySelector('.table-indicator');
            if (existingIndicator) {
                return; // Don't create duplicate
            }
            
            const tableIndicator = document.createElement('div');
            tableIndicator.className = 'table-indicator';
            tableIndicator.innerHTML = `<i class="fas fa-table"></i> Table ${this.tableNumber}`;
            tableIndicator.style.cssText = `
                background: linear-gradient(135deg, #d4af37, #f7e98e);
                color: #000;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: 600;
                font-size: 14px;
                margin-right: 10px;
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            header.insertBefore(tableIndicator, header.querySelector('.header-actions'));
        }
    }

    async loadMenuItems() {
        try {
            // Extract restaurant slug from URL
            const path = window.location.pathname;
            const slug = path.split('/')[1]; // Get first part after /
            
            // Build API URL with restaurant slug
            let apiUrl = '/api/customer/menu';
            if (slug && slug !== 'customer' && slug !== '') {
                apiUrl += `?restaurantSlug=${slug}`;
            }
            
            // Fetch menu data from API
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (data.success && data.items) {
                this.categories = data.categories || [];
                this.menuItems = data.items.map(item => ({
                    id: item.id,
                    name: item.name,
                    category: item.category.toLowerCase().replace(/\s+/g, '-'),
                    subcategory: item.category,
                    description: item.description,
                    price: { small: item.price, medium: item.price * 1.25, large: item.price * 1.5 },
                    image: item.image,
                    images: item.images || [item.image],
                    rating: item.rating || 4.5,
                    reviewsCount: item.reviewsCount || 100,
                    preparationTime: item.preparationTime || 20,
                    dietary: item.isVegetarian ? ['vegetarian'] : item.isVegan ? ['vegan'] : [],
                    spiceLevel: item.spiceLevel || 1,
                    allergens: item.allergens || [],
                    calories: item.calories || 300,
                    availability: item.availability,
                    isSpecial: item.isSpecial || false,
                    tags: item.tags || []
                }));
                
                this.filteredItems = [...this.menuItems];
                this.sortItems();
            } else {
                // Fallback to sample data if API fails
                this.menuItems = this.generateSampleMenuItems();
                this.filteredItems = [...this.menuItems];
                this.sortItems();
            }
            
            // Hide loading state
            document.getElementById('loadingState').style.display = 'none';
        } catch (error) {
            console.error('Error loading menu items:', error);
            // Fallback to sample data
            this.menuItems = this.generateSampleMenuItems();
            this.filteredItems = [...this.menuItems];
            this.sortItems();
            document.getElementById('loadingState').style.display = 'none';
            this.showError('Failed to load menu items. Showing sample data.');
        }
    }

    generateSampleMenuItems() {
        return [
            {
                id: 'item-001',
                name: 'Chicken Tikka Masala',
                category: 'main-course',
                subcategory: 'indian',
                description: 'Tender chicken pieces in creamy tomato curry with aromatic spices',
                price: { small: 12.99, medium: 15.99, large: 18.99 },
                image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=225&fit=crop',
                rating: 4.2,
                reviewsCount: 89,
                preparationTime: 25,
                dietary: ['halal', 'dairy'],
                spiceLevel: 2,
                allergens: ['dairy'],
                calories: 420,
                availability: true,
                isSpecial: false,
                tags: ['spicy', 'popular']
            },
            {
                id: 'item-002',
                name: 'Margherita Pizza',
                category: 'main-course',
                subcategory: 'italian',
                description: 'Classic pizza with fresh mozzarella, tomatoes, and basil',
                price: { small: 10.99, medium: 13.99, large: 16.99 },
                image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=225&fit=crop',
                rating: 4.5,
                reviewsCount: 156,
                preparationTime: 20,
                dietary: ['vegetarian', 'dairy'],
                spiceLevel: 0,
                allergens: ['gluten', 'dairy'],
                calories: 350,
                availability: true,
                isSpecial: false,
                tags: ['vegetarian', 'classic']
            },
            {
                id: 'item-003',
                name: 'Caesar Salad',
                category: 'appetizers',
                subcategory: 'salads',
                description: 'Crisp romaine lettuce with parmesan cheese and croutons',
                price: { small: 8.99, medium: 11.99, large: 14.99 },
                image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=225&fit=crop',
                rating: 4.0,
                reviewsCount: 67,
                preparationTime: 10,
                dietary: ['vegetarian', 'dairy'],
                spiceLevel: 0,
                allergens: ['dairy', 'gluten'],
                calories: 180,
                availability: true,
                isSpecial: false,
                tags: ['healthy', 'vegetarian']
            },
            {
                id: 'item-004',
                name: 'Beef Burger Deluxe',
                category: 'fast-food',
                subcategory: 'burgers',
                description: 'Juicy beef patty with cheese, lettuce, tomato, and special sauce',
                price: { small: 11.99, medium: 14.99, large: 17.99 },
                image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=225&fit=crop',
                rating: 4.3,
                reviewsCount: 124,
                preparationTime: 15,
                dietary: ['dairy'],
                spiceLevel: 1,
                allergens: ['gluten', 'dairy'],
                calories: 650,
                availability: true,
                isSpecial: true,
                tags: ['popular', 'hearty']
            },
            {
                id: 'item-005',
                name: 'Chocolate Lava Cake',
                category: 'desserts',
                subcategory: 'cakes',
                description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
                price: { small: 6.99, medium: 8.99, large: 10.99 },
                image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=225&fit=crop',
                rating: 4.7,
                reviewsCount: 203,
                preparationTime: 20,
                dietary: ['vegetarian', 'dairy'],
                spiceLevel: 0,
                allergens: ['gluten', 'dairy', 'eggs'],
                calories: 480,
                availability: true,
                isSpecial: false,
                tags: ['sweet', 'indulgent']
            },
            {
                id: 'item-006',
                name: 'Green Tea',
                category: 'beverages',
                subcategory: 'hot-drinks',
                description: 'Premium loose leaf green tea with antioxidants',
                price: { small: 2.99, medium: 3.99, large: 4.99 },
                image: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=400&h=225&fit=crop',
                rating: 4.1,
                reviewsCount: 45,
                preparationTime: 5,
                dietary: ['vegan', 'caffeine'],
                spiceLevel: 0,
                allergens: [],
                calories: 2,
                availability: true,
                isSpecial: false,
                tags: ['healthy', 'vegan']
            },
            {
                id: 'item-007',
                name: 'Kung Pao Chicken',
                category: 'chinese',
                subcategory: 'stir-fry',
                description: 'Spicy stir-fried chicken with peanuts and vegetables in savory sauce',
                price: { small: 13.99, medium: 16.99, large: 19.99 },
                image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=225&fit=crop',
                rating: 4.4,
                reviewsCount: 98,
                preparationTime: 18,
                dietary: ['nuts'],
                spiceLevel: 3,
                allergens: ['nuts', 'soy'],
                calories: 380,
                availability: true,
                isSpecial: false,
                tags: ['spicy', 'nuts']
            },
            {
                id: 'item-008',
                name: 'Grilled Salmon',
                category: 'special',
                subcategory: 'seafood',
                description: 'Fresh Atlantic salmon grilled to perfection with herbs and lemon',
                price: { small: 18.99, medium: 22.99, large: 26.99 },
                image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=225&fit=crop',
                rating: 4.6,
                reviewsCount: 187,
                preparationTime: 25,
                dietary: ['fish', 'gluten-free'],
                spiceLevel: 0,
                allergens: ['fish'],
                calories: 340,
                availability: true,
                isSpecial: true,
                tags: ['healthy', 'premium']
            }
        ];
    }

    generateSkeletonCards() {
        const skeletonContainer = document.querySelector('.skeleton-cards');
        if (!skeletonContainer) return;
        
        // Clear existing skeletons
        skeletonContainer.innerHTML = '';
        
        // Apply exact same layout classes as menu-grid
        skeletonContainer.className = `skeleton-cards menu-grid ${this.currentLayout}`;
        
        // Determine skeleton count based on layout and screen size
        let skeletonCount;
        if (window.innerWidth < 768) {
            skeletonCount = 6; // Mobile always single column
        } else {
            skeletonCount = this.currentLayout === 'double-column' ? 8 : 6;
        }
        
        for (let i = 0; i < skeletonCount; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'skeleton-card';
            skeleton.innerHTML = `
                <div class="skeleton-image"></div>
                <div class="skeleton-content">
                    <div class="skeleton-line title"></div>
                    <div class="skeleton-line price"></div>
                    <div class="skeleton-line description"></div>
                    <div class="skeleton-line button"></div>
                </div>
            `;
            skeletonContainer.appendChild(skeleton);
        }
    }

    renderMenuItems() {
        const menuGrid = document.getElementById('menuGrid');
        const itemsToShow = this.filteredItems.slice(0, this.currentPage * this.itemsPerPage);
        
        if (itemsToShow.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();
        menuGrid.innerHTML = '';
        
        itemsToShow.forEach((item, index) => {
            const itemElement = this.createMenuItemElement(item);
            itemElement.style.animationDelay = `${index * 50}ms`;
            itemElement.classList.add('fade-in');
            menuGrid.appendChild(itemElement);
        });

        this.updateLoadMoreButton();
        this.displayedItems = itemsToShow;
    }

    createMenuItemElement(item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = `menu-item ${!item.availability ? 'out-of-stock' : ''}`;
        itemDiv.setAttribute('data-testid', `card-menu-item-${item.id}`);
        
        const isFavorite = this.favorites.includes(item.id);
        const defaultPrice = item.price.medium || item.price.small || Object.values(item.price)[0];
        
        // Truncate description to approximately one line (50 characters)
        const truncatedDescription = item.description.length > 50 
            ? item.description.substring(0, 50) + '...' 
            : item.description;

        // Create image carousel HTML
        const allImages = [];
        if (item.images && item.images.length > 0) {
            allImages.push(...item.images);
        }
        if (item.image && !allImages.includes(item.image)) {
            allImages.push(item.image);
        }
        
        let imageHTML = '';
        if (allImages.length === 0) {
            imageHTML = '<div class="placeholder-image"><i class="fas fa-image"></i></div>';
        } else if (allImages.length === 1) {
            imageHTML = `<img src="${allImages[0]}" alt="${item.name}" loading="lazy">`;
        } else {
            imageHTML = `
                <div class="carousel-container" data-carousel-id="${item.id}">
                    <div class="carousel-images">
                        ${allImages.map((img, index) => `
                            <img src="${img}" alt="${item.name} - Image ${index + 1}" 
                                 loading="lazy" class="${index === 0 ? 'active' : ''}" 
                                 data-index="${index}">
                        `).join('')}
                    </div>
                    <button class="carousel-btn prev" data-testid="button-carousel-prev-${item.id}">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="carousel-btn next" data-testid="button-carousel-next-${item.id}">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <div class="carousel-dots">
                        ${allImages.map((_, index) => `
                            <span class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        itemDiv.innerHTML = `
            <div class="item-image">
                ${imageHTML}
                ${item.isSpecial ? '<div class="item-badge special">Chef\'s Special</div>' : ''}
                ${!item.availability ? '<div class="item-badge">Out of Stock</div>' : ''}
                <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${item.id}" data-testid="button-favorite-${item.id}">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="item-content">
                <div class="item-header">
                    <h3 class="item-name" data-testid="text-item-name-${item.id}">${item.name}</h3>
                    <span class="item-price" data-testid="text-item-price-${item.id}">₨${defaultPrice.toFixed(0)}</span>
                </div>
                <p class="item-description" data-testid="text-item-description-${item.id}">${truncatedDescription}</p>
                <button class="add-to-cart" ${!item.availability ? 'disabled' : ''} 
                        data-id="${item.id}" data-testid="button-add-to-cart-${item.id}">
                    <i class="fas fa-plus"></i>
                    ${item.availability ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        `;

        // Add event listeners
        itemDiv.addEventListener('click', (e) => {
            if (!e.target.closest('.favorite-btn') && !e.target.closest('.add-to-cart') && 
                !e.target.closest('.carousel-btn') && !e.target.closest('.carousel-dots')) {
                this.openItemModal(item);
            }
        });

        const favoriteBtn = itemDiv.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFavorite(item.id);
        });

        const addToCartBtn = itemDiv.querySelector('.add-to-cart');
        if (item.availability) {
            addToCartBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.addToCart(item);
            });
        }

        // Add carousel event listeners
        this.addCarouselEventListeners(itemDiv, item.id);

        return itemDiv;
    }

    generateStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star star"></i>';
            } else if (i - 0.5 <= rating) {
                stars += '<i class="fas fa-star-half-alt star"></i>';
            } else {
                stars += '<i class="fas fa-star star empty"></i>';
            }
        }
        return stars;
    }

    getDietaryIcon(tag) {
        const icons = {
            'vegan': '🌱',
            'vegetarian': '🥬',
            'halal': '☪️',
            'gluten-free': '🌾',
            'dairy': '🥛',
            'nuts': '🥜',
            'fish': '🐟',
            'caffeine': '☕'
        };
        return icons[tag] || '';
    }

    formatTag(tag) {
        return tag.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    getSpiceText(level) {
        const texts = ['', 'Mild', 'Medium', 'Hot'];
        return texts[level] || 'Hot';
    }

    toggleFavorite(itemId) {
        const index = this.favorites.indexOf(itemId);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(itemId);
        }
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.updateFavoriteButtons();
    }

    updateFavoriteButtons() {
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const itemId = btn.getAttribute('data-id');
            const isFavorite = this.favorites.includes(itemId);
            btn.classList.toggle('active', isFavorite);
        });
    }

    addToCart(item) {
        // This will be handled by cart.js
        if (window.cart) {
            window.cart.addItem(item);
            this.showToast(`${item.name} added to cart`);
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--accent-gold);
            color: var(--primary-dark);
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            animation: slideUp 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    handleCategoryChange(e) {
        const category = e.target.getAttribute('data-category');
        this.currentCategory = category;
        
        // Update active state
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        e.target.classList.add('active');
        
        this.filterItems();
        this.currentPage = 1;
        this.renderMenuItems();
    }

    handleSearch(e) {
        this.searchQuery = e.target.value.toLowerCase();
        
        // Update both search inputs to keep them in sync
        const desktopInput = document.getElementById('searchInput');
        const mobileInput = document.getElementById('mobileSearchInput');
        
        if (e.target.id === 'searchInput' && mobileInput) {
            mobileInput.value = e.target.value;
        } else if (desktopInput) {
            desktopInput.value = e.target.value;
        }
        
        // Show/hide clear buttons
        const clearBtn = document.getElementById('searchClear');
        const mobileClearBtn = document.getElementById('mobileSearchClear');
        
        if (clearBtn) clearBtn.classList.toggle('visible', this.searchQuery.length > 0);
        if (mobileClearBtn) mobileClearBtn.classList.toggle('visible', this.searchQuery.length > 0);
        
        this.filterItems();
        this.currentPage = 1;
        this.renderMenuItems();
    }

    clearSearch() {
        // Clear both search inputs
        const searchInput = document.getElementById('searchInput');
        const mobileSearchInput = document.getElementById('mobileSearchInput');
        const searchClear = document.getElementById('searchClear');
        const mobileSearchClear = document.getElementById('mobileSearchClear');
        
        if (searchInput) searchInput.value = '';
        if (mobileSearchInput) mobileSearchInput.value = '';
        
        // Hide both clear buttons
        if (searchClear) searchClear.classList.remove('visible');
        if (mobileSearchClear) mobileSearchClear.classList.remove('visible');
        
        this.searchQuery = '';
        this.filterItems();
        this.currentPage = 1;
        this.renderMenuItems();
    }

    handleSortChange(e) {
        this.currentSort = e.target.value;
        this.sortItems();
        this.renderMenuItems();
    }

    filterItems() {
        this.filteredItems = this.menuItems.filter(item => {
            // Category filter
            if (this.currentCategory !== 'all' && item.category !== this.currentCategory) {
                return false;
            }
            
            // Search filter
            if (this.searchQuery && !item.name.toLowerCase().includes(this.searchQuery) && 
                !item.description.toLowerCase().includes(this.searchQuery)) {
                return false;
            }
            
            // Price filter
            const itemPrice = item.price.medium || item.price.small || Object.values(item.price)[0];
            if (itemPrice < this.filters.priceMin || itemPrice > this.filters.priceMax) {
                return false;
            }
            
            // Dietary filters
            if (this.filters.dietary.length > 0) {
                const hasMatchingDietary = this.filters.dietary.some(diet => 
                    item.dietary.includes(diet) || 
                    (diet === 'gluten-free' && !item.allergens.includes('gluten'))
                );
                if (!hasMatchingDietary) return false;
            }
            
            // Spice level filter
            if (this.filters.spiceLevel !== null && item.spiceLevel !== this.filters.spiceLevel) {
                return false;
            }
            
            // Rating filter
            if (item.rating < this.filters.minRating) {
                return false;
            }
            
            return true;
        });
        
        this.sortItems();
    }

    sortItems() {
        this.filteredItems.sort((a, b) => {
            const aPrice = a.price.medium || a.price.small || Object.values(a.price)[0];
            const bPrice = b.price.medium || b.price.small || Object.values(b.price)[0];
            
            switch (this.currentSort) {
                case 'price-low':
                    return aPrice - bPrice;
                case 'price-high':
                    return bPrice - aPrice;
                case 'rating':
                    return b.rating - a.rating;
                case 'time':
                    return a.preparationTime - b.preparationTime;
                case 'popular':
                default:
                    return b.reviewsCount - a.reviewsCount;
            }
        });
    }

    loadMoreItems() {
        this.currentPage++;
        this.renderMenuItems();
    }

    updateLoadMoreButton() {
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        const hasMoreItems = this.filteredItems.length > this.currentPage * this.itemsPerPage;
        loadMoreContainer.style.display = hasMoreItems ? 'block' : 'none';
    }

    showEmptyState() {
        document.getElementById('emptyState').style.display = 'block';
        document.getElementById('menuGrid').style.display = 'none';
        document.getElementById('loadMoreContainer').style.display = 'none';
    }

    hideEmptyState() {
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('menuGrid').style.display = 'grid';
    }

    clearAllFilters() {
        this.filters = {
            priceMin: 0,
            priceMax: 2000,
            dietary: [],
            spiceLevel: null,
            minRating: 0
        };
        this.searchQuery = '';
        this.currentCategory = 'all';
        
        // Reset UI
        const searchInput = document.getElementById('searchInput');
        const mobileSearchInput = document.getElementById('mobileSearchInput');
        const searchClear = document.getElementById('searchClear');
        const mobileSearchClear = document.getElementById('mobileSearchClear');
        const sortSelect = document.getElementById('sortSelect');
        
        if (searchInput) searchInput.value = '';
        if (mobileSearchInput) mobileSearchInput.value = '';
        if (searchClear) searchClear.classList.remove('visible');
        if (mobileSearchClear) mobileSearchClear.classList.remove('visible');
        
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-category') === 'all');
        });
        
        if (sortSelect) sortSelect.value = 'popular';
        
        this.filterItems();
        this.currentPage = 1;
        this.renderMenuItems();
    }

    // UI Toggle Methods
    // Removed mobile menu functionality as hamburger menu is removed

    toggleSearch() {
        console.log('Toggle search clicked!', 'app.js:883');
        const mobileSearchBar = document.getElementById('mobileSearchBar');
        console.log('Mobile search bar element found:', !!mobileSearchBar, 'app.js:885');
        
        if (!mobileSearchBar) {
            console.error('Mobile search bar element not found!', 'app.js:887');
            return;
        }
        
        const isActive = mobileSearchBar.classList.toggle('active');
        console.log('Search bar is now active:', isActive, 'app.js:892');
        
        if (isActive) {
            setTimeout(() => {
                const mobileSearchInput = document.getElementById('mobileSearchInput');
                console.log('Mobile search input found:', !!mobileSearchInput, 'app.js:896');
                if (mobileSearchInput) mobileSearchInput.focus();
            }, 300);
        }
    }

    closeSearch() {
        const mobileSearchBar = document.getElementById('mobileSearchBar');
        if (mobileSearchBar) mobileSearchBar.classList.remove('active');
    }

    toggleFilterSidebar() {
        const filterSidebar = document.getElementById('filterSidebar');
        if (filterSidebar) {
            filterSidebar.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeFilterSidebar() {
        const filterSidebar = document.getElementById('filterSidebar');
        if (filterSidebar) {
            filterSidebar.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    toggleCart() {
        if (window.cart && window.cart.toggle) {
            window.cart.toggle();
        } else {
            console.error('Cart not initialized properly');
        }
    }

    applyFilters() {
        // Apply filter logic here (implemented in filters.js)
        this.closeFilterSidebar();
        this.filterItems();
        this.currentPage = 1;
        this.renderMenuItems();
    }

    resetFilters() {
        this.filters = {
            priceMin: 0,
            priceMax: 2000,
            dietary: [],
            spiceLevel: null,
            minRating: 0
        };
        // Reset filter UI elements
        this.filterItems();
        this.currentPage = 1;
        this.renderMenuItems();
    }

    openItemModal(item) {
        const modal = document.getElementById('itemModal');
        const modalBody = document.getElementById('modalBody');
        
        modalBody.innerHTML = this.createModalContent(item);
        
        // Add event listeners for modal buttons
        const favoriteBtn = modalBody.querySelector('.favorite-modal-btn');
        const addToCartBtn = modalBody.querySelector('.add-to-cart-modal');
        
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFavorite(item.id);
                // Update button text and state
                const isNowFavorite = this.favorites.includes(item.id);
                favoriteBtn.classList.toggle('active', isNowFavorite);
                favoriteBtn.innerHTML = `
                    <i class="fas fa-heart"></i>
                    ${isNowFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                `;
            });
        }
        
        if (addToCartBtn && item.availability) {
            addToCartBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.addToCart(item);
                this.closeModal();
            });
        }
        
        // Add carousel event listeners for modal
        this.addCarouselEventListeners(modalBody, `modal-${item.id}`);
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    createModalContent(item) {
        const defaultPrice = item.price.medium || item.price.small || Object.values(item.price)[0];
        
        return `
            <div class="modal-item">
                <div class="modal-image">
                    ${this.createModalImageCarousel(item)}
                </div>
                <div class="modal-details">
                    <h2 data-testid="text-modal-item-name">${item.name}</h2>
                    <div class="modal-price" data-testid="text-modal-item-price">₨${defaultPrice.toFixed(0)}</div>
                    <div class="modal-rating">
                        <div class="stars">${this.generateStars(item.rating)}</div>
                        <span>(${item.rating.toFixed(1)}) • ${item.reviewsCount} reviews</span>
                    </div>
                    <p class="modal-description">${item.description}</p>
                    
                    <div class="modal-info">
                        <div class="info-item">
                            <strong>Preparation Time:</strong> ${item.preparationTime} minutes
                        </div>
                        <div class="info-item">
                            <strong>Calories:</strong> ${item.calories}
                        </div>
                        ${item.allergens.length > 0 ? `
                            <div class="info-item">
                                <strong>Allergens:</strong> ${item.allergens.map(a => this.formatTag(a)).join(', ')}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn-secondary favorite-modal-btn ${this.favorites.includes(item.id) ? 'active' : ''}" 
                                data-id="${item.id}" data-testid="button-modal-favorite">
                            <i class="fas fa-heart"></i>
                            ${this.favorites.includes(item.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                        </button>
                        <button class="btn-primary add-to-cart-modal" 
                                data-id="${item.id}" data-testid="button-modal-add-to-cart"
                                ${!item.availability ? 'disabled' : ''}>
                            <i class="fas fa-plus"></i>
                            ${item.availability ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    createModalImageCarousel(item) {
        // Create modal image carousel HTML
        const allImages = [];
        if (item.images && item.images.length > 0) {
            allImages.push(...item.images);
        }
        if (item.image && !allImages.includes(item.image)) {
            allImages.push(item.image);
        }
        
        if (allImages.length === 0) {
            return '<div class="placeholder-image"><i class="fas fa-image"></i></div>';
        } else if (allImages.length === 1) {
            return `<img src="${allImages[0]}" alt="${item.name}">`;
        } else {
            return `
                <div class="modal-carousel-container" data-carousel-id="modal-${item.id}">
                    <div class="modal-carousel-images">
                        ${allImages.map((img, index) => `
                            <img src="${img}" alt="${item.name} - Image ${index + 1}" 
                                 class="${index === 0 ? 'active' : ''}" 
                                 data-index="${index}">
                        `).join('')}
                    </div>
                    <button class="modal-carousel-btn prev" data-testid="button-modal-carousel-prev-${item.id}">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="modal-carousel-btn next" data-testid="button-modal-carousel-next-${item.id}">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <div class="modal-carousel-dots">
                        ${allImages.map((_, index) => `
                            <span class="dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }

    addCarouselEventListeners(container, carouselId) {
        const carousel = container.querySelector(`[data-carousel-id="${carouselId}"]`);
        if (!carousel) return;

        const images = carousel.querySelectorAll('img');
        const prevBtn = carousel.querySelector('.carousel-btn.prev, .modal-carousel-btn.prev');
        const nextBtn = carousel.querySelector('.carousel-btn.next, .modal-carousel-btn.next');
        const dots = carousel.querySelectorAll('.dot');
        const counter = null; // Image counter removed

        if (images.length <= 1) return;

        let currentIndex = 0;

        const updateCarousel = (newIndex) => {
            // Remove active class from all images and dots
            images.forEach(img => img.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));

            // Add active class to current image and dot
            images[newIndex].classList.add('active');
            dots[newIndex].classList.add('active');

            // Counter functionality removed

            currentIndex = newIndex;
        };

        // Previous button
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const newIndex = (currentIndex - 1 + images.length) % images.length;
                updateCarousel(newIndex);
            });
        }

        // Next button
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const newIndex = (currentIndex + 1) % images.length;
                updateCarousel(newIndex);
            });
        }

        // Dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                updateCarousel(index);
            });
        });

        // Touch/Swipe support for mobile
        let startX = 0;
        let startY = 0;

        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        carousel.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;

            // Check if horizontal swipe is stronger than vertical
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swiped left - next image
                    const newIndex = (currentIndex + 1) % images.length;
                    updateCarousel(newIndex);
                } else {
                    // Swiped right - previous image
                    const newIndex = (currentIndex - 1 + images.length) % images.length;
                    updateCarousel(newIndex);
                }
            }

            startX = 0;
            startY = 0;
        });
    }

    closeModal() {
        document.getElementById('itemModal').classList.remove('active');
        document.body.style.overflow = '';
    }

    handleScroll() {
        const header = document.getElementById('header');
        const currentTheme = document.documentElement.getAttribute('data-theme');
        
        if (window.scrollY > 100) {
            if (currentTheme === 'light') {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
            } else {
                header.style.background = 'rgba(10, 10, 10, 0.98)';
            }
        } else {
            if (currentTheme === 'light') {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
            } else {
                header.style.background = 'rgba(10, 10, 10, 0.95)';
            }
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button class="retry-btn" onclick="location.reload()">Retry</button>
            </div>
        `;
        errorDiv.style.cssText = `
            position: fixed;
            top: 120px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--warning-red);
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            z-index: 10000;
            text-align: center;
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    updateCategoryTabs() {
        const categoryNav = document.querySelector('.category-nav .category-container');
        if (!categoryNav || this.categories.length === 0) return;

        // Keep the filter toggle and all items button
        const filterToggle = categoryNav.querySelector('.filter-toggle');
        const allItemsBtn = categoryNav.querySelector('[data-category="all"]');
        
        // Clear existing categories except filter toggle and all items
        categoryNav.innerHTML = '';
        categoryNav.appendChild(filterToggle);
        categoryNav.appendChild(allItemsBtn);

        // Add categories from API
        this.categories.forEach(category => {
            const categorySlug = category.name.toLowerCase().replace(/\s+/g, '-');
            const button = document.createElement('button');
            button.className = 'category-tab';
            button.setAttribute('data-category', categorySlug);
            button.setAttribute('data-testid', `button-category-${categorySlug}`);
            
            // Choose appropriate icon based on category name
            let icon = 'fas fa-utensils'; // default
            if (category.name.toLowerCase().includes('appetizer')) icon = 'fas fa-leaf';
            else if (category.name.toLowerCase().includes('main')) icon = 'fas fa-drumstick-bite';
            else if (category.name.toLowerCase().includes('dessert')) icon = 'fas fa-ice-cream';
            else if (category.name.toLowerCase().includes('beverage')) icon = 'fas fa-glass-water';
            
            button.innerHTML = `
                <i class="${icon}"></i>
                ${category.name}
            `;
            
            button.addEventListener('click', this.handleCategoryChange.bind(this));
            categoryNav.appendChild(button);
        });
    }
    
    initializeLayout() {
        const menuGrid = document.getElementById('menuGrid');
        if (menuGrid) {
            menuGrid.className = `menu-grid ${this.currentLayout}`;
        }
        
        // Update skeleton layout too
        const skeletonContainer = document.querySelector('.skeleton-cards');
        if (skeletonContainer) {
            skeletonContainer.className = `skeleton-cards menu-grid ${this.currentLayout}`;
        }
        
        const layoutToggle = document.getElementById('layoutToggle');
        if (layoutToggle) {
            const icon = layoutToggle.querySelector('i');
            if (this.currentLayout === 'single-column') {
                icon.className = 'fas fa-th';
                layoutToggle.setAttribute('title', 'Switch to 2 columns');
            } else {
                icon.className = 'fas fa-bars';
                layoutToggle.setAttribute('title', 'Switch to 1 column');
            }
        }
    }
    
    toggleLayout() {
        this.currentLayout = this.currentLayout === 'single-column' ? 'double-column' : 'single-column';
        localStorage.setItem('menuLayout', this.currentLayout);
        
        const menuGrid = document.getElementById('menuGrid');
        if (menuGrid) {
            menuGrid.className = `menu-grid ${this.currentLayout}`;
        }
        
        // Update skeleton layout too
        const skeletonContainer = document.querySelector('.skeleton-cards');
        if (skeletonContainer) {
            skeletonContainer.className = `skeleton-cards menu-grid ${this.currentLayout}`;
        }
        
        const layoutToggle = document.getElementById('layoutToggle');
        if (layoutToggle) {
            const icon = layoutToggle.querySelector('i');
            
            if (this.currentLayout === 'single-column') {
                icon.className = 'fas fa-th';
                layoutToggle.setAttribute('title', 'Switch to 2 columns');
            } else {
                icon.className = 'fas fa-bars';
                layoutToggle.setAttribute('title', 'Switch to 1 column');
            }
        }
    }

    // Theme Management Methods
    initializeTheme() {
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        // Update theme icon
        this.updateThemeIcon();
    }

    toggleTheme() {
        // Switch between light and dark themes
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        
        // Save to localStorage
        localStorage.setItem('theme', this.currentTheme);
        
        // Apply theme to document immediately and completely
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        document.body.setAttribute('data-theme', this.currentTheme);
        
        // Update theme icon
        this.updateThemeIcon();
        
        // Force update all theme-dependent elements
        this.updateHeaderTheme();
        
        // Add smooth transition effect
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
            // Ensure complete theme update
            this.updateHeaderTheme();
        }, 300);
    }

    updateThemeIcon() {
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            if (this.currentTheme === 'dark') {
                themeIcon.className = 'fas fa-sun'; // Show sun icon in dark mode (to switch to light)
            } else {
                themeIcon.className = 'fas fa-moon'; // Show moon icon in light mode (to switch to dark)
            }
        }
    }

    updateHeaderTheme() {
        // Force update header and navigation elements
        const header = document.getElementById('header');
        const categoryNav = document.getElementById('categoryNav');
        
        if (header) {
            header.setAttribute('data-theme', this.currentTheme);
            // Apply theme-specific styles immediately
            if (this.currentTheme === 'light') {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.borderBottom = '1px solid rgba(0, 0, 0, 0.1)';
            } else {
                header.style.background = 'rgba(10, 10, 10, 0.95)';
                header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
            }
        }
        if (categoryNav) {
            categoryNav.setAttribute('data-theme', this.currentTheme);
        }
        
        // Update all theme-dependent elements
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
            el.setAttribute('data-theme', this.currentTheme);
        });
        
        // Force reflow to apply theme changes immediately
        document.body.offsetHeight;
    }

    // Order History Management Methods
    toggleOrderHistory() {
        console.log('🔄 Toggle order history clicked');
        const sidebar = document.getElementById('orderHistorySidebar');
        console.log('📋 Sidebar element found:', !!sidebar);
        
        if (sidebar) {
            console.log('📋 Sidebar current classes:', sidebar.className);
            if (sidebar.classList.contains('active')) {
                console.log('📋 Closing order history');
                this.closeOrderHistory();
            } else {
                console.log('📋 Opening order history');
                this.openOrderHistory();
            }
        } else {
            console.error('❌ Order history sidebar element not found!');
        }
    }

    openOrderHistory() {
        console.log('🔽 Opening order history sidebar');
        const sidebar = document.getElementById('orderHistorySidebar');
        if (sidebar) {
            console.log('📋 Adding active class to sidebar');
            sidebar.classList.add('active');
            document.body.style.overflow = 'hidden';
            console.log('📋 Loading order history data');
            this.loadOrderHistory();
            console.log('✅ Order history sidebar opened');
        } else {
            console.error('❌ Sidebar element not found in openOrderHistory');
        }
    }

    closeOrderHistory() {
        const sidebar = document.getElementById('orderHistorySidebar');
        if (sidebar) {
            sidebar.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    updateOrderHistoryIcon() {
        const orderHistoryToggle = document.getElementById('orderHistoryToggle');
        const orderNotification = document.getElementById('orderNotification');
        
        console.log('🔄 Updating order history icon - orderHistory length:', this.orderHistory.length);
        console.log('🔍 DEBUG - Current orderHistory array:', this.orderHistory);
        console.log('🔍 DEBUG - localStorage orderHistory:', localStorage.getItem('orderHistory'));
        
        if (this.orderHistory.length > 0) {
            if (orderHistoryToggle) {
                orderHistoryToggle.style.display = 'flex';
                orderHistoryToggle.style.pointerEvents = 'auto';
                orderHistoryToggle.style.opacity = '1';
                
                // Remove existing event listeners to avoid duplicates
                const boundToggleHandler = this.toggleOrderHistory.bind(this);
                orderHistoryToggle.removeEventListener('click', this._boundToggleHandler);
                
                // Store bound handler for future removal
                this._boundToggleHandler = boundToggleHandler;
                
                // Add fresh event listener with proper binding
                orderHistoryToggle.addEventListener('click', boundToggleHandler);
                console.log('✅ Order history button event listener added with proper binding');
                console.log('✅ Order history button made visible and clickable');
            }
            
            // Show notification if there are active orders
            const activeOrders = this.currentOrders.filter(order => 
                ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
            );
            
            if (activeOrders.length > 0 && orderNotification) {
                orderNotification.style.display = 'block';
            }
        }
    }

    async loadOrderHistory() {
        const orderHistoryList = document.getElementById('orderHistoryList');
        const orderHistoryEmpty = document.getElementById('orderHistoryEmpty');
        
        console.log('🔄 Loading order history...');
        console.log('📋 Elements found - orderHistoryList:', !!orderHistoryList, 'orderHistoryEmpty:', !!orderHistoryEmpty);
        console.log('📋 Current orderHistory array:', this.orderHistory);
        console.log('📋 LocalStorage orderHistory:', localStorage.getItem('orderHistory'));
        // Simplified debug logging
        console.log('🔍 Order keys found:', Object.keys(localStorage).filter(key => key.includes('order')).length);
        
        // Always load from localStorage first (most reliable)
        try {
            const storedHistory = localStorage.getItem('orderHistory');
            if (storedHistory) {
                this.orderHistory = JSON.parse(storedHistory);
                console.log('✅ Loaded order history from localStorage:', this.orderHistory);
            } else {
                console.log('📋 No orderHistory in localStorage');
                this.orderHistory = [];
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            this.orderHistory = [];
        }
        
        // Try to fetch fresh data from API as well
        try {
            const customerId = this.getCustomerIdFromStorage();
            if (customerId) {
                const response = await fetch(`/api/customer/orders?customerId=${customerId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.orders && data.orders.length > 0) {
                        // Merge API data with localStorage data instead of overriding
                        const localStorageOrders = this.orderHistory;
                        const apiOrders = data.orders;
                        
                        // Combine and deduplicate orders based on order ID
                        const allOrders = [...localStorageOrders];
                        apiOrders.forEach(apiOrder => {
                            const existsInLocal = allOrders.find(localOrder => 
                                localOrder.id === apiOrder.id || localOrder.orderNumber === apiOrder.orderNumber
                            );
                            if (!existsInLocal) {
                                allOrders.unshift(apiOrder);
                            }
                        });
                        
                        this.orderHistory = allOrders;
                        localStorage.setItem('orderHistory', JSON.stringify(this.orderHistory));
                        console.log('✅ Merged order history from API and localStorage:', this.orderHistory);
                    } else {
                        console.log('📋 No orders from API, keeping localStorage data');
                    }
                } else {
                    console.log('📋 API request failed, keeping localStorage data');
                }
            } else {
                console.log('📋 No customer ID, keeping localStorage data');
            }
        } catch (error) {
            console.error('Error fetching from API:', error);
            console.log('📋 API error, keeping localStorage data');
            // Continue with localStorage data
        }
        
        console.log('📊 Final orderHistory length:', this.orderHistory.length);
        console.log('📊 Final orderHistory data:', this.orderHistory);
        
        if (this.orderHistory.length === 0) {
            console.log('📋 No orders found, showing empty state');
            if (orderHistoryEmpty) orderHistoryEmpty.style.display = 'flex';
            if (orderHistoryList) orderHistoryList.style.display = 'none';
            return;
        }
        
        console.log('📋 Displaying orders:', this.orderHistory.length);
        console.log('📋 First order structure:', this.orderHistory[0]);
        if (orderHistoryEmpty) {
            orderHistoryEmpty.style.display = 'none';
            orderHistoryEmpty.style.visibility = 'hidden';
            orderHistoryEmpty.style.opacity = '0';
            orderHistoryEmpty.style.position = 'absolute';
            orderHistoryEmpty.style.top = '-9999px';
            orderHistoryEmpty.classList.add('hidden');
            console.log('📋 Hidden empty state completely');
        }
        if (orderHistoryList) {
            orderHistoryList.style.display = 'flex';
            orderHistoryList.style.flexDirection = 'column';
            orderHistoryList.style.gap = 'var(--spacing-md)';
            const renderedHTML = this.orderHistory.map(order => this.renderOrderHistoryCard(order)).join('');
            console.log('📋 Rendered HTML length:', renderedHTML.length);
            console.log('📋 First 200 chars of HTML:', renderedHTML.substring(0, 200));
            orderHistoryList.innerHTML = renderedHTML;
            console.log('✅ Order history UI updated - HTML set to orderHistoryList');
            
            // Force a reflow to ensure styles are applied
            orderHistoryList.offsetHeight;
            
            // Apply styles to ensure visibility
            const orderItems = orderHistoryList.querySelectorAll('.order-history-item');
            console.log('📋 Order items rendered:', orderItems.length);
            orderItems.forEach((item) => {
                // Ensure order items are properly styled
                item.style.display = 'block';
                item.style.visibility = 'visible';
                item.style.opacity = '1';
            });
        } else {
            console.error('❌ orderHistoryList element not found!');
        }
    }

    renderOrderHistoryCard(order) {
        const statusClass = order.status.toLowerCase();
        const statusText = order.status.charAt(0).toUpperCase() + order.status.slice(1);
        const orderDate = new Date(order.createdAt).toLocaleDateString();
        const orderTime = new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const itemsCount = order.items.length;
        const firstItems = order.items.slice(0, 2).map(item => `${item.name} x${item.quantity}`).join(', ');
        const moreItems = itemsCount > 2 ? ` +${itemsCount - 2} more` : '';
        
        return `
            <div class="order-history-item" data-order-id="${order.id}" data-testid="order-card-${order.id}">
                <div class="order-header">
                    <h4>Order #${order.orderNumber || order.id.slice(-6)}</h4>
                    <div class="order-date">${orderDate} ${orderTime}</div>
                </div>
                <div class="order-status ${statusClass}">${statusText}</div>
                <div class="order-details">
                    ${order.tableNumber ? `<p><i class="fas fa-table"></i> Table ${order.tableNumber}</p>` : ''}
                    <p><i class="fas fa-clock"></i> ${order.estimatedTime} min</p>
                    <p><i class="fas fa-utensils"></i> ${itemsCount} items</p>
                </div>
                <div class="order-items-summary">
                    ${order.items.slice(0, 2).map(item => `
                        <span class="item-name">${item.name} x${item.quantity}</span>
                    `).join('')}
                    ${order.items.length > 2 ? `<span class="more-items">+${order.items.length - 2} more items</span>` : ''}
                </div>
                <div class="order-total">₨${order.total.toFixed(0)}</div>
                ${['pending', 'preparing', 'ready'].includes(order.status) ? 
                    `<div class="order-actions">
                        <button class="order-refresh-btn" onclick="window.menuApp.refreshOrderStatus('${order.id}')" data-testid="button-refresh-order-${order.id}">
                            <i class="fas fa-sync"></i> Refresh Status
                        </button>
                    </div>` : ''
                }
            </div>
        `;
    }

    addToOrderHistory(order) {
        console.log('➕ Adding order to history:', order);
        this.orderHistory.unshift(order);
        this.currentOrders.push(order);
        localStorage.setItem('orderHistory', JSON.stringify(this.orderHistory));
        localStorage.setItem('currentOrders', JSON.stringify(this.currentOrders));
        console.log('💾 Order history saved:', this.orderHistory.length, 'orders');
        console.log('📋 Order history array:', this.orderHistory);
        this.updateOrderHistoryIcon();
        console.log('✅ Order history icon updated');
    }

    updateOrderStatus(orderId, newStatus) {
        const historyOrder = this.orderHistory.find(o => o.id === orderId);
        if (historyOrder) {
            historyOrder.status = newStatus;
        }
        
        const currentOrder = this.currentOrders.find(o => o.id === orderId);
        if (currentOrder) {
            currentOrder.status = newStatus;
            if (['completed', 'cancelled'].includes(newStatus)) {
                this.currentOrders = this.currentOrders.filter(o => o.id !== orderId);
            }
        }
        
        localStorage.setItem('orderHistory', JSON.stringify(this.orderHistory));
        localStorage.setItem('currentOrders', JSON.stringify(this.currentOrders));
        this.updateOrderHistoryIcon();
        this.showOrderStatusNotification(orderId, newStatus);
    }

    showOrderStatusNotification(orderId, status) {
        const statusMessages = {
            confirmed: 'Order confirmed! Your food is being prepared.',
            preparing: 'Your order is being prepared.',
            ready: 'Your order is ready for pickup!',
            completed: 'Order completed. Enjoy your meal!',
            cancelled: 'Order has been cancelled.'
        };
        
        const message = statusMessages[status] || `Order status updated to ${status}`;
        console.log(`Order #${orderId.slice(-6)}: ${message}`);
    }

    // WebSocket Methods
    initializeWebSocket() {
        if (!this.customerId || !this.restaurantId) return;
        
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        this.websocket = new WebSocket(wsUrl);
        
        this.websocket.onopen = () => {
            console.log('🔌 Connected to WebSocket server');
            this.websocket.send(JSON.stringify({
                type: 'join-customer',
                customerId: this.customerId,
                restaurantId: this.restaurantId
            }));
        };
        
        this.websocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };
        
        this.websocket.onclose = () => {
            console.log('🔌 WebSocket connection closed');
            setTimeout(() => {
                this.initializeWebSocket();
            }, 5000);
        };
        
        this.websocket.onerror = (error) => {
            console.error('🔌 WebSocket error:', error);
        };
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'order-status-update':
                this.updateOrderStatus(data.data.orderId, data.data.status);
                // Refresh order history display if sidebar is open
                const sidebar = document.getElementById('orderHistorySidebar');
                if (sidebar && sidebar.classList.contains('active')) {
                    this.loadOrderHistory();
                }
                break;
            default:
                console.log('Unknown WebSocket message type:', data.type);
        }
    }

    async refreshOrderStatus(orderId) {
        try {
            const response = await fetch(`/api/customer/orders/${orderId}/status`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.updateOrderStatus(orderId, data.status);
                    this.loadOrderHistory(); // Refresh the display
                }
            }
        } catch (error) {
            console.error('Error refreshing order status:', error);
        }
    }

    getCustomerIdFromStorage() {
        let customerId = localStorage.getItem('customerId');
        if (!customerId) {
            customerId = 'customer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('customerId', customerId);
        }
        return customerId;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.menuApp = new MenuApp();
});

// Add CSS animations for toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            transform: translate(-50%, 100%);
            opacity: 0;
        }
        to {
            transform: translate(-50%, 0);
            opacity: 1;
        }
    }
    
    @keyframes slideDown {
        from {
            transform: translate(-50%, 0);
            opacity: 1;
        }
        to {
            transform: translate(-50%, 100%);
            opacity: 0;
        }
    }
    
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    
    .modal.active {
        opacity: 1;
        visibility: visible;
    }
    
    .modal-content {
        background: var(--card-background);
        border-radius: var(--radius-xl);
        width: 95%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        transform: scale(0.9);
        transition: transform 0.3s ease;
    }
    
    .modal.active .modal-content {
        transform: scale(1);
    }
    
    .modal-header {
        position: absolute;
        top: 16px;
        right: 16px;
        z-index: 1;
    }
    
    .modal-close {
        width: 40px;
        height: 40px;
        background: rgba(0, 0, 0, 0.5);
        border: none;
        border-radius: 50%;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition-fast);
    }
    
    .modal-close:hover {
        background: rgba(0, 0, 0, 0.8);
    }
    
    .modal-item {
        padding: 0;
    }
    
    .modal-image {
        height: 300px;
        overflow: hidden;
        border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    }
    
    .modal-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .modal-details {
        padding: var(--spacing-xl);
    }
    
    .modal-details h2 {
        font-size: 24px;
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
    }
    
    .modal-price {
        font-size: 20px;
        font-weight: 700;
        color: var(--accent-gold);
        margin-bottom: var(--spacing-md);
    }
    
    .modal-rating {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-lg);
        font-size: 14px;
        color: var(--text-secondary);
    }
    
    .modal-description {
        color: var(--text-secondary);
        line-height: 1.6;
        margin-bottom: var(--spacing-lg);
    }
    
    .modal-info {
        margin-bottom: var(--spacing-xl);
    }
    
    .info-item {
        margin-bottom: var(--spacing-sm);
        color: var(--text-secondary);
    }
    
    .info-item strong {
        color: var(--text-primary);
    }
    
    .modal-actions {
        display: flex;
        gap: var(--spacing-md);
    }
    
    .btn-primary, .btn-secondary {
        flex: 1;
        padding: var(--spacing-md);
        border: none;
        border-radius: var(--radius-lg);
        font-weight: 600;
        cursor: pointer;
        transition: var(--transition-fast);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-xs);
    }
    
    .btn-primary {
        background: var(--accent-gold);
        color: var(--primary-dark);
    }
    
    .btn-primary:hover {
        background: var(--accent-amber);
    }
    
    .btn-secondary {
        background: none;
        color: var(--text-primary);
        border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.1);
    }
    
    .btn-secondary.active {
        color: var(--warning-red);
        border-color: var(--warning-red);
    }
`;
document.head.appendChild(style);