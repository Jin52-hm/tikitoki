import { useEffect } from 'react'
import './SplashScreen.css'
import logo from '../assets/tikitoki-logo.svg'

export default function SplashScreen({ onNext }: { onNext: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onNext, 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="splash" onClick={onNext}>
      <img src={logo} className="splash-logo" alt="티키토키" />
    </div>
  )
}