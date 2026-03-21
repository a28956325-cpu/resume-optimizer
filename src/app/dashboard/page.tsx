import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default async function DashboardPage() {
  let session = null;
  let optimizations: {
    id: string;
    jobTitle: string | null;
    companyName: string | null;
    matchScoreBefore: number | null;
    matchScoreAfter: number | null;
    createdAt: Date;
  }[] = [];

  try {
    session = await getServerSession(authOptions);

    if (session?.user) {
      const { prisma } = await import("@/lib/db/prisma");
      const userId = (session.user as { id?: string }).id;
      if (userId) {
        optimizations = await prisma.optimization.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            jobTitle: true,
            companyName: true,
            matchScoreBefore: true,
            matchScoreAfter: true,
            createdAt: true,
          },
        });
      }
    }
  } catch {
    // DB not available — show empty state
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Your Optimizations
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {session
                ? `Welcome back, ${session.user?.name ?? session.user?.email}`
                : "Sign in to save and track your optimizations"}
            </p>
          </div>
          <Link href="/optimize">
            <Button>+ New Optimization</Button>
          </Link>
        </div>

        {!session && (
          <Card>
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🔐</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sign in to track your history
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Sign in with Google or GitHub to save your optimization history
                and access past results.
              </p>
              <Link href="/">
                <Button>Sign In →</Button>
              </Link>
            </div>
          </Card>
        )}

        {session && optimizations.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📄</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No optimizations yet
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Create your first optimization to see results here.
              </p>
              <Link href="/optimize">
                <Button>Optimize My Resume →</Button>
              </Link>
            </div>
          </Card>
        )}

        {optimizations.length > 0 && (
          <div className="grid gap-4">
            {optimizations.map((opt) => (
              <Card key={opt.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {opt.jobTitle ?? "Untitled Position"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {opt.companyName ?? "Company not specified"} ·{" "}
                      {new Date(opt.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {opt.matchScoreBefore != null &&
                      opt.matchScoreAfter != null && (
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Match Score</p>
                          <p className="text-sm font-semibold text-green-600">
                            {opt.matchScoreBefore}% →{" "}
                            {opt.matchScoreAfter}%
                          </p>
                        </div>
                      )}
                    <Link href={`/result/${opt.id}`}>
                      <Button variant="outline" size="sm">
                        View →
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
