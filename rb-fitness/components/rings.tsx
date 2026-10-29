'use client';
import type { CSSProperties } from 'react';
export default function Rings({values,center='SEMANA'}:{values:{label:string; current:number;goal:number;color:string}[];center?:string}) {
  return <div className="rings-wrap">
    <svg className="rings-svg" viewBox="0 0 154 154" role="img" aria-label={values.map(v=>`${v.label}: ${v.current} de ${v.goal}`).join(', ')}>
      <g transform="rotate(-90 77 77)">{values.map((v,i)=>{
        const radius=66-i*17; const c=2*Math.PI*radius;
        return <g key={v.label}><circle cx="77" cy="77" r={radius} stroke="var(--ring-track)" strokeWidth="8" fill="none"/>
        <circle cx="77" cy="77" r={radius} stroke={v.color} strokeLinecap="round" strokeWidth="8" fill="none" strokeDasharray={c} strokeDashoffset={c*(1-Math.max(0,Math.min(1,v.goal?v.current/v.goal:0)))} style={{transition:'stroke-dashoffset .6s ease'} as CSSProperties}/></g>;
      })}</g>
    </svg>
    <div className="ring-center"><strong>{values[0]?.goal ? Math.round(values[0].current/values[0].goal*100) : 0}%</strong><span>{center}</span></div>
  </div>;
}
