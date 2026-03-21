import React from "react";

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function TextArea({
  label,
  error,
  helperText,
  className = "",
  ...props
}: TextAreaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full rounded-lg border px-3 py-2 text-sm text-gray-900
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors duration-150
          disabled:bg-gray-50 disabled:cursor-not-allowed
          ${error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white hover:border-gray-400"}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
