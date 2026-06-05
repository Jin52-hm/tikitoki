import './WarnBookScreen.css'
import homeBtn from '../assets/home-button.svg'

interface WarnBookScreenProps {
  bookImage: string
  onHome: () => void
}

export default function WarnBookScreen({ bookImage, onHome }: WarnBookScreenProps) {
  return (
    <div className="warn-book">
      <img className="warn-book-bg" src={bookImage} alt="" />
      <div className="warn-book-overlay" />
      <div className="warn-book-nb">
        <button className="warn-book-home-btn" onClick={onHome} aria-label="홈으로">
          <img src={homeBtn} alt="홈" />
        </button>
      </div>
      <p className="warn-book-text">아직 준비중이에요!</p>
    </div>
  )
}
