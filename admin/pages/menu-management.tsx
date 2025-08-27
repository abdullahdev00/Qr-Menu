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
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Checkbox } from '../components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { useToast } from '../hooks/use-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form'
import { apiRequest, queryClient } from '../lib/queryClient'
import { insertMenuItemSchema, type InsertMenuItem, type MenuCategory } from '../../shared/schema'

interface RestaurantUser {
  id: string
  name: string
  email: string
  role: string
  restaurantId: string
  restaurantName: string
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

const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice with tender chicken pieces, served with raita and shorba',
    price: 450,
    category: 'Main Course',
    image: '/placeholder-food.jpg',
    isAvailable: true,
    preparationTime: 25,
    views: 234,
    rating: 4.8,
    isPopular: true,
    tags: ['Spicy', 'Popular', 'Traditional']
  },
  {
    id: '2',
    name: 'Chicken Karahi',
    description: 'Traditional Pakistani karahi with fresh tomatoes and green chilies',
    price: 380,
    category: 'Main Course',
    image: '/placeholder-food.jpg',
    isAvailable: true,
    preparationTime: 20,
    views: 189,
    rating: 4.6,
    isPopular: false,
    tags: ['Spicy', 'Traditional']
  },
  {
    id: '3',
    name: 'Mutton Pulao',
    description: 'Fragrant rice cooked with tender mutton pieces and aromatic spices',
    price: 520,
    category: 'Main Course',
    image: '/placeholder-food.jpg',
    isAvailable: false,
    preparationTime: 35,
    views: 156,
    rating: 4.7,
    isPopular: false,
    tags: ['Premium', 'Traditional']
  },
  {
    id: '4',
    name: 'Fresh Lime Soda',
    description: 'Refreshing lime drink with mint and soda water',
    price: 120,
    category: 'Beverages',
    image: '/placeholder-drink.jpg',
    isAvailable: true,
    preparationTime: 5,
    views: 98,
    rating: 4.3,
    isPopular: false,
    tags: ['Refreshing', 'Cold']
  },
  {
    id: '5',
    name: 'Gulab Jamun',
    description: 'Traditional sweet dumplings in sugar syrup (2 pieces)',
    price: 180,
    category: 'Desserts',
    image: '/placeholder-dessert.jpg',
    isAvailable: true,
    preparationTime: 5,
    views: 67,
    rating: 4.5,
    isPopular: false,
    tags: ['Sweet', 'Traditional']
  }
]

// Add Item Dialog Component
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
      restaurantId: "cb076ec8-d052-4176-928e-c914eb11af04", // This should come from context/auth
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

export default function MenuManagement() {
  const [, setLocation] = useLocation()
  const [user, setUser] = useState<RestaurantUser | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      if (userData.role === 'restaurant') {
        setUser(userData)
      } else {
        setLocation('/dashboard')
      }
    } else {
      setLocation('/login')
    }
  }, [])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl">Loading...</h1>
        </div>
      </div>
    )
  }

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))]
  
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const stats = {
    totalItems: menuItems.length,
    availableItems: menuItems.filter(item => item.isAvailable).length,
    popularItems: menuItems.filter(item => item.isPopular).length,
    avgRating: (menuItems.reduce((sum, item) => sum + item.rating, 0) / menuItems.length).toFixed(1)
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
              {categories.map(category => (
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
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

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {item.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {item.preparationTime}m
                  </div>
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {item.views}
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                    {item.rating}
                  </div>
                </div>
              </div>

              {/* Price and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">₹{item.price}</span>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 rounded-xl p-12 text-center shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No items found</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Try adjusting your search or filter criteria</p>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl">
            <Plus className="w-5 h-5 mr-2" />
            Add Your First Item
          </Button>
        </div>
      )}
    </div>
  )
}