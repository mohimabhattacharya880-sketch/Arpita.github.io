import { useEffect, useRef, useState } from 'react'
import { birthdayMessages } from '../data/messages'
import { birthdayPhotos } from '../data/photos'
import type { BirthdayPhoto } from '../data/photos'

interface MemoryScreenProps {
  onRestart: () => void
}

interface HeartParticle {
  x: number
  y: number
  targetX: number
  targetY: number
  size: number
  color: string
  delay: number
}

function HeartTreeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let particles: HeartParticle[] = []
    let frame = 0
    let startTime = 0
    const colors = ['#ff83bb', '#f34e96', '#c468ff', '#ffb1d3', '#ff6b85', '#ec9cff']

    const heartPoint = (t: number, scale: number) => ({
      x: 16 * Math.pow(Math.sin(t), 3) * scale,
      y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale,
    })

    const buildParticles = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      canvas.width = width * ratio
      canvas.height = height * ratio
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      const canopyScale = Math.min(width * 0.021, height * 0.018, 6.1)
      const centerX = width / 2
      const centerY = height * 0.38
      const next: HeartParticle[] = []

      for (let index = 0; index < 280; index += 1) {
        const t = Math.random() * Math.PI * 2
        const edge = Math.sqrt(Math.random())
        const point = heartPoint(t, canopyScale * edge)
        const targetX = centerX + point.x
        const targetY = centerY + point.y
        next.push({
          x: centerX + (Math.random() - 0.5) * width * 0.8,
          y: height + Math.random() * height * 0.5,
          targetX,
          targetY,
          size: 5 + Math.random() * 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 1300,
        })
      }

      for (let index = 0; index < 46; index += 1) {
        const y = centerY + canopyScale * 5 + index * (height * 0.0026)
        const spread = Math.max(4, 25 - index * 0.3)
        next.push({
          x: centerX + (Math.random() - 0.5) * width,
          y: height + Math.random() * height,
          targetX: centerX + (Math.random() - 0.5) * spread,
          targetY: y,
          size: 4 + Math.random() * 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: 700 + Math.random() * 1100,
        })
      }
      particles = next
    }

    const drawHeart = (x: number, y: number, size: number, color: string) => {
      context.save()
      context.translate(x, y)
      context.scale(size / 32, size / 32)
      context.beginPath()
      context.moveTo(0, 28)
      context.bezierCurveTo(-32, 8, -20, -12, 0, 2)
      context.bezierCurveTo(20, -12, 32, 8, 0, 28)
      context.fillStyle = color
      context.shadowColor = color
      context.shadowBlur = 12
      context.fill()
      context.restore()
    }

    const draw = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const centerX = width / 2
      const trunkStart = height * 0.68
      const trunkEnd = height * 0.94
      const trunkGradient = context.createLinearGradient(centerX, trunkStart, centerX, trunkEnd)
      trunkGradient.addColorStop(0, 'rgba(247, 126, 187, .9)')
      trunkGradient.addColorStop(1, 'rgba(170, 95, 220, .16)')
      context.beginPath()
      context.moveTo(centerX, trunkStart)
      context.bezierCurveTo(centerX - 10, height * 0.79, centerX + 10, height * 0.86, centerX, trunkEnd)
      context.strokeStyle = trunkGradient
      context.lineWidth = Math.max(5, width * 0.012)
      context.shadowColor = '#f779bd'
      context.shadowBlur = 22
      context.stroke()
      context.shadowBlur = 0

      particles.forEach((particle) => {
        const progress = reducedMotion ? 1 : Math.min(1, Math.max(0, (elapsed - particle.delay) / 1800))
        const eased = 1 - Math.pow(1 - progress, 3)
        const drift = reducedMotion ? 0 : Math.sin(elapsed / 800 + particle.delay) * 2
        const x = particle.x + (particle.targetX - particle.x) * eased + drift
        const y = particle.y + (particle.targetY - particle.y) * eased
        drawHeart(x, y, particle.size, particle.color)
      })

      if (!reducedMotion) frame = window.requestAnimationFrame(draw)
    }

    buildParticles()
    frame = window.requestAnimationFrame(draw)
    window.addEventListener('resize', buildParticles)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', buildParticles)
    }
  }, [])

  return <canvas ref={canvasRef} className="tree-canvas" aria-label="A tree made of glowing pink and purple hearts" role="img" />
}

function PlaceholderArtwork({ photo }: { photo: BirthdayPhoto }) {
  if (photo.image) {
    return <img className="photo-image" src={photo.image} alt={photo.caption} />
  }

  return (
    <div className={`photo-art photo-art-${photo.tone}`} aria-hidden="true">
      <span className="art-glow" />
      <span className="art-moon" />
      <span className="art-hill hill-back" />
      <span className="art-hill hill-front" />
      <span className="art-spark art-spark-one">✦</span>
      <span className="art-spark art-spark-two">✧</span>
      <span className="art-placeholder-label">YOUR PHOTO HERE</span>
    </div>
  )
}

function Lightbox({ photo, onClose }: { photo: BirthdayPhoto; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    document.body.classList.add('lightbox-open')
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.classList.remove('lightbox-open')
    }
  }, [onClose])

  return (
    <div className="lightbox-backdrop" onClick={onClose} role="presentation">
      <section className="lightbox" role="dialog" aria-modal="true" aria-label={photo.caption} onClick={(event) => event.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose} aria-label="Close photo">×</button>
        <PlaceholderArtwork photo={photo} />
        <p className="lightbox-caption">{photo.caption}</p>
      </section>
    </div>
  )
}

export default function MemoryScreen({ onRestart }: MemoryScreenProps) {
  const [activePhoto, setActivePhoto] = useState<BirthdayPhoto | null>(null)
  const [visibleMessages, setVisibleMessages] = useState(0)

  useEffect(() => {
    const timers = birthdayMessages.map((_, index) =>
      window.setTimeout(() => setVisibleMessages(index + 1), 1800 + index * 1500),
    )
    return () => timers.forEach(window.clearTimeout)
  }, [])

  return (
    <main className="memory-screen screen">
      <div className="memory-grain" aria-hidden="true" />
      <header className="memory-header">
        <p className="eyebrow"><span /> A GARDEN OF LITTLE WISHES <span /></p>
        <h1>For your <em>beautiful</em> year</h1>
        <p>Every heart holds a wish, and every wish is for you.</p>
      </header>
      <section className="memory-stage" aria-label="Birthday wishes and memories">
        <aside className="message-column" aria-label="Birthday wishes">
          {birthdayMessages.slice(0, 2).map((message, index) => (
            <article key={message} className={`wish-card wish-left ${visibleMessages > index ? 'wish-visible' : ''}`}>
              <span className="wish-mark">✦</span>
              <p>{message}</p>
              <span className="wish-number">0{index + 1} — A WISH FOR YOU</span>
            </article>
          ))}
          <button className="restart-link" onClick={onRestart}>↶ <span>Replay the surprise</span></button>
        </aside>
        <div className="tree-stage">
          <div className="tree-halo" />
          <HeartTreeCanvas />
          <div className="tree-inscription">
            <span>GROWN WITH LOVE</span>
            <strong>For Arpita <i>♡</i></strong>
          </div>
        </div>
        <aside className="message-column message-column-right" aria-label="More birthday wishes">
          {birthdayMessages.slice(2).map((message, index) => (
            <article key={message} className={`wish-card wish-right ${visibleMessages > index + 2 ? 'wish-visible' : ''}`}>
              <span className="wish-mark">✧</span>
              <p>{message}</p>
              <span className="wish-number">0{index + 3} — A WISH FOR YOU</span>
            </article>
          ))}
          <div className="floating-photo photo-float-one">
            <button onClick={() => setActivePhoto(birthdayPhotos[0])} aria-label="View photo placeholder: a little golden hour">
              <PlaceholderArtwork photo={birthdayPhotos[0]} />
            </button>
          </div>
          <div className="floating-photo photo-float-two">
            <button onClick={() => setActivePhoto(birthdayPhotos[1])} aria-label="View photo placeholder: the happy moments">
              <PlaceholderArtwork photo={birthdayPhotos[1]} />
            </button>
          </div>
        </aside>
      </section>
      <section className="gallery-section" aria-labelledby="gallery-title">
        <div className="gallery-heading">
          <span>THE LITTLE THINGS WE TREASURE</span>
          <h2 id="gallery-title">A few <em>favorite</em> moments</h2>
          <p>Replace each frame with a memory you love.</p>
        </div>
        <div className="polaroid-grid">
          {birthdayPhotos.map((photo, index) => (
            <button
              className={`polaroid polaroid-${index + 1}`}
              key={photo.id}
              onClick={() => setActivePhoto(photo)}
              style={{ '--card-index': index } as React.CSSProperties}
              aria-label={`Open photo: ${photo.caption}`}
            >
              <PlaceholderArtwork photo={photo} />
              <span className="polaroid-caption">{photo.caption}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="music-section" aria-labelledby="music-title">
        <div className="gallery-heading">
          <span>A LITTLE SONG FOR YOU</span>
          <h2 id="music-title">A moment of <em>music</em></h2>
        </div>
        <iframe
          className="music-player"
          src="https://www.youtube-nocookie.com/embed/qJa_WD5mNho?autoplay=1&controls=1&start=54&end=90&rel=0&playsinline=1"
          title="Bairi Piya — selected song"
          allow="autoplay; encrypted-media; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          loading="lazy"
        />
      </section>
      <footer className="memory-footer">
        <div className="memory-footer-message"><span>MADE WITH LOVE</span><i>♡</i><span>JUST FOR ARPITA</span></div>
        <span className="memory-footer-credit">Created with love by Locknath Datta</span>
      </footer>
      {activePhoto && <Lightbox photo={activePhoto} onClose={() => setActivePhoto(null)} />}
    </main>
  )
}
