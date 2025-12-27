import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { onboardingDB } from "./db";
import { uploadsBucket } from "./storage";
import type { UploadedDocument } from "./types";

interface UploadDocumentRequest {
  documentType: string;
  stepName: string;
  filename: string;
  fileData: string; // base64 encoded file data
}

// Uploads a document for the onboarding process.
export const uploadDocument = api<UploadDocumentRequest, UploadedDocument>(
  { auth: true, expose: true, method: "POST", path: "/onboarding/upload" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Get the active draft
    const draft = await onboardingDB.queryRow`
      SELECT id FROM onboarding_drafts 
      WHERE user_id = ${auth.userID} AND is_completed = false
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (!draft) {
      throw APIError.notFound("No active onboarding draft found");
    }

    // Decode the base64 file data
    const fileBuffer = Buffer.from(req.fileData, 'base64');
    const fileSize = fileBuffer.length;
    
    // Generate a unique filename for storage
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const fileExtension = req.filename.split('.').pop() || '';
    const storedFilename = `${timestamp}_${randomId}.${fileExtension}`;
    
    // Upload to temporary storage
    await uploadsBucket.upload(`temp/${storedFilename}`, fileBuffer);
    
    // Record the upload in the database
    const uploadRecord = await onboardingDB.queryRow`
      INSERT INTO uploaded_documents 
      (onboarding_draft_id, document_type, original_filename, stored_filename, file_size, mime_type, step_name)
      VALUES (${draft.id}, ${req.documentType}, ${req.filename}, ${storedFilename}, ${fileSize}, 'application/octet-stream', ${req.stepName})
      RETURNING id, onboarding_draft_id, document_type, original_filename, stored_filename, file_size, mime_type, step_name, created_at
    `;

    if (!uploadRecord) {
      throw APIError.internal("Failed to record document upload");
    }

    return {
      id: uploadRecord.id,
      onboardingDraftId: uploadRecord.onboarding_draft_id,
      documentType: uploadRecord.document_type,
      originalFilename: uploadRecord.original_filename,
      storedFilename: uploadRecord.stored_filename,
      fileSize: uploadRecord.file_size,
      mimeType: uploadRecord.mime_type,
      stepName: uploadRecord.step_name,
      createdAt: uploadRecord.created_at,
    };
  }
);
