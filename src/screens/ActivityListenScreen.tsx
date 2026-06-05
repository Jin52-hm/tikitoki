import './ActivityListenScreen.css'
import NB from '../components/NB'

export default function ActivityListenScreen({ onHome, onNext }: { onHome: () => void; onNext: () => void }) {
  return (
    <div className="activity-listen" onClick={onNext}>
      <img className="listen-bg" src="/assets/forest-bg.png" alt="" />
      <NB onHome={onHome} activeStage={1} clearedStages={[]} />
      <div className="listen-status-bar">
        <p>듣고 있어요</p>
      </div>
      <img className="listen-item" src="/assets/apple.png" alt="사과" />
      <div className="listen-word-pill">
        <span className="listen-word-big">사</span><span className="listen-word-small">과</span>
      </div>
    </div>
  )
}
