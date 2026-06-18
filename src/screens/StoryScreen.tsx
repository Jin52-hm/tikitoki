import React, { useState, useRef, useEffect, useCallback } from 'react';
import './StoryScreen.css';
import NB from '../components/NB';
import Subtitle from '../components/subtitle';
import SpeechBubble from '../components/SpeechBubble';
import NextButton from '../components/NextButton';
import statusIdle from '../assets/status=idle.svg';
import statusPlay from '../assets/status=play.svg';

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
      { time: 0, text: '학교가 끝났지만,' },
      {time: 1.6, text: '루비는 바로 집으로 가지 않았어요.' },
      { time: 5, text: '엄마는 늘  바쁘고,' },
      { time: 6, text: '오늘은 함께 놀 친구도 없었거든요.' },
    ],
    bubbles: [] as Bubble[],
  },
  {
    video: '/assets/videos/story2.mp4',
    subtitles: [
      { time: 0, text: '숲을 걷던 루비는' },
      { time: 2, text: '반짝반짝 빛나는 무언가를 발견했어요.' },
      { time: 6, text: '고개를 들어 보니,' },
      { time: 8, text: '나무에 새빨간 사과 하나가 달려 있었어요.' },
    ],
    bubbles: [] as Bubble[],
  },
  {
    video: '/assets/videos/story3.mp4',
    subtitles: [
      { time: 0, text: '우와! 빨간 사과다!' },
    ],
    bubbles: [] as Bubble[],
  },

  {
    video: '/assets/videos/story4.mp4',
    subtitles: [
      { time: 0, text: '루비는 엄마에게 빨간 사과를 보여주고 싶어' },
      { time: 3.5, text: '한달음에 집으로 달려왔어요.' },
      { time: 6, text: ' ' },
     
    ],
    bubbles: [] as Bubble[],
  },
  {
    video: '/assets/videos/story5.mp4',
    subtitles: [
       { time: 0, text: '엄마는 루비가 다칠까 걱정이 되어' },
      { time: 3, text: '목소리가 커졌어요.' },
      { time: 4.5, text: '루비는 속상한 마음에 집을 뛰쳐 나갔어요.' },
    ],
    bubbles: [
      
    ] as Bubble[],
  },
  {
    video: '/assets/videos/story6.mp4',
    subtitles: [
      { time: 0, text: '숲속을 걷던 루비는' },
      { time: 2.3, text: '풀숲에 숨어있는 토끼를 발견했어요.' },
      { time: 6.5, text: '루비는 토끼를 보고 조심스럽게 인사했어요.' },
    ],
    bubbles: [] as Bubble[],
  },
  {
    video: '/assets/videos/story7.mp4',
    subtitles: [
      { time: 0, text: '토끼와 친구가 된 루비는 ' },
      { time: 2.8, text: '토끼에게 사과를 보여주고 싶었어요' },
      { time: 5.7, text: '신나게 달려가던 순간' },
      { time: 7.8, text: '발 밑이 푹 꺼지고 말았어요.' },
    ],
    bubbles: [] as Bubble[],
  },
  {
    video: '/assets/videos/story8.mp4',
    subtitles: [
      { time: 0, text: '토끼는 도와달라 소리쳤고,' },
      { time: 2.8, text: '토끼의 외침을 들은 엄마는' },
      { time: 5, text: '헐레벌떡 달려왔어요.' },
    ],
    bubbles: [] as Bubble[],
  },
  {
    video: '/assets/videos/story9.mp4',
    subtitles: [
      { time: 0, text: '루비는 무사히 구출되었어요.' },
      { time: 3.7, text: '엄마는 떨리는 마음으로 루비를 안아주었고,' },
      { time: 7.5, text: '루비도 엄마 품이 폭 안겨' },
      { time: 9.6, text: '마음을 놓았어요.' },
    ],
    bubbles: [] as Bubble[],
  },
  {
    video: '/assets/videos/story10.mp4',
    subtitles: [
      { time: 0, text: '그날 이후, 루비와 엄마는' },
      { time: 2.7, text: '서로를 더 깊이 이해하게 되었고,' },
      { time: 5.5, text: '빛을 되찾은 숲에는' },
      { time: 7.5, text: '다시 따뜻한 웃음소리가 가득해졌답니다.' },
    ],
    bubbles: [] as Bubble[],
  },
];

export default function StoryScreen({
  onHome,
  onNext,
  onMiniGame,
  onWordSay,
  onSentenceSay,
  startIndex = 0,
  clearedStages = [],
}: {
  onHome: () => void;
  onNext: () => void;
  onMiniGame?: () => void;
  onWordSay?: () => void;
  onSentenceSay?: () => void;
  startIndex?: number;
  clearedStages?: number[];
}) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [currentBubble, setCurrentBubble] = useState<Bubble | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [rewindKey, setRewindKey] = useState(0);
  const [forwardKey, setForwardKey] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const videoEndedRef = useRef(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundEnabledRef = useRef(true);
  const [showNarrationIntro, setShowNarrationIntro] = useState(false);
  const [manualSubIdx, setManualSubIdx] = useState(0);
  const manualLoopRef = useRef<{ start: number; end: number | null } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const autoHideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = stories[currentIndex];
  const displayedSubtitle = soundEnabled ? currentSubtitle : (current.subtitles[manualSubIdx]?.text ?? '');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      // 나레이션 OFF: 현재 자막 구간 끝에 도달하면 구간 시작으로 loop
      if (manualLoopRef.current) {
        const { start, end } = manualLoopRef.current;
        if (end !== null && video.currentTime >= end) {
          video.currentTime = start;
          return;
        }
        return; // 루프 중엔 자막/버블 자동 갱신 불필요
      }

      const t = video.currentTime;

      let matchedSub = '';
      for (const sub of (current.subtitles ?? [])) {
        if (t >= sub.time) matchedSub = sub.text;
      }
      setCurrentSubtitle(matchedSub);

      let matchedBubble: Bubble | null = null;
      for (const bubble of (current.bubbles ?? [])) {
        if (t >= bubble.time && t < bubble.time + bubble.duration) {
          matchedBubble = bubble;
        }
      }
      setCurrentBubble(matchedBubble);
    };

    const handleEnded = () => {
      if (manualLoopRef.current) {
        video.currentTime = manualLoopRef.current.start;
        video.play().catch(() => {});
      } else {
        if (video.duration > 0.5) {
          video.currentTime = video.duration - 0.5;
        }
        videoEndedRef.current = true;
        setVideoEnded(true);
      }
    };

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
    videoEndedRef.current = false;
    setVideoEnded(false);
    setManualSubIdx(0);
    // 나레이션 OFF면 첫 자막 구간 루프 세팅, ON이면 초기화
    if (!soundEnabledRef.current) {
      manualLoopRef.current = {
        start: current.subtitles[0]?.time ?? 0,
        end: current.subtitles[1]?.time ?? null,
      };
    } else {
      manualLoopRef.current = null;
    }
    const video = videoRef.current;
    if (!video) return;
    video.muted = !soundEnabledRef.current;
    video.play().catch(() => {
      // 브라우저가 소리 있는 자동재생 차단 시 음소거로 폴백
      video.muted = true;
      soundEnabledRef.current = false;
      setSoundEnabled(false);
      video.play().catch(() => {});
    });
  }, [currentIndex]);

  // 나레이션 OFF: 자막 인덱스가 바뀔 때마다 해당 구간으로 seek하고 loop 구간 갱신
  useEffect(() => {
    if (soundEnabled) {
      manualLoopRef.current = null;
      return;
    }
    const sub = current.subtitles[manualSubIdx];
    if (!sub) {
      manualLoopRef.current = null;
      return;
    }
    const nextSub = current.subtitles[manualSubIdx + 1];
    manualLoopRef.current = { start: sub.time, end: nextSub?.time ?? null };
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = sub.time;
    video.play().catch(() => {});
  }, [manualSubIdx, soundEnabled]);

  const hideControls = useCallback(() => {
    if (autoHideRef.current) clearTimeout(autoHideRef.current);
    setShowControls(false);
    setRewindKey(0);
    setForwardKey(0);
  }, []);

  const handleScreenClick = () => {
    if (showNarrationIntro) {
      setShowNarrationIntro(false);
      return;
    }
    if (!soundEnabled) {
      if (manualSubIdx < current.subtitles.length - 1) {
        setManualSubIdx(prev => prev + 1);
      } else {
        goNext();
      }
      return;
    }
    if (videoEndedRef.current) {
      goNext();
      return;
    }
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

  const handleSoundToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const newEnabled = !soundEnabledRef.current;
    soundEnabledRef.current = newEnabled;
    video.muted = !newEnabled;
    setSoundEnabled(newEnabled);
    if (!newEnabled) {
      const t = video.currentTime;
      let idx = 0;
      for (let i = 0; i < current.subtitles.length; i++) {
        if (t >= current.subtitles[i].time) idx = i;
      }
      setManualSubIdx(idx);
      setShowControls(false);
      setShowNarrationIntro(true);
    }
  };

  const goNext = () => {
    if (currentIndex === 1 && onMiniGame) {
      onMiniGame();
    } else if (currentIndex === 5 && onWordSay) {
      onWordSay();
    } else if (currentIndex === 8 && onSentenceSay) {
      onSentenceSay();
    } else if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onNext();
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    goNext();
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
              <img className="story-ctrl-icon" src={statusPlay} alt="재생" />
            ) : (
              <img className="story-ctrl-icon" src={statusIdle} alt="일시정지" />
            )}
          </button>
          <button className="story-ctrl-btn story-ctrl-seek story-ctrl-forward" onClick={handleForward} aria-label="5초 앞으로">
            {forwardKey > 0 && <span key={forwardKey} className="story-seek-feedback">+5초</span>}
            <img src="/assets/ctrl-forward.svg" alt="5초 앞으로" />
          </button>
        </div>
      )}

      <NB onHome={onHome} activeStage={1} clearedStages={clearedStages} compact={true} narrationOn={soundEnabled} onNarrationToggle={handleSoundToggle} />
      <Subtitle text={displayedSubtitle} />

      {currentBubble && soundEnabled && (
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

      {!soundEnabled && !showNarrationIntro && manualSubIdx === 0 && (
        <div className="story-tap-hint">탭하여 다음으로 ▶</div>
      )}

      {soundEnabled && videoEnded && (
        <div className="story-next-wrap">
          <NextButton
            onClick={handleNext}
            label={currentIndex === stories.length - 1 ? '완료' : '다음'}
          />
        </div>
      )}

      {showNarrationIntro && (
        <div className="story-narration-intro" onClick={e => e.stopPropagation()}>
          <div className="story-narration-intro-card">
            <p className="story-narration-intro-title">직접 읽어주기 모드</p>
            <p className="story-narration-intro-desc">보호자가 직접 읽어주는 모드예요<br />화면을 탭하면 다음 문장으로 넘어가요</p>
            <NextButton label="확인" showArrow={false} onClick={() => setShowNarrationIntro(false)} />
          </div>
        </div>
      )}
    </div>
  );
}