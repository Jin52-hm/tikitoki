import { useState } from 'react'
import './ParentsScreen.css'
import homeBtn from '../assets/home-button.svg'
import { type Level, LEVEL_INFO } from './OnboardingScreen'

type Tab = 'level' | 'records' | 'guide' | 'settings'

type ParentsScreenProps = {
  onBack: () => void
  clearedStages: number[]
  stageScores: Record<number, number>
  level: Level
  onLevelChange: (l: Level) => void
  soundOn: boolean
  onSoundChange: (v: boolean) => void
  sfxOn: boolean
  onSfxChange: (v: boolean) => void
}

export default function ParentsScreen({
  onBack, clearedStages, stageScores, level, onLevelChange,
  soundOn, onSoundChange, sfxOn, onSfxChange,
}: ParentsScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>('records')

  const scores = Object.values(stageScores)
  const avgAccuracy = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0
  const completedStories = clearedStages.length >= 3 ? 1 : 0

  const tabs: { id: Tab; icon: string; label: string }[] = [
    { id: 'records',  icon: '📊', label: '활동 기록' },
    { id: 'level',    icon: '🎯', label: '레벨 설정' },
    { id: 'guide',    icon: '📘', label: '보호자 가이드' },
    { id: 'settings', icon: '⚙️', label: '환경 설정' },
  ]

  return (
    <div className="parents">
      <div className="parents-header">
        <button className="parents-back" onClick={onBack} aria-label="홈">
          <img src={homeBtn} alt="홈" />
        </button>
        <h1 className="parents-title">보호자 설정</h1>
      </div>

      <div className="parents-main">
        <nav className="parents-nav">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`pnav-btn ${activeTab === t.id ? 'pnav-btn--active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span className="pnav-icon">{t.icon}</span>
              <span className="pnav-label">{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="parents-content">
          {activeTab === 'level' && (
            <LevelTab level={level} onLevelChange={onLevelChange} />
          )}
          {activeTab === 'records' && (
            <RecordsTab
              clearedStages={clearedStages}
              stageScores={stageScores}
              completedStories={completedStories}
              avgAccuracy={avgAccuracy}
              level={level}
            />
          )}
          {activeTab === 'guide' && <GuideTab />}
          {activeTab === 'settings' && (
            <SettingsTab
              soundOn={soundOn}
              setSoundOn={onSoundChange}
              sfxOn={sfxOn}
              setSfxOn={onSfxChange}
            />
          )}
        </div>
      </div>
    </div>
  )
}

/* ---- 레벨 설정 ---- */
function LevelTab({ level, onLevelChange }: { level: Level; onLevelChange: (l: Level) => void }) {
  const info = LEVEL_INFO[level]
  return (
    <div className="tab-section">
      <div className="pcard">
        <div className="pcard-label">📊 배정된 레벨</div>
        <div className="current-level-row">
          <div className="current-level-badge" style={{ background: info.color }}>
            레벨 {level}
          </div>
          <div className="current-level-info">
            <div className="current-level-speech">{info.speech}</div>
            <div className="current-level-criteria">
              <span>📝 단어 음절 수 · {info.syllables}</span>
              <span>⚡ 내레이션 속도 · {info.speed}</span>
              <span>🎯 자동 클리어 기준 · {info.autoClear}%</span>
            </div>
          </div>
        </div>
        <div className="level-note">
          자동 클리어: 아이가 발화 시도를 못할 경우 기준 충족 시 자동으로 다음 단계로 넘어가요
        </div>
      </div>

      <div className="pcard">
        <div className="pcard-label">🔄 레벨 변경</div>
        <div className="pcard-desc">온보딩 결과와 다르다면 보호자가 직접 조정할 수 있어요.</div>
        <div className="level-select-cards">
          {([1, 2, 3] as Level[]).map(l => {
            const li = LEVEL_INFO[l]
            const isActive = level === l
            return (
              <button
                key={l}
                className={`level-select-card ${isActive ? 'level-select-card--active' : ''}`}
                style={isActive ? { borderColor: li.color, background: li.bg } : {}}
                onClick={() => onLevelChange(l)}
              >
                <div className="lsc-badge" style={{ background: li.color }}>레벨 {l}</div>
                <div className="lsc-speech">{li.speech}</div>
                <div className="lsc-details">
                  <span>{li.syllables}</span>
                  <span>{li.speed}</span>
                  <span>클리어 {li.autoClear}%</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ---- 활동 기록 ---- */
function RecordsTab({ clearedStages, stageScores, completedStories, avgAccuracy, level }: {
  clearedStages: number[]
  stageScores: Record<number, number>
  completedStories: number
  avgAccuracy: number
  level: Level
}) {
  const stats = [
    { icon: '📖', value: completedStories,           unit: '편',            label: '완료한 동화' },
    { icon: '🎙️', value: clearedStages.length > 0 ? avgAccuracy : null, unit: '%', label: '평균 말하기 정확도' },
  ]

  return (
    <div className="tab-section">
      <div className="records-stats">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">
              {s.value !== null ? s.value : '—'}
              {s.value !== null && <span className="stat-unit">{s.unit}</span>}
            </div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="pcard">
        <div className="pcard-label">🎯 현재 레벨 기준</div>
        <div className="level-criteria-row">
          <span className="lc-badge" style={{ background: LEVEL_INFO[level].color }}>레벨 {level}</span>
          <span className="lc-text">자동 클리어 기준 <strong>{LEVEL_INFO[level].autoClear}%</strong></span>
          <span className="lc-text">내레이션 속도 <strong>{LEVEL_INFO[level].speed}</strong></span>
        </div>
      </div>

      {clearedStages.length === 0 ? (
        <div className="empty-records">
          <div className="empty-icon">🌱</div>
          <div className="empty-text">아직 활동 기록이 없어요.<br />아이와 함께 시작해보세요!</div>
        </div>
      ) : (
        <div className="pcard">
          <div className="pcard-label">📋 최근 활동</div>
          <div className="activity-list">
            {clearedStages.map((stage) => {
              const names = ['따라 말하기', '단어 말하기', '문장 말하기', '전체 완료']
              const score = stageScores[stage]
              return (
                <div key={stage} className="activity-item">
                  <span className="activity-badge">✓</span>
                  <span className="activity-name">{names[stage - 1] ?? `활동 ${stage}`}</span>
                  {score !== undefined
                    ? <span className="activity-score">{score}점</span>
                    : <span className="activity-score activity-score--na">—</span>
                  }
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ---- 보호자 가이드 ---- */
function GuideTab() {
  const activities = [
    { icon: '🎮', title: '따라 말하기', desc: '보호자가 말하는 단어를 듣고 따라 말하며 말하기 자신감을 길러줘요.' },
    { icon: '🗣️', title: '단어 말하기', desc: '동화 속 상황에 알맞은 단어를 말해요. 상황에 맞는 표현을 익히며 발화 자신감을 키워줘요.' },
    { icon: '💬', title: '문장 말하기', desc: '동화 속 상황을 보고 알맞은 문장을 말해요. 맥락에 맞는 표현력과 자발적 발화를 길러줘요.' },
  ]

  const tips = [
    '조용한 환경에서 활동하면 음성 인식률이 높아져요.',
    '마이크에서 15~30cm 거리를 유지해 주세요.',
    '하루 10~15분 꾸준히 활동하면 효과적이에요.',
    '점수가 낮더라도 아이를 응원해 주세요!',
  ]

  return (
    <div className="tab-section">
      <div className="pcard">
        <div className="pcard-label">💡 사용 팁</div>
        <div className="tips-list">
          {tips.map((tip, i) => (
            <div key={i} className="tip-item">
              <span className="tip-num">{i + 1}</span>
              <span className="tip-text">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pcard">
        <div className="pcard-label">📚 활동 소개</div>
        <div className="guide-list">
          {activities.map(a => (
            <div key={a.title} className="guide-item">
              <span className="guide-icon">{a.icon}</span>
              <div className="guide-text">
                <div className="guide-title">{a.title}</div>
                <div className="guide-desc">{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---- 환경 설정 ---- */
function SettingsTab({
  soundOn, setSoundOn, sfxOn, setSfxOn,
}: {
  soundOn: boolean
  setSoundOn: (v: boolean) => void
  sfxOn: boolean
  setSfxOn: (v: boolean) => void
}) {
  const [resetConfirm, setResetConfirm] = useState(false)

  return (
    <div className="tab-section">
      <div className="pcard">
        <div className="pcard-label">🔊 소리 설정</div>
        <div className="setting-item">
          <span className="setting-text">배경음악</span>
          <button className={`toggle ${soundOn ? 'toggle--on' : ''}`} onClick={() => setSoundOn(!soundOn)}>
            <div className="toggle-knob" />
          </button>
        </div>
        <div className="setting-divider-h" />
        <div className="setting-item">
          <span className="setting-text">효과음</span>
          <button className={`toggle ${sfxOn ? 'toggle--on' : ''}`} onClick={() => setSfxOn(!sfxOn)}>
            <div className="toggle-knob" />
          </button>
        </div>
      </div>

      <div className="pcard">
        <div className="pcard-label">🔄 앱 초기화</div>
        <div className="reset-desc">모든 학습 기록과 카드 수집 내용이 초기화돼요.<br />신중하게 선택해 주세요.</div>
        {resetConfirm ? (
          <div className="reset-confirm-row">
            <span className="reset-confirm-text">정말 초기화할까요?</span>
            <button className="reset-btn reset-btn--confirm" onClick={() => setResetConfirm(false)}>네, 초기화</button>
            <button className="reset-btn reset-btn--cancel" onClick={() => setResetConfirm(false)}>취소</button>
          </div>
        ) : (
          <button className="reset-btn" onClick={() => setResetConfirm(true)}>초기화하기</button>
        )}
      </div>
    </div>
  )
}
