import './CardRewardScreen.css'
import NB from '../components/NB'

export default function CardRewardScreen({ onHome, onNext }: { onHome: () => void; onNext: () => void }) {
  return (
    <div className="card-reward" onClick={onNext}>
      <img className="reward-bg" src="/assets/card-reward-bg.png" alt="" />
      <div className="reward-overlay" />
      <NB onHome={onHome} activeStage={1} clearedStages={[1, 2, 3]} />
      <div className="reward-card">
        <p>루비의 하루</p>
      </div>
      <div className="reward-label">
        <p>루비의 하루 카드 획득!</p>
      </div>
    </div>
  )
}
