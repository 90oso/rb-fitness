import { pct } from '@/lib/format';

const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Un solo anillo de progreso (actual / meta). El color y el riel salen de los tokens del tema. */
export default function ProgressRing({
  current,
  goal,
  label,
  size = 64,
}: {
  current: number;
  goal: number;
  label: string;
  size?: number;
}) {
  const percent = pct(current, goal);
  return (
    <svg
      className="hoy-ring"
      role="img"
      aria-label={`${label}: ${percent} por ciento`}
      width={size}
      height={size}
      viewBox="0 0 64 64"
    >
      <circle className="hoy-ring-track" cx="32" cy="32" r={RADIUS} fill="none" strokeWidth="8" />
      <circle
        className="hoy-ring-fill"
        cx="32"
        cy="32"
        r={RADIUS}
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={CIRCUMFERENCE * (1 - percent / 100)}
        transform="rotate(-90 32 32)"
      />
    </svg>
  );
}
