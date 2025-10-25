import { NextRequest, NextResponse } from 'next/server'
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
