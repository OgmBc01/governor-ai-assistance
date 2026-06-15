'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface GovernorAvatarProps {
  isSpeaking?: boolean
  isTyping?: boolean
  className?: string
}

export const GovernorAvatar: React.FC<GovernorAvatarProps> = ({
  isSpeaking = false,
  isTyping = false,
  className = '',
}) => {
  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Avatar Frame with Heritage Border */}
      <div className="relative">
        {/* Animated ring when speaking */}
        {isSpeaking && (
          <motion.div
            className="absolute inset-0 rounded-full bg-heritage-gold/20"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
        
        {/* Main Avatar Image */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-heritage-gold/40 shadow-warm-lg">
          <Image
            src="/governor.png"
            alt="Governor Bala Mohammed"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-heritage-ivory px-3 py-1 rounded-full shadow-md">
            <div className="wave-bar h-2 w-1" />
            <div className="wave-bar h-3 w-1" />
            <div className="wave-bar h-4 w-1" />
            <div className="wave-bar h-3 w-1" />
            <div className="wave-bar h-2 w-1" />
          </div>
        )}
      </div>

      {/* Governor Info */}
      <div className="text-center mt-4">
        <h3 className="font-heading text-xl font-bold text-heritage-brown">
          Alh. Dr. Bala Mohammed
        </h3>
        <p className="text-sm font-ui text-heritage-charcoal">
          Executive Governor, Bauchi State
        </p>
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="mt-2 flex items-center justify-center gap-1">
            <span className="text-sm text-heritage-gold font-medium">Governor is typing</span>
            <span className="typing-cursor" />
          </div>
        )}
      </div>
    </div>
  )
}