'use client'

import { motion } from 'framer-motion'
import { usePuzzleStore } from '@/store/puzzleStore'

interface IntroSequenceProps {
  theme: string
  onComplete: () => void
}

export default function IntroSequence({ theme, onComplete }: IntroSequenceProps) {
  const { openPuzzleBox } = usePuzzleStore()
  
  const handleStart = () => {
    openPuzzleBox()
    onComplete()
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-8 p-8"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold text-amber-900 mb-4">
            Welcome to Your Cozy Puzzle
          </h1>
          <p className="text-xl text-gray-700">
            Take a deep breath, relax, and enjoy the journey
          </p>
        </motion.div>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
          className="text-8xl"
        >
          🧩
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={handleStart}
          className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white text-xl font-semibold rounded-lg shadow-lg transition transform hover:scale-105"
        >
          Start Puzzle
        </motion.button>
      </motion.div>
    </div>
  )
}
