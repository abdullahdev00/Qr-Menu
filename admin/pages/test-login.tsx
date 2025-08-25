import React from 'react'
import { useState } from 'react'
import { useLocation } from 'wouter'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useToast } from '../lib/use-toast'
import { Shield, Store } from 'lucide-react'

export default function TestLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loginType, setLoginType] = useState<'admin' | 'restaurant'>('admin')
  const [, setLocation] = useLocation()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const endpoint = loginType === 'admin' ? '/api/auth/login' : '/api/auth/restaurant-login'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('user', JSON.stringify(data.user))
        toast({
          title: "Login successful", 
          description: `Welcome back${loginType === 'restaurant' ? ' to your restaurant panel' : ' to admin panel'}!`,
        })
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
    } else {
      setEmail('ahmed@albaik.com')
      setPassword('restaurant123')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <div className="relative z-10 max-w-lg w-full mx-4 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            NEW LOGIN SYSTEM 🔥
          </h1>
          <p className="mt-3 text-lg text-gray-600 font-medium">
            🚀 DUAL AUTHENTICATION WORKING! 🚀
          </p>
        </div>
        
        {/* Dual Login Buttons */}
        <div className="bg-white/95 backdrop-blur-xl border-2 border-blue-200 rounded-3xl shadow-2xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              ✅ Choose Your Login Type ✅
            </h2>
            <p className="text-sm text-gray-600">
              Select Admin or Restaurant access
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Admin Button */}
            <button
              type="button"
              onClick={() => setDefaultCredentials('admin')}
              className={`group relative overflow-hidden rounded-2xl p-6 h-32 transition-all duration-500 transform hover:scale-105 ${
                loginType === 'admin' 
                  ? 'bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 text-white shadow-2xl scale-105 ring-4 ring-blue-300/50' 
                  : 'bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 text-blue-600 hover:shadow-xl hover:border-blue-300'
              }`}
            >
              <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  loginType === 'admin' ? 'bg-white/20' : 'bg-blue-100'
                }`}>
                  <Shield className="w-7 h-7" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold">🔐 ADMIN PANEL</h3>
                  <p className={`text-xs mt-1 ${loginType === 'admin' ? 'text-white/80' : 'text-gray-500'}`}>
                    Manage restaurants & platform
                  </p>
                </div>
              </div>
            </button>

            {/* Restaurant Button */}
            <button
              type="button"
              onClick={() => setDefaultCredentials('restaurant')}
              className={`group relative overflow-hidden rounded-2xl p-6 h-32 transition-all duration-500 transform hover:scale-105 ${
                loginType === 'restaurant' 
                  ? 'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 text-white shadow-2xl scale-105 ring-4 ring-emerald-300/50' 
                  : 'bg-gradient-to-br from-white to-emerald-50 border-2 border-emerald-200 text-emerald-600 hover:shadow-xl hover:border-emerald-300'
              }`}
            >
              <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  loginType === 'restaurant' ? 'bg-white/20' : 'bg-emerald-100'
                }`}>
                  <Store className="w-7 h-7" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold">🏪 RESTAURANT PANEL</h3>
                  <p className={`text-xs mt-1 ${loginType === 'restaurant' ? 'text-white/80' : 'text-gray-500'}`}>
                    Manage your restaurant menu
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 mb-2">
                {loginType === 'admin' ? '🔐 Admin Demo Credentials' : '🏪 Restaurant Demo Credentials'}
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
                <span>📧 {loginType === 'admin' ? 'admin@demo.com' : 'ahmed@albaik.com'}</span>
                <span>🔑 {loginType === 'admin' ? 'password123' : 'restaurant123'}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Login Form */}
        <div className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-2xl p-8 space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800">
              {loginType === 'admin' ? '🔐 Admin Login' : '🏪 Restaurant Login'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {loginType === 'admin' 
                ? 'Manage restaurants and platform settings' 
                : 'Access your restaurant dashboard'
              }
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-lg hover:shadow-lg transition-all duration-200"
            >
              {isLoading ? 'Logging in...' : `🚀 Sign in to ${loginType === 'admin' ? 'Admin' : 'Restaurant'} Dashboard`}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}