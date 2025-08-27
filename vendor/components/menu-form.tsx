import React, { useState } from "react";
import { insertMenuItemSchema, type InsertMenuItem } from "../../shared/schema";

interface MenuFormProps {
  onSubmit: (data: InsertMenuItem) => void;
  isLoading?: boolean;
  categories?: Array<{ id: string; name: string }>;
}

export function MenuItemForm({ onSubmit, isLoading = false, categories = [] }: MenuFormProps) {
  const [formData, setFormData] = useState<Partial<InsertMenuItem>>({
    name: "",
    description: "",
    price: "",
    currency: "PKR",
    image: "",
    ingredients: [],
    allergens: [],
    isVegan: false,
    isVegetarian: false,
    isSpicy: false,
    preparationTime: undefined,
    calories: undefined,
    isAvailable: true,
    displayOrder: 0,
    restaurantId: "1", // This should come from context/auth
    categoryId: undefined
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Convert ingredients and allergens from strings to arrays
      const processedData = {
        ...formData,
        price: formData.price || "0",
        ingredients: typeof formData.ingredients === 'string' 
          ? formData.ingredients.split(',').map(i => i.trim()).filter(Boolean)
          : formData.ingredients || [],
        allergens: typeof formData.allergens === 'string'
          ? formData.allergens.split(',').map(a => a.trim()).filter(Boolean) 
          : formData.allergens || [],
      } as InsertMenuItem;
      
      onSubmit(processedData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="text-2xl font-bold mb-4">Add New Menu Item</div>
      
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Item Name *
          </label>
          <input
            id="name"
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Chicken Karahi"
            value={formData.name || ""}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            data-testid="input-item-name"
          />
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Category
          </label>
          <select
            id="category"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.categoryId || ""}
            onChange={(e) => setFormData({...formData, categoryId: e.target.value || undefined})}
            data-testid="select-category"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Delicious traditional chicken curry with aromatic spices..."
          value={formData.description || ""}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          data-testid="textarea-description"
        />
      </div>

      {/* Price and Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium mb-1">
            Price (PKR) *
          </label>
          <input
            id="price"
            type="number"
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="850"
            value={formData.price || ""}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            data-testid="input-price"
          />
        </div>
        
        <div>
          <label htmlFor="prepTime" className="block text-sm font-medium mb-1">
            Prep Time (minutes)
          </label>
          <input
            id="prepTime"
            type="number"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="25"
            value={formData.preparationTime || ""}
            onChange={(e) => setFormData({...formData, preparationTime: e.target.value ? Number(e.target.value) : undefined})}
            data-testid="input-prep-time"
          />
        </div>
        
        <div>
          <label htmlFor="calories" className="block text-sm font-medium mb-1">
            Calories
          </label>
          <input
            id="calories"
            type="number"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="650"
            value={formData.calories || ""}
            onChange={(e) => setFormData({...formData, calories: e.target.value ? Number(e.target.value) : undefined})}
            data-testid="input-calories"
          />
        </div>
      </div>

      {/* Ingredients and Allergens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ingredients" className="block text-sm font-medium mb-1">
            Ingredients (comma separated)
          </label>
          <textarea
            id="ingredients"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Chicken, Tomatoes, Onions, Ginger, Garlic"
            value={Array.isArray(formData.ingredients) ? formData.ingredients.join(', ') : formData.ingredients || ''}
            onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
            data-testid="textarea-ingredients"
          />
        </div>
        
        <div>
          <label htmlFor="allergens" className="block text-sm font-medium mb-1">
            Allergens (comma separated)
          </label>
          <textarea
            id="allergens"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Dairy, Nuts"
            value={Array.isArray(formData.allergens) ? formData.allergens.join(', ') : formData.allergens || ''}
            onChange={(e) => setFormData({...formData, allergens: e.target.value})}
            data-testid="textarea-allergens"
          />
        </div>
      </div>

      {/* Image URL */}
      <div>
        <label htmlFor="image" className="block text-sm font-medium mb-1">
          Image URL
        </label>
        <input
          id="image"
          type="url"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/chicken-karahi.jpg"
          value={formData.image || ""}
          onChange={(e) => setFormData({...formData, image: e.target.value})}
          data-testid="input-image"
        />
      </div>

      {/* Dietary Options */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Dietary Information</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={formData.isVegetarian || false}
              onChange={(e) => setFormData({...formData, isVegetarian: e.target.checked})}
              data-testid="checkbox-vegetarian"
            />
            <span className="text-sm">Vegetarian</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={formData.isVegan || false}
              onChange={(e) => setFormData({...formData, isVegan: e.target.checked})}
              data-testid="checkbox-vegan"
            />
            <span className="text-sm">Vegan</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={formData.isSpicy || false}
              onChange={(e) => setFormData({...formData, isSpicy: e.target.checked})}
              data-testid="checkbox-spicy"
            />
            <span className="text-sm">Spicy</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={formData.isAvailable !== false}
              onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
              data-testid="checkbox-available"
            />
            <span className="text-sm">Available</span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4 pt-4">
        <button 
          type="button"
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
          data-testid="button-cancel"
        >
          Cancel
        </button>
        <button 
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="button-submit"
        >
          {isLoading ? "Adding..." : "Add Item"}
        </button>
      </div>
    </form>
  );
}