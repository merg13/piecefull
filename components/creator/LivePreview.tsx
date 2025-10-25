'use client'

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
