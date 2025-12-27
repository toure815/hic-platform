import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Brain } from "lucide-react";

interface SpecialtyData {
  type: "primary-care" | "behavioral";
}

interface SpecialtyStepProps {
  data?: SpecialtyData;
  onChange: (data: SpecialtyData) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLoading: boolean;
}

export function SpecialtyStep({
  data,
  onChange,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  isLoading,
}: SpecialtyStepProps) {
  const handleTypeChange = (type: "primary-care" | "behavioral") => {
    onChange({ type });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Specialty</CardTitle>
          <CardDescription>
            Select your primary medical specialty
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onClick={() => handleTypeChange("primary-care")}
            className={`flex items-start space-x-3 p-4 border rounded-md min-h-[80px] cursor-pointer transition-colors ${
              data?.type === "primary-care" ? "border-blue-500 ring-2 ring-blue-500" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gray-100">
              <Heart className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Primary Care</p>
              <p className="text-sm text-gray-600">
                Family medicine, internal medicine, pediatrics, etc.
              </p>
            </div>
          </div>

          <div
            onClick={() => handleTypeChange("behavioral")}
            className={`flex items-start space-x-3 p-4 border rounded-md min-h-[80px] cursor-pointer transition-colors ${
              data?.type === "behavioral" ? "border-blue-500 ring-2 ring-blue-500" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gray-100">
              <Brain className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Behavioral Health</p>
              <p className="text-sm text-gray-600">
                Mental health, substance abuse, therapy, psychiatry
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background/95 p-4 md:relative md:border-0 md:p-0">
        <div className="mx-auto flex max-w-4xl justify-between">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious || isLoading}
          >
            Previous
          </Button>
          <Button
            onClick={onNext}
            disabled={!canGoNext || !data?.type || isLoading}
          >
            {isLoading ? "Saving..." : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
