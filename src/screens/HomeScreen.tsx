import './HomeScreen.css'
import logo from '../assets/tikitoki-logo.svg'
import parentsBtn from '../assets/parents-icon.svg'

type HomeScreenProps = {
  onSelect: () => void
  onCards: () => void
}

const BOOKS = [
  { title: '루비의 하루', level: 'lv1' },
  { title: '사과를 찾아서', level: 'lv2' },
  { title: '숲속의 친구들', level: 'lv1' },
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
          <div className="book-card" key={i} onClick={onSelect}>
            <div className="book-cover" />
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
