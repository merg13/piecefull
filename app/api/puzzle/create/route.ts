import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { generatePuzzle } from '@/lib/puzzleGenerator'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrl, imageWidth, imageHeight, pieceCount, theme, title, creatorName } = body
    
    // Log received parameters
    console.log('Received puzzle creation request:', {
      imageWidth,
      imageHeight,
      pieceCount,
      theme,
      hasImage: !!imageUrl
    })

    // Generate puzzle pieces
    const pieces = await generatePuzzle({
      imageUrl,
      imageWidth,
      imageHeight,
      pieceCount
    })
    
    console.log('Generated pieces:', {
      count: pieces.length,
      firstPiece: pieces[0]
    })

    // Create unique solve link
    const solveLink = nanoid(10)
    
    // Save to database using Supabase
    const { data, error: dbError } = await supabase
      .from('puzzle')
      .insert([
        {
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
      ])
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    return NextResponse.json({
      puzzleId: data.id,
      solveLink: `${process.env.NEXT_PUBLIC_APP_URL}/puzzle/${solveLink}`
    })
  } catch (error) {
    // Log detailed error information
    console.error('Create puzzle error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to create puzzle',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
