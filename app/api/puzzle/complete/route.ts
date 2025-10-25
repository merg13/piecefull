import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { puzzleId, solveTime } = body
    
    // Save solve record
    const { error: solveError } = await supabase
      .from('puzzleSolve')
      .insert([
        {
          puzzleId,
          solveTime
        }
      ]);

    if (solveError) {
      throw solveError;
    }

    // Increment solve count
    const { error: updateError } = await supabase
      .from('puzzle')
      .update({ solveCount: supabase.rpc('increment', { x: 1 }) })
      .eq('id', puzzleId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Complete puzzle error:', error)
    return NextResponse.json({ error: 'Failed to save completion' }, { status: 500 })
  }
}
