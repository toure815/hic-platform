import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { onboardingDB } from "./db";
import { uploadsBucket } from "./storage";
import type { CompleteOnboardingRequest, OnboardingDraft } from "./types";

// Completes the onboarding process and creates the client record.
export const completeOnboarding = api<CompleteOnboardingRequest, OnboardingDraft>(
  { auth: true, expose: true, method: "POST", path: "/onboarding/complete" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Get the existing draft
    const existingDraft = await onboardingDB.queryRow`
      SELECT id, step_data FROM onboarding_drafts 
      WHERE user_id = ${auth.userID} AND is_completed = false
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (!existingDraft) {
      throw APIError.notFound("No active onboarding draft found");
    }

    // Generate a unique provider ID
    const providerId = `PROV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Mark draft as completed and assign provider ID
    const completedDraft = await onboardingDB.queryRow`
      UPDATE onboarding_drafts 
      SET 
        step_data = ${JSON.stringify(req.finalStepData)},
        current_step = 'portal-logins',
        is_completed = true,
        provider_id = ${providerId},
        updated_at = NOW()
      WHERE id = ${existingDraft.id}
      RETURNING id, user_id, step_data, current_step, is_completed, provider_id, created_at, updated_at
    `;

    if (!completedDraft) {
      throw APIError.internal("Failed to complete onboarding");
    }

    // Move uploaded files to the client folder structure
    const uploadedDocs = await onboardingDB.queryAll`
      SELECT stored_filename, original_filename, document_type
      FROM uploaded_documents
      WHERE onboarding_draft_id = ${existingDraft.id}
    `;

    for (const doc of uploadedDocs) {
      try {
        // Download the file from temporary location
        const fileData = await uploadsBucket.download(`temp/${doc.stored_filename}`);
        
        // Upload to client folder
        const clientPath = `Clients/${providerId}/Incoming/${doc.original_filename}`;
        await uploadsBucket.upload(clientPath, fileData);
        
        // Remove temporary file
        await uploadsBucket.remove(`temp/${doc.stored_filename}`);
      } catch (error) {
        console.error(`Failed to move file ${doc.stored_filename}:`, error);
        // Continue with other files even if one fails
      }
    }

    return {
      id: completedDraft.id,
      userId: completedDraft.user_id,
      stepData: completedDraft.step_data,
      currentStep: completedDraft.current_step,
      isCompleted: completedDraft.is_completed,
      providerId: completedDraft.provider_id,
      createdAt: completedDraft.created_at,
      updatedAt: completedDraft.updated_at,
    };
  }
);
