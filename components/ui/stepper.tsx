'use client';
import { Minus, Plus } from 'lucide-react';

/** Big-target numeric control: −/+ buttons around a read-only value. Used in the routine editor. */
export default function Stepper({
  label,
  value,
  min,
  max,
  step = 1,
  format = (v: number) => String(v),
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (value: number) => string;
  onChange: (value: number) => void;
}) {
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  return (
    <div className="stepper">
      <span className="stepper-label">{label}</span>
      <div className="stepper-row">
        <button
          type="button"
          aria-label={`Menos ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(clamp(value - step))}
        >
          <Minus size={17} />
        </button>
        <output className="stepper-value" aria-live="polite">
          {format(value)}
        </output>
        <button
          type="button"
          aria-label={`Más ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(clamp(value + step))}
        >
          <Plus size={17} />
        </button>
      </div>
    </div>
  );
}
