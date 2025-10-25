'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import { usePuzzleStore } from '@/store/puzzleStore'
import CozyBackground from '@/components/solver/CozyBackground'
import PuzzleBoard from '@/components/solver/PuzzleBoard'
import PuzzleBox from '@/components/solver/PuzzleBox'
import GameUI from '@/components/solver/GameUI'
import IntroSequence from '@/components/solver/IntroSequence'
import CompletionModal from '@/components/solver/CompletionModal'
import LofiMusicPlayer from '@/components/solver/LofiMusicPlayer'

export default function PuzzleSolverPage({ params }: { params: Promise<{ link: string }> }) {
  const { link } = use(params)
  const [puzzle, setPuzzle] = useState<any>(null)
  const [showIntro, setShowIntro] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { setPieces, isCompleted, loadProgress } = usePuzzleStore()
  
  useEffect(() => {
    async function fetchPuzzle() {
      try {
        setLoading(true)
        const response = await fetch(`/api/puzzle/${link}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Puzzle not found. The link may be incorrect or the puzzle may have been removed.')
          } else {
            setError('Failed to load puzzle. Please try again later.')
          }
          return
        }
        
        const data = await response.json()
        setPuzzle(data)
        
        // Load saved progress
        const savedProgress = localStorage.getItem(`puzzle_${link}_progress`)
        if (savedProgress) {
          try {
            loadProgress(JSON.parse(savedProgress))
            setShowIntro(false)
          } catch {
            // Invalid saved progress, start fresh
            setPieces(data.piecesData)
          }
        } else {
          setPieces(data.piecesData)
        }
      } catch (error) {
        console.error('Failed to fetch puzzle:', error)
        setError('Failed to load puzzle. Please check your internet connection and try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchPuzzle()
  }, [link, setPieces, loadProgress])
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-xl text-amber-900">Loading your cozy puzzle...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
        <div className="max-w-md text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Oops!</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition"
          >
            Go Home
          </a>
        </div>
      </div>
    )
  }
  
  if (!puzzle) {
    return null
  }
  
  return (
    <div className="relative min-h-screen overflow-hidden">
      <CozyBackground theme={puzzle.theme} />
      <LofiMusicPlayer theme={puzzle.theme} />
      
      {showIntro ? (
        <IntroSequence
          theme={puzzle.theme}
          onComplete={() => setShowIntro(false)}
        />
      ) : (
        <>
          <GameUI puzzleId={puzzle.id} />
          <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
            <div className="flex gap-8 items-start">
              <PuzzleBox imageUrl={puzzle.imageUrl} />
              <div className="flex flex-col items-center">
                {puzzle.title && (
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 mb-4">
                    <h2 className="text-xl font-bold text-amber-900">
                      {puzzle.title}
                    </h2>
                    {puzzle.creatorName && (
                      <p className="text-sm text-gray-600">
                        by {puzzle.creatorName}
                      </p>
                    )}
                  </div>
                )}
                <PuzzleBoard
                  imageUrl={puzzle.imageUrl}
                  imageWidth={puzzle.imageWidth}
                  imageHeight={puzzle.imageHeight}
                />
              </div>
            </div>
          </div>
        </>
      )}
      
      {isCompleted && (
        <CompletionModal
          puzzleId={puzzle.id}
          onRestart={() => usePuzzleStore.getState().resetPuzzle()}
        />
      )}
    </div>
  )
}
