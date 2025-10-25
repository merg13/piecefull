'use client'

import { useEffect, useState } from 'react'
import { themes } from '@/config/themes'
import { motion } from 'framer-motion'

interface CozyBackgroundProps {
  theme: string
}

export default function CozyBackground({ theme }: CozyBackgroundProps) {
  const themeConfig = themes[theme]
  const [petAction, setPetAction] = useState(0)
  
  useEffect(() => {
    // Randomize pet actions every 30-90 seconds
    const interval = setInterval(() => {
      setPetAction(Math.floor(Math.random() * 6))
    }, (30 + Math.random() * 60) * 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="fixed inset-0 z-0">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${themeConfig.background})`,
          // Fallback gradient if image doesn't load
          background: themeConfig.background.includes('christmas') ? 'linear-gradient(135deg, #8B2929, #2F5233)' :
                     themeConfig.background.includes('halloween') ? 'linear-gradient(135deg, #FF6B35, #2D1B2E)' :
                     themeConfig.background.includes('rainy') ? 'linear-gradient(135deg, #5B7C99, #748E8E)' :
                     themeConfig.background.includes('summer') ? 'linear-gradient(135deg, #F4B942, #88D498)' :
                     'linear-gradient(135deg, #D4651E, #8B4513)'
        }}
      />
      
      {/* Weather Effect */}
      <WeatherEffect weather={themeConfig.weather} />
      
      {/* Pet Animation */}
      <PetAnimation pet={themeConfig.pet} action={petAction} theme={theme} />
      
      {/* Overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/10" />
    </div>
  )
}

function WeatherEffect({ weather }: { weather: string }) {
  if (weather === 'rain') {
    return (
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 100 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-12 bg-blue-200/30"
            initial={{ x: `${Math.random() * 100}vw`, y: -50 }}
            animate={{
              y: '100vh',
              transition: {
                duration: 1 + Math.random(),
                repeat: Infinity,
                ease: 'linear',
                delay: Math.random() * 2
              }
            }}
          />
        ))}
      </div>
    )
  }
  
  if (weather === 'snow') {
    return (
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            initial={{ x: `${Math.random() * 100}vw`, y: -20 }}
            animate={{
              y: '100vh',
              x: `${Math.random() * 100}vw`,
              transition: {
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                ease: 'linear',
                delay: Math.random() * 5
              }
            }}
          />
        ))}
      </div>
    )
  }
  
  if (weather === 'leaves') {
    return (
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl"
            initial={{ x: `${Math.random() * 100}vw`, y: -50, rotate: 0 }}
            animate={{
              y: '100vh',
              x: `${Math.random() * 100}vw`,
              rotate: 360,
              transition: {
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                ease: 'linear',
                delay: Math.random() * 5
              }
            }}
          >
            🍂
          </motion.div>
        ))}
      </div>
    )
  }
  
  return null
}

function PetAnimation({ pet, action, theme }: { pet: string; action: number; theme: string }) {
  const actions = ['sleeping', 'walking', 'playing', 'eating', 'grooming', 'watching']
  const currentAction = actions[action]
  
  // Use emojis as fallbacks until real pet images are added
  const petEmoji = pet === 'cat' ? '🐱' : '🐕'
  
  return (
    <motion.div
      className="absolute bottom-20 left-20 w-32 h-32 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Fallback to emoji until real images are added */}
      <div className="text-6xl filter drop-shadow-lg">
        {petEmoji}
      </div>
      
      {/* This would be used when real pet images are available */}
      {/* <img
        src={`/images/pets/${pet}/${theme}_${currentAction}.png`}
        alt={`${pet} ${currentAction}`}
        className="w-full h-full object-contain"
        onError={(e) => {
          // Fallback to default pose if specific action not found
          e.currentTarget.src = `/images/pets/${pet}/default.png`
        }}
      /> */}
    </motion.div>
  )
}
