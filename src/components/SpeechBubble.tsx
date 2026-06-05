import './SpeechBubble.css';

interface SpeechBubbleProps {
  text: string;
  bg?: string;
  textColor?: string;
  fontSize?: string;
  top?: string;
  left?: string;
  tailRotation?: number;
  tailBottom?: number;
  tailLeft?: number;
  tailRight?: number;
}

export default function SpeechBubble({
  text,
  bg = '#FAFAFA',
  textColor = '#111111',
  fontSize = '28px',
  top = '20%',
  left = '45%',
  tailRotation = -160.684,
  tailBottom = -38,
  tailLeft,
  tailRight,
}: SpeechBubbleProps) {

  const tailPositionStyle: React.CSSProperties =
    tailRight !== undefined
      ? { right: tailRight }
      : { left: tailLeft ?? 20 };

  return (
    <div style={{ position: 'absolute', top, left, filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.18))' }}>
      <div
        className="speech-bubble"
        style={{ background: bg, color: textColor, fontSize }}
      >
        {text}
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 61 51"
          fill="none"
          style={{
            position: 'absolute',
            width: 55.533,
            height: 53.925,
            transform: `rotate(${tailRotation}deg)`,
            bottom: tailBottom,
            ...tailPositionStyle,
          }}
        >
          <path
            d="M17.8167 0.0428542L1.56711e-05 50.8728C25.8662 50.9553 73.6525 49.2615 57.8678 41.8262C38.137 32.5321 18.3116 -1.36909 17.8167 0.0428542Z"
            fill={bg}
          />
        </svg>
      </div>
    </div>
  );
}
