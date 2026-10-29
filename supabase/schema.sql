-- RB Fitness: esquema propuesto para una futura sincronización multiusuario.
-- La versión 0.1 no se conecta aún a Supabase ni crea cuentas.
-- Ejecutar solo después de integrar Supabase Auth en una fase posterior.
create table if not exists public.rb_user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.rb_user_data enable row level security;
create policy "RB users own their fitness data" on public.rb_user_data
  for all to authenticated using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
