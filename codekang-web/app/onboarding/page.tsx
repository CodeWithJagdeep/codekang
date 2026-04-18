"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  getAccessToken,
  completeOnboarding,
  selectPlan,
  linkVcs,
  type User,
} from "@/lib/auth";
import Logo from "@/public/brandlogo/logo-transparent.png";

type Role = "solo" | "team_lead" | "engineering_manager" | "other";
type UseCase = "code_review" | "bug_fixing" | "ci_integration" | "all";

const TOTAL_STEPS = 5;

const ROLES: { value: Role; label: string; desc: string }[] = [
  { value: "solo", label: "Solo Developer", desc: "Working independently on projects" },
  { value: "team_lead", label: "Team Lead", desc: "Leading a small engineering team" },
  { value: "engineering_manager", label: "Engineering Manager", desc: "Managing multiple teams" },
  { value: "other", label: "Other", desc: "Something else entirely" },
];

const USE_CASES: { value: UseCase; label: string; icon: string }[] = [
  { value: "code_review", label: "Automated code review", icon: "🔍" },
  { value: "bug_fixing", label: "AI-powered bug fixing", icon: "🐛" },
  { value: "ci_integration", label: "CI/CD integration", icon: "⚙️" },
  { value: "all", label: "All of the above", icon: "✨" },
];

const PLANS = [
  {
    value: "free",
    label: "Free",
    price: "$0",
    period: "/mo",
    credits: "50 credits/mo",
    features: ["50 AI credits/month", "1 repository", "Basic code review"],
  },
  {
    value: "starter",
    label: "Starter",
    price: "$15",
    period: "/mo",
    credits: "400 credits/mo",
    features: ["400 AI credits/month", "5 repositories", "Advanced code review", "Bug fixing"],
    highlight: false,
  },
  {
    value: "pro",
    label: "Pro",
    price: "$29",
    period: "/mo",
    credits: "1,500 credits/mo",
    features: ["1,500 AI credits/month", "Unlimited repositories", "Priority AI queue", "CI/CD integration"],
    highlight: true,
  },
  {
    value: "team",
    label: "Team",
    price: "$249",
    period: "/mo",
    credits: "Unlimited",
    features: ["Unlimited AI credits", "Unlimited repositories", "Team dashboard", "Dedicated support"],
  },
];

function getUserFromStorage(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role | null>(null);
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("free");
  const [user, setUser] = useState<User | null>(null);
  const [gitlabToken, setGitlabToken] = useState("");
  const [bitbucketToken, setBitbucketToken] = useState("");
  const [linkingProvider, setLinkingProvider] = useState<"gitlab" | "bitbucket" | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/in/login");
      return;
    }
    setUser(getUserFromStorage());
  }, [router]);

  async function handleSelectPlan() {
    setSubmitting(true);
    try {
      await selectPlan(selectedPlan);
    } catch {
      // non-fatal — continue
    } finally {
      setSubmitting(false);
      setStep(4);
    }
  }

  async function handleLinkVcs(provider: "gitlab" | "bitbucket") {
    const token = provider === "gitlab" ? gitlabToken : bitbucketToken;
    if (!token.trim()) return;
    setLinkingProvider(provider);
    setLinkError(null);
    try {
      const updated = await linkVcs(provider, token.trim());
      setUser(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(updated));
      }
      if (provider === "gitlab") setGitlabToken("");
      else setBitbucketToken("");
    } catch (e) {
      setLinkError(e instanceof Error ? e.message : "Failed to link provider");
    } finally {
      setLinkingProvider(null);
    }
  }

  async function handleFinish() {
    setSubmitting(true);
    try {
      await completeOnboarding();
    } catch {
      // non-fatal
    }
    router.replace("/dashboard");
  }

  const githubLinked = Boolean(user?.githubUsername);
  const gitlabLinked = Boolean(user?.gitlabUsername);
  const bitbucketLinked = Boolean(user?.bitbucketUsername);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      <header className="flex items-center justify-between px-6 lg:px-12 py-4">
        <Image src={Logo} alt="CodeKang" width={120} height={32} className="w-auto h-14" />
        <div className="flex items-center gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? "w-8 bg-[#d4af37]" : "w-4 bg-white/20"
              }`}
            />
          ))}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">

          {/* Step 1: Role */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <p className="text-[#d4af37] text-sm font-semibold uppercase tracking-widest mb-3">
                  Step 1 of {TOTAL_STEPS}
                </p>
                <h1 className="text-4xl font-bold leading-tight mb-4">Welcome to CodeKang 👋</h1>
                <p className="text-white/60 text-lg">
                  Let&apos;s get you set up in a few minutes. What best describes your role?
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      role === r.value
                        ? "border-[#d4af37] bg-[#d4af37]/10"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <p className="font-semibold">{r.label}</p>
                    <p className="text-sm text-white/50 mt-0.5">{r.desc}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!role}
                className="w-full py-3 rounded-xl font-semibold transition-all bg-[#d4af37] text-black hover:bg-[#c4a030] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Use case */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <p className="text-[#d4af37] text-sm font-semibold uppercase tracking-widest mb-3">
                  Step 2 of {TOTAL_STEPS}
                </p>
                <h1 className="text-4xl font-bold leading-tight mb-4">
                  What will you use CodeKang for?
                </h1>
                <p className="text-white/60 text-lg">
                  We&apos;ll tailor your experience based on your primary use case.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {USE_CASES.map((u) => (
                  <button
                    key={u.value}
                    onClick={() => setUseCase(u.value)}
                    className={`text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${
                      useCase === u.value
                        ? "border-[#d4af37] bg-[#d4af37]/10"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-2xl">{u.icon}</span>
                    <span className="font-semibold">{u.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl font-semibold border border-white/20 text-white/70 hover:bg-white/5 transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!useCase}
                  className="flex-[2] py-3 rounded-xl font-semibold transition-all bg-[#d4af37] text-black hover:bg-[#c4a030] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Plan selection */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <p className="text-[#d4af37] text-sm font-semibold uppercase tracking-widest mb-3">
                  Step 3 of {TOTAL_STEPS}
                </p>
                <h1 className="text-3xl font-bold leading-tight mb-4">Choose your plan</h1>
                <p className="text-white/60">
                  You can upgrade or downgrade at any time.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {PLANS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setSelectedPlan(p.value)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      selectedPlan === p.value
                        ? "border-[#d4af37] bg-[#d4af37]/10"
                        : p.highlight
                        ? "border-white/30 bg-white/5 hover:border-white/40"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{p.label}</span>
                        {p.highlight && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#d4af37]">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-xl">{p.price}</span>
                        <span className="text-white/50 text-sm">{p.period}</span>
                      </div>
                    </div>
                    <p className="text-sm text-[#d4af37]/80 mb-2">{p.credits}</p>
                    <ul className="space-y-1">
                      {p.features.map((f) => (
                        <li key={f} className="text-xs text-white/50 flex items-center gap-1.5">
                          <span className="text-[#d4af37]">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl font-semibold border border-white/20 text-white/70 hover:bg-white/5 transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSelectPlan}
                  disabled={submitting}
                  className="flex-[2] py-3 rounded-xl font-semibold transition-all bg-[#d4af37] text-black hover:bg-[#c4a030] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    "Continue →"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Connect VCS */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <p className="text-[#d4af37] text-sm font-semibold uppercase tracking-widest mb-3">
                  Step 4 of {TOTAL_STEPS}
                </p>
                <h1 className="text-3xl font-bold leading-tight mb-4">Connect your code</h1>
                <p className="text-white/60">
                  Link your version control providers so CodeKang can access your repositories.
                </p>
              </div>

              <div className="space-y-3">
                {/* GitHub */}
                <div className={`p-4 rounded-xl border ${githubLinked ? "border-green-500/40 bg-green-500/5" : "border-white/10 bg-white/5"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      <div>
                        <p className="font-semibold">GitHub</p>
                        {githubLinked ? (
                          <p className="text-xs text-green-400">Connected as @{user?.githubUsername}</p>
                        ) : (
                          <p className="text-xs text-white/50">Not connected</p>
                        )}
                      </div>
                    </div>
                    {githubLinked && (
                      <span className="text-green-400 text-sm font-semibold">✓ Linked</span>
                    )}
                  </div>
                  {!githubLinked && (
                    <p className="mt-3 text-xs text-white/40">
                      GitHub was not linked during sign-in. Sign out and sign in with GitHub to link it.
                    </p>
                  )}
                </div>

                {/* GitLab */}
                <div className={`p-4 rounded-xl border ${gitlabLinked ? "border-green-500/40 bg-green-500/5" : "border-white/10 bg-white/5"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#FC6D26">
                        <path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 0 0-.867 0L16.418 9.45H7.582L4.918 1.263a.455.455 0 0 0-.867 0L1.387 9.452.045 13.587a.924.924 0 0 0 .331 1.023L12 23.054l11.624-8.443a.92.92 0 0 0 .331-1.024" />
                      </svg>
                      <div>
                        <p className="font-semibold">GitLab</p>
                        {gitlabLinked ? (
                          <p className="text-xs text-green-400">Connected as @{user?.gitlabUsername}</p>
                        ) : (
                          <p className="text-xs text-white/50">Personal access token</p>
                        )}
                      </div>
                    </div>
                    {gitlabLinked && (
                      <span className="text-green-400 text-sm font-semibold">✓ Linked</span>
                    )}
                  </div>
                  {!gitlabLinked && (
                    <div className="flex gap-2 mt-1">
                      <input
                        type="password"
                        placeholder="glpat-xxxxxxxxxxxxxxxxxxxx"
                        value={gitlabToken}
                        onChange={(e) => setGitlabToken(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 focus:border-[#d4af37]/60 outline-none placeholder:text-white/30"
                      />
                      <button
                        onClick={() => handleLinkVcs("gitlab")}
                        disabled={!gitlabToken.trim() || linkingProvider === "gitlab"}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#d4af37] text-black hover:bg-[#c4a030] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {linkingProvider === "gitlab" ? (
                          <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                          "Link"
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Bitbucket */}
                <div className={`p-4 rounded-xl border ${bitbucketLinked ? "border-green-500/40 bg-green-500/5" : "border-white/10 bg-white/5"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#2684FF">
                        <path d="M.778 1.213a.768.768 0 0 0-.768.892l3.263 19.81c.084.5.515.865 1.022.865h15.364c.382 0 .71-.266.78-.64l3.264-20.033a.768.768 0 0 0-.768-.891zM14.316 15.56H9.754l-1.223-6.421h7.44z" />
                      </svg>
                      <div>
                        <p className="font-semibold">Bitbucket</p>
                        {bitbucketLinked ? (
                          <p className="text-xs text-green-400">Connected as @{user?.bitbucketUsername}</p>
                        ) : (
                          <p className="text-xs text-white/50">App password or token</p>
                        )}
                      </div>
                    </div>
                    {bitbucketLinked && (
                      <span className="text-green-400 text-sm font-semibold">✓ Linked</span>
                    )}
                  </div>
                  {!bitbucketLinked && (
                    <div className="flex gap-2 mt-1">
                      <input
                        type="password"
                        placeholder="App password or OAuth token"
                        value={bitbucketToken}
                        onChange={(e) => setBitbucketToken(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 focus:border-[#d4af37]/60 outline-none placeholder:text-white/30"
                      />
                      <button
                        onClick={() => handleLinkVcs("bitbucket")}
                        disabled={!bitbucketToken.trim() || linkingProvider === "bitbucket"}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#d4af37] text-black hover:bg-[#c4a030] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {linkingProvider === "bitbucket" ? (
                          <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                          "Link"
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {linkError && (
                  <p className="text-red-400 text-sm px-1">{linkError}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-xl font-semibold border border-white/20 text-white/70 hover:bg-white/5 transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="flex-[2] py-3 rounded-xl font-semibold transition-all bg-[#d4af37] text-black hover:bg-[#c4a030]"
                >
                  {githubLinked || gitlabLinked || bitbucketLinked ? "Continue →" : "Skip for now →"}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: All set */}
          {step === 5 && (
            <div className="space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div>
                <p className="text-[#d4af37] text-sm font-semibold uppercase tracking-widest mb-3">
                  Step 5 of {TOTAL_STEPS}
                </p>
                <div className="text-6xl mb-6">🚀</div>
                <h1 className="text-4xl font-bold leading-tight mb-4">You&apos;re all set!</h1>
                <p className="text-white/60 text-lg max-w-sm mx-auto">
                  Connect your first repository on the dashboard to start getting AI-powered insights.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-left space-y-3">
                <h3 className="font-semibold text-white/80">What&apos;s next:</h3>
                <ul className="space-y-2 text-sm text-white/60">
                  <li className="flex items-center gap-2">
                    <span className="text-[#d4af37]">✓</span>
                    Connect your repositories from the dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#d4af37]">✓</span>
                    CodeKang will index your codebase
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#d4af37]">✓</span>
                    Get your first AI code review in minutes
                  </li>
                </ul>
              </div>

              <button
                onClick={handleFinish}
                disabled={submitting}
                className="w-full py-4 rounded-xl font-semibold text-lg transition-all bg-[#d4af37] text-black hover:bg-[#c4a030] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  "Go to Dashboard →"
                )}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
