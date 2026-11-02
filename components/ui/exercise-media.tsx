'use client';
/* eslint-disable @next/next/no-img-element -- static WebP frames served from /public; next/image adds nothing here */
import { Dumbbell } from 'lucide-react';
import type { Exercise } from '@/lib/types';

/** Square thumbnail (first frame) with the old icon as fallback for exercises without media. */
export function ExerciseThumb({ exercise, size = 44 }: { exercise: Exercise | undefined; size?: number }) {
  if (!exercise?.media) {
    return (
      <span className="ex-thumb ex-thumb-empty" style={{ width: size, height: size }} aria-hidden="true">
        <Dumbbell size={Math.round(size * 0.5)} />
      </span>
    );
  }
  return (
    <span className="ex-thumb" style={{ width: size, height: size }}>
      <img src={exercise.media.frames[0]} alt="" loading="lazy" decoding="async" width={size} height={size} />
    </span>
  );
}

/**
 * Start/end frames alternating every second, which reads like a slow loop of the movement.
 * With prefers-reduced-motion both frames sit side by side instead.
 */
export function ExerciseMotion({ exercise }: { exercise: Exercise }) {
  if (!exercise.media) {
    return (
      <div className="modal-illustration">
        <Dumbbell size={56} />
      </div>
    );
  }
  const [start, end] = exercise.media.frames;
  return (
    <figure className="motion">
      <div className="motion-stage">
        <img
          className="motion-frame"
          src={start}
          alt={`${exercise.name}: posición inicial`}
          decoding="async"
        />
        <img
          className="motion-frame motion-frame-b"
          src={end}
          alt={`${exercise.name}: posición final`}
          decoding="async"
        />
        <span className="motion-badge motion-badge-a">Inicio</span>
        <span className="motion-badge motion-badge-b">Final</span>
      </div>
    </figure>
  );
}
