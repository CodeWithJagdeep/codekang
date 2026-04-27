'use client';

import { useState, use } from 'react';
import { motion } from 'framer-motion';
import {
  RiArrowLeftLine,
  RiBriefcaseLine,
  RiMapPinLine,
  RiTimeLine,
  RiSendPlane2Line,
  RiCheckLine,
  RiUploadCloud2Line,
  RiErrorWarningLine,
  RiFilePdf2Line,
} from 'react-icons/ri';
import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';
import Link from 'next/link';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getStorage } from 'firebase/storage';
import app from '@/lib/firebase';

const storage = getStorage(app);

const JOBS = {
  'senior-ai-engineer': {
    title: 'Senior AI Engineer',
    loc: 'Remote',
    team: 'Core Intelligence',
    impact: 'Help us build the early brain of a truly autonomous engineering partner.',
    description: 'We are looking for an engineer who is obsessed with LLM reasoning and agentic workflows. We are in the early days of building the foundation that allows an AI to assist, plan, and eventually execute code with high precision.',
    whatYoullDo: [
      'Design and implement advanced reasoning loops for the Kang engine.',
      "Optimize the agent's ability to navigate large, complex codebases.",
      'Build specialized tools that the agent can use to verify its own work (tests, linting, etc.).',
      "Experiment with new model architectures and prompting strategies to push the boundaries of what's possible.",
    ],
    requirements: [
      '5+ years of experience in software engineering.',
      'Deep understanding of LLMs, vector databases, and agentic frameworks.',
      'Expertise in TypeScript, Python, and Rust.',
      'A portfolio of high-impact AI projects or contributions to open-source AI tools.',
    ],
  },
  'product-designer': {
    title: 'Product Designer',
    loc: 'Remote',
    team: 'UX & Brand',
    impact: 'Define how humans and AI collaborate on the future of software.',
    description: "We need a designer who can think beyond traditional UI. How do you visualize an AI's thought process? How do you make autonomous actions feel safe and controllable? You will be responsible for the entire visual and functional identity of the Kang platform.",
    whatYoullDo: [
      'Design the next generation of AI-human collaboration interfaces.',
      'Create a visual language that balances brutalist engineering with high-end premium aesthetics.',
      'Prototype complex, data-rich dashboards that remain intuitive for fast-moving teams.',
      'Own the brand identity across the entire product ecosystem.',
    ],
    requirements: [
      'Portfolio showcasing high-fidelity, functional web applications.',
      'Experience designing for AI or developer-focused tools.',
      'Expertise in Figma, Framer, and a strong understanding of CSS/React.',
      'A "white brutalist" eye—sharp, structured, and unapologetically bold.',
    ],
  },
  'backend-systems-architect': {
    title: 'Backend Systems Architect',
    loc: 'Remote',
    team: 'Infrastructure',
    impact: 'Build the engine that powers millions of autonomous code actions.',
    description: 'The Kang agent needs a massive, distributed infrastructure to operate at scale. You will design the systems that handle real-time code analysis, containerized execution environments, and massive vector search clusters.',
    whatYoullDo: [
      'Architect the distributed systems that power our autonomous agent.',
      'Ensure 99.9% reliability for mission-critical engineering workflows.',
      'Optimize our cloud infrastructure for high-concurrency AI workloads.',
      'Build secure, isolated execution environments for the agent to run and test code.',
    ],
    requirements: [
      'Ex-Scale engineering experience (Kubernetes, AWS, GCP).',
      'Mastery of distributed systems and microservices architecture.',
      'Expertise in Node.js, Go, or Rust.',
      'A deep understanding of security best practices in cloud environments.',
    ],
  },
  'security-researcher': {
    title: 'Security Researcher',
    loc: 'Remote',
    team: 'Security',
    impact: 'Make autonomous engineering the most secure way to build software.',
    description: "You will be the guardian of the Kang ecosystem. Your job is to find vulnerabilities in our agent's reasoning and build the security layers that prevent it from making mistakes.",
    whatYoullDo: [
      "Perform red-teaming on our agent's decision-making process.",
      'Develop automated scanning tools that the agent uses to verify its own security.',
      'Research new attack vectors in AI systems and build mitigations.',
      "Work with our enterprise customers to ensure their code is safe in the autonomous age.",
    ],
    requirements: [
      'Deep background in application security and penetration testing.',
      'Experience with AI security or LLM jailbreaking techniques.',
      'Strong coding skills in Python or Go.',
      'Relevant certifications (OSCP, CISSP) or a track record of CVE discovery.',
    ],
  },
};

type UploadState = 'idle' | 'uploading' | 'done' | 'error';

export default function JobDescriptionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const job = JOBS[slug as keyof typeof JOBS];

  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resumeUrl, setResumeUrl] = useState('');

  if (!job) return <div className="p-20 text-center font-black">JOB NOT FOUND</div>;

  async function uploadResume(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const path = `resumes/${slug}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      const task = uploadBytesResumable(storageRef, file);

      task.on(
        'state_changed',
        (snap) => {
          setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
        },
        (err) => reject(err),
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        },
      );
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setErrorMsg('Only PDF files are accepted.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File must be under 5MB.');
      return;
    }
    setResumeFile(file);
    setErrorMsg('');
    setUploadState('idle');
    setResumeUrl('');
  }

  const handleApply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const coverNote = formData.get('coverNote') as string;

    let finalResumeUrl = resumeUrl;

    try {
      // Upload resume if a file was selected and not yet uploaded
      if (resumeFile && !resumeUrl) {
        setUploadState('uploading');
        finalResumeUrl = await uploadResume(resumeFile);
        setResumeUrl(finalResumeUrl);
        setUploadState('done');
      }

      const res = await fetch('/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          jobSlug: slug,
          jobTitle: job.title,
          resumeUrl: finalResumeUrl || undefined,
          coverNote: coverNote || undefined,
        }),
      });

      if (res.ok) {
        setApplied(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error ?? 'Failed to submit. Please try again.');
        setUploadState('error');
      }
    } catch {
      setErrorMsg('Could not reach the server. Check your connection.');
      setUploadState('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-black font-[family-name:var(--font-space-grotesk)]">
      <HomeHeader />

      <main className="max-w-6xl mx-auto px-10 pt-32 pb-40">
        <Link href="/in/careers" className="inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-gray-400 hover:text-[#f97316] mb-12 transition-colors">
          <RiArrowLeftLine /> BACK TO CAREERS
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-20">

          {/* ── Job Content ── */}
          <div>
            <div className="mb-12">
              <div className="flex gap-4 text-[12px] font-black uppercase tracking-[0.2em] text-[#f97316] mb-4">
                <span className="flex items-center gap-1"><RiBriefcaseLine /> {job.team}</span>
                <span className="flex items-center gap-1"><RiMapPinLine /> {job.loc}</span>
                <span className="flex items-center gap-1"><RiTimeLine /> FULL-TIME</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-tight mb-8">
                {job.title}
              </h1>
              <p className="text-2xl font-black uppercase text-[#f97316] leading-none mb-12">
                {job.impact}
              </p>
            </div>

            <div className="space-y-16">
              <section>
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Overview</h3>
                <p className="text-xl text-gray-500 font-medium uppercase tracking-tight leading-tight">
                  {job.description}
                </p>
              </section>

              <section>
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">What you'll do</h3>
                <ul className="space-y-6">
                  {job.whatYoullDo.map((item, i) => (
                    <li key={i} className="flex gap-4 items-start">
                      <div className="w-2 h-2 mt-2 bg-[#f97316] shrink-0" />
                      <span className="text-lg font-black uppercase leading-tight">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Requirements</h3>
                <ul className="space-y-6">
                  {job.requirements.map((item, i) => (
                    <li key={i} className="flex gap-4 items-start">
                      <div className="w-2 h-2 mt-2 bg-black shrink-0" />
                      <span className="text-lg text-gray-500 font-medium uppercase tracking-tight leading-tight">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          {/* ── Apply Form ── */}
          <div className="lg:sticky lg:top-32 h-fit">
            <div className="border-4 border-black p-10 bg-white shadow-[12px_12px_0px_0px_rgba(249,115,22,1)]">
              <h3 className="text-2xl font-black uppercase mb-8">Apply for this role</h3>

              {applied ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <div className="w-20 h-20 border-4 border-[#f97316] rounded-full flex items-center justify-center mx-auto mb-6">
                    <RiCheckLine size={48} className="text-[#f97316]" />
                  </div>
                  <h4 className="text-xl font-black uppercase mb-2">Application Sent</h4>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-tight">Our team will be in touch shortly.</p>
                </motion.div>
              ) : (
                <form className="space-y-6" onSubmit={handleApply}>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Full Name *</label>
                    <input
                      required
                      type="text"
                      name="name"
                      className="w-full border-2 border-black px-4 py-3 text-[14px] font-bold uppercase outline-none focus:border-[#f97316] transition-colors"
                      placeholder="JANE DOE"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address *</label>
                    <input
                      required
                      type="email"
                      name="email"
                      className="w-full border-2 border-black px-4 py-3 text-[14px] font-bold uppercase outline-none focus:border-[#f97316] transition-colors"
                      placeholder="JANE@GMAIL.COM"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      className="w-full border-2 border-black px-4 py-3 text-[14px] font-bold uppercase outline-none focus:border-[#f97316] transition-colors"
                      placeholder="+1 234 567 890"
                    />
                  </div>

                  {/* Resume Upload */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Resume / CV (PDF, max 5MB)</label>
                    <label className="relative flex flex-col items-center justify-center gap-2 border-2 border-dashed border-black p-6 cursor-pointer hover:bg-gray-50 transition-colors group">
                      {resumeFile ? (
                        <>
                          <RiFilePdf2Line size={28} className="text-[#f97316]" />
                          <span className="text-[11px] font-black uppercase tracking-widest text-center break-all">{resumeFile.name}</span>
                          {uploadState === 'uploading' && (
                            <div className="w-full bg-gray-200 h-1.5 mt-1">
                              <div className="bg-[#f97316] h-1.5 transition-all" style={{ width: `${uploadProgress}%` }} />
                            </div>
                          )}
                          {uploadState === 'done' && (
                            <span className="text-[10px] font-black text-[#22c55e] uppercase">Uploaded ✓</span>
                          )}
                        </>
                      ) : (
                        <>
                          <RiUploadCloud2Line size={28} className="group-hover:text-[#f97316] transition-colors" />
                          <span className="text-[11px] font-black uppercase tracking-widest">UPLOAD PDF</span>
                        </>
                      )}
                      <input
                        type="file"
                        name="resume"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>

                  {/* Cover Note */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cover Note (optional)</label>
                    <textarea
                      name="coverNote"
                      rows={3}
                      className="w-full border-2 border-black px-4 py-3 text-[13px] font-bold uppercase outline-none focus:border-[#f97316] transition-colors resize-none"
                      placeholder="ANYTHING YOU WANT US TO KNOW..."
                    />
                  </div>

                  {errorMsg && (
                    <div className="flex items-center gap-2 border-2 border-red-400 px-4 py-3 text-[12px] font-bold text-red-500 uppercase tracking-tight">
                      <RiErrorWarningLine size={16} className="shrink-0" />
                      {errorMsg}
                    </div>
                  )}

                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full flex items-center justify-center gap-3 border-2 border-black bg-black text-white py-5 text-[15px] font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(249,115,22,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(249,115,22,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {loading
                      ? uploadState === 'uploading'
                        ? `UPLOADING ${uploadProgress}%`
                        : 'SUBMITTING...'
                      : 'SUBMIT APPLICATION'
                    }
                    <RiSendPlane2Line size={20} />
                  </button>
                </form>
              )}
            </div>

            <p className="mt-8 text-[11px] text-center font-bold text-gray-400 uppercase tracking-widest">
              By applying, you agree to our{' '}
              <span className="underline cursor-pointer">Candidate Privacy Policy</span>.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
