import React from 'react'
import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog'
import { useToast } from '../hooks/use-toast'
import { apiRequest } from '../lib/queryClient'
import type { SubscriptionPlan } from '../../shared/schema'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface PlanFormData {
  name: string
  description: string
  price: number
  features: string[]
  qrLimit: number
  menuLimit: number
  analytics: boolean
  customization: boolean
  priority: 'low' | 'medium' | 'high'
}

export default function Subscriptions() {
  const [, setLocation] = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null)
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    description: '',
    price: 0,
    features: [],
    qrLimit: 10,
    menuLimit: 5,
    analytics: false,
    customization: false,
    priority: 'medium'
  })
  const [featuresText, setFeaturesText] = useState('')

  const { toast } = useToast()
  const queryClient = useQueryClient()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      setLocation('/login')
    }
  }, [])

  const { data: plans, isLoading } = useQuery({
    queryKey: ['/api/subscription-plans'],
    enabled: !!user,
  })

  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: async (data: PlanFormData) => {
      const response = await fetch('/api/subscription-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          features: featuresText.split('\n').filter(f => f.trim())
        }),
      })
      if (!response.ok) throw new Error('Failed to create plan')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-plans'] })
      setIsCreateDialogOpen(false)
      resetForm()
      toast({
        title: "Success",
        description: "Subscription plan created successfully.",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create subscription plan.",
        variant: "destructive",
      })
    },
  })

  // Update plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: PlanFormData }) => {
      const response = await fetch(`/api/subscription-plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          features: featuresText.split('\n').filter(f => f.trim())
        }),
      })
      if (!response.ok) throw new Error('Failed to update plan')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-plans'] })
      setIsEditDialogOpen(false)
      resetForm()
      toast({
        title: "Success",
        description: "Subscription plan updated successfully.",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update subscription plan.",
        variant: "destructive",
      })
    },
  })

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/subscription-plans/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete plan')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-plans'] })
      setIsDeleteDialogOpen(false)
      setPlanToDelete(null)
      toast({
        title: "Success",
        description: "Subscription plan deleted successfully.",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete subscription plan.",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan.id, data: formData })
    } else {
      createPlanMutation.mutate(formData)
    }
  }

  const handleEditPlan = (plan: any) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      description: '',
      price: parseInt(plan.price) || 0,
      features: Array.isArray(plan.features) ? plan.features : [],
      qrLimit: plan.maxMenuItems || 10,
      menuLimit: 5,
      analytics: false,
      customization: false,
      priority: 'medium'
    })
    setFeaturesText(Array.isArray(plan.features) ? plan.features.join('\n') : '')
    setIsEditDialogOpen(true)
  }

  const handleDeletePlan = (plan: SubscriptionPlan) => {
    setPlanToDelete(plan)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (planToDelete) {
      deletePlanMutation.mutate(planToDelete.id)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      features: [],
      qrLimit: 10,
      menuLimit: 5,
      analytics: false,
      customization: false,
      priority: 'medium'
    })
    setFeaturesText('')
    setEditingPlan(null)
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">High</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Medium</Badge>
      case 'low':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Low</Badge>
      default:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{priority}</Badge>
    }
  }

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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subscription Plans</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage subscription plans for your restaurant clients</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Plan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Basic Plan"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (PKR)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    placeholder="2500"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Plan description..."
                />
              </div>

              <div>
                <Label htmlFor="features">Features (one per line)</Label>
                <Textarea
                  id="features"
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="Digital Menu&#10;QR Code Generation&#10;Basic Analytics"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="qrLimit">QR Code Limit</Label>
                  <Input
                    id="qrLimit"
                    type="number"
                    value={formData.qrLimit}
                    onChange={(e) => setFormData({ ...formData, qrLimit: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="menuLimit">Menu Limit</Label>
                  <Input
                    id="menuLimit"
                    type="number"
                    value={formData.menuLimit}
                    onChange={(e) => setFormData({ ...formData, menuLimit: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPlanMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createPlanMutation.isPending ? 'Creating...' : 'Create Plan'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(plans) && plans.map((plan: any) => (
            <Card key={plan.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold text-blue-600">₨{plan.price}</span>
                      <span className="text-sm text-gray-500">/month</span>
                      {getPriorityBadge('medium')}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPlan(plan)}
                      data-testid={`button-edit-plan-${plan.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePlan(plan)}
                      className="text-red-600 hover:text-red-900"
                      data-testid={`button-delete-plan-${plan.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Subscription plan for restaurants</p>
                <div className="space-y-2">
                  {Array.isArray(plan.features) && plan.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                      {feature}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Menu Items:</span>
                      <span className="ml-1 font-medium">{plan.maxMenuItems || 'Unlimited'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="ml-1 font-medium">{plan.duration || 30} days</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Plan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Plan Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Basic Plan"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-price">Price (PKR)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  placeholder="2500"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Plan description..."
              />
            </div>

            <div>
              <Label htmlFor="edit-features">Features (one per line)</Label>
              <Textarea
                id="edit-features"
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                placeholder="Digital Menu&#10;QR Code Generation&#10;Basic Analytics"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-qrLimit">QR Code Limit</Label>
                <Input
                  id="edit-qrLimit"
                  type="number"
                  value={formData.qrLimit}
                  onChange={(e) => setFormData({ ...formData, qrLimit: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-menuLimit">Menu Limit</Label>
                <Input
                  id="edit-menuLimit"
                  type="number"
                  value={formData.menuLimit}
                  onChange={(e) => setFormData({ ...formData, menuLimit: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updatePlanMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updatePlanMutation.isPending ? 'Updating...' : 'Update Plan'}
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
              This will permanently delete "{planToDelete?.name}" subscription plan.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deletePlanMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletePlanMutation.isPending ? 'Deleting...' : 'Delete Plan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}