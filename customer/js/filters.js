// Advanced Filtering System
class FilterManager {
    constructor() {
        this.filters = {
            priceMin: 0,
            priceMax: 50,
            dietary: new Set(),
            spiceLevel: null,
            minRating: 0,
            availability: true
        };
        
        this.init();
    }

    init() {
        this.bindFilterEvents();
        this.initializePriceSliders();
        this.initializeRatingFilter();
    }

    bindFilterEvents() {
        // Price range sliders
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        
        if (priceMin && priceMax) {
            priceMin.addEventListener('input', this.handlePriceChange.bind(this));
            priceMax.addEventListener('input', this.handlePriceChange.bind(this));
        }

        // Dietary preference checkboxes
        document.querySelectorAll('[data-filter]').forEach(checkbox => {
            checkbox.addEventListener('change', this.handleDietaryChange.bind(this));
        });

        // Spice level buttons
        document.querySelectorAll('[data-spice]').forEach(button => {
            button.addEventListener('click', this.handleSpiceChange.bind(this));
        });

        // Rating filter
        document.querySelectorAll('[data-rating]').forEach(star => {
            star.addEventListener('click', this.handleRatingChange.bind(this));
            star.addEventListener('mouseenter', this.previewRating.bind(this));
        });

        document.querySelector('.star-rating').addEventListener('mouseleave', this.resetRatingPreview.bind(this));

        // Apply and reset buttons
        document.getElementById('applyFilters').addEventListener('click', this.applyFilters.bind(this));
        document.getElementById('resetFilters').addEventListener('click', this.resetAllFilters.bind(this));
    }

    initializePriceSliders() {
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        const priceMinValue = document.getElementById('priceMinValue');
        const priceMaxValue = document.getElementById('priceMaxValue');

        if (!priceMin || !priceMax) return;

        // Set initial values
        priceMinValue.textContent = priceMin.value;
        priceMaxValue.textContent = priceMax.value;

        // Ensure min doesn't exceed max and vice versa
        priceMin.addEventListener('input', () => {
            if (parseInt(priceMin.value) > parseInt(priceMax.value)) {
                priceMin.value = priceMax.value;
            }
            this.updatePriceSliderFill();
        });

        priceMax.addEventListener('input', () => {
            if (parseInt(priceMax.value) < parseInt(priceMin.value)) {
                priceMax.value = priceMin.value;
            }
            this.updatePriceSliderFill();
        });

        this.updatePriceSliderFill();
    }

    updatePriceSliderFill() {
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        
        if (!priceMin || !priceMax) return;

        const min = parseInt(priceMin.min);
        const max = parseInt(priceMin.max);
        const minVal = parseInt(priceMin.value);
        const maxVal = parseInt(priceMax.value);

        const minPercent = ((minVal - min) / (max - min)) * 100;
        const maxPercent = ((maxVal - min) / (max - min)) * 100;

        // Update visual fill between sliders
        const track = document.querySelector('.price-range::before');
        if (track) {
            track.style.left = minPercent + '%';
            track.style.width = (maxPercent - minPercent) + '%';
        }
    }

    initializeRatingFilter() {
        this.updateRatingDisplay(4); // Default to 4 stars
    }

    handlePriceChange() {
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        const priceMinValue = document.getElementById('priceMinValue');
        const priceMaxValue = document.getElementById('priceMaxValue');

        this.filters.priceMin = parseInt(priceMin.value);
        this.filters.priceMax = parseInt(priceMax.value);

        priceMinValue.textContent = priceMin.value;
        priceMaxValue.textContent = priceMax.value;

        this.updatePriceSliderFill();
        this.debounceApplyFilters();
    }

    handleDietaryChange(event) {
        const filterValue = event.target.getAttribute('data-filter');
        
        if (event.target.checked) {
            this.filters.dietary.add(filterValue);
        } else {
            this.filters.dietary.delete(filterValue);
        }

        this.debounceApplyFilters();
    }

    handleSpiceChange(event) {
        const spiceLevel = parseInt(event.target.getAttribute('data-spice'));
        
        // Toggle spice level selection
        if (this.filters.spiceLevel === spiceLevel) {
            this.filters.spiceLevel = null;
            event.target.classList.remove('active');
        } else {
            // Remove active from all spice buttons
            document.querySelectorAll('[data-spice]').forEach(btn => {
                btn.classList.remove('active');
            });
            
            this.filters.spiceLevel = spiceLevel;
            event.target.classList.add('active');
        }

        this.debounceApplyFilters();
    }

    handleRatingChange(event) {
        const rating = parseInt(event.target.getAttribute('data-rating'));
        this.filters.minRating = rating;
        this.updateRatingDisplay(rating);
        this.debounceApplyFilters();
    }

    previewRating(event) {
        const rating = parseInt(event.target.getAttribute('data-rating'));
        this.updateRatingStars(rating, true);
    }

    resetRatingPreview() {
        this.updateRatingStars(this.filters.minRating, false);
    }

    updateRatingDisplay(rating) {
        this.updateRatingStars(rating, false);
        document.getElementById('ratingValue').textContent = rating > 0 ? `${rating}.0 & up` : 'Any rating';
    }

    updateRatingStars(rating, isPreview) {
        document.querySelectorAll('[data-rating]').forEach((star, index) => {
            const starRating = index + 1;
            if (starRating <= rating) {
                star.classList.add(isPreview ? 'preview' : 'active');
                star.classList.remove(isPreview ? 'active' : 'preview');
            } else {
                star.classList.remove('active', 'preview');
            }
        });
    }

    applyFilters() {
        if (window.menuApp) {
            // Convert Set to Array for compatibility
            window.menuApp.filters = {
                ...this.filters,
                dietary: Array.from(this.filters.dietary)
            };
            
            window.menuApp.filterItems();
            window.menuApp.currentPage = 1;
            window.menuApp.renderMenuItems();
        }

        this.closeFilterDrawer();
        this.showFilterAppliedFeedback();
    }

    resetAllFilters() {
        // Reset filter values
        this.filters = {
            priceMin: 0,
            priceMax: 50,
            dietary: new Set(),
            spiceLevel: null,
            minRating: 0,
            availability: true
        };

        // Reset UI elements
        document.getElementById('priceMin').value = 0;
        document.getElementById('priceMax').value = 50;
        document.getElementById('priceMinValue').textContent = '0';
        document.getElementById('priceMaxValue').textContent = '50';
        
        // Reset checkboxes
        document.querySelectorAll('[data-filter]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Reset spice buttons
        document.querySelectorAll('[data-spice]').forEach(button => {
            button.classList.remove('active');
        });

        // Reset rating
        this.updateRatingDisplay(0);
        this.updatePriceSliderFill();

        // Apply reset filters
        this.applyFilters();
    }

    closeFilterDrawer() {
        document.getElementById('filterDrawer').classList.remove('active');
        document.body.style.overflow = '';
    }

    showFilterAppliedFeedback() {
        const activeFiltersCount = this.getActiveFiltersCount();
        
        if (activeFiltersCount > 0) {
            this.showToast(`${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} applied`);
            this.updateFilterBadge(activeFiltersCount);
        } else {
            this.showToast('Filters cleared');
            this.updateFilterBadge(0);
        }
    }

    getActiveFiltersCount() {
        let count = 0;
        
        // Price filters
        if (this.filters.priceMin > 0 || this.filters.priceMax < 50) count++;
        
        // Dietary filters
        if (this.filters.dietary.size > 0) count += this.filters.dietary.size;
        
        // Spice level
        if (this.filters.spiceLevel !== null) count++;
        
        // Rating
        if (this.filters.minRating > 0) count++;
        
        return count;
    }

    updateFilterBadge(count) {
        const filterToggle = document.getElementById('filterToggle');
        let badge = filterToggle.querySelector('.filter-badge');
        
        if (count > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'filter-badge';
                filterToggle.appendChild(badge);
            }
            badge.textContent = count;
            badge.style.display = 'flex';
        } else if (badge) {
            badge.style.display = 'none';
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'filter-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--accent-gold);
            color: var(--primary-dark);
            padding: 12px 20px;
            border-radius: 25px;
            font-weight: 500;
            font-size: 14px;
            z-index: 10000;
            animation: slideUp 0.3s ease;
            box-shadow: var(--shadow-lg);
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    debounceApplyFilters() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            // Only auto-apply if drawer is closed (for immediate feedback)
            if (!document.getElementById('filterDrawer').classList.contains('active')) {
                this.applyFilters();
            }
        }, 300);
    }

    // Quick filter methods for external use
    filterByCategory(category) {
        if (window.menuApp) {
            window.menuApp.currentCategory = category;
            window.menuApp.filterItems();
            window.menuApp.currentPage = 1;
            window.menuApp.renderMenuItems();
        }
    }

    filterByAvailability(availableOnly = true) {
        this.filters.availability = availableOnly;
        this.applyFilters();
    }

    clearPriceFilter() {
        this.filters.priceMin = 0;
        this.filters.priceMax = 50;
        document.getElementById('priceMin').value = 0;
        document.getElementById('priceMax').value = 50;
        document.getElementById('priceMinValue').textContent = '0';
        document.getElementById('priceMaxValue').textContent = '50';
        this.updatePriceSliderFill();
        this.applyFilters();
    }

    // Search suggestions based on current filters
    getSuggestedSearchTerms() {
        const suggestions = [];
        
        if (this.filters.dietary.has('vegan')) {
            suggestions.push('vegan options', 'plant-based', 'dairy-free');
        }
        
        if (this.filters.dietary.has('vegetarian')) {
            suggestions.push('vegetarian', 'meat-free');
        }
        
        if (this.filters.spiceLevel === 3) {
            suggestions.push('spicy', 'hot', 'chili');
        } else if (this.filters.spiceLevel === 1) {
            suggestions.push('mild', 'not spicy');
        }
        
        if (this.filters.priceMin === 0 && this.filters.priceMax <= 10) {
            suggestions.push('budget-friendly', 'affordable', 'cheap eats');
        }
        
        if (this.filters.minRating >= 4) {
            suggestions.push('highly rated', 'popular', 'customer favorites');
        }
        
        return suggestions.slice(0, 5); // Return max 5 suggestions
    }

    // Export current filter state
    exportFilters() {
        return {
            ...this.filters,
            dietary: Array.from(this.filters.dietary)
        };
    }

    // Import filter state
    importFilters(filterState) {
        this.filters = {
            ...filterState,
            dietary: new Set(filterState.dietary || [])
        };
        
        this.updateUIFromFilters();
        this.applyFilters();
    }

    updateUIFromFilters() {
        // Update price sliders
        document.getElementById('priceMin').value = this.filters.priceMin;
        document.getElementById('priceMax').value = this.filters.priceMax;
        document.getElementById('priceMinValue').textContent = this.filters.priceMin;
        document.getElementById('priceMaxValue').textContent = this.filters.priceMax;
        
        // Update dietary checkboxes
        document.querySelectorAll('[data-filter]').forEach(checkbox => {
            const filterValue = checkbox.getAttribute('data-filter');
            checkbox.checked = this.filters.dietary.has(filterValue);
        });
        
        // Update spice level
        document.querySelectorAll('[data-spice]').forEach(button => {
            const spiceLevel = parseInt(button.getAttribute('data-spice'));
            button.classList.toggle('active', this.filters.spiceLevel === spiceLevel);
        });
        
        // Update rating
        this.updateRatingDisplay(this.filters.minRating);
        this.updatePriceSliderFill();
    }
}

// Initialize filter manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.filterManager = new FilterManager();
});

// Add filter-specific CSS
const filterStyle = document.createElement('style');
filterStyle.textContent = `
    .filter-drawer {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    
    .filter-drawer.active {
        opacity: 1;
        visibility: visible;
    }
    
    .filter-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
    }
    
    .filter-content {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 100%;
        max-width: 350px;
        background: var(--card-background);
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        display: flex;
        flex-direction: column;
    }
    
    .filter-drawer.active .filter-content {
        transform: translateX(0);
    }
    
    .filter-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-lg);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .filter-header h3 {
        color: var(--text-primary);
        font-size: 20px;
        font-weight: 600;
        margin: 0;
    }
    
    .filter-close {
        width: 40px;
        height: 40px;
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        border-radius: 50%;
        transition: var(--transition-fast);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .filter-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
    }
    
    .filter-body {
        flex: 1;
        overflow-y: auto;
        padding: var(--spacing-lg);
    }
    
    .filter-group {
        margin-bottom: var(--spacing-xl);
    }
    
    .filter-group h4 {
        color: var(--text-primary);
        font-size: 16px;
        font-weight: 600;
        margin-bottom: var(--spacing-md);
    }
    
    .price-range {
        position: relative;
        margin-bottom: var(--spacing-md);
    }
    
    .price-range input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        position: absolute;
        top: 0;
        pointer-events: none;
    }
    
    .price-range input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        background: var(--accent-gold);
        border-radius: 50%;
        cursor: pointer;
        pointer-events: all;
        position: relative;
        z-index: 2;
    }
    
    .price-range input[type="range"]::-moz-range-thumb {
        width: 20px;
        height: 20px;
        background: var(--accent-gold);
        border-radius: 50%;
        cursor: pointer;
        pointer-events: all;
        border: none;
    }
    
    .price-range::before {
        content: '';
        position: absolute;
        top: 3px;
        height: 6px;
        background: var(--accent-gold);
        border-radius: 3px;
        pointer-events: none;
    }
    
    .price-values {
        display: flex;
        justify-content: space-between;
        margin-top: 12px;
        color: var(--text-secondary);
        font-size: 14px;
        font-weight: 600;
    }
    
    .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
    }
    
    .checkbox-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        cursor: pointer;
        color: var(--text-secondary);
        transition: var(--transition-fast);
        padding: var(--spacing-sm);
        border-radius: var(--radius-md);
        position: relative;
    }
    
    .checkbox-item:hover {
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-primary);
    }
    
    .checkbox-item input[type="checkbox"] {
        position: absolute;
        opacity: 0;
        cursor: pointer;
    }
    
    .checkmark {
        width: 20px;
        height: 20px;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: var(--radius-sm);
        position: relative;
        transition: var(--transition-fast);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .checkbox-item input:checked ~ .checkmark {
        background: var(--accent-gold);
        border-color: var(--accent-gold);
    }
    
    .checkbox-item input:checked ~ .checkmark::after {
        content: '✓';
        color: var(--primary-dark);
        font-weight: bold;
        font-size: 12px;
    }
    
    .spice-level {
        display: flex;
        gap: var(--spacing-sm);
        flex-wrap: wrap;
    }
    
    .spice-btn {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-sm) var(--spacing-md);
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: var(--text-secondary);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: var(--transition-fast);
        font-size: 14px;
    }
    
    .spice-btn:hover,
    .spice-btn.active {
        background: rgba(255, 68, 68, 0.2);
        border-color: var(--warning-red);
        color: var(--warning-red);
    }
    
    .rating-filter {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
    }
    
    .star-rating {
        display: flex;
        gap: var(--spacing-xs);
    }
    
    .star-rating i {
        font-size: 18px;
        color: rgba(255, 255, 255, 0.2);
        cursor: pointer;
        transition: var(--transition-fast);
    }
    
    .star-rating i.active,
    .star-rating i.preview {
        color: var(--accent-amber);
    }
    
    .star-rating i:hover {
        color: var(--accent-gold);
    }
    
    .filter-footer {
        display: flex;
        gap: var(--spacing-md);
        padding: var(--spacing-lg);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        background: var(--secondary-dark);
    }
    
    .filter-footer button {
        flex: 1;
        height: 44px;
        border: none;
        border-radius: var(--radius-lg);
        font-weight: 600;
        cursor: pointer;
        transition: var(--transition-fast);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .filter-footer .btn-secondary {
        background: none;
        color: var(--text-secondary);
        border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    .filter-footer .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
    }
    
    .filter-footer .btn-primary {
        background: var(--accent-gold);
        color: var(--primary-dark);
    }
    
    .filter-footer .btn-primary:hover {
        background: var(--accent-amber);
    }
    
    .filter-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: var(--warning-red);
        color: white;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        font-size: 11px;
        font-weight: 600;
        display: none;
        align-items: center;
        justify-content: center;
        min-width: 18px;
        animation: bounce 0.5s ease;
    }
    
    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
            transform: scale(1);
        }
        40% {
            transform: scale(1.2);
        }
        60% {
            transform: scale(1.1);
        }
    }
    
    @media (min-width: 769px) {
        .filter-content {
            left: auto;
            right: 0;
            transform: translateX(100%);
        }
        
        .filter-drawer.active .filter-content {
            transform: translateX(0);
        }
    }
    
    @media (max-width: 480px) {
        .filter-content {
            max-width: 100%;
        }
        
        .filter-footer {
            flex-direction: column;
        }
        
        .spice-level {
            flex-direction: column;
        }
        
        .checkbox-group {
            gap: var(--spacing-sm);
        }
    }
`;
document.head.appendChild(filterStyle);