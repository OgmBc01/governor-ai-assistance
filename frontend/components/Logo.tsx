'use client'

import React from 'react'
import Image from 'next/image'

interface LogoProps {
  className?: string
  showText?: boolean
}

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative w-12 h-12">
        {/* Bauchi State Emblem + AI Symbol */}
        <div className="absolute inset-0 gold-gradient rounded-full flex items-center justify-center shadow-lg">
          <div className="relative">
            {/* Traditional shield shape */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2 L4 8 L4 18 C4 24 10 28 16 30 C22 28 28 24 28 18 L28 8 L16 2Z" fill="#FFFDF9" stroke="#C9A03D" strokeWidth="1.5"/>
              {/* AI Circuit symbol */}
              <circle cx="16" cy="16" r="4" fill="#B84A2C"/>
              <path d="M12 12 L20 20 M20 12 L12 20" stroke="#C9A03D" strokeWidth="1.5"/>
              <path d="M8 8 L24 8 M8 24 L24 24" stroke="#C9A03D" strokeWidth="1" strokeDasharray="2 2"/>
            </svg>
            {/* AI pulse dot */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-heritage-gold rounded-full animate-pulse" />
          </div>
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="font-heading text-xl font-bold text-heritage-brown tracking-tight">
            Bauchi State
          </span>
          <span className="text-xs font-ui text-heritage-charcoal tracking-wide uppercase">
            AI Governor Assistant
          </span>
        </div>
      )}
    </div>
  )
}