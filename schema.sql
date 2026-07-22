-- Design Thinking Canvas — team collaboration backend
-- Run once against a fresh Postgres database (Neon via `vercel install neon`, or any Postgres).
-- Safe to re-run: every statement is idempotent.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  join_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Project',
  challenge TEXT NOT NULL DEFAULT '',
  foundations JSONB NOT NULL DEFAULT '{"challenge":"","themes":""}'::jsonb,
  selection JSONB NOT NULL DEFAULT '{}'::jsonb,
  brief JSONB NOT NULL DEFAULT '{}'::jsonb,
  eval_plan JSONB NOT NULL DEFAULT '[]'::jsonb,
  approval_rule TEXT NOT NULL DEFAULT 'leader' CHECK (approval_rule IN ('leader', 'consensus')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  secret TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_members_project ON members(project_id);

-- Stage cards AND tool-worksheet entries live in one append-only table.
-- tool_slug is null for stage cards, set for tool-worksheet entries.
CREATE TABLE IF NOT EXISTS entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,
  tool_slug TEXT,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT '',
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_entries_project_phase ON entries(project_id, phase);

CREATE TABLE IF NOT EXISTS phase_status (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'collecting' CHECK (status IN ('collecting', 'consolidating', 'locked')),
  PRIMARY KEY (project_id, phase)
);

CREATE TABLE IF NOT EXISTS readiness (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  ready BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (project_id, phase, member_id)
);

CREATE TABLE IF NOT EXISTS consolidations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'rejected')),
  text TEXT NOT NULL,
  source_entry_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES members(id),
  approvals JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consolidations_project_phase ON consolidations(project_id, phase);
