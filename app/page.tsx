'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-6xl font-bold text-amber-900 mb-6">
              Cozy Puzzle App
            </h1>
            <p className="text-2xl text-gray-700 mb-12 max-w-3xl mx-auto">
              Create beautiful jigsaw puzzles and share them with friends. 
              Solve puzzles in a relaxing lofi atmosphere with animated pets and seasonal themes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white text-xl font-semibold rounded-lg shadow-lg transition"
                >
                  Create a Puzzle
                </motion.button>
              </Link>
              
              <motion.a
                href="#features"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white hover:bg-gray-50 text-amber-900 text-xl font-semibold rounded-lg shadow-lg transition"
              >
                Learn More
              </motion.a>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 text-6xl opacity-20 animate-float">🧩</div>
        <div className="absolute top-40 right-20 text-4xl opacity-20 animate-float-delay">🎨</div>
        <div className="absolute bottom-20 left-20 text-5xl opacity-20 animate-float-delay-2">☕</div>
      </div>
      
      {/* Features Section */}
      <div id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-amber-900 mb-16">
            Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🎨"
              title="Custom Puzzles"
              description="Upload any image and create puzzles with 25 to 500 pieces"
            />
            <FeatureCard
              icon="🎵"
              title="Lofi Vibes"
              description="Relax with curated lofi music while solving puzzles"
            />
            <FeatureCard
              icon="🐱"
              title="Animated Pets"
              description="Watch adorable cats and dogs keep you company"
            />
            <FeatureCard
              icon="🌧️"
              title="Seasonal Themes"
              description="Choose from 5 cozy themes with unique atmospheres"
            />
            <FeatureCard
              icon="🔗"
              title="Easy Sharing"
              description="Share puzzle links with friends and family"
            />
            <FeatureCard
              icon="💾"
              title="Auto-Save"
              description="Your progress is automatically saved as you play"
            />
          </div>
        </div>
      </div>
      
      {/* Themes Section */}
      <div className="py-24 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-amber-900 mb-16">
            Seasonal Themes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ThemeCard emoji="🌧️" name="Cozy Rainy Day" />
            <ThemeCard emoji="🎄" name="Christmas" />
            <ThemeCard emoji="🎃" name="Halloween" />
            <ThemeCard emoji="☀️" name="Sunny Summer" />
            <ThemeCard emoji="🍂" name="Leaves Falling" />
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-24 bg-amber-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Create Your First Puzzle?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start creating and sharing beautiful puzzles in minutes
          </p>
          <Link href="/create">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-amber-900 text-xl font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition"
            >
              Get Started Free
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-amber-50 p-6 rounded-xl shadow-md hover:shadow-lg transition"
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-amber-900 mb-2">{title}</h3>
      <p className="text-gray-700">{description}</p>
    </motion.div>
  )
}

function ThemeCard({ emoji, name }: { emoji: string; name: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition text-center"
    >
      <div className="text-6xl mb-4">{emoji}</div>
      <h3 className="text-xl font-bold text-amber-900">{name}</h3>
    </motion.div>
  )
}
