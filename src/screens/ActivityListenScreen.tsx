import { useState, useEffect, useRef } from 'react'
import './ActivityListenScreen.css'
import NB from '../components/NB'
import nextArrow from '../assets/next-arrow.svg'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySpeechRecognition = any

type Phase = 'teach' | 'listen' | 'success' | 'fail' | 'pass'
type FeedbackType = 'perfect' | 'excellent' | 'good' | 'pass'

const ANSWER_LIST = ['사과']

const normalize = (s: string) => s.replace(/\s+/g, '').replace(/[.,!?~]/g, '')

const isCorrect = (said: string) => {
  const n = normalize(said)
  return ANSWER_LIST.some(a => n.includes(normalize(a)))
}

const FEEDBACK: Record<FeedbackType, { subtitle: string; main: string; stars: string }> = {
  perfect:   { subtitle: '따라 말하기 성공!', main: '참 잘했어요!',     stars: '⭐⭐⭐️' },
  excellent: { subtitle: '따라 말하기 성공!', main: '잘했어요!',        stars: '⭐⭐️'   },
  good:      { subtitle: '따라 말하기 성공!', main: '끝까지 해냈어요!',  stars: '⭐️'    },
  pass:      { subtitle: '괜찮아요!',         main: '다음으로 넘어가요', stars: ''       },
}

export default function ActivityListenScreen({ onHome, onNext }: { onHome: () => void; onNext: () => void }) {
  const [phase, setPhase] = useState<Phase>('teach')
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('perfect')
  const [stageCleared, setStageCleared] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [failCount, setFailCount] = useState(0)
  const failCountRef = useRef(0)
  const [volume, setVolume] = useState(0)
  const recognitionRef = useRef<AnySpeechRecognition>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const volumeRafRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const incrementFail = () => {
    failCountRef.current += 1
    setFailCount(failCountRef.current)
  }

  const resolveSuccess = () => {
    const attempts = failCountRef.current
    const type: FeedbackType = attempts === 0 ? 'perfect' : attempts === 1 ? 'excellent' : 'good'
    setFeedbackType(type)
    failCountRef.current = 0
    setFailCount(0)
  }

  const startVolumeDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const audioCtx = new AudioContext()
      audioContextRef.current = audioCtx
      const analyser = audioCtx.createAnalyser()
      analyserRef.current = analyser
      analyser.fftSize = 256
      const source = audioCtx.createMediaStreamSource(stream)
      source.connect(analyser)
      const data = new Uint8Array(analyser.frequencyBinCount)
      const loop = () => {
        analyser.getByteFrequencyData(data)
        const avg = data.reduce((a, b) => a + b, 0) / data.length
        setVolume(Math.min(avg / 60, 1))
        volumeRafRef.current = requestAnimationFrame(loop)
      }
      loop()
    } catch {
      // 마이크 권한 없으면 무시
    }
  }

  const stopVolumeDetection = () => {
    if (volumeRafRef.current) cancelAnimationFrame(volumeRafRef.current)
    audioContextRef.current?.close()
    streamRef.current?.getTracks().forEach(t => t.stop())
    setVolume(0)
  }

  const stopRecognition = () => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    stopVolumeDetection()
  }

  const startListening = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      resolveSuccess()
      setStageCleared(true)
      setTimeout(() => setPhase('success'), 1000)
      return
    }

    startVolumeDetection()

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.lang = 'ko-KR'
    recognition.continuous = false
    recognition.interimResults = true

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = Array.from(e.results).map((r: any) => r[0].transcript).join('')
      setTranscript(result)

      if (e.results[e.results.length - 1].isFinal) {
        const said = result.trim()
        stopVolumeDetection()
        if (isCorrect(said)) {
          resolveSuccess()
          setStageCleared(true)
          setTimeout(() => setPhase('success'), 800)
        } else {
          incrementFail()
          setPhase('fail')
        }
        recognitionRef.current = null
      }
    }

    recognition.onerror = () => {
      stopVolumeDetection()
      incrementFail()
      setPhase('fail')
      recognitionRef.current = null
    }

    recognition.onend = () => {
      if (recognitionRef.current) {
        stopVolumeDetection()
        incrementFail()
        setPhase('fail')
        recognitionRef.current = null
      }
    }

    recognition.start()
  }

  useEffect(() => {
    if (phase === 'listen') {
      setTranscript('')
      startListening()
    }
    return () => {
      if (phase === 'listen') stopRecognition()
    }
  }, [phase])

  const handleClick = () => {
    if (phase === 'teach') setPhase('listen')
    else if (phase === 'fail') setPhase('listen')
    else if (phase === 'success' || phase === 'pass') onNext()
  }

  const handlePass = (e: React.MouseEvent) => {
    e.stopPropagation()
    stopRecognition()
    setFeedbackType('pass')
    setStageCleared(true)
    setPhase('pass')
  }

  const appleScale = phase === 'listen' ? 1 + volume * 0.06 : 1
  const isCleared = phase === 'success' || phase === 'pass'
  const fb = FEEDBACK[feedbackType]

  return (
    <div className="activity-listen" onClick={handleClick}>
      <img className="listen-bg" src="/assets/forest-bg.png" alt="" />

      {isCleared && <div className="listen-success-overlay" />}

      <NB
        onHome={() => { stopRecognition(); onHome() }}
        activeStage={3}
        clearedStages={stageCleared ? [1, 2, 3] : [1, 2]}
      />

      {!isCleared && (
        <div className={`listen-prompt-bar ${phase === 'fail' ? 'fail' : ''}`}>
          <p>
            {phase === 'listen'
              ? '듣고 있어요'
              : phase === 'fail'
              ? (transcript ? `"${transcript}" — 다시 해볼까요? 🙂` : '잘 못 들었어요. 다시 해볼까요? 🙂')
              : '사과라고 따라 말해봐요!'}
          </p>
          {phase === 'fail' && (
            <p className="listen-fail-hint">
              {!transcript ? '더 크게 말해볼까요? 🎤' : '"사과"라고 말해봐요!'}
            </p>
          )}
        </div>
      )}

      <img
        className="listen-item"
        src="/assets/apple.png"
        alt="사과"
        style={{ transform: phase === 'listen' ? `scale(${appleScale})` : 'none' }}
      />

      <div className="listen-word-pill">
        <span className="listen-word-big">사</span>
        <span className="listen-word-small">과</span>
      </div>

      {phase === 'teach' && (
        <p className="listen-tap-hint">화면을 눌러 말해봐요</p>
      )}

      {phase === 'fail' && (
        <p className="listen-tap-hint">화면을 눌러 다시 말해요</p>
      )}

      {phase === 'fail' && failCount >= 3 && (
        <button className="listen-pass-btn" onClick={handlePass}>
          <span className="listen-pass-btn-label">넘어가기</span>
          <img className="listen-pass-btn-arrow" src={nextArrow} alt="" />
        </button>
      )}

      {isCleared && (
        <div className={`listen-feedback-card ${feedbackType === 'pass' ? 'listen-feedback-card--pass' : ''}`}>
          <p className="listen-feedback-subtitle">{fb.subtitle}</p>
          <p className="listen-feedback-main">{fb.main}</p>
          {fb.stars && <p className="listen-feedback-stars">{fb.stars}</p>}
        </div>
      )}
    </div>
  )
}
