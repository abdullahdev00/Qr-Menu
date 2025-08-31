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
        
        // QR scan detection
        this.tableNumber = this.getTableFromURL();
        this.isQRScan = !!this.tableNumber;
        this.restaurantId = this.getRestaurantFromURL();
        
        this.init();
    }

    async init() {
        this.bindEvents();
        this.initializeLayout();
        this.handleQRScan(); // Handle QR scan first
        this.generateSkeletonCards();
        await this.loadMenuItems();
        this.renderMenuItems();
        this.updateFavoriteButtons();
        this.updateCategoryTabs();
    }

    bindEvents() {
        // Header events
        const searchToggle = document.getElementById('searchToggle');
        const cartToggle = document.getElementById('cartToggle');
        
        if (searchToggle) searchToggle.addEventListener('click', this.toggleSearch.bind(this));
        if (cartToggle) cartToggle.addEventListener('click', this.toggleCart.bind(this));

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

        // Escape key handling
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeFilterSidebar();
                this.closeSearch();
            }
        });

        // Scroll events
        window.addEventListener('scroll', this.handleScroll.bind(this));
    }

    // QR scan detection functions
    getTableFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('table');
    }

    getRestaurantFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('restaurant');
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
        const mobileSearchBar = document.getElementById('mobileSearchBar');
        if (!mobileSearchBar) return;
        
        const isActive = mobileSearchBar.classList.toggle('active');
        
        if (isActive) {
            setTimeout(() => {
                const mobileSearchInput = document.getElementById('mobileSearchInput');
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
        if (window.cart) {
            window.cart.toggle();
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
        if (window.scrollY > 100) {
            header.style.background = 'rgba(10, 10, 10, 0.98)';
        } else {
            header.style.background = 'rgba(10, 10, 10, 0.95)';
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