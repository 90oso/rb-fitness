'use client';
import { useCallback, useRef } from 'react';

const SOUND_SRC = '/sounds/descanso.mp3';

/** Toque háptico en iOS 17.4+: el sistema vibra al cambiar un `<input type="checkbox" switch>`. Sin garantía. */
function iosHaptic() {
  try {
    let label = document.getElementById('rb-haptic') as HTMLLabelElement | null;
    if (!label) {
      label = document.createElement('label');
      label.id = 'rb-haptic';
      label.setAttribute('aria-hidden', 'true');
      label.style.cssText =
        'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.setAttribute('switch', '');
      input.tabIndex = -1;
      label.appendChild(input);
      document.body.appendChild(label);
    }
    label.click();
  } catch {
    /* sin háptico */
  }
}

/**
 * Aviso de fin de descanso: campana (un `<audio>`, que en iPhone suena aunque el interruptor esté en
 * silencio; Web Audio no), vibración donde exista y háptico en iOS como «si funciona, bien».
 * iOS solo deja sonar audio que un toque del usuario haya desbloqueado: `unlock()` se llama al guardar serie.
 */
export function useRestAlert(soundEnabled: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const unlock = useCallback(() => {
    if (audioRef.current) return;
    try {
      const audio = new Audio(SOUND_SRC);
      audio.preload = 'auto';
      audio.muted = true;
      audioRef.current = audio;
      void audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;
        })
        .catch(() => {
          audio.muted = false;
        });
    } catch {
      /* sin audio */
    }
  }, []);

  const fire = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      void audioRef.current.play().catch(() => {});
    }
    try {
      navigator.vibrate?.([180, 90, 180]);
    } catch {
      /* sin vibración */
    }
    iosHaptic();
  }, [soundEnabled]);

  return { unlock, fire };
}
