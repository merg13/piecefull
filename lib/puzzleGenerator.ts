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
  
  // Advanced jigsaw puzzle piece generation with proper interlocking
  const shapes: PieceShape[][] = [];
  for (let row = 0; row < rows; row++) {
    shapes[row] = [];
    for (let col = 0; col < cols; col++) {
      const shape: PieceShape = { top: 'flat', right: 'flat', bottom: 'flat', left: 'flat' };

      // Top edge - must complement the bottom edge of the piece above
      if (row === 0) {
        shape.top = 'flat'; // Outer edge pieces have flat tops
      } else {
        // If the piece above has a tab protruding down, this piece needs a socket (blank) on top
        shape.top = shapes[row - 1][col].bottom === 'tab' ? 'blank' : 'tab';
      }

      // Left edge - must complement the right edge of the piece to the left
      if (col === 0) {
        shape.left = 'flat'; // Outer edge pieces have flat lefts
      } else {
        // If the piece to the left has a tab protruding right, this piece needs a socket (blank) on left
        shape.left = shapes[row][col - 1].right === 'tab' ? 'blank' : 'tab';
      }

      // Right edge - generate interlocking shape for non-edge pieces
      if (col === cols - 1) {
        shape.right = 'flat'; // Outer edge pieces have flat rights
      } else {
        // Generate random but balanced interlocking pattern
        // Use position-based seed for more organic distribution
        const seed = (row * cols + col) * 0.618033988749; // Golden ratio for better distribution
        shape.right = (Math.sin(seed) + Math.cos(seed * 1.618)) > 0 ? 'tab' : 'blank';
      }

      // Bottom edge - generate interlocking shape for non-edge pieces
      if (row === rows - 1) {
        shape.bottom = 'flat'; // Outer edge pieces have flat bottoms
      } else {
        // Generate complementary pattern to top edges
        const seed = ((row + 1) * cols + col) * 0.618033988749;
        shape.bottom = (Math.sin(seed) + Math.cos(seed * 1.618)) > 0 ? 'tab' : 'blank';
      }

      shapes[row][col] = shape;
    }
  }

  const pieces: PuzzlePiece[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const piece: PuzzlePiece = {
        id: nanoid(),
        x: Math.random() * 800,
        y: Math.random() * 600,
        correctX: col * pieceWidth,
        correctY: row * pieceHeight,
        gridX: col,
        gridY: row,
        isPlaced: false,
        imageData: '',
        shape: shapes[row][col]
      };
      pieces.push(piece);
    }
  }
  return pieces;
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
