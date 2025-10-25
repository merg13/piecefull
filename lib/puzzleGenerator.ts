import { PuzzlePiece, PieceShape } from '@/types/puzzle'
import { nanoid } from 'nanoid'

export interface GeneratePuzzleParams {
  imageUrl: string
  imageWidth: number
  imageHeight: number
  pieceCount: number
}

export async function generatePuzzle(params: GeneratePuzzleParams): Promise<PuzzlePiece[]> {
  const { imageUrl, imageWidth, imageHeight, pieceCount } = params
  
  // Calculate grid dimensions
  const aspectRatio = imageWidth / imageHeight
  let cols = Math.round(Math.sqrt(pieceCount * aspectRatio))
  let rows = Math.round(pieceCount / cols)
  
  // Adjust to match piece count exactly
  while (cols * rows !== pieceCount) {
    if (cols * rows < pieceCount) cols++
    else cols--
    rows = Math.round(pieceCount / cols)
  }
  
  const pieceWidth = imageWidth / cols
  const pieceHeight = imageHeight / rows
  
  const pieces: PuzzlePiece[] = []
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const piece: PuzzlePiece = {
        id: nanoid(),
        x: Math.random() * 800, // Random initial position
        y: Math.random() * 600,
        correctX: col * pieceWidth,
        correctY: row * pieceHeight,
        gridX: col,
        gridY: row,
        isPlaced: false,
        imageData: '', // Will be generated client-side from canvas
        shape: generatePieceShape(row, col, rows, cols)
      }
      pieces.push(piece)
    }
  }
  
  return pieces
}

function generatePieceShape(row: number, col: number, rows: number, cols: number): PieceShape {
  return {
    top: row === 0 ? 'flat' : (Math.random() > 0.5 ? 'tab' : 'blank'),
    right: col === cols - 1 ? 'flat' : (Math.random() > 0.5 ? 'tab' : 'blank'),
    bottom: row === rows - 1 ? 'flat' : (Math.random() > 0.5 ? 'tab' : 'blank'),
    left: col === 0 ? 'flat' : (Math.random() > 0.5 ? 'tab' : 'blank')
  }
}

export function calculatePuzzleDimensions(pieceCount: number): { cols: number; rows: number } {
  const aspectRatio = 4 / 3 // Default aspect ratio
  let cols = Math.round(Math.sqrt(pieceCount * aspectRatio))
  let rows = Math.round(pieceCount / cols)
  
  while (cols * rows !== pieceCount) {
    if (cols * rows < pieceCount) cols++
    else cols--
    rows = Math.round(pieceCount / cols)
  }
  
  return { cols, rows }
}
