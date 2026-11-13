const MUTED_KEY = 'mascot-muted';

let ctx: AudioContext | undefined;
let muted = localStorage.getItem(MUTED_KEY) === '1';

export const isMuted = () => muted;

export function setMuted(value: boolean) {
  muted = value;
  localStorage.setItem(MUTED_KEY, value ? '1' : '0');
}

type Note = [hz: number, seconds: number];

function play(notes: Note[]) {
  if (muted) return;
  ctx ??= new AudioContext();
  let t = ctx.currentTime;
  for (const [hz, seconds] of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = hz;
    gain.gain.value = hz ? 0.06 : 0;
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + seconds);
    t += seconds;
  }
}

const C5 = 523, D5 = 587, E5 = 659, G5 = 784, A5 = 880, C6 = 1047, E6 = 1319, G6 = 1568, REST = 0;

export const playBeep = () => play([[C6, 0.06]]);
export const playHappy = () => play([[C6, 0.08], [E6, 0.08], [G6, 0.14]]);
export const playDance = () => play(
  [C5, E5, G5, E5, D5, G5, A5, REST, G5, E5, C6, A5, G5, E5, C5, REST, C6].map(hz => [hz, 0.16] as Note)
);
