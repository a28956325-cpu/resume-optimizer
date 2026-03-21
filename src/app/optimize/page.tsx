"use client";

import React, { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JDInput from "@/components/JDInput";
import ResumeUpload from "@/components/ResumeUpload";
import OptimizationResultView from "@/components/OptimizationResult";
import Loading from "@/components/ui/Loading";
import Button from "@/components/ui/Button";
import { useOptimization } from "@/hooks/useOptimization";

const steps = [
  { id: "jd", label: "Job Description" },
  { id: "resume", label: "Upload Resume" },
  { id: "optimizing", label: "Optimizing" },
  { id: "result", label: "Results" },
];

export default function OptimizePage() {
  const {
    step,
    jdText,
    resumeFile,
    result,
    error,
    isLoading,
    setJD,
    setResume,
    parseResume,
    runOptimization,
    downloadPDF,
    reset,
  } = useOptimization();

  // Auto-run optimization when we reach optimizing step
  useEffect(() => {
    if (step === "optimizing" && !result && !isLoading) {
      runOptimization();
    }
  }, [step, result, isLoading, runOptimization]);

  const currentStepIdx = steps.findIndex((s) => s.id === step);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((s, idx) => (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      idx < currentStepIdx
                        ? "bg-green-500 text-white"
                        : idx === currentStepIdx
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {idx < currentStepIdx ? "✓" : idx + 1}
                  </div>
                  <span className="text-xs text-gray-500 hidden sm:block">
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-colors ${
                      idx < currentStepIdx ? "bg-green-400" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {step === "jd" && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Step 1: Job Description
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Paste the job description or provide a URL. Our AI will extract
                key requirements and keywords.
              </p>
              <JDInput onSubmit={setJD} />
            </>
          )}

          {step === "resume" && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Step 2: Upload Your Resume
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Upload your current resume as a PDF. We'll parse the text
                and optimize it.
              </p>
              <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg">
                <p className="text-xs text-green-700">
                  ✓ JD captured ({jdText.slice(0, 60)}...)
                </p>
              </div>
              <ResumeUpload
                onUpload={setResume}
                onSubmit={parseResume}
                isLoading={isLoading}
                hasFile={!!resumeFile}
                fileName={resumeFile?.name}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                className="mt-4"
              >
                ← Start over
              </Button>
            </>
          )}

          {step === "optimizing" && (
            <div className="py-16">
              <Loading
                size="lg"
                text="AI is analyzing your resume and optimizing for ATS..."
              />
              <div className="mt-8 space-y-2 max-w-sm mx-auto">
                {[
                  "Analyzing job description...",
                  "Extracting key requirements...",
                  "Matching your experience...",
                  "Optimizing verb choices...",
                  "Integrating keywords...",
                  "Running quality check...",
                ].map((msg, i) => (
                  <p
                    key={i}
                    className="text-xs text-gray-400 text-center animate-pulse"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  >
                    {msg}
                  </p>
                ))}
              </div>
            </div>
          )}

          {step === "result" && result && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Optimization Complete!
                </h2>
                <Button variant="outline" size="sm" onClick={reset}>
                  New Optimization
                </Button>
              </div>
              <OptimizationResultView
                result={result}
                onDownload={downloadPDF}
                isDownloading={isLoading}
              />
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
