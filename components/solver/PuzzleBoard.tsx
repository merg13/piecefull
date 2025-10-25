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
        distance: 3 // Reduced for more responsive dragging
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
    
    // Advanced piece placement detection with shape-aware snapping
    const threshold = 12 // Tighter threshold for precision
    const cols = Math.sqrt(pieces.length)
    const pieceWidth = 600 / cols // Using display size for snap detection
    const pieceHeight = 600 / cols

    const correctDisplayX = piece.gridX * pieceWidth
    const correctDisplayY = piece.gridY * pieceHeight

    // Calculate distance from correct position
    const distance = Math.sqrt(
      Math.pow(newX - correctDisplayX, 2) +
      Math.pow(newY - correctDisplayY, 2)
    )

    // Shape-aware placement detection - consider piece shape for better snapping
    let isNearCorrect = distance < threshold

    // For pieces with irregular shapes, allow slightly more tolerance
    const hasIrregularShape = piece.shape.top !== 'flat' || piece.shape.right !== 'flat' ||
                             piece.shape.bottom !== 'flat' || piece.shape.left !== 'flat'
    if (hasIrregularShape && distance < threshold * 1.3) {
      isNearCorrect = true
    }

    // Add visual feedback for near-placement
    if (distance < threshold * 2 && !isNearCorrect) {
      // Piece is close but not quite in place - add subtle glow effect
      const pieceElement = document.querySelector(`[data-piece-id="${pieceId}"]`) as HTMLElement
      if (pieceElement) {
        pieceElement.style.boxShadow = '0 0 20px rgba(251, 191, 36, 0.6)'
        pieceElement.style.transform = 'scale(1.02)'

        // Remove effect after a short delay
        setTimeout(() => {
          pieceElement.style.boxShadow = ''
          pieceElement.style.transform = ''
        }, 300)
      }
    }
    
    if (isNearCorrect) {
      // Snap to correct position with smooth animation
      updatePiecePosition(pieceId, correctDisplayX, correctDisplayY)
      placePiece(pieceId)

      // Enhanced visual feedback - success animation
      const pieceElement = document.querySelector(`[data-piece-id="${pieceId}"]`) as HTMLElement
      if (pieceElement) {
        pieceElement.style.animation = 'placeSuccess 0.6s ease-out'
        pieceElement.style.zIndex = '30'

        // Remove animation after completion
        setTimeout(() => {
          pieceElement.style.animation = ''
          pieceElement.style.zIndex = ''
        }, 600)
      }

      // Enhanced sound feedback with multiple audio cues
      try {
        // Play satisfying click sound with slight randomization
        const placeSound = new Audio('/audio/sfx/piece_place.mp3')
        placeSound.volume = 0.4
        placeSound.playbackRate = 0.95 + (Math.random() * 0.1) // Subtle pitch variation for natural feel

        // Add haptic feedback on mobile devices
        if ('vibrate' in navigator && window.innerWidth < 768) {
          navigator.vibrate([30, 10, 30]) // Double vibration for satisfying feel
        }

        placeSound.play().catch(() => {
          // Fallback: create programmatic click sound using Web Audio API
          try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            // Create a more satisfying "click" sound
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
            oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.05)
            oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1)

            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)

            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.15)
          } catch {
            // Web Audio API not available - continue silently
          }
        })
      } catch {
        // Audio completely unavailable - continue silently
        console.log('Piece placed! (Sound feedback not available)')
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

        {/* Draggable pieces overlay with performance optimization */}
        <div className="absolute inset-0">
          {pieces.filter((p) => !p.isPlaced).map((piece) => (
            <DraggablePiece
              key={piece.id}
              piece={piece}
              imageUrl={imageUrl}
              totalPieces={pieces.length}
              imageWidth={imageWidth}
              imageHeight={imageHeight}
            />
          ))}
        </div>

        {/* Performance indicator for large puzzles */}
        {pieces.length > 200 && (
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {pieces.filter(p => !p.isPlaced).length} pieces remaining
          </div>
        )}
      </div>
    </DndContext>
  )
}

function DraggablePiece({ piece, imageUrl, totalPieces, imageWidth, imageHeight }: { piece: any; imageUrl: string; totalPieces: number; imageWidth: number; imageHeight: number }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
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
  const rows = totalPieces / cols
  // Adaptive piece size based on puzzle complexity
  const pieceSize = totalPieces > 200 ? 45 : totalPieces > 100 ? 55 : 65

  // Use cached path or generate simple one for performance
  const path = getJigsawPath(piece.shape, pieceSize)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      data-piece-id={piece.id}
      className={`absolute cursor-move transition-none ${
        isDragging ? 'z-30 scale-95' : 'z-10 group hover:scale-105 hover:z-20'
      }`}
    >
      <svg
        width={pieceSize}
        height={pieceSize}
        viewBox={`0 0 ${pieceSize} ${pieceSize}`}
        style={{ display: 'block' }}
        className={isDragging ? '' : 'drop-shadow-sm'}
      >
        <defs>
          <pattern
            id={`piece-img-${piece.id}`}
            patternUnits="userSpaceOnUse"
            width={pieceSize}
            height={pieceSize}
            x={0}
            y={0}
          >
            <image
              href={imageUrl}
              x={-piece.correctX * (pieceSize / (imageWidth / cols))}
              y={-piece.correctY * (pieceSize / (imageHeight / rows))}
              width={imageWidth * (pieceSize / (imageWidth / cols))}
              height={imageHeight * (pieceSize / (imageHeight / rows))}
              preserveAspectRatio="xMinYMin slice"
            />
          </pattern>
        </defs>

        {/* Simplified rendering for better performance */}
        {isDragging ? (
          // Simple version during drag
          <path
            d={path}
            fill={`url(#piece-img-${piece.id})`}
            stroke="#ffffff"
            strokeWidth={1}
            className="opacity-90"
          />
        ) : (
          // Full version when static
          <>
            {/* Drop shadow */}
            <path
              d={path}
              fill="rgba(0,0,0,0.25)"
              transform="translate(1.5,1.5)"
              className="pointer-events-none"
            />
            {/* Main piece */}
            <path
              d={path}
              fill={`url(#piece-img-${piece.id})`}
              stroke="#ffffff"
              strokeWidth={1.5}
              className="transition-all duration-200 group-hover:stroke-amber-300"
            />
            {/* Highlight */}
            <path
              d={path}
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={0.5}
              transform="translate(-0.3,-0.3)"
              className="pointer-events-none"
            />
          </>
        )}
      </svg>
    </div>
  )
}

// Utility to generate SVG path for a realistic, organic jigsaw puzzle piece
export function getJigsawPath({ top, right, bottom, left }: { top: string; right: string; bottom: string; left: string }, size: number) {
  // Simplified but still organic jigsaw piece generation
  const tabSize = size * 0.25;
  const tabDepth = size * 0.18;

  let path = `M 0 0`;

  // Top edge
  if (top === 'flat') {
    path += ` H ${size}`;
  } else {
    const center = size / 2;
    if (top === 'tab') {
      path += ` H ${center - tabSize/2} Q ${center} ${-tabDepth} ${center + tabSize/2} H ${size}`;
    } else {
      path += ` H ${center - tabSize/2} Q ${center} ${tabDepth} ${center + tabSize/2} H ${size}`;
    }
  }

  // Right edge
  if (right === 'flat') {
    path += ` V ${size}`;
  } else {
    const center = size / 2;
    if (right === 'tab') {
      path += ` V ${center - tabSize/2} Q ${size + tabDepth} ${center} V ${center + tabSize/2} V ${size}`;
    } else {
      path += ` V ${center - tabSize/2} Q ${size - tabDepth} ${center} V ${center + tabSize/2} V ${size}`;
    }
  }

  // Bottom edge
  if (bottom === 'flat') {
    path += ` H 0`;
  } else {
    const center = size / 2;
    if (bottom === 'tab') {
      path += ` H ${center + tabSize/2} Q ${center} ${size + tabDepth} ${center - tabSize/2} H 0`;
    } else {
      path += ` H ${center + tabSize/2} Q ${center} ${size - tabDepth} ${center - tabSize/2} H 0`;
    }
  }

  // Left edge
  if (left === 'flat') {
    path += ` V 0`;
  } else {
    const center = size / 2;
    if (left === 'tab') {
      path += ` V ${center + tabSize/2} Q ${-tabDepth} ${center} V ${center - tabSize/2} V 0`;
    } else {
      path += ` V ${center + tabSize/2} Q ${tabDepth} ${center} V ${center - tabSize/2} V 0`;
    }
  }

  path += ' Z';
  return path;
}
