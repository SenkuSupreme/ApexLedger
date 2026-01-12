"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, ArrowLeft, Terminal, Zap, Shield, Lock, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 font-sans antialiased overflow-hidden flex items-center justify-center p-6 relative">
      
      {/* Background System */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.08)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10"
      >
        <Link href="/" className="inline-flex items-center gap-3 text-white/30 hover:text-white transition-all group mb-12">
            <div className="w-10 h-10 border border-white/10 rounded-xl flex items-center justify-center bg-white/[0.03] group-hover:border-indigo-500/50 group-hover:bg-indigo-500/10 transition-all duration-500">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Back to Landing</span>
        </Link>

        <div className="bg-[#080808] border border-white/10 rounded-[3rem] p-12 lg:p-16 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] to-transparent pointer-events-none" />
          
          <div className="mb-14 space-y-6 relative z-10">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 border-2 border-indigo-500/30 flex items-center justify-center rounded-2xl bg-indigo-500/5 rotate-12 group-hover:rotate-0 transition-transform">
                  <Terminal size={24} className="text-indigo-400" />
               </div>
               <div className="space-y-1">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.6em] block">Login</span>
                  <h1 className="text-4xl font-black italic uppercase italic tracking-tighter leading-none">Welcome Back</h1>
               </div>
            </div>
            <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em] italic">Treat trading as a systematic business. Logic over luck.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8 p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-[10px] font-black uppercase tracking-widest text-center"
            >
              {error}
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-[0.6em] text-white/20 italic ml-2">Email Address</label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-8 py-5 text-white placeholder:text-white/5 focus:border-indigo-500/40 focus:bg-indigo-500/[0.03] focus:outline-none transition-all duration-500 italic font-black text-sm tracking-widest"
                  placeholder="EMAIL@EXAMPLE.COM"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between ml-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.6em] text-white/20 italic tracking-[0.6em]">Password</label>
                <Link href="/auth/forgot-password" className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-500/40 hover:text-indigo-400 transition-colors italic">Forgot?</Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-8 py-5 text-white focus:border-indigo-500/40 focus:bg-indigo-500/[0.03] focus:outline-none transition-all duration-500 text-sm tracking-[0.5em]"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-20 bg-white text-black font-black uppercase tracking-[0.4em] text-[12px] rounded-2xl hover:bg-indigo-600 hover:text-white transition-all duration-700 disabled:opacity-50 shadow-[0_20px_60px_rgba(255,255,255,0.1)] active:scale-95 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <div className="relative z-10 flex items-center justify-center gap-4">
                {isLoading ? 'Loading...' : 'Sign In'}
                <Zap size={18} className={isLoading ? "animate-pulse" : ""} />
              </div>
            </button>
          </form>
        </div>

        <div className="mt-14 text-center space-y-4">
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/20 italic">
            No account?{' '}
            <Link href="/auth/signup" className="text-white hover:text-indigo-400 transition-colors underline underline-offset-8 decoration-white/10 decoration-2">
              Create One
            </Link>
          </p>
          <div className="flex items-center justify-center gap-8 pt-4">
             <div className="flex items-center gap-2 opacity-20">
                <Shield size={12} />
                <span className="text-[8px] font-black uppercase tracking-widest">Encrypted</span>
             </div>
             <div className="flex items-center gap-2 opacity-20">
                <Lock size={12} />
                <span className="text-[8px] font-black uppercase tracking-widest">Secured</span>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
