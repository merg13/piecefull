'use client'

import { useEffect, useState } from 'react'
import { usePuzzleStore } from '@/store/puzzleStore'

interface GameUIProps {
  puzzleId: string
}

export default function GameUI({ puzzleId }: GameUIProps) {
  const { startTime, elapsedTime, setElapsedTime, pieces, placedPieces, shufflePieces, resetPuzzle } = usePuzzleStore()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  
  useEffect(() => {
    if (!startTime) return
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      setElapsedTime(elapsed)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [startTime, setElapsedTime])
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  const progress = pieces.length > 0 ? (placedPieces.size / pieces.length) * 100 : 0
  
  return (
    <div className="fixed top-4 left-4 z-50 space-y-4">
      {/* Timer */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-amber-900">
            {formatTime(elapsedTime)}
          </div>
          <div className="text-sm text-gray-600 mt-1">Time Elapsed</div>
        </div>
      </div>
      
      {/* Progress */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
        <div className="text-sm font-medium mb-2">
          Progress: {placedPieces.size}/{pieces.length}
        </div>
        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Controls */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 space-y-2">
        <button
          onClick={() => {
            shufflePieces()
            // Play shuffle sound with error handling
            try {
              const audio = new Audio('/audio/sfx/shuffle.mp3')
              audio.volume = 0.3
              audio.play().catch(() => {
                // Sound failed to play - that's okay
                console.log('Pieces shuffled! (Sound effect not available)')
              })
            } catch {
              // Audio not available - continue silently
            }
          }}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium"
        >
          🔀 Shuffle Pieces
        </button>
        
        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-medium"
        >
          🔄 Reset Puzzle
        </button>
      </div>
      
      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold mb-2">Reset Puzzle?</h3>
            <p className="text-gray-600 mb-4">
              This will clear all your progress and start over.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  resetPuzzle()
                  setShowResetConfirm(false)
                }}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
