import type { Metadata } from "next";
import "./globals.css";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";

export const metadata: Metadata = {
  title: "ResumeAI - AI-Powered Resume Optimizer",
  description:
    "Optimize your resume with AI to match job descriptions and beat ATS filters — without fabricating experiences.",
  keywords: ["resume optimizer", "ATS", "AI resume", "job application"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
