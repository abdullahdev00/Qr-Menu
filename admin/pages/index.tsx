import React from 'react'
import { Redirect } from 'wouter'

export default function Home() {
  // Check if user is authenticated, otherwise redirect to login
  const user = localStorage.getItem('user')
  
  if (!user) {
    return <Redirect to="/login" />
  }
  
  // Parse user data to check role
  try {
    const userData = JSON.parse(user)
    console.log('🔧 Index.tsx user data:', userData);
    
    // If restaurant user, redirect to their specific dashboard
    if (userData.role === 'restaurant' && userData.restaurantSlug) {
      console.log('🔧 Index.tsx redirecting restaurant to:', `/${userData.restaurantSlug}/dashboard`);
      return <Redirect to={`/${userData.restaurantSlug}/dashboard`} />
    }
    
    // If admin user, redirect to admin dashboard  
    console.log('🔧 Index.tsx redirecting admin to dashboard');
    return <Redirect to="/dashboard" />
  } catch (error) {
    // If parsing fails, remove invalid user data and redirect to login
    console.error('🔧 Index.tsx user parsing error:', error);
    localStorage.removeItem('user')
    return <Redirect to="/login" />
  }
}