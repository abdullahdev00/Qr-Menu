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
    
    // If restaurant user, redirect to their specific dashboard
    if (userData.role === 'restaurant' && userData.restaurantSlug) {
      return <Redirect to={`/${userData.restaurantSlug}/dashboard`} />
    }
    
    // If admin user, redirect to admin dashboard  
    return <Redirect to="/dashboard" />
  } catch (error) {
    // If parsing fails, remove invalid user data and redirect to login
    localStorage.removeItem('user')
    return <Redirect to="/login" />
  }
}