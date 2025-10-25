'use client'

interface PuzzleSettingsProps {
  pieceCount: number
  setPieceCount: (count: number) => void
  theme: string
  setTheme: (theme: string) => void
  title: string
  setTitle: (title: string) => void
  creatorName: string
  setCreatorName: (name: string) => void
}

const PIECE_OPTIONS = [25, 50, 100, 200, 500]
const THEMES = [
  { id: 'RAINY', name: 'Cozy Rainy Day', icon: '🌧️' },
  { id: 'CHRISTMAS', name: 'Christmas', icon: '🎄' },
  { id: 'HALLOWEEN', name: 'Halloween', icon: '🎃' },
  { id: 'SUMMER', name: 'Sunny Summer', icon: '☀️' },
  { id: 'FALL', name: 'Leaves Falling', icon: '🍂' }
]

export default function PuzzleSettings({
  pieceCount,
  setPieceCount,
  theme,
  setTheme,
  title,
  setTitle,
  creatorName,
  setCreatorName
}: PuzzleSettingsProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
      <h2 className="text-2xl font-semibold">Puzzle Settings</h2>
      
      {/* Piece Count */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Number of Pieces: {pieceCount}
        </label>
        <input
          type="range"
          min="0"
          max={PIECE_OPTIONS.length - 1}
          value={PIECE_OPTIONS.indexOf(pieceCount)}
          onChange={(e) => setPieceCount(PIECE_OPTIONS[Number(e.target.value)])}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          {PIECE_OPTIONS.map((count) => (
            <span key={count}>{count}</span>
          ))}
        </div>
      </div>
      
      {/* Theme Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Theme</label>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`p-3 rounded-lg border-2 transition ${
                theme === t.id
                  ? 'border-amber-600 bg-amber-50'
                  : 'border-gray-200 hover:border-amber-300'
              }`}
            >
              <div className="text-2xl mb-1">{t.icon}</div>
              <div className="text-sm font-medium">{t.name}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Optional Fields */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Puzzle Title (Optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Mountain Sunset"
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Your Name (Optional)
        </label>
        <input
          type="text"
          value={creatorName}
          onChange={(e) => setCreatorName(e.target.value)}
          placeholder="e.g., Alex"
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
    </div>
  )
}
