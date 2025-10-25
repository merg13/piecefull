import { create } from 'zustand'
import { PuzzlePiece } from '@/types/puzzle'

interface PuzzleState {
  pieces: PuzzlePiece[]
  placedPieces: Set<string>
  startTime: number | null
  elapsedTime: number
  isCompleted: boolean
  isPuzzleBoxOpen: boolean
  
  // Actions
  setPieces: (pieces: PuzzlePiece[]) => void
  updatePiecePosition: (pieceId: string, x: number, y: number) => void
  placePiece: (pieceId: string) => void
  shufflePieces: () => void
  openPuzzleBox: () => void
  resetPuzzle: () => void
  setElapsedTime: (time: number) => void
  checkCompletion: () => boolean
  loadProgress: (savedState: any) => void
  saveProgress: () => void
}

export const usePuzzleStore = create<PuzzleState>((set, get) => ({
  pieces: [],
  placedPieces: new Set(),
  startTime: null,
  elapsedTime: 0,
  isCompleted: false,
  isPuzzleBoxOpen: false,
  
  setPieces: (pieces) => {
    set({ pieces, startTime: Date.now() })
  },
  
  updatePiecePosition: (pieceId, x, y) => {
    set((state) => ({
      pieces: state.pieces.map((piece) =>
        piece.id === pieceId ? { ...piece, x, y } : piece
      )
    }))
    get().saveProgress()
  },
  
  placePiece: (pieceId) => {
    set((state) => {
      const newPlacedPieces = new Set(state.placedPieces)
      newPlacedPieces.add(pieceId)
      
      return {
        pieces: state.pieces.map((piece) =>
          piece.id === pieceId ? { ...piece, isPlaced: true } : piece
        ),
        placedPieces: newPlacedPieces
      }
    })
    
    get().saveProgress()
    get().checkCompletion()
  },
  
  shufflePieces: () => {
    set((state) => ({
      pieces: state.pieces.map((piece) =>
        piece.isPlaced
          ? piece
          : {
              ...piece,
              x: Math.random() * 800,
              y: Math.random() * 600
            }
      )
    }))
    get().saveProgress()
  },
  
  openPuzzleBox: () => {
    set({ isPuzzleBoxOpen: true, startTime: Date.now() })
  },
  
  resetPuzzle: () => {
    set((state) => ({
      pieces: state.pieces.map((piece) => ({
        ...piece,
        x: Math.random() * 800,
        y: Math.random() * 600,
        isPlaced: false
      })),
      placedPieces: new Set(),
      startTime: Date.now(),
      elapsedTime: 0,
      isCompleted: false,
      isPuzzleBoxOpen: false
    }))
    get().saveProgress()
  },
  
  setElapsedTime: (time) => {
    set({ elapsedTime: time })
  },
  
  checkCompletion: () => {
    const { pieces, placedPieces } = get()
    const isComplete = pieces.every((piece) => placedPieces.has(piece.id))
    
    if (isComplete) {
      set({ isCompleted: true })
    }
    
    return isComplete
  },
  
  loadProgress: (savedState) => {
    if (savedState) {
      set({
        pieces: savedState.pieces,
        placedPieces: new Set(savedState.placedPieces),
        startTime: savedState.startTime,
        elapsedTime: savedState.elapsedTime,
        isPuzzleBoxOpen: savedState.isPuzzleBoxOpen
      })
    }
  },
  
  saveProgress: () => {
    const { pieces, placedPieces, startTime, elapsedTime, isPuzzleBoxOpen } = get()
    
    // Only save if we're in a browser environment
    if (typeof window !== 'undefined') {
      const puzzleId = window.location.pathname.split('/').pop()
      
      localStorage.setItem(
        `puzzle_${puzzleId}_progress`,
        JSON.stringify({
          pieces,
          placedPieces: Array.from(placedPieces),
          startTime,
          elapsedTime,
          isPuzzleBoxOpen
        })
      )
    }
  }
}))
