import React from 'react'
import { Redirect } from 'wouter'

export default function Home() {
  // Check if user is authenticated, otherwise redirect to login
  const user = localStorage.getItem('user')
  
  if (!user) {
    return <Redirect to="/login" />
  }
  
  // If authenticated, redirect to dashboard
  return <Redirect to="/dashboard" />
}