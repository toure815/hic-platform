import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { onboardingDB } from "./db";
import type { OnboardingDraft } from "./types";

interface GetDraftResponse {
  draft: OnboardingDraft | null;
}

// Gets the current onboarding draft for the authenticated user.
export const getDraft = api<void, GetDraftResponse>(
  { auth: true, expose: true, method: "GET", path: "/onboarding/draft" },
  async () => {
    const auth = getAuthData()!;
    
    const draft = await onboardingDB.queryRow`
      SELECT id, user_id, step_data, current_step, is_completed, provider_id, created_at, updated_at
      FROM onboarding_drafts 
      WHERE user_id = ${auth.userID}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (!draft) {
      return { draft: null };
    }

    return {
      draft: {
        id: draft.id,
        userId: draft.user_id,
        stepData: draft.step_data,
        currentStep: draft.current_step,
        isCompleted: draft.is_completed,
        providerId: draft.provider_id,
        createdAt: draft.created_at,
        updatedAt: draft.updated_at,
      }
    };
  }
);
