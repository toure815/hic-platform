// components/DocumentUploader.tsx
import React, { useState } from "react";

export function DocumentUploader() {
  const [files, setFiles] = useState<File[]>([]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    setFiles([...files, file]);

    const formData = new FormData();
    formData.append("file", file);

    await fetch("https://api.ecrofmedia.xyz:5678/webhook/uploading-doc", {
      method: "POST",
      body: formData,
    });
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} />
      <ul>
        {files.map((f, i) => (
          <li key={i}>{f.name}</li>
        ))}
      </ul>
    </div>
  );
}
