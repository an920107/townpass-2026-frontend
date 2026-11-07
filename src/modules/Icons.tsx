import type { ReactNode } from 'react';
import type { IconName } from '../types';

type Name = IconName | 'plus' | 'send' | 'speaker' | 'check' | 'copy' | 'like' | 'stop' | 'go';

const paths: Record<Name, ReactNode> = {
  plus: <path d="M12 5v14M5 12h14" />,
  send: <path d="M12 19V5M6 11l6-6 6 6" />,
  // 對應 Taipei Pass 的 icon_expand。
  go: <path d="M9 6l6 6-6 6" />,
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </>
  ),
  speaker: (
    <>
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" />
      <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  stop: <rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h8" />
    </>
  ),
  like: <path d="M8 11l4-7a2.5 2.5 0 0 1 2.5 2.8L14 10h5a2 2 0 0 1 2 2.3l-1 6a2 2 0 0 1-2 1.7H8zM8 11H4v9h4" />,
  doc: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4M9 12h6M9 16h6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  map: (
    <>
      <path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5.5c0 4.4-3 7.8-7 9.5-4-1.7-7-5.1-7-9.5V6z" />
      <path d="M8.8 12l2.3 2.3 4.2-4.3" />
    </>
  ),
};

export function Icon({ name }: { name: Name }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
