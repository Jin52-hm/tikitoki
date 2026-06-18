import { useState, useEffect, useRef } from 'react';
import './SentenceSayScreen.css';
import NB from '../components/NB';
import nextArrow from '../assets/next-arrow.svg';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySpeechRecognition = any;

type Phase = 'teach' | 'listen' | 'success' | 'fail' | 'pass';
type FeedbackType = 'perfect' | 'excellent' | 'good' | 'pass';

const ANSWER_LIST = [
  '엄마 사랑해',
  '엄마 감사합니다',
  '엄마 고마워',
  '고마워요',
  '사랑해요',
  '감사합니다',
  '사랑해',
  '고마워',
  '엄마 미안해요',
  '미안해',
];

const normalize = (s: string) => s.replace(/\s+/g, '').replace(/[.,!?~]/g, '');

const isCorrect = (said: string) => {
  const n = normalize(said);
  return ANSWER_LIST.some(a => n.includes(normalize(a)));
};

const FEEDBACK: Record<FeedbackType, { subtitle: string; main: string; stars: string }> = {
  perfect:   { subtitle: '문장 말하기 성공!', main: '참 잘했어요!',     stars: '⭐⭐⭐️' },
  excellent: { subtitle: '문장 말하기 성공!', main: '잘했어요!',        stars: '⭐⭐️'   },
  good:      { subtitle: '문장 말하기 성공!', main: '끝까지 해냈어요!',  stars: '⭐️'    },
  pass:      { subtitle: '괜찮아요!',         main: '다음으로 넘어가요', stars: ''       },
};

export default function SentenceSayScreen({ onHome, onNext, onClear }: { onHome: () => void; onNext: () => void; onClear?: (score: number) => void }) {
  const [phase, setPhase] = useState<Phase>('teach');
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('perfect');
  const [stageCleared, setStageCleared] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [failCount, setFailCount] = useState(0);
  const failCountRef = useRef(0);
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
    const score = attempts === 0 ? 100 : attempts === 1 ? 80 : attempts === 2 ? 65 : 50;
    failCountRef.current = 0;
    setFailCount(0);
    onClear?.(score);
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
      setStageCleared(true);
      setTimeout(() => setPhase('success'), 1000);
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
        if (isCorrect(said)) {
          resolveSuccess();
          setStageCleared(true);
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
    onClear?.(0);
  };

  const isCleared = phase === 'success' || phase === 'pass';
  const fb = FEEDBACK[feedbackType];

  return (
    <div className="sentence-say" onClick={handleClick}>
      <img
        className="ss-bg"
        src="/assets/fox-hug.png"
        alt=""
      />

      {isCleared && <div className="ss-success-overlay" />}

      <NB
        onHome={() => { stopRecognition(); onHome(); }}
        activeStage={3}
        clearedStages={stageCleared ? [1, 2, 3] : [1, 2]}
      />

      {!isCleared && (
        <div className={`ss-prompt-bar ${phase === 'fail' ? 'fail' : ''}`}>
          <p>
            {phase === 'listen'
              ? '듣고 있어요'
              : phase === 'fail'
              ? (transcript ? `"${transcript}" — 다시 해볼까요? 🙂` : '잘 못 들었어요. 다시 해볼까요? 🙂')
              : '루비는 엄마에게 뭐라고 말할까?'}
          </p>
          {phase === 'fail' && (
            <p className="ss-fail-hint">
              {!transcript
                ? '더 크게 말해볼까요? 🎤'
                : '"엄마 사랑해" 또는 "고마워요"라고 말해봐요!'}
            </p>
          )}
        </div>
      )}

      {phase === 'teach' && (
        <p className="ss-tap-hint">화면을 눌러 말해봐요</p>
      )}

      {phase === 'fail' && (
        <p className="ss-tap-hint">화면을 눌러 다시 말해요</p>
      )}

      {phase === 'fail' && failCount >= 3 && (
        <button className="ss-pass-btn" onClick={handlePass}>
          <span className="ss-pass-btn-label">넘어가기</span>
          <img className="ss-pass-btn-arrow" src={nextArrow} alt="" />
        </button>
      )}

      {isCleared && (
        <div className={`ss-feedback-card ${feedbackType === 'pass' ? 'ss-feedback-card--pass' : ''}`}>
          <p className="ss-feedback-subtitle">{fb.subtitle}</p>
          <p className="ss-feedback-main">{fb.main}</p>
          {fb.stars && <p className="ss-feedback-stars">{fb.stars}</p>}
        </div>
      )}

      <button
        className="ss-dev-skip"
        onClick={e => { e.stopPropagation(); stopRecognition(); onNext(); }}
      >
        건너뛰기 (DEV)
      </button>
    </div>
  );
}
