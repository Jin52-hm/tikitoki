import { useState, useEffect, type ReactElement } from 'react'
import './App.css'
import SplashScreen from './screens/SplashScreen'
import HomeScreen from './screens/HomeScreen'
import StoryScreen from './screens/StoryScreen'
import WordGameScreen from './screens/WordGameScreen'
import ActivityTeachScreen from './screens/ActivityTeachScreen'
import ActivityListenScreen from './screens/ActivityListenScreen'
import ClearScreen from './screens/ClearScreen'
import CardRewardScreen from './screens/CardRewardScreen'
import CardCollectionScreen from './screens/CardCollectionScreen'
import WarnBookScreen from './screens/WarnBookScreen'
import warnBook2 from './assets/warn-book-2.png'
import warnBook3 from './assets/warn-book-3.png'

type Screen = 'splash' | 'home' | 'story' | 'word-game' | 'activity-teach' | 'activity-listen' | 'clear' | 'card-reward' | 'card-collection' | 'warn-book-2' | 'warn-book-3'

const DESIGN_W = 1194
const DESIGN_H = 834

function App() {
  const [screen, setScreen] = useState<Screen>('splash')
  const [storyResumeIndex, setStoryResumeIndex] = useState(0)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const updateScale = () => {
      setScale(Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H))
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  const goHome = () => {
    setStoryResumeIndex(0)
    setScreen('home')
  }

  const screens: Record<Screen, ReactElement> = {
    'splash': <SplashScreen onNext={() => setScreen('home')} />,
    'home': <HomeScreen
      onSelect={(i) => {
        if (i === 0) setScreen('story')
        else if (i === 1) setScreen('warn-book-2')
        else if (i === 2) setScreen('warn-book-3')
      }}
      onCards={() => setScreen('card-collection')}
    />,
    'warn-book-2': <WarnBookScreen bookImage={warnBook2} onHome={() => setScreen('home')} />,
    'warn-book-3': <WarnBookScreen bookImage={warnBook3} onHome={() => setScreen('home')} />,
    'story': (
      <StoryScreen
        onHome={goHome}
        onNext={() => setScreen('activity-teach')}
        onMiniGame={() => { setStoryResumeIndex(2); setScreen('word-game'); }}
        startIndex={storyResumeIndex}
      />
    ),
    'word-game': <WordGameScreen onHome={goHome} onNext={() => setScreen('story')} />,
    'activity-teach': <ActivityTeachScreen onHome={goHome} onNext={() => setScreen('activity-listen')} />,
    'activity-listen': <ActivityListenScreen onHome={goHome} onNext={() => setScreen('clear')} />,
    'clear': <ClearScreen onHome={goHome} onNext={() => setScreen('card-reward')} />,
    'card-reward': <CardRewardScreen onHome={goHome} onNext={() => setScreen('card-collection')} />,
    'card-collection': <CardCollectionScreen onBack={goHome} />,
  }

  return (
    <div
      className="app-container"
      style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
    >
      {screens[screen]}
    </div>
  )
}

export default App
