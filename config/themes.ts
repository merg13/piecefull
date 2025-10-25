import { ThemeConfig } from '@/types/puzzle'

export const themes: Record<string, ThemeConfig> = {
  CHRISTMAS: {
    background: '/images/backgrounds/christmas_room.png',
    weather: 'snow',
    music: ['/audio/lofi/christmas_1.mp3'],
    pet: 'cat',
    palette: ['#8B2929', '#2F5233', '#F4E4C1']
  },
  HALLOWEEN: {
    background: '/images/backgrounds/halloween_room.png',
    weather: 'foggy',
    music: ['/audio/lofi/halloween_1.mp3'],
    pet: 'cat',
    palette: ['#FF6B35', '#2D1B2E', '#F4A259']
  },
  RAINY: {
    background: '/images/backgrounds/rainy_room.png',
    weather: 'rain',
    music: ['/audio/lofi/rainy_1.mp3'],
    pet: 'dog',
    palette: ['#5B7C99', '#748E8E', '#D4C5B9']
  },
  SUMMER: {
    background: '/images/backgrounds/summer_room.png',
    weather: 'sunny',
    music: ['/audio/lofi/summer_1.mp3'],
    pet: 'cat',
    palette: ['#F4B942', '#88D498', '#F8E5B8']
  },
  FALL: {
    background: '/images/backgrounds/fall_room.png',
    weather: 'leaves',
    music: ['/audio/lofi/fall_1.mp3'],
    pet: 'dog',
    palette: ['#D4651E', '#8B4513', '#F5DEB3']
  }
}
