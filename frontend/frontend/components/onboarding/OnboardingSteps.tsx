import { IdentifyProviderStep } from "./steps/IdentifyProviderStep";
import { PracticeTypeStep } from "./steps/PracticeTypeStep";
import { SpecialtyStep } from "./steps/SpecialtyStep";
import { BusinessProfileStep } from "./steps/BusinessProfileStep";
import { LicensesStep } from "./steps/LicensesStep";
import { RequiredDocsStep } from "./steps/RequiredDocsStep";
import { PayersStep } from "./steps/PayersStep";
import { PortalLoginsStep } from "./steps/PortalLoginsStep";
import type { OnboardingStep, OnboardingStepData } from "../../types/onboarding";

interface OnboardingStepsProps {
  currentStep: OnboardingStep;
  stepData: OnboardingStepData;
  onStepChange: (data: Partial<OnboardingStepData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  onComplete: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLastStep: boolean;
  isLoading: boolean;
}

export function OnboardingSteps({
  currentStep,
  stepData,
  onStepChange,
  onNext,
  onPrevious,
  onComplete,
  canGoNext,
  canGoPrevious,
  isLastStep,
  isLoading,
}: OnboardingStepsProps) {
  const commonProps = {
    onNext,
    onPrevious,
    onComplete,
    canGoNext,
    canGoPrevious,
    isLastStep,
    isLoading,
  };

  switch (currentStep) {
    case "identify-provider":
      return (
        <IdentifyProviderStep
          data={stepData.identifyProvider}
          onChange={(data) => onStepChange({ identifyProvider: data })}
          {...commonProps}
        />
      );
    case "practice-type":
      return (
        <PracticeTypeStep
          data={stepData.practiceType}
          onChange={(data) => onStepChange({ practiceType: data })}
          {...commonProps}
        />
      );
    case "specialty":
      return (
        <SpecialtyStep
          data={stepData.specialty}
          onChange={(data) => onStepChange({ specialty: data })}
          {...commonProps}
        />
      );
    case "business-profile":
      return (
        <BusinessProfileStep
          data={stepData.businessProfile}
          onChange={(data) => onStepChange({ businessProfile: data })}
          {...commonProps}
        />
      );
    case "licenses":
      return (
        <LicensesStep
          data={stepData.licenses}
          onChange={(data) => onStepChange({ licenses: data })}
          {...commonProps}
        />
      );
    case "required-docs":
      return (
        <RequiredDocsStep
          data={stepData.requiredDocs}
          onChange={(data) => onStepChange({ requiredDocs: data })}
          stepData={stepData}
          {...commonProps}
        />
      );
    case "payers":
      return (
        <PayersStep
          data={stepData.payers}
          onChange={(data) => onStepChange({ payers: data })}
          {...commonProps}
        />
      );
    case "portal-logins":
      return (
        <PortalLoginsStep
          data={stepData.portalLogins}
          onChange={(data) => onStepChange({ portalLogins: data })}
          {...commonProps}
        />
      );
    default:
      return null;
  }
}
