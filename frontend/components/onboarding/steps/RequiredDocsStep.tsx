import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBackend } from "../../../hooks/useBackend";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Check, FileText } from "lucide-react";
import type { OnboardingStepData } from "../../../types/onboarding";

interface RequiredDoc {
  type: string;
  name: string;
  description: string;
  required: boolean;
}

interface RequiredDocsData {
  uploadedDocs: Array<{
    type: string;
    filename: string;
    uploaded: boolean;
  }>;
}

interface RequiredDocsStepProps {
  data?: RequiredDocsData;
  stepData: OnboardingStepData;
  onChange: (data: RequiredDocsData) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLoading: boolean;
}

const getRequiredDocuments = (stepData: OnboardingStepData): RequiredDoc[] => {
  const docs: RequiredDoc[] = [
    {
      type: "resume",
      name: "Resume",
      description: "Current professional resume",
      required: true,
    },
    {
      type: "w9",
      name: "W-9 Form",
      description: "Completed and signed W-9 form",
      required: true,
    },
    {
      type: "malpractice-insurance",
      name: "Malpractice Insurance",
      description: "Current malpractice insurance certificate",
      required: true,
    },
    {
      type: "board-certification",
      name: "Board Certification",
      description: "Copy of your board certification, if applicable",
      required: false,
    },
    {
      type: "accreditation",
      name: "Accreditation (e.g., DME, CLIA)",
      description: "Accreditation documents, if applicable",
      required: false,
    },
  ];

  // Add license-specific documents
  if (stepData.licenses?.licenses?.length) {
    stepData.licenses.licenses.forEach((license, index) => {
      docs.push({
        type: `license-${license.state}-${index}`,
        name: `${license.state} Medical License`,
        description: `Copy of medical license for ${license.state}`,
        required: true,
      });
    });
  }

  // Add specialty-specific documents
  if (stepData.specialty?.type === "behavioral") {
    docs.push({
      type: "dea-certificate",
      name: "DEA Certificate",
      description: "Drug Enforcement Administration certificate",
      required: false,
    });
  }

  // Add practice-type specific documents
  if (stepData.practiceType?.type === "facility") {
    docs.push({
      type: "facility-license",
      name: "Facility License",
      description: "Healthcare facility operating license",
      required: true,
    });
  }

  // Add payer-specific documents
  if (stepData.payers?.medicare || stepData.payers?.medicaid) {
    docs.push({
      type: "bank-document",
      name: "Voided Check or Bank Letter",
      description: "Required for Medicare/Medicaid direct deposit",
      required: true,
    });
  }

  return docs;
};

export function RequiredDocsStep({
  data,
  stepData,
  onChange,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  isLoading,
}: RequiredDocsStepProps) {
  const backend = useBackend();
  const { toast } = useToast();
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const uploadedDocs = data?.uploadedDocs || [];
  const requiredDocs = getRequiredDocuments(stepData);

  const uploadMutation = useMutation({
    mutationFn: async ({ file, docType }: { file: File; docType: string }) => {
      const reader = new FileReader();
      return new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1]; // Remove data:mime;base64, prefix
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }).then(base64Data => 
        backend.onboarding.uploadDocument({
          documentType: docType,
          stepName: "required-docs",
          filename: file.name,
          fileData: base64Data,
        })
      );
    },
    onSuccess: (result, { docType, file }) => {
      const updatedDocs = uploadedDocs.filter(doc => doc.type !== docType);
      updatedDocs.push({
        type: docType,
        filename: file.name,
        uploaded: true,
      });
      
      onChange({ uploadedDocs: updatedDocs });
      
      toast({
        title: "Document uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    },
    onError: (error: any) => {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setUploadingDoc(null);
    },
  });

  const handleFileUpload = (docType: string, file: File) => {
    setUploadingDoc(docType);
    uploadMutation.mutate({ file, docType });
  };

  const getDocumentStatus = (docType: string) => {
    return uploadedDocs.find(doc => doc.type === docType);
  };

  const requiredDocsUploaded = requiredDocs
    .filter(doc => doc.required)
    .every(doc => getDocumentStatus(doc.type)?.uploaded);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
          <CardDescription>
            Upload the required documents based on your selections. Required documents are marked with an asterisk (*).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requiredDocs.map((doc) => {
            const status = getDocumentStatus(doc.type);
            const isUploading = uploadingDoc === doc.type;

            return (
              <div key={doc.type} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">
                        {doc.name}
                        {doc.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                      {status?.uploaded && (
                        <Check className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                    {status?.uploaded && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ Uploaded: {status.filename}
                      </p>
                    )}
                  </div>

                  <div className="ml-4">
                    <input
                      type="file"
                      id={`file-${doc.type}`}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(doc.type, file);
                        }
                      }}
                      disabled={isUploading}
                    />
                    <Button
                      variant={status?.uploaded ? "outline" : "default"}
                      size="sm"
                      disabled={isUploading}
                      onClick={() => document.getElementById(`file-${doc.type}`)?.click()}
                    >
                      {isUploading ? (
                        "Uploading..."
                      ) : status?.uploaded ? (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          Replace
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
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
            disabled={!canGoNext || !requiredDocsUploaded || isLoading}
          >
            {isLoading ? "Saving..." : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
