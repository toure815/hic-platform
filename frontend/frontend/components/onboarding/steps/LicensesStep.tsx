import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { formatDateMMDDYYYY } from "@/utils/formatters";

interface License {
  state: string;
  licenseNumber: string;
  expirationDate: string;
}

interface LicensesData {
  licenses: License[];
}

interface LicensesStepProps {
  data?: LicensesData;
  onChange: (data: LicensesData) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLoading: boolean;
}

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export function LicensesStep({
  data,
  onChange,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  isLoading,
}: LicensesStepProps) {
  const licenses = data?.licenses || [];

  const addLicense = () => {
    const newLicense: License = {
      state: "",
      licenseNumber: "",
      expirationDate: "",
    };
    onChange({
      licenses: [...licenses, newLicense],
    });
  };

  const updateLicense = (index: number, field: keyof License, value: string) => {
    const updatedLicenses = licenses.map((license, i) =>
      i === index ? { ...license, [field]: value } : license
    );
    onChange({ licenses: updatedLicenses });
  };

  const removeLicense = (index: number) => {
    const updatedLicenses = licenses.filter((_, i) => i !== index);
    onChange({ licenses: updatedLicenses });
  };

  const isValid = licenses.length > 0 && licenses.every(
    license => license.state && license.licenseNumber && license.expirationDate
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Professional Licenses</CardTitle>
          <CardDescription>
            Add your state professional licenses. You must have at least one license.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {licenses.map((license, index) => {
            const parsedDate = parse(license.expirationDate, 'MM/dd/yyyy', new Date());
            const expirationDateAsDate = isValid(parsedDate) ? parsedDate : undefined;
            return (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">License {index + 1}</h4>
                  {licenses.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeLicense(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Select
                      value={license.state}
                      onValueChange={(value) => updateLicense(index, "state", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>License Number</Label>
                    <Input
                      value={license.licenseNumber}
                      onChange={(e) => updateLicense(index, "licenseNumber", e.target.value)}
                      placeholder="Enter license number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Expiration Date</Label>
                    <Popover>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="MM/DD/YYYY"
                          value={license.expirationDate}
                          onChange={(e) => updateLicense(index, "expirationDate", formatDateMMDDYYYY(e.target.value))}
                          className="pr-10"
                        />
                        <PopoverTrigger asChild>
                          <Button variant={"ghost"} size="icon" className="absolute right-0 top-0 h-full w-10">
                            <CalendarIcon className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                      </div>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          captionLayout="dropdown-buttons"
                          fromYear={new Date().getFullYear()}
                          toYear={new Date().getFullYear() + 20}
                          selected={expirationDateAsDate}
                          onSelect={(date) =>
                            updateLicense(index, "expirationDate", date ? format(date, "MM/dd/yyyy") : "")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            );
          })}

          <Button
            variant="outline"
            onClick={addLicense}
            className="w-full border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add License
          </Button>
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
            disabled={!canGoNext || !isValid || isLoading}
          >
            {isLoading ? "Saving..." : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
