import { useState, useEffect, useRef } from 'react';
import './WordGameScreen.css';
import NB from '../components/NB';
import nextArrow from '../assets/next-arrow.svg';

import apple1 from '../assets/apple-1.png';
import apple2 from '../assets/apple-2.png';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySpeechRecognition = any;

type Phase = 'teach' | 'listen' | 'success' | 'fail' | 'pass';
type FeedbackType = 'perfect' | 'excellent' | 'good' | 'pass';

const TARGET_WORD = '사과';

const FEEDBACK: Record<FeedbackType, { subtitle: string; main: string; stars: string }> = {
  perfect:   { subtitle: '따라 말하기 성공!', main: '참 잘했어요!',     stars: '⭐⭐⭐️' },
  excellent: { subtitle: '따라 말하기 성공!', main: '잘했어요!',        stars: '⭐⭐️'   },
  good:      { subtitle: '따라 말하기 성공!', main: '끝까지 해냈어요!',  stars: '⭐️'    },
  pass:      { subtitle: '괜찮아요!',         main: '다음으로 넘어가요', stars: ''       },
};

export default function WordGameScreen({ onHome, onNext, onClear }: { onHome: () => void; onNext: () => void; onClear?: () => void }) {
  const [phase, setPhase] = useState<Phase>('teach');
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('perfect');
  const [stageCleared, setStageCleared] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [failCount, setFailCount] = useState(0);
  const failCountRef = useRef(0);
  const [volume, setVolume] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const recognitionRef = useRef<AnySpeechRecognition>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeRafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const incrementFail = () => {
    failCountRef.current += 1;
    setFailCount(failCountRef.current);
  };

  const resolveSuccess = () => {
    const attempts = failCountRef.current;
    const type: FeedbackType = attempts === 0 ? 'perfect' : attempts === 1 ? 'excellent' : 'good';
    setFeedbackType(type);
    failCountRef.current = 0;
    setFailCount(0);
    onClear?.();
  };

  const startVolumeDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);
      const loop = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setVolume(Math.min(avg / 60, 1));
        volumeRafRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch {
      // 마이크 권한 없으면 무시
    }
  };

  const stopVolumeDetection = () => {
    if (volumeRafRef.current) cancelAnimationFrame(volumeRafRef.current);
    audioContextRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    setVolume(0);
  };

  const stopRecognition = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    stopVolumeDetection();
  };

  const startListening = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      resolveSuccess();
      setIsAnimating(true);
      setTimeout(() => setPhase('success'), 3000);
      return;
    }

    startVolumeDetection();

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'ko-KR';
    recognition.continuous = false;
    recognition.interimResults = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const result = Array.from(e.results)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => r[0].transcript)
        .join('');
      setTranscript(result);

      if (e.results[e.results.length - 1].isFinal) {
        const said = result.trim();
        stopVolumeDetection();
        if (said.includes(TARGET_WORD)) {
          resolveSuccess();
          setStageCleared(true);
          setIsAnimating(true);
          setTimeout(() => setPhase('success'), 800);
        } else {
          incrementFail();
          setPhase('fail');
        }
        recognitionRef.current = null;
      }
    };

    recognition.onerror = () => {
      stopVolumeDetection();
      incrementFail();
      setPhase('fail');
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      if (recognitionRef.current) {
        stopVolumeDetection();
        incrementFail();
        setPhase('fail');
        recognitionRef.current = null;
      }
    };

    recognition.start();
  };

  useEffect(() => {
    if (phase === 'listen') {
      setTranscript('');
      setIsAnimating(false);
      startListening();
    }
    return () => {
      if (phase === 'listen') stopRecognition();
    };
  }, [phase]);

  const handleClick = () => {
    if (phase === 'teach') {
      setPhase('listen');
    } else if (phase === 'fail') {
      setPhase('listen');
    } else if (phase === 'success' || phase === 'pass') {
      onNext();
    }
  };

  const handlePass = (e: React.MouseEvent) => {
    e.stopPropagation();
    stopRecognition();
    setFeedbackType('pass');
    setStageCleared(true);
    setPhase('pass');
    onClear?.();
  };

  const appleScale = phase === 'listen' && !isAnimating ? 1 + volume * 0.08 : 1;
  const isCleared = phase === 'success' || phase === 'pass';
  const fb = FEEDBACK[feedbackType];

  return (
    <div className="word-game" onClick={handleClick}>
      {isCleared ? (
        <>
          <img className="wg-success-bg" src="/assets/forest-bg.png" alt="" />
          <div className="wg-success-overlay" />
        </>
      ) : (
        <img className="wg-bg" src="/assets/forest-bg.png" alt="" />
      )}

      <NB
        onHome={() => { stopRecognition(); onHome(); }}
        activeStage={1}
        clearedStages={stageCleared ? [1] : []}
      />

      {phase === 'teach' && (
        <>
          <div className="wg-info-bar">
            <p>이건 '사과'야. 따라 해볼까? '사과'</p>
          </div>
          <img
            className="wg-apple wg-apple--sm"
            src={apple1}
            alt="사과"
          />
          <div className="wg-word-pill">
            <span className="wg-word-big">사</span>
            <span className="wg-word-small">과</span>
          </div>
          <div className="wg-retry-hint">화면을 눌러 말해봐요</div>
        </>
      )}

      {(phase === 'listen' || phase === 'fail') && (
        <>
          <div className={`wg-info-bar ${phase === 'fail' ? 'fail' : ''}`}>
            <p>
              {phase === 'fail'
                ? transcript ? `"${transcript}" — 다시 해볼까요? 🙂` : '잘 못 들었어요. 다시 해볼까요? 🙂'
                : '듣고 있어요'}
            </p>
            {phase === 'fail' && (
              <p className="wg-fail-hint">
                {!transcript
                  ? '더 크게 말해볼까요? 🎤'
                  : transcript.includes(TARGET_WORD)
                  ? '거의 다 왔어요! 조금 더 크게 말해볼까요?'
                  : '더 또박또박 말해볼까요?'}
              </p>
            )}
          </div>

          <img
            className={`wg-apple wg-apple--lg ${isAnimating ? 'wg-apple--to-success' : ''}`}
            src={isAnimating ? apple2 : apple1}
            alt="사과"
            style={{ transform: `translateX(-50%) scale(${appleScale})` }}
          />

          <div className="wg-word-pill">
            <span className="wg-word-big">사</span>
            <span className="wg-word-small">과</span>
          </div>

          {phase === 'fail' && (
            <div className="wg-retry-hint">화면을 눌러 다시 말해요</div>
          )}

          {phase === 'fail' && failCount >= 3 && (
            <button className="wg-pass-btn" onClick={handlePass}>
              <span className="wg-pass-btn-label">넘어가기</span>
              <img className="wg-pass-btn-arrow" src={nextArrow} alt="" />
            </button>
          )}
        </>
      )}

      {isCleared && (
        <>
          {phase === 'success' && (
            <img
              className="wg-apple wg-apple--success"
              src={apple2}
              alt="사과"
            />
          )}
          <div className={`wg-feedback-card ${feedbackType === 'pass' ? 'wg-feedback-card--pass' : ''}`}>
            <p className="wg-feedback-subtitle">{fb.subtitle}</p>
            <p className="wg-feedback-main">{fb.main}</p>
            {fb.stars && <p className="wg-feedback-stars">{fb.stars}</p>}
          </div>
        </>
      )}

    </div>
  );
}
