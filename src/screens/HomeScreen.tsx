import './HomeScreen.css'
import logo from '../assets/tikitoki-logo.svg'
import parentsBtn from '../assets/parents-icon.svg'
import book1 from '../assets/book-1.png'
import book2 from '../assets/book-2.png'
import book3 from '../assets/book-3.png'

type HomeScreenProps = {
  onSelect: (bookIndex: number) => void
  onCards: () => void
}

const BOOKS = [
  { title: '루비와 빛나는 사과', level: 'lv1', image: book1 },
  { title: '핑크공주와 초록공주', level: 'lv2', image: book2 },
  { title: '얼음왕국 펭귄', level: 'lv1', image: book3 },
]

export default function HomeScreen({ onSelect, onCards }: HomeScreenProps) {
  return (
    <div className="home">
      <div className="home-topbar">
        <div className="home-badges">
          <span className="badge badge-level">레벨 2</span>
          <span className="badge badge-name">루비</span>
        </div>
        <div className="home-logo">
          <img src={logo} alt="티키토키" />
        </div>
        <div className="home-actions">
          <button className="btn-cards" onClick={onCards}>동화 카드</button>
          <button className="btn-parents" aria-label="보호자용">
            <img src={parentsBtn} alt="보호자용" />
          </button>
        </div>
      </div>
      <div className="home-books">
        {BOOKS.map((book, i) => (
          <div className={`book-card${i !== 0 ? ' book-card--locked' : ''}`} key={i} onClick={() => onSelect(i)}>
            <img className="book-cover" src={book.image} alt={book.title} />
            <div className="book-title">
              <span>{book.title}</span>
              <span className="book-level">{book.level === 'lv1' ? '😊' : '😄'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
