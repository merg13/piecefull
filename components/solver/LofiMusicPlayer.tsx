'use client'

import { useEffect, useRef, useState } from 'react'
import { Howl } from 'howler'
import { themes } from '@/config/themes'

interface LofiMusicPlayerProps {
  theme: string
}

export default function LofiMusicPlayer({ theme }: LofiMusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const soundRef = useRef<Howl | null>(null)
  
  useEffect(() => {
    const themeConfig = themes[theme]
    const musicTrack = themeConfig.music[0] // Use first track for now
    
    // Clean up previous sound
    if (soundRef.current) {
      soundRef.current.unload()
    }
    
    soundRef.current = new Howl({
      src: [musicTrack],
      loop: true,
      volume: volume,
      autoplay: false,
      onloaderror: () => {
        console.log('Music file not found, using silent mode')
      },
      onplayerror: () => {
        console.log('Music playback failed, continuing silently')
      }
    })
    
    return () => {
      if (soundRef.current) {
        soundRef.current.unload()
      }
    }
  }, [theme, volume])
  
  const togglePlay = () => {
    if (!soundRef.current) return
    
    try {
      if (isPlaying) {
        soundRef.current.pause()
      } else {
        soundRef.current.play()
      }
      setIsPlaying(!isPlaying)
    } catch (error) {
      console.log('Music control failed, continuing silently')
    }
  }
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (soundRef.current) {
      soundRef.current.volume(newVolume)
    }
  }
  
  return (
    <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-600 hover:bg-amber-700 text-white transition"
          title={isPlaying ? 'Pause music' : 'Play music'}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        
        <div className="flex items-center gap-2">
          <span className="text-sm" title="Volume">🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24"
            title="Volume control"
          />
        </div>
        
        <div className="text-xs text-gray-600">
          Lofi
        </div>
      </div>
    </div>
  )
}
