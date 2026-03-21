"use client";

import React, { useMemo, useState } from "react";
import type { OptimizationResult, OptimizationChange } from "@/types/optimization";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { computeDiff } from "@/lib/utils/diff";

interface OptimizationResultProps {
  result: OptimizationResult;
  onDownload?: () => void;
  isDownloading?: boolean;
}

type ChangeType = OptimizationChange["type"];

const changeTypeBadgeVariants: Record<ChangeType, "info" | "success" | "warning" | "default"> = {
  verb_replacement: "success",
  keyword_integration: "info",
  phrase_adjustment: "warning",
  reordering: "default",
};

const changeTypeLabels: Record<ChangeType, string> = {
  verb_replacement: "Verb",
  keyword_integration: "Keyword",
  phrase_adjustment: "Phrase",
  reordering: "Reorder",
};

export default function OptimizationResultView({
  result,
  onDownload,
  isDownloading,
}: OptimizationResultProps) {
  const [activeTab, setActiveTab] = useState<"diff" | "changes" | "keywords">(
    "diff"
  );
  const [view, setView] = useState<"split" | "unified">("split");

  const scoreDelta = result.matchScoreAfter - result.matchScoreBefore;

  const diffLines = useMemo(
    () => computeDiff(result.originalResume, result.optimizedResume),
    [result.originalResume, result.optimizedResume]
  );

  return (
    <div className="space-y-6">
      {/* Score Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500 mb-1">Before</p>
          <p className="text-3xl font-bold text-gray-700">
            {result.matchScoreBefore}%
          </p>
          <p className="text-xs text-gray-500">match score</p>
        </div>
        <div className={`${scoreDelta >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-xl p-4 text-center`}>
          <p className={`text-sm ${scoreDelta >= 0 ? 'text-green-600' : 'text-red-600'} mb-1`}>
            {scoreDelta >= 0 ? 'Improvement' : 'Change'}
          </p>
          <p className={`text-3xl font-bold ${scoreDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {scoreDelta >= 0 ? '+' : ''}{scoreDelta}%
          </p>
          <p className={`text-xs ${scoreDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {scoreDelta >= 0 ? 'gained' : 'decreased'}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-sm text-blue-600 mb-1">After</p>
          <p className="text-3xl font-bold text-blue-700">
            {result.matchScoreAfter}%
          </p>
          <p className="text-xs text-blue-600">match score</p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm text-blue-800">{result.summary}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          {(["diff", "changes", "keywords"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "diff"
                ? "Diff View"
                : tab === "changes"
                ? `Changes (${result.changes.length})`
                : "Keywords"}
            </button>
          ))}
        </div>
      </div>

      {/* Diff View */}
      {activeTab === "diff" && (
        <div>
          <div className="flex justify-end mb-3 gap-2">
            <button
              onClick={() => setView("split")}
              className={`px-3 py-1 text-xs rounded font-medium ${view === "split" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"}`}
            >
              Split
            </button>
            <button
              onClick={() => setView("unified")}
              className={`px-3 py-1 text-xs rounded font-medium ${view === "unified" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"}`}
            >
              Unified
            </button>
          </div>

          {view === "split" ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="bg-red-50 rounded-t-lg px-3 py-2 border border-red-200 border-b-0">
                  <p className="text-xs font-semibold text-red-700">
                    Original
                  </p>
                </div>
                <pre className="bg-white rounded-b-lg border border-red-200 p-3 text-xs overflow-auto whitespace-pre-wrap font-mono text-gray-800 max-h-96">
                  {result.originalResume}
                </pre>
              </div>
              <div>
                <div className="bg-green-50 rounded-t-lg px-3 py-2 border border-green-200 border-b-0">
                  <p className="text-xs font-semibold text-green-700">
                    Optimized
                  </p>
                </div>
                <pre className="bg-white rounded-b-lg border border-green-200 p-3 text-xs overflow-auto whitespace-pre-wrap font-mono text-gray-800 max-h-96">
                  {result.optimizedResume}
                </pre>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500">
                Unified Diff
              </div>
              <div className="p-3 text-xs font-mono max-h-96 overflow-auto bg-white">
                {diffLines.map((line, i) => (
                  <div
                    key={`${i}-${line.type}-${line.content.slice(0, 20)}`}
                    className={
                      line.type === "added"
                        ? "bg-green-50 text-green-800"
                        : line.type === "removed"
                        ? "bg-red-50 text-red-800"
                        : "text-gray-800"
                    }
                  >
                    <span className="select-none mr-1 text-gray-400">
                      {line.type === "added"
                        ? "+"
                        : line.type === "removed"
                        ? "-"
                        : " "}
                    </span>
                    {line.content}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Changes List */}
      {activeTab === "changes" && (
        <div className="space-y-3">
          {result.changes.map((change, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-xl p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <Badge variant={changeTypeBadgeVariants[change.type]}>
                  {changeTypeLabels[change.type]}
                </Badge>
                {change.section && (
                  <span className="text-xs text-gray-400">{change.section}</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-red-50 rounded-lg p-2">
                  <p className="text-xs text-red-500 font-medium mb-1">Before</p>
                  <p className="text-red-800 line-through text-xs">{change.original}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2">
                  <p className="text-xs text-green-500 font-medium mb-1">After</p>
                  <p className="text-green-800 text-xs">{change.optimized}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 italic">{change.reason}</p>
            </div>
          ))}
        </div>
      )}

      {/* Keywords */}
      {activeTab === "keywords" && (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-green-700 mb-2">
              ✅ Keywords Matched ({result.keywordsMatched.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {result.keywordsMatched.map((kw) => (
                <Badge key={kw} variant="success">
                  {kw}
                </Badge>
              ))}
            </div>
          </div>
          {result.keywordsMissing.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-2">
                ⚠️ Keywords Missing ({result.keywordsMissing.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {result.keywordsMissing.map((kw) => (
                  <Badge key={kw} variant="warning">
                    {kw}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                These keywords were in the JD but not added — because the
                candidate does not have that experience.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Download */}
      {onDownload && (
        <Button
          onClick={onDownload}
          loading={isDownloading}
          className="w-full"
          size="lg"
        >
          📄 Download Optimized PDF
        </Button>
      )}
    </div>
  );
}
