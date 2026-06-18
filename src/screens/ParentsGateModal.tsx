import { useState } from 'react'
import './ParentsGateModal.css'

type Props = {
  onConfirm: () => void
  onClose: () => void
}

function makeProblem(easy = false) {
  const a = Math.floor(Math.random() * (easy ? 3 : 4))
  const b = Math.floor(Math.random() * (easy ? 5 : 10))
  return { a, b, answer: a + b }
}

function makeChoices(answer: number): number[] {
  const set = new Set<number>([answer])
  const offsets = [-3, -2, -1, 1, 2, 3].sort(() => Math.random() - 0.5)
  for (const d of offsets) {
    if (set.size >= 4) break
    const c = answer + d
    if (c >= 0) set.add(c)
  }
  let extra = 0
  while (set.size < 4) {
    if (!set.has(extra)) set.add(extra)
    extra++
  }
  return [...set].sort(() => Math.random() - 0.5)
}

function makeState(easy = false) {
  const problem = makeProblem(easy)
  return { problem, choices: makeChoices(problem.answer) }
}

export default function ParentsGateModal({ onConfirm, onClose }: Props) {
  const [{ problem, choices }, setState] = useState(() => makeState(false))
  const [error, setError] = useState(false)
  const [failCount, setFailCount] = useState(0)

  const select = (choice: number) => {
    if (choice === problem.answer) {
      onConfirm()
    } else {
      const next = failCount + 1
      setError(true)
      if (next >= 3) {
        setState(makeState(true))
        setFailCount(0)
      } else {
        setFailCount(next)
      }
    }
  }

  return (
    <div className="gate-overlay" onClick={onClose}>
      <div className="gate-card" onClick={e => e.stopPropagation()}>
        <button className="gate-close" onClick={onClose}>✕</button>
        <div className="gate-icon">🔒</div>
        <h2 className="gate-title">보호자 확인</h2>
        <p className="gate-desc">덧셈의 답을 골라 주세요</p>

        <div className="gate-problem">
          <span>{problem.a}</span>
          <span className="gate-op">+</span>
          <span>{problem.b}</span>
          <span className="gate-eq">=</span>
          <span className="gate-q">?</span>
        </div>

        <p className={`gate-error ${error ? '' : 'gate-error--hidden'}`}>
          ⚠️ 다시 시도해 주세요!
        </p>

        <div className="gate-choices">
          {choices.map((c, i) => (
            <button
              key={`${c}-${i}`}
              className="gate-choice"
              onClick={() => select(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
