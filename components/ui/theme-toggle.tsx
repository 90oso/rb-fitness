'use client';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

/** One-tap dark/light switch; lives in the top bar and on the access screen. */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolved, toggle } = useTheme();
  const next = resolved === 'dark' ? 'claro' : 'oscuro';
  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={toggle}
      aria-label={`Cambiar a tema ${next}`}
      title={`Tema ${next}`}
    >
      {resolved === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
