import React from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const features = [
  {
    icon: "🎯",
    title: "ATS Keyword Optimization",
    description:
      "Our AI identifies the exact keywords hiring managers and ATS systems look for, then seamlessly integrates them into your existing experience.",
  },
  {
    icon: "✅",
    title: "Zero Fabrication Policy",
    description:
      "We only enhance what's already there. No invented skills, no fake metrics — just better phrasing of your real experience.",
  },
  {
    icon: "📊",
    title: "Match Score Analysis",
    description:
      "See your resume-to-JD match score before and after optimization, with a breakdown of matched and missing keywords.",
  },
  {
    icon: "📄",
    title: "PDF Export",
    description:
      "Download your optimized resume as a professionally formatted PDF, ready to submit.",
  },
  {
    icon: "🔄",
    title: "Side-by-Side Diff",
    description:
      "Review every single change with clear before/after comparison and reasons for each modification.",
  },
  {
    icon: "⚡",
    title: "Claude AI Powered",
    description:
      "Powered by Anthropic's Claude with OpenAI as fallback — the most accurate language models available.",
  },
];

const steps = [
  {
    step: "01",
    title: "Paste the Job Description",
    description: "Copy-paste the JD or provide a URL. Our AI extracts key requirements and keywords.",
  },
  {
    step: "02",
    title: "Upload Your Resume",
    description: "Upload your current resume PDF. We extract and parse all content.",
  },
  {
    step: "03",
    title: "AI Optimization",
    description: "Claude AI rewrites your bullets with stronger verbs and integrated keywords — nothing fabricated.",
  },
  {
    step: "04",
    title: "Review & Download",
    description: "Review changes in a diff view, then download your optimized PDF.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Powered by Claude AI
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 text-balance leading-tight">
            Beat ATS with{" "}
            <span className="text-blue-600">AI-Optimized</span> Resumes
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Our AI enhances your resume to match job descriptions perfectly —
            using stronger verbs and natural keyword integration.{" "}
            <strong>Zero fabrication guaranteed.</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/optimize"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              Optimize My Resume →
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors border border-gray-200"
            >
              See How It Works
            </a>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            No credit card required · Works in demo mode without API keys
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Everything You Need to Land the Job
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Professional-grade resume optimization with complete transparency
              about every change made.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all group"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              How It Works
            </h2>
            <p className="text-gray-600">
              Four simple steps to a better resume
            </p>
          </div>
          <div className="space-y-6">
            {steps.map((item, idx) => (
              <div
                key={idx}
                className="flex gap-6 items-start bg-white rounded-2xl p-6 border border-gray-100"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Optimize Your Resume?
          </h2>
          <p className="text-blue-100 mb-8">
            Join thousands of job seekers who have improved their interview
            rate with AI-optimized resumes.
          </p>
          <Link
            href="/optimize"
            className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Get Started Free →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
