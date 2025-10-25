'use client'

interface LivePreviewProps {
  imageUrl: string
  pieceCount: number
  theme: string
}

export default function LivePreview({ imageUrl, pieceCount, theme }: LivePreviewProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Preview</h2>
      <div className="relative overflow-hidden rounded-lg">
        <img
          src={imageUrl}
          alt="Puzzle preview"
          className="w-full h-auto object-contain rounded-lg"
          style={{ maxHeight: '500px' }}
        />
        <div className="absolute inset-0 pointer-events-none bg-black/5" />
      </div>
      <p className="text-sm text-gray-500 mt-2 text-center">
        Preview with {pieceCount} pieces
      </p>
    </div>
  )
}