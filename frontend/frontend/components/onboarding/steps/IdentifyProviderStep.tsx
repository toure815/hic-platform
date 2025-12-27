import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserPlus, Link } from "lucide-react";

interface IdentifyProviderData {
  type: "new" | "existing";
  existingProviderId?: string;
}

interface IdentifyProviderStepProps {
  data?: IdentifyProviderData;
  onChange: (data: IdentifyProviderData) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLoading: boolean;
}

export function IdentifyProviderStep({
  data,
  onChange,
  onNext,
  canGoNext,
  isLoading,
}: IdentifyProviderStepProps) {
  const handleTypeChange = (type: "new" | "existing") => {
    onChange({
      type,
      existingProviderId: type === "existing" ? data?.existingProviderId : undefined,
    });
  };

  const handleProviderIdChange = (providerId: string) => {
    onChange({
      type: "existing",
      existingProviderId: providerId,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Identify Provider</CardTitle>
          <CardDescription>
            Are you a new provider or do you want to link to an existing provider record?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={data?.type || ""}
            onValueChange={(value) => handleTypeChange(value as "new" | "existing")}
          >
            <div className="space-y-4">
              <Card
                className={`cursor-pointer transition-colors ${data?.type === "new" ? "ring-2 ring-blue-500" : ""}`}
                onClick={() => handleTypeChange("new")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="new" id="new-provider" />
                    <UserPlus className="h-5 w-5 text-blue-600" />
                    <div>
                      <Label htmlFor="new-provider" className="text-base font-medium cursor-pointer">
                        New Provider
                      </Label>
                      <p className="text-sm text-gray-600">
                        I'm a new provider and need to create a new record
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-colors ${data?.type === "existing" ? "ring-2 ring-blue-500" : ""}`}
                onClick={() => handleTypeChange("existing")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="existing" id="existing-provider" />
                    <Link className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <Label htmlFor="existing-provider" className="text-base font-medium cursor-pointer">
                        Link to Existing Provider
                      </Label>
                      <p className="text-sm text-gray-600">
                        I’ve already been credentialed before and may be reconnecting my record
                      </p>
                    </div>
                  </div>
                  
                  {data?.type === "existing" && (
                    <div className="mt-4 ml-8" onClick={(e) => e.stopPropagation()}>
                      <Label htmlFor="provider-id">Provider ID (if available)</Label>
                      <Input
                        id="provider-id"
                        placeholder="Enter Provider ID (optional)"
                        value={data.existingProviderId || ""}
                        onChange={(e) => handleProviderIdChange(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background/95 p-4 md:relative md:border-0 md:p-0">
        <div className="mx-auto flex max-w-4xl justify-end">
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
