"use client";

import { useState, useCallback } from "react";
import type { OptimizationResult } from "@/types/optimization";

type Step = "jd" | "resume" | "optimizing" | "result";

interface OptimizationState {
  step: Step;
  jdText: string;
  resumeText: string;
  resumeFile: File | null;
  result: OptimizationResult | null;
  error: string | null;
  isLoading: boolean;
}

export function useOptimization() {
  const [state, setState] = useState<OptimizationState>({
    step: "jd",
    jdText: "",
    resumeText: "",
    resumeFile: null,
    result: null,
    error: null,
    isLoading: false,
  });

  const setJD = useCallback((jdText: string) => {
    setState((prev) => ({ ...prev, jdText, step: "resume" }));
  }, []);

  const setResume = useCallback((file: File) => {
    setState((prev) => ({ ...prev, resumeFile: file }));
  }, []);

  const parseResume = useCallback(async () => {
    if (!state.resumeFile) return;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const formData = new FormData();
      formData.append("file", state.resumeFile);
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to parse resume");
      const data = (await res.json()) as { text: string };
      setState((prev) => ({
        ...prev,
        resumeText: data.text,
        isLoading: false,
        step: "optimizing",
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Parse failed",
        isLoading: false,
      }));
    }
  }, [state.resumeFile]);

  const runOptimization = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: state.resumeText,
          jobDescription: state.jdText,
        }),
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Optimization failed");
      }

      const result = (await res.json()) as OptimizationResult;
      setState((prev) => ({
        ...prev,
        result,
        isLoading: false,
        step: "result",
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Optimization failed",
        isLoading: false,
        step: "resume",
      }));
    }
  }, [state.resumeText, state.jdText]);

  const downloadPDF = useCallback(async () => {
    if (!state.result) return;
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Convert the original PDF file to base64 so the API can edit it in-place
      let originalPdfBase64: string | undefined;
      if (state.resumeFile) {
        const arrayBuffer = await state.resumeFile.arrayBuffer();
        // Use a chunked approach to avoid call-stack overflow on large PDFs
        const bytes = new Uint8Array(arrayBuffer);
        const chunkSize = 0x8000; // 32 KB per chunk
        let binary = "";
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode(
            ...bytes.subarray(i, i + chunkSize)
          );
        }
        originalPdfBase64 = btoa(binary);
      }

      // Build a deduplicated list of text replacements from the changes array
      const replacements = state.result.changes
        .filter((c) => c.original && c.optimized && c.original !== c.optimized)
        .map((c) => ({ original: c.original, replacement: c.optimized }));

      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: state.result.optimizedResume,
          originalPdfBase64,
          replacements,
        }),
      });

      if (!res.ok) throw new Error("PDF generation failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "optimized-resume.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "PDF download failed",
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [state.result]);

  const reset = useCallback(() => {
    setState({
      step: "jd",
      jdText: "",
      resumeText: "",
      resumeFile: null,
      result: null,
      error: null,
      isLoading: false,
    });
  }, []);

  return {
    ...state,
    setJD,
    setResume,
    parseResume,
    runOptimization,
    downloadPDF,
    reset,
  };
}
