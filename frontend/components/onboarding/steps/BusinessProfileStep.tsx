import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parse, isValid as isValidDate } from "date-fns";
import { formatEIN, formatPhoneNumber, formatSSN, formatDateMMDDYYYY } from "@/utils/formatters";

interface BusinessProfileData {
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
}

interface BusinessProfileStepProps {
  data?: BusinessProfileData;
  onChange: (data: BusinessProfileData) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLoading: boolean;
}

export function BusinessProfileStep({
  data,
  onChange,
  onNext,
  onPrevious,
  canGoPrevious,
  isLoading,
}: BusinessProfileStepProps) {
  const currentData: BusinessProfileData = data || {
    businessName: "",
    providerName: "",
    ssn: "",
    dateOfBirth: "",
    primaryAddress: "",
    additionalLocations: [],
    einNumber: "",
    npiNumber: "",
    groupNpiNumber: "",
    countyOfBusiness: "",
    businessPhoneNumber: "",
    businessEmail: "",
    businessFaxNumber: "",
    caqh: "",
    hoursOfOperation: "",
    businessWebsite: "",
  };

  const [showAdditionalLocations, setShowAdditionalLocations] = useState<boolean>(
    (currentData.additionalLocations?.length || 0) > 0
  );
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (updates: Partial<BusinessProfileData>) => {
    onChange({ ...currentData, ...updates });
  };

  const handleFormattedChange = (
    field: keyof BusinessProfileData,
    value: string,
    formatter: (val: string) => string
  ) => {
    handleChange({ [field]: formatter(value) } as Partial<BusinessProfileData>);
  };

  const handleAdditionalLocationChange = (index: number, value: string) => {
    const newLocations = [...currentData.additionalLocations];
    newLocations[index] = value;
    handleChange({ additionalLocations: newLocations });
  };

  const addAdditionalLocation = () => {
    handleChange({ additionalLocations: [...currentData.additionalLocations, ""] });
  };

  const removeAdditionalLocation = (index: number) => {
    const newLocations = currentData.additionalLocations.filter((_, i) => i !== index);
    handleChange({ additionalLocations: newLocations });
  };

  const formIsValid =
    !!currentData.businessName &&
    !!currentData.providerName &&
    !!currentData.ssn &&
    !!currentData.dateOfBirth &&
    !!currentData.primaryAddress &&
    !!currentData.einNumber &&
    !!currentData.npiNumber &&
    !!currentData.countyOfBusiness &&
    !!currentData.businessPhoneNumber &&
    !!currentData.businessEmail &&
    !!currentData.caqh &&
    !!currentData.hoursOfOperation;

  const parsedDate = parse(currentData.dateOfBirth, "MM/dd/yyyy", new Date());
  const dateOfBirthAsDate = isValidDate(parsedDate) ? parsedDate : undefined;

  // ✅ Function to send data to n8n webhook
  const submitToWebhook = async () => {
    try {
      setSubmitting(true);
      const res = await fetch("https://api.ecrofmedia.xyz:5678/webhook/provider-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentData),
      });

      if (!res.ok) {
        throw new Error("Failed to submit business profile to onboarding workflow");
      }

      console.log("✅ Business profile sent to n8n webhook successfully");
    } catch (err) {
      console.error("❌ Webhook submission failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    await submitToWebhook();
    onNext();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
          <CardDescription>
            Please provide the following details about your business and the primary provider. Required fields are marked with an asterisk (*).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={currentData.businessName}
                onChange={(e) => handleChange({ businessName: e.target.value })}
                placeholder="Your Company LLC"
              />
            </div>

            {/* Provider Name */}
            <div className="space-y-2">
              <Label htmlFor="providerName">Provider Name (Full Legal Name) *</Label>
              <Input
                id="providerName"
                value={currentData.providerName}
                onChange={(e) => handleChange({ providerName: e.target.value })}
                placeholder="Dr. Jane Doe"
              />
            </div>

            {/* SSN */}
            <div className="space-y-2">
              <Label htmlFor="ssn">Social Security Number (SSN) *</Label>
              <Input
                id="ssn"
                value={currentData.ssn}
                onChange={(e) => handleFormattedChange("ssn", e.target.value, formatSSN)}
                placeholder="XXX-XX-XXXX"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Popover>
                <div className="relative">
                  <Input
                    id="dateOfBirth"
                    type="text"
                    placeholder="MM/DD/YYYY"
                    value={currentData.dateOfBirth}
                    onChange={(e) => handleFormattedChange("dateOfBirth", e.target.value, formatDateMMDDYYYY)}
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
                    fromYear={1930}
                    toYear={new Date().getFullYear() - 18}
                    selected={dateOfBirthAsDate}
                    onSelect={(date) => handleChange({ dateOfBirth: date ? format(date, "MM/dd/yyyy") : "" })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="primaryAddress">Primary Business Address *</Label>
              <Textarea
                id="primaryAddress"
                value={currentData.primaryAddress}
                onChange={(e) => handleChange({ primaryAddress: e.target.value })}
                placeholder="123 Main St, Anytown, USA 12345"
              />
            </div>

            {/* Additional Locations */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasAdditionalLocations"
                  checked={showAdditionalLocations}
                  onCheckedChange={(checked) => setShowAdditionalLocations(checked as boolean)}
                />
                <Label htmlFor="hasAdditionalLocations">I have additional business locations</Label>
              </div>

              {showAdditionalLocations && (
                <div className="space-y-4 pl-6 border-l-2">
                  {currentData.additionalLocations.map((loc, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Additional Location {index + 1}</Label>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAdditionalLocation(index)}
                          className="h-7 w-7"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      <Textarea
                        value={loc}
                        onChange={(e) => handleAdditionalLocationChange(index, e.target.value)}
                        placeholder={`Location ${index + 2} Address`}
                      />
                    </div>
                  ))}
                  <Button variant="outline" onClick={addAdditionalLocation} className="w-full border-dashed">
                    <Plus className="h-4 w-4 mr-2" />
                    Add another location
                  </Button>
                </div>
              )}
            </div>

            {/* EIN */}
            <div className="space-y-2">
              <Label htmlFor="einNumber">EIN Number (Tax ID) *</Label>
              <Input
                id="einNumber"
                value={currentData.einNumber}
                onChange={(e) => handleFormattedChange("einNumber", e.target.value, formatEIN)}
                placeholder="XX-XXXXXXX"
              />
            </div>

            {/* NPI */}
            <div className="space-y-2">
              <Label htmlFor="npiNumber">Individual NPI Number *</Label>
              <Input
                id="npiNumber"
                value={currentData.npiNumber}
                onChange={(e) => handleChange({ npiNumber: e.target.value })}
                placeholder="1234567890"
              />
            </div>

            {/* Group NPI */}
            <div className="space-y-2">
              <Label htmlFor="groupNpiNumber">Group NPI Number (if applicable)</Label>
              <Input
                id="groupNpiNumber"
                value={currentData.groupNpiNumber || ""}
                onChange={(e) => handleChange({ groupNpiNumber: e.target.value })}
                placeholder="10-digit number"
              />
            </div>

            {/* County */}
            <div className="space-y-2">
              <Label htmlFor="countyOfBusiness">County of Business *</Label>
              <Input
                id="countyOfBusiness"
                value={currentData.countyOfBusiness}
                onChange={(e) => handleChange({ countyOfBusiness: e.target.value })}
                placeholder="Any County"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="businessPhoneNumber">Business Phone Number *</Label>
              <Input
                id="businessPhoneNumber"
                type="tel"
                value={currentData.businessPhoneNumber}
                onChange={(e) => handleFormattedChange("businessPhoneNumber", e.target.value, formatPhoneNumber)}
                placeholder="(555) 555-5555"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="businessEmail">Business Email *</Label>
              <Input
                id="businessEmail"
                type="email"
                value={currentData.businessEmail}
                onChange={(e) => handleChange({ businessEmail: e.target.value })}
                placeholder="contact@yourcompany.com"
              />
            </div>

            {/* Fax */}
            <div className="space-y-2">
              <Label htmlFor="businessFaxNumber">Business Fax Number (Optional)</Label>
              <Input
                id="businessFaxNumber"
                type="tel"
                value={currentData.businessFaxNumber || ""}
                onChange={(e) => handleFormattedChange("businessFaxNumber", e.target.value, formatPhoneNumber)}
                placeholder="(555) 555-5556"
              />
            </div>

            {/* CAQH */}
            <div className="space-y-2">
              <Label htmlFor="caqh">CAQH ID *</Label>
              <Input
                id="caqh"
                value={currentData.caqh}
                onChange={(e) => handleChange({ caqh: e.target.value })}
                placeholder="Your CAQH ID"
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="businessWebsite">Business Website (Optional)</Label>
              <Input
                id="businessWebsite"
                type="url"
                value={currentData.businessWebsite || ""}
                onChange={(e) => handleChange({ businessWebsite: e.target.value })}
                placeholder="https://yourcompany.com"
              />
            </div>

            {/* Hours */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="hoursOfOperation">Hours of Operation *</Label>
              <Textarea
                id="hoursOfOperation"
                value={currentData.hoursOfOperation}
                onChange={(e) => handleChange({ hoursOfOperation: e.target.value })}
                placeholder="e.g., Mon-Fri, 9am - 5pm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background/95 p-4 md:relative md:border-0 md:p-0">
        <div className="mx-auto flex max-w-4xl justify-between">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious || isLoading || submitting}
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!formIsValid || isLoading || submitting}
          >
            {submitting ? "Saving..." : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}


