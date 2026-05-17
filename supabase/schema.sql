create extension if not exists "pgcrypto";

create type app_role as enum ('solo_user', 'support_worker', 'team_leader', 'company_admin');
create type member_status as enum ('invited', 'active', 'suspended');
create type report_status as enum ('draft', 'submitted', 'completed', 'reviewed', 'late');
create type report_type as enum ('shift', 'incident', 'general');
create type plan_id as enum ('free_trial', 'solo_worker', 'small_team');

create table public.legal_policy_versions (
  id uuid primary key default gen_random_uuid(),
  policy_type text not null,
  version text not null,
  effective_date date not null,
  content text,
  created_at timestamptz default now(),
  unique (policy_type, version)
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_name text,
  abn text,
  contact_email text,
  contact_phone text,
  billing_email text,
  plan plan_id default 'free_trial',
  stripe_customer_id text,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  role app_role not null default 'solo_user',
  company_id uuid references public.companies(id),
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.companies
  add constraint companies_created_by_fkey foreign key (created_by) references public.users(id);

create table public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  role app_role not null,
  status member_status default 'active',
  invited_by uuid references public.users(id),
  joined_at timestamptz,
  created_at timestamptz default now(),
  unique (company_id, user_id)
);

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  created_by uuid references public.users(id),
  display_name text not null,
  reference_code text,
  notes text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.shift_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  company_id uuid references public.companies(id),
  participant_id uuid references public.participants(id),
  participant_name text not null,
  staff_name text not null,
  report_date date not null,
  shift_type text,
  start_time time,
  end_time time,
  status report_status default 'draft',
  incident_flag boolean default false,
  medication_issue_flag boolean default false,
  behaviour_issue_flag boolean default false,
  line_of_sight_issue_flag boolean default false,
  supervisor_notified boolean,
  form_data jsonb not null default '{}',
  final_report text,
  signature text,
  time_completed timestamptz,
  submitted_at timestamptz,
  completed_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.incident_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  company_id uuid references public.companies(id),
  participant_id uuid references public.participants(id),
  participant_name text not null,
  staff_name text not null,
  incident_date date not null,
  incident_time time,
  location text,
  incident_type text,
  status report_status default 'draft',
  supervisor_notified boolean,
  family_guardian_notified text,
  emergency_services_contacted boolean,
  injury_flag boolean default false,
  line_of_sight_issue_flag boolean default false,
  form_data jsonb not null default '{}',
  final_report text,
  signature text,
  time_completed timestamptz,
  submitted_at timestamptz,
  completed_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.report_comments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  report_id uuid not null,
  report_type report_type not null,
  user_id uuid references public.users(id),
  comment text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.report_audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id),
  report_id uuid not null,
  report_type report_type not null,
  user_id uuid references public.users(id),
  action text not null,
  previous_status report_status,
  new_status report_status,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id),
  user_id uuid references public.users(id),
  stripe_customer_id text,
  stripe_subscription_id text,
  plan plan_id not null default 'free_trial',
  status text not null default 'trialing',
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_start timestamptz,
  trial_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.usage_limits (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id),
  user_id uuid references public.users(id),
  period_start date not null,
  period_end date not null,
  shift_reports_used int default 0,
  incident_reports_used int default 0,
  ai_generations_used int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.ai_generation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  company_id uuid references public.companies(id),
  report_id uuid,
  report_type report_type default 'general',
  ai_action text not null,
  input_tokens int,
  output_tokens int,
  model text,
  created_at timestamptz default now()
);

create table public.billing_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text unique not null,
  event_type text not null,
  company_id uuid references public.companies(id),
  user_id uuid references public.users(id),
  payload jsonb,
  processed boolean default false,
  created_at timestamptz default now()
);

create table public.user_legal_acceptances (
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

insert into public.legal_policy_versions (policy_type, version, effective_date, content)
values
  ('terms', '2026-05-17', '2026-05-17', 'Initial Terms of Service placeholder. Obtain Australian legal review before launch.'),
  ('privacy', '2026-05-17', '2026-05-17', 'Initial Privacy Policy placeholder. Obtain Australian privacy/legal review before launch.'),
  ('data_handling', '2026-05-17', '2026-05-17', 'Initial Data Handling Notice placeholder.'),
  ('ai_disclaimer', '2026-05-17', '2026-05-17', 'Initial AI Usage Disclaimer placeholder.')
on conflict (policy_type, version) do nothing;

create index shift_reports_user_idx on public.shift_reports(user_id);
create index shift_reports_company_idx on public.shift_reports(company_id);
create index shift_reports_flags_idx on public.shift_reports(status, incident_flag, medication_issue_flag, line_of_sight_issue_flag);
create index incident_reports_user_idx on public.incident_reports(user_id);
create index incident_reports_company_idx on public.incident_reports(company_id);
create index incident_reports_flags_idx on public.incident_reports(status, incident_type, injury_flag, line_of_sight_issue_flag);

alter table public.companies enable row level security;
alter table public.users enable row level security;
alter table public.company_members enable row level security;
alter table public.participants enable row level security;
alter table public.shift_reports enable row level security;
alter table public.incident_reports enable row level security;
alter table public.report_comments enable row level security;
alter table public.report_audit_logs enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_limits enable row level security;
alter table public.ai_generation_logs enable row level security;
alter table public.billing_events enable row level security;
alter table public.legal_policy_versions enable row level security;
alter table public.user_legal_acceptances enable row level security;

create or replace function public.is_company_member(target_company_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.company_members
    where company_id = target_company_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

create or replace function public.has_company_role(target_company_id uuid, allowed_roles app_role[])
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.company_members
    where company_id = target_company_id
      and user_id = auth.uid()
      and status = 'active'
      and role = any(allowed_roles)
  );
$$;

create policy "Users can read own profile" on public.users
  for select using (id = auth.uid());

create policy "Users can update own profile" on public.users
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "Company members can read company" on public.companies
  for select using (public.is_company_member(id) or created_by = auth.uid());

create policy "Company admins can update company" on public.companies
  for update using (public.has_company_role(id, array['company_admin']::app_role[]));

create policy "Members can read company members" on public.company_members
  for select using (public.is_company_member(company_id));

create policy "Admins can manage company members" on public.company_members
  for all using (public.has_company_role(company_id, array['company_admin']::app_role[]));

create policy "Members can read participants" on public.participants
  for select using (public.is_company_member(company_id) or created_by = auth.uid());

create policy "Team leaders and admins manage participants" on public.participants
  for all using (public.has_company_role(company_id, array['team_leader','company_admin']::app_role[]));

create policy "Workers read own shift reports or leaders read company" on public.shift_reports
  for select using (
    user_id = auth.uid()
    or public.has_company_role(company_id, array['team_leader','company_admin']::app_role[])
  );

create policy "Workers create own shift reports" on public.shift_reports
  for insert with check (user_id = auth.uid());

create policy "Workers update own shift reports before review" on public.shift_reports
  for update using (
    user_id = auth.uid() or public.has_company_role(company_id, array['team_leader','company_admin']::app_role[])
  );

create policy "Workers read own incident reports or leaders read company" on public.incident_reports
  for select using (
    user_id = auth.uid()
    or public.has_company_role(company_id, array['team_leader','company_admin']::app_role[])
  );

create policy "Workers create own incident reports" on public.incident_reports
  for insert with check (user_id = auth.uid());

create policy "Workers update own incident reports before review" on public.incident_reports
  for update using (
    user_id = auth.uid() or public.has_company_role(company_id, array['team_leader','company_admin']::app_role[])
  );

create policy "Leaders manage report comments" on public.report_comments
  for all using (public.has_company_role(company_id, array['team_leader','company_admin']::app_role[]));

create policy "Company members can read audit logs" on public.report_audit_logs
  for select using (public.is_company_member(company_id));

create policy "Users can read own subscription" on public.subscriptions
  for select using (
    user_id = auth.uid() or public.has_company_role(company_id, array['company_admin']::app_role[])
  );

create policy "Users can read own usage" on public.usage_limits
  for select using (
    user_id = auth.uid() or public.has_company_role(company_id, array['company_admin']::app_role[])
  );

create policy "Users can read own AI logs" on public.ai_generation_logs
  for select using (
    user_id = auth.uid() or public.has_company_role(company_id, array['company_admin']::app_role[])
  );

create policy "Anyone authenticated can read legal policy versions" on public.legal_policy_versions
  for select using (auth.uid() is not null);

create policy "Users can read own legal acceptances" on public.user_legal_acceptances
  for select using (user_id = auth.uid());
