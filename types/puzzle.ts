export type Theme = 'CHRISTMAS' | 'HALLOWEEN' | 'RAINY' | 'SUMMER' | 'FALL'

export interface PuzzlePiece {
  id: string
  x: number
  y: number
  correctX: number
  correctY: number
  gridX: number
  gridY: number
  isPlaced: boolean
  imageData: string // base64 or URL
  shape: PieceShape
}

export interface PieceShape {
  top: 'tab' | 'blank' | 'flat'
  right: 'tab' | 'blank' | 'flat'
  bottom: 'tab' | 'blank' | 'flat'
  left: 'tab' | 'blank' | 'flat'
}

export interface PuzzleConfig {
  imageUrl: string
  pieceCount: number
  theme: Theme
  title?: string
  creatorName?: string
}

export interface ThemeConfig {
  background: string
  weather: 'snow' | 'rain' | 'leaves' | 'sunny' | 'foggy'
  music: string[]
  pet: 'cat' | 'dog'
  palette: string[]
}
