'use client'

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
          {unplacedPieces.map((piece) => {
            const cols = Math.sqrt(pieces.length)
            const pieceDisplaySize = 60 // Size for pieces in the box
            
            return (
              <div
                key={piece.id}
                className="aspect-square bg-white rounded shadow-md hover:shadow-lg transition cursor-pointer border-2 border-gray-300 hover:border-amber-400"
                style={{
                  backgroundImage: `url(${imageUrl})`,
                  backgroundPosition: `-${(piece.correctX / 600) * pieceDisplaySize * cols}px -${(piece.correctY / 600) * pieceDisplaySize * cols}px`,
                  backgroundSize: `${pieceDisplaySize * cols}px ${pieceDisplaySize * cols}px`,
                  width: `${pieceDisplaySize}px`,
                  height: `${pieceDisplaySize}px`
                }}
              />
            )
          })}
        </div>
        
        {unplacedPieces.length === 0 && (
          <div className="text-center text-amber-700 mt-8">
            <div className="text-4xl mb-2">🎉</div>
            <p className="font-medium">All pieces placed!</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
