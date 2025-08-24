import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../lib/use-toast';
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<RestaurantFormData>({
    name: '',
    slug: '',
    ownerName: '',
    ownerEmail: '',
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

  // Fetch restaurants
  const { data: restaurants = [], isLoading } = useQuery({
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
      toast({
        title: "Restaurant created",
        description: "Restaurant has been successfully created.",
      });
      setIsAddDialogOpen(false);
      setFormData({
        name: '', slug: '', ownerName: '', ownerEmail: '', ownerPhone: '',
        address: '', city: 'Karachi', planId: null, status: 'active', notes: ''
      });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRestaurantMutation.mutate(formData);
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

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                  <label className="block text-sm font-medium mb-1">Restaurant Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter restaurant name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug</label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="restaurant-slug"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Owner Name</label>
                  <Input
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="Enter owner name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Owner Email</label>
                  <Input
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    placeholder="owner@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input
                    value={formData.ownerPhone}
                    onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                    placeholder="+92 300 1234567"
                  />
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
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter full address"
                />
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
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
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
    </div>
  );
}