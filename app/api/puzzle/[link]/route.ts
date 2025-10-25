import { NextRequest, NextResponse } from 'next/server'
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
