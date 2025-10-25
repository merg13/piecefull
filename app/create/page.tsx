'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUploader from '@/components/creator/ImageUploader'
import PuzzleSettings from '@/components/creator/PuzzleSettings'
import LivePreview from '@/components/creator/LivePreview'

export default function CreatePage() {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [pieceCount, setPieceCount] = useState(100)
  const [theme, setTheme] = useState('RAINY')
  const [title, setTitle] = useState('')
  const [creatorName, setCreatorName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const router = useRouter()
  
  const handleImageUpload = async (file: File) => {
    setUploadProgress(10)
    const formData = new FormData()
    formData.append('image', file)
    
    setUploadProgress(50)
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      setUploadProgress(80)
      
      if (!response.ok) {
        throw new Error('Upload failed')
      }
      
      const data = await response.json()
      
      // Create a promise to handle image loading
      const loadImage = () => {
        return new Promise<{ width: number; height: number }>((resolve, reject) => {
          const img = new Image()
          
          const timeout = setTimeout(() => {
            reject(new Error('Image load timeout'))
          }, 10000) // 10 second timeout
          
          img.onload = () => {
            clearTimeout(timeout)
            resolve({ width: img.width, height: img.height })
          }
          
          img.onerror = () => {
            clearTimeout(timeout)
            reject(new Error('Failed to load image'))
          }
          
          img.src = data.imageUrl
        })
      }
      
      try {
        setUploadProgress(90)
        const dimensions = await loadImage()
        setImageSize(dimensions)
        setUploadProgress(100)
        setTimeout(() => setUploadProgress(0), 500)
        setImageUrl(data.imageUrl)
      } catch (error) {
        console.error('Failed to load image:', error)
        setUploadProgress(0)
        alert('Failed to load image. Please try again.')
      }
    } catch (error) {
      console.error('Upload failed:', error)
      setUploadProgress(0)
      alert('Upload failed. Please try again.')
    }
  }
  
  const handleGeneratePuzzle = async () => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/puzzle/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          imageWidth: imageSize.width,
          imageHeight: imageSize.height,
          pieceCount,
          theme,
          title,
          creatorName
        })
      })
      
      if (!response.ok) {
        throw new Error('Puzzle creation failed')
      }
      
      const data = await response.json()
      setShareLink(data.solveLink)
    } catch (error) {
      console.error('Failed to generate puzzle:', error)
      alert('Failed to generate puzzle. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-8 flex flex-col">
      <div className="max-w-6xl mx-auto flex-1 flex flex-col w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-amber-900">
          Create Your Cozy Puzzle
        </h1>
        
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${!imageUrl ? 'flex-1 items-center' : ''}`}>
          <div className={`space-y-6 ${!imageUrl ? 'flex flex-col justify-center' : ''}`}>
            <div className="relative">
              <ImageUploader onUpload={handleImageUpload} />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/90 rounded-full p-2">
                    <div className="bg-amber-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-amber-600 h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <div className="text-xs text-center mt-1">
                      Uploading... {uploadProgress}%
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {imageUrl && (
              <PuzzleSettings
                pieceCount={pieceCount}
                setPieceCount={setPieceCount}
                theme={theme}
                setTheme={setTheme}
                title={title}
                setTitle={setTitle}
                creatorName={creatorName}
                setCreatorName={setCreatorName}
              />
            )}
            
            {imageUrl && (
              <button
                onClick={handleGeneratePuzzle}
                disabled={isGenerating}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating...
                  </div>
                ) : (
                  'Generate Puzzle'
                )}
              </button>
            )}
            
            {shareLink && (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="font-semibold mb-2">🎉 Share Your Puzzle!</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your puzzle is ready! Share this link with friends and family.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-4 py-2 border rounded text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareLink).then(() => {
                        alert('Link copied to clipboard!')
                      }).catch(() => {
                        // Fallback for browsers that don't support clipboard API
                        const textArea = document.createElement('textarea')
                        textArea.value = shareLink
                        document.body.appendChild(textArea)
                        textArea.select()
                        try {
                          document.execCommand('copy')
                          alert('Link copied to clipboard!')
                        } catch {
                          alert('Please manually copy the link')
                        }
                        document.body.removeChild(textArea)
                      })
                    }}
                    className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition text-sm"
                  >
                    Copy
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={() => router.push(shareLink.replace(window.location.origin, ''))}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
                  >
                    Try Your Puzzle Now!
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div>
            {imageUrl && (
              <LivePreview
                imageUrl={imageUrl}
                pieceCount={pieceCount}
                theme={theme}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
