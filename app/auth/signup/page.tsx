
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, ArrowLeft } from 'lucide-react';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });

      if (res.ok) {
        router.push('/auth/signin');
      } else {
        const data = await res.json();
        setError(data.message || 'Something went wrong');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Failed to sign up');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen text-white selection:bg-white selection:text-black font-sans relative overflow-hidden">

        <div className="w-full max-w-md mx-auto flex flex-col justify-center px-6 relative z-10">
            <Link href="/" className="absolute top-8 left-6 text-white/40 hover:text-white transition-all flex items-center gap-2 group">
                <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-all">
                  <ArrowLeft size={16} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back</span>
            </Link>

            <div className="mb-12 text-center">
                <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
                  <TrendingUp size={28} className="text-black" strokeWidth={3} />
                </div>
                <h1 className="text-4xl font-black italic uppercase tracking-[0.02em] mb-4">Join The System</h1>
                <p className="text-white/80 text-[11px] font-black uppercase tracking-[0.3em] italic">Treat trading as a business.</p>
            </div>

            <div className="bg-[#0A0A0A]/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-10 shadow-3xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />
                
                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                    <div className="space-y-3">
                        <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-white/40 italic ml-1">Operational Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:border-white/30 focus:bg-white/[0.05] focus:outline-none transition-all duration-300 italic font-medium"
                            placeholder="Trader Name"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-white/40 italic ml-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:border-white/30 focus:bg-white/[0.05] focus:outline-none transition-all duration-300 italic font-medium"
                            placeholder="trader@apexledger.com"
                            required
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="block text-[9px] font-black uppercase tracking-[0.4em] text-white/40 italic ml-1">Password Key</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-white/30 focus:bg-white/[0.05] focus:outline-none transition-all duration-300"
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-16 bg-white text-black font-black uppercase tracking-[0.4em] text-[11px] rounded-[1.5rem] hover:bg-blue-500 hover:text-white transition-all duration-500 disabled:opacity-50 shadow-2xl active:scale-95 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        <span className="relative z-10">{isLoading ? 'Initializing Account...' : 'Initialize'}</span>
                    </button>
                </form>
            </div>

            <p className="mt-12 text-center text-[11px] font-black uppercase tracking-[0.3em] text-white/30 italic">
                Already registered?{' '}
                <Link href="/auth/signin" className="text-white hover:text-blue-400 transition-colors underline underline-offset-8 decoration-white/10">
                    Access System
                </Link>
            </p>
        </div>
    </div>
  );
}
