import './ClearScreen.css'
import NB from '../components/NB'

export default function ClearScreen({ onHome, onNext }: { onHome: () => void; onNext: () => void }) {
  return (
    <div className="clear-screen" onClick={onNext}>
      <img className="clear-bg" src="/assets/fox-success.png" alt="" />
      <div className="clear-overlay" />
      <NB onHome={onHome} activeStage={1} clearedStages={[1]} />
      <div className="clear-status-bar">
        <p>듣고 있어요</p>
      </div>
      <div className="clear-popup">
        <p className="clear-subtitle">따라 말하기 클리어</p>
        <p className="clear-title">참 잘했어요!</p>
        <p className="clear-stars">⭐⭐⭐</p>
      </div>
    </div>
  )
}
