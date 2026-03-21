"use client";

import React from "react";
import FileUpload from "@/components/ui/FileUpload";
import Button from "@/components/ui/Button";

interface ResumeUploadProps {
  onUpload: (file: File) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  hasFile?: boolean;
  fileName?: string;
}

export default function ResumeUpload({
  onUpload,
  onSubmit,
  isLoading,
  hasFile,
}: ResumeUploadProps) {
  return (
    <div className="space-y-4">
      <FileUpload
        accept=".pdf"
        maxSize={10}
        onFileSelect={onUpload}
        label="Upload your resume PDF"
        description="Drag & drop your PDF resume here"
      />

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-xs text-amber-700 font-medium">
          🔒 Privacy: Your resume is processed securely and never stored
          permanently without your consent.
        </p>
      </div>

      <Button
        onClick={onSubmit}
        disabled={!hasFile}
        loading={isLoading}
        className="w-full"
      >
        {isLoading ? "Parsing resume..." : "Parse & Continue →"}
      </Button>
    </div>
  );
}
