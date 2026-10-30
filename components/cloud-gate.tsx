'use client';
import { useState, type FormEvent } from 'react';
import { Cloud, LogIn, Mail } from 'lucide-react';
import { getCloudClient } from '@/lib/cloud';

export default function CloudGate({configured}:{configured:boolean}) {
  const [email,setEmail]=useState('');
  const [busy,setBusy]=useState(false);
  const [sent,setSent]=useState(false);
  const [error,setError]=useState('');
  async function send(event:FormEvent<HTMLFormElement>){
    event.preventDefault(); const db=getCloudClient(); if(!db)return;
    setBusy(true);setError('');
    try {const {error}=await db.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:window.location.origin}});
      if(error)throw error;setSent(true);}
    catch(err){setError(err instanceof Error?err.message:'No se pudo enviar el enlace.');}
    finally{setBusy(false);}
  }
  return <main className="cloud-gate"><section className="card cloud-gate-card"><div className="gate-brand">RB<span>.</span></div><span className="overline">TU ESPACIO FITNESS</span><h1>Tu progreso, contigo.</h1><p>Accede para sincronizar tus entrenamientos y tus ciclos personalizados. Los registros se almacenan en tu cuenta, no como datos permanentes del navegador.</p>
    {!configured?<div className="gate-alert"><Cloud size={20}/><div><strong>Sincronización pendiente de configuración</strong><p>Configura Supabase Auth, ejecuta el esquema SQL y añade las variables públicas de Supabase en Vercel. Hasta entonces el registro está deshabilitado para evitar datos que se puedan perder.</p></div></div>:
      sent?<div className="gate-alert"><Mail size={20}/><div><strong>Revisa tu correo</strong><p>Te enviamos un enlace para entrar a RB. Ábrelo en este dispositivo.</p><button className="text-link" onClick={()=>setSent(false)}>Usar otro correo</button></div></div>:
      <form onSubmit={send}><label className="form-label">Correo electrónico<input type="email" required autoComplete="email" maxLength={254} placeholder="tu@correo.com" value={email} onChange={e=>setEmail(e.target.value)}/></label><button type="submit" className="lime-btn gate-submit" disabled={busy}><LogIn size={17}/>{busy?'Enviando...':'Acceder con enlace al correo'}</button>{error&&<p role="alert" className="gate-error">{error}</p>}</form>}
    <small>Tu cuenta se protege mediante Supabase Auth. Las estadísticas proceden de tus propios registros.</small>
  </section></main>;
}
