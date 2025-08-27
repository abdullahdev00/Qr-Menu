import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../admin/components/ui/dialog";
import { Button } from "../../../admin/components/ui/button";
import { Input } from "../../../admin/components/ui/input";
import { Label } from "../../../admin/components/ui/label";
import { Textarea } from "../../../admin/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../admin/components/ui/select";
import { Checkbox } from "../../../admin/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "../../../admin/components/ui/card";
import { Badge } from "../../../admin/components/ui/badge";
import { Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { useToast } from "../../../admin/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../admin/components/ui/form";
import { apiRequest, queryClient } from "../../../admin/lib/queryClient";
import { insertMenuItemSchema, insertMenuCategorySchema, type MenuItem, type MenuCategory, type InsertMenuItem, type InsertMenuCategory } from "../../../shared/schema";

// Add Item Form Component
function AddItemDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<InsertMenuItem>({
    resolver: zodResolver(insertMenuItemSchema),
    defaultValues: {
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
    },
  });

  // Get categories for select dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/menu-categories'],
    queryFn: async () => {
      const response = await fetch('/api/menu-categories');
      return response.json() as MenuCategory[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertMenuItem) => {
      return apiRequest('/api/menu-items', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu-items'] });
      setIsOpen(false);
      form.reset();
      toast({
        title: "Item Added!",
        description: "Menu item has been successfully added.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add menu item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: InsertMenuItem) => {
    // Convert ingredients and allergens from comma-separated strings to arrays
    const processedData = {
      ...data,
      ingredients: typeof data.ingredients === 'string' 
        ? data.ingredients.split(',').map(i => i.trim()).filter(Boolean)
        : data.ingredients || [],
      allergens: typeof data.allergens === 'string'
        ? data.allergens.split(',').map(a => a.trim()).filter(Boolean) 
        : data.allergens || [],
    };
    
    createMutation.mutate(processedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="mb-6" data-testid="button-add-item">
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Menu Item</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Chicken Karahi" {...field} data-testid="input-item-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Delicious traditional chicken curry with aromatic spices..."
                      rows={3}
                      {...field}
                      data-testid="textarea-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price and Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (PKR) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="850" 
                        {...field}
                        data-testid="input-price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="preparationTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prep Time (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="25"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        value={field.value || ""}
                        data-testid="input-prep-time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="650"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        value={field.value || ""}
                        data-testid="input-calories"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Ingredients and Allergens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredients (comma separated)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Chicken, Tomatoes, Onions, Ginger, Garlic"
                        rows={2}
                        {...field}
                        value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}
                        data-testid="textarea-ingredients"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="allergens"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allergens (comma separated)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Dairy, Nuts"
                        rows={2}
                        {...field}
                        value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}
                        data-testid="textarea-allergens"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Image URL */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/chicken-karahi.jpg"
                      {...field}
                      data-testid="input-image"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dietary Options */}
            <div className="space-y-4">
              <Label>Dietary Information</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="isVegetarian"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-vegetarian"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">Vegetarian</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isVegan"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-vegan"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">Vegan</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isSpicy"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-spicy"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">Spicy</FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isAvailable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-available"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">Available</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
                data-testid="button-submit"
              >
                {createMutation.isPending ? "Adding..." : "Add Item"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Main Menu Management Page
export default function MenuManagement() {
  // Get menu items
  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['/api/menu-items'],
    queryFn: async () => {
      const response = await fetch('/api/menu-items');
      return response.json() as MenuItem[];
    },
  });

  // Get categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/menu-categories'],
    queryFn: async () => {
      const response = await fetch('/api/menu-categories');
      return response.json() as MenuCategory[];
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading menu items...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your restaurant's menu items and categories
          </p>
        </div>
        <AddItemDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-items">
              {menuItems.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-available-items">
              {menuItems.filter(item => item.isAvailable).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-categories">
              {categories.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Card key={item.id} className="overflow-hidden" data-testid={`card-item-${item.id}`}>
            {item.image && (
              <div className="aspect-video overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg leading-tight">{item.name}</CardTitle>
                <div className="flex items-center space-x-1">
                  {item.isAvailable ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              <div className="text-2xl font-bold text-primary">
                {item.currency} {parseFloat(item.price).toLocaleString()}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              )}
              
              {/* Dietary badges */}
              <div className="flex flex-wrap gap-1">
                {item.isVegetarian && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    Vegetarian
                  </Badge>
                )}
                {item.isVegan && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    Vegan
                  </Badge>
                )}
                {item.isSpicy && (
                  <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                    Spicy 🌶️
                  </Badge>
                )}
              </div>
              
              {/* Additional info */}
              <div className="flex justify-between text-xs text-muted-foreground">
                {item.preparationTime && (
                  <span>⏱️ {item.preparationTime} min</span>
                )}
                {item.calories && (
                  <span>🔥 {item.calories} cal</span>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex justify-end space-x-1 pt-2">
                <Button size="sm" variant="outline">
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {menuItems.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No menu items yet</h3>
          <p className="text-muted-foreground mb-4">
            Start building your menu by adding your first item
          </p>
          <AddItemDialog />
        </div>
      )}
    </div>
  );
}