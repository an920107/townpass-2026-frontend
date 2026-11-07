import { useEffect, useRef, useState } from 'react';

/** 音檔還沒到位或播放失敗時，動畫持續的時間。 */
const FALLBACK_MS = 3000;

/** 播放一段音檔，結束後呼叫 onEnd。檔案缺少時只跑動畫，流程不會卡住。 */
export function useAudioPlayer() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<number>(undefined);

  useEffect(
    () => () => {
      audioRef.current?.pause();
      clearTimeout(timerRef.current);
    },
    [],
  );

  const play = (src: string, onEnd: () => void) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      setPlaying(false);
      onEnd();
    };
    const fallback = () => {
      timerRef.current = window.setTimeout(finish, FALLBACK_MS);
    };

    const audio = new Audio(src);
    audioRef.current = audio;
    audio.addEventListener('ended', finish);
    setPlaying(true);
    audio.play().catch(fallback);
  };

  return { playing, play };
}
