import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, CreditCard, University, Save } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  
  const [generalSettings, setGeneralSettings] = useState({
    companyName: "QR Menu Generator",
    supportEmail: "support@qrmenu.pk",
    currency: "PKR",
  });

  const [paymentSettings, setPaymentSettings] = useState({
    jazzcash: true,
    easypaisa: true,
    bankTransfer: true,
  });

  const handleSaveGeneral = () => {
    toast({
      title: "Settings saved",
      description: "General settings have been updated successfully.",
    });
  };

  const handleTogglePayment = (method: string, enabled: boolean) => {
    setPaymentSettings(prev => ({ ...prev, [method]: enabled }));
    toast({
      title: "Payment method updated",
      description: `${method.charAt(0).toUpperCase() + method.slice(1)} has been ${enabled ? 'enabled' : 'disabled'}.`,
    });
  };

  return (
    <div className="space-y-8">
      {/* General Settings */}
      <Card>
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle>General Settings</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure basic platform settings
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={generalSettings.companyName}
                onChange={(e) => setGeneralSettings({ ...generalSettings, companyName: e.target.value })}
                data-testid="input-company-name"
              />
            </div>
            <div>
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={generalSettings.supportEmail}
                onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                data-testid="input-support-email"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="currency">Default Currency</Label>
            <Select 
              value={generalSettings.currency} 
              onValueChange={(value) => setGeneralSettings({ ...generalSettings, currency: value })}
            >
              <SelectTrigger className="w-full md:w-1/3" data-testid="select-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PKR">PKR - Pakistani Rupee</SelectItem>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveGeneral} data-testid="button-save-general">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Gateway Settings */}
      <Card>
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle>Payment Gateways</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure payment methods for Pakistani market
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* JazzCash */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">JazzCash</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mobile wallet payments</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-success">Connected</span>
              <Switch
                checked={paymentSettings.jazzcash}
                onCheckedChange={(checked) => handleTogglePayment('jazzcash', checked)}
                data-testid="switch-jazzcash"
              />
            </div>
          </div>

          {/* EasyPaisa */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">EasyPaisa</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Digital payments platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-success">Connected</span>
              <Switch
                checked={paymentSettings.easypaisa}
                onCheckedChange={(checked) => handleTogglePayment('easypaisa', checked)}
                data-testid="switch-easypaisa"
              />
            </div>
          </div>

          {/* Bank Transfer */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <University className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Bank Transfer</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Direct bank transfers</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-success">Active</span>
              <Switch
                checked={paymentSettings.bankTransfer}
                onCheckedChange={(checked) => handleTogglePayment('bankTransfer', checked)}
                data-testid="switch-bank-transfer"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Templates */}
      <Card>
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle>Email Templates</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Customize automated email templates
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex-col space-y-2"
              data-testid="button-welcome-template"
            >
              <div className="text-sm font-medium">Welcome Email</div>
              <div className="text-xs text-gray-500">New restaurant onboarding</div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex-col space-y-2"
              data-testid="button-payment-template"
            >
              <div className="text-sm font-medium">Payment Confirmation</div>
              <div className="text-xs text-gray-500">Subscription payments</div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex-col space-y-2"
              data-testid="button-reminder-template"
            >
              <div className="text-sm font-medium">Payment Reminder</div>
              <div className="text-xs text-gray-500">Overdue notifications</div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex-col space-y-2"
              data-testid="button-support-template"
            >
              <div className="text-sm font-medium">Support Response</div>
              <div className="text-xs text-gray-500">Ticket replies</div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Version</Label>
              <p className="text-sm text-gray-900 dark:text-white">v2.1.0</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Update</Label>
              <p className="text-sm text-gray-900 dark:text-white">January 15, 2024</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Database Status</Label>
              <p className="text-sm text-success">Connected</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Server Region</Label>
              <p className="text-sm text-gray-900 dark:text-white">Asia Pacific (Mumbai)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
