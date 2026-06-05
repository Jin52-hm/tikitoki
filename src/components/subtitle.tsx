import './subtitle.css'

type SubtitleProps = {
  text: string
}

export default function Subtitle({ text }: SubtitleProps) {
  return (
    <div className="subtitle">
      <p>{text}</p>
    </div>
  )
}