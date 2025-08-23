import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { login, setCurrentUser } from "@/lib/auth";
import { 
  QrCode, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  Sparkles,
  Check,
  ArrowRight,
  Globe,
  Users,
  TrendingUp
} from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "admin@demo.com",
    password: "password123",
    remember: false,
  });

  const features = [
    { icon: QrCode, text: "QR Menu Generation", color: "text-blue-500" },
    { icon: Users, text: "Multi-Restaurant Management", color: "text-green-500" },
    { icon: TrendingUp, text: "Real-time Analytics", color: "text-purple-500" },
    { icon: Globe, text: "Pakistani Market Focus", color: "text-orange-500" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login(formData.email, formData.password);
      setCurrentUser(user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full blur-xl opacity-60 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-purple-200 rounded-full blur-xl opacity-40 animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-green-200 rounded-full blur-xl opacity-50 animate-pulse delay-2000"></div>
      
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Features and Branding */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <QrCode className="text-white w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    QR Menu Admin
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Restaurant Management Platform
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                  Powerful Features for Pakistani Restaurants
                </h2>
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-4 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300"
                  >
                    <div className={`w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${feature.color}`}>
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{feature.text}</span>
                    <Check className="w-5 h-5 text-green-500 ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <QrCode className="text-white w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Sign in to access your admin dashboard
                  </p>
                  <Badge className="mt-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                    <Shield className="w-3 h-3 mr-1" />
                    Secure Login
                  </Badge>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="admin@example.com"
                        className={`pl-10 h-12 border-2 transition-all duration-300 ${
                          focusedField === 'email' 
                            ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' 
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                        data-testid="input-email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="••••••••"
                        className={`pl-10 pr-12 h-12 border-2 transition-all duration-300 ${
                          focusedField === 'password' 
                            ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' 
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                        data-testid="input-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={formData.remember}
                        onCheckedChange={(checked) => setFormData({ ...formData, remember: !!checked })}
                        data-testid="checkbox-remember"
                        className="border-2"
                      />
                      <Label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                        Remember me for 30 days
                      </Label>
                    </div>
                    <button 
                      type="button" 
                      className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg transform transition-all duration-300 hover:scale-105 disabled:transform-none"
                    data-testid="button-login"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Sign In to Dashboard</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Demo Access</span>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                      Use these credentials to explore the platform:
                    </p>
                    <div className="text-xs font-mono bg-white dark:bg-gray-800 rounded-lg p-2 text-gray-600 dark:text-gray-300">
                      <div>Email: admin@demo.com</div>
                      <div>Password: password123</div>
                    </div>
                  </div>
                </div>

                {/* Mobile Features Preview */}
                <div className="lg:hidden mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Platform Features
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {features.slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                        <feature.icon className={`w-4 h-4 ${feature.color}`} />
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
