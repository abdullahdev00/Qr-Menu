import { useState } from "react";
import { Button } from "../../admin/components/ui/button";
import { Input } from "../../admin/components/ui/input";
import { Label } from "../../admin/components/ui/label";
import { Textarea } from "../../admin/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../admin/components/ui/select";
import { Switch } from "../../admin/components/ui/switch";
import { Card, CardContent } from "../../admin/components/ui/card";
import { Badge } from "../../admin/components/ui/badge";
import { Upload, X, Plus } from "lucide-react";

interface AddMenuItemFormProps {
  onClose: () => void;
}

const categories = [
  "Appetizers",
  "Main Course", 
  "Desserts",
  "Beverages",
  "Pakistani Specialties"
];

export function AddMenuItemForm({ onClose }: AddMenuItemFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    preparationTime: "",
    isAvailable: true,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
  });

  const [ingredients, setIngredients] = useState<string[]>([]);
  const [allergens, setAllergens] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [newAllergen, setNewAllergen] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient("");
    }
  };

  const addAllergen = () => {
    if (newAllergen.trim() && !allergens.includes(newAllergen.trim())) {
      setAllergens([...allergens, newAllergen.trim()]);
      setNewAllergen("");
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const removeAllergen = (allergen: string) => {
    setAllergens(allergens.filter(a => a !== allergen));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log("Form data:", { ...formData, ingredients, allergens, imageFile });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Item Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="e.g., Chicken Biryani"
            required
            data-testid="menu-item-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleInputChange("category", value)}
            required
          >
            <SelectTrigger data-testid="menu-item-category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Describe your dish..."
          rows={3}
          data-testid="menu-item-description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (PKR) *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
            required
            data-testid="menu-item-price"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="preparationTime">Preparation Time (minutes)</Label>
          <Input
            id="preparationTime"
            type="number"
            value={formData.preparationTime}
            onChange={(e) => handleInputChange("preparationTime", e.target.value)}
            placeholder="15"
            min="1"
            data-testid="menu-item-prep-time"
          />
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Item Image</Label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
          {imagePreview ? (
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview("");
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Upload an image
                  </span>
                  <input
                    id="image-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleImageUpload}
                    data-testid="menu-item-image-upload"
                  />
                </label>
                <p className="mt-1 text-sm text-gray-500">PNG, JPG up to 10MB</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ingredients */}
      <div className="space-y-2">
        <Label>Ingredients</Label>
        <div className="flex space-x-2">
          <Input
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            placeholder="Add ingredient"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
            data-testid="add-ingredient-input"
          />
          <Button type="button" onClick={addIngredient} data-testid="add-ingredient-button">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {ingredients.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {ingredients.map((ingredient, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {ingredient}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeIngredient(ingredient)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Allergens */}
      <div className="space-y-2">
        <Label>Allergens</Label>
        <div className="flex space-x-2">
          <Input
            value={newAllergen}
            onChange={(e) => setNewAllergen(e.target.value)}
            placeholder="Add allergen"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergen())}
            data-testid="add-allergen-input"
          />
          <Button type="button" onClick={addAllergen} data-testid="add-allergen-button">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {allergens.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {allergens.map((allergen, index) => (
              <Badge key={index} variant="destructive" className="flex items-center gap-1">
                {allergen}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => removeAllergen(allergen)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Dietary Options */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-4">Dietary Information</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="isVegetarian">Vegetarian</Label>
              <Switch
                id="isVegetarian"
                checked={formData.isVegetarian}
                onCheckedChange={(checked) => handleInputChange("isVegetarian", checked)}
                data-testid="vegetarian-switch"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isVegan">Vegan</Label>
              <Switch
                id="isVegan"
                checked={formData.isVegan}
                onCheckedChange={(checked) => handleInputChange("isVegan", checked)}
                data-testid="vegan-switch"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isGlutenFree">Gluten Free</Label>
              <Switch
                id="isGlutenFree"
                checked={formData.isGlutenFree}
                onCheckedChange={(checked) => handleInputChange("isGlutenFree", checked)}
                data-testid="gluten-free-switch"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isAvailable">Available Now</Label>
              <Switch
                id="isAvailable"
                checked={formData.isAvailable}
                onCheckedChange={(checked) => handleInputChange("isAvailable", checked)}
                data-testid="available-switch"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} data-testid="cancel-button">
          Cancel
        </Button>
        <Button type="submit" data-testid="save-menu-item-button">
          Save Menu Item
        </Button>
      </div>
    </form>
  );
}