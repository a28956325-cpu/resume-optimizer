import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-blue-500 rounded-md flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="font-bold text-white">ResumeAI</span>
            </div>
            <p className="text-sm leading-relaxed">
              AI-powered resume optimization that improves your ATS score
              without fabricating experiences.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/optimize" className="hover:text-white transition-colors">
                  Optimize Resume
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-gray-500">Privacy Policy</span>
              </li>
              <li>
                <span className="text-gray-500">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} ResumeAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
