import React from "react";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface ResultPageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { id } = await params;

  let optimization = null;

  try {
    const { prisma } = await import("@/lib/db/prisma");
    optimization = await prisma.optimization.findUnique({
      where: { id },
    });
  } catch {
    // DB unavailable
  }

  if (!optimization) {
    notFound();
  }

  const changes = optimization.changes as {
    original: string;
    optimized: string;
    reason: string;
    type: string;
  }[];

  const scoreDelta =
    (optimization.matchScoreAfter ?? 0) - (optimization.matchScoreBefore ?? 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {optimization.jobTitle ?? "Optimization Result"}
          </h1>
          <p className="text-gray-500 text-sm">
            {optimization.companyName &&
              `${optimization.companyName} · `}
            {new Date(optimization.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <p className="text-sm text-gray-500 mb-1">Before</p>
            <p className="text-3xl font-bold text-gray-700">
              {optimization.matchScoreBefore ?? 0}%
            </p>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <p className="text-sm text-green-600 mb-1">Improvement</p>
            <p className="text-3xl font-bold text-green-600">+{scoreDelta}%</p>
          </Card>
          <Card>
            <p className="text-sm text-blue-600 mb-1">After</p>
            <p className="text-3xl font-bold text-blue-700">
              {optimization.matchScoreAfter ?? 0}%
            </p>
          </Card>
        </div>

        {/* Diff */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Optimized Resume</h2>
          <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
            {optimization.optimizedResume}
          </pre>
        </Card>

        {/* Changes */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">
            Changes ({changes.length})
          </h2>
          <div className="space-y-3">
            {changes.map((change, idx) => (
              <div key={idx} className="border border-gray-100 rounded-lg p-3">
                <Badge variant="info" className="mb-2">
                  {change.type}
                </Badge>
                <div className="grid grid-cols-2 gap-2 text-xs mb-1">
                  <div className="bg-red-50 p-2 rounded line-through text-red-700">
                    {change.original}
                  </div>
                  <div className="bg-green-50 p-2 rounded text-green-700">
                    {change.optimized}
                  </div>
                </div>
                <p className="text-xs text-gray-400">{change.reason}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Keywords */}
        <Card>
          <h2 className="text-lg font-semibold mb-4">Keywords</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-green-600 mb-2">
                ✅ Matched ({optimization.keywordsMatched.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {optimization.keywordsMatched.map((kw) => (
                  <Badge key={kw} variant="success">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
            {optimization.keywordsMissing.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400 mb-2">
                  ⚠️ Missing ({optimization.keywordsMissing.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {optimization.keywordsMissing.map((kw) => (
                    <Badge key={kw} variant="warning">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
