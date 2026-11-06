'use client';
import { useState, type FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ArrowRight, Cloud, Eye, EyeOff, Mail } from 'lucide-react';
import { AuthBrand, AuthFrame } from '@/components/ui/auth-frame';
import Link from 'next/link';
import { describeAuthError } from '@/lib/auth-errors';
import { readRememberedEmail, rememberEmail } from '@/lib/remembered-email';

type Mode = 'login' | 'signup' | 'reset' | 'update';
const MIN_PASSWORD = 8;

const TITLE: Record<Mode, string> = {
  login: 'Hola de nuevo.',
  signup: 'Crea tu cuenta.',
  reset: 'Recupera tu acceso.',
  update: 'Nueva contraseña.',
};
const ACTION: Record<Mode, string> = {
  login: 'Entrar',
  signup: 'Crear cuenta',
  reset: 'Enviar enlace',
  update: 'Guardar',
};

const redirectHome = () => `${window.location.origin}/`;

/**
 * Access screen. One primary action per mode (Entrar), account creation as a secondary link,
 * the last email used on this device prefilled, and the "new password" step from a recovery link.
 */
export default function AuthScreen({
  client,
  configured,
  recovery = false,
  onRecoveryDone,
  initialNotice = '',
}: {
  client: SupabaseClient | null;
  configured: boolean | null;
  recovery?: boolean;
  onRecoveryDone?: () => void;
  /** One-off message shown above the form, e.g. after deleting the account. */
  initialNotice?: string;
}) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState(() => (typeof window === 'undefined' ? '' : readRememberedEmail()));
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(initialNotice);

  const current: Mode = recovery ? 'update' : mode;
  const remembered = email !== '' && mode === 'login';

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
      setError(`La contraseña necesita al menos ${MIN_PASSWORD} caracteres.`);
      return false;
    }
    if (password !== password2) {
      setError('Las contraseñas no coinciden.');
      return false;
    }
    return true;
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client || busy) return;
    const address = email.trim().toLowerCase();
    if (current === 'login') {
      void run(async () => {
        const { error: err } = await client.auth.signInWithPassword({ email: address, password });
        if (err) throw err;
        rememberEmail(address);
      });
    } else if (current === 'signup') {
      if (!validPassword()) return;
      void run(async () => {
        const { data, error: err } = await client.auth.signUp({
          email: address,
          password,
          options: { emailRedirectTo: redirectHome() },
        });
        if (err) throw err;
        rememberEmail(address);
        if (!data.session) {
          setMode('login');
          setPassword('');
          setPassword2('');
          setNotice('Revisa tu correo y confirma la cuenta para entrar.');
        }
      });
    } else if (current === 'reset') {
      void run(async () => {
        const { error: err } = await client.auth.resetPasswordForEmail(address, {
          redirectTo: redirectHome(),
        });
        if (err) throw err;
        setNotice('Si el correo existe, te enviamos un enlace. Ábrelo en este dispositivo.');
      });
    } else {
      if (!validPassword()) return;
      void run(async () => {
        const { error: err } = await client.auth.updateUser({ password });
        if (err) throw err;
        setPassword('');
        setPassword2('');
        onRecoveryDone?.();
      });
    }
  }

  const passwordField = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    autoComplete: string,
    placeholder?: string,
    autoFocus = false
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
          placeholder={placeholder}
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="field-eye"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </span>
    </label>
  );

  return (
    <AuthFrame>
      <AuthBrand />
      <span className="overline auth-overline">TU ESPACIO FITNESS</span>
      <h1 className="auth-title" key={current}>
        {TITLE[current]}
      </h1>

      {configured === null ? (
        <span className="auth-spinner" aria-label="Cargando" />
      ) : !configured ? (
        <div className="gate-alert">
          <Cloud size={20} />
          <div>
            <strong>Falta configurar Supabase</strong>
            <p>Variables públicas en Vercel, esquema SQL y proveedor Email. Hasta entonces no hay acceso.</p>
          </div>
        </div>
      ) : (
        <>
          <form onSubmit={submit} className="auth-form auth-pane" key={`form-${current}`}>
            {notice && (
              <div className="gate-alert gate-notice" role="status">
                <Mail size={18} />
                <p>{notice}</p>
              </div>
            )}
            {current !== 'update' && (
              <label className="form-label">
                Correo
                <input
                  type="email"
                  required
                  autoComplete="email"
                  maxLength={254}
                  placeholder="tu@correo.com"
                  autoFocus={!remembered}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            )}
            {current === 'login' &&
              passwordField('Contraseña', password, setPassword, 'current-password', undefined, remembered)}
            {(current === 'signup' || current === 'update') && (
              <>
                {passwordField(
                  current === 'update' ? 'Nueva contraseña' : 'Contraseña',
                  password,
                  setPassword,
                  'new-password',
                  `Mínimo ${MIN_PASSWORD} caracteres`,
                  current === 'update'
                )}
                {passwordField('Repite la contraseña', password2, setPassword2, 'new-password')}
              </>
            )}

            <button type="submit" className={`lime-btn gate-submit ${busy ? 'is-busy' : ''}`} disabled={busy}>
              {busy ? (
                <span className="auth-spinner auth-spinner-sm" aria-label="Un momento" />
              ) : (
                <>
                  {ACTION[current]} <ArrowRight size={18} />
                </>
              )}
            </button>
            {error && (
              <p role="alert" className="gate-error">
                {error}
              </p>
            )}
          </form>

          <div className="auth-links">
            {current === 'login' && (
              <>
                <button type="button" className="text-link" onClick={() => switchMode('reset')}>
                  ¿Olvidaste tu contraseña?
                </button>
                <p className="auth-alt">
                  ¿Primera vez en RB?{' '}
                  <button type="button" className="text-link" onClick={() => switchMode('signup')}>
                    Crear cuenta
                  </button>
                </p>
              </>
            )}
            {current === 'signup' && (
              <p className="auth-alt">
                ¿Ya tienes cuenta?{' '}
                <button type="button" className="text-link" onClick={() => switchMode('login')}>
                  Entrar
                </button>
              </p>
            )}
            {current === 'reset' && (
              <button type="button" className="text-link" onClick={() => switchMode('login')}>
                Volver
              </button>
            )}
            <Link href="/privacidad" className="auth-legal">
              Privacidad
            </Link>
          </div>
        </>
      )}
    </AuthFrame>
  );
}
