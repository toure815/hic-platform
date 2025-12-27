CREATE TABLE onboarding_drafts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  step_data JSONB NOT NULL DEFAULT '{}',
  current_step TEXT NOT NULL DEFAULT 'identify-provider',
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  provider_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_onboarding_drafts_user_id ON onboarding_drafts(user_id);
CREATE INDEX idx_onboarding_drafts_provider_id ON onboarding_drafts(provider_id);

CREATE TABLE uploaded_documents (
  id BIGSERIAL PRIMARY KEY,
  onboarding_draft_id BIGINT NOT NULL REFERENCES onboarding_drafts(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  stored_filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  step_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_uploaded_documents_draft_id ON uploaded_documents(onboarding_draft_id);
CREATE INDEX idx_uploaded_documents_type ON uploaded_documents(document_type);
