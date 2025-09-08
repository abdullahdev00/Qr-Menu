import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardHeader, CardTitle } from '../../admin/components/ui/card'
import { Button } from '../../admin/components/ui/button'
import { Input } from '../../admin/components/ui/input'
import { Label } from '../../admin/components/ui/label'
import { Textarea } from '../../admin/components/ui/textarea'
import { Switch } from '../../admin/components/ui/switch'
import { Badge } from '../../admin/components/ui/badge'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  CreditCard,
  Store,
  Home,
  ChefHat,
  ShoppingBag,
  BarChart3,
  Eye,
  Save,
  Phone,
  Mail,
  MapPin,
  Users,
  Plus,
  Trash2,
  Edit,
  Truck
} from 'lucide-react'
import { Link } from 'wouter'
import { useToast } from '../../admin/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../admin/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../admin/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../admin/components/ui/table'

interface User {
  id: string
  name: string
  email: string
  role: string
  restaurantName?: string
  restaurantId?: string
}

interface StaffMember {
  id: string
  name: string
  email: string
  phone?: string
  role: 'chef' | 'delivery_boy'
  isActive: boolean
  createdAt: string
}

export default function VendorSettings() {
  const [location, setLocation] = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const { toast } = useToast()

  // Staff Management State
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false)
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: '' as 'chef' | 'delivery_boy' | ''
  })
  const [isLoadingStaff, setIsLoadingStaff] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    restaurantName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notifications: {
      orderAlerts: true,
      menuUpdates: true,
      paymentReminders: true,
      systemUpdates: false
    }
  })

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      if (userData.role === 'restaurant') {
        setUser(userData)
        setFormData(prev => ({
          ...prev,
          restaurantName: userData.restaurantName || '',
          ownerName: userData.name || '',
          email: userData.email || ''
        }))
        // Load staff members
        loadStaffMembers(userData.restaurantId)
      } else {
        setLocation('/dashboard')
      }
    } else {
      setLocation('/login')
    }
  }, [])

  // Load Staff Members
  const loadStaffMembers = async (restaurantId: string) => {
    if (!restaurantId) return
    
    setIsLoadingStaff(true)
    try {
      const response = await fetch(`/api/staff?restaurantId=${restaurantId}`)
      if (response.ok) {
        const data = await response.json()
        setStaffMembers(data)
      }
    } catch (error) {
      console.error('Error loading staff:', error)
    } finally {
      setIsLoadingStaff(false)
    }
  }

  // Add Staff Member
  const handleAddStaff = async () => {
    if (!user?.restaurantId || !staffFormData.name || !staffFormData.email || !staffFormData.password || !staffFormData.role) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      })
      return
    }

    setIsLoadingStaff(true)
    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...staffFormData,
          restaurantId: user.restaurantId
        })
      })

      if (response.ok) {
        const newStaff = await response.json()
        setStaffMembers(prev => [...prev, newStaff])
        setStaffFormData({ name: '', email: '', phone: '', password: '', role: '' as any })
        setIsAddStaffDialogOpen(false)
        toast({
          title: "Staff Added",
          description: `${staffFormData.role === 'chef' ? 'Chef' : 'Delivery staff'} has been added successfully`,
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to add staff member",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive"
      })
    } finally {
      setIsLoadingStaff(false)
    }
  }

  // Remove Staff Member
  const handleRemoveStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return

    setIsLoadingStaff(true)
    try {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setStaffMembers(prev => prev.filter(s => s.id !== staffId))
        toast({
          title: "Staff Removed",
          description: "Staff member has been removed successfully",
        })
      } else {
        toast({
          title: "Error", 
          description: "Failed to remove staff member",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive"
      })
    } finally {
      setIsLoadingStaff(false)
    }
  }

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your restaurant settings have been updated successfully.",
    })
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


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Restaurant Profile */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Store className="w-5 h-5 text-blue-600" />
                <span>Restaurant Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurantName">Restaurant Name</Label>
                  <Input
                    id="restaurantName"
                    value={formData.restaurantName}
                    onChange={(e) => setFormData(prev => ({ ...prev, restaurantName: e.target.value }))}
                    placeholder="Enter restaurant name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                    placeholder="Enter owner name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter restaurant address"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Enter city"
                />
              </div>
            </CardContent>
          </Card>

          {/* Staff Management Section */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-900 dark:to-purple-950/30">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span>Staff Management</span>
                </div>
                <Dialog open={isAddStaffDialogOpen} onOpenChange={setIsAddStaffDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Staff
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Staff Member</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="staffName">Name *</Label>
                        <Input
                          id="staffName"
                          value={staffFormData.name}
                          onChange={(e) => setStaffFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter staff name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="staffEmail">Email *</Label>
                        <Input
                          id="staffEmail"
                          type="email"
                          value={staffFormData.email}
                          onChange={(e) => setStaffFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter email address"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="staffPhone">Phone</Label>
                        <Input
                          id="staffPhone"
                          value={staffFormData.phone}
                          onChange={(e) => setStaffFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="staffPassword">Password *</Label>
                        <Input
                          id="staffPassword"
                          type="password"
                          value={staffFormData.password}
                          onChange={(e) => setStaffFormData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="staffRole">Role *</Label>
                        <Select
                          value={staffFormData.role}
                          onValueChange={(value: 'chef' | 'delivery_boy') => 
                            setStaffFormData(prev => ({ ...prev, role: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="chef">
                              <div className="flex items-center space-x-2">
                                <ChefHat className="w-4 h-4" />
                                <span>Kitchen Chef</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="delivery_boy">
                              <div className="flex items-center space-x-2">
                                <Truck className="w-4 h-4" />
                                <span>Delivery Staff</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsAddStaffDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleAddStaff}
                          disabled={isLoadingStaff}
                        >
                          {isLoadingStaff ? 'Adding...' : 'Add Staff'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStaff && staffMembers.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Loading staff members...</p>
                </div>
              ) : staffMembers.length === 0 ? (
                <div className="text-center py-6">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 mb-2">No staff members added yet</p>
                  <p className="text-sm text-gray-400">Add your kitchen chef and delivery staff to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffMembers.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell className="font-medium">{staff.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {staff.role === 'chef' ? (
                              <ChefHat className="w-4 h-4 text-orange-500" />
                            ) : (
                              <Truck className="w-4 h-4 text-blue-500" />
                            )}
                            <span className="capitalize">
                              {staff.role === 'chef' ? 'Kitchen Chef' : 'Delivery Staff'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{staff.email}</div>
                            {staff.phone && <div className="text-gray-500">{staff.phone}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={staff.isActive ? "default" : "secondary"}>
                            {staff.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveStaff(staff.id)}
                            disabled={isLoadingStaff}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notification Settings */}
        <div className="space-y-6">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Order Alerts</Label>
                  <p className="text-sm text-gray-500">Get notified about new orders</p>
                </div>
                <Switch
                  checked={formData.notifications.orderAlerts}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      notifications: { ...prev.notifications, orderAlerts: checked } 
                    }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Menu Updates</Label>
                  <p className="text-sm text-gray-500">Updates about menu changes</p>
                </div>
                <Switch
                  checked={formData.notifications.menuUpdates}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      notifications: { ...prev.notifications, menuUpdates: checked } 
                    }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Payment Reminders</Label>
                  <p className="text-sm text-gray-500">Subscription payment alerts</p>
                </div>
                <Switch
                  checked={formData.notifications.paymentReminders}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      notifications: { ...prev.notifications, paymentReminders: checked } 
                    }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>System Updates</Label>
                  <p className="text-sm text-gray-500">Platform announcements</p>
                </div>
                <Switch
                  checked={formData.notifications.systemUpdates}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      notifications: { ...prev.notifications, systemUpdates: checked } 
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Plan Status */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50/50 dark:from-gray-900 dark:to-green-950/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                <span>Current Plan</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-3">
                <Badge className="bg-green-100 text-green-800">Pro Plan</Badge>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Unlimited menu items • QR codes • Analytics
                </p>
                <p className="text-xs text-gray-500">
                  Renews: March 15, 2024
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}