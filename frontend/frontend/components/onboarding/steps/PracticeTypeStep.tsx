import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Building, Users } from "lucide-react";

interface PracticeTypeData {
  type: "facility" | "group";
}

interface PracticeTypeStepProps {
  data?: PracticeTypeData;
  onChange: (data: PracticeTypeData) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLoading: boolean;
}

export function PracticeTypeStep({
  data,
  onChange,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  isLoading,
}: PracticeTypeStepProps) {
  const handleTypeChange = (type: "facility" | "group") => {
    onChange({ type });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Practice Type</CardTitle>
          <CardDescription>
            Select the type of practice you represent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={data?.type || ""}
            onValueChange={(value) => handleTypeChange(value as "facility" | "group")}
          >
            <div className="space-y-4">
              <Card
                className={`cursor-pointer transition-colors ${data?.type === "facility" ? "ring-2 ring-blue-500" : ""}`}
                onClick={() => handleTypeChange("facility")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="facility" id="facility" />
                    <Building className="h-5 w-5 text-blue-600" />
                    <div>
                      <Label htmlFor="facility" className="text-base font-medium cursor-pointer">
                        Healthcare Facility
                      </Label>
                      <p className="text-sm text-gray-600">
                        Hospital, clinic, or medical facility
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-colors ${data?.type === "group" ? "ring-2 ring-blue-500" : ""}`}
                onClick={() => handleTypeChange("group")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="group" id="group" />
                    <Users className="h-5 w-5 text-green-600" />
                    <div>
                      <Label htmlFor="group" className="text-base font-medium cursor-pointer">
                        Group Practice
                      </Label>
                      <p className="text-sm text-gray-600">
                        Medical group or practice organization
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </RadioGroup>
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
