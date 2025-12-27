import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Eye, EyeOff, Globe } from "lucide-react";

interface PortalLogin {
  platform: string;
  username: string;
  password: string;
}

interface PortalLoginsData {
  logins: PortalLogin[];
}

interface PortalLoginsStepProps {
  data?: PortalLoginsData;
  onChange: (data: PortalLoginsData) => void;
  onComplete: () => void;
  onPrevious: () => void;
  canGoPrevious: boolean;
  isLastStep: boolean;
  isLoading: boolean;
}

export function PortalLoginsStep({
  data,
  onChange,
  onComplete,
  onPrevious,
  canGoPrevious,
  isLastStep,
  isLoading,
}: PortalLoginsStepProps) {
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});

  const logins = data?.logins || [];

  const addLogin = () => {
    const newLogin: PortalLogin = {
      platform: "",
      username: "",
      password: "",
    };
    onChange({
      logins: [...logins, newLogin],
    });
  };

  const updateLogin = (index: number, field: keyof PortalLogin, value: string) => {
    const updatedLogins = logins.map((login, i) =>
      i === index ? { ...login, [field]: value } : login
    );
    onChange({ logins: updatedLogins });
  };

  const removeLogin = (index: number) => {
    const updatedLogins = logins.filter((_, i) => i !== index);
    onChange({ logins: updatedLogins });
    
    // Clean up password visibility state
    const newShowPasswords = { ...showPasswords };
    delete newShowPasswords[index];
    setShowPasswords(newShowPasswords);
  };

  const togglePasswordVisibility = (index: number) => {
    setShowPasswords(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Portal Logins</CardTitle>
          <CardDescription>
            Add login credentials for payer portals and other platforms you use. 
            You can add up to 5 entries. This information is optional but helps streamline the credentialing process.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {logins.map((login, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  Portal {index + 1}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeLogin(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Platform Name</Label>
                  <Input
                    value={login.platform}
                    onChange={(e) => updateLogin(index, "platform", e.target.value)}
                    placeholder="e.g., Availity, CAQH, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    value={login.username}
                    onChange={(e) => updateLogin(index, "username", e.target.value)}
                    placeholder="Enter username"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords[index] ? "text" : "password"}
                      value={login.password}
                      onChange={(e) => updateLogin(index, "password", e.target.value)}
                      placeholder="Enter password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility(index)}
                    >
                      {showPasswords[index] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {logins.length < 5 && (
            <Button
              variant="outline"
              onClick={addLogin}
              className="w-full border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Portal Login
            </Button>
          )}

          {logins.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No portal logins added yet</p>
              <p className="text-sm">Portal logins are optional but can help speed up credentialing</p>
            </div>
          )}
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
            onClick={onComplete}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? "Completing..." : "Complete Onboarding"}
          </Button>
        </div>
      </div>
    </div>
  );
}
