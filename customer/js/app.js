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
        
        this.init();
    }

    async init() {
        this.bindEvents();
        this.generateSkeletonCards();
        await this.loadMenuItems();
        this.renderMenuItems();
        this.updateFavoriteButtons();
        this.updateCategoryTabs();
    }

    bindEvents() {
        // Header events
        document.getElementById('searchToggle').addEventListener('click', this.toggleSearch.bind(this));
        document.getElementById('cartToggle').addEventListener('click', this.toggleCart.bind(this));

        // Search events (both desktop and mobile)
        const searchInput = document.getElementById('searchInput');
        const mobileSearchInput = document.getElementById('mobileSearchInput');
        
        searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
        mobileSearchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
        
        document.getElementById('searchClear').addEventListener('click', this.clearSearch.bind(this));
        document.getElementById('mobileSearchClear').addEventListener('click', this.clearSearch.bind(this));

        // Category events
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', this.handleCategoryChange.bind(this));
        });

        // Filter events
        document.getElementById('filterToggle').addEventListener('click', this.toggleFilterSidebar.bind(this));
        document.getElementById('sortSelect').addEventListener('change', this.handleSortChange.bind(this));

        // Filter sidebar events
        document.getElementById('filterClose').addEventListener('click', this.closeFilterSidebar.bind(this));
        document.getElementById('filterOverlay').addEventListener('click', this.closeFilterSidebar.bind(this));
        document.getElementById('applyFilters').addEventListener('click', this.applyFilters.bind(this));
        document.getElementById('resetFilters').addEventListener('click', this.resetFilters.bind(this));

        // Modal events
        document.getElementById('modalClose').addEventListener('click', this.closeModal.bind(this));
        document.getElementById('modalOverlay').addEventListener('click', this.closeModal.bind(this));

        // Load more
        document.getElementById('loadMoreBtn').addEventListener('click', this.loadMoreItems.bind(this));

        // Clear filters
        document.getElementById('clearFiltersBtn').addEventListener('click', this.clearAllFilters.bind(this));

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

    async loadMenuItems() {
        try {
            // Fetch menu data from API
            const response = await fetch('/api/customer/menu');
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
        const skeletonCount = window.innerWidth < 768 ? 4 : 8;
        
        for (let i = 0; i < skeletonCount; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'skeleton-card';
            skeleton.innerHTML = `
                <div class="skeleton-image"></div>
                <div class="skeleton-content">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line short"></div>
                    <div class="skeleton-line medium"></div>
                    <div class="skeleton-line"></div>
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
        
        itemDiv.innerHTML = `
            <div class="item-image">
                <img src="${item.image}" alt="${item.name}" loading="lazy">
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
                <div class="item-rating">
                    <div class="stars">
                        ${this.generateStars(item.rating)}
                    </div>
                    <span>(${item.rating}) • ${item.reviewsCount} reviews</span>
                </div>
                <p class="item-description" data-testid="text-item-description-${item.id}">${item.description}</p>
                <div class="item-tags">
                    ${item.dietary.map(tag => `
                        <span class="tag ${tag}">${this.getDietaryIcon(tag)} ${this.formatTag(tag)}</span>
                    `).join('')}
                    ${item.spiceLevel > 0 ? `
                        <span class="tag spicy">${'🌶️'.repeat(item.spiceLevel)} ${this.getSpiceText(item.spiceLevel)}</span>
                    ` : ''}
                    <span class="tag">⏱️ ${item.preparationTime}min</span>
                </div>
                <button class="add-to-cart" ${!item.availability ? 'disabled' : ''} 
                        data-id="${item.id}" data-testid="button-add-to-cart-${item.id}">
                    <i class="fas fa-plus"></i>
                    ${item.availability ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        `;

        // Add event listeners
        itemDiv.addEventListener('click', (e) => {
            if (!e.target.closest('.favorite-btn') && !e.target.closest('.add-to-cart')) {
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
        
        if (e.target.id === 'searchInput') {
            mobileInput.value = e.target.value;
        } else {
            desktopInput.value = e.target.value;
        }
        
        // Show/hide clear buttons
        const clearBtn = document.getElementById('searchClear');
        const mobileClearBtn = document.getElementById('mobileSearchClear');
        
        clearBtn.classList.toggle('visible', this.searchQuery.length > 0);
        mobileClearBtn.classList.toggle('visible', this.searchQuery.length > 0);
        
        this.filterItems();
        this.currentPage = 1;
        this.renderMenuItems();
    }

    clearSearch() {
        // Clear both search inputs
        document.getElementById('searchInput').value = '';
        document.getElementById('mobileSearchInput').value = '';
        
        // Hide both clear buttons
        document.getElementById('searchClear').classList.remove('visible');
        document.getElementById('mobileSearchClear').classList.remove('visible');
        
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
        document.getElementById('searchInput').value = '';
        document.getElementById('mobileSearchInput').value = '';
        document.getElementById('searchClear').classList.remove('visible');
        document.getElementById('mobileSearchClear').classList.remove('visible');
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-category') === 'all');
        });
        document.getElementById('sortSelect').value = 'popular';
        
        this.filterItems();
        this.currentPage = 1;
        this.renderMenuItems();
    }

    // UI Toggle Methods
    // Removed mobile menu functionality as hamburger menu is removed

    toggleSearch() {
        const mobileSearchBar = document.getElementById('mobileSearchBar');
        const isActive = mobileSearchBar.classList.toggle('active');
        
        if (isActive) {
            setTimeout(() => {
                document.getElementById('mobileSearchInput').focus();
            }, 300);
        }
    }

    closeSearch() {
        document.getElementById('mobileSearchBar').classList.remove('active');
    }

    toggleFilterSidebar() {
        const filterSidebar = document.getElementById('filterSidebar');
        filterSidebar.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeFilterSidebar() {
        const filterSidebar = document.getElementById('filterSidebar');
        filterSidebar.classList.remove('active');
        document.body.style.overflow = '';
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
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    createModalContent(item) {
        const defaultPrice = item.price.medium || item.price.small || Object.values(item.price)[0];
        
        return `
            <div class="modal-item">
                <div class="modal-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="modal-details">
                    <h2 data-testid="text-modal-item-name">${item.name}</h2>
                    <div class="modal-price" data-testid="text-modal-item-price">₨${defaultPrice.toFixed(0)}</div>
                    <div class="modal-rating">
                        <div class="stars">${this.generateStars(item.rating)}</div>
                        <span>(${item.rating}) • ${item.reviewsCount} reviews</span>
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