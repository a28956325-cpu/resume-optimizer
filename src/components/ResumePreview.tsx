"use client";

import React from "react";

interface ResumePreviewProps {
  content: string;
  title?: string;
}

export default function ResumePreview({
  content,
  title = "Resume Preview",
}: ResumePreviewProps) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <p className="text-sm font-medium text-gray-700">{title}</p>
      </div>
      <div className="bg-white p-6 max-h-96 overflow-y-auto">
        <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
          {content}
        </pre>
      </div>
    </div>
  );
}
