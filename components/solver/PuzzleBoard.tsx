'use client'

import { useEffect, useRef } from 'react'
import { usePuzzleStore } from '@/store/puzzleStore'
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor, useDraggable } from '@dnd-kit/core'

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
    
    const maxWidth = 600
    const maxHeight = 600
    
    // Calculate scale to fit within max dimensions
    const scaleX = maxWidth / imageWidth
    const scaleY = maxHeight / imageHeight
    const scale = Math.min(scaleX, scaleY)
    
    const scaledWidth = imageWidth * scale
    const scaledHeight = imageHeight * scale
    
    canvas.width = scaledWidth
    canvas.height = scaledHeight
    
    // Clear canvas
    ctx.clearRect(0, 0, scaledWidth, scaledHeight)
    
    // Draw board outline
    ctx.strokeStyle = '#8B4513'
    ctx.lineWidth = 4
    ctx.strokeRect(0, 0, scaledWidth, scaledHeight)
    
    // Draw placed pieces
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = imageUrl
    img.onload = () => {
      pieces.forEach((piece) => {
        if (piece.isPlaced) {
          const cols = Math.sqrt(pieces.length)
          const rows = pieces.length / cols
          const pieceWidth = scaledWidth / cols
          const pieceHeight = scaledHeight / rows
          
          ctx.drawImage(
            img,
            piece.correctX, piece.correctY, imageWidth / cols, imageHeight / rows,
            piece.gridX * pieceWidth, piece.gridY * pieceHeight, pieceWidth, pieceHeight
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
    const cols = Math.sqrt(pieces.length)
    const pieceWidth = 600 / cols // Using display size for snap detection
    const pieceHeight = 600 / cols
    
    const correctDisplayX = piece.gridX * pieceWidth
    const correctDisplayY = piece.gridY * pieceHeight
    
    const isNearCorrect =
      Math.abs(newX - correctDisplayX) < threshold &&
      Math.abs(newY - correctDisplayY) < threshold
    
    if (isNearCorrect) {
      // Snap to correct position
      updatePiecePosition(pieceId, correctDisplayX, correctDisplayY)
      placePiece(pieceId)
      
      // Play sound effect (with error handling)
      try {
        const audio = new Audio('/audio/sfx/piece_place.mp3')
        audio.volume = 0.3
        audio.play().catch(() => {
          // Sound failed to play - that's okay
          console.log('Piece placed! (Sound effect not available)')
        })
      } catch {
        // Audio not available - continue silently
      }
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
        />
        
        {/* Draggable pieces overlay */}
        <div className="absolute inset-0">
          {pieces.filter((p) => !p.isPlaced).map((piece) => (
            <DraggablePiece
              key={piece.id}
              piece={piece}
              imageUrl={imageUrl}
              totalPieces={pieces.length}
            />
          ))}
        </div>
      </div>
    </DndContext>
  )
}

function DraggablePiece({ piece, imageUrl, totalPieces }: { piece: any; imageUrl: string; totalPieces: number }) {
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
  
  const cols = Math.sqrt(totalPieces)
  const pieceSize = 60 // Display size for pieces
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="absolute cursor-move z-10"
      width={pieceSize}
      height={pieceSize}
    >
      <div
        className={`w-${pieceSize} h-${pieceSize} bg-cover rounded shadow-lg hover:shadow-xl transition border-2 border-white`}
        style={{
          width: `${pieceSize}px`,
          height: `${pieceSize}px`,
          backgroundImage: `url(${imageUrl})`,
          backgroundPosition: `-${piece.correctX}px -${piece.correctY}px`,
          backgroundSize: `${600 * (piece.gridX + 1)}px ${600 * (piece.gridY + 1)}px`
        }}
      />
    </div>
  )
}
