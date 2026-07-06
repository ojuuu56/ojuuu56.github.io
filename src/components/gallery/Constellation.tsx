import { useEffect, useMemo, useRef, useState } from "react";

type Star = { x: number; y: number };

const STARS: Star[] = [
  { x: 18, y: 30 },
  { x: 42, y: 18 },
  { x: 68, y: 32 },
  { x: 82, y: 62 },
  { x: 30, y: 72 },
];

export default function Constellation({ onSolve }: { onSolve?: () => void }) {
  const [picked, setPicked] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (picked.length === STARS.length && !solved) {
      setSolved(true);
      onSolve?.();
    }
  }, [picked, solved, onSolve]);

  const lines = useMemo(() => {
    const l: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < picked.length - 1; i++) {
      const a = STARS[picked[i]];
      const b = STARS[picked[i + 1]];
      l.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
    }
    if (solved) {
      const a = STARS[picked[picked.length - 1]];
      const b = STARS[picked[0]];
      l.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
    }
    return l;
  }, [picked, solved]);

  const pick = (i: number) => {
    if (solved) return;
    setPicked((p) => (p.includes(i) ? p : [...p, i]));
  };

  const reset = () => {
    setPicked([]);
    setSolved(false);
  };

  return (
    <div className="relative w-full">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.4em] text-amber-100/70">
            Game · 01
          </p>
          <h4 className="mt-1 font-serif text-xl text-white">Draw the constellation</h4>
        </div>
        <button
          onClick={reset}
          className="pointer-events-auto font-mono text-[0.55rem] uppercase tracking-[0.35em] text-white/50 hover:text-white/90"
        >
          reset
        </button>
      </div>

      <div
        ref={boxRef}
        className="relative aspect-[16/10] w-full overflow-hidden rounded-sm border border-white/10 bg-gradient-to-b from-[#070a14] to-[#0d1024]"
      >
        {/* Faint background nebula */}
        <div className="absolute inset-0 opacity-40" style={{
          background: "radial-gradient(60% 50% at 30% 60%, rgba(255,180,120,0.15), transparent 70%), radial-gradient(50% 40% at 75% 30%, rgba(120,180,255,0.15), transparent 70%)",
        }} />

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          {lines.map((l, i) => (
            <line
              key={i}
              x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke="rgba(255, 220, 170, 0.85)"
              strokeWidth={0.25}
              vectorEffect="non-scaling-stroke"
              style={{ filter: solved ? "drop-shadow(0 0 6px rgba(255,220,170,0.9))" : "drop-shadow(0 0 2px rgba(255,220,170,0.5))" }}
            />
          ))}
        </svg>

        {STARS.map((s, i) => {
          const on = picked.includes(i);
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
              aria-label={`Star ${i + 1}`}
            >
              <span
                className="block rounded-full transition-all duration-300"
                style={{
                  width: on ? 14 : 8,
                  height: on ? 14 : 8,
                  background: on ? "rgba(255,230,180,1)" : "rgba(255,230,180,0.7)",
                  boxShadow: on
                    ? "0 0 24px 6px rgba(255,220,160,0.7), 0 0 4px 2px rgba(255,255,255,0.9)"
                    : "0 0 10px 2px rgba(255,220,160,0.35)",
                  animation: on ? undefined : "twinkle 2.6s ease-in-out infinite",
                  animationDelay: `${i * 0.4}s`,
                }}
              />
            </button>
          );
        })}

        {solved && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center animate-fade-in">
            <p className="font-serif text-lg italic text-amber-100/90 md:text-2xl">
              "The plane knows the way home."
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.35); }
        }
      `}</style>
    </div>
  );
}
