import './CardCollectionScreen.css'
import homeBtn from '../assets/home-button.svg'

export default function CardCollectionScreen({ onBack }: { onBack: () => void }) {
  const cards = [
    { title: '루비의 하루', unlocked: true },
    { title: '사과를 찾아서', unlocked: false },
    { title: '숲속의 친구들', unlocked: false },
    { title: '달빛 이야기', unlocked: false },
    { title: '작은 영웅', unlocked: false },
    { title: '꿈꾸는 여우', unlocked: false },
  ]

  return (
    <div className="card-collection">
         <button className="cc-exit" onClick={onBack} aria-label="홈">
       <img src={homeBtn} alt="홈" />
      </button>
      <h1 className="cc-title">동화 카드</h1>
      <div className="cc-count">1/6</div>
      <div className="cc-grid">
        {cards.map((card, i) => (
          <div key={i} className={`cc-card ${card.unlocked ? 'unlocked' : 'locked'}`}>
            {card.unlocked ? (
              <p>{card.title}</p>
            ) : (
              <p className="cc-locked-text">동화 제목</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
