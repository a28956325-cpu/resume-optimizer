"use client";

import React, { useState } from "react";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

interface JDInputProps {
  onSubmit: (jdText: string) => void;
  isLoading?: boolean;
}

export default function JDInput({ onSubmit, isLoading }: JDInputProps) {
  const [inputType, setInputType] = useState<"text" | "url">("text");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [previewKeywords, setPreviewKeywords] = useState<string[]>([]);

  const extractPreviewKeywords = (text: string) => {
    const techPattern =
      /\b(JavaScript|TypeScript|Python|React|Node\.js|AWS|Docker|Kubernetes|SQL|MongoDB|GraphQL|REST|CI\/CD|Git|Agile|Scrum)\b/gi;
    const matches = text.match(techPattern) ?? [];
    setPreviewKeywords([...new Set(matches.map((m) => m.toLowerCase()))].slice(0, 10));
  };

  const handleSubmit = async () => {
    setError("");
    if (!value.trim()) {
      setError("Please enter a job description or URL");
      return;
    }

    if (inputType === "url") {
      if (!value.startsWith("http")) {
        setError("Please enter a valid URL starting with http:// or https://");
        return;
      }
      // Pass URL as-is; server will scrape it
      onSubmit(value.trim());
    } else {
      if (value.trim().length < 50) {
        setError("Job description seems too short. Please paste the full JD.");
        return;
      }
      extractPreviewKeywords(value);
      onSubmit(value.trim());
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setInputType("text")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            inputType === "text"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Paste Text
        </button>
        <button
          onClick={() => setInputType("url")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            inputType === "url"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          LinkedIn / URL
        </button>
      </div>

      {inputType === "text" ? (
        <TextArea
          placeholder="Paste the full job description here..."
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (e.target.value.length > 100) {
              extractPreviewKeywords(e.target.value);
            }
          }}
          rows={10}
          error={error}
          helperText="Paste the complete job description for best results"
        />
      ) : (
        <div className="space-y-2">
          <input
            type="url"
            placeholder="https://www.linkedin.com/jobs/view/... or any job URL"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <p className="text-xs text-gray-500">
            Note: LinkedIn requires login — direct scraping may not work. Use
            text paste for best results.
          </p>
        </div>
      )}

      {previewKeywords.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">
            Detected keywords:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {previewKeywords.map((kw) => (
              <Badge key={kw} variant="info">
                {kw}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        loading={isLoading}
        disabled={!value.trim()}
        className="w-full"
      >
        Analyze Job Description →
      </Button>
    </div>
  );
}
