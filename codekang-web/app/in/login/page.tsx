"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithGoogle, signInWithGitHub, saveTokens } from "@/lib/auth";
import Logo from "@/public/brandlogo/logo-transparent.png";

type Provider = "google" | "github";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(provider: Provider) {
    setLoading(provider);
    setError(null);
    try {
      const result =
        provider === "google" ? await signInWithGoogle() : await signInWithGitHub();

      saveTokens(result.accessToken, result.refreshToken);
      localStorage.setItem("user", JSON.stringify(result.user));

      if (result.isNewUser || !result.user.onboardingCompleted) {
        router.replace("/onboarding");
      } else {
        router.replace("/dashboard");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      // Popup closed by user — don't show an error
      if (msg.includes("popup-closed") || msg.includes("cancelled")) {
        setLoading(null);
        return;
      }
      setError(msg);
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen text-[#d4d4d4] font-sans overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-2">
          <Image
            src={Logo}
            alt="CodeKang"
            width={120}
            height={32}
            className="w-auto h-16"
          />
        </div>
      </header>

      <main className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] px-6 mt-6 lg:px-10 relative overflow-hidden">
        {/* Left Side */}
        <div className="w-full lg:w-[50%] flex flex-col bg-white/10 justify-center rounded-4xl py-10 lg:py-10">
          <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-gradient-to-br from-[#d4af37]/20 to-transparent blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[20%] left-[30%] w-[250px] h-[250px] bg-gradient-to-tr from-[#6366f1]/10 to-transparent blur-[100px] pointer-events-none" />

          <div className="max-w-full mx-auto lg:mx-0">
            <h1 className="text-5xl text-center text-white leading-[1.1] tracking-tight mb-6">
              Intelligent Code,
              <br /> faster delivery
            </h1>
            <p className="text-xl text-white/90 max-w-md mx-auto text-center mb-12">
              CodeKang analyzes your codebase, finds issues, and suggests fixes
              in seconds.
            </p>

            {error && (
              <div className="mb-6 mx-auto max-w-xl p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="w-full max-w-xl mx-auto rounded-[24px] relative">
              <div className="space-y-6 relative z-10">
                <div className="grid grid-cols-2 gap-3">
                  {/* Google */}
                  <button
                    onClick={() => handleLogin("google")}
                    disabled={loading !== null}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading === "google" ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    )}
                    Google
                  </button>

                  {/* GitHub */}
                  <button
                    onClick={() => handleLogin("github")}
                    disabled={loading !== null}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading === "github" ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    )}
                    GitHub
                  </button>
                </div>
                <p className="text-center text-xs text-white/50">
                  More providers coming soon
                </p>
              </div>
            </div>

            <button className="mt-8 text-sm font-medium text-[#a1a1a1] hover:text-white transition-all underline underline-offset-4 decoration-white/20">
              Request enterprise access
            </button>
          </div>
        </div>

        {/* Right Side: Preview Card */}
        <div className="hidden lg:flex w-[50%] items-center justify-center py-24">
          <div className="w-full max-w-[640px] aspect-[4/3] rounded-[32px] bg-[#f0f0e8] p-8 shadow-2xl relative group hover:-translate-y-1 transition-transform duration-500">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#1a1614]/10" />
                <div className="w-3 h-3 rounded-full bg-[#1a1614]/10" />
                <div className="w-3 h-3 rounded-full bg-[#1a1614]/10" />
              </div>
              <div className="text-[10px] font-bold text-[#1a1614]/40 uppercase tracking-widest">
                Project Health Overview
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-[64px] font-serif font-light text-[#1a1614] leading-[1.1] tracking-tight">
                What CodeKang
                <br />
                Found This Week
              </h2>
            </div>

            <div className="w-full h-8 rounded-lg bg-[#1a1614]/10 mb-12 flex items-center px-4">
              <span className="text-[10px] font-bold text-[#1a1614]/40 uppercase tracking-widest">
                Team Engineering Insights
              </span>
            </div>

            <div>
              <div className="text-[20px] font-serif font-light text-[#1a1614] mb-6">
                Real-time performance metrics...
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-6 rounded-2xl bg-[#1a1614] text-white">
                  <div className="text-[48px] font-serif font-light mb-4 leading-none">124</div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Issues detected</div>
                </div>
                <div className="p-6 rounded-2xl bg-[#1a1614] text-white">
                  <div className="text-[48px] font-serif font-light mb-4 leading-none">42</div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">PRs reviewed</div>
                </div>
                <div className="p-6 rounded-2xl bg-[#1a1614] text-white">
                  <div className="text-[48px] font-serif font-light mb-4 leading-none">85%</div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Code Quality Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
