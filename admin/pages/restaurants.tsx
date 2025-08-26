import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { FormError } from '../components/ui/form-error';
import { useToast } from '../lib/use-toast';
import { validators, generateSlug } from '../lib/validation';
import { 
  Plus, Search, Filter, MoreHorizontal, Edit, Trash2, 
  Eye, Store, MapPin, Phone, Mail, Calendar,
  Users, TrendingUp, Clock, Star
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  address: string;
  city: string;
  planId: string | null;
  status: 'active' | 'inactive' | 'suspended';
  notes: string;
  createdAt: string;
}

interface RestaurantFormData {
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  password: string;
  ownerPhone: string;
  address: string;
  city: string;
  planId: string | null;
  status: 'active' | 'inactive' | 'suspended';
  notes: string;
}

export default function RestaurantsPage() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  console.log('🏪 RestaurantsPage rendered!');
  console.log('🔍 User:', user);
  console.log('🔍 Is authenticated:', !!user);

  // Form state
  const [formData, setFormData] = useState<RestaurantFormData>({
    name: '',
    slug: '',
    ownerName: '',
    ownerEmail: '',
    password: '',
    ownerPhone: '',
    address: '',
    city: 'Karachi',
    planId: null,
    status: 'active',
    notes: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setLocation('/login');
    }
  }, [setLocation]);

  // Check for URL parameter to open add form
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('add') === 'true') {
      setIsAddDialogOpen(true);
      // Clean up URL without causing re-render
      window.history.replaceState({}, '', '/restaurants');
    }
  }, []);

  // Fetch restaurants
  const { data: restaurants = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/restaurants', searchTerm],
    queryFn: async () => {
      const url = searchTerm 
        ? `/api/restaurants?search=${encodeURIComponent(searchTerm)}`
        : '/api/restaurants';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
      }
      return response.json();
    },
    enabled: !!user,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider data stale to ensure fresh data
  });

  // Fetch subscription plans
  const { data: plans = [] } = useQuery({
    queryKey: ['/api/subscription-plans'],
    queryFn: async () => {
      const response = await fetch('/api/subscription-plans');
      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }
      return response.json();
    },
    enabled: !!user,
  });

  // Update restaurant mutation
  const updateRestaurantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RestaurantFormData }) => {
      const response = await fetch(`/api/restaurants/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update restaurant');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/restaurants'] });
      queryClient.refetchQueries({ queryKey: ['/api/restaurants'] });
      setIsEditDialogOpen(false);
      setEditingRestaurant(null);
      resetForm();
      toast({
        title: "Success",
        description: "Restaurant updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete restaurant mutation
  const deleteRestaurantMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/restaurants/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete restaurant');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/restaurants'] });
      queryClient.refetchQueries({ queryKey: ['/api/restaurants'] });
      setIsDeleteDialogOpen(false);
      setRestaurantToDelete(null);
      toast({
        title: "Success",
        description: "Restaurant deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handler functions for table actions
  const handleViewRestaurant = (id: string) => {
    const restaurant = restaurants.find((r: Restaurant) => r.id === id);
    if (restaurant) {
      toast({
        title: "Restaurant Details",
        description: `Viewing details for ${restaurant.name}`,
      });
      // Here you can navigate to restaurant detail page or open detail modal
      console.log('Viewing restaurant:', restaurant);
    }
  };

  const handleEditRestaurant = (id: string) => {
    const restaurant = restaurants.find((r: Restaurant) => r.id === id);
    
    if (restaurant) {
      setEditingRestaurant(restaurant);
      setFormData({
        name: restaurant.name || '',
        slug: restaurant.slug || '',
        ownerName: restaurant.ownerName || '',
        ownerEmail: restaurant.ownerEmail || '',
        password: '', // Don't populate password when editing
        ownerPhone: restaurant.ownerPhone || '',
        address: restaurant.address || '',
        city: restaurant.city || 'Karachi',
        planId: restaurant.planId || null,
        status: restaurant.status || 'active',
        notes: restaurant.notes || ''
      });
      setErrors({});
      setIsEditDialogOpen(true);
    } else {
      toast({
        title: "Error",
        description: "Restaurant not found",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRestaurant = (id: string) => {
    const restaurant = restaurants.find((r: Restaurant) => r.id === id);
    if (restaurant) {
      setRestaurantToDelete(restaurant);
      setIsDeleteDialogOpen(true);
    }
  };

  // Create restaurant mutation
  const createRestaurantMutation = useMutation({
    mutationFn: async (data: RestaurantFormData) => {
      const response = await fetch('/api/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create restaurant');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/restaurants'] });
      queryClient.refetchQueries({ queryKey: ['/api/restaurants'] });
      toast({
        title: "Restaurant created",
        description: "Restaurant has been successfully created.",
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create restaurant.",
        variant: "destructive",
      });
    },
  });

  // Filter restaurants - safely handle undefined restaurants
  const filteredRestaurants = Array.isArray(restaurants) ? restaurants.filter((restaurant: Restaurant) => {
    if (statusFilter !== 'all' && restaurant.status !== statusFilter) {
      return false;
    }
    return true;
  }) : [];

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validate restaurant name
    const nameError = validators.restaurantName(formData.name)
    if (nameError) newErrors.name = nameError

    // Validate slug
    const slugError = validators.slug(formData.slug)
    if (slugError) newErrors.slug = slugError

    // Validate owner name
    const ownerNameError = validators.name(formData.ownerName)
    if (ownerNameError) newErrors.ownerName = ownerNameError

    // Validate owner email
    const emailError = validators.email(formData.ownerEmail)
    if (emailError) newErrors.ownerEmail = emailError

    // Validate password (required for new restaurants)
    if (!editingRestaurant && !formData.password) {
      newErrors.password = 'Password is required for new restaurants'
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long'
    }

    // Validate phone if provided
    if (formData.ownerPhone) {
      const phoneError = validators.phone(formData.ownerPhone)
      if (phoneError) newErrors.ownerPhone = phoneError
    }

    // Validate address if provided
    if (formData.address) {
      const addressError = validators.address(formData.address)
      if (addressError) newErrors.address = addressError
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return
    }

    if (editingRestaurant) {
      // For editing, only include password if it's provided
      const updateData: any = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      updateRestaurantMutation.mutate({ id: editingRestaurant.id, data: updateData });
    } else {
      // For new restaurants, ensure password is always included
      const createData = { 
        ...formData,
        password: formData.password || 'restaurant123' // Default password if empty
      };
      createRestaurantMutation.mutate(createData);
    }
  };

  const handleConfirmDelete = () => {
    if (restaurantToDelete) {
      deleteRestaurantMutation.mutate(restaurantToDelete.id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', slug: '', ownerName: '', ownerEmail: '', password: '', ownerPhone: '',
      address: '', city: 'Karachi', planId: null, status: 'active', notes: ''
    });
    setEditingRestaurant(null);
    setErrors({});
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Suspended</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Inactive</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{status}</Badge>;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Restaurants</h1>
          <p className="text-gray-600">Manage your restaurant clients and their subscriptions</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Restaurant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Restaurant</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Restaurant Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({ 
                        ...formData, 
                        name,
                        slug: !editingRestaurant ? generateSlug(name) : formData.slug
                      });
                      if (errors.name) {
                        const newErrors = { ...errors }
                        delete newErrors.name
                        setErrors(newErrors)
                      }
                    }}
                    placeholder="Enter restaurant name"
                    className={errors.name ? 'border-red-500 focus:border-red-500' : ''}
                    required
                  />
                  <FormError message={errors.name} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug *</label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => {
                      setFormData({ ...formData, slug: e.target.value });
                      if (errors.slug) {
                        const newErrors = { ...errors }
                        delete newErrors.slug
                        setErrors(newErrors)
                      }
                    }}
                    placeholder="restaurant-slug"
                    className={errors.slug ? 'border-red-500 focus:border-red-500' : ''}
                    required
                  />
                  <FormError message={errors.slug} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Owner Name *</label>
                  <Input
                    value={formData.ownerName}
                    onChange={(e) => {
                      setFormData({ ...formData, ownerName: e.target.value });
                      if (errors.ownerName) {
                        const newErrors = { ...errors }
                        delete newErrors.ownerName
                        setErrors(newErrors)
                      }
                    }}
                    placeholder="Enter owner name"
                    className={errors.ownerName ? 'border-red-500 focus:border-red-500' : ''}
                    required
                  />
                  <FormError message={errors.ownerName} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Owner Email *</label>
                  <Input
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => {
                      setFormData({ ...formData, ownerEmail: e.target.value });
                      if (errors.ownerEmail) {
                        const newErrors = { ...errors }
                        delete newErrors.ownerEmail
                        setErrors(newErrors)
                      }
                    }}
                    placeholder="owner@example.com"
                    className={errors.ownerEmail ? 'border-red-500 focus:border-red-500' : ''}
                    required
                  />
                  <FormError message={errors.ownerEmail} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Restaurant Password *</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) {
                      const newErrors = { ...errors }
                      delete newErrors.password
                      setErrors(newErrors)
                    }
                  }}
                  placeholder={editingRestaurant ? "Leave blank to keep current password" : "Enter password for restaurant"}
                  className={errors.password ? 'border-red-500 focus:border-red-500' : ''}
                  required={!editingRestaurant}
                />
                <FormError message={errors.password} />
                <p className="text-xs text-gray-500 mt-1">This password will be used for restaurant login</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input
                    value={formData.ownerPhone}
                    onChange={(e) => {
                      setFormData({ ...formData, ownerPhone: e.target.value });
                      if (errors.ownerPhone) {
                        const newErrors = { ...errors }
                        delete newErrors.ownerPhone
                        setErrors(newErrors)
                      }
                    }}
                    placeholder="03001234567"
                    className={errors.ownerPhone ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  <FormError message={errors.ownerPhone} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <Select 
                    value={formData.city} 
                    onValueChange={(value) => setFormData({ ...formData, city: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Karachi">Karachi</SelectItem>
                      <SelectItem value="Lahore">Lahore</SelectItem>
                      <SelectItem value="Islamabad">Islamabad</SelectItem>
                      <SelectItem value="Rawalpindi">Rawalpindi</SelectItem>
                      <SelectItem value="Faisalabad">Faisalabad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <Input
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    if (errors.address) {
                      const newErrors = { ...errors }
                      delete newErrors.address
                      setErrors(newErrors)
                    }
                  }}
                  placeholder="Enter full address"
                  className={errors.address ? 'border-red-500 focus:border-red-500' : ''}
                />
                <FormError message={errors.address} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Subscription Plan</label>
                  <Select 
                    value={formData.planId || ''} 
                    onValueChange={(value) => setFormData({ ...formData, planId: value || null })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan: any) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - ₨{plan.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: 'active' | 'inactive' | 'suspended') => 
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createRestaurantMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createRestaurantMutation.isPending ? 'Creating...' : 'Create Restaurant'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Edit Restaurant Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Restaurant</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Restaurant Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({ 
                        ...formData, 
                        name,
                        slug: !editingRestaurant ? generateSlug(name) : formData.slug
                      });
                      if (errors.name) {
                        const newErrors = { ...errors }
                        delete newErrors.name
                        setErrors(newErrors)
                      }
                    }}
                    placeholder="Enter restaurant name"
                    className={errors.name ? 'border-red-500 focus:border-red-500' : ''}
                    required
                  />
                  <FormError message={errors.name} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug *</label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => {
                      setFormData({ ...formData, slug: e.target.value });
                      if (errors.slug) {
                        const newErrors = { ...errors }
                        delete newErrors.slug
                        setErrors(newErrors)
                      }
                    }}
                    placeholder="restaurant-slug"
                    className={errors.slug ? 'border-red-500 focus:border-red-500' : ''}
                    required
                  />
                  <FormError message={errors.slug} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Owner Name *</label>
                  <Input
                    value={formData.ownerName}
                    onChange={(e) => {
                      setFormData({ ...formData, ownerName: e.target.value });
                      if (errors.ownerName) {
                        const newErrors = { ...errors }
                        delete newErrors.ownerName
                        setErrors(newErrors)
                      }
                    }}
                    placeholder="Enter owner name"
                    className={errors.ownerName ? 'border-red-500 focus:border-red-500' : ''}
                    required
                  />
                  <FormError message={errors.ownerName} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Owner Email *</label>
                  <Input
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => {
                      setFormData({ ...formData, ownerEmail: e.target.value });
                      if (errors.ownerEmail) {
                        const newErrors = { ...errors }
                        delete newErrors.ownerEmail
                        setErrors(newErrors)
                      }
                    }}
                    placeholder="owner@example.com"
                    className={errors.ownerEmail ? 'border-red-500 focus:border-red-500' : ''}
                    required
                  />
                  <FormError message={errors.ownerEmail} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Restaurant Password</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) {
                      const newErrors = { ...errors }
                      delete newErrors.password
                      setErrors(newErrors)
                    }
                  }}
                  placeholder="Leave blank to keep current password"
                  className={errors.password ? 'border-red-500 focus:border-red-500' : ''}
                />
                <FormError message={errors.password} />
                <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input
                    value={formData.ownerPhone}
                    onChange={(e) => {
                      setFormData({ ...formData, ownerPhone: e.target.value });
                      if (errors.ownerPhone) {
                        const newErrors = { ...errors }
                        delete newErrors.ownerPhone
                        setErrors(newErrors)
                      }
                    }}
                    placeholder="03001234567"
                    className={errors.ownerPhone ? 'border-red-500 focus:border-red-500' : ''}
                  />
                  <FormError message={errors.ownerPhone} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <Select 
                    value={formData.city} 
                    onValueChange={(value) => setFormData({ ...formData, city: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Karachi">Karachi</SelectItem>
                      <SelectItem value="Lahore">Lahore</SelectItem>
                      <SelectItem value="Islamabad">Islamabad</SelectItem>
                      <SelectItem value="Rawalpindi">Rawalpindi</SelectItem>
                      <SelectItem value="Faisalabad">Faisalabad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <Input
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    if (errors.address) {
                      const newErrors = { ...errors }
                      delete newErrors.address
                      setErrors(newErrors)
                    }
                  }}
                  placeholder="Enter full address"
                  className={errors.address ? 'border-red-500 focus:border-red-500' : ''}
                />
                <FormError message={errors.address} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Subscription Plan</label>
                  <Select 
                    value={formData.planId || ''} 
                    onValueChange={(value) => setFormData({ ...formData, planId: value || null })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan: any) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - ₨{plan.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: 'active' | 'inactive' | 'suspended') => 
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes about the restaurant"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateRestaurantMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updateRestaurantMutation.isPending ? 'Updating...' : 'Update Restaurant'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search restaurants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Restaurants</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{Array.isArray(restaurants) ? restaurants.length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Array.isArray(restaurants) ? restaurants.filter((r: Restaurant) => r.status === 'active').length : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Inactive</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Array.isArray(restaurants) ? restaurants.filter((r: Restaurant) => r.status === 'inactive').length : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">This Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">+12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Restaurants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Restaurants List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRestaurants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                          <Store className="h-12 w-12 mb-4 text-gray-300 dark:text-gray-600" />
                          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No restaurants found</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Get started by adding your first restaurant</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRestaurants.map((restaurant: Restaurant) => (
                      <TableRow key={restaurant.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <Store className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{restaurant.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{restaurant.slug}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{restaurant.ownerName}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {restaurant.ownerEmail}
                            </div>
                            {restaurant.ownerPhone && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {restaurant.ownerPhone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-gray-900 dark:text-white">
                            <MapPin className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" />
                            {restaurant.city}
                          </div>
                          {restaurant.address && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate max-w-xs">
                              {restaurant.address}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(restaurant.status)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {restaurant.planId ? 'Subscribed' : 'No Plan'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(restaurant.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewRestaurant(restaurant.id)}
                              data-testid={`button-view-${restaurant.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditRestaurant(restaurant.id)}
                              data-testid={`button-edit-${restaurant.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() => handleDeleteRestaurant(restaurant.id)}
                              data-testid={`button-delete-${restaurant.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Restaurant</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Restaurant Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) {
                      const newErrors = { ...errors }
                      delete newErrors.name
                      setErrors(newErrors)
                    }
                  }}
                  placeholder="Enter restaurant name"
                  className={errors.name ? 'border-red-500 focus:border-red-500' : ''}
                  required
                />
                <FormError message={errors.name} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug *</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => {
                    setFormData({ ...formData, slug: e.target.value });
                    if (errors.slug) {
                      const newErrors = { ...errors }
                      delete newErrors.slug
                      setErrors(newErrors)
                    }
                  }}
                  placeholder="restaurant-slug"
                  className={errors.slug ? 'border-red-500 focus:border-red-500' : ''}
                  required
                />
                <FormError message={errors.slug} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Owner Name *</label>
                <Input
                  value={formData.ownerName}
                  onChange={(e) => {
                    setFormData({ ...formData, ownerName: e.target.value });
                    if (errors.ownerName) {
                      const newErrors = { ...errors }
                      delete newErrors.ownerName
                      setErrors(newErrors)
                    }
                  }}
                  placeholder="Owner's full name"
                  className={errors.ownerName ? 'border-red-500 focus:border-red-500' : ''}
                  required
                />
                <FormError message={errors.ownerName} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Owner Email *</label>
                <Input
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => {
                    setFormData({ ...formData, ownerEmail: e.target.value });
                    if (errors.ownerEmail) {
                      const newErrors = { ...errors }
                      delete newErrors.ownerEmail
                      setErrors(newErrors)
                    }
                  }}
                  placeholder="owner@restaurant.com"
                  className={errors.ownerEmail ? 'border-red-500 focus:border-red-500' : ''}
                  required
                />
                <FormError message={errors.ownerEmail} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <Input
                  value={formData.ownerPhone}
                  onChange={(e) => {
                    setFormData({ ...formData, ownerPhone: e.target.value });
                    if (errors.ownerPhone) {
                      const newErrors = { ...errors }
                      delete newErrors.ownerPhone
                      setErrors(newErrors)
                    }
                  }}
                  placeholder="03001234567"
                  className={errors.ownerPhone ? 'border-red-500 focus:border-red-500' : ''}
                />
                <FormError message={errors.ownerPhone} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <Select
                  value={formData.city}
                  onValueChange={(value) => setFormData({ ...formData, city: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Karachi">Karachi</SelectItem>
                    <SelectItem value="Lahore">Lahore</SelectItem>
                    <SelectItem value="Islamabad">Islamabad</SelectItem>
                    <SelectItem value="Faisalabad">Faisalabad</SelectItem>
                    <SelectItem value="Multan">Multan</SelectItem>
                    <SelectItem value="Peshawar">Peshawar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <Input
                value={formData.address}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value });
                  if (errors.address) {
                    const newErrors = { ...errors }
                    delete newErrors.address
                    setErrors(newErrors)
                  }
                }}
                placeholder="Full address"
                className={errors.address ? 'border-red-500 focus:border-red-500' : ''}
              />
              <FormError message={errors.address} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive' | 'suspended') => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subscription Plan</label>
                <Select
                  value={formData.planId || ''}
                  onValueChange={(value) => setFormData({ ...formData, planId: value || null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Plan</SelectItem>
                    {plans.map((plan: any) => (
                      <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateRestaurantMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updateRestaurantMutation.isPending ? 'Updating...' : 'Update Restaurant'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{restaurantToDelete?.name}" and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteRestaurantMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteRestaurantMutation.isPending ? 'Deleting...' : 'Delete Restaurant'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}