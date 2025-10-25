import { NextRequest, NextResponse } from 'next/server'
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
