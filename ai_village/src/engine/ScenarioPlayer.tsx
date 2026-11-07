import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { ChatMock } from '../modules/ChatMock';
import { ChoicePanel } from '../modules/ChoicePanel';
import { CompletionCard } from '../modules/CompletionCard';
import { Spotlight } from '../modules/Spotlight';
import { UploadSheet } from '../modules/UploadSheet';
import { VoicePanel } from '../modules/VoicePanel';
import { useAudioPlayer } from '../modules/useAudioPlayer';
import type { ChatMessage, Option, Picks, Scenario, Spot, Step } from '../types';
import { fill } from './template';

const TYPING_MS = 1600;
const VOICE_CHAR_MS = 110;
const VOICE_REMIND_MS = 5000;
const DEFAULT_HINT = '請點亮起來的地方喔！';
const READ_MS_PER_CHAR = 150;
const READ_MIN_MS = 5000;
const READ_MAX_MS = 15000;

function readingTime(message: ChatMessage | undefined): number {
  if (message?.role !== 'ai') return READ_MIN_MS;
  const { headline = '', body = [], cards = [] } = message.reply;
  const chars = [headline, ...body, ...cards.map((c) => c.place)].join('').length;
  return Math.min(READ_MAX_MS, Math.max(READ_MIN_MS, chars * READ_MS_PER_CHAR));
}

interface Props {
  scenario: Scenario;
  onExit: () => void;
  onComplete: (id: string) => void;
}

export function ScenarioPlayer(props: Props) {
  const [run, setRun] = useState(0);
  return <Run key={run} {...props} onReplay={() => setRun((n) => n + 1)} />;
}

function spotOf(step: Step): Spot | null {
  switch (step.type) {
    case 'tap':
      return step.target;
    case 'send':
      return 'send';
    case 'play':
      return 'speaker';
    case 'voice':
      return 'stop';
    case 'read':
    case 'done':
      return null;
    default:
      return 'choice';
  }
}

function Run({ scenario, onExit, onComplete, onReplay }: Props & { onReplay: () => void }) {
  const { steps } = scenario;
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<Picks>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [attachment, setAttachment] = useState<string>();
  const [waiting, setWaiting] = useState(false);
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(true);
  const [nudges, setNudges] = useState(0);
  const timers = useRef<number[]>([]);
  const audio = useAudioPlayer();
  const rootRef = useRef<HTMLDivElement>(null);

  const step = steps[index];
  const busy = waiting || audio.playing || (step.type === 'voice' && !listening);
  const spot = busy ? null : spotOf(step);
  const resultTip = !busy && step.type === 'tap' ? step.resultTip : undefined;
  const tip =
    step.type === 'done' || step.type === 'read'
      ? ''
      : nudges > 0
        ? (step.hint ?? DEFAULT_HINT)
        : step.tip;

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const advance = () => {
    const next = steps[index + 1];
    if (next.type === 'prompt' && next.flip) {
      const { pick, map } = next.flip;
      setPicks((p) => ({ ...p, [pick]: map[p[pick]] }));
    }
    setNudges(0);
    setListening(true);
    setIndex(index + 1);
  };

  const send = (text: string, replyTemplate: string) => {
    const image = attachment;
    setMessages((m) => [...m, { role: 'user', text, image }]);
    setDraft('');
    setTyping(false);
    setAttachment(undefined);
    setWaiting(true);
    later(() => {
      setWaiting(false);
      setMessages((m) => [...m, { role: 'ai', reply: scenario.replies[fill(replyTemplate, picks)] }]);
      advance();
    }, TYPING_MS);
  };

  const hit = () => {
    if (step.type === 'tap') {
      if (step.target === 'input') setTyping(true);
      advance();
    }
    if (step.type === 'send') send(draft, step.reply);
    if (step.type === 'play') audio.play(fill(step.audio, picks), advance);
    if (step.type === 'voice') stopRecording();
  };

  // 所有點擊都在這裡判斷：點對就前進，點錯就提示。
  const onRootClick = (e: MouseEvent) => {
    if (!spot) return;
    const pressed = (e.target as HTMLElement).closest<HTMLElement>('[data-target]');
    if (pressed?.dataset.target === spot) hit();
    else setNudges((n) => n + 1);
  };

  const stopRecording = () => {
    if (step.type !== 'voice') return;
    const chars = Array.from(step.phrase);
    setListening(false);
    chars.forEach((_, i) => {
      later(() => setDraft(chars.slice(0, i + 1).join('')), VOICE_CHAR_MS * (i + 1));
    });
    // 文字出現後停在輸入框，讓長者確認內容，再自己按送出。
    later(advance, VOICE_CHAR_MS * chars.length + 300);
  };

  const pickOption = (pick: string | undefined, option: Option) => {
    if (pick) setPicks((p) => ({ ...p, [pick]: option.id }));
  };

  useEffect(() => {
    if (step.type !== 'voice' || !listening) return;
    const id = window.setTimeout(() => setNudges((n) => n + 1), VOICE_REMIND_MS);
    return () => clearTimeout(id);
  }, [step.type, listening, nudges]);

  useEffect(() => {
    if (step.type !== 'read') return;
    const id = window.setTimeout(advance, readingTime(messages[messages.length - 1]));
    return () => clearTimeout(id);
    // 只在進入閱讀步驟時計時一次。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  useEffect(() => {
    if (step.type === 'done') onComplete(scenario.id);
  }, [step.type, scenario.id, onComplete]);

  // 回覆下方的按鈕可能在聊天內容下方，要捲到看得見。
  useEffect(() => {
    if (spot !== 'speaker' && spot !== 'like') return;
    rootRef.current
      ?.querySelector(`[data-target="${spot}"]`)
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [spot, messages.length]);

  const singlePrompt =
    step.type === 'prompt' ? (scenario.prompts?.[fill(step.text ?? '', picks)] ?? '') : '';
  const promptOptions: Option[] | undefined =
    step.type === 'prompt'
      ? (step.options ?? [{ id: singlePrompt, label: singlePrompt }])
      : undefined;

  return (
    <div ref={rootRef} className="app" onClick={onRootClick}>
      <ChatMock
        messages={messages}
        waiting={waiting}
        draft={draft}
        typing={typing}
        recording={step.type === 'voice' && listening}
        attachment={attachment}
        spot={spot}
        toolTip={spot === 'speaker' || spot === 'like' ? tip : undefined}
        resultTip={resultTip}
        speakerPlaying={audio.playing}
        nudges={nudges}
      >
        {promptOptions && step.type === 'prompt' && (
          <ChoicePanel
            tip={tip}
            nudges={nudges}
            options={promptOptions}
            onPick={(o) => {
              pickOption(step.pick, o);
              setDraft(o.label);
              advance();
            }}
          />
        )}
        {step.type === 'voice' && (
          <VoicePanel
            tip={tip}
            phrase={step.phrase}
            listening={listening}
            nudges={nudges}
          />
        )}
      </ChatMock>

      <Spotlight spot={spot} tip={tip} nudges={nudges} showResult={Boolean(resultTip)} />

      {step.type === 'attach' && (
        <UploadSheet
          tip={tip}
          nudges={nudges}
          options={step.options}
          onPick={(o) => {
            pickOption(step.pick, o);
            setAttachment(o.image);
            advance();
          }}
        />
      )}

      {step.type === 'done' && (
        <CompletionCard
          title={step.title}
          points={step.points}
          onReplay={onReplay}
          onExit={onExit}
        />
      )}
    </div>
  );
}
