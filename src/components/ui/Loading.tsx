import React from "react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

export default function Loading({
  size = "md",
  text,
  fullScreen = false,
}: LoadingProps) {
  const sizeMap = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <svg
        className={`animate-spin text-blue-600 ${sizeMap[size]}`}
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      {text && <p className="text-sm text-gray-600 animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export function SkeletonLine({ width = "100%" }: { width?: string }) {
  return (
    <div
      className="h-4 bg-gray-200 rounded animate-pulse"
      style={{ width }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="p-6 bg-white rounded-xl border border-gray-200 space-y-3">
      <SkeletonLine width="60%" />
      <SkeletonLine />
      <SkeletonLine width="80%" />
      <SkeletonLine width="40%" />
    </div>
  );
}
