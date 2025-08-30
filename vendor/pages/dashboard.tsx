import React from 'react'
import { useEffect, useState } from 'react'
import { useLocation, Link } from 'wouter'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  Store, 
  QrCode, 
  TrendingUp, 
  Users, 
  Eye,
  Plus,
  BarChart3,
  Settings,
  CreditCard,
  Phone,
  Star,
  Clock,
  ChefHat,
  ShoppingBag,
  Home
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../admin/components/ui/dialog'
import { Button } from '../../admin/components/ui/button'
import { Input } from '../../admin/components/ui/input'
import { Label } from '../../admin/components/ui/label'
import { Textarea } from '../../admin/components/ui/textarea'
import { Checkbox } from '../../admin/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../admin/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../admin/components/ui/form'
import { useToast } from '../../admin/hooks/use-toast'
import { queryClient } from '../../admin/lib/queryClient'
import { insertMenuItemSchema, type InsertMenuItem, type MenuCategory } from '../../shared/schema'

interface RestaurantUser {
  id: string
  name: string
  email: string
  role: string
  restaurantId: string
  restaurantName: string
}

// Add Item Dialog Component
function AddItemDialog({ restaurantId }: { restaurantId: string }) {
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
      restaurantId: restaurantId,
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
        <button className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105" data-testid="button-add-item">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium text-center">Add Menu Item</span>
        </button>
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

export default function VendorDashboard() {
  const [location, setLocation] = useLocation()
  const [user, setUser] = useState<RestaurantUser | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      if (userData.role === 'restaurant') {
        setUser(userData)
      } else {
        setLocation('/dashboard') // Redirect admin users to admin dashboard
      }
    } else {
      setLocation('/login')
    }
  }, [])

  // Fetch real dashboard data
  const { data: menuItemsData } = useQuery({
    queryKey: ['/api/menu-items', user?.restaurantId],
    queryFn: async () => {
      if (!user?.restaurantId) return null
      const response = await fetch(`/api/menu-items?restaurantId=${user.restaurantId}`)
      return response.json()
    },
    enabled: !!user?.restaurantId,
  })

  const { data: restaurantData } = useQuery({
    queryKey: ['/api/restaurants', user?.restaurantId],
    queryFn: async () => {
      if (!user?.restaurantId) return null
      const response = await fetch(`/api/restaurants/${user.restaurantId}`)
      return response.json()
    },
    enabled: !!user?.restaurantId,
  })

  // Calculate stats from real data
  const menuItemsCount = menuItemsData?.length || 0
  const qrScansCount = restaurantData?.qrScansCount || 1234 // Default to sample data if not available
  const popularItem = menuItemsData?.find(item => item.isPopular) || menuItemsData?.[0] || { name: 'Chicken Biryani' }
  const subscriptionPlan = restaurantData?.subscriptionPlan || 'Pro Plan'

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl">Loading...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-white via-blue-50/40 to-purple-50/40 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/30 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/30 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {user.restaurantName} • Restaurant Dashboard
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Menu Items */}
        <div className="bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/30 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/30 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full">
              {menuItemsCount}/100
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{menuItemsCount}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Menu Items</p>
          <div className="mt-2 text-xs text-green-600 dark:text-green-400">
            {menuItemsCount > 0 ? `${menuItemsCount} items available` : 'Add your first item'}
          </div>
        </div>

        {/* QR Scans */}
        <div className="bg-gradient-to-br from-white to-green-50/50 dark:from-gray-900 dark:to-green-950/30 rounded-xl p-6 border border-green-200/50 dark:border-green-800/30 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full">
              +18%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{qrScansCount.toLocaleString()}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">QR Code Scans</p>
          <div className="mt-2 text-xs text-green-600 dark:text-green-400">
            This month
          </div>
        </div>

        {/* Popular Item */}
        <div className="bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-900 dark:to-purple-950/30 rounded-xl p-6 border border-purple-200/50 dark:border-purple-800/30 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-full">
              HOT
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{popularItem.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Most Popular</p>
          <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
            {menuItemsCount > 0 ? 'Top performing item' : 'Add items to see stats'}
          </div>
        </div>

        {/* Plan Status */}
        <div className="bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-900 dark:to-orange-950/30 rounded-xl p-6 border border-orange-200/50 dark:border-orange-800/30 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-full">
              ACTIVE
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{subscriptionPlan}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Subscription</p>
          <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
            {restaurantData?.subscriptionStatus === 'active' ? 'Active subscription' : 'Renews: March 15'}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <AddItemDialog restaurantId={user.restaurantId} />
              
              <button className="flex flex-col items-center p-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <QrCode className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-center">Generate QR</span>
              </button>
              
              <Link href="/analytics">
                <button className="w-full flex flex-col items-center p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-center">View Analytics</span>
                </button>
              </Link>
              
              <button className="flex flex-col items-center p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <Settings className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-center">Settings</span>
              </button>
              
              <button className="flex flex-col items-center p-4 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-center">Customer Feedback</span>
              </button>
              
              <button className="flex flex-col items-center p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <Phone className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-center">Support</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">New menu item added</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">QR code downloaded</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">Customer feedback received</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">Menu viewed 45 times</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart Section */}
      <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Menu Performance</h3>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">Last 7 days</span>
          </div>
        </div>
        
        {/* Placeholder for chart - you can add recharts here later */}
        <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg flex items-center justify-center border border-blue-200/50 dark:border-blue-800/30">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Analytics chart will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  )
}