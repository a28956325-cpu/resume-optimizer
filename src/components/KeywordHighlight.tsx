"use client";

import React from "react";
import Badge from "@/components/ui/Badge";

interface KeywordHighlightProps {
  text: string;
  keywords: string[];
  matchedKeywords: string[];
}

export default function KeywordHighlight({
  text,
  keywords,
  matchedKeywords,
}: KeywordHighlightProps) {
  const allKeywords = [...new Set([...keywords, ...matchedKeywords])];

  if (allKeywords.length === 0) {
    return <p className="text-sm text-gray-700 whitespace-pre-wrap">{text}</p>;
  }

  const parts: { text: string; isKeyword: boolean; isMatched: boolean }[] = [];
  let remaining = text;

  const sortedKeywords = allKeywords.sort((a, b) => b.length - a.length);
  const regex = new RegExp(
    `(${sortedKeywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi"
  );

  const splits = remaining.split(regex);
  for (const part of splits) {
    const isMatched = matchedKeywords.some(
      (k) => k.toLowerCase() === part.toLowerCase()
    );
    const isKeyword = allKeywords.some(
      (k) => k.toLowerCase() === part.toLowerCase()
    );
    parts.push({ text: part, isKeyword, isMatched });
  }

  return (
    <div>
      <p className="text-sm text-gray-700 whitespace-pre-wrap">
        {parts.map((part, idx) =>
          part.isKeyword ? (
            <mark
              key={idx}
              className={`rounded px-0.5 font-medium ${
                part.isMatched
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {part.text}
            </mark>
          ) : (
            <span key={idx}>{part.text}</span>
          )
        )}
      </p>
      <div className="mt-3 flex gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-green-100 rounded" />
          Matched keyword
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-yellow-100 rounded" />
          JD keyword
        </span>
      </div>
    </div>
  );
}

export function KeywordBadgeList({
  keywords,
  variant = "info",
}: {
  keywords: string[];
  variant?: "info" | "success" | "warning";
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {keywords.map((kw) => (
        <Badge key={kw} variant={variant}>
          {kw}
        </Badge>
      ))}
    </div>
  );
}
