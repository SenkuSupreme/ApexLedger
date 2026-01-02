"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Trophy, 
  TrendingUp, 
  MessageCircle, 
  Heart, 
  Share2, 
  Send, 
  User as UserIcon,
  Flame,
  Globe,
  Award,
  Crown,
  Zap,
  Loader2,
  Calendar,
  Filter,
  MoreHorizontal,
  Trash2,
  Edit3,
  X,
  ChevronRight,
  Hash,
  Activity,
  ShieldCheck,
  Star,
  Cpu,
  Shield,
  Layers,
  Brain
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

interface LeaderboardUser {
  userId: string;
  username: string;
  name: string;
  image: string;
  totalPnl: number;
  tradeCount: number;
  winRate: number;
  alphaScore: number;
}

interface Comment {
  _id: string;
  userId: {
    _id: string;
    username: string;
    name: string;
    image: string;
  };
  text: string;
  createdAt: string;
}

interface Post {
  _id: string;
  userId: {
    _id: string;
    username: string;
    name: string;
    image: string;
  };
  content: string;
  type: 'text' | 'trade' | 'milestone';
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; postId: string | null }>({ isOpen: false, postId: null });

  useEffect(() => {
    fetchData();
    const lbInterval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(lbInterval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lbRes, postsRes] = await Promise.all([
        fetch("/api/leaderboard"),
        fetch("/api/posts")
      ]);
      const lbData = await lbRes.json();
      const postsData = await postsRes.json();
      setLeaderboard(Array.isArray(lbData) ? lbData : []);
      setPosts(Array.isArray(postsData) ? postsData : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      if (Array.isArray(data)) setLeaderboard(data);
    } catch (e) {}
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    setPosting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPostContent }),
      });
      if (res.ok) {
        const post = await res.json();
        setPosts([post, ...posts]);
        setNewPostContent("");
        window.dispatchEvent(new CustomEvent('apex-notification', { 
          detail: { title: 'Post Shared', message: 'Your post is now live in the community feed.', type: 'success' } 
        }));
      }
    } catch (error) {
      toast.error("Error sharing post");
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (res.ok) {
        const { likes } = await res.json();
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes } : p));
        
        // Trigger a local notification if it's a new like by the user
        const isLiked = likes.includes((session?.user as any)?.id);
        if (isLiked) {
             window.dispatchEvent(new CustomEvent('apex-notification', { 
                detail: { title: 'Post Liked', message: 'You liked a post in the community.', type: 'success' } 
             }));
        }
      }
    } catch (error) {}
  };

  const handleDeletePost = async () => {
    const postId = deleteDialog.postId;
    if (!postId) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p._id !== postId));
        toast.success("Post deleted");
      }
    } catch (error) {}
    setDeleteDialog({ isOpen: false, postId: null });
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-muted-foreground font-black text-xs uppercase tracking-[0.5em] animate-pulse">
        Loading Community...
      </div>
    );
  }

  // @ts-ignore
  const hasUsername = session?.user && session.user.username;

  return (
    <div className="space-y-12 text-foreground font-sans relative min-h-screen pb-20 overflow-hidden px-4 md:px-8">
      {/* Institutional Background Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-blue-500/[0.03] blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-sky-500/[0.03] blur-[150px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <AnimatePresence>
        {!hasUsername && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card border border-border rounded-[3.5rem] p-16 max-w-xl w-full text-center shadow-3xl overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />
              <div className="w-24 h-24 bg-blue-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-blue-500/20 relative z-10">
                <ShieldCheck size={48} className="text-blue-400" />
              </div>
              <h2 className="text-4xl font-black text-foreground tracking-[0.02em] mb-6 uppercase italic leading-none">Identity Required</h2>
              <p className="text-foreground/80 text-[13px] leading-relaxed mb-12 italic font-medium">
                "To participate in the community feed, you must set a username and upload an avatar in your profile settings."
              </p>
              <a 
                href="/settings"
                className="block w-full py-6 bg-foreground text-background rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-blue-500 hover:text-white transition-all shadow-xl active:scale-95 italic relative z-10"
              >
                Set Username
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1600px] mx-auto w-full flex flex-col pt-4">
        {/* Header Mesh */}
        <header className="mb-14 flex items-center justify-between flex-shrink-0 relative z-10">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                 <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400">Community Active</span>
              </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-foreground/[0.03] border border-border rounded-full text-foreground/60">
               <Globe size={10} className="text-blue-500/50" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em]">Institutional Network</span>
            </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.02em] italic uppercase bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent leading-none">
              Community
            </h1>
            <p className="text-foreground/70 text-xs md:text-sm font-medium italic max-w-xl leading-relaxed">
              "Connect with other traders. Share your thoughts, trades, and milestones with the global trading community."
            </p>
          </div>

          <div className="hidden lg:flex flex-col items-end gap-2 text-right">
              <span className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.4em] italic mb-2">Network Status</span>
              <div className="px-6 py-3 bg-foreground/[0.03] border border-border rounded-2xl flex items-center gap-4">
                 <Zap size={14} className="text-emerald-500" />
                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Sync Active</span>
              </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
          {/* LEADERBOARD SIDEBAR */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="bg-card/40 backdrop-blur-xl border border-border rounded-[3rem] overflow-hidden shadow-3xl flex flex-col relative group">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.01] pointer-events-none" />
                <div className="p-10 border-b border-border bg-foreground/[0.01] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-500">
                        <Activity size={20} className="animate-pulse" />
                      </div>
                      <div>
                        <h2 className="text-xs font-black text-foreground uppercase tracking-[0.4em] italic">Top Rankings</h2>
                        <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mt-1">Live Leaderboard</p>
                      </div>
                    </div>
                </div>

                <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {leaderboard.map((user, idx) => (
                      <motion.div 
                        key={user.userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`group relative flex items-center justify-between p-6 border rounded-[2rem] transition-all duration-500 cursor-pointer ${
                          idx === 0 ? "bg-amber-500/[0.05] border-amber-500/20 shadow-2xl" :
                          idx === 1 ? "bg-foreground/[0.04] border-border" :
                          idx === 2 ? "bg-foreground/[0.03] border-border" :
                          "bg-foreground/[0.01] border-border hover:border-foreground/10 hover:bg-foreground/[0.03]"
                        }`}
                      >
                        <div className="flex items-center gap-5 min-w-0">
                            <div className="relative">
                              {idx === 0 && <Star size={14} className="absolute -top-3 -left-3 text-amber-500 fill-amber-500 animate-bounce z-20" />}
                              <div className={`w-12 h-12 rounded-2xl overflow-hidden border p-1 transition-transform group-hover:scale-110 shadow-xl ${
                                idx === 0 ? "border-amber-500/30 shadow-amber-500/10" : "border-border"
                              }`}>
                                <div className="w-full h-full rounded-xl bg-background flex items-center justify-center overflow-hidden">
                                  {user.image ? <img src={user.image} className="w-full h-full object-cover" /> : <UserIcon size={16} className="text-muted-foreground/10" />}
                                </div>
                              </div>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-foreground group-hover:text-blue-400 transition-colors uppercase italic truncate tracking-tight tracking-wider">@{user.username || "anon"}</p>
                              <p className="text-[8px] text-muted-foreground font-black tracking-[0.2em] uppercase mt-1 truncate">{user.winRate.toFixed(0)}% Calibration</p>
                            </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="text-sm font-black italic tracking-tighter text-foreground italic uppercase">${Math.abs(user.totalPnl).toLocaleString()}</p>
                            <p className={`text-[8px] font-black uppercase tracking-[0.2em] mt-1 italic ${user.totalPnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                               Total P&L
                            </p>
                        </div>
                      </motion.div>
                    ))}
                </div>

                <div className="p-10 border-t border-border mt-auto bg-foreground/[0.01]">
                    <div className="flex items-center gap-5 group cursor-default">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={24} className="text-blue-500" />
                      </div>
                       <div>
                          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.4em] mb-1 italic">Account Status</p>
                          <p className="text-xs text-foreground font-black tracking-[0.2em] italic uppercase">Verified Trader</p>
                      </div>
                    </div>
                </div>
            </div>
          </aside>

          {/* SOCIAL FEED */}
          <main className="lg:col-span-8 xl:col-span-9 flex flex-col h-full space-y-10">
            <section className="bg-card/40 backdrop-blur-xl border border-border rounded-[4rem] p-12 relative overflow-hidden group shadow-3xl">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.01] pointer-events-none" />
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <form onSubmit={handlePostSubmit} className="relative z-10 flex flex-col gap-10">
                <div className="flex gap-8">
                  <div className="w-16 h-16 rounded-3xl bg-foreground/5 border border-border flex items-center justify-center flex-shrink-0 overflow-hidden shadow-2xl group-hover:border-blue-500/20 transition-colors">
                    {/* @ts-ignore */}
                    {session?.user?.image ? <img src={session.user.image} className="w-full h-full object-cover" /> : <UserIcon size={24} className="text-muted-foreground/20" />}
                  </div>
                  <textarea 
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share your thoughts or trades..."
                    className="flex-1 bg-transparent border-none text-foreground text-xl outline-none resize-none placeholder:text-muted-foreground/10 min-h-[100px] py-2 font-black italic tracking-tighter"
                  />
                </div>

                <div className="flex items-center justify-between pt-10 border-t border-border">
                   <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    <span className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.4em] italic leading-none">Market Feed Active</span>
                  </div>
                  <button 
                    disabled={posting || !newPostContent.trim()}
                    className="flex items-center gap-4 px-12 py-6 bg-foreground text-background rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-blue-500 hover:text-white transition-all active:scale-95 disabled:opacity-50 shadow-xl italic overflow-hidden group/btn"
                  >
                    <Send size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    SHARE POST
                  </button>
                </div>
              </form>
            </section>

            <div className="space-y-8 pb-40">
              <AnimatePresence>
                {posts.map((post, idx) => (
                  <motion.article 
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-card/40 backdrop-blur-xl border border-border hover:border-border/50 rounded-[3.5rem] p-10 shadow-3xl transition-all duration-700 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.01] pointer-events-none" />
                    <div className="flex gap-8">
                  <div className="w-14 h-14 rounded-3xl bg-foreground/5 border border-border overflow-hidden flex items-center justify-center flex-shrink-0 transition-all group-hover:rotate-6 group-hover:scale-110 shadow-2xl">
                    {post.userId?.image ? <img src={post.userId.image} className="w-full h-full object-cover" /> : <UserIcon size={24} className="text-muted-foreground/20" />}
                  </div>

                      <div className="flex-1 space-y-6">
                        <header className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="text-foreground font-black tracking-widest text-sm uppercase italic">@{post.userId?.username || "anon"}</span>
                              <span className="text-muted-foreground/10 text-xs">•</span>
                              <span className="text-muted-foreground/20 text-[9px] font-black uppercase tracking-[0.3em] italic">{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                            </div>
                            {session?.user && (session.user as any).id === (post.userId?._id || post.userId) && (
                               <button onClick={() => setDeleteDialog({ isOpen: true, postId: post._id })} className="p-3 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/10 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                            )}
                        </header>

                        <p className="text-foreground/80 leading-relaxed text-lg tracking-tight font-black italic whitespace-pre-wrap">"{post.content}"</p>

                        <footer className="flex items-center gap-8 pt-4 border-t border-border">
                            <button onClick={() => handleLike(post._id)} className={`flex items-center gap-3 text-xs font-black italic tracking-widest transition-all ${post.likes?.includes((session?.user as any)?.id) ? "text-red-500" : "text-muted-foreground/20 hover:text-red-500"}`}>
                              <Heart size={20} fill={post.likes?.includes((session?.user as any)?.id) ? "currentColor" : "none"} />
                              {post.likes?.length || 0}
                            </button>
                            <button className="flex items-center gap-3 text-xs font-black text-muted-foreground/20 hover:text-blue-400 italic tracking-widest transition-all">
                              <MessageCircle size={20} />
                              {post.comments?.length || 0}
                            </button>
                            <button className="text-muted-foreground/20 hover:text-emerald-500 transition-colors ml-auto"><Share2 size={18} /></button>
                        </footer>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>

      <DeleteConfirmDialog 
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, postId: null })}
        onConfirm={handleDeletePost}
        title="Delete Post?"
        message="Are you sure you want to delete this post? This action cannot be undone."
      />
    </div>
  );
}
