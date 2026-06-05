import './NB.css'
import homeBtn from '../assets/home-button.svg'

type NBProps = {
  onHome: () => void
  activeStage: 1 | 2 | 3
  clearedStages?: number[]
  compact?: boolean
}

const stageLabels = ['따라말하기', '단어말하기', '문장말하기']

export default function NB({ onHome, activeStage, clearedStages = [], compact = false }: NBProps) {
  const getStageContent = (s: number, i: number) => {
    if (clearedStages.includes(s)) return '⭐️'
    if (!compact && activeStage === s) return `${s}. ${stageLabels[i]}`
    return s
  }

  return (
    <div className="nb">
      <div className="nb-left">
        <button className="nb-home" onClick={(e) => { e.stopPropagation(); onHome(); }} aria-label="홈으로">
          <img src={homeBtn} alt="홈" />
        </button>
        <div className="nb-stagebar">
          {[1, 2, 3].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div
                className={`nb-stage ${clearedStages.includes(s) ? 'cleared' : ''} ${!compact && activeStage === s ? 'active' : ''}`}
              >
                {getStageContent(s, i)}
              </div>
              {i < 2 && <div className={`nb-connector ${clearedStages.includes(s) ? 'cleared' : ''}`} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
