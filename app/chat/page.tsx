"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { 
  MessageCircle, 
  Send, 
  User as UserIcon,
  Globe,
  Loader2,
  ShieldCheck,
  Activity,
  Smile,
  Zap,
  Cpu,
  Database,
  Lock,
  Wifi,
  Radio
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ChatMsg {
  _id: string;
  userId: {
    _id: string;
    username: string;
    name: string;
    image: string;
  };
  content: string;
  createdAt: string;
}

export default function ChatPage() {
  const { data: session } = useSession();
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);
  const [showEmoji, setShowEmoji] = useState(false);
  const emojis = ["🔥", "📈", "📉", "🚀", "💎", "💰", "💹", "📊", "🎯", "⚡", "🤝", "🙌", "✅", "❌", "👀"];

  useEffect(() => {
    fetchChat();
    const chatInterval = setInterval(fetchChat, 5000); 
    return () => clearInterval(chatInterval);
  }, []);

  useEffect(() => {
    if (isFirstLoad.current && chatMessages.length > 0) {
      scrollToBottom();
      isFirstLoad.current = false;
    }
  }, [chatMessages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChat = async () => {
    try {
      const chatRes = await fetch("/api/chat");
      const chatData = await chatRes.json();
      if (Array.isArray(chatData)) {
        setChatMessages(chatData);
        if (isFirstLoad.current) {
          setLoading(false);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (isFirstLoad.current) setLoading(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const content = chatInput;
    setChatInput("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const msg = await res.json();
        setChatMessages(prev => [...prev, msg]);
        setTimeout(scrollToBottom, 50);
      }
    } catch (e) {
      toast.error("Transmission failure");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-white/20 font-black text-xs uppercase tracking-[0.5em] animate-pulse">
        Synchronizing Neural Comms...
      </div>
    );
  }

  // @ts-ignore
  const hasUsername = session?.user && session.user.username;

  return (
    <div className="text-white font-sans relative h-[calc(100vh-64px)] overflow-hidden flex flex-col p-4">
      {/* Institutional Background Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-blue-500/[0.03] blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-purple-500/[0.03] blur-[150px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <AnimatePresence>
        {!hasUsername && !loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-[#0A0A0A] border border-white/5 rounded-[3.5rem] p-16 max-w-xl w-full text-center shadow-3xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />
              <div className="relative z-10">
                <div className="w-24 h-24 bg-blue-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.15)]">
                  <ShieldCheck size={48} className="text-blue-400" />
                </div>
                <h2 className="text-4xl font-black text-white italic uppercase tracking-[0.02em] mb-6">Identity Shielded</h2>
                <p className="text-white/80 text-[11px] font-black uppercase tracking-[0.4em] mb-12 italic leading-relaxed">
                  "Institutional participation requires a verified handle. Initialize your terminal identity to participate in the global mesh transmission."
                </p>
                <a 
                  href="/settings"
                  className="group relative block w-full py-6 bg-white text-black rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] hover:bg-blue-500 hover:text-white transition-all shadow-2xl active:scale-95 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <span className="relative z-10">Initialize Archival 01</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Chat Terminal Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#0A0A0A]/40 backdrop-blur-xl border border-white/5 rounded-3xl relative z-10 group overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/[0.02] blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-blue-500/[0.04] transition-all duration-700" />
        
        {/* Messages Log */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scrollbar-none scroll-smooth relative z-10">
            {chatMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-20 italic">
                <Radio size={48} className="animate-pulse" />
                <p className="text-xs font-black uppercase tracking-[0.5em]">No recent transmissions detected</p>
              </div>
            )}
            {chatMessages.map((msg, idx) => {
              // @ts-ignore
              const isMe = msg.userId?._id === session?.user?.id;
              
              return (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98, x: isMe ? 20 : -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  key={msg._id} 
                  className={`flex gap-3 group/msg ${isMe ? "flex-row-reverse" : ""}`}
                >
                  <div className="w-9 h-9 rounded-xl bg-white/[0.02] border border-white/5 flex-shrink-0 overflow-hidden group-hover/msg:scale-105 transition-transform shadow-xl relative mt-1">
                      {msg.userId?.image ? (
                        <img src={msg.userId.image} className="w-full h-full object-cover opacity-80" />
                      ) : (
                        <UserIcon size={12} className="w-full h-full p-2.5 text-white/10" />
                      )}
                      <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover/msg:opacity-100 transition-opacity" />
                  </div>
                  <div className={`flex flex-col max-w-[65%] ${isMe ? "items-end" : "items-start"}`}>
                      <div className={`flex items-center gap-3 mb-2 ${isMe ? "flex-row-reverse text-right" : "text-left"}`}>
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                          @{msg.userId?.username || "node_unverified"}
                        </span>
                        <div className="h-1 w-1 rounded-full bg-white/10" />
                        <span className="text-[9px] text-white/20 font-black uppercase tracking-tighter italic">
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div className={`group relative text-[13px] font-medium leading-relaxed px-5 py-3 rounded-2xl shadow-xl break-words whitespace-pre-wrap w-full transition-all duration-500 ${
                        isMe 
                          ? "bg-white text-black border-transparent rounded-tr-sm italic" 
                          : "bg-white/[0.03] border border-white/5 rounded-tl-sm text-white/80"
                      }`}>
                        {isMe && <div className="absolute inset-0 bg-blue-500 opacity-0 transition-opacity" />}
                        <span className="relative z-10">"{msg.content}"</span>
                      </div>
                  </div>
                </motion.div>
              );
            })}
            <div ref={chatEndRef} />
        </div>

        {/* Transmission Input Sector */}
        <div className="p-8 border-t border-white/5 bg-white/[0.02] flex-shrink-0 relative z-10 backdrop-blur-md">
            <div className="absolute inset-0 bg-blue-500/[0.01] pointer-events-none" />
            <form onSubmit={handleSendChatMessage} className="relative group max-w-5xl mx-auto flex items-center gap-6">
              <div className="relative">
                  <button 
                    type="button"
                    onClick={() => setShowEmoji(!showEmoji)}
                    className="p-4 bg-white/[0.03] text-white/20 hover:text-white border border-white/5 rounded-2xl transition-all active:scale-95"
                  >
                    <Smile size={22} />
                  </button>
                  <AnimatePresence>
                    {showEmoji && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full mb-6 left-0 bg-[#0D0D0D] border border-white/10 rounded-[2.5rem] p-6 shadow-[0_40px_80px_rgba(0,0,0,0.8)] grid grid-cols-5 gap-3 z-[150] w-64 backdrop-blur-3xl"
                      >
                        {emojis.map(e => (
                          <button 
                            key={e}
                            type="button"
                            onClick={() => { setChatInput(prev => prev + e); setShowEmoji(false); }}
                            className="w-10 h-10 flex items-center justify-center text-xl hover:bg-white/10 rounded-xl transition-all active:scale-90"
                          >
                            {e}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
              </div>
              <div className="flex-1 relative group/input">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Inscribe signal transmission to global matrix..."
                  className="w-full bg-white/[0.02] border border-white/5 rounded-[2.5rem] px-10 py-5 text-[13px] text-white placeholder:text-white/10 outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all font-medium italic shadow-inner"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                   <div className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em] italic mr-4 group-focus-within/input:opacity-100 opacity-0 transition-opacity">Neural Broadcast Active</div>
                   <button 
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="group relative flex items-center justify-center w-12 h-12 bg-white text-black hover:bg-blue-500 hover:text-white rounded-2xl transition-all shadow-xl active:scale-90 disabled:opacity-5 overflow-hidden"
                  >
                      <div className="absolute inset-0 bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                      <Send size={18} className="relative z-10" />
                  </button>
                </div>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}
