'use client';
import type { ReactNode } from 'react';
import ThemeToggle from '@/components/ui/theme-toggle';

/** Full-screen stage shared by the access screen and the loading states: drifting color blobs + a rising card. */
export function AuthFrame({ children, tight = false }: { children: ReactNode; tight?: boolean }) {
  return (
    <main className="auth-screen">
      <div className="auth-blob auth-blob-1" aria-hidden="true" />
      <div className="auth-blob auth-blob-2" aria-hidden="true" />
      <div className="auth-blob auth-blob-3" aria-hidden="true" />
      <section className={`auth-card ${tight ? 'auth-card-tight' : ''}`}>{children}</section>
    </main>
  );
}

export function AuthBrand({ withToggle = true }: { withToggle?: boolean }) {
  return (
    <header className="auth-top">
      <div className="auth-brand" aria-label="RB Fitness">
        RB
        <span />
      </div>
      {withToggle && <ThemeToggle />}
    </header>
  );
}

/** Brand + a short line + optional actions, used while the app boots or loads the account. */
export function AuthLoading({
  title,
  detail,
  pulse = true,
  children,
}: {
  title: string;
  detail?: string;
  pulse?: boolean;
  children?: ReactNode;
}) {
  return (
    <AuthFrame tight>
      <AuthBrand withToggle={false} />
      <div className="auth-loading">
        {pulse && <span className="auth-spinner" aria-hidden="true" />}
        <h1 className="auth-title auth-title-sm">{title}</h1>
        {detail && <p className="auth-detail">{detail}</p>}
        {children}
      </div>
    </AuthFrame>
  );
}
