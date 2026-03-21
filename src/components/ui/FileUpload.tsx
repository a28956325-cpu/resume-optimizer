"use client";

import React, { useCallback, useState } from "react";

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  onFileSelect: (file: File) => void;
  label?: string;
  description?: string;
}

export default function FileUpload({
  accept = ".pdf",
  maxSize = 10,
  onFileSelect,
  label = "Upload file",
  description = "Drag and drop or click to upload",
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File size must be less than ${maxSize}MB`);
        return;
      }
      setFileName(file.name);
      onFileSelect(file);
    },
    [maxSize, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="w-full">
      <label
        className={`
          flex flex-col items-center justify-center w-full h-40 border-2 border-dashed
          rounded-xl cursor-pointer transition-colors duration-200
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"}
        `}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
        />
        {fileName ? (
          <div className="text-center">
            <svg
              className="w-10 h-10 mx-auto text-green-500 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium text-gray-700">{fileName}</p>
            <p className="text-xs text-gray-500 mt-1">Click to change file</p>
          </div>
        ) : (
          <div className="text-center">
            <svg
              className="w-10 h-10 mx-auto text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm font-semibold text-gray-700">{label}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
            <p className="text-xs text-gray-400 mt-1">Max {maxSize}MB</p>
          </div>
        )}
      </label>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
