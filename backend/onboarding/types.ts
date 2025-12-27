export interface OnboardingDraft {
  id: number;
  userId: number;
  stepData: OnboardingStepData;
  currentStep: OnboardingStep;
  isCompleted: boolean;
  providerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OnboardingStep = 
  | "identify-provider"
  | "practice-type" 
  | "specialty"
  | "business-profile"
  | "licenses"
  | "payers"
  | "required-docs"
  | "portal-logins";

export interface OnboardingStepData {
  identifyProvider?: {
    type: "new" | "existing";
    existingProviderId?: string;
  };
  practiceType?: {
    type: "facility" | "group";
  };
  specialty?: {
    type: "primary-care" | "behavioral";
  };
  businessProfile?: {
    businessName: string;
    providerName: string;
    ssn: string;
    dateOfBirth: string;
    primaryAddress: string;
    additionalLocations: string[];
    einNumber: string;
    npiNumber: string;
    groupNpiNumber?: string;
    countyOfBusiness: string;
    businessPhoneNumber: string;
    businessEmail: string;
    businessFaxNumber?: string;
    caqh: string;
    hoursOfOperation: string;
    businessWebsite?: string;
  };
  licenses?: {
    licenses: Array<{
      state: string;
      licenseNumber: string;
      expirationDate: string;
    }>;
  };
  requiredDocs?: {
    uploadedDocs: Array<{
      type: string;
      filename: string;
      uploaded: boolean;
    }>;
  };
  payers?: {
    medicare: boolean;
    medicaid: boolean;
    commercialPayers: string[];
  };
  portalLogins?: {
    logins: Array<{
      platform: string;
      username: string;
      password: string;
    }>;
  };
}

export interface UploadedDocument {
  id: number;
  onboardingDraftId: number;
  documentType: string;
  originalFilename: string;
  storedFilename: string;
  fileSize: number;
  mimeType: string;
  stepName: string;
  createdAt: Date;
}

export interface SaveDraftRequest {
  stepData: OnboardingStepData;
  currentStep: OnboardingStep;
}

export interface CompleteOnboardingRequest {
  finalStepData: OnboardingStepData;
}
