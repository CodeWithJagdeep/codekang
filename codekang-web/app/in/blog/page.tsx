'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  RiCodeSSlashLine, 
  RiRobot2Line, 
  RiGlobalLine, 
  RiTeamLine,
  RiArrowRightLine, 
  RiSearchLine, 
  RiFilterLine,
  RiTimeLine,
  RiUser3Line,
  RiBookmarkLine,
  RiArrowRightUpLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiGroupLine
} from 'react-icons/ri';
import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { API_URL } from '@/lib/auth';

import { CATEGORIES, POSTS, TOPICS } from '@/lib/blog-data';

const ICON_MAP: Record<string, any> = {
  RiCodeSSlashLine,
  RiRobot2Line,
  RiGlobalLine,
  RiTeamLine,
};

export default function BlogPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [visiblePosts, setVisiblePosts] = useState(3);

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'blog' }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message ?? 'You\'re in.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message ?? 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Could not connect. Try again.');
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/in/blog/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const filteredPosts = useMemo(() => {
    return POSTS.filter(post => {
      const matchesCategory = activeCategory === "All" || post.category === activeCategory;
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const featuredPost = useMemo(() => {
    const featured = POSTS.find(p => p.featured);
    if (!featured) return null;
    
    const matchesCategory = activeCategory === "All" || featured.category === activeCategory;
    const matchesSearch = featured.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         featured.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    return (matchesCategory && matchesSearch) ? featured : null;
  }, [activeCategory, searchQuery]);

  const regularPosts = useMemo(() => {
    return filteredPosts.filter(p => !p.featured);
  }, [filteredPosts]);

  const displayedPosts = useMemo(() => {
    return regularPosts.slice(0, visiblePosts);
  }, [regularPosts, visiblePosts]);

  const scrollToFilters = () => {
    const section = document.getElementById('filter-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-black font-[family-name:var(--font-space-grotesk)]">
      <HomeHeader />

      <main>
        {/* ── Hero Section ── */}
        <section className="pt-32 pb-20 px-10 border-b-2 border-black/10 text-center relative overflow-hidden">
           <div className="absolute inset-0 pointer-events-none -z-10 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <span className="inline-block px-3 py-1 border-2 border-[#f97316] text-[#f97316] text-[12px] font-black uppercase tracking-[0.2em] mb-8">
              CodeKang Journal
            </span>
            <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-10">
              Inside the <br />
              <span className="text-[#f97316]">Engine</span>
            </h1>
            <p className="text-[20px] text-gray-500 max-w-2xl mx-auto mb-12 font-medium uppercase tracking-tighter">
              Stories, research, and technical insights from the team building the future of autonomous engineering.
            </p>
          </motion.div>
        </section>

        {/* ── Topic Grid ── */}
        <section className="px-10 py-20 border-b-2 border-black/10 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-black uppercase tracking-tighter">Browse by Topic</h2>
              <div className="h-0.5 flex-1 mx-8 bg-black/5" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {TOPICS.map((topic) => {
                const Icon = ICON_MAP[topic.icon];
                return (
                  <Link 
                    key={topic.name} 
                    href={`/in/blog/topic/${topic.name.toLowerCase().replace(/ & /g, '-and-').replace(/ /g, '-')}`}
                    className={`group p-8 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_var(--shadow-color)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all cursor-pointer bg-white`}
                    style={{ '--shadow-color': topic.color } as any}
                  >
                    {Icon && <Icon size={48} className="mb-6" style={{ color: topic.color }} />}
                    <h3 className="text-2xl font-black uppercase mb-2">{topic.name}</h3>
                    <p className="text-[14px] font-black uppercase text-gray-400">{topic.count} ARTICLES</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Filter & Search Bar ── */}
        <section id="filter-section" className="sticky top-[64px] z-40 bg-white border-b-2 border-black/10 px-10 py-4 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button 
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setVisiblePosts(3); // Reset visible posts when changing category
                  }}
                  className={`px-4 py-2 border-2 border-black text-[12px] font-black uppercase tracking-tight transition-all whitespace-nowrap
                    ${activeCategory === cat ? "bg-black text-white" : "hover:bg-[#f97316] hover:text-white"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-80">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="SEARCH ARTICLES..." 
                className="w-full bg-transparent border-2 border-black px-4 py-2 text-[14px] font-black uppercase placeholder:text-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] transition-all"
              />
              <RiSearchLine 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black cursor-pointer hover:text-[#f97316]" 
                size={20} 
                onClick={() => searchQuery.trim() && router.push(`/in/blog/search?q=${encodeURIComponent(searchQuery)}`)}
              />
            </div>
          </div>
        </section>

        {/* ── Featured Post ── */}
        <AnimatePresence mode="wait">
          {featuredPost && (
            <motion.section 
              key="featured"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-10 py-20 border-b-2 border-black/10"
            >
              <div className="max-w-7xl mx-auto">
                <Link href={`/in/blog/${featuredPost.slug}`} target="_blank" rel="noopener noreferrer" className="group block">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-2 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[20px_20px_0px_0px_rgba(249,115,22,1)] transition-all overflow-hidden bg-white">
                    <div className="relative h-64 lg:h-auto border-b-2 lg:border-b-0 lg:border-r-2 border-black overflow-hidden">
                      <img 
                        src={featuredPost.image} 
                        alt={featuredPost.title} 
                        className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100"
                      />
                    </div>
                    <div className="p-10 flex flex-col justify-center">
                      <span className="text-[#f97316] font-black uppercase text-[12px] tracking-[0.2em] mb-4">Featured Article • {featuredPost.category}</span>
                      <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6 group-hover:text-[#f97316] transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-xl text-gray-500 font-medium uppercase tracking-tight leading-tight mb-8">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center gap-6 mb-10">
                        <div className="flex items-center gap-2">
                          <RiUser3Line className="text-[#f97316]" />
                          <span className="font-black uppercase text-[13px]">{featuredPost.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <RiTimeLine className="text-[#f97316]" />
                          <span className="font-black uppercase text-[13px]">{featuredPost.readTime}</span>
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-3 text-[18px] font-black uppercase border-b-4 border-[#f97316] pb-1 w-fit group-hover:gap-5 transition-all">
                        Read Full Story <RiArrowRightLine />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── Editor's Choice ── */}
        <section className="px-10 py-24 border-b-2 border-black/10">
          <div className="max-w-7xl mx-auto">
             <div className="flex items-center justify-between mb-16">
                <div>
                  <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-4">Editor's <br /> <span className="text-[#f97316]">Picks</span></h2>
                  <p className="text-gray-400 font-black uppercase text-[14px]">Must-read deep dives selected by our team</p>
                </div>
                <button 
                  onClick={() => {
                    setActiveCategory("Engineering"); // For now, filter by Engineering as an example of curated content
                    scrollToFilters();
                  }}
                  className="hidden md:flex items-center gap-2 text-[14px] font-black uppercase border-b-4 border-black pb-1 hover:gap-4 transition-all"
                >
                  VIEW ALL PICKS <RiArrowRightLine />
                </button>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {[
                  {
                    title: "The Architecture of Autonomous Codebase Navigation",
                    desc: "How we represent entire repos as semantic graphs to enable smart agents.",
                    img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800",
                    tag: "DEEP DIVE"
                  },
                  {
                    title: "Why Most AI Code Suggestions Fail in Production",
                    desc: "Catching the subtle edge cases that static models always miss.",
                    img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
                    tag: "RESEARCH"
                  }
                ].map((pick, i) => (
                  <div key={i} className="group flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-full md:w-48 h-48 border-2 border-black shadow-[6px_6px_0px_0px_rgba(249,115,22,1)] shrink-0 overflow-hidden">
                       <img src={pick.img} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black bg-black text-white px-2 py-0.5 mb-4 inline-block">{pick.tag}</span>
                      <h3 className="text-2xl font-black uppercase leading-tight mb-4 group-hover:text-[#f97316] transition-colors">{pick.title}</h3>
                      <p className="text-[14px] text-gray-500 font-medium uppercase tracking-tight leading-tight mb-6">{pick.desc}</p>
                      <button className="text-[12px] font-black uppercase flex items-center gap-2 group-hover:gap-3 transition-all">
                        READ NOW <RiArrowRightUpLine className="text-[#f97316]" />
                      </button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </section>

        {/* ── Post Grid ── */}
        <section className="px-10 py-24 bg-white border-b-2 border-black/10 min-h-[400px]">
          <div className="max-w-7xl mx-auto">
            {displayedPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                <AnimatePresence mode="popLayout">
                  {displayedPosts.map((post, i) => (
                    <motion.div
                      key={post.slug}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link href={`/in/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="group block h-full">
                        <div className="flex flex-col h-full border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(249,115,22,1)] transition-all bg-white overflow-hidden">
                          <div className="relative h-48 border-b-2 border-black overflow-hidden">
                            <img 
                              src={post.image} 
                              alt={post.title} 
                              className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                            />
                            <div className="absolute top-4 left-4">
                              <span className="bg-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                {post.category}
                              </span>
                            </div>
                          </div>
                          <div className="p-8 flex flex-col flex-1">
                            <div className="flex items-center gap-4 text-[11px] font-black uppercase text-gray-400 mb-4">
                              <span>{post.date}</span>
                              <span>•</span>
                              <span>{post.readTime}</span>
                            </div>
                            <h3 className="text-2xl font-black uppercase leading-tight mb-4 group-hover:text-[#f97316] transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-[15px] text-gray-500 font-medium uppercase tracking-tight leading-snug mb-8 flex-1">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center justify-between mt-auto pt-6 border-t-2 border-black/5">
                              <span className="text-[12px] font-black uppercase flex items-center gap-2 group-hover:gap-3 transition-all">
                                Read More <RiArrowRightLine className="text-[#f97316]" />
                              </span>
                              <RiBookmarkLine className="text-gray-300 hover:text-black transition-colors" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-20">
                <h3 className="text-4xl font-black uppercase tracking-tighter mb-4">No Articles Found</h3>
                <p className="text-gray-400 font-black uppercase mb-8">Try adjusting your filters or search query</p>
                <button 
                  onClick={() => { setActiveCategory("All"); setSearchQuery(""); }}
                  className="px-8 py-4 border-2 border-black bg-black text-white font-black uppercase hover:bg-white hover:text-black transition-all"
                >
                  CLEAR ALL FILTERS
                </button>
              </div>
            )}
            
            {regularPosts.length > visiblePosts && (
              <div className="mt-24 text-center">
                <button 
                  onClick={() => setVisiblePosts(prev => prev + 3)}
                  className="px-12 py-6 border-2 border-black bg-white text-[18px] font-black uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(249,115,22,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all"
                >
                  Load More Articles
                </button>
              </div>
            )}
          </div>
        </section>


        {/* ── Community Spotlight ── */}
        <section className="px-10 py-32 border-b-2 border-black/10 bg-[#fcfcfc]">
           <div className="max-w-7xl mx-auto">
              <div className="text-center mb-20">
                <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">Community <br /> <span className="text-[#f97316]">Spotlight</span></h2>
                <p className="text-gray-400 font-black uppercase text-[14px]">How developers are winning with CodeKang</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 {[
                   {
                     quote: "CodeKang's blog is my go-to for understanding the actual mechanics of AI in engineering. No marketing hype, just real code.",
                     author: "Davit G.",
                     role: "CTO @ FlowState",
                     icon: RiGroupLine
                   },
                   {
                     quote: "The deep dive on cycle time metrics completely changed how we report velocity to our board. Essential reading.",
                     author: "Elena R.",
                     role: "VP Engineering @ CloudScale",
                     icon: RiTeamLine
                   }
                 ].map((testimonial, i) => (
                   <div key={i} className="p-12 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(249,115,22,1)] transition-all">
                      <testimonial.icon size={32} className="text-[#f97316] mb-8" />
                      <p className="text-2xl font-black uppercase tracking-tight leading-tight mb-10 italic">"{testimonial.quote}"</p>
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-black" />
                         <div>
                            <p className="font-black uppercase text-[14px] leading-none mb-1">{testimonial.author}</p>
                            <p className="text-[12px] font-medium text-gray-400 uppercase">{testimonial.role}</p>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* ── Newsletter ── */}
        <section className="py-40 px-10 border-t-2 border-black/10 bg-[#fcfcfc] text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-10">
              Get the <br /> <span className="text-[#f97316]">Signal</span>
            </h2>
            <p className="text-[20px] text-gray-500 max-w-2xl mx-auto mb-16 font-medium uppercase tracking-tighter">
              Join 15,000+ engineers who receive our weekly deep-dive into AI, engineering velocity, and the future of work.
            </p>
            {status === 'success' ? (
              <div className="flex items-center justify-center gap-3 border-2 border-[#22c55e] bg-[#22c55e]/5 px-8 py-6 max-w-2xl mx-auto shadow-[8px_8px_0px_0px_rgba(34,197,94,0.3)]">
                <RiCheckLine size={24} className="text-[#22c55e] shrink-0" />
                <span className="text-[18px] font-black uppercase tracking-widest text-[#22c55e]">{message}</span>
              </div>
            ) : (
              <form className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto" onSubmit={handleSubscribe}>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="YOUR.EMAIL@COMPANY.COM" 
                  className="flex-1 bg-white border-2 border-black px-8 py-6 text-[18px] font-black uppercase placeholder:text-gray-400 focus:outline-none focus:shadow-[8px_8px_0px_0px_rgba(249,115,22,1)] transition-all"
                />
                <button 
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-12 py-6 border-2 border-black bg-black text-[18px] font-black text-white uppercase shadow-[8px_8px_0px_0px_rgba(249,115,22,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(249,115,22,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all disabled:opacity-60"
                >
                  {status === 'loading' ? '...' : 'SUBSCRIBE'}
                </button>
              </form>
            )}
            {status === 'error' && (
              <div className="flex items-center justify-center gap-2 mt-4 text-[14px] font-bold text-red-500 uppercase tracking-wide">
                <RiErrorWarningLine size={16} />
                {message}
              </div>
            )}
            <p className="mt-8 text-[12px] font-black uppercase text-gray-400">
              NO SPAM. JUST HIGH-SIGNAL ENGINEERING CONTENT.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
