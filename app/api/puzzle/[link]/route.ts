import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET(
  request: NextRequest,
  { params }: { params: { link: string } }
) {
  try {
    const { data, error: dbError } = await supabase
      .from('puzzle')
      .select('*')
      .eq('solveLink', params.link)
      .single();

    if (dbError || !data) {
      return NextResponse.json({ error: 'Puzzle not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Get puzzle error:', error)
    return NextResponse.json({ error: 'Failed to fetch puzzle' }, { status: 500 })
  }
}
