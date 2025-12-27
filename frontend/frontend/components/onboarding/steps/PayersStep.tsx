import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Building } from "lucide-react";

interface PayersData {
  medicare: boolean;
  medicaid: boolean;
  commercialPayers: string[];
}

interface PayersStepProps {
  data?: PayersData;
  onChange: (data: PayersData) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLoading: boolean;
}

const PREDEFINED_COMMERCIAL_PAYERS = [
  "Aetna",
  "Anthem",
  "Blue Cross Blue Shield",
  "Cigna", 
  "Humana",
  "Kaiser Permanente",
  "Molina Healthcare",
  "UnitedHealth Group",
  "Wellcare",
];

export function PayersStep({
  data,
  onChange,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  isLoading,
}: PayersStepProps) {
  const currentData = data || {
    medicare: false,
    medicaid: false,
    commercialPayers: [],
  };

  const [otherPayerText, setOtherPayerText] = useState('');
  const [isOtherChecked, setIsOtherChecked] = useState(false);

  useEffect(() => {
    const predefinedSet = new Set(PREDEFINED_COMMERCIAL_PAYERS);
    const customPayer = currentData.commercialPayers.find(p => !predefinedSet.has(p));
    if (customPayer) {
        setIsOtherChecked(true);
        setOtherPayerText(customPayer);
    } else {
        setIsOtherChecked(false);
        setOtherPayerText('');
    }
  }, [currentData.commercialPayers]);

  const handleMedicareChange = (checked: boolean) => {
    onChange({
      ...currentData,
      medicare: checked,
    });
  };

  const handleMedicaidChange = (checked: boolean) => {
    onChange({
      ...currentData,
      medicaid: checked,
    });
  };

  const handleCommercialPayerChange = (payer: string, checked: boolean) => {
    const updatedPayers = checked
      ? [...currentData.commercialPayers, payer]
      : currentData.commercialPayers.filter(p => p !== payer);
    
    onChange({
      ...currentData,
      commercialPayers: updatedPayers,
    });
  };

  const handleOtherCheckboxChange = (checked: boolean) => {
    setIsOtherChecked(checked);
    if (!checked) {
        const predefinedSet = new Set(PREDEFINED_COMMERCIAL_PAYERS);
        const updatedPayers = currentData.commercialPayers.filter(p => predefinedSet.has(p));
        onChange({
            ...currentData,
            commercialPayers: updatedPayers,
        });
    }
  };

  const handleOtherPayerTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setOtherPayerText(newText);

    const predefinedSet = new Set(PREDEFINED_COMMERCIAL_PAYERS);
    const updatedPayers = currentData.commercialPayers.filter(p => predefinedSet.has(p));
    if (newText.trim()) {
        updatedPayers.push(newText.trim());
    }
    onChange({
        ...currentData,
        commercialPayers: updatedPayers,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payer Information</CardTitle>
          <CardDescription>
            Select the payers you want to be credentialed with. Note that selecting Medicare or Medicaid will require you to upload bank information in the next step.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Government Payers */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center">
              <Building className="h-5 w-5 mr-2 text-blue-600" />
              Government Payers
            </h4>
            
            <div className="space-y-3 ml-7">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="medicare"
                  checked={currentData.medicare}
                  onCheckedChange={handleMedicareChange}
                />
                <Label htmlFor="medicare">Medicare</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="medicaid"
                  checked={currentData.medicaid}
                  onCheckedChange={handleMedicaidChange}
                />
                <Label htmlFor="medicaid">Medicaid</Label>
              </div>
            </div>
          </div>

          {/* Commercial Payers */}
          <div className="space-y-4">
            <h4 className="font-medium">Commercial Payers (Optional)</h4>
            <p className="text-sm text-gray-600">
              Select any commercial insurance plans you'd like to be credentialed with
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {PREDEFINED_COMMERCIAL_PAYERS.map((payer) => (
                <div key={payer} className="flex items-center space-x-2">
                  <Checkbox
                    id={`payer-${payer}`}
                    checked={currentData.commercialPayers.includes(payer)}
                    onCheckedChange={(checked) => handleCommercialPayerChange(payer, checked as boolean)}
                  />
                  <Label htmlFor={`payer-${payer}`} className="text-sm">
                    {payer}
                  </Label>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="payer-other"
                  checked={isOtherChecked}
                  onCheckedChange={handleOtherCheckboxChange}
                />
                <Label htmlFor="payer-other" className="text-sm font-medium">
                  Other
                </Label>
              </div>
              {isOtherChecked && (
                <div className="pl-6 mt-2">
                  <Input
                    placeholder="Enter payer name"
                    value={otherPayerText}
                    onChange={handleOtherPayerTextChange}
                  />
                </div>
              )}
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
            disabled={!canGoNext || isLoading}
          >
            {isLoading ? "Saving..." : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
