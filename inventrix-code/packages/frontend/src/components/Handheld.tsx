import { useEffect, useState } from 'react';
import { mascot, MascotMood, MascotState } from '../mascot';
import { isMuted, playBeep, setMuted } from '../sound';

const PIXEL = 6;
const COLORS: Record<string, string> = { x: 'var(--px-lcd-ink)', f: 'var(--px-lcd-light)', e: 'var(--px-lcd-ink)', m: 'var(--px-pink)' };

const EYES: Record<MascotMood, string> = {
  idle: 'xffeffeffx',
  happy: 'xffeffeffx',
  dance: 'xffeffeffx',
  hungry: 'xfeeffeefx',
};
const MOUTH: Record<MascotMood, string> = {
  idle: 'xfffmmfffx',
  happy: 'xffmmmmffx',
  dance: 'xffmmmmffx',
  hungry: 'xfffmmfffx',
};

function sprite(mood: MascotMood) {
  return [
    '...xxxx...',
    '.xxffffxx.',
    'xffffffffx',
    EYES[mood],
    'xffffffffx',
    MOUTH[mood],
    '.xffffffx.',
    '..xxxxxx..',
    '..x....x..',
  ];
}

const LABEL: Record<MascotMood, string> = { idle: '嗨！', happy: '開心！', dance: '跳舞！', hungry: '肚子餓…' };

export default function Handheld() {
  const [state, setState] = useState<MascotState>({ mood: 'idle', message: null });
  const [muted, setMutedState] = useState(isMuted);

  useEffect(() => mascot.subscribe(setState), []);

  const toggleSound = () => {
    setMuted(!muted);
    setMutedState(!muted);
    if (muted) playBeep();
  };

  const rows = sprite(state.mood);
  const text = state.mood === 'idle' && state.message ? state.message : LABEL[state.mood];

  return (
    <aside className="handheld" aria-label="電子雞掌機">
      <div className="handheld-screen">
        <div className={`mascot mascot-${state.mood}`}>
          <svg width={10 * PIXEL} height={rows.length * PIXEL} viewBox={`0 0 10 ${rows.length}`} shapeRendering="crispEdges" aria-hidden="true">
            {rows.flatMap((row, y) => [...row].map((c, x) => COLORS[c] && <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={COLORS[c]} />))}
          </svg>
          {state.mood === 'happy' && <span className="mascot-fx" aria-hidden="true">♥</span>}
          {state.mood === 'dance' && <span className="mascot-fx" aria-hidden="true">♪ ♫</span>}
        </div>
        <p className="handheld-status" aria-live="polite">{text}</p>
      </div>
      <div className="handheld-buttons">
        <button type="button" aria-label="摸摸" onClick={() => mascot.happy()}>A</button>
        <button type="button" aria-label="跳舞" onClick={() => mascot.dance()}>B</button>
        <button type="button" aria-label="音效" aria-pressed={!muted} onClick={toggleSound}>{muted ? '🔇' : '🔊'}</button>
      </div>
    </aside>
  );
}
