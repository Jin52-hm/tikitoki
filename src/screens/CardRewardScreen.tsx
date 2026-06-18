import './CardRewardScreen.css'
import NB from '../components/NB'
import book1 from '../assets/book-1.png'

export default function CardRewardScreen({ onHome, onNext }: { onHome: () => void; onNext: () => void }) {
  return (
    <div className="card-reward" onClick={onNext}>
      <img className="reward-bg" src="/assets/card-reward-bg.png" alt="" />
      <div className="reward-overlay" />
      <NB onHome={onHome} activeStage={1} clearedStages={[1, 2, 3]} />
      <div className="reward-card">
        <img className="reward-card-img" src={book1} alt="루비와 빛나는 사과" />
      </div>
      <div className="reward-label">
        <p>루비와 빛나는 사과 카드 획득!</p>
      </div>
    </div>
  )
}
