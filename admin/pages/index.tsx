import React from 'react'
import { Redirect } from 'wouter'

export default function Home() {
  // Redirect to dashboard directly using Wouter
  return <Redirect to="/dashboard" />
}