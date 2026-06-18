import './NextButton.css';
import nextArrow from '../assets/next-arrow.svg';

interface NextButtonProps {
  onClick: (e: React.MouseEvent) => void;
  label?: string;
  showArrow?: boolean;
}

export default function NextButton({ onClick, label = '다음', showArrow = true }: NextButtonProps) {
  return (
    <button className="next-btn" onClick={onClick}>
      <span className="next-btn-label">{label}</span>
      {showArrow && <img className="next-btn-arrow" src={nextArrow} alt="" />}
    </button>
  );
}
