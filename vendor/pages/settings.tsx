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
  MapPin
} from 'lucide-react'
import { Link } from 'wouter'
import { useToast } from '../../admin/hooks/use-toast'

interface User {
  id: string
  name: string
  email: string
  role: string
  restaurantName?: string
}

export default function VendorSettings() {
  const [location, setLocation] = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const { toast } = useToast()

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
      } else {
        setLocation('/dashboard')
      }
    } else {
      setLocation('/login')
    }
  }, [])

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