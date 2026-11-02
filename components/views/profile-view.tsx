'use client';
import { useRef } from 'react';
import {
  Download,
  LogOut,
  Monitor,
  Moon,
  RotateCcw,
  ShieldCheck,
  Sun,
  Trash2,
  Upload,
  UserRound,
} from 'lucide-react';
import { PageHead } from '@/components/ui/bits';
import type { SyncStatus } from '@/hooks/use-cloud-sync';
import { useTheme } from '@/hooks/use-theme';
import type { AppData, Profile } from '@/lib/types';

export default function ProfileView({
  data,
  email,
  syncStatus,
  hasLegacyData,
  onProfileChange,
  onSkipTo,
  onExport,
  onImportFile,
  onImportLegacy,
  onSignOut,
  onReset,
}: {
  data: AppData;
  email: string | null;
  syncStatus: SyncStatus;
  hasLegacyData: boolean;
  onProfileChange: (patch: Partial<Profile>) => void;
  onSkipTo: (index: number) => void;
  onExport: () => void;
  onImportFile: (file: File) => void;
  onImportLegacy: () => void;
  onSignOut: () => void;
  onReset: () => void;
}) {
  const fileInput = useRef<HTMLInputElement | null>(null);
  const { preference, setPreference } = useTheme();
  const profile = data.profile;
  const syncLabel =
    syncStatus === 'saved' ? 'guardado' : syncStatus === 'saving' ? 'guardando' : 'requiere atención';

  return (
    <>
      <PageHead
        overline="TU CONFIGURACIÓN"
        title="Tu perfil RB."
        sub="Personaliza tu experiencia y conserva el control sobre tus registros."
      />
      <div className="profile-grid">
        <section className="card profile-card">
          <div className="card-top">
            <span className="section-label">
              <UserRound size={16} /> DATOS PERSONALES
            </span>
            <span className="today-chip">EDITABLE</span>
          </div>
          <label className="form-label">
            Nombre
            <input
              maxLength={40}
              value={profile.name}
              onChange={(e) => onProfileChange({ name: e.target.value })}
            />
          </label>
          <label className="form-label">
            Gimnasio
            <input
              maxLength={80}
              value={profile.gym}
              onChange={(e) => onProfileChange({ gym: e.target.value })}
            />
          </label>
          <label className="form-label">
            Objetivo
            <select
              value={profile.goal}
              onChange={(e) => onProfileChange({ goal: e.target.value as Profile['goal'] })}
            >
              <option value="muscle">Ganar masa muscular</option>
              <option value="strength">Ganar fuerza</option>
              <option value="loss">Perder grasa</option>
              <option value="maintenance">Mantenerme activo</option>
            </select>
          </label>
          <label className="form-label">
            Días por semana
            <select
              value={profile.daysPerWeek}
              onChange={(e) => onProfileChange({ daysPerWeek: Number(e.target.value) })}
            >
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'día' : 'días'}
                </option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Peso corporal (kg, opcional)
            <input
              type="number"
              min="0"
              max="500"
              step="0.1"
              inputMode="decimal"
              placeholder="Sin registrar"
              value={profile.bodyweightKg ?? ''}
              onChange={(e) =>
                onProfileChange({
                  bodyweightKg:
                    e.target.value === '' ? null : Math.max(0, Math.min(500, Number(e.target.value) || 0)),
                })
              }
            />
          </label>
          <label className="form-label">
            Unidad de los pesos
            <select
              value={profile.weightUnit}
              onChange={(e) => onProfileChange({ weightUnit: e.target.value as Profile['weightUnit'] })}
            >
              <option value="kg">Kilogramos (kg)</option>
              <option value="lb">Libras (lb)</option>
            </select>
          </label>
        </section>

        <section className="profile-column">
          <section className="card settings-card">
            <div className="card-top">
              <span className="section-label">
                <Sun size={16} /> APARIENCIA
              </span>
            </div>
            <h3>Elige tu ambiente</h3>
            <p>
              Se guarda en este dispositivo. También puedes cambiarlo desde el botón de la barra superior.
            </p>
            <div className="theme-switch">
              <button
                className={preference === 'dark' ? 'theme-selected' : ''}
                onClick={() => setPreference('dark')}
              >
                <Moon size={18} /> Oscuro
              </button>
              <button
                className={preference === 'light' ? 'theme-selected' : ''}
                onClick={() => setPreference('light')}
              >
                <Sun size={18} /> Claro
              </button>
              <button
                className={preference === 'system' ? 'theme-selected' : ''}
                onClick={() => setPreference('system')}
              >
                <Monitor size={18} /> Sistema
              </button>
            </div>
          </section>

          <section className="card settings-card">
            <div className="card-top">
              <span className="section-label">
                <ShieldCheck size={16} /> TUS DATOS
              </span>
            </div>
            <h3>Respaldo y privacidad</h3>
            <p>
              Las rutinas y los entrenamientos se guardan en tu cuenta. El navegador solo mantiene la sesión
              de acceso, no una copia permanente del progreso. Los respaldos JSON siguen disponibles como
              medida adicional.
            </p>
            <p className="muted">Estado de sincronización: {syncLabel}.</p>
            {hasLegacyData && (
              <button className="secondary-btn" onClick={onImportLegacy}>
                <Upload size={16} /> Importar historial anterior de este navegador
              </button>
            )}
            <div className="settings-buttons">
              <button className="secondary-btn" onClick={onExport}>
                <Download size={17} /> Exportar JSON
              </button>
              <button className="secondary-btn" onClick={() => fileInput.current?.click()}>
                <Upload size={17} /> Importar JSON
              </button>
              <input
                ref={fileInput}
                type="file"
                accept=".json,application/json"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) onImportFile(file);
                  event.target.value = '';
                }}
              />
            </div>
          </section>

          <section className="card settings-card">
            <div className="card-top">
              <span className="section-label">
                <RotateCcw size={16} /> CICLO DE RUTINAS
              </span>
            </div>
            <h3>Cambiar día del ciclo</h3>
            <p>Elige el siguiente día cuando quieras. No se marcan faltas por días de calendario.</p>
            <select
              className="cycle-selector"
              value={data.cycleIndex}
              onChange={(event) => onSkipTo(Number(event.target.value))}
              aria-label="Día del ciclo"
            >
              {data.routines.map((routine, index) => (
                <option key={routine.id} value={index}>
                  Día {index + 1} · {routine.name}
                </option>
              ))}
            </select>
          </section>

          <section className="card settings-card">
            <h3>Cuenta y sincronización</h3>
            <p>
              {email ? (
                <>
                  Sesión iniciada como <strong>{email}</strong>. Puedes continuar desde otro teléfono con la
                  misma cuenta.
                </>
              ) : (
                'Tu información está vinculada a tu correo. Puedes continuar desde otro teléfono con la misma cuenta.'
              )}
            </p>
            <button className="secondary-btn" onClick={onSignOut}>
              <LogOut size={16} /> Cerrar sesión
            </button>
          </section>

          <section className="card settings-card danger-card">
            <h3>Reiniciar datos</h3>
            <p>Reemplaza en la nube tu historial y tus rutinas por los datos iniciales.</p>
            <button className="danger-link" onClick={onReset}>
              <Trash2 size={16} /> Borrar mis datos
            </button>
          </section>
        </section>
      </div>
    </>
  );
}
