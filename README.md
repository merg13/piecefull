# 🧩 Cozy Puzzle App

A beautiful, cozy jigsaw puzzle creator and solver with seasonal themes, lofi music, and animated pets. Built with Next.js 14, TypeScript, and modern web technologies.

![Cozy Puzzle App](https://via.placeholder.com/800x400/f59e0b/ffffff?text=Cozy+Puzzle+App)

## ✨ Features

### 🎨 **Puzzle Creation**
- Upload any image to create custom jigsaw puzzles
- Choose from 25 to 500 pieces
- 5 beautiful seasonal themes (Christmas, Halloween, Rainy, Summer, Fall)
- Live preview with piece grid overlay
- Shareable puzzle links

### 🧩 **Puzzle Solving**
- Smooth drag-and-drop gameplay
- Auto-save progress with localStorage
- Smart piece snapping with visual feedback
- Timer and progress tracking
- Celebration with confetti animation

### 🎵 **Cozy Atmosphere**
- Lofi music player with volume control
- Animated weather effects (rain, snow, falling leaves)
- Cute pet companions (cats and dogs)
- Seasonal background themes
- Relaxing, distraction-free interface

### 📱 **Modern UX**
- Fully responsive design
- Touch-friendly mobile interface
- Accessibility features
- Fast loading with optimized images
- Error handling with graceful fallbacks

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL database
- AWS S3 bucket or Cloudflare R2 (for image storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cozy-puzzle-app.git
   cd cozy-puzzle-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your actual values:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/cozy_puzzles"
   AWS_ACCESS_KEY_ID="your_access_key"
   AWS_SECRET_ACCESS_KEY="your_secret_key"
   AWS_S3_BUCKET="your-bucket-name"
   AWS_REGION="us-east-1"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
cozy-puzzle-app/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── create/            # Puzzle creation page
│   ├── puzzle/[link]/     # Puzzle solver page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── creator/          # Puzzle creation components
│   └── solver/           # Puzzle solving components
├── config/               # Configuration files
├── lib/                  # Utility libraries
├── store/               # Zustand state management
├── types/               # TypeScript type definitions
└── public/              # Static assets
    ├── audio/           # Music and sound effects
    └── images/          # Background images and assets
```

## 🎯 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Zustand** - State management

### Backend
- **Next.js API Routes** - Server-side API
- **PostgreSQL** - Database
- **AWS S3** - Image storage

### Key Libraries
- **@dnd-kit** - Drag and drop functionality
- **Howler.js** - Audio management
- **Sharp** - Image processing
- **Canvas Confetti** - Celebration animations
- **React Dropzone** - File upload handling

## 🎮 Usage Guide

### Creating a Puzzle

1. **Upload an Image**
   - Drag and drop or click to select an image
   - Supported formats: PNG, JPG, WEBP (max 10MB)
   - Images are automatically optimized

2. **Configure Settings**
   - Choose piece count (25-500 pieces)
   - Select a seasonal theme
   - Add optional title and creator name

3. **Generate and Share**
   - Click "Generate Puzzle" to create your puzzle
   - Copy the shareable link to send to friends
   - Try your puzzle immediately

### Solving a Puzzle

1. **Welcome Screen**
   - Read puzzle info and choose when to start
   - Background music begins playing

2. **Puzzle Gameplay**
   - Drag pieces from the puzzle box to the board
   - Pieces snap when placed correctly
   - Use shuffle and reset buttons as needed
   - Progress is automatically saved

3. **Completion**
   - Enjoy the celebration animation
   - Share your completion time
   - Try the puzzle again or share with others

## 🎨 Themes

### 🌧️ Rainy Day
- **Mood**: Cozy indoor vibes
- **Weather**: Gentle rainfall animation
- **Pet**: Sleepy dog companion
- **Music**: Mellow lofi beats

### 🎄 Christmas
- **Mood**: Festive and warm
- **Weather**: Soft snowfall
- **Pet**: Playful cat with holiday spirit
- **Music**: Holiday-themed lofi

### 🎃 Halloween
- **Mood**: Spooky but cozy
- **Weather**: Mysterious fog effects
- **Pet**: Black cat with glowing eyes
- **Music**: Atmospheric lofi

### ☀️ Summer
- **Mood**: Bright and cheerful
- **Weather**: Sunny with light effects
- **Pet**: Active cat enjoying the warmth
- **Music**: Upbeat lofi vibes

### 🍂 Fall
- **Mood**: Autumn nostalgia
- **Weather**: Falling leaves animation
- **Pet**: Dog playing in leaves
- **Music**: Contemplative lofi sounds

## 🛠️ Development

### Running Locally

```bash
# Start development server
npm run dev

# Run database migrations


# Build for production
npm run build

# Start production server
npm start
```

### Environment Setup

1. **Database**: Set up PostgreSQL locally or use a cloud service like Supabase
2. **File Storage**: Configure AWS S3 or Cloudflare R2 for image uploads
3. **Assets**: Add your own music files and background images to the `public` directory

### Adding New Themes

1. Update `config/themes.ts` with new theme configuration
2. Add background image to `public/images/backgrounds/`
3. Add music track to `public/audio/lofi/`
4. Update theme selection UI in `PuzzleSettings.tsx`

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect GitHub repository**
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel automatically builds and deploys

### Environment Variables for Production

```env
DATABASE_URL="postgresql://..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="your-production-bucket"
AWS_REGION="us-east-1"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## 🔧 Configuration

### Database Schema


- **Puzzle**: Stores puzzle metadata and piece data
- **PuzzleSolve**: Tracks completion statistics

### File Upload

Images are processed with Sharp for optimization:
- Resized to max 2000x2000px
- Compressed to 85% JPEG quality
- Stored in S3 with unique filenames

### State Management

Zustand store manages:
- Puzzle pieces and their positions
- Game timer and progress
- localStorage persistence
- Completion status

## 🎵 Audio Assets

The app expects these audio files in `public/audio/`:

```
public/audio/
├── lofi/
│   ├── christmas_1.mp3
│   ├── halloween_1.mp3
│   ├── rainy_1.mp3
│   ├── summer_1.mp3
│   └── fall_1.mp3
└── sfx/
    ├── piece_place.mp3
    ├── puzzle_complete.mp3
    ├── button_click.mp3
    └── shuffle.mp3
```

**Note**: Audio files are not included in the repository. Add your own or use placeholder paths.

## 🖼️ Image Assets

Background images should be placed in `public/images/backgrounds/`:

- `christmas_room.png`
- `halloween_room.png`
- `rainy_room.png`
- `summer_room.png`
- `fall_room.png`

**Recommended size**: 2560x1440px or higher for best quality.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Lofi Music Community** for inspiration
- **Puzzle Enthusiasts** for feature ideas
- **Open Source Contributors** for the amazing libraries used

## 📞 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/yourusername/cozy-puzzle-app/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

**Built with ❤️ for puzzle lovers everywhere**

*Enjoy creating and solving cozy puzzles!* 🧩✨
