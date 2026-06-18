import { useState } from 'react'
import './OnboardingScreen.css'

export type Level = 1 | 2 | 3

type Props = {
  onComplete: (level: Level) => void
}

type Survey = {
  age: number
  ciAge: '' | 'before1' | '2to3' | '3to4' | 'after4'
  ciDuration: '' | 'under6m' | '6m1y' | '1y2y' | 'over2y'
  therapy: '' | 'current' | 'experienced' | 'none'
  speakingLevel: '' | 'babble' | 'word' | 'sentence'
}

export const LEVEL_INFO = {
  1: { speech: '옹알이 수준', syllables: '1–2음절', speed: '느린 속도', autoClear: 80, color: '#00b686', bg: '#e4fff6' },
  2: { speech: '단어 수준',   syllables: '2–3음절', speed: '표준 속도', autoClear: 70, color: '#00d0d4', bg: '#e4fafe' },
  3: { speech: '짧은 문장 수준', syllables: '–',   speed: '표준 속도', autoClear: 50, color: '#8c65be', bg: '#f0eaff' },
} as const

function calcLevel(survey: Survey): Level {
  if (survey.speakingLevel === 'sentence') return 3
  if (survey.speakingLevel === 'word') {
    return survey.ciDuration === 'under6m' ? 1 : 2
  }
  // babble or unset
  return survey.ciDuration === 'over2y' ? 2 : 1
}

const TOTAL_STEPS = 8
const LISTEN_ANSWER = 'dog'

export default function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [survey, setSurvey] = useState<Survey>({
    age: 0, ciAge: '', ciDuration: '', therapy: '', speakingLevel: '',
  })
  const [listenAnswer, setListenAnswer] = useState<string | null>(null)
  const [speakPhase, setSpeakPhase] = useState<'idle' | 'listening' | 'done'>('idle')

  const level = calcLevel(survey)

  const canNext = (): boolean => {
    if (step === 1) return survey.age >= 1
    if (step === 2) return survey.ciAge !== ''
    if (step === 3) return survey.ciDuration !== ''
    if (step === 4) return survey.therapy !== ''
    if (step === 5) return survey.speakingLevel !== ''
    if (step === 6) return listenAnswer !== null
    if (step === 7) return speakPhase === 'done'
    return true
  }

  const handleNext = () => {
    if (step >= TOTAL_STEPS) { onComplete(level); return }
    setStep(s => s + 1)
  }
  const handlePrev = () => setStep(s => Math.max(0, s - 1))

  const nextLabel = step === 0 ? '시작하기' : step >= TOTAL_STEPS ? '학습 시작!' : '다음'
  const sectionLabel = step <= 5 ? '부모 설문' : step <= 7 ? '아동 테스트' : '레벨 배정'

  return (
    <div className="onboarding">
      {step > 0 && (
        <div className="ob-header">
          <div className="ob-progress">
            <div className="ob-progress-fill" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
          </div>
          <div className="ob-step-text">{sectionLabel} · {step}/{TOTAL_STEPS}</div>
        </div>
      )}

      <div className="ob-body">
        <div className={`ob-card${step === 0 ? ' ob-card--welcome' : ''}`}>
          {step === 0 && <WelcomeCard />}
          {step === 1 && (
            <AgeCard age={survey.age} onChange={v => setSurvey(s => ({ ...s, age: v }))} />
          )}
          {step === 2 && (
            <ChoiceCard
              qNum="Q2" q="인공와우를 언제 착용했나요?"
              hint="착용 시기를 선택해 주세요"
              cols={2}
              choices={[
                { id: 'before1', label: '1세 전후' },
                { id: '2to3',   label: '2–3세' },
                { id: '3to4',   label: '3–4세' },
                { id: 'after4', label: '4세 이후' },
              ]}
              value={survey.ciAge}
              onChange={v => setSurvey(s => ({ ...s, ciAge: v as Survey['ciAge'] }))}
            />
          )}
          {step === 3 && (
            <ChoiceCard
              qNum="Q3" q="인공와우를 착용한 지 얼마나 됐나요?"
              hint="착용 기간을 선택해 주세요"
              cols={2}
              choices={[
                { id: 'under6m', label: '6개월 미만' },
                { id: '6m1y',   label: '6개월–1년' },
                { id: '1y2y',   label: '1–2년' },
                { id: 'over2y', label: '2년 이상' },
              ]}
              value={survey.ciDuration}
              onChange={v => setSurvey(s => ({ ...s, ciDuration: v as Survey['ciDuration'] }))}
            />
          )}
          {step === 4 && (
            <ChoiceCard
              qNum="Q4" q="현재 언어 재활 치료를 받고 있나요?"
              hint="해당하는 항목을 선택해 주세요"
              cols={3}
              choices={[
                { id: 'current',     label: '치료 중' },
                { id: 'experienced', label: '치료 경험 있음' },
                { id: 'none',        label: '없음' },
              ]}
              value={survey.therapy}
              onChange={v => setSurvey(s => ({ ...s, therapy: v as Survey['therapy'] }))}
            />
          )}
          {step === 5 && (
            <SpeakingLevelCard
              value={survey.speakingLevel}
              onChange={v => setSurvey(s => ({ ...s, speakingLevel: v as Survey['speakingLevel'] }))}
            />
          )}
          {step === 6 && (
            <ListenTestCard answer={listenAnswer} setAnswer={setListenAnswer} />
          )}
          {step === 7 && (
            <SpeakTestCard phase={speakPhase} setPhase={setSpeakPhase} />
          )}
          {step === 8 && <ResultCard level={level} />}
        </div>
      </div>

      <div className="ob-footer">
        {step > 0 && step < 8 && (
          <button className="ob-btn ob-btn--back" onClick={handlePrev}>이전</button>
        )}
        <button
          className={`ob-btn ob-btn--next${!canNext() ? ' ob-btn--disabled' : ''}`}
          onClick={handleNext}
          disabled={!canNext()}
        >
          {nextLabel}
        </button>
        {step < 8 && (
          <button className="ob-btn ob-btn--skip" onClick={() => onComplete(1)}>건너뛰기</button>
        )}
      </div>
    </div>
  )
}

/* ---- Step components ---- */

function WelcomeCard() {
  return (
    <div className="ob-welcome">
      <div className="ob-welcome-emoji">🐰</div>
      <div className="ob-welcome-title">티키토키에 오신 것을 환영해요!</div>
      <div className="ob-welcome-sub">
        아이에게 꼭 맞는 레벨을 찾기 위해<br />
        간단한 설문과 테스트를 진행할게요
      </div>
      <div className="ob-welcome-tags">
        <span className="ob-tag">📋 부모 설문 5문항</span>
        <span className="ob-tag">🎮 아동 테스트 2종</span>
        <span className="ob-tag">⏱ 약 3분 소요</span>
      </div>
    </div>
  )
}

function AgeCard({ age, onChange }: { age: number; onChange: (v: number) => void }) {
  return (
    <div className="ob-q-wrap">
      <div className="ob-q-num">Q1</div>
      <div className="ob-q-text">아이의 연령이 어떻게 되나요?</div>
      <div className="ob-hint">만 나이를 선택해 주세요</div>
      <div className="age-counter">
        <button className="age-btn" onClick={() => onChange(Math.max(1, age - 1))}>−</button>
        <div className="age-display">{age > 0 ? `${age}세` : '–'}</div>
        <button className="age-btn" onClick={() => onChange(Math.min(15, age + 1))}>+</button>
      </div>
    </div>
  )
}

function ChoiceCard({ qNum, q, hint, cols, choices, value, onChange }: {
  qNum: string
  q: string
  hint: string
  cols: 2 | 3
  choices: { id: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="ob-q-wrap">
      <div className="ob-q-num">{qNum}</div>
      <div className="ob-q-text">{q}</div>
      <div className="ob-hint">{hint}</div>
      <div className={`ob-choices ob-choices--${cols}`}>
        {choices.map(c => (
          <button
            key={c.id}
            className={`ob-choice${value === c.id ? ' ob-choice--selected' : ''}`}
            onClick={() => onChange(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function SpeakingLevelCard({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const levels = [
    { id: 'babble',   emoji: '👶', label: '옹알이 수준',    desc: '의미 없는 소리·자음·모음 연습 단계예요' },
    { id: 'word',     emoji: '💬', label: '단어 수준',      desc: '단어로 의사를 표현하고 간단한 요구가 가능해요' },
    { id: 'sentence', emoji: '🗣️', label: '짧은 문장 수준', desc: '2–3어절 문장으로 말할 수 있어요' },
  ]
  return (
    <div className="ob-q-wrap">
      <div className="ob-q-num">Q5</div>
      <div className="ob-q-text">아이의 말하기 수준이 어느 정도인가요?</div>
      <div className="ob-hint">부모님이 관찰한 수준을 선택해 주세요</div>
      <div className="ob-levels">
        {levels.map(lv => (
          <button
            key={lv.id}
            className={`ob-level-btn${value === lv.id ? ' ob-level-btn--selected' : ''}`}
            onClick={() => onChange(lv.id)}
          >
            <span className="ob-level-emoji">{lv.emoji}</span>
            <div className="ob-level-text">
              <span className="ob-level-label">{lv.label}</span>
              <span className="ob-level-desc">{lv.desc}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

const LISTEN_CARDS = [
  { id: 'cat',  emoji: '🐱', label: '고양이' },
  { id: 'dog',  emoji: '🐶', label: '강아지' },
  { id: 'bear', emoji: '🐻', label: '곰' },
]

function ListenTestCard({ answer, setAnswer }: { answer: string | null; setAnswer: (v: string) => void }) {
  return (
    <div className="ob-test-wrap">
      <div className="ob-test-label">① 듣기 반응 테스트</div>
      <div className="ob-test-sub">강아지 소리가 들려요! 강아지 카드를 눌러봐요!</div>
      <div className="ob-audio-chip">🔊 강아지</div>
      <div className="ob-animal-cards">
        {LISTEN_CARDS.map(c => {
          const state = answer === c.id
            ? (c.id === LISTEN_ANSWER ? 'correct' : 'wrong')
            : ''
          return (
            <button
              key={c.id}
              className={`ob-animal-card${state ? ` ob-animal-card--${state}` : ''}`}
              onClick={() => setAnswer(c.id)}
            >
              <span className="ob-animal-emoji">{c.emoji}</span>
              <span className="ob-animal-label">{c.label}</span>
            </button>
          )
        })}
      </div>
      {answer === LISTEN_ANSWER && <div className="ob-feedback ob-feedback--good">잘했어요! 🎉</div>}
      {answer !== null && answer !== LISTEN_ANSWER && (
        <div className="ob-feedback ob-feedback--try">다시 눌러봐요!</div>
      )}
    </div>
  )
}

function SpeakTestCard({ phase, setPhase }: {
  phase: 'idle' | 'listening' | 'done'
  setPhase: (p: 'idle' | 'listening' | 'done') => void
}) {
  const handleMic = () => {
    if (phase !== 'idle') return
    setPhase('listening')
    setTimeout(() => setPhase('done'), 1800)
  }
  return (
    <div className="ob-test-wrap">
      <div className="ob-test-label">② 따라 말하기 테스트</div>
      <div className="ob-test-sub">이 단어를 따라 말해봐요!</div>
      <div className="ob-speak-word">바나나</div>
      <button
        className={`ob-mic-btn${phase === 'listening' ? ' ob-mic-btn--listening' : phase === 'done' ? ' ob-mic-btn--done' : ''}`}
        onClick={handleMic}
        disabled={phase !== 'idle'}
      >
        {phase === 'idle' && '🎤'}
        {phase === 'listening' && '🎙️'}
        {phase === 'done' && '✓'}
      </button>
      {phase === 'listening' && <div className="ob-listen-anim">인식 중...</div>}
      {phase === 'done' && <div className="ob-feedback ob-feedback--good">잘했어요! 🎉</div>}
    </div>
  )
}

function ResultCard({ level }: { level: Level }) {
  const info = LEVEL_INFO[level]
  const msgs: Record<Level, string> = {
    1: '짧고 간단한 소리부터 차근차근 시작해봐요!',
    2: '단어를 재미있게 배워볼게요!',
    3: '문장으로 신나게 말해봐요!',
  }
  return (
    <div className="ob-result">
      <div className="ob-result-badge" style={{ background: info.color }}>레벨 {level}</div>
      <div className="ob-result-speech">{info.speech}</div>
      <div className="ob-result-msg">{msgs[level]}</div>
      <div className="ob-result-table">
        {[
          ['단어 음절 수', info.syllables],
          ['내레이션 속도', info.speed],
          ['자동 클리어 기준', `${info.autoClear}%`],
        ].map(([k, v]) => (
          <div key={k} className="ob-result-row">
            <span className="ob-result-key">{k}</span>
            <span className="ob-result-val" style={{ color: info.color }}>{v}</span>
          </div>
        ))}
      </div>
      <div className="ob-result-note">
        보호자 설정에서 언제든 레벨을 변경할 수 있어요
      </div>
    </div>
  )
}
