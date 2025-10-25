Cozy Puzzle App - Complete Development Plan
Project Overview
A web-based cozy puzzle game where creators can upload images to generate jigsaw puzzles with seasonal themes, and solvers can complete them in a lofi, atmospheric environment with animated pets and music.

Technology Stack
Frontend

Framework: Next.js 14+ (App Router) with TypeScript
Styling: Tailwind CSS
State Management: Zustand
Drag & Drop: @dnd-kit/core
Animations: Framer Motion
Audio: Howler.js
Canvas: HTML5 Canvas API + Konva.js
Confetti: canvas-confetti

Backend

API: Next.js API Routes
Database: PostgreSQL with Prisma ORM
File Storage: AWS S3 or Cloudflare R2
Image Processing: Sharp (serverless functions)

Deployment

Hosting: Vercel
CDN: Cloudflare
Database: Supabase or Railway


Phase 0: Human Setup (Before Development)
0.1 Create Service Accounts

 Create Vercel account (https://vercel.com)
 Create Supabase account (https://supabase.com) OR Railway (https://railway.app)
 Create AWS account + S3 bucket OR Cloudflare R2 (https://cloudflare.com)
 Create GitHub account (if not exists)

0.2 Asset Procurement
Create or obtain the following assets:
Music (Lofi Tracks)

 5 lofi tracks (one per theme: Christmas, Halloween, Rainy, Summer, Fall)
Format: MP3, 3-5 minutes each
Sources: Epidemic Sound, Artlist, Pixabay, or commission

Background Images

 5 cozy room scenes (2560x1440px minimum)
Themes: Christmas room, Halloween room, Rainy day room, Summer room, Fall room
Sources: AI art (Midjourney/DALL-E), commission artist, or stock images

Pet Animations

 Cat sprite sheet (8-12 poses: sleeping, walking, playing, eating, grooming, etc.)
 Dog sprite sheet (8-12 poses: similar activities)
Format: PNG sprite sheets or individual PNG files
Size: ~200-400px per pose

Sound Effects

 piece_place.mp3 (satisfying click/snap sound)
 puzzle_complete.mp3 (success chime)
 button_click.mp3 (UI interaction)
 shuffle.mp3 (shuffling pieces sound)

UI Assets

 Puzzle box graphic (closed and open states)
 Clock face design
 Weather overlays (rain drops, snow, leaves, fog) - optional if using code-based

0.3 Organize Assets
Create this folder structure in your project:
public/
├── audio/
│   ├── lofi/
│   │   ├── christmas_1.mp3
│   │   ├── halloween_1.mp3
│   │   ├── rainy_1.mp3
│   │   ├── summer_1.mp3
│   │   └── fall_1.mp3
│   └── sfx/
│       ├── piece_place.mp3
│       ├── puzzle_complete.mp3
│       ├── button_click.mp3
│       └── shuffle.mp3
├── images/
│   ├── backgrounds/
│   │   ├── christmas_room.png
│   │   ├── halloween_room.png
│   │   ├── rainy_room.png
│   │   ├── summer_room.png
│   │   └── fall_room.png
│   ├── pets/
│   │   ├── cat/
│   │   │   └── [various pose PNGs]
│   │   └── dog/
│   │       └── [various pose PNGs]
│   └── ui/
│       ├── puzzle_box_closed.png
│       ├── puzzle_box_open.png
│       └── clock_face.png

Phase 1: Project Initialization
1.1 Create Next.js Project
bashnpx create-next-app@latest cozy-puzzle-app --typescript --tailwind --app --no-src-dir
cd cozy-puzzle-app
1.2 Install Dependencies
bash# Core dependencies
npm install zustand @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install framer-motion howler canvas-confetti
npm install konva react-konva

# Database & API
npm install prisma @prisma/client
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install sharp

# Utilities
npm install nanoid date-fns
npm install clsx tailwind-merge

# Dev dependencies
npm install -D @types/howler @types/node
1.3 Initialize Prisma
bashnpx prisma init
1.4 Configure Environment Variables
Create .env.local:
env# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# AWS S3 (or Cloudflare R2)
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
AWS_S3_BUCKET="cozy-puzzle-images"
AWS_REGION="us-east-1"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

Phase 2: Database Schema & Setup
2.1 Define Prisma Schema
Edit prisma/schema.prisma:
prismagenerator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Puzzle {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Image data
  imageUrl    String
  imageWidth  Int
  imageHeight Int
  
  // Puzzle configuration
  pieceCount  Int      // 25, 50, 100, 200, 500
  theme       Theme
  
  // Creator info (optional)
  title       String?
  creatorName String?
  
  // Puzzle data
  piecesData  Json     // Stores piece positions, shapes, etc.
  
  // Shareable link
  solveLink   String   @unique
  
  // Analytics (optional)
  solveCount  Int      @default(0)
  
  @@index([solveLink])
  @@index([createdAt])
}

enum Theme {
  CHRISTMAS
  HALLOWEEN
  RAINY
  SUMMER
  FALL
}

model PuzzleSolve {
  id          String   @id @default(cuid())
  puzzleId    String
  completedAt DateTime @default(now())
  solveTime   Int      // seconds
  
  @@index([puzzleId])
}
2.2 Run Migrations
bashnpx prisma migrate dev --name init
npx prisma generate
2.3 Create Prisma Client Instance
Create lib/prisma.ts:
typescriptimport { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

Phase 3: Core Utilities & Types
3.1 Create Type Definitions
Create types/puzzle.ts:
typescriptexport type Theme = 'CHRISTMAS' | 'HALLOWEEN' | 'RAINY' | 'SUMMER' | 'FALL'

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
3.2 Create Theme Configuration
Create config/themes.ts:
typescriptimport { ThemeConfig } from '@/types/puzzle'

export const themes: Record<string, ThemeConfig> = {
  CHRISTMAS: {
    background: '/images/backgrounds/christmas_room.png',
    weather: 'snow',
    music: ['/audio/lofi/christmas_1.mp3'],
    pet: 'cat',
    palette: ['#8B2929', '#2F5233', '#F4E4C1']
  },
  HALLOWEEN: {
    background: '/images/backgrounds/halloween_room.png',
    weather: 'foggy',
    music: ['/audio/lofi/halloween_1.mp3'],
    pet: 'cat',
    palette: ['#FF6B35', '#2D1B2E', '#F4A259']
  },
  RAINY: {
    background: '/images/backgrounds/rainy_room.png',
    weather: 'rain',
    music: ['/audio/lofi/rainy_1.mp3'],
    pet: 'dog',
    palette: ['#5B7C99', '#748E8E', '#D4C5B9']
  },
  SUMMER: {
    background: '/images/backgrounds/summer_room.png',
    weather: 'sunny',
    music: ['/audio/lofi/summer_1.mp3'],
    pet: 'cat',
    palette: ['#F4B942', '#88D498', '#F8E5B8']
  },
  FALL: {
    background: '/images/backgrounds/fall_room.png',
    weather: 'leaves',
    music: ['/audio/lofi/fall_1.mp3'],
    pet: 'dog',
    palette: ['#D4651E', '#8B4513', '#F5DEB3']
  }
}
3.3 Create S3 Upload Utility
Create lib/s3.ts:
typescriptimport { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { nanoid } from 'nanoid'
import sharp from 'sharp'

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

export async function uploadPuzzleImage(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  
  // Compress and resize image
  const processedImage = await sharp(buffer)
    .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer()
  
  const fileName = `puzzles/${nanoid()}.jpg`
  
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: fileName,
    Body: processedImage,
    ContentType: 'image/jpeg'
  }))
  
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`
}

Phase 4: Puzzle Generation Algorithm
4.1 Create Puzzle Generator
Create lib/puzzleGenerator.ts:
typescriptimport { PuzzlePiece, PieceShape } from '@/types/puzzle'
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

Phase 5: API Routes
5.1 Image Upload Endpoint
Create app/api/upload/route.ts:
typescriptimport { NextRequest, NextResponse } from 'next/server'
import { uploadPuzzleImage } from '@/lib/s3'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }
    
    const imageUrl = await uploadPuzzleImage(file)
    
    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
5.2 Create Puzzle Endpoint
Create app/api/puzzle/create/route.ts:
typescriptimport { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generatePuzzle } from '@/lib/puzzleGenerator'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrl, imageWidth, imageHeight, pieceCount, theme, title, creatorName } = body
    
    // Generate puzzle pieces
    const pieces = await generatePuzzle({
      imageUrl,
      imageWidth,
      imageHeight,
      pieceCount
    })
    
    // Create unique solve link
    const solveLink = nanoid(10)
    
    // Save to database
    const puzzle = await prisma.puzzle.create({
      data: {
        imageUrl,
        imageWidth,
        imageHeight,
        pieceCount,
        theme,
        title,
        creatorName,
        piecesData: pieces,
        solveLink
      }
    })
    
    return NextResponse.json({
      puzzleId: puzzle.id,
      solveLink: `${process.env.NEXT_PUBLIC_APP_URL}/puzzle/${solveLink}`
    })
  } catch (error) {
    console.error('Create puzzle error:', error)
    return NextResponse.json({ error: 'Failed to create puzzle' }, { status: 500 })
  }
}
5.3 Get Puzzle Endpoint
Create app/api/puzzle/[link]/route.ts:
typescriptimport { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { link: string } }
) {
  try {
    const puzzle = await prisma.puzzle.findUnique({
      where: { solveLink: params.link }
    })
    
    if (!puzzle) {
      return NextResponse.json({ error: 'Puzzle not found' }, { status: 404 })
    }
    
    return NextResponse.json(puzzle)
  } catch (error) {
    console.error('Get puzzle error:', error)
    return NextResponse.json({ error: 'Failed to fetch puzzle' }, { status: 500 })
  }
}
5.4 Save Completion Endpoint
Create app/api/puzzle/complete/route.ts:
typescriptimport { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { puzzleId, solveTime } = body
    
    // Save solve record
    await prisma.puzzleSolve.create({
      data: {
        puzzleId,
        solveTime
      }
    })
    
    // Increment solve count
    await prisma.puzzle.update({
      where: { id: puzzleId },
      data: { solveCount: { increment: 1 } }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Complete puzzle error:', error)
    return NextResponse.json({ error: 'Failed to save completion' }, { status: 500 })
  }
}

Phase 6: State Management (Zustand)
6.1 Create Puzzle Store
Create store/puzzleStore.ts:
typescriptimport { create } from 'zustand'
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
}))

Phase 7: UI Components
7.1 Puzzle Creator Page
Create app/create/page.tsx:
typescript'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUploader from '@/components/creator/ImageUploader'
import PuzzleSettings from '@/components/creator/PuzzleSettings'
import LivePreview from '@/components/creator/LivePreview'

export default function CreatePage() {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [pieceCount, setPieceCount] = useState(100)
  const [theme, setTheme] = useState('RAINY')
  const [title, setTitle] = useState('')
  const [creatorName, setCreatorName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [shareLink, setShareLink] = useState('')
  
  const router = useRouter()
  
  const handleImageUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    const data = await response.json()
    setImageUrl(data.imageUrl)
    
    // Get image dimensions
    const img = new Image()
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height })
    }
    img.src = data.imageUrl
  }
  
  const handleGeneratePuzzle = async () => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/puzzle/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          imageWidth: imageSize.width,
          imageHeight: imageSize.height,
          pieceCount,
          theme,
          title,
          creatorName
        })
      })
      
      const data = await response.json()
      setShareLink(data.solveLink)
    } catch (error) {
      console.error('Failed to generate puzzle:', error)
    } finally {
      setIsGenerating(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-amber-900">
          Create Your Cozy Puzzle
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <ImageUploader onUpload={handleImageUpload} />
            
            {imageUrl && (
              <PuzzleSettings
                pieceCount={pieceCount}
                setPieceCount={setPieceCount}
                theme={theme}
                setTheme={setTheme}
                title={title}
                setTitle={setTitle}
                creatorName={creatorName}
                setCreatorName={setCreatorName}
              />
            )}
            
            {imageUrl && (
              <button
                onClick={handleGeneratePuzzle}
                disabled={isGenerating}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Generate Puzzle'}
              </button>
            )}
            
            {shareLink && (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="font-semibold mb-2">Share Your Puzzle!</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-4 py-2 border rounded"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(shareLink)}
                    className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div>
            {imageUrl && (
              <LivePreview
                imageUrl={imageUrl}
                pieceCount={pieceCount}
                theme={theme}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
7.2 Puzzle Solver Page
Create app/puzzle/[link]/page.tsx:
typescript'use client'

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
  const { setPieces, isCompleted, loadProgress } = usePuzzleStore()
  
  useEffect(() => {
    async function fetchPuzzle() {
      const response = await fetch(`/api/puzzle/${link}`)
      const data = await response.json()
      setPuzzle(data)
      
      // Load saved progress
      const savedProgress = localStorage.getItem(`puzzle_${link}_progress`)
      if (savedProgress) {
        loadProgress(JSON.parse(savedProgress))
        setShowIntro(false)
      } else {
        setPieces(data.piecesData)
      }
    }
    
    fetchPuzzle()
  }, [link, setPieces, loadProgress])
  
  if (!puzzle) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
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
            <div className="flex gap-8">
              <PuzzleBox imageUrl={puzzle.imageUrl} />
              <PuzzleBoard
                imageUrl={puzzle.imageUrl}
                imageWidth={puzzle.imageWidth}
                imageHeight={puzzle.imageHeight}
              />
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

Phase 8: Core Components
8.1 Image Uploader Component
Create components/creator/ImageUploader.tsx:
typescript'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface ImageUploaderProps {
  onUpload: (file: File) => void
}

export default function ImageUploader({ onUpload }: ImageUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0])
    }
  }, [onUpload])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  })
  
  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
        isDragActive
          ? 'border-amber-600 bg-amber-50'
          : 'border-gray-300 hover:border-amber-400'
      }`}
    >
      <input {...getInputProps()} />
      <div className="space-y-2">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-lg font-medium">
          {isDragActive ? 'Drop your image here' : 'Upload Puzzle Image'}
        </p>
        <p className="text-sm text-gray-500">
          Drag & drop or click to select (PNG, JPG, WEBP - max 10MB)
        </p>
      </div>
    </div>
  )
}
8.2 Puzzle Settings Component
Create components/creator/PuzzleSettings.tsx:
typescript'use client'

interface PuzzleSettingsProps {
  pieceCount: number
  setPieceCount: (count: number) => void
  theme: string
  setTheme: (theme: string) => void
  title: string
  setTitle: (title: string) => void
  creatorName: string
  setCreatorName: (name: string) => void
}

const PIECE_OPTIONS = [25, 50, 100, 200, 500]
const THEMES = [
  { id: 'RAINY', name: 'Cozy Rainy Day', icon: '🌧️' },
  { id: 'CHRISTMAS', name: 'Christmas', icon: '🎄' },
  { id: 'HALLOWEEN', name: 'Halloween', icon: '🎃' },
  { id: 'SUMMER', name: 'Sunny Summer', icon: '☀️' },
  { id: 'FALL', name: 'Leaves Falling', icon: '🍂' }
]

export default function PuzzleSettings({
  pieceCount,
  setPieceCount,
  theme,
  setTheme,
  title,
  setTitle,
  creatorName,
  setCreatorName
}: PuzzleSettingsProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
      <h2 className="text-2xl font-semibold">Puzzle Settings</h2>
      
      {/* Piece Count */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Number of Pieces: {pieceCount}
        </label>
        <input
          type="range"
          min="0"
          max={PIECE_OPTIONS.length - 1}
          value={PIECE_OPTIONS.indexOf(pieceCount)}
          onChange={(e) => setPieceCount(PIECE_OPTIONS[Number(e.target.value)])}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          {PIECE_OPTIONS.map((count) => (
            <span key={count}>{count}</span>
          ))}
        </div>
      </div>
      
      {/* Theme Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Theme</label>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`p-3 rounded-lg border-2 transition ${
                theme === t.id
                  ? 'border-amber-600 bg-amber-50'
                  : 'border-gray-200 hover:border-amber-300'
              }`}
            >
              <div className="text-2xl mb-1">{t.icon}</div>
              <div className="text-sm font-medium">{t.name}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Optional Fields */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Puzzle Title (Optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Mountain Sunset"
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Your Name (Optional)
        </label>
        <input
          type="text"
          value={creatorName}
          onChange={(e) => setCreatorName(e.target.value)}
          placeholder="e.g., Alex"
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
    </div>
  )
}
8.3 Live Preview Component
Create components/creator/LivePreview.tsx:
typescript'use client'

import { useEffect, useRef } from 'react'
import { calculatePuzzleDimensions } from '@/lib/puzzleGenerator'

interface LivePreviewProps {
  imageUrl: string
  pieceCount: number
  theme: string
}

export default function LivePreview({ imageUrl, pieceCount, theme }: LivePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      
      // Draw image
      ctx.drawImage(img, 0, 0)
      
      // Draw grid
      const { cols, rows } = calculatePuzzleDimensions(pieceCount)
      const pieceWidth = img.width / cols
      const pieceHeight = img.height / rows
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.lineWidth = 2
      
      // Vertical lines
      for (let i = 1; i < cols; i++) {
        ctx.beginPath()
        ctx.moveTo(i * pieceWidth, 0)
        ctx.lineTo(i * pieceWidth, img.height)
        ctx.stroke()
      }
      
      // Horizontal lines
      for (let i = 1; i < rows; i++) {
        ctx.beginPath()
        ctx.moveTo(0, i * pieceHeight)
        ctx.lineTo(img.width, i * pieceHeight)
        ctx.stroke()
      }
    }
    img.src = imageUrl
  }, [imageUrl, pieceCount])
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Preview</h2>
      <div className="relative overflow-hidden rounded-lg">
        <canvas
          ref={canvasRef}
          className="w-full h-auto"
        />
      </div>
      <p className="text-sm text-gray-500 mt-2 text-center">
        Grid preview with {pieceCount} pieces
      </p>
    </div>
  )
}
8.4 Cozy Background Component
Create components/solver/CozyBackground.tsx:
typescript'use client'

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
        style={{ backgroundImage: `url(${themeConfig.background})` }}
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
  
  return (
    <motion.div
      className="absolute bottom-20 left-20 w-32 h-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <img
        src={`/images/pets/${pet}/${theme}_${currentAction}.png`}
        alt={`${pet} ${currentAction}`}
        className="w-full h-full object-contain"
        onError={(e) => {
          // Fallback to default pose if specific action not found
          e.currentTarget.src = `/images/pets/${pet}/default.png`
        }}
      />
    </motion.div>
  )
}
8.5 Puzzle Board Component
Create components/solver/PuzzleBoard.tsx:
typescript'use client'

import { useEffect, useRef } from 'react'
import { usePuzzleStore } from '@/store/puzzleStore'
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'

interface PuzzleBoardProps {
  imageUrl: string
  imageWidth: number
  imageHeight: number
}

export default function PuzzleBoard({ imageUrl, imageWidth, imageHeight }: PuzzleBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { pieces, updatePiecePosition, placePiece } = usePuzzleStore()
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    })
  )
  
  useEffect(() => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = imageWidth
    canvas.height = imageHeight
    
    // Draw board outline
    ctx.strokeStyle = '#8B4513'
    ctx.lineWidth = 4
    ctx.strokeRect(0, 0, imageWidth, imageHeight)
    
    // Draw placed pieces
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = imageUrl
    img.onload = () => {
      pieces.forEach((piece) => {
        if (piece.isPlaced) {
          ctx.drawImage(
            img,
            piece.correctX, piece.correctY, imageWidth / Math.sqrt(pieces.length), imageHeight / Math.sqrt(pieces.length),
            piece.correctX, piece.correctY, imageWidth / Math.sqrt(pieces.length), imageHeight / Math.sqrt(pieces.length)
          )
        }
      })
    }
  }, [pieces, imageUrl, imageWidth, imageHeight])
  
  function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event
    const pieceId = active.id as string
    const piece = pieces.find((p) => p.id === pieceId)
    
    if (!piece) return
    
    const newX = piece.x + delta.x
    const newY = piece.y + delta.y
    
    // Check if piece is close to correct position (snap threshold)
    const threshold = 20
    const isNearCorrect =
      Math.abs(newX - piece.correctX) < threshold &&
      Math.abs(newY - piece.correctY) < threshold
    
    if (isNearCorrect) {
      // Snap to correct position
      updatePiecePosition(pieceId, piece.correctX, piece.correctY)
      placePiece(pieceId)
      
      // Play sound effect
      const audio = new Audio('/audio/sfx/piece_place.mp3')
      audio.volume = 0.3
      audio.play()
    } else {
      updatePiecePosition(pieceId, newX, newY)
    }
  }
  
  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="bg-white/90 rounded-lg shadow-2xl"
          style={{ maxWidth: '600px', maxHeight: '600px' }}
        />
        
        {/* Draggable pieces overlay */}
        <div className="absolute inset-0">
          {pieces.filter((p) => !p.isPlaced).map((piece) => (
            <DraggablePiece
              key={piece.id}
              piece={piece}
              imageUrl={imageUrl}
            />
          ))}
        </div>
      </div>
    </DndContext>
  )
}

function DraggablePiece({ piece, imageUrl }: { piece: any; imageUrl: string }) {
  const { useDraggable } = require('@dnd-kit/core')
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: piece.id
  })
  
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        left: `${piece.x}px`,
        top: `${piece.y}px`
      }
    : {
        left: `${piece.x}px`,
        top: `${piece.y}px`
      }
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="absolute w-16 h-16 cursor-move"
    >
      <div
        className="w-full h-full bg-cover rounded shadow-lg hover:shadow-xl transition"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundPosition: `-${piece.correctX}px -${piece.correctY}px`
        }}
      />
    </div>
  )
}
8.6 Lofi Music Player Component
Create components/solver/LofiMusicPlayer.tsx:
typescript'use client'

import { useEffect, useRef, useState } from 'react'
import { Howl } from 'howler'
import { themes } from '@/config/themes'

interface LofiMusicPlayerProps {
  theme: string
}

export default function LofiMusicPlayer({ theme }: LofiMusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const soundRef = useRef<Howl | null>(null)
  
  useEffect(() => {
    const themeConfig = themes[theme]
    const musicTrack = themeConfig.music[0] // Use first track for now
    
    soundRef.current = new Howl({
      src: [musicTrack],
      loop: true,
      volume: volume,
      autoplay: false
    })
    
    return () => {
      soundRef.current?.unload()
    }
  }, [theme, volume])
  
  const togglePlay = () => {
    if (!soundRef.current) return
    
    if (isPlaying) {
      soundRef.current.pause()
    } else {
      soundRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    soundRef.current?.volume(newVolume)
  }
  
  return (
    <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-600 hover:bg-amber-700 text-white transition"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        
        <div className="flex items-center gap-2">
          <span className="text-sm">🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24"
          />
        </div>
      </div>
    </div>
  )
}
8.7 Game UI Component
Create components/solver/GameUI.tsx:
typescript'use client'

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
  
  const progress = (placedPieces.size / pieces.length) * 100
  
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
          onClick={shufflePieces}
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
8.8 Completion Modal Component
Create components/solver/CompletionModal.tsx:
typescript'use client'

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
    
    // Play completion sound
    const audio = new Audio('/audio/sfx/puzzle_complete.mp3')
    audio.play()
    
    // Save completion to server
    fetch('/api/puzzle/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ puzzleId, solveTime: elapsedTime })
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
            onClick={() => {
              navigator.clipboard.writeText(window.location.href)
              alert('Link copied to clipboard!')
            }}
            className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition"
          >
            Share Puzzle
          </button>
        </div>
      </div>
    </div>
  )
}
8.9 Intro Sequence Component
Create components/solver/IntroSequence.tsx:
typescript'use client'

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
8.10 Puzzle Box Component
Create components/solver/PuzzleBox.tsx:
typescript'use client'

import { motion } from 'framer-motion'
import { usePuzzleStore } from '@/store/puzzleStore'

interface PuzzleBoxProps {
  imageUrl: string
}

export default function PuzzleBox({ imageUrl }: PuzzleBoxProps) {
  const { isPuzzleBoxOpen, pieces, placedPieces } = usePuzzleStore()
  
  const unplacedPieces = pieces.filter((p) => !placedPieces.has(p.id))
  
  if (!isPuzzleBoxOpen) {
    return null
  }
  
  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="bg-amber-800 rounded-lg p-4 shadow-2xl"
      style={{ width: '300px', height: '600px' }}
    >
      <div className="bg-amber-700 rounded-t-lg p-3 mb-3">
        <h3 className="text-white font-semibold text-center">
          Puzzle Box ({unplacedPieces.length} pieces)
        </h3>
      </div>
      
      <div className="bg-amber-100 rounded-lg p-4 h-[calc(100%-60px)] overflow-y-auto">
        <div className="grid grid-cols-4 gap-2">
          {unplacedPieces.map((piece) => (
            <div
              key={piece.id}
              className="aspect-square bg-white rounded shadow-md hover:shadow-lg transition cursor-pointer"
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundPosition: `-${piece.correctX}px -${piece.correctY}px`,
                backgroundSize: 'cover'
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

Phase 9: Home Page
Create app/page.tsx:
typescript'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-6xl font-bold text-amber-900 mb-6">
              Cozy Puzzle App
            </h1>
            <p className="text-2xl text-gray-700 mb-12 max-w-3xl mx-auto">
              Create beautiful jigsaw puzzles and share them with friends. 
              Solve puzzles in a relaxing lofi atmosphere with animated pets and seasonal themes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white text-xl font-semibold rounded-lg shadow-lg transition"
                >
                  Create a Puzzle
                </motion.button>
              </Link>
              
              <motion.a
                href="#features"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white hover:bg-gray-50 text-amber-900 text-xl font-semibold rounded-lg shadow-lg transition"
              >
                Learn More
              </motion.a>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 text-6xl opacity-20 animate-float">🧩</div>
        <div className="absolute top-40 right-20 text-4xl opacity-20 animate-float-delay">🎨</div>
        <div className="absolute bottom-20 left-20 text-5xl opacity-20 animate-float-delay-2">☕</div>
      </div>
      
      {/* Features Section */}
      <div id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-amber-900 mb-16">
            Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🎨"
              title="Custom Puzzles"
              description="Upload any image and create puzzles with 25 to 500 pieces"
            />
            <FeatureCard
              icon="🎵"
              title="Lofi Vibes"
              description="Relax with curated lofi music while solving puzzles"
            />
            <FeatureCard
              icon="🐱"
              title="Animated Pets"
              description="Watch adorable cats and dogs keep you company"
            />
            <FeatureCard
              icon="🌧️"
              title="Seasonal Themes"
              description="Choose from 5 cozy themes with unique atmospheres"
            />
            <FeatureCard
              icon="🔗"
              title="Easy Sharing"
              description="Share puzzle links with friends and family"
            />
            <FeatureCard
              icon="💾"
              title="Auto-Save"
              description="Your progress is automatically saved as you play"
            />
          </div>
        </div>
      </div>
      
      {/* Themes Section */}
      <div className="py-24 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-amber-900 mb-16">
            Seasonal Themes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ThemeCard emoji="🌧️" name="Cozy Rainy Day" />
            <ThemeCard emoji="🎄" name="Christmas" />
            <ThemeCard emoji="🎃" name="Halloween" />
            <ThemeCard emoji="☀️" name="Sunny Summer" />
            <ThemeCard emoji="🍂" name="Leaves Falling" />
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-24 bg-amber-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Create Your First Puzzle?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start creating and sharing beautiful puzzles in minutes
          </p>
          <Link href="/create">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-amber-900 text-xl font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition"
            >
              Get Started Free
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-amber-50 p-6 rounded-xl shadow-md hover:shadow-lg transition"
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-amber-900 mb-2">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </motion.div>
  )
}

function ThemeCard({ emoji, name }: { emoji: string; name: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition text-center"
    >
      <div className="text-6xl mb-4">{emoji}</div>
      <h3 className="text-xl font-bold text-amber-900">{name}</h3>
    </motion.div>
  )
}

Phase 10: Styling & Tailwind Configuration
Update tailwind.config.ts:
typescriptimport type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-delay': 'float 3s ease-in-out 1s infinite',
        'float-delay-2': 'float 3s ease-in-out 2s infinite',
        'bounce-in': 'bounceIn 0.6s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
Add global styles in app/globals.css:
css@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply antialiased;
  }
}

@layer utilities {
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-float-delay {
    animation: float 3s ease-in-out 1s infinite;
  }
  
  .animate-float-delay-2 {
    animation: float 3s ease-in-out 2s infinite;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #d97706;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #b45309;
}

Phase 11: Deployment
11.1 Create vercel.json
json{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
11.2 Update package.json scripts
json{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate"
  }
}
11.3 Deployment Steps

Push to GitHub

bashgit init
git add .
git commit -m "Initial commit: Cozy Puzzle App"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cozy-puzzle-app.git
git push -u origin main

Deploy to Vercel


Go to https://vercel.com/new
Import your GitHub repository
Add environment variables from .env.local
Click "Deploy"


Configure Database


If using Supabase: Copy connection string from Supabase dashboard
Add DATABASE_URL to Vercel environment variables
Run migrations: npx prisma migrate deploy


Configure S3/R2


Create S3 bucket or R2 bucket
Set CORS policy to allow your domain
Add AWS credentials to Vercel environment variables


Phase 12: Testing Checklist
Functionality Testing

 Image upload works (various formats and sizes)
 Puzzle generation creates correct number of pieces
 All 5 themes display correctly
 Puzzle link generation works
 Shareable links are accessible
 Drag and drop pieces works smoothly
 Pieces snap to correct positions
 Shuffle button randomizes pieces
 Reset button clears progress
 Timer counts accurately
 Progress saves to localStorage
 Progress loads on return visit
 Completion modal appears when finished
 Confetti animation plays on completion
 Music plays and loops correctly
 Volume control adjusts music
 Pet animations cycle randomly
 Weather effects display correctly

Browser Testing

 Chrome (desktop & mobile)
 Firefox (desktop & mobile)
 Safari (desktop & mobile)
 Edge (desktop)

Performance Testing

 Page load time < 3 seconds
 Puzzle generation < 5 seconds
 Drag operations are smooth (60fps)
 Images load progressively
 Music doesn't stutter during gameplay

Accessibility Testing

 Keyboard navigation works
 Touch gestures work on mobile
 Contrast ratios meet WCAG standards
 Focus indicators are visible


Phase 13: Post-Launch
Analytics Setup

 Add Google Analytics or Plausible
 Track puzzle creations
 Track puzzle completions
 Track average solve times
 Monitor error rates

Monitoring

 Set up Sentry for error tracking
 Configure uptime monitoring
 Set up database backup schedule
 Monitor S3/R2 storage usage

Marketing

 Create social media accounts
 Share on Reddit (r/webdev, r/puzzles)
 Post on Product Hunt
 Create demo video
 Write blog post about development


Appendix: Helpful Commands
bash# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Start production server

# Database
npx prisma migrate dev         # Create and apply migration
npx prisma migrate reset       # Reset database
npx prisma studio              # Open database GUI
npx prisma generate            # Generate Prisma Client

# Git
git status                     # Check status
git add .                      # Stage all changes
git commit -m "message"        # Commit changes
git push                       # Push to remote

# Vercel
vercel                         # Deploy to preview
vercel --prod                  # Deploy to production
vercel env pull                # Pull environment variables
vercel logs                    # View deployment logs

Troubleshooting
Common Issues
Issue: Images not uploading

Check S3/R2 credentials in .env.local
Verify CORS policy on bucket
Check file size limits

Issue: Database connection fails

Verify DATABASE_URL is correct
Check if database is accessible from your IP
Run npx prisma migrate deploy

Issue: Music not playing

Check browser autoplay policies
Ensure music files exist in /public/audio
Verify Howler.js is installed correctly

Issue: Drag and drop not working

Check if @dnd-kit is installed
Verify touch events are not being blocked
Test in different browsers

Issue: localStorage not persisting

Check if cookies/storage are enabled
Test in non-incognito mode
Verify correct puzzle ID in localStorage key


Resources

Next.js Docs: https://nextjs.org/docs
Prisma Docs: https://www.prisma.io/docs
Tailwind CSS: https://tailwindcss.com/docs
Framer Motion: https://www.framer.com/motion
DND Kit: https://docs.dndkit.com
Howler.js: https://howlerjs.com
Vercel Docs: https://vercel.com/docs


Timeline Estimate

Phase 0-1 (Setup): 2-4 hours
Phase 2-3 (Database & Types): 2-3 hours
Phase 4-5 (Puzzle Generation & API): 4-6 hours
Phase 6 (State Management): 2-3 hours
Phase 7-8 (UI Components): 10-15 hours
Phase 9-10 (Pages & Styling): 4-6 hours
Phase 11 (Deployment): 2-3 hours
Phase 12 (Testing): 4-6 hours

Total: 30-50 hours of development time

Success Criteria
Your app is ready to launch when:

✅ Users can create puzzles from uploaded images
✅ Puzzles are shareable via unique links
✅ All 5 themes work correctly
✅ Puzzle solving is smooth and intuitive
✅ Progress persists across sessions
✅ Music and animations enhance the experience
✅ The app works on mobile and desktop
✅ No critical bugs in core functionality

Good luck building your Cozy Puzzle App! 🧩✨