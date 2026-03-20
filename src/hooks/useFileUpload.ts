"use client";

import { useState, useCallback } from "react";

interface UseFileUploadReturn {
  file: File | null;
  preview: string | null;
  error: string | null;
  isUploading: boolean;
  handleFile: (file: File) => void;
  reset: () => void;
}

export function useFileUpload(
  maxSizeMB = 10,
  acceptedTypes = ["application/pdf"]
): UseFileUploadReturn {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = useCallback(
    (f: File) => {
      setError(null);

      if (f.size > maxSizeMB * 1024 * 1024) {
        setError(`File must be smaller than ${maxSizeMB}MB`);
        return;
      }

      if (acceptedTypes.length > 0 && !acceptedTypes.includes(f.type)) {
        setError(`File type not supported. Please upload: ${acceptedTypes.join(", ")}`);
        return;
      }

      setFile(f);
      setIsUploading(true);

      if (f.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
          setIsUploading(false);
        };
        reader.readAsDataURL(f);
      } else {
        setIsUploading(false);
      }
    },
    [maxSizeMB, acceptedTypes]
  );

  const reset = useCallback(() => {
    setFile(null);
    setPreview(null);
    setError(null);
    setIsUploading(false);
  }, []);

  return { file, preview, error, isUploading, handleFile, reset };
}
