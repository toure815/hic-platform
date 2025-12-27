import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { onboardingDB } from "./db";
import type { SaveDraftRequest, OnboardingDraft } from "./types";

// Saves or updates the onboarding draft for the authenticated user.
export const saveDraft = api<SaveDraftRequest, OnboardingDraft>(
  { auth: true, expose: true, method: "POST", path: "/onboarding/draft" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Check if a draft already exists
    const existingDraft = await onboardingDB.queryRow`
      SELECT id FROM onboarding_drafts 
      WHERE user_id = ${auth.userID} AND is_completed = false
      ORDER BY created_at DESC
      LIMIT 1
    `;

    let draft;
    
    if (existingDraft) {
      // Update existing draft
      draft = await onboardingDB.queryRow`
        UPDATE onboarding_drafts 
        SET 
          step_data = ${JSON.stringify(req.stepData)},
          current_step = ${req.currentStep},
          updated_at = NOW()
        WHERE id = ${existingDraft.id}
        RETURNING id, user_id, step_data, current_step, is_completed, provider_id, created_at, updated_at
      `;
    } else {
      // Create new draft
      draft = await onboardingDB.queryRow`
        INSERT INTO onboarding_drafts (user_id, step_data, current_step)
        VALUES (${auth.userID}, ${JSON.stringify(req.stepData)}, ${req.currentStep})
        RETURNING id, user_id, step_data, current_step, is_completed, provider_id, created_at, updated_at
      `;
    }

    if (!draft) {
      throw new Error("Failed to save draft");
    }

    return {
      id: draft.id,
      userId: draft.user_id,
      stepData: draft.step_data,
      currentStep: draft.current_step,
      isCompleted: draft.is_completed,
      providerId: draft.provider_id,
      createdAt: draft.created_at,
      updatedAt: draft.updated_at,
    };
  }
);
