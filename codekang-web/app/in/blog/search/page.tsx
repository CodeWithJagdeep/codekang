'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RiArrowLeftLine, 
  RiSearchLine, 
  RiTimeLine,
  RiUser3Line,
  RiArrowRightLine
} from 'react-icons/ri';
import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';
import Link from 'next/link';

// Using the same POSTS data for now
const POSTS = [
  {
    slug: "future-of-automated-code-review",
    title: "The Future of Automated Code Review: Beyond Static Analysis",
    excerpt: "How we're using Large Language Models to understand developer intent and provide deeper, more meaningful feedback than ever before.",
    category: "AI & ML",
    author: "Alex Rivera",
    date: "April 24, 2026",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    featured: true
  },
  {
    slug: "scaling-agent-infrastructure",
    title: "Scaling Agent Infrastructure for 100k+ Concurrent Reviews",
    excerpt: "A deep dive into our distributed task queue architecture and how we manage low-latency AI inference at scale.",
    category: "Engineering",
    author: "Sarah Chen",
    date: "April 20, 2026",
    readTime: "12 min read",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800"
  },
  {
    slug: "designing-for-developers",
    title: "Designing for Developers: Why Neo-Brutalism Works",
    excerpt: "Exploring the intersection of high-utility interfaces and bold aesthetic choices in modern developer tools.",
    category: "Product",
    author: "Jordan Smith",
    date: "April 15, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800"
  },
  {
    slug: "debugging-the-debugger",
    title: "Debugging the Debugger: Building an AI that Fixes its Own Code",
    excerpt: "The challenges and breakthroughs we encountered while building CodeKang's self-healing autonomous agents.",
    category: "AI & ML",
    author: "Alex Rivera",
    date: "April 10, 2026",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=800"
  },
  {
    slug: "remote-first-engineering-culture",
    title: "Maintaining Velocity in a Remote-First Engineering Team",
    excerpt: "How we use our own tools to keep the team aligned and moving fast without the burnout.",
    category: "Culture",
    author: "Marcus Thorne",
    date: "April 5, 2026",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
  },
  {
    slug: "git-metadata-and-developer-velocity",
    title: "Why Git Metadata is the Key to Unlocking Developer Velocity",
    excerpt: "Moving beyond simple commit counts to understand the real flow of value through your engineering organization.",
    category: "Engineering",
    author: "Sarah Chen",
    date: "March 28, 2026",
    readTime: "9 min read",
    image: "https://images.unsplash.com/photo-1556075798-4825dfaf4865?auto=format&fit=crop&q=80&w=800"
  }
];

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [localQuery, setLocalQuery] = useState(query);

  const filteredResults = useMemo(() => {
    if (!query) return [];
    return POSTS.filter(post => 
      post.title.toLowerCase().includes(query.toLowerCase()) || 
      post.excerpt.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      router.push(`/in/blog/search?q=${encodeURIComponent(localQuery)}`);
    }
  };

  return (
    <main className="pt-32 pb-40 px-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-20 border-b-2 border-black pb-12">
          <Link 
            href="/in/blog" 
            className="inline-flex items-center gap-2 text-[14px] font-black uppercase tracking-widest mb-12 hover:text-[#f97316] transition-colors group"
          >
            <RiArrowLeftLine className="group-hover:-translate-x-2 transition-transform" /> Back to Blog
          </Link>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-8">
            Search <br /> <span className="text-[#f97316]">Results</span>
          </h1>
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <input 
              type="text" 
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="SEARCH ARTICLES..." 
              className="w-full bg-white border-4 border-black px-8 py-6 text-[24px] font-black uppercase placeholder:text-gray-300 focus:outline-none focus:shadow-[12px_12px_0px_0px_rgba(249,115,22,1)] transition-all"
            />
            <button type="submit" className="absolute right-6 top-1/2 -translate-y-1/2 text-black hover:text-[#f97316] transition-colors">
              <RiSearchLine size={32} />
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="min-h-[400px]">
          <p className="text-[14px] font-black uppercase text-gray-400 mb-12">
            Showing {filteredResults.length} results for: <span className="text-black">"{query}"</span>
          </p>

          {filteredResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {filteredResults.map((post, i) => (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/in/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="group block">
                    <div className="flex flex-col md:flex-row gap-8 border-2 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(249,115,22,1)] transition-all">
                      <div className="w-full md:w-48 h-48 border-2 border-black shrink-0 overflow-hidden">
                        <img src={post.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-[10px] font-black bg-black text-white px-2 py-0.5 mb-4 inline-block w-fit">{post.category}</span>
                        <h3 className="text-2xl font-black uppercase leading-tight mb-4 group-hover:text-[#f97316] transition-colors">{post.title}</h3>
                        <p className="text-[14px] text-gray-500 font-medium uppercase tracking-tight leading-tight mb-6">{post.excerpt}</p>
                        <div className="flex items-center gap-2 text-[12px] font-black uppercase">
                          Read Story <RiArrowRightLine className="text-[#f97316]" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 border-4 border-dashed border-black/10">
               <h3 className="text-4xl font-black uppercase tracking-tighter mb-4 text-gray-300">Nothing Found</h3>
               <p className="text-gray-400 font-black uppercase">Try searching for "AI", "Engineering", or "Infrastructure"</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] text-black font-[family-name:var(--font-space-grotesk)]">
      <HomeHeader />
      <Suspense fallback={<div className="pt-40 text-center font-black uppercase">Loading Search...</div>}>
        <SearchResults />
      </Suspense>
      <Footer />
    </div>
  );
}
