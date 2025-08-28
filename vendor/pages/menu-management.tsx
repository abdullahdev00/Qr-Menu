import React from 'react'
import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { useQuery, useMutation } from '@tanstack/react-query'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye,
  Star,
  Clock,
  DollarSign,
  ChefHat,
  Image as ImageIcon,
  MoreVertical,
  TrendingUp,
  Package
} from 'lucide-react'
import { Button } from '../../admin/components/ui/button'
import { Input } from '../../admin/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../admin/components/ui/dialog'
import { Label } from '../../admin/components/ui/label'
import { Textarea } from '../../admin/components/ui/textarea'
import { Checkbox } from '../../admin/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../admin/components/ui/select'
import { useToast } from '../../admin/hooks/use-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../admin/components/ui/form'
import { queryClient } from '../../admin/lib/queryClient'
import { insertMenuItemSchema, type InsertMenuItem, type MenuCategory } from '../../shared/schema'

interface RestaurantUser {
  id: string
  name: string
  email: string
  role: string
  restaurantId?: string
  restaurantName?: string
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  isAvailable: boolean
  preparationTime: number
  views: number
  rating: number
  isPopular: boolean
  tags: string[]
}


// Edit Item Dialog Component
function EditItemDialog({ item, isOpen, onOpenChange }: { item: any, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  
  const form = useForm<InsertMenuItem>({
    resolver: zodResolver(insertMenuItemSchema),
    defaultValues: {
      name: item?.name || "",
      description: item?.description || "",
      price: item?.price || "",
      currency: item?.currency || "PKR",
      image: item?.image || "",
      ingredients: item?.ingredients || [],
      allergens: item?.allergens || [],
      isVegan: item?.isVegan || false,
      isVegetarian: item?.isVegetarian || false,
      isSpicy: item?.isSpicy || false,
      preparationTime: item?.preparationTime || undefined,
      calories: item?.calories || undefined,
      isAvailable: item?.isAvailable || false,
      displayOrder: item?.displayOrder || 0,
      restaurantId: item?.restaurantId || "",
      categoryId: item?.categoryId || undefined
    },
  });

  // Get categories for select dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/menu-categories'],
    queryFn: async (): Promise<MenuCategory[]> => {
      const response = await fetch('/api/menu-categories');
      return response.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertMenuItem) => {
      const response = await fetch(`/api/menu-items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      // Force refetch menu items immediately
      queryClient.invalidateQueries({ queryKey: ['/api/menu-items'] });
      queryClient.refetchQueries({ queryKey: ['/api/menu-items'] });
      
      onOpenChange(false);
      toast({
        title: "Item Updated!",
        description: "Menu item has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update menu item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: InsertMenuItem) => {
    // Convert ingredients and allergens from comma-separated strings to arrays
    const processedData = {
      ...data,
      restaurantId: data.restaurantId || item.restaurantId,
      ingredients: typeof data.ingredients === 'string' 
        ? data.ingredients.split(',').map(i => i.trim()).filter(Boolean)
        : data.ingredients || [],
      allergens: typeof data.allergens === 'string'
        ? data.allergens.split(',').map(a => a.trim()).filter(Boolean) 
        : data.allergens || [],
    };
    
    updateMutation.mutate(processedData);
  };

  // Update form when item changes
  React.useEffect(() => {
    if (item) {
      form.reset({
        name: item.name || "",
        description: item.description || "",
        price: item.price || "",
        currency: item.currency || "PKR",
        image: item.image || "",
        ingredients: item.ingredients || [],
        allergens: item.allergens || [],
        isVegan: item.isVegan || false,
        isVegetarian: item.isVegetarian || false,
        isSpicy: item.isSpicy || false,
        preparationTime: item.preparationTime || undefined,
        calories: item.calories || undefined,
        isAvailable: item.isAvailable || false,
        displayOrder: item.displayOrder || 0,
        restaurantId: item.restaurantId || "",
        categoryId: item.categoryId || undefined
      });
    }
  }, [item, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Menu Item</DialogTitle>
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
                      <Input placeholder="Chicken Karahi" {...field} data-testid="input-edit-name" />
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
                        <SelectTrigger data-testid="select-edit-category">
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
                      value={field.value || ""}
                      data-testid="textarea-edit-description"
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
                        data-testid="input-edit-price"
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
                        data-testid="input-edit-prep-time"
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
                        data-testid="input-edit-calories"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                          data-testid="checkbox-edit-vegetarian"
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
                          data-testid="checkbox-edit-vegan"
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
                          data-testid="checkbox-edit-spicy"
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
                          data-testid="checkbox-edit-available"
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
                onClick={() => onOpenChange(false)}
                data-testid="button-edit-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
                data-testid="button-edit-submit"
              >
                {updateMutation.isPending ? "Updating..." : "Update Item"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Add Item Dialog Component
function AddItemDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
  // Get user from localStorage to access restaurantId
  const [currentUser, setCurrentUser] = useState<RestaurantUser | null>(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);
  
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
      isAvailable: false,
      displayOrder: 0,
      restaurantId: "", // Will be set dynamically
      categoryId: undefined
    },
  });

  // Get categories for select dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/menu-categories'],
    queryFn: async (): Promise<MenuCategory[]> => {
      const response = await fetch('/api/menu-categories');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertMenuItem) => {
      const response = await fetch('/api/menu-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: (newItem) => {
      // Force refetch menu items immediately
      queryClient.invalidateQueries({ queryKey: ['/api/menu-items'] });
      queryClient.refetchQueries({ queryKey: ['/api/menu-items'] });
      
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
    // Get the correct restaurant ID from current user or use the first available restaurant
    let restaurantId = data.restaurantId;
    
    if (!restaurantId) {
      if (currentUser && currentUser.restaurantId) {
        restaurantId = currentUser.restaurantId;
      } else {
        // Use first available restaurant ID from database
        restaurantId = "74afb71f-89fb-4cd6-94b8-c43b09e93118"; // Al-Baik Restaurant - correct ID
      }
    }
    
    // Convert ingredients and allergens from comma-separated strings to arrays
    const processedData = {
      ...data,
      restaurantId: restaurantId,
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
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" data-testid="button-add-item">
          <Plus className="w-5 h-5 mr-2" />
          Add New Item
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
                      value={field.value || ""}
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

// Delete Confirmation Dialog Component
function DeleteConfirmationDialog({ item, isOpen, onOpenChange }: { item: any, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const [confirmText, setConfirmText] = useState("");
  const { toast } = useToast();
  
  const deleteMutation = useMutation({
    mutationFn: async () => {
      console.log('Deleting item with ID:', item.id);
      const response = await fetch(`/api/menu-items/${item.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete failed:', response.status, errorText);
        throw new Error(`Failed to delete item: ${response.status}`);
      }
      const result = await response.json();
      console.log('Delete successful:', result);
      return result;
    },
    onSuccess: () => {
      console.log('Delete mutation successful, invalidating cache...');
      // Invalidate and refetch the menu items cache
      queryClient.invalidateQueries({ queryKey: ['/api/menu-items'] });
      queryClient.refetchQueries({ queryKey: ['/api/menu-items'] });
      
      // Close dialog and reset form
      onOpenChange(false);
      setConfirmText("");
      
      // Show success message
      toast({
        title: "Item Deleted!",
        description: "Menu item has been successfully deleted.",
      });
      
      console.log('Cache invalidated and refetched');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete menu item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (confirmText === "DELETE") {
      deleteMutation.mutate();
    }
  };

  const isDeleteEnabled = confirmText === "DELETE";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">Delete Menu Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to delete <strong>"{item?.name}"</strong>? This action cannot be undone.
          </p>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Type <span className="font-bold text-red-600">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
              placeholder="Type DELETE here"
              data-testid="input-delete-confirm"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              onOpenChange(false);
              setConfirmText("");
            }}
            data-testid="button-cancel-delete"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete}
            disabled={!isDeleteEnabled || deleteMutation.isPending}
            variant="destructive"
            data-testid="button-confirm-delete"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Item"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MenuManagement() {
  const [, setLocation] = useLocation()
  const [user, setUser] = useState<RestaurantUser | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // MOVE ALL HOOKS TO TOP LEVEL - Fix for React Error #310
  // Load menu items from database
  const { data: menuItems = [], isLoading, refetch: refetchMenuItems } = useQuery({
    queryKey: ['/api/menu-items'],
    queryFn: async () => {
      const response = await fetch('/api/menu-items');
      return response.json();
    },
    staleTime: 0, // Always refetch data when component mounts
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });

  // Get categories for filtering - combining with database categories
  const { data: dbCategories = [] } = useQuery({
    queryKey: ['/api/menu-categories'],
    queryFn: async (): Promise<MenuCategory[]> => {
      const response = await fetch('/api/menu-categories');
      return response.json();
    },
    staleTime: 0, // Always fresh data
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      // Allow both admin and restaurant users
      if (userData.role === 'restaurant' || userData.role === 'super_admin' || userData.role === 'admin') {
        setUser(userData)
      } else {
        setLocation('/dashboard')
      }
    } else {
      setLocation('/login')
    }
  }, [setLocation])

  // Early return AFTER all hooks are declared
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl">Loading...</h1>
        </div>
      </div>
    )
  }

  const categories = ['All', ...dbCategories.map(cat => cat.name)]
  
  const filteredItems = menuItems.filter((item: any) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || 
                           (item.categoryId && dbCategories.find(cat => cat.id === item.categoryId)?.name === selectedCategory)
    return matchesSearch && matchesCategory
  })

  const stats = {
    totalItems: menuItems.length,
    availableItems: menuItems.filter((item: any) => item.isAvailable).length,
    popularItems: menuItems.filter((item: any) => item.preparationTime && item.preparationTime < 30).length, // Quick items as popular
    avgRating: "4.5" // Static for now
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-white via-blue-50/40 to-purple-50/40 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/30 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/30 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Menu Management 🍽️
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {user.restaurantName} • Manage your menu items
            </p>
          </div>
          <AddItemDialog />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/30 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/30 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalItems}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Total Items</p>
        </div>

        <div className="bg-gradient-to-br from-white to-green-50/50 dark:from-gray-900 dark:to-green-950/30 rounded-xl p-6 border border-green-200/50 dark:border-green-800/30 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.availableItems}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Available</p>
        </div>

        <div className="bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-900 dark:to-purple-950/30 rounded-xl p-6 border border-purple-200/50 dark:border-purple-800/30 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.popularItems}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Popular Items</p>
        </div>

        <div className="bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-900 dark:to-orange-950/30 rounded-xl p-6 border border-orange-200/50 dark:border-orange-800/30 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgRating}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Avg Rating</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-lg"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            >
              {categories.map((category: string) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <Button variant="outline" className="px-4 py-2 border-gray-200 dark:border-gray-600">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading menu items...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item: any) => (
              <div key={item.id} className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105" data-testid={`card-item-${item.id}`}>
            {/* Image */}
            <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
              {item.isPopular && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  Popular
                </div>
              )}
              <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${
                item.isAvailable 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400'
              }`}>
                {item.isAvailable ? 'Available' : 'Out of Stock'}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{item.description}</p>
                </div>
                <button className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Dietary Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {item.isVegetarian && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 rounded-full">
                    🥬 Vegetarian
                  </span>
                )}
                {item.isVegan && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 rounded-full">
                    🌱 Vegan
                  </span>
                )}
                {item.isSpicy && (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100 rounded-full">
                    🌶️ Spicy
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {item.preparationTime}m
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {item.calories || 0} cal
                  </div>
                </div>
              </div>

              {/* Price and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{item.currency} {item.price}</span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      setEditingItem(item);
                      setIsEditDialogOpen(true);
                    }}
                    className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors" 
                    data-testid={`button-edit-${item.id}`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      setDeletingItem(item);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="p-2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900 transition-colors" 
                    data-testid={`button-delete-${item.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No menu items found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first menu item'}
            </p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <EditItemDialog 
        item={editingItem} 
        isOpen={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog 
        item={deletingItem} 
        isOpen={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
      />

    </div>
  )
}