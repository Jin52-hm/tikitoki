import { useEffect } from 'react'
import './SplashScreen.css'
import logo from '../assets/tikitoki-logo.svg'
import emo1 from '../assets/emo1.svg'
import emo2 from '../assets/emo2.svg'
import touchSfx from '../assets/sound/s-touch.mp3'

export default function SplashScreen({ onNext }: { onNext: () => void }) {
  useEffect(() => {
    const playTouch = () => new Audio(touchSfx).play().catch(() => {})

    const t1 = setTimeout(playTouch, 400)
    const t2 = setTimeout(playTouch, 750)
    const t3 = setTimeout(onNext, 3000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div className="splash" onClick={onNext}>
      <div className="splash-logo-wrapper">
        <img src={logo} className="splash-logo" alt="티키토키" />
        <img src={emo1} className="splash-emo1" alt="" />
        <img src={emo2} className="splash-emo2" alt="" />
      </div>
    </div>
  )
}