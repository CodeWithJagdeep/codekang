'use client';

import { motion } from 'framer-motion';
import { 
  RiArrowLeftLine, 
  RiTimeLine, 
  RiUser3Line,
  RiTwitterXFill,
  RiLinkedinFill,
  RiLink
} from 'react-icons/ri';
import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function PostContent() {
  const params = useParams();
  const slug = params.slug as string;

  // In a real app, you'd fetch post data based on slug
  const post = {
    title: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    category: "Engineering",
    author: "Alex Rivera",
    date: "April 24, 2026",
    readTime: "12 min read",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200",
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-black font-[family-name:var(--font-space-grotesk)]">
      <HomeHeader />

      <main className="pt-32 pb-40">
        <article className="max-w-4xl mx-auto px-10">
          {/* ── Back Button ── */}
          <Link 
            href="/in/blog" 
            className="inline-flex items-center gap-2 text-[14px] font-black uppercase tracking-widest mb-12 hover:text-[#f97316] transition-colors group"
          >
            <RiArrowLeftLine className="group-hover:-translate-x-2 transition-transform" /> Back to Blog
          </Link>

          {/* ── Post Header ── */}
          <div className="mb-16">
            <span className="inline-block px-3 py-1 border-2 border-[#f97316] text-[#f97316] text-[12px] font-black uppercase tracking-[0.2em] mb-8">
              {post.category}
            </span>
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-10">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-8 py-8 border-y-2 border-black/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(249,115,22,1)]" />
                <div>
                  <p className="text-[14px] font-black uppercase leading-none mb-1">{post.author}</p>
                  <p className="text-[12px] font-medium text-gray-400 uppercase">Core Engineer</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <RiTimeLine className="text-[#f97316]" />
                <span className="font-black uppercase text-[13px]">{post.date} • {post.readTime}</span>
              </div>
              <div className="ml-auto flex items-center gap-4">
                <button className="p-2 border-2 border-black hover:bg-black hover:text-white transition-all">
                  <RiTwitterXFill size={20} />
                </button>
                <button className="p-2 border-2 border-black hover:bg-black hover:text-white transition-all">
                  <RiLinkedinFill size={20} />
                </button>
                <button className="p-2 border-2 border-black hover:bg-black hover:text-white transition-all">
                  <RiLink size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Featured Image ── */}
          <div className="mb-20 border-2 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
            <img src={post.image} alt={post.title} className="w-full h-auto grayscale" />
          </div>

          {/* ── Content (Mock) ── */}
          <div className="prose prose-xl max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-p:font-medium prose-p:text-gray-600 prose-p:uppercase prose-p:tracking-tight prose-p:leading-relaxed">
            <p className="text-2xl font-black text-black mb-12">
              The landscape of software development is undergoing a seismic shift. As Large Language Models become more sophisticated, the role of automated tools is evolving from simple syntax checkers to active participants in the engineering process.
            </p>

            <h2 className="text-4xl mt-20 mb-8">The Limitation of Legacy Tools</h2>
            <p className="mb-8">
              For decades, static analysis was the gold standard. It could catch memory leaks, find unused variables, and enforce style guides. But it lacked one critical component: context. It couldn't tell you *why* a piece of code was written, only that it followed or broke a set of predefined rules.
            </p>
            
            <div className="p-10 my-16 border-l-8 border-[#f97316] bg-[#f97316]/5">
              <p className="text-3xl font-black text-black leading-none">
                "CONTEXT IS THE DIFFERENCE BETWEEN A BUG REPORT AND A SOLUTION."
              </p>
            </div>

            <h2 className="text-4xl mt-20 mb-8">Enter Semantic Understanding</h2>
            <p className="mb-8">
              With CodeKang, we're moving beyond the AST (Abstract Syntax Tree). Our models analyze the relationship between PR descriptions, issue requirements, and the actual code changes. This allows our autonomous agents to provide feedback that actually matters to the project's goals.
            </p>

            <ul className="space-y-6 my-12">
              {["Intent-based bug detection", "Automated regression analysis", "Smart architectural suggestions"].map((item, i) => (
                <li key={i} className="flex items-center gap-4">
                   <div className="w-3 h-3 bg-[#f97316]" />
                   <span className="font-black text-xl">{item}</span>
                </li>
              ))}
            </ul>

            <p className="mb-8">
              We're not just building a better linter; we're building a co-pilot that understands the "why" behind every line of code. This is the future of automated code review, and we're just getting started.
            </p>
          </div>

          {/* ── Author Bio & Footer ── */}
          <div className="mt-32 pt-16 border-t-2 border-black">
             <div className="flex flex-col md:flex-row items-center gap-12 p-10 border-2 border-black bg-white shadow-[12px_12px_0px_0px_rgba(249,115,22,1)]">
                <div className="w-32 h-32 bg-black border-4 border-black shrink-0 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" />
                <div className="text-center md:text-left">
                  <h4 className="text-2xl font-black uppercase mb-4">Written by {post.author}</h4>
                  <p className="text-gray-500 font-medium uppercase tracking-tight leading-tight mb-8">
                    Alex is a lead engineer at CodeKang, focusing on the intersection of LLMs and distributed systems. When not training models, he's probably debugging his espresso machine.
                  </p>
                  <div className="flex justify-center md:justify-start gap-6">
                    <button className="text-[12px] font-black uppercase border-b-2 border-black">Follow on Twitter</button>
                    <button className="text-[12px] font-black uppercase border-b-2 border-black">View Profile</button>
                  </div>
                </div>
             </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
