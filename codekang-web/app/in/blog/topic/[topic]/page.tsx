'use client';

import { useMemo, use } from 'react';
import { motion } from 'framer-motion';
import { 
  RiArrowRightLine, 
  RiBookmarkLine,
  RiUser3Line,
  RiTimeLine,
  RiArrowLeftLine,
  RiCodeSSlashLine, 
  RiRobot2Line, 
  RiGlobalLine, 
  RiTeamLine 
} from 'react-icons/ri';
import HomeHeader from '@/component/HomeHeader';
import Footer from '@/component/Footer';
import Link from 'next/link';
import { POSTS, TOPICS } from '@/lib/blog-data';

const ICON_MAP: Record<string, any> = {
  RiCodeSSlashLine,
  RiRobot2Line,
  RiGlobalLine,
  RiTeamLine,
};

export default function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const resolvedParams = use(params);
  const topicSlug = resolvedParams.topic;
  
  // Find the topic name from the slug
  const topic = useMemo(() => {
    return TOPICS.find(t => t.name.toLowerCase().replace(/ & /g, '-and-').replace(/ /g, '-') === topicSlug);
  }, [topicSlug]);

  const filteredPosts = useMemo(() => {
    if (!topic) return [];
    return POSTS.filter(post => post.category.toLowerCase() === topic.name.toLowerCase());
  }, [topic]);

  if (!topic) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] text-black font-[family-name:var(--font-space-grotesk)] flex flex-col">
        <HomeHeader />
        <main className="flex-1 flex items-center justify-center p-10">
          <div className="text-center">
            <h1 className="text-6xl font-black uppercase mb-8">Topic Not Found</h1>
            <Link href="/in/blog" className="inline-flex items-center gap-2 border-2 border-black bg-black text-white px-8 py-4 font-black uppercase hover:bg-white hover:text-black transition-all">
              <RiArrowLeftLine /> Back to Blog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-black font-[family-name:var(--font-space-grotesk)]">
      <HomeHeader />

      <main>
        {/* ── Hero Section ── */}
        <section className="pt-32 pb-20 px-10 border-b-2 border-black/10 text-center relative overflow-hidden bg-white">
           <div className="absolute inset-0 pointer-events-none -z-10 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <Link href="/in/blog" className="inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-gray-400 hover:text-black mb-8 transition-colors">
              <RiArrowLeftLine /> Back to all articles
            </Link>
            <div className="flex justify-center mb-6">
              {(() => {
                const Icon = ICON_MAP[topic.icon];
                return Icon ? <Icon size={64} style={{ color: topic.color }} /> : null;
              })()}
            </div>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-10">
              {topic.name} <br />
              <span className="text-gray-300">Archive</span>
            </h1>
            <p className="text-[20px] text-gray-500 max-w-2xl mx-auto font-medium uppercase tracking-tighter">
              Deep dives and technical insights specifically focused on {topic.name.toLowerCase()}.
            </p>
          </motion.div>
        </section>

        {/* ── Post Grid ── */}
        <section className="px-10 py-24 bg-[#fcfcfc] min-h-[400px]">
          <div className="max-w-7xl mx-auto">
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {filteredPosts.map((post) => (
                  <motion.div
                    key={post.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link href={`/in/blog/${post.slug}`} className="group block h-full">
                      <div className="flex flex-col h-full border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_var(--topic-color)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all bg-white overflow-hidden"
                        style={{ '--topic-color': topic.color } as any}
                      >
                        <div className="relative h-48 border-b-2 border-black overflow-hidden">
                          <img 
                            src={post.image} 
                            alt={post.title} 
                            className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                          />
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
              </div>
            ) : (
              <div className="text-center py-20">
                <h3 className="text-4xl font-black uppercase tracking-tighter mb-4">No Articles Found in this topic</h3>
                <p className="text-gray-400 font-black uppercase mb-8">We're working on new content for this category.</p>
                <Link 
                  href="/in/blog"
                  className="px-8 py-4 border-2 border-black bg-black text-white font-black uppercase hover:bg-white hover:text-black transition-all"
                >
                  BROWSE ALL TOPICS
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
