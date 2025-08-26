import React from 'react'
import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import KpiCards from '../components/dashboard/kpi-cards'
import RevenueChart from '../components/dashboard/revenue-chart'
import RecentActivity from '../components/dashboard/recent-activity'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { useToast } from '../lib/use-toast'

interface User {
  id: string
  name: string
  email: string
  role: string
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

export default function Dashboard() {
  console.log('🚀 Dashboard component function called!')
  
  const [, setLocation] = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  
  // Debug logs
  console.log('✅ Dashboard component rendered, isAddDialogOpen:', isAddDialogOpen)
  console.log('🔍 Current location:', window.location.pathname)
  const { toast } = useToast()
  const queryClient = useQueryClient()

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
  })

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      if (userData.role === 'restaurant') {
        setLocation('/restaurant-dashboard')
      } else {
        setUser(userData)
      }
    } else {
      setLocation('/login')
    }
  }, [])

  // Manual event listener for button debugging
  useEffect(() => {
    const handleButtonClick = () => {
      console.log('Manual event listener triggered!')
      setIsAddDialogOpen(true)
    }

    const button = document.querySelector('[data-testid="button-add-restaurant"]')
    if (button) {
      console.log('Button found in DOM, adding manual listener')
      button.addEventListener('click', handleButtonClick)
      return () => button.removeEventListener('click', handleButtonClick)
    } else {
      console.log('Button NOT found in DOM')
    }
  }, [user])

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
    enabled: !!user,
  })

  // Fetch subscription plans for the form
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRestaurantMutation.mutate(formData);
  };

  const resetForm = () => {
    setFormData({
      name: '', slug: '', ownerName: '', ownerEmail: '', ownerPhone: '',
      address: '', city: 'Karachi', planId: null, status: 'active', notes: ''
    });
  };

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
    <>
      <div className="space-y-6">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <KpiCards />
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <RevenueChart />
          </div>
          <div className="col-span-3">
            <RecentActivity />
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="grid gap-4 grid-cols-1">
          <div className="col-span-1">
            <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 rounded-xl p-4 sm:p-6 shadow-lg border-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions - Dialog State: {isAddDialogOpen ? 'OPEN' : 'CLOSED'}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('React onClick handler triggered!');
                    setIsAddDialogOpen(true);
                  }}
                  className="flex flex-col items-center p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
                  data-testid="button-add-restaurant"
                  type="button"
                  style={{ pointerEvents: 'auto' }}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center mb-2 sm:mb-3">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-center">Add Restaurant</span>
                </button>
                
                <button className="flex flex-col items-center p-3 sm:p-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center mb-2 sm:mb-3">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-center">Process Payment</span>
                </button>
                
                <button className="flex flex-col items-center p-3 sm:p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center mb-2 sm:mb-3">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-center">User Management</span>
                </button>
                
                <button className="flex flex-col items-center p-3 sm:p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center mb-2 sm:mb-3">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-center">View Reports</span>
                </button>
              </div>
              
              <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                  <button className="px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:shadow-md transition-all duration-200 text-xs sm:text-sm font-medium text-center">
                    Export Data
                  </button>
                  <button className="px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:shadow-md transition-all duration-200 text-xs sm:text-sm font-medium text-center">
                    System Settings
                  </button>
                  <button className="px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:shadow-md transition-all duration-200 text-xs sm:text-sm font-medium text-center">
                    Backup Data
                  </button>
                  <button className="px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:shadow-md transition-all duration-200 text-xs sm:text-sm font-medium text-center">
                    Send Notifications
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Restaurant Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) resetForm();
      }}>
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
                        {plan.name} - PKR {plan.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: 'active' | 'inactive' | 'suspended') => setFormData({ ...formData, status: value })}
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
                placeholder="Additional notes (optional)"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createRestaurantMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createRestaurantMutation.isPending ? 'Creating...' : 'Create Restaurant'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}