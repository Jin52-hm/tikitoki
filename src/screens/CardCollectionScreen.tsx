import { useRef, useState } from 'react'
import './CardCollectionScreen.css'
import homeBtn from '../assets/home-button.svg'
import book1 from '../assets/book-1.png'
import book2 from '../assets/book-2.png'
import book3 from '../assets/book-3.png'

const CARDS = [
  { title: '루비와\n빛나는 사과', image: book1 },
  { title: '핑크공주와 초록공주', image: book2 },
  { title: '얼음왕국 펭귄', image: book3 },
  { title: '달빛 이야기', image: null },
  { title: '작은 영웅', image: null },
  { title: '꿈꾸는 여우', image: null },
  { title: '별빛 마법사', image: null },
  { title: '무지개 용사', image: null },
  { title: '숲속의 친구', image: null },
]

const MASKS = {
  top:    'none',
  middle: 'linear-gradient(to bottom, transparent 0%, black 80px)',
  bottom: 'linear-gradient(to bottom, transparent 0%, black 80px)',
}

export default function CardCollectionScreen({
  onBack,
  unlockedCards = [],
}: {
  onBack: () => void
  unlockedCards?: number[]
}) {
  const unlockedCount = unlockedCards.length
  const gridRef = useRef<HTMLDivElement>(null)
  const [maskKey, setMaskKey] = useState<'top' | 'middle' | 'bottom'>('top')
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null)

  const handleScroll = () => {
    const el = gridRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    if (scrollTop === 0) setMaskKey('top')
    else if (scrollTop + clientHeight >= scrollHeight - 1) setMaskKey('bottom')
    else setMaskKey('middle')
  }

  const handleCardClick = (i: number, unlocked: boolean) => {
    if (!unlocked) return
    setFlippedIndex(prev => (prev === i ? null : i))
  }

  return (
    <div className="card-collection">
      <button className="cc-exit" onClick={onBack} aria-label="홈">
        <img src={homeBtn} alt="홈" />
      </button>
      <h1 className="cc-title">동화 카드</h1>
      <div className="cc-count">{unlockedCount}/{CARDS.length}</div>
      <div
        className="cc-grid"
        ref={gridRef}
        onScroll={handleScroll}
        style={{ WebkitMaskImage: MASKS[maskKey], maskImage: MASKS[maskKey] }}
      >
        {CARDS.map((card, i) => {
          const unlocked = unlockedCards.includes(i)
          const flipped = flippedIndex === i
          return (
            <div
              key={i}
              className={`cc-card ${unlocked ? 'unlocked' : 'locked'}`}
              onClick={() => handleCardClick(i, unlocked)}
            >
              <div className={`cc-card-inner ${flipped ? 'flipped' : ''}`}>
                <div className="cc-card-front">
                  {unlocked && card.image ? (
                    <img className="cc-card-img" src={card.image} alt={card.title} />
                  ) : unlocked ? (
                    <p>{card.title}</p>
                  ) : (
                    <p className="cc-locked-text">?</p>
                  )}
                </div>
                <div className="cc-card-back">
                  <p>{card.title}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
