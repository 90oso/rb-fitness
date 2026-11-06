'use client';
import Link from 'next/link';
import {
  Download,
  LogOut,
  Monitor,
  Moon,
  RotateCcw,
  ShieldCheck,
  Sun,
  Trash2,
  UserRound,
  UserX,
} from 'lucide-react';
import { PageHead } from '@/components/ui/bits';
import type { SyncStatus } from '@/hooks/use-cloud-sync';
import { useTheme } from '@/hooks/use-theme';
import type { AppData, Profile } from '@/lib/types';

export default function ProfileView({
  data,
  email,
  syncStatus,
  onProfileChange,
  onSkipTo,
  onExport,
  onSignOut,
  onReset,
  onDeleteAccount,
}: {
  data: AppData;
  email: string | null;
  syncStatus: SyncStatus;
  onProfileChange: (patch: Partial<Profile>) => void;
  onSkipTo: (index: number) => void;
  onExport: () => void;
  onSignOut: () => void;
  onReset: () => void;
  onDeleteAccount: () => void;
}) {
  const { preference, setPreference } = useTheme();
  const profile = data.profile;
  const syncLabel =
    syncStatus === 'saved' ? 'Todo guardado' : syncStatus === 'saving' ? 'Guardando…' : 'Sin guardar';

  return (
    <>
      <PageHead
        overline="TU CONFIGURACIÓN"
        title="Tu perfil RB."
        sub="Ajusta la app a tu forma de entrenar."
      />
      <div className="profile-grid">
        <section className="card profile-card">
          <div className="card-top">
            <span className="section-label">
              <UserRound size={16} /> DATOS PERSONALES
            </span>
            <span className="today-chip">{syncLabel.toUpperCase()}</span>
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
            <div className="theme-switch">
              <button
                className={preference === 'light' ? 'theme-selected' : ''}
                onClick={() => setPreference('light')}
              >
                <Sun size={18} /> Claro
              </button>
              <button
                className={preference === 'dark' ? 'theme-selected' : ''}
                onClick={() => setPreference('dark')}
              >
                <Moon size={18} /> Oscuro
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
                <RotateCcw size={16} /> CICLO
              </span>
            </div>
            <h2>Siguiente día del ciclo</h2>
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
            <h2>Cuenta</h2>
            {email && <p className="account-email">{email}</p>}
            <div className="settings-buttons">
              <button className="secondary-btn" onClick={onSignOut}>
                <LogOut size={16} /> Cerrar sesión
              </button>
            </div>
            <div className="account-links">
              <button className="text-link" onClick={onExport}>
                <Download size={15} /> Descargar una copia de mis datos
              </button>
              <Link className="text-link" href="/privacidad">
                <ShieldCheck size={15} /> Política de privacidad
              </Link>
            </div>
          </section>

          <section className="card settings-card danger-card">
            <h2>Borrar mis datos</h2>
            <p>Reinicia tu historial o elimina la cuenta por completo. No se puede deshacer.</p>
            <div className="danger-actions">
              <button className="danger-link" onClick={onReset}>
                <Trash2 size={16} /> Borrar historial y rutinas
              </button>
              <button className="danger-link" onClick={onDeleteAccount}>
                <UserX size={16} /> Eliminar mi cuenta
              </button>
            </div>
          </section>
        </section>
      </div>
    </>
  );
}
