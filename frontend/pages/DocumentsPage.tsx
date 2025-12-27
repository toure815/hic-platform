import { useAuth } from "../contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, ArrowLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface UploadedFile {
  name: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string; // email or user name
}

export function DocumentsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Loading documents…</h1>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setStatusMessage("Uploading…");

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("userEmail", user?.email || "");
        formData.append("businessName", user?.businessName || user?.firstName || "");

        const response = await fetch(
          "https://api.ecrofmedia.xyz:5678/webhook/uploading-doc",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) throw new Error("Upload failed");

        // Add to local state for recent uploads list
        setUploadedFiles((prev) => [
          {
            name: file.name,
            size: file.size,
            uploadedAt: new Date().toLocaleString(),
            uploadedBy: user?.email || "unknown",
          },
          ...prev,
        ]);
      }

      setStatusMessage("✅ All documents uploaded successfully!");
      setFiles([]);
    } catch (error) {
      console.error(error);
      setStatusMessage("❌ Error uploading documents. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
          <p className="text-gray-600 mt-1">
            {uploadedFiles.length} document{uploadedFiles.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* ✅ Role Badge */}
          {user?.role && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                user.role === "admin"
                  ? "bg-purple-100 text-purple-800 border border-purple-300"
                  : "bg-green-100 text-green-800 border border-green-300"
              }`}
            >
              {user.role === "admin" ? "Admin View" : "Client View"}
            </span>
          )}
          <Button variant="outline" onClick={() => navigate("/portal")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portal
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Upload Provider Documents</CardTitle>
          <CardDescription>
            Drag and drop files or click to select multiple files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
              ${
                isDragging
                  ? "border-blue-500 bg-blue-50 scale-105"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              }
            `}
          >
            <Upload className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              {files.length > 0 ? (
                <span className="text-blue-600">
                  {files.length} file{files.length !== 1 ? "s" : ""} selected
                </span>
              ) : (
                <>
                  <span className="text-blue-600">Click to upload</span> or drag
                  and drop
                </>
              )}
            </p>
            <p className="text-sm text-gray-500">
              PDF, PNG, JPG, DOCX up to 10MB each
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.docx,.doc"
            />
          </div>

          {files.length > 0 && (
            <Button
              onClick={handleUpload}
              disabled={uploading}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-6"
            >
              <Upload className="h-5 w-5 mr-2" />
              {uploading
                ? "Uploading..."
                : `Upload ${files.length} File${files.length !== 1 ? "s" : ""}`}
            </Button>
          )}

          {statusMessage && (
            <div
              className={`p-4 rounded-lg text-center font-medium ${
                statusMessage.includes("✅")
                  ? "bg-green-50 text-green-800"
                  : statusMessage.includes("❌")
                  ? "bg-red-50 text-red-800"
                  : "bg-blue-50 text-blue-800"
              }`}
            >
              {statusMessage}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ Recent Uploads List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
          <CardDescription>
            {user.role === "admin"
              ? "Viewing all recent uploads across users"
              : "Your recent document uploads"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uploadedFiles.length === 0 ? (
            <p className="text-sm text-gray-600">No uploads yet.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB •{" "}
                      Uploaded by {file.uploadedBy} at {file.uploadedAt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

