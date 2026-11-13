import { playDance, playHappy } from './sound';

export type MascotMood = 'idle' | 'happy' | 'dance' | 'hungry';
export interface MascotState {
  mood: MascotMood;
  message: string | null;
}

const HUNGRY_AFTER_MS = 60_000;
const HAPPY_MS = 1_200;
const DANCE_MS = 3_000;

let state: MascotState = { mood: 'idle', message: null };
const listeners = new Set<(state: MascotState) => void>();
let moodTimer: number | undefined;
let hungryTimer: number | undefined;

function update(patch: Partial<MascotState>) {
  state = { ...state, ...patch };
  listeners.forEach(fn => fn(state));
}

function touch() {
  clearTimeout(hungryTimer);
  hungryTimer = window.setTimeout(() => update({ mood: 'hungry' }), HUNGRY_AFTER_MS);
  if (state.mood === 'hungry') update({ mood: 'idle' });
}

function playMood(mood: MascotMood, ms: number) {
  touch();
  clearTimeout(moodTimer);
  update({ mood });
  moodTimer = window.setTimeout(() => update({ mood: 'idle' }), ms);
}

window.addEventListener('pointerdown', touch, true);
window.addEventListener('keydown', touch, true);
touch();

export const mascot = {
  happy() {
    playMood('happy', HAPPY_MS);
    playHappy();
  },
  dance() {
    playMood('dance', DANCE_MS);
    playDance();
  },
  setMessage(text: string | null) {
    touch();
    update({ message: text });
  },
  // Calls fn immediately with the current state, then on every change.
  subscribe(fn: (state: MascotState) => void): () => void {
    listeners.add(fn);
    fn(state);
    return () => listeners.delete(fn);
  },
};
