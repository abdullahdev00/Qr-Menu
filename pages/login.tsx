import React from 'react'
import { useState } from 'react'
import { useLocation } from 'wouter'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/card'
import { Label } from '../components/ui/label'
import { useToast } from '../lib/use-toast'

export default function Login() {
  const [email, setEmail] = useState('admin@demo.com')
  const [password, setPassword] = useState('password123')
  const [isLoading, setIsLoading] = useState(false)
  const [, setLocation] = useLocation()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
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
          description: "Welcome back!",
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>
      
      <div className="relative z-10 max-w-md w-full mx-4 space-y-8">
        {/* Logo and header section */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl mb-6 transform hover:scale-105 transition-all duration-300">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
            QR Menu Generator
          </h2>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300 font-medium">
            Admin Panel Login
          </p>
        </div>
        
        {/* Login form card */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-3xl shadow-2xl p-8 space-y-6">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-5">
              <div className="group">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg backdrop-blur-sm"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-email"
                  />
                </div>
              </div>
              
              <div className="group">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg backdrop-blur-sm"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    data-testid="input-password"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center items-center py-4 px-6 text-lg font-semibold rounded-2xl text-white bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-2xl hover:shadow-blue-500/25"
                data-testid="button-login"
              >
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Sign in to Dashboard
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
          
          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2024 QR Menu Generator. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}