'use client';
import { useState, type CSSProperties } from 'react';
import { Check, ExternalLink, Info, PlayCircle, X } from 'lucide-react';
import { ExerciseMotion, ExerciseVideo } from '@/components/ui/exercise-media';
import { MEDIA_CREDIT, getExercise } from '@/lib/catalog';
import { videoSearchUrl } from '@/lib/video';

type MediaMode = 'photos' | 'video';

export default function ExerciseDetailModal({
  exerciseId,
  onClose,
}: {
  exerciseId: string;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<MediaMode>('photos');
  const exercise = getExercise(exerciseId);
  if (!exercise) return null;
  const video = exercise.media?.video;
  const showVideo = mode === 'video' && Boolean(video);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          <X size={21} />
        </button>
        <span className="overline">CÓMO SE HACE</span>
        <h2 id="detail-title">{exercise.name}</h2>
        <div className="modal-chips">
          <span>{exercise.muscle}</span>
          <span>{exercise.equipment}</span>
        </div>
        {video && (
          <div className="segmented media-tabs" style={{ '--seg': showVideo ? 1 : 0 } as CSSProperties}>
            <button
              type="button"
              className={showVideo ? '' : 'segment-selected'}
              aria-pressed={!showVideo}
              onClick={() => setMode('photos')}
            >
              Fotos
            </button>
            <button
              type="button"
              className={showVideo ? 'segment-selected' : ''}
              aria-pressed={showVideo}
              onClick={() => setMode('video')}
            >
              Video
            </button>
          </div>
        )}
        {showVideo ? <ExerciseVideo exercise={exercise} /> : <ExerciseMotion exercise={exercise} />}
        <p>{exercise.instruction}</p>
        <div className="safe-tip">
          <Info size={19} />
          <span>{exercise.tip}</span>
        </div>
        <a
          className="secondary-btn video-link"
          href={videoSearchUrl(exercise.name)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <PlayCircle size={17} /> Buscar video <ExternalLink size={14} aria-hidden="true" />
        </a>
        <button className="lime-btn modal-ok" onClick={onClose}>
          Entendido <Check size={17} />
        </button>
        {exercise.media && (
          <small className="media-credit">
            {showVideo && video?.credit ? `Video: ${video.credit}` : MEDIA_CREDIT}
          </small>
        )}
      </div>
    </div>
  );
}
