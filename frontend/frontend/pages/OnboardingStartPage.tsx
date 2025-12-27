import { useState } from "react";
import { OnboardingSteps } from "../components/onboarding/OnboardingSteps";
import { OnboardingProgress } from "../components/onboarding/OnboardingProgress";
import type { OnboardingStepData, OnboardingStep } from "../types/onboarding";

const STEPS: OnboardingStep[] = [
  "identify-provider",
  "practice-type",
  "specialty",
  "business-profile",
  "licenses",
  "payers",
  "required-docs",
  "portal-logins",
];

export function OnboardingStartPage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepData, setStepData] = useState<OnboardingStepData>({});

  const handleStepChange = (newStepData: Partial<OnboardingStepData>) => {
    const updatedStepData = { ...stepData, ...newStepData };
    setStepData(updatedStepData);
    // 🚨 Skip backend call for now
  };

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleComplete = () => {
    console.log("Final data (prototype only):", stepData);
  };

  const currentStep = STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === STEPS.length - 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-0">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Provider Credentialing</h1>
        <p className="text-gray-600 mt-1">Complete your credentialing application step by step</p>
      </div>

      <OnboardingProgress steps={STEPS} currentStepIndex={currentStepIndex} />

      <OnboardingSteps
        currentStep={currentStep}
        stepData={stepData}
        onStepChange={handleStepChange}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onComplete={handleComplete}
        canGoNext={true} // add validation later
        canGoPrevious={currentStepIndex > 0}
        isLastStep={isLastStep}
        isLoading={false}
      />
    </div>
  );
}
