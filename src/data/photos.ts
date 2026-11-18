import memory1 from '../assets/photos/memory-1.jpg'
import memory2 from '../assets/photos/memory-2.jpg'
import memory3 from '../assets/photos/memory-3.jpg'
import memory4 from '../assets/photos/memory-4.jpg'
import memory5 from '../assets/photos/memory-5.jpg'
import memory6 from '../assets/photos/memory-6.jpg'

export interface BirthdayPhoto {
  id: number
  caption: string
  tone: string
  image?: string
}

export const birthdayPhotos: BirthdayPhoto[] = [
  { id: 1, caption: 'A close-up smile', tone: 'peach', image: memory1 },
  { id: 2, caption: 'A quiet day outdoors', tone: 'lavender', image: memory2 },
  { id: 3, caption: 'Smiles among the flowers', tone: 'rose', image: memory3 },
  { id: 4, caption: 'A moment in red and white', tone: 'blue', image: memory4 },
  { id: 5, caption: 'A favorite close-up', tone: 'gold', image: memory5 },
  { id: 6, caption: 'A little flower in your hair', tone: 'plum', image: memory6 },
]
