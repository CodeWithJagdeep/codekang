'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  User,
  Heart,
  MessageSquare,
  Send,
  Link as LinkIcon
} from 'lucide-react';
import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BsLinkedin, BsTwitter } from 'react-icons/bs';
import { LiaLinkedin } from 'react-icons/lia';
import { useState } from 'react';

export default function PostContent() {
  const params = useParams();
  const slug = params.slug as string;

  // State for likes
  const [likes, setLikes] = useState(124);
  const [isLiked, setIsLiked] = useState(false);

  // State for comments
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "Sarah Chen",
      role: "Platform Engineer",
      content: "The emphasis on context is spot on. Static analysis has reached its limits, and LLMs are definitely the missing piece for meaningful PR automation.",
      date: "2 hours ago",
      replies: [] as any[]
    },
    {
      id: 2,
      author: "Marcus Thorne",
      role: "DevOps Lead",
      content: "Great read! How does CodeKang handle privacy when analyzing internal PR descriptions? That's always a concern for enterprise clients.",
      date: "5 hours ago",
      replies: [
        {
          id: 101,
          author: "Alex Rivera",
          role: "Author",
          content: "Great question, Marcus! We use a combination of local VPC deployment and anonymization layers to ensure no PII or sensitive logic ever leaves your infrastructure.",
          date: "3 hours ago"
        }
      ]
    }
  ]);

  const handleLike = () => {
    if (isLiked) {
      setLikes(prev => prev - 1);
    } else {
      setLikes(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      author: "You",
      role: "Community Member",
      content: commentText,
      date: "Just now",
      replies: []
    };

    setComments([newComment, ...comments]);
    setCommentText('');
  };

  const handleReplySubmit = (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newReply = {
      id: Date.now(),
      author: "You",
      role: "Community Member",
      content: replyText,
      date: "Just now"
    };

    setComments(comments.map(c => 
      c.id === parentId 
        ? { ...c, replies: [...c.replies, newReply] }
        : c
    ));
    setReplyText('');
    setReplyTo(null);
  };

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
            <ArrowLeft className="group-hover:-translate-x-2 transition-transform" /> Back to Blog
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
                <Clock className="text-[#f97316]" size={18} />
                <span className="font-black uppercase text-[13px]">{post.date} • {post.readTime}</span>
              </div>
              <div className="ml-auto flex items-center gap-4">
                <button className="p-2 border-2 border-black hover:bg-black hover:text-white transition-all">
                  <BsTwitter size={20} />
                </button>
                <button className="p-2 border-2 border-black hover:bg-black hover:text-white transition-all">
                  <BsLinkedin size={20} />
                </button>
                <button className="p-2 border-2 border-black hover:bg-black hover:text-white transition-all">
                  <LinkIcon size={20} />
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

          {/* ── Like & Share ── */}
          <div className="mt-20 flex flex-col md:flex-row items-center justify-between gap-8 py-12 border-y-2 border-black">
            <div className="flex items-center gap-6">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                className={`group flex items-center gap-3 px-8 py-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${isLiked ? 'bg-[#f97316] text-white' : 'bg-white hover:bg-black hover:text-white'}`}
              >
                <Heart className={isLiked ? 'fill-current' : ''} size={24} />
                <span className="text-xl font-black uppercase tracking-tighter">{likes} LIKES</span>
              </motion.button>
              <div className="hidden md:block h-12 w-[2px] bg-black/10" />
              <div className="flex items-center gap-4">
                <MessageSquare className="text-gray-400" size={24} />
                <span className="text-xl font-black uppercase tracking-tighter text-gray-400">{comments.length} COMMENTS</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[12px] font-black uppercase tracking-widest text-gray-400 mr-2">SHARE THIS POST:</span>
              <button className="p-3 border-2 border-black hover:bg-[#f97316] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <BsTwitter size={20} />
              </button>
              <button className="p-3 border-2 border-black hover:bg-[#f97316] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <BsLinkedin size={20} />
              </button>
            </div>
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

          {/* ── Comments Section ── */}
          <div className="mt-32">
            <div className="mb-16">
              <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">Join the conversation</h3>
              <div className="w-24 h-2 bg-[#f97316]" />
            </div>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-20 p-8 border-2 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <div className="mb-6">
                <label className="block text-[14px] font-black uppercase tracking-widest mb-4">Your Comment</label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="WHAT ARE YOUR THOUGHTS ON THE FUTURE OF CODE REVIEW?"
                  className="w-full h-32 p-6 bg-gray-00 border-2 border-black focus:border-[#f97316] focus:outline-none font-medium uppercase tracking-tight text-lg placeholder:text-gray-300 resize-none transition-colors"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-3 px-10 py-4 bg-black text-white border-2 border-black hover:bg-[#f97316] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-black uppercase tracking-widest"
              >
                <Send size={20} /> Post Comment
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-12">
              <AnimatePresence initial={false}>
                {comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative"
                  >
                    <div className="p-8 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(249,115,22,1)]">
                      <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-black/5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
                          <div>
                            <p className="font-black uppercase text-lg leading-none mb-1">{comment.author}</p>
                            <p className="text-[12px] font-medium text-gray-400 uppercase">{comment.role}</p>
                          </div>
                        </div>
                        <span className="text-[12px] font-black uppercase text-gray-400">{comment.date}</span>
                      </div>
                      <p className="text-xl font-medium text-gray-600 uppercase tracking-tight leading-relaxed mb-8">
                        {comment.content}
                      </p>
                      
                      <button 
                        onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                        className="text-[12px] font-black uppercase tracking-widest border-b-2 border-black hover:text-[#f97316] hover:border-[#f97316] transition-colors"
                      >
                        {replyTo === comment.id ? 'Cancel Reply' : 'Reply to this'}
                      </button>

                      {/* Reply Form */}
                      <AnimatePresence>
                        {replyTo === comment.id && (
                          <motion.form
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            onSubmit={(e) => handleReplySubmit(e, comment.id)}
                            className="mt-8 pt-8 border-t-2 border-black/5"
                          >
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={`REPLY TO ${comment.author.toUpperCase()}...`}
                              className="w-full h-24 p-4 bg-gray-50 border-2 border-black focus:border-[#f97316] focus:outline-none font-medium uppercase tracking-tight text-md placeholder:text-gray-300 resize-none transition-colors mb-4"
                            />
                            <button
                              type="submit"
                              className="px-6 py-2 bg-black text-white border-2 border-black hover:bg-[#f97316] transition-all font-black uppercase text-[12px] tracking-widest"
                            >
                              Post Reply
                            </button>
                          </motion.form>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Replies List */}
                    {comment.replies.length > 0 && (
                      <div className="mt-6 ml-12 space-y-6 border-l-4 border-black/10 pl-12 relative">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="p-6 border-2 border-black bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative">
                            {/* Connector Line */}
                            <div className="absolute -left-[52px] top-1/2 w-12 h-1 bg-black/10" />
                            
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-black border-2 border-black" />
                                <div>
                                  <p className="font-black uppercase text-[14px] leading-none mb-1">{reply.author}</p>
                                  <p className="text-[10px] font-medium text-gray-400 uppercase">{reply.role}</p>
                                </div>
                              </div>
                              <span className="text-[10px] font-black uppercase text-gray-400">{reply.date}</span>
                            </div>
                            <p className="text-[16px] font-medium text-gray-600 uppercase tracking-tight leading-relaxed">
                              {reply.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
