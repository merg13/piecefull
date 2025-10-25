'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { usePuzzleStore } from '@/store/puzzleStore'

interface CompletionModalProps {
  puzzleId: string
  onRestart: () => void
}

export default function CompletionModal({ puzzleId, onRestart }: CompletionModalProps) {
  const { elapsedTime } = usePuzzleStore()
  
  useEffect(() => {
    // Trigger confetti
    const duration = 3000
    const end = Date.now() + duration
    
    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6']
      })
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6']
      })
      
      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    
    frame()
    
    // Play completion sound with error handling
    try {
      const audio = new Audio('/audio/sfx/puzzle_complete.mp3')
      audio.volume = 0.5
      audio.play().catch(() => {
        // Sound failed to play - that's okay
        console.log('Puzzle completed! (Sound effect not available)')
      })
    } catch {
      // Audio not available - continue silently
    }
    
    // Save completion to server
    fetch('/api/puzzle/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ puzzleId, solveTime: elapsedTime })
    }).catch(() => {
      // API call failed - that's okay for now
      console.log('Completion recorded locally (server unavailable)')
    })
  }, [puzzleId, elapsedTime])
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }
  
  const shareCurrentPuzzle = () => {
    if (navigator.clipboard && window.location) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Puzzle link copied to clipboard!')
      }).catch(() => {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea')
        textArea.value = window.location.href
        document.body.appendChild(textArea)
        textArea.select()
        try {
          document.execCommand('copy')
          alert('Puzzle link copied to clipboard!')
        } catch {
          alert(`Share this puzzle: ${window.location.href}`)
        }
        document.body.removeChild(textArea)
      })
    } else {
      alert(`Share this puzzle: ${window.location.href}`)
    }
  }
  
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center animate-bounce-in">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-amber-900 mb-2">
          Puzzle Complete!
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          You solved it in <span className="font-bold text-amber-600">{formatTime(elapsedTime)}</span>
        </p>
        
        <div className="space-y-3">
          <button
            onClick={onRestart}
            className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition"
          >
            Try Again
          </button>
          
          <button
            onClick={shareCurrentPuzzle}
            className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition"
          >
            Share Puzzle
          </button>
        </div>
      </div>
    </div>
  )
}
