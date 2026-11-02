'use client';
import type { ComponentType } from 'react';

export type IconComponent = ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;

export function PageHead({ overline, title, sub }: { overline: string; title: string; sub: string }) {
  return (
    <div className="page-head">
      <span className="overline">{overline}</span>
      <h1>{title}</h1>
      <p>{sub}</p>
    </div>
  );
}

export function Empty({ icon: Icon, title, text }: { icon: IconComponent; title: string; text: string }) {
  return (
    <div className="empty">
      <span>
        <Icon size={26} />
      </span>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

export function Stat({
  icon: Icon,
  label,
  value,
  desc,
}: {
  icon: IconComponent;
  label: string;
  value: string;
  desc: string;
}) {
  return (
    <div className="card stat-tile">
      <span>
        <Icon size={21} />
      </span>
      <small>{label}</small>
      <strong>{value}</strong>
      <em>{desc}</em>
    </div>
  );
}
