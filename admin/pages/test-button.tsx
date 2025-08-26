import React, { useState } from 'react'

export default function TestButton() {
  const [count, setCount] = useState(0)
  
  console.log('TestButton rendered, count:', count)
  
  const handleClick = () => {
    console.log('Test button clicked!')
    setCount(count + 1)
  }
  
  return (
    <div className="p-4">
      <h1>Button Test Page - Count: {count}</h1>
      <button 
        onClick={handleClick}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Test Click (Count: {count})
      </button>
    </div>
  )
}