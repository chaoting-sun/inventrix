import { useState, useEffect, useRef, CSSProperties } from 'react';
import { usePoints } from '../context/PointsContext';
import { mascot } from '../mascot';

const SPAWN_INTERVAL_MS = 6_000;
const MAX_POOPS = 5;
const POOP_SIZE = 48;
const HEADER_HEIGHT = 100;
// Bottom-right corner kept clear for the handheld mascot.
const MASCOT_ZONE = { width: 240, height: 280 };

interface Spot {
  id: number;
  top: number;
  left: number;
}

let nextId = 0;

function randomSpot(): Spot {
  const left = Math.random() * (window.innerWidth - POOP_SIZE);
  const inMascotColumn = left + POOP_SIZE > window.innerWidth - MASCOT_ZONE.width;
  const bottom = window.innerHeight - (inMascotColumn ? MASCOT_ZONE.height : 0);
  const top = HEADER_HEIGHT + Math.random() * (bottom - POOP_SIZE - HEADER_HEIGHT);
  return { id: nextId++, top, left };
}

export default function Poops() {
  const { earn } = usePoints();
  const [poops, setPoops] = useState<Spot[]>([]);
  const [rewards, setRewards] = useState<Spot[]>([]);
  const pending = useRef(new Set<number>());

  useEffect(() => {
    const timer = setInterval(() => setPoops(p => p.length >= MAX_POOPS ? p : [...p, randomSpot()]), SPAWN_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const clean = async (poop: Spot) => {
    if (pending.current.has(poop.id)) return;
    pending.current.add(poop.id);
    const earned = await earn();
    pending.current.delete(poop.id);
    // A rejected earn (e.g. rate limited) leaves the poop in place to retry later.
    if (!earned) return;
    setPoops(p => p.filter(x => x.id !== poop.id));
    setRewards(r => [...r, poop]);
    setTimeout(() => setRewards(r => r.filter(x => x !== poop)), 1000);
    mascot.happy();
  };

  return (
    <>
      {poops.map(poop => (
        <button key={poop.id} className="poop" aria-label="清掉便便，加 10 點" onClick={() => clean(poop)} style={{ top: poop.top, left: poop.left, '--poop-fall-from': `${HEADER_HEIGHT - poop.top}px` } as CSSProperties}>💩</button>
      ))}
      <div aria-live="polite">
        {rewards.map(reward => (
          <span key={reward.id} className="poop-reward" style={{ top: reward.top, left: reward.left }}>+10 ★</span>
        ))}
      </div>
    </>
  );
}
