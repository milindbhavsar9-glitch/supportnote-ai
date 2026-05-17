create table if not exists public.legal_policy_versions (
  id uuid primary key default gen_random_uuid(),
  policy_type text not null,
  version text not null,
  effective_date date not null,
  content text,
  created_at timestamptz default now(),
  unique (policy_type, version)
);

create table if not exists public.user_legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  accepted_terms_at timestamptz not null,
  accepted_privacy_at timestamptz not null,
  accepted_data_handling_at timestamptz not null,
  accepted_ai_disclaimer_at timestamptz not null,
  accepted_terms_version text not null,
  accepted_privacy_version text not null,
  accepted_data_handling_version text not null,
  accepted_ai_disclaimer_version text not null,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

alter table public.legal_policy_versions enable row level security;
alter table public.user_legal_acceptances enable row level security;

insert into public.legal_policy_versions (policy_type, version, effective_date, content)
values
  ('terms', '2026-05-17', '2026-05-17', 'Initial Terms of Service placeholder. Obtain Australian legal review before launch.'),
  ('privacy', '2026-05-17', '2026-05-17', 'Initial Privacy Policy placeholder. Obtain Australian privacy/legal review before launch.'),
  ('data_handling', '2026-05-17', '2026-05-17', 'Initial Data Handling Notice placeholder.'),
  ('ai_disclaimer', '2026-05-17', '2026-05-17', 'Initial AI Usage Disclaimer placeholder.')
on conflict (policy_type, version) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'legal_policy_versions'
      and policyname = 'Anyone authenticated can read legal policy versions'
  ) then
    create policy "Anyone authenticated can read legal policy versions" on public.legal_policy_versions
      for select using (auth.uid() is not null);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_legal_acceptances'
      and policyname = 'Users can read own legal acceptances'
  ) then
    create policy "Users can read own legal acceptances" on public.user_legal_acceptances
      for select using (user_id = auth.uid());
  end if;
end $$;
