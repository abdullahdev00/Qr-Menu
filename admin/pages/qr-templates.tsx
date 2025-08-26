// Admin QR Templates Management Page
// Roman Urdu: Admin QR templates manage karne ka page

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Eye, Download, Users, TrendingUp } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { useToast } from '../hooks/use-toast'
import { apiRequest } from '../lib/queryClient'

interface QrTemplate {
  id: string
  name: string
  description: string
  category: string
  designData: any
  planRestrictions: string[] | null
  usageCount: number
  isActive: boolean
  createdAt: string
  previewUrl?: string
}

export default function QrTemplatesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<QrTemplate | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Add default restaurant table template if none exists
  useEffect(() => {
    const addDefaultTemplate = async () => {
      try {
        const response = await fetch('/api/qr/templates')
        if (response.ok) {
          const data = await response.json()
          const templates = data.templates || []
          
          // Check if restaurant-table template already exists
          const hasRestaurantTemplate = templates.some((t: QrTemplate) => t.category === 'restaurant-table')
          
          if (!hasRestaurantTemplate) {
            const defaultTemplate = {
              name: "Restaurant Table QR Template",
              description: "Complete template with restaurant name, tagline, QR code and table number",
              category: "restaurant-table",
              designData: {
                layout: {
                  logoPosition: 'top-center',
                  qrSize: '200x200',
                  tableNumberStyle: 'bold-bottom',
                  showTagline: true,
                  showRestaurantName: true,
                },
                colors: {
                  primary: '#059669',
                  secondary: '#ECFDF5',
                  qrForeground: '#000000',
                  qrBackground: '#FFFFFF',
                }
              },
              planRestrictions: null,
            }
            
            await apiRequest('POST', '/api/qr/templates', defaultTemplate)
            queryClient.invalidateQueries({ queryKey: ['/api/qr/templates'] })
          }
        }
      } catch (error) {
        console.log('Default template creation skipped:', error)
      }
    }
    
    addDefaultTemplate()
  }, [])

  // Fetch QR templates
  const { data: templatesData, isLoading } = useQuery({
    queryKey: ['/api/qr/templates'],
    select: (data: any) => data.templates || []
  })

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: (templateData: any) => apiRequest('POST', '/api/qr/templates', templateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qr/templates'] })
      setIsCreateDialogOpen(false)
      toast({
        title: "Template Created",
        description: "QR template has been created successfully.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive",
      })
    }
  })

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => 
      apiRequest('PUT', `/api/qr/templates/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qr/templates'] })
      setEditingTemplate(null)
      toast({
        title: "Template Updated",
        description: "QR template has been updated successfully.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to update template",
        variant: "destructive",
      })
    }
  })

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/qr/templates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qr/templates'] })
      toast({
        title: "Template Deleted",
        description: "QR template has been deleted successfully.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete template",
        variant: "destructive",
      })
    }
  })

  const templates: QrTemplate[] = templatesData || []
  
  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory)

  const categories = ['all', ...new Set(templates.map(t => t.category))]

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      modern: 'bg-blue-100 text-blue-800',
      elegant: 'bg-purple-100 text-purple-800',
      vibrant: 'bg-red-100 text-red-800',
      minimalist: 'bg-gray-100 text-gray-800',
      traditional: 'bg-yellow-100 text-yellow-800',
      'restaurant-table': 'bg-green-100 text-green-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const handleCreateTemplate = (formData: FormData) => {
    const templateData = {
      name: formData.get('name'),
      description: formData.get('description'),
      category: formData.get('category'),
      designData: {
        layout: {
          logoPosition: formData.get('logoPosition') || 'top-center',
          qrSize: formData.get('qrSize') || '300x300',
          tableNumberStyle: formData.get('tableNumberStyle') || 'bold-bottom',
        },
        colors: {
          primary: formData.get('primaryColor') || '#2563EB',
          secondary: formData.get('secondaryColor') || '#EFF6FF',
          qrForeground: '#000000',
          qrBackground: '#FFFFFF',
        }
      },
      planRestrictions: formData.get('planRestrictions') 
        ? (formData.get('planRestrictions') as string).split(',').map(s => s.trim())
        : null,
    }
    createTemplateMutation.mutate(templateData)
  }

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="qr-templates-page">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">QR Templates</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage QR code design templates for restaurants
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-template">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New QR Template</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              handleCreateTemplate(formData)
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input id="name" name="name" required data-testid="input-template-name" />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" required>
                    <SelectTrigger data-testid="select-template-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="elegant">Elegant</SelectItem>
                      <SelectItem value="vibrant">Vibrant</SelectItem>
                      <SelectItem value="minimalist">Minimalist</SelectItem>
                      <SelectItem value="traditional">Traditional</SelectItem>
                      <SelectItem value="restaurant-table">Restaurant Table</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  rows={3} 
                  data-testid="input-template-description" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <Input 
                    id="primaryColor" 
                    name="primaryColor" 
                    type="color" 
                    defaultValue="#2563EB"
                    data-testid="input-primary-color" 
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <Input 
                    id="secondaryColor" 
                    name="secondaryColor" 
                    type="color" 
                    defaultValue="#EFF6FF"
                    data-testid="input-secondary-color" 
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="planRestrictions">Plan Restrictions (comma-separated, leave empty for all plans)</Label>
                <Input 
                  id="planRestrictions" 
                  name="planRestrictions" 
                  placeholder="Premium, Enterprise"
                  data-testid="input-plan-restrictions" 
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createTemplateMutation.isPending}
                  data-testid="button-save-template"
                >
                  {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-templates">
              {templates.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-templates">
              {templates.filter(t => t.isActive).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-usage">
              {templates.reduce((sum, t) => sum + (t.usageCount || 0), 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-categories-count">
              {categories.length - 1}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            data-testid={`filter-${category}`}
          >
            {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <Card key={template.id} className="hover:shadow-md transition-shadow" data-testid={`card-template-${template.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {template.description}
                    </CardDescription>
                  </div>
                  <Badge className={getCategoryColor(template.category)}>
                    {template.category}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Template Preview */}
                <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
                  {template.category === 'restaurant-table' ? (
                    <div className="w-full h-full p-2 bg-white rounded-lg shadow-sm">
                      <div className="text-center space-y-1">
                        <h3 className="text-xs font-bold text-gray-800">Restaurant Name</h3>
                        <p className="text-[10px] text-gray-600">Delicious Pakistani Food</p>
                        <div className="w-8 h-8 mx-auto bg-black rounded-sm grid grid-cols-4 gap-[1px] p-[2px]">
                          {[...Array(16)].map((_, i) => (
                            <div key={i} className={`${i % 2 ? 'bg-white' : 'bg-black'} rounded-[1px]`} />
                          ))}
                        </div>
                        <p className="text-[8px] font-semibold text-blue-600">Table #5</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">Template Preview</span>
                  )}
                </div>
                
                {/* Template Stats */}
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Usage: {template.usageCount || 0}</span>
                  <span>Status: {template.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                
                {/* Plan Restrictions */}
                {template.planRestrictions && template.planRestrictions.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.planRestrictions.map(plan => (
                      <Badge key={plan} variant="outline" className="text-xs">
                        {plan}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex justify-between">
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditingTemplate(template)}
                      data-testid={`button-edit-${template.id}`}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this template?')) {
                          deleteTemplateMutation.mutate(template.id)
                        }
                      }}
                      data-testid={`button-delete-${template.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button size="sm" variant="outline" data-testid={`button-preview-${template.id}`}>
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {filteredTemplates.length === 0 && !isLoading && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-gray-500 text-lg mb-4">No templates found</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}