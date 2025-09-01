import React from 'react';

interface CustomQRDesignProps {
  qrCodeDataUrl: string;
  tableNumber: string | number | null;
  restaurantName?: string;
}

const CustomQRDesign = ({ qrCodeDataUrl, tableNumber, restaurantName = "MENU" }: CustomQRDesignProps) => {
  return (
    <div 
      className="relative"
      style={{
        width: '400px',
        height: '550px',
        backgroundColor: '#2a2a2a',
        border: '3px solid #b08968',
        borderRadius: '8px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}
    >
      {/* Inner border */}
      <div 
        className="absolute inset-2"
        style={{
          border: '1px solid #b08968',
          borderRadius: '4px',
          pointerEvents: 'none'
        }}
      />
      
      {/* MENU Title */}
      <div className="text-center pt-8 pb-6">
        <h1 
          className="text-4xl font-bold tracking-widest"
          style={{ color: '#b08968' }}
        >
          MENU
        </h1>
      </div>

      {/* QR Code Container */}
      <div className="flex justify-center px-8">
        <div 
          className="relative bg-white p-3"
          style={{
            width: '240px',
            height: '240px',
          }}
        >
          {/* Actual QR Code */}
          <div className="w-full h-full relative">
            <img 
              src={qrCodeDataUrl} 
              alt="QR Code"
              className="w-full h-full object-contain"
              style={{ imageRendering: 'crisp-edges' }}
            />
            
            {/* Logo in center */}
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white flex items-center justify-center"
              style={{
                width: '36px',
                height: '36px',
                border: '2px solid white'
              }}
            >
              <span 
                className="text-2xl font-bold"
                style={{ color: '#b08968' }}
              >
                IX
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scan Text */}
      <div className="text-center mt-6">
        <p 
          className="text-lg tracking-wider"
          style={{ color: '#b08968' }}
        >
          SCAN FOR DIGITAL MENU
        </p>
      </div>

      {/* Fork and Knife Icon */}
      <div className="flex justify-center mt-8">
        <div 
          className="rounded-full flex items-center justify-center"
          style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#b08968',
          }}
        >
          <svg 
            width="28" 
            height="28" 
            viewBox="0 0 24 24" 
            fill="none"
            className="text-white"
          >
            <path 
              d="M11 2v7l-2 2v11h4V11l-2-2V2zM6 2v5c0 1.1.9 2 2 2v13h2V9c1.1 0 2-.9 2-2V2H6z" 
              fill="#2a2a2a"
            />
            <path
              d="M16 2v20h2V12h2V2h-4z"
              fill="#2a2a2a"
            />
          </svg>
        </div>
      </div>

      {/* Table Number */}
      <div className="text-center mt-6">
        <p 
          className="text-base tracking-wider mb-3"
          style={{ color: '#b08968' }}
        >
          TABLE NO.
        </p>
        <div className="flex justify-center">
          <div 
            className="bg-white font-bold text-4xl flex items-center justify-center"
            style={{
              width: '80px',
              height: '55px',
              border: '2px solid #b08968',
              color: '#2a2a2a'
            }}
          >
            {tableNumber || '-'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomQRDesign;