import './ActivityTeachScreen.css'
import NB from '../components/NB'

export default function ActivityTeachScreen({ onHome, onNext }: { onHome: () => void; onNext: () => void }) {
  return (
    <div className="activity-teach" onClick={onNext}>
      <img className="act-bg" src="/assets/forest-bg.png" alt="" />
      <NB onHome={onHome} activeStage={1} clearedStages={[]} />
      <div className="act-prompt-bar">
        <p>이건 '사과'야. 따라 해볼까? '사과'</p>
      </div>
      <img className="act-item" src="/assets/apple.png" alt="사과" />
      <div className="act-word-pill">
        <span className="act-word-big">사</span><span className="act-word-small">과</span>
      </div>
    </div>
  )
}
