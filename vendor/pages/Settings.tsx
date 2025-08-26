import { useState } from "react";
import { VendorLayout } from "../components/VendorLayout";
import { Button } from "../../admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { Input } from "../../admin/components/ui/input";
import { Label } from "../../admin/components/ui/label";
import { Textarea } from "../../admin/components/ui/textarea";
import { Switch } from "../../admin/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../admin/components/ui/select";
import { Badge } from "../../admin/components/ui/badge";
import { 
  Save,
  Building,
  Clock,
  DollarSign,
  Bell,
  Users,
  Shield
} from "lucide-react";

const businessHours = [
  { day: 'Monday', open: '09:00', close: '22:00', closed: false },
  { day: 'Tuesday', open: '09:00', close: '22:00', closed: false },
  { day: 'Wednesday', open: '09:00', close: '22:00', closed: false },
  { day: 'Thursday', open: '09:00', close: '22:00', closed: false },
  { day: 'Friday', open: '09:00', close: '22:00', closed: false },
  { day: 'Saturday', open: '10:00', close: '23:00', closed: false },
  { day: 'Sunday', open: '10:00', close: '21:00', closed: false },
];

export function Settings() {
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: "Karachi Kitchen",
    address: "123 Main Street, Karachi, Pakistan",
    phone: "+92 321 1234567",
    email: "info@karachikitchen.com",
    description: "Authentic Pakistani cuisine in the heart of Karachi"
  });

  const [taxSettings, setTaxSettings] = useState({
    taxRate: "16",
    serviceCharge: "10",
    currency: "PKR"
  });

  const [notifications, setNotifications] = useState({
    emailOrders: true,
    smsOrders: false,
    emailFeedback: true,
    pushNotifications: true
  });

  const [ordering, setOrdering] = useState({
    allowOnlineOrdering: true,
    allowTableReservation: false,
    autoAcceptOrders: false,
    requireCustomerInfo: true
  });

  return (
    <VendorLayout restaurantName="Karachi Kitchen" ownerName="Ahmed Ali">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Restaurant Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your restaurant profile and preferences
            </p>
          </div>
          <Button data-testid="save-all-settings">
            <Save className="w-4 h-4 mr-2" />
            Save All Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Restaurant Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Restaurant Information
              </CardTitle>
              <CardDescription>
                Basic information about your restaurant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restaurant-name">Restaurant Name</Label>
                <Input
                  id="restaurant-name"
                  value={restaurantInfo.name}
                  onChange={(e) => setRestaurantInfo({...restaurantInfo, name: e.target.value})}
                  data-testid="restaurant-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="restaurant-address">Address</Label>
                <Textarea
                  id="restaurant-address"
                  value={restaurantInfo.address}
                  onChange={(e) => setRestaurantInfo({...restaurantInfo, address: e.target.value})}
                  rows={2}
                  data-testid="restaurant-address-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurant-phone">Phone</Label>
                  <Input
                    id="restaurant-phone"
                    value={restaurantInfo.phone}
                    onChange={(e) => setRestaurantInfo({...restaurantInfo, phone: e.target.value})}
                    data-testid="restaurant-phone-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restaurant-email">Email</Label>
                  <Input
                    id="restaurant-email"
                    type="email"
                    value={restaurantInfo.email}
                    onChange={(e) => setRestaurantInfo({...restaurantInfo, email: e.target.value})}
                    data-testid="restaurant-email-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="restaurant-description">Description</Label>
                <Textarea
                  id="restaurant-description"
                  value={restaurantInfo.description}
                  onChange={(e) => setRestaurantInfo({...restaurantInfo, description: e.target.value})}
                  rows={3}
                  data-testid="restaurant-description-input"
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Business Hours
              </CardTitle>
              <CardDescription>
                Set your restaurant's operating hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {businessHours.map((day, index) => (
                <div key={day.day} className="flex items-center justify-between space-x-4">
                  <div className="w-20">
                    <Label className="text-sm font-medium">{day.day}</Label>
                  </div>
                  <div className="flex items-center space-x-2 flex-1">
                    <Input
                      type="time"
                      value={day.open}
                      disabled={day.closed}
                      className="w-24"
                      data-testid={`${day.day.toLowerCase()}-open`}
                    />
                    <span className="text-gray-500">to</span>
                    <Input
                      type="time"
                      value={day.close}
                      disabled={day.closed}
                      className="w-24"
                      data-testid={`${day.day.toLowerCase()}-close`}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={!day.closed}
                      data-testid={`${day.day.toLowerCase()}-open-switch`}
                    />
                    <Label className="text-sm">Open</Label>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tax & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Tax & Pricing Settings
              </CardTitle>
              <CardDescription>
                Configure tax rates and pricing options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    value={taxSettings.taxRate}
                    onChange={(e) => setTaxSettings({...taxSettings, taxRate: e.target.value})}
                    placeholder="16"
                    data-testid="tax-rate-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service-charge">Service Charge (%)</Label>
                  <Input
                    id="service-charge"
                    type="number"
                    value={taxSettings.serviceCharge}
                    onChange={(e) => setTaxSettings({...taxSettings, serviceCharge: e.target.value})}
                    placeholder="10"
                    data-testid="service-charge-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={taxSettings.currency} onValueChange={(value) => setTaxSettings({...taxSettings, currency: value})}>
                  <SelectTrigger data-testid="currency-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PKR">Pakistani Rupee (PKR)</SelectItem>
                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Email for New Orders</Label>
                  <p className="text-sm text-gray-500">Get notified when new orders come in</p>
                </div>
                <Switch
                  checked={notifications.emailOrders}
                  onCheckedChange={(checked) => setNotifications({...notifications, emailOrders: checked})}
                  data-testid="email-orders-switch"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">SMS for Orders</Label>
                  <p className="text-sm text-gray-500">Receive SMS notifications for urgent orders</p>
                </div>
                <Switch
                  checked={notifications.smsOrders}
                  onCheckedChange={(checked) => setNotifications({...notifications, smsOrders: checked})}
                  data-testid="sms-orders-switch"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Email for Feedback</Label>
                  <p className="text-sm text-gray-500">Get notified about customer reviews</p>
                </div>
                <Switch
                  checked={notifications.emailFeedback}
                  onCheckedChange={(checked) => setNotifications({...notifications, emailFeedback: checked})}
                  data-testid="email-feedback-switch"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Push Notifications</Label>
                  <p className="text-sm text-gray-500">Browser notifications for real-time updates</p>
                </div>
                <Switch
                  checked={notifications.pushNotifications}
                  onCheckedChange={(checked) => setNotifications({...notifications, pushNotifications: checked})}
                  data-testid="push-notifications-switch"
                />
              </div>
            </CardContent>
          </Card>

          {/* Ordering Settings */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Ordering & Customer Settings
              </CardTitle>
              <CardDescription>
                Configure how customers can interact with your restaurant
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Allow Online Ordering</Label>
                    <p className="text-sm text-gray-500">Enable customers to place orders online</p>
                  </div>
                  <Switch
                    checked={ordering.allowOnlineOrdering}
                    onCheckedChange={(checked) => setOrdering({...ordering, allowOnlineOrdering: checked})}
                    data-testid="online-ordering-switch"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Table Reservations</Label>
                    <p className="text-sm text-gray-500">Allow customers to book tables</p>
                  </div>
                  <Switch
                    checked={ordering.allowTableReservation}
                    onCheckedChange={(checked) => setOrdering({...ordering, allowTableReservation: checked})}
                    data-testid="table-reservation-switch"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Auto-Accept Orders</Label>
                    <p className="text-sm text-gray-500">Automatically accept incoming orders</p>
                  </div>
                  <Switch
                    checked={ordering.autoAcceptOrders}
                    onCheckedChange={(checked) => setOrdering({...ordering, autoAcceptOrders: checked})}
                    data-testid="auto-accept-orders-switch"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Require Customer Info</Label>
                    <p className="text-sm text-gray-500">Ask for customer details with orders</p>
                  </div>
                  <Switch
                    checked={ordering.requireCustomerInfo}
                    onCheckedChange={(checked) => setOrdering({...ordering, requireCustomerInfo: checked})}
                    data-testid="require-customer-info-switch"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Account Status & Plan
              </CardTitle>
              <CardDescription>
                Your current subscription and account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mb-2">
                    Active
                  </Badge>
                  <h3 className="font-medium text-green-900 dark:text-green-100">Account Status</h3>
                  <p className="text-sm text-green-700 dark:text-green-300">Your account is active and in good standing</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">
                    Premium
                  </Badge>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100">Current Plan</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Premium subscription with unlimited menus</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 mb-2">
                    15 Feb 2024
                  </Badge>
                  <h3 className="font-medium text-purple-900 dark:text-purple-100">Next Billing</h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300">PKR 2,500 monthly subscription</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </VendorLayout>
  );
}