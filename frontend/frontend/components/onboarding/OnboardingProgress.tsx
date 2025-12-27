import { Check } from "lucide-react";
import type { OnboardingStep } from "../../types/onboarding";
import { useEffect, useRef } from "react";

interface OnboardingProgressProps {
  steps: OnboardingStep[];
  currentStepIndex: number;
}

const STEP_LABELS: Record<OnboardingStep, string> = {
  "identify-provider": "Identify Provider",
  "practice-type": "Practice Type",
  "specialty": "Specialty",
  "business-profile": "Business Profile",
  "licenses": "Licenses",
  "payers": "Payers",
  "required-docs": "Required Documents",
  "portal-logins": "Portal Logins",
};

export function OnboardingProgress({ steps, currentStepIndex }: OnboardingProgressProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeStepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current && activeStepRef.current) {
      const container = scrollContainerRef.current;
      const activeStep = activeStepRef.current;
      
      const containerWidth = container.offsetWidth;
      const activeStepLeft = activeStep.offsetLeft;
      const activeStepWidth = activeStep.offsetWidth;

      const scrollLeft = activeStepLeft - (containerWidth / 2) + (activeStepWidth / 2);
      
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth',
      });
    }
  }, [currentStepIndex]);

  return (
    <div className="w-full">
      {/* Mobile View: Scrollable horizontal bar */}
      <div className="md:hidden">
        <p className="text-sm font-medium text-gray-700 mb-2">
          Step {currentStepIndex + 1} of {steps.length}: {STEP_LABELS[steps[currentStepIndex]]}
        </p>
        <div ref={scrollContainerRef} className="overflow-x-auto pb-4 -mb-4">
          <div className="flex items-start space-x-4" style={{ minWidth: 'max-content' }}>
            {steps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div 
                  key={step} 
                  ref={isCurrent ? activeStepRef : null}
                  className="flex flex-col items-center w-24 shrink-0"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isCurrent
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>
                  <p
                    className={`mt-1 text-xs text-center ${
                      isCompleted || isCurrent ? "text-gray-900 font-medium" : "text-gray-400"
                    }`}
                  >
                    {STEP_LABELS[step]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step} className="flex items-center w-full">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isCompleted
                      ? "bg-green-500 border-green-500 text-white"
                      : isCurrent
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-xs font-medium max-w-20 ${
                      isCompleted || isCurrent ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {STEP_LABELS[step]}
                  </p>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    isCompleted ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
