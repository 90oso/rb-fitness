'use client';
import { useState, type FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Cloud, Eye, EyeOff, KeyRound, LogIn, Mail, UserPlus } from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';
import { describeAuthError } from '@/lib/auth-errors';

type Mode = 'login' | 'signup' | 'reset' | 'update';
const MIN_PASSWORD = 8;

function redirectHome() {
  return `${window.location.origin}/`;
}

/**
 * Access screen: email + password, account creation, password recovery and the "new password" step
 * reached from a recovery link. Same visual language as the app (tokens, cards, lime button).
 */
export default function AuthScreen({
  client,
  configured,
  recovery = false,
  onRecoveryDone,
}: {
  client: SupabaseClient | null;
  configured: boolean | null;
  recovery?: boolean;
  onRecoveryDone?: () => void;
}) {
  const [mode, setMode] = useState<Mode>(recovery ? 'update' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const effectiveMode: Mode = recovery ? 'update' : mode;

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
    setNotice('');
    setPassword('');
    setPassword2('');
  };

  async function run(action: () => Promise<void>) {
    if (!client) return;
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  function validPassword(): boolean {
    if (password.length < MIN_PASSWORD) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`);
      return false;
    }
    if ((effectiveMode === 'signup' || effectiveMode === 'update') && password !== password2) {
      setError('Las contraseñas no coinciden.');
      return false;
    }
    return true;
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client) return;
    const address = email.trim();
    if (effectiveMode === 'login') {
      void run(async () => {
        const { error: err } = await client.auth.signInWithPassword({ email: address, password });
        if (err) throw err;
      });
    } else if (effectiveMode === 'signup') {
      if (!validPassword()) return;
      void run(async () => {
        const { data, error: err } = await client.auth.signUp({
          email: address,
          password,
          options: { emailRedirectTo: redirectHome() },
        });
        if (err) throw err;
        if (!data.session) {
          setNotice(
            'Cuenta creada. Te enviamos un correo para confirmarla; ábrelo en este dispositivo y luego entra.'
          );
          setMode('login');
          setPassword('');
          setPassword2('');
        }
      });
    } else if (effectiveMode === 'reset') {
      void run(async () => {
        const { error: err } = await client.auth.resetPasswordForEmail(address, {
          redirectTo: redirectHome(),
        });
        if (err) throw err;
        setNotice(
          'Si ese correo tiene cuenta, recibirás un enlace para crear una nueva contraseña. Ábrelo en este dispositivo.'
        );
      });
    } else {
      if (!validPassword()) return;
      void run(async () => {
        const { error: err } = await client.auth.updateUser({ password });
        if (err) throw err;
        setNotice('Contraseña actualizada. Ya estás dentro.');
        setPassword('');
        setPassword2('');
        onRecoveryDone?.();
      });
    }
  }

  const titles: Record<Mode, { title: string; sub: string }> = {
    login: {
      title: 'Tu progreso, contigo.',
      sub: 'Entra para sincronizar tus entrenamientos y tus ciclos personalizados.',
    },
    signup: {
      title: 'Crea tu cuenta RB.',
      sub: 'Tus rutinas y tu historial quedan en tu cuenta, disponibles en cualquier dispositivo.',
    },
    reset: {
      title: 'Recupera tu acceso.',
      sub: 'Te enviamos un enlace al correo para crear una nueva contraseña.',
    },
    update: { title: 'Nueva contraseña.', sub: 'Elige una contraseña nueva para tu cuenta RB.' },
  };
  const copy = titles[effectiveMode];

  const passwordField = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    autoComplete: string
  ) => (
    <label className="form-label">
      {label}
      <span className="field-row">
        <input
          type={showPassword ? 'text' : 'password'}
          required
          minLength={MIN_PASSWORD}
          maxLength={72}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="field-eye"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </span>
    </label>
  );

  return (
    <main className="auth-screen">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <section className="card auth-card">
        <div className="auth-top">
          <div className="auth-brand">
            RB<span>.</span>
          </div>
          <ThemeToggle />
        </div>
        <span className="overline">TU ESPACIO FITNESS</span>
        <h1>{copy.title}</h1>
        <p className="auth-sub">{copy.sub}</p>

        {configured === null ? (
          <p className="muted">Iniciando RB...</p>
        ) : !configured ? (
          <div className="gate-alert">
            <Cloud size={20} />
            <div>
              <strong>Sincronización pendiente de configuración</strong>
              <p>
                Configura Supabase Auth, ejecuta el esquema SQL y añade las variables públicas de Supabase en
                Vercel. Hasta entonces el acceso está deshabilitado para evitar datos que se puedan perder.
              </p>
            </div>
          </div>
        ) : (
          <>
            {effectiveMode !== 'update' && (
              <div className="segmented" role="tablist" aria-label="Entrar o crear cuenta">
                <button
                  type="button"
                  role="tab"
                  aria-selected={effectiveMode === 'login' || effectiveMode === 'reset'}
                  className={effectiveMode === 'login' || effectiveMode === 'reset' ? 'segment-selected' : ''}
                  onClick={() => switchMode('login')}
                >
                  <LogIn size={16} /> Entrar
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={effectiveMode === 'signup'}
                  className={effectiveMode === 'signup' ? 'segment-selected' : ''}
                  onClick={() => switchMode('signup')}
                >
                  <UserPlus size={16} /> Crear cuenta
                </button>
              </div>
            )}

            {notice && (
              <div className="gate-alert gate-notice" role="status">
                <Mail size={20} />
                <p>{notice}</p>
              </div>
            )}

            <form onSubmit={submit} className="auth-form">
              {effectiveMode !== 'update' && (
                <label className="form-label">
                  Correo electrónico
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    maxLength={254}
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
              )}
              {effectiveMode === 'login' &&
                passwordField('Contraseña', password, setPassword, 'current-password')}
              {(effectiveMode === 'signup' || effectiveMode === 'update') && (
                <>
                  {passwordField(
                    effectiveMode === 'update' ? 'Nueva contraseña' : 'Contraseña',
                    password,
                    setPassword,
                    'new-password'
                  )}
                  {passwordField('Repite la contraseña', password2, setPassword2, 'new-password')}
                  <small className="auth-hint">Mínimo {MIN_PASSWORD} caracteres.</small>
                </>
              )}

              <button type="submit" className="lime-btn gate-submit" disabled={busy}>
                {effectiveMode === 'login' && <LogIn size={17} />}
                {effectiveMode === 'signup' && <UserPlus size={17} />}
                {(effectiveMode === 'reset' || effectiveMode === 'update') && <KeyRound size={17} />}
                {busy
                  ? 'Un momento...'
                  : effectiveMode === 'login'
                    ? 'Entrar'
                    : effectiveMode === 'signup'
                      ? 'Crear cuenta'
                      : effectiveMode === 'reset'
                        ? 'Enviar enlace'
                        : 'Guardar contraseña'}
              </button>
              {error && (
                <p role="alert" className="gate-error">
                  {error}
                </p>
              )}
            </form>

            <div className="auth-links">
              {effectiveMode === 'login' && (
                <button type="button" className="text-link" onClick={() => switchMode('reset')}>
                  ¿Olvidaste tu contraseña?
                </button>
              )}
              {effectiveMode === 'reset' && (
                <button type="button" className="text-link" onClick={() => switchMode('login')}>
                  Volver a entrar
                </button>
              )}
            </div>
            <small className="auth-foot">
              Seguirás conectado en este dispositivo hasta que cierres sesión. Tu cuenta se protege mediante
              Supabase Auth.
            </small>
          </>
        )}
      </section>
    </main>
  );
}
