import { useState, useEffect, useRef, type ReactElement } from 'react'
import './App.css'
import homeBgm from './assets/sound/home-bgm.mp3'
import sTouch from './assets/sound/s-touch.mp3'
import SplashScreen from './screens/SplashScreen'
import HomeScreen from './screens/HomeScreen'
import StoryScreen from './screens/StoryScreen'
import WordGameScreen from './screens/WordGameScreen'
import ActivityTeachScreen from './screens/ActivityTeachScreen'
import ActivityListenScreen from './screens/ActivityListenScreen'
import ClearScreen from './screens/ClearScreen'
import CardRewardScreen from './screens/CardRewardScreen'
import CardCollectionScreen from './screens/CardCollectionScreen'
import ParentsScreen from './screens/ParentsScreen'
import ParentsGateModal from './screens/ParentsGateModal'
import OnboardingScreen, { type Level } from './screens/OnboardingScreen'
import WarnBookScreen from './screens/WarnBookScreen'
import WordSayScreen from './screens/WordSayScreen'
import SentenceSayScreen from './screens/SentenceSayScreen'
import TimingTool from './screens/TimingTool'
import warnBook2 from './assets/warn-book-2.png'
import warnBook3 from './assets/warn-book-3.png'

type Screen = 'splash' | 'onboarding' | 'home' | 'story' | 'word-game' | 'word-say' | 'sentence-say' | 'activity-teach' | 'activity-listen' | 'clear' | 'card-reward' | 'card-collection' | 'warn-book-2' | 'warn-book-3' | 'parents'

const DESIGN_W = 1194
const DESIGN_H = 834

function App() {
  const [screen, setScreen] = useState<Screen>('splash')
  const [storyResumeIndex, setStoryResumeIndex] = useState(0)
  const [level, setLevel] = useState<Level>(1)
  const [clearedStages, setClearedStages] = useState<number[]>([])
  const [stageScores, setStageScores] = useState<Record<number, number>>({})
  const [unlockedCards, setUnlockedCards] = useState<number[]>([])
  const [scale, setScale] = useState(1)
  const [showParentsGate, setShowParentsGate] = useState(false)
  const [showTimingTool, setShowTimingTool] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const [sfxOn, setSfxOn] = useState(true)
  const bgmRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const bgm = new Audio(homeBgm)
    bgm.loop = true
    bgm.volume = 0.4
    bgmRef.current = bgm
    return () => { bgm.pause() }
  }, [])

  useEffect(() => {
    const audio = bgmRef.current
    if (!audio) return
    if (!soundOn || screen === 'story') {
      audio.pause()
    } else {
      audio.play().catch(() => {})
    }
  }, [screen, soundOn])

  const handlePointerDown = () => {
    if (!sfxOn) return
    const audio = new Audio(sTouch)
    audio.volume = 0.7
    audio.play().catch(() => {})
  }

  const clearStage = (stage: number, score?: number) => {
    setClearedStages(prev => prev.includes(stage) ? prev : [...prev, stage])
    if (score !== undefined) setStageScores(prev => ({ ...prev, [stage]: score }))
  }

  const unlockCard = (index: number) =>
    setUnlockedCards(prev => prev.includes(index) ? prev : [...prev, index])

  useEffect(() => {
    const updateScale = () => {
      setScale(Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H))
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') setShowTimingTool(v => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const goHome = () => {
    setStoryResumeIndex(0)
    setScreen('home')
  }

  const screens: Record<Screen, ReactElement> = {
    'splash': <SplashScreen onNext={() => setScreen('onboarding')} />,
    'onboarding': <OnboardingScreen onComplete={(l) => { setLevel(l); setScreen('home') }} />,
    'home': <HomeScreen
      onSelect={(i) => {
        if (i === 0) setScreen('story')
        else if (i === 1) setScreen('warn-book-2')
        else if (i === 2) setScreen('warn-book-3')
      }}
      onCards={() => setScreen('card-collection')}
      onParents={() => setShowParentsGate(true)}
    />,
    'parents': <ParentsScreen
      onBack={() => setScreen('home')}
      clearedStages={clearedStages}
      stageScores={stageScores}
      level={level}
      onLevelChange={setLevel}
      soundOn={soundOn}
      onSoundChange={setSoundOn}
      sfxOn={sfxOn}
      onSfxChange={setSfxOn}
    />,
    'warn-book-2': <WarnBookScreen bookImage={warnBook2} onHome={() => setScreen('home')} />,
    'warn-book-3': <WarnBookScreen bookImage={warnBook3} onHome={() => setScreen('home')} />,
    'story': (
      <StoryScreen
        onHome={goHome}
        onNext={() => { unlockCard(0); setScreen('card-reward'); }}
        onMiniGame={() => { setStoryResumeIndex(2); setScreen('word-game'); }}
        onWordSay={() => { setStoryResumeIndex(6); setScreen('word-say'); }}
        onSentenceSay={() => { setStoryResumeIndex(9); setScreen('sentence-say'); }}
        startIndex={storyResumeIndex}
        clearedStages={clearedStages}
      />
    ),
    'word-game': <WordGameScreen onHome={goHome} onNext={() => setScreen('story')} onClear={() => clearStage(1)} />,
    'word-say': <WordSayScreen onHome={goHome} onNext={() => setScreen('story')} onClear={(score) => clearStage(2, score)} />,
    'sentence-say': <SentenceSayScreen onHome={goHome} onNext={() => setScreen('story')} onClear={(score) => clearStage(3, score)} />,
    'activity-teach': <ActivityTeachScreen onHome={goHome} onNext={() => setScreen('activity-listen')} />,
    'activity-listen': <ActivityListenScreen onHome={goHome} onNext={() => setScreen('clear')} />,
    'clear': <ClearScreen onHome={goHome} onNext={() => setScreen('card-reward')} />,
    'card-reward': <CardRewardScreen onHome={goHome} onNext={goHome} />,
    'card-collection': <CardCollectionScreen onBack={goHome} unlockedCards={unlockedCards} />,
  }

  return (
    <div
      className="app-container"
      style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
      onPointerDown={handlePointerDown}
    >
      {screens[screen]}
      {showTimingTool && <TimingTool onClose={() => setShowTimingTool(false)} />}
      {showParentsGate && (
        <ParentsGateModal
          onConfirm={() => { setShowParentsGate(false); setScreen('parents') }}
          onClose={() => setShowParentsGate(false)}
        />
      )}
    </div>
  )
}

export default App
