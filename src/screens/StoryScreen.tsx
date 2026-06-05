import React, { useState, useRef, useEffect, useCallback } from 'react';
import './StoryScreen.css';
import NB from '../components/NB';
import Subtitle from '../components/subtitle';
import SpeechBubble from '../components/SpeechBubble';
import NextButton from '../components/NextButton';

type Bubble = {
  time: number;
  duration: number;
  text: string;
  top?: string;
  left?: string;
  tailRotation?: number;
  tailBottom?: number;
  tailLeft?: number;
  tailRight?: number;
};

const stories = [
  {
    video: '/assets/videos/story1.mp4',
    subtitles: [
      { time: 0, text: '학교가 끝나고 루비는 걷기 시작했어요.' },
      { time: 3, text: '오늘따라 하늘이 유독 파랗게 느껴졌어요.' },
      { time: 6, text: '루비는 발걸음을 멈추고 하늘을 올려다봤어요.' },
    ],
    bubbles: [
      {
        time: 2, duration: 3,
        text: '아.. 심심해.\n뭐 재미있는 일 없을까?',
        top: '25%', left: '52%',
        tailRotation: -150,
        tailBottom: -25,
        tailLeft: 20,
      },
    ] as Bubble[],
  },
  {
    video: '/assets/videos/story2.mp4',
    subtitles: [
      { time: 0, text: '공원 벤치에 친구 민지가 앉아 있었어요.' },
      { time: 3, text: '민지는 루비를 보자마자 손을 흔들었어요.' },
    ],
    bubbles: [
      {
        time: 3, duration: 3,
        text: '루비야~! 여기야!',
        top: '25%', left: '10%',
        tailRotation: -20,
        tailBottom: -35,
        tailRight: 20,
      },
    ] as Bubble[],
  },
  {
    video: '/assets/videos/story3.mp4',
    subtitles: [
      { time: 0, text: '두 아이는 신나게 그네를 타기 시작했어요.' },
      { time: 4, text: '웃음소리가 공원 가득 퍼져 나갔어요.' },
    ],
    bubbles: [
      {
        time: 1, duration: 3,
        text: '더 높이! 더 높이!',
        top: '20%', left: '10%',
        tailRotation: -160,
        tailBottom: -35,
        tailLeft: 20,
      },
      {
        time: 4, duration: 3,
        text: '하하하!',
        top: '20%', left: '55%',
        tailRotation: -20,
        tailBottom: -35,
        tailRight: 20,
      },
    ] as Bubble[],
  },
  {
    video: '/assets/videos/story4.mp4',
    subtitles: [
      { time: 0, text: '해가 지기 시작하자 민지가 말했어요.' },
      { time: 3, text: '"나 이제 집에 가야 해. 잘 가, 루비야!"' },
    ],
    bubbles: [
      {
        time: 3, duration: 4,
        text: '나 이제 집에 가야 해.\n잘 가, 루비야!',
        top: '25%', left: '10%',
        tailRotation: -20,
        tailBottom: -35,
        tailRight: 20,
      },
    ] as Bubble[],
  },
  {
    video: '/assets/videos/story5.mp4',
    subtitles: [
      { time: 0, text: '루비는 혼자 남아 하늘을 바라보았어요.' },
      { time: 3, text: '노을빛이 온 하늘을 물들이고 있었어요.' },
      { time: 6, text: '루비는 아름답다고 생각했어요.' },
    ],
    bubbles: [
      {
        time: 6, duration: 4,
        text: '와.. 정말 예쁘다.',
        top: '25%', left: '52%',
        tailRotation: -160,
        tailBottom: -35,
        tailLeft: 20,
      },
    ] as Bubble[],
  },
  {
    video: '/assets/videos/story6.mp4',
    subtitles: [
      { time: 0, text: '그때 루비의 가방에서 작은 소리가 들렸어요.' },
      { time: 3, text: '삐빅— 휴대폰 알림 소리였어요.' },
      { time: 5, text: '"루비야, 밥 먹으러 와!" 엄마의 문자였어요.' },
    ],
    bubbles: [] as Bubble[],
  },
  {
    video: '/assets/videos/story7.mp4',
    subtitles: [
      { time: 0, text: '루비는 서둘러 집으로 달려갔어요.' },
      { time: 3, text: '바람이 루비의 머리카락을 간질였어요.' },
    ],
    bubbles: [
      {
        time: 1, duration: 3,
        text: '빨리 가야지!',
        top: '25%', left: '52%',
        tailRotation: -160,
        tailBottom: -35,
        tailLeft: 20,
      },
    ] as Bubble[],
  },
  {
    video: '/assets/videos/story8.mp4',
    subtitles: [
      { time: 0, text: '현관문을 열자 엄마가 반갑게 맞아주었어요.' },
      { time: 3, text: '"우리 루비 왔네~ 오늘 재미있었어?"' },
    ],
    bubbles: [
      {
        time: 3, duration: 4,
        text: '우리 루비 왔네~\n오늘 재미있었어?',
        top: '25%', left: '10%',
        tailRotation: -20,
        tailBottom: -35,
        tailRight: 20,
      },
    ] as Bubble[],
  },
  {
    video: '/assets/videos/story9.mp4',
    subtitles: [
      { time: 0, text: '루비는 엄마 품에 안겨 오늘 하루를 이야기했어요.' },
      { time: 4, text: '엄마는 루비의 이야기를 들으며 미소 지었어요.' },
      { time: 7, text: '오늘도 행복한 하루였어요.' },
    ],
    bubbles: [
      {
        time: 1, duration: 5,
        text: '엄마! 오늘 민지랑\n그네 탔어!',
        top: '25%', left: '52%',
        tailRotation: -160,
        tailBottom: -35,
        tailLeft: 20,
      },
    ] as Bubble[],
  },
];

export default function StoryScreen({
  onHome,
  onNext,
  onMiniGame,
  startIndex = 0,
}: {
  onHome: () => void;
  onNext: () => void;
  onMiniGame?: () => void;
  startIndex?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [currentBubble, setCurrentBubble] = useState<Bubble | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [rewindKey, setRewindKey] = useState(0);
  const [forwardKey, setForwardKey] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const autoHideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = stories[currentIndex];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const t = video.currentTime;

      let matchedSub = '';
      for (const sub of current.subtitles) {
        if (t >= sub.time) matchedSub = sub.text;
      }
      setCurrentSubtitle(matchedSub);

      let matchedBubble: Bubble | null = null;
      for (const bubble of current.bubbles) {
        if (t >= bubble.time && t < bubble.time + bubble.duration) {
          matchedBubble = bubble;
        }
      }
      setCurrentBubble(matchedBubble);
    };

    const handleEnded = () => setVideoEnded(true);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentIndex]);

  useEffect(() => {
    setCurrentSubtitle(current.subtitles[0]?.text ?? '');
    setCurrentBubble(null);
    setIsPaused(false);
    setShowControls(false);
    setVideoEnded(false);
    videoRef.current?.play();
  }, [currentIndex]);

  const hideControls = useCallback(() => {
    if (autoHideRef.current) clearTimeout(autoHideRef.current);
    setShowControls(false);
    setRewindKey(0);
    setForwardKey(0);
  }, []);

  const handleScreenClick = () => {
    if (showControls) {
      hideControls();
      return;
    }
    setShowControls(true);
    if (!isPaused) {
      autoHideRef.current = setTimeout(hideControls, 3000);
    }
  };

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (isPaused) {
      video.play();
      setIsPaused(false);
      hideControls();
    } else {
      video.pause();
      setIsPaused(true);
    }
  };

  const handleRewind = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime - 5);
    if (!isPaused) video.play();
    setRewindKey(k => k + 1);
    if (!isPaused) {
      if (autoHideRef.current) clearTimeout(autoHideRef.current);
      autoHideRef.current = setTimeout(hideControls, 3000);
    }
  };

  const handleForward = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
    if (!isPaused) video.play();
    setForwardKey(k => k + 1);
    if (!isPaused) {
      if (autoHideRef.current) clearTimeout(autoHideRef.current);
      autoHideRef.current = setTimeout(hideControls, 3000);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex === 1 && onMiniGame) {
      onMiniGame();
    } else if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onNext();
    }
  };

  return (
    <div className="story" onClick={handleScreenClick}>
      <video
        ref={videoRef}
        className="story-bg"
        src={current.video}
        autoPlay
        playsInline
        key={current.video}
      />

      {showControls && (
        <div className="story-controls-overlay">
          <button className="story-ctrl-btn story-ctrl-seek" onClick={handleRewind} aria-label="5초 뒤로">
            {rewindKey > 0 && <span key={rewindKey} className="story-seek-feedback">-5초</span>}
            <img src="/assets/ctrl-rewind.svg" alt="5초 뒤로" />
          </button>
          <button className="story-ctrl-btn story-ctrl-play" onClick={handlePlayPause} aria-label={isPaused ? '재생' : '일시정지'}>
            {isPaused ? (
              <svg width="90" height="125" viewBox="0 0 90 125" fill="none">
                <path d="M6 6L84 62.5L6 119V6Z" fill="white" style={{filter:'drop-shadow(0 0 12px rgba(0,0,0,0.4))'}}/>
              </svg>
            ) : (
              <div className="story-ctrl-pause-icon">
                <span /><span />
              </div>
            )}
          </button>
          <button className="story-ctrl-btn story-ctrl-seek story-ctrl-forward" onClick={handleForward} aria-label="5초 앞으로">
            {forwardKey > 0 && <span key={forwardKey} className="story-seek-feedback">+5초</span>}
            <img src="/assets/ctrl-forward.svg" alt="5초 앞으로" />
          </button>
        </div>
      )}

      <NB onHome={onHome} activeStage={1} clearedStages={[]} compact={true} />
      <Subtitle text={currentSubtitle} />

      {currentBubble && (
        <SpeechBubble
          text={currentBubble.text}
          top={currentBubble.top}
          left={currentBubble.left}
          tailRotation={currentBubble.tailRotation}
          tailBottom={currentBubble.tailBottom}
          tailLeft={currentBubble.tailLeft}
          tailRight={currentBubble.tailRight}
        />
      )}

      <div className="story-progress-bar">
        {stories.map((_, i) => (
          <span
            key={i}
            className={`story-dot ${i === currentIndex ? 'active' : i < currentIndex ? 'done' : ''}`}
          />
        ))}
      </div>

      {videoEnded && (
        <div className="story-next-wrap">
          <NextButton
            onClick={handleNext}
            label={currentIndex === stories.length - 1 ? '완료' : '다음'}
          />
        </div>
      )}
    </div>
  );
}