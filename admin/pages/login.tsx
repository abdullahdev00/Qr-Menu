import React from 'react'
import { useState } from 'react'
import { useLocation } from 'wouter'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/card'
import { Label } from '../components/ui/label'
import { useToast } from '../lib/use-toast'
import { Shield, Store, Mail, Phone, Lock } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loginType, setLoginType] = useState<'admin' | 'restaurant'>('admin')
  const [restaurantAuthType, setRestaurantAuthType] = useState<'email' | 'phone'>('email')
  const [, setLocation] = useLocation()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const endpoint = loginType === 'admin' ? '/api/auth/login' : '/api/auth/restaurant-login'
      
      // For restaurant login, use either email or phone
      const loginData = loginType === 'admin' ? 
        { email, password } : 
        restaurantAuthType === 'email' ? 
          { email, password } : 
          { phone, password }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('user', JSON.stringify(data.user))
        toast({
          title: "Login successful", 
          description: `Welcome back${loginType === 'restaurant' ? ' to your restaurant panel' : ' to admin panel'}!`,
        })
        // Refresh the page to update authentication status
        window.location.href = '/dashboard'
      } else {
        toast({
          title: "Login failed",
          description: "Invalid credentials",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const setDefaultCredentials = (type: 'admin' | 'restaurant') => {
    setLoginType(type)
    if (type === 'admin') {
      setEmail('admin@demo.com')
      setPassword('password123')
      setPhone('')
    } else {
      if (restaurantAuthType === 'email') {
        setEmail('ahmed@albaik.com')
        setPhone('')
      } else {
        setPhone('03001234567')
        setEmail('')
      }
      setPassword('restaurant123')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">QR Menu Generator</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Multi-Vendor Platform</p>
              </div>
            </div>
            
            {/* Login Type Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setLoginType('admin')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  loginType === 'admin'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                data-testid="button-admin-tab"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </button>
              <button
                onClick={() => setLoginType('restaurant')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  loginType === 'restaurant'
                    ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                data-testid="button-restaurant-tab"
              >
                <Store className="w-4 h-4 mr-2" />
                Restaurant
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Login Form */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                {loginType === 'admin' ? 'Admin Login' : 'Restaurant Login'}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {loginType === 'admin' 
                  ? 'Access the admin panel to manage restaurants' 
                  : 'Access your restaurant dashboard'
                }
              </p>
            </CardHeader>
            <CardContent>
              {/* Restaurant Auth Type Selector */}
              {loginType === 'restaurant' && (
                <div className="mb-6">
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setRestaurantAuthType('email')
                        setDefaultCredentials('restaurant')
                      }}
                      className={`flex items-center justify-center flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        restaurantAuthType === 'email'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                      data-testid="button-email-auth"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRestaurantAuthType('phone')
                        setDefaultCredentials('restaurant')
                      }}
                      className={`flex items-center justify-center flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        restaurantAuthType === 'phone'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                      data-testid="button-phone-auth"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Phone
                    </button>
                  </div>
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email/Phone Input */}
                {loginType === 'admin' || restaurantAuthType === 'email' ? (
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="pl-10"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        data-testid="input-email"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        className="pl-10"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        data-testid="input-phone"
                      />
                    </div>
                  </div>
                )}

                {/* Password Input */}
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="pl-10"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      data-testid="input-password"
                    />
                  </div>
                </div>

                {/* Demo Credentials */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Demo Credentials:</p>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {loginType === 'admin' ? (
                      <>Email: admin@demo.com | Password: password123</>
                    ) : restaurantAuthType === 'email' ? (
                      <>Email: ahmed@albaik.com | Password: restaurant123</>
                    ) : (
                      <>Phone: 03001234567 | Password: restaurant123</>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs"
                    onClick={() => setDefaultCredentials(loginType)}
                    data-testid="button-fill-demo"
                  >
                    Fill Demo Credentials
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  data-testid="button-login"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
