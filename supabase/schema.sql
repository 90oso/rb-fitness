-- RB Fitness 0.3 — ejecutar en Supabase SQL Editor.
-- Datos por usuario; Supabase Auth identifica a quien realiza cada operación.
create table if not exists public.rb_user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null,
  revision bigint not null default 1,
  updated_at timestamptz not null default now()
);
alter table public.rb_user_data add column if not exists revision bigint not null default 1;
alter table public.rb_user_data enable row level security;
-- La policy es idempotente, compatible con el esquema inicial incluido en 0.2.
drop policy if exists "RB users own their fitness data" on public.rb_user_data;
create policy "RB users own their fitness data" on public.rb_user_data
  for all to authenticated using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
revoke all on public.rb_user_data from anon;
grant select, insert, update, delete on public.rb_user_data to authenticated;

-- Control de concurrencia optimista: no sobreescribir cambios realizados desde otro dispositivo.
create or replace function public.rb_save_state(expected_revision bigint, new_payload jsonb)
returns bigint language plpgsql security invoker set search_path=public as $$
declare v_revision bigint;
begin
  if auth.uid() is null then raise exception 'Sesión requerida' using errcode='42501'; end if;
  if jsonb_typeof(new_payload) <> 'object'
     or jsonb_typeof(new_payload->'routines') <> 'array'
     or jsonb_typeof(new_payload->'workouts') <> 'array'
     or (new_payload->>'version') <> '1' then
     raise exception 'Formato RB inválido' using errcode='22023';
  end if;
  if pg_column_size(new_payload)>5000000 then
    raise exception 'El respaldo excede el máximo de 5 MB' using errcode='22023';
  end if;
  if expected_revision=0 then
    insert into public.rb_user_data (user_id,payload,revision)
      values(auth.uid(),new_payload,1)
      on conflict(user_id) do nothing
      returning revision into v_revision;
  else
    update public.rb_user_data
      set payload=new_payload,revision=revision+1,updated_at=now()
      where user_id=auth.uid() and revision=expected_revision
      returning revision into v_revision;
  end if;
  if v_revision is null then raise exception 'Conflicto de sincronización' using errcode='40001'; end if;
  return v_revision;
end;
$$;
revoke all on function public.rb_save_state(bigint,jsonb) from public,anon;
grant execute on function public.rb_save_state(bigint,jsonb) to authenticated;

-- Eliminación de cuenta (requisito de Google Play y App Store): la persona autenticada borra su propio
-- usuario de Auth; rb_user_data se elimina en cascada. SECURITY DEFINER porque auth.users no es accesible
-- para el rol authenticated. Solo puede borrarse a sí misma (auth.uid()).
create or replace function public.rb_delete_account()
returns void language plpgsql security definer set search_path=public,auth as $$
begin
  if auth.uid() is null then raise exception 'Sesión requerida' using errcode='42501'; end if;
  delete from auth.users where id=auth.uid();
end;
$$;
revoke all on function public.rb_delete_account() from public,anon;
grant execute on function public.rb_delete_account() to authenticated;
