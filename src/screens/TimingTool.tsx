import React, { useState, useRef, useEffect, useCallback } from 'react'
import './TimingTool.css'

const STORY_COUNT = 10

interface Mark {
  time: number
  text: string
}

export default function TimingTool({ onClose }: { onClose: () => void }) {
  const [storyIdx, setStoryIdx] = useState(0)
  const [marks, setMarks] = useState<Mark[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [copied, setCopied] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const videoSrc = `/assets/videos/story${storyIdx + 1}.mp4`

  const handleMark = useCallback(() => {
    const t = videoRef.current?.currentTime ?? 0
    setMarks(prev => [...prev, { time: parseFloat(t.toFixed(2)), text: '' }])
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === 'm' || e.key === 'M') handleMark()
      if (e.key === 'Escape') onClose()
      if (e.key === ' ') {
        e.preventDefault()
        const v = videoRef.current
        if (!v) return
        v.paused ? v.play() : v.pause()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleMark, onClose])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const update = () => setCurrentTime(video.currentTime)
    video.addEventListener('timeupdate', update)
    return () => video.removeEventListener('timeupdate', update)
  }, [storyIdx])

  useEffect(() => {
    setMarks([])
    setCurrentTime(0)
  }, [storyIdx])

  const updateText = (i: number, text: string) =>
    setMarks(prev => prev.map((m, idx) => (idx === i ? { ...m, text } : m)))

  const removeMark = (i: number) =>
    setMarks(prev => prev.filter((_, idx) => idx !== i))

  const generateCode = () => {
    const lines = marks
      .map(m => `      { time: ${m.time}, text: '${m.text}' },`)
      .join('\n')
    return `    subtitles: [\n${lines}\n    ],`
  }

  const copyCode = () => {
    navigator.clipboard.writeText(generateCode()).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="tt-overlay">
      <div className="tt-panel">
        <div className="tt-header">
          <span className="tt-title">타이밍 캘리브레이션</span>
          <div className="tt-story-tabs">
            {Array.from({ length: STORY_COUNT }, (_, i) => (
              <button
                key={i}
                className={`tt-tab ${i === storyIdx ? 'active' : ''}`}
                onClick={() => setStoryIdx(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button className="tt-close" onClick={onClose}>✕</button>
        </div>

        <div className="tt-body">
          <div className="tt-video-wrap">
            <video
              ref={videoRef}
              key={videoSrc}
              src={videoSrc}
              className="tt-video"
              controls
              playsInline
            />
            <div className="tt-time-display">{currentTime.toFixed(2)}s</div>
            <button className="tt-mark-btn" onClick={handleMark}>
              Mark (M)
            </button>
          </div>

          <div className="tt-marks">
            <div className="tt-marks-header">
              <span>찍힌 타임스탬프 ({marks.length}개)</span>
              <button className="tt-clear-btn" onClick={() => setMarks([])}>전체 지우기</button>
            </div>
            <div className="tt-marks-list">
              {marks.length === 0 && (
                <p className="tt-empty">영상 재생 중 M키 또는 Mark 버튼으로 타임스탬프를 찍으세요</p>
              )}
              {marks.map((m, i) => (
                <div key={i} className="tt-mark-row">
                  <span className="tt-mark-time">{m.time}s</span>
                  <input
                    className="tt-mark-input"
                    placeholder="자막 텍스트 입력..."
                    value={m.text}
                    onChange={e => updateText(i, e.target.value)}
                  />
                  <button className="tt-mark-remove" onClick={() => removeMark(i)}>✕</button>
                </div>
              ))}
            </div>
            {marks.length > 0 && (
              <div className="tt-code-wrap">
                <pre className="tt-code">{generateCode()}</pre>
                <button className="tt-copy-btn" onClick={copyCode}>
                  {copied ? '복사됨 ✓' : '코드 복사'}
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="tt-hint">Space: 재생/정지 &nbsp;|&nbsp; M: 타임스탬프 찍기 &nbsp;|&nbsp; ESC: 닫기</p>
      </div>
    </div>
  )
}
