'use client';
import {
  Activity,
  BarChart3,
  BookOpen,
  ChevronRight,
  Cloud,
  CloudOff,
  Dumbbell,
  Home,
  Settings2,
  UserRound,
} from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';
import type { SyncStatus } from '@/hooks/use-cloud-sync';

export type Tab = 'today' | 'train' | 'progress' | 'library' | 'profile';

export const NAV: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'today', label: 'Hoy', icon: Home },
  { id: 'train', label: 'Entrenar', icon: Dumbbell },
  { id: 'progress', label: 'Progreso', icon: BarChart3 },
  { id: 'library', label: 'Ejercicios', icon: BookOpen },
];

const CRUMB: Record<Tab, string> = {
  today: 'Mi día',
  train: 'Entrenar',
  progress: 'Progreso',
  library: 'Biblioteca',
  profile: 'Mi perfil',
};

export function Sidebar({ tab, onSelect }: { tab: Tab; onSelect: (tab: Tab) => void }) {
  return (
    <aside className="sidebar">
      <div className="brand-xl">
        <div className="brand-icon">
          RB
          <span className="brand-dot" />
        </div>
        <div>
          <div className="brand-title">
            RB<span className="brand-title-dot">.</span>
          </div>
          <div className="brand-caption">FITNESS TRACKER</div>
        </div>
      </div>
      <div className="aside-label">TU ESPACIO</div>
      {NAV.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={`aside-link ${tab === id ? 'selected' : ''}`}
          onClick={() => onSelect(id)}
        >
          <Icon size={19} />
          {label}
          {tab === id && <span className="aside-active-dot" />}
        </button>
      ))}
      <div className="aside-label aside-gap">CONFIGURACIÓN</div>
      <button
        className={`aside-link ${tab === 'profile' ? 'selected' : ''}`}
        onClick={() => onSelect('profile')}
      >
        <Settings2 size={19} /> Perfil y ajustes
      </button>
      <div className="sidebar-bottom">
        <span className="sidebar-icon">
          <Activity size={19} />
        </span>
        <div>
          <strong>Un día a la vez.</strong>
          <small>El progreso se construye.</small>
        </div>
      </div>
    </aside>
  );
}

export function Topbar({
  tab,
  syncStatus,
  syncError,
  inSession,
  onSelect,
}: {
  tab: Tab;
  syncStatus: SyncStatus;
  syncError: string;
  inSession: boolean;
  onSelect: (tab: Tab) => void;
}) {
  const statusLabel =
    syncStatus === 'saved' ? 'EN NUBE' : syncStatus === 'saving' ? 'GUARDANDO...' : 'NO GUARDADO';
  return (
    <header className="topbar">
      <button className="mobile-brand" aria-label="Volver al inicio" onClick={() => onSelect('today')}>
        <span className="mark">RB</span>
        <span className="mobile-brand-text">
          FITNESS <b>•</b>
        </span>
      </button>
      <div className="desktop-crumb">
        <span>RB FITNESS</span>
        <ChevronRight size={15} />
        <strong>{CRUMB[tab]}</strong>
      </div>
      <div className="top-actions">
        <span
          className={`cloud-state ${syncStatus === 'error' ? 'cloud-error' : ''}`}
          title={syncError || 'Sincronización con Supabase'}
        >
          {syncStatus === 'saved' ? <Cloud size={15} /> : <CloudOff size={15} />} {statusLabel}
        </span>
        <span className="activity-pill">
          <span className="blip" /> {inSession ? 'EN SESIÓN' : 'LISTO PARA ENTRENAR'}
        </span>
        <ThemeToggle />
        <button
          className="avatar"
          onClick={() => onSelect('profile')}
          title="Abrir perfil"
          aria-label="Abrir perfil"
        >
          <UserRound size={20} />
        </button>
      </div>
    </header>
  );
}

export function BottomNav({ tab, onSelect }: { tab: Tab; onSelect: (tab: Tab) => void }) {
  return (
    <nav className="bottom-nav">
      {NAV.map(({ id, label, icon: Icon }) => (
        <button key={id} className={tab === id ? 'active' : ''} onClick={() => onSelect(id)}>
          <Icon size={21} strokeWidth={tab === id ? 2.6 : 2} />
          <span>{label}</span>
        </button>
      ))}
      <button className={tab === 'profile' ? 'active' : ''} onClick={() => onSelect('profile')}>
        <UserRound size={21} />
        <span>Perfil</span>
      </button>
    </nav>
  );
}
