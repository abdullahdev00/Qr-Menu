import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../lib/role-auth';
import { ChefHat, Truck, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function StaffLoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    role: '' as 'chef' | 'delivery_boy' | ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const credentials = {
        ...(loginType === 'email' ? { email: formData.email } : { phone: formData.phone }),
        password: formData.password,
        role: formData.role
      };

      const result = await login(credentials);
      
      if (result.success && result.user) {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${result.user.name}!`,
        });

        // Redirect based on role - use window.location for staff to force proper navigation
        if (result.user.role === 'chef') {
          window.location.href = result.user.restaurantSlug ? `/${result.user.restaurantSlug}/kitchen` : '/kitchen';
        } else if (result.user.role === 'delivery_boy') {
          window.location.href = result.user.restaurantSlug ? `/${result.user.restaurantSlug}/delivery` : '/delivery';
        } else {
          setLocation('/dashboard');
        }
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const roleConfig = {
    chef: {
      icon: ChefHat,
      label: 'Kitchen Chef',
      description: 'Access kitchen dashboard to manage food preparation',
      color: 'from-orange-500 to-red-500'
    },
    delivery_boy: {
      icon: Truck,
      label: 'Delivery Staff',
      description: 'Access delivery dashboard to manage orders',
      color: 'from-blue-500 to-cyan-500'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Staff Login
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Kitchen & Delivery Team Access
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-semibold">
              Access Your Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role">Select Your Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value: 'chef' | 'delivery_boy') => setFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleConfig).map(([role, config]) => {
                      const Icon = config.icon;
                      return (
                        <SelectItem key={role} value={role}>
                          <div className="flex items-center space-x-2">
                            <Icon className="w-4 h-4" />
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {formData.role && (
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 bg-gradient-to-r ${roleConfig[formData.role].color} rounded-lg flex items-center justify-center`}>
                        {(() => {
                          const Icon = roleConfig[formData.role].icon;
                          return <Icon className="w-4 h-4 text-white" />;
                        })()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{roleConfig[formData.role].label}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {roleConfig[formData.role].description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Login Type Toggle */}
              <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                <Button
                  type="button"
                  variant={loginType === 'email' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setLoginType('email')}
                >
                  Email
                </Button>
                <Button
                  type="button"
                  variant={loginType === 'phone' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setLoginType('phone')}
                >
                  Phone
                </Button>
              </div>

              {/* Login Field */}
              <div className="space-y-2">
                <Label htmlFor={loginType}>
                  {loginType === 'email' ? 'Email Address' : 'Phone Number'}
                </Label>
                <Input
                  id={loginType}
                  type={loginType === 'email' ? 'email' : 'tel'}
                  placeholder={loginType === 'email' ? 'chef@restaurant.com' : '+92300XXXXXXX'}
                  value={loginType === 'email' ? formData.email : formData.phone}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    [loginType]: e.target.value,
                    [loginType === 'email' ? 'phone' : 'email']: '' // Clear the other field
                  }))}
                  required
                  data-testid={`input-${loginType}`}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    data-testid="input-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold"
                disabled={loading || !formData.role || !formData.password || (!formData.email && !formData.phone)}
                data-testid="btn-login"
              >
                {loading ? 'Logging in...' : 'Access Dashboard'}
              </Button>

              {/* Links */}
              <div className="text-center space-y-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-gray-600 dark:text-gray-400"
                  onClick={() => setLocation('/login')}
                >
                  Admin Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}