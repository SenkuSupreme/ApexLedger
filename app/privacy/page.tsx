import Link from "next/link";
import { ArrowLeft, Shield, Eye, Lock, Database } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen text-white selection:bg-white selection:text-black font-sans relative overflow-hidden pb-20">

      <div className="max-w-4xl mx-auto px-6 pt-32 space-y-20 relative z-10">
        {/* Header */}
        <div className="space-y-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-all group mb-4">
             <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-all">
               <ArrowLeft size={16} />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exit to Landing</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em]">Encryption Active</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/5 rounded-full text-white/60">
               <Shield size={10} className="text-emerald-500/50" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em]">Privacy Shield</span>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-[0.02em] leading-none bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent">
            Privacy<br/>Policy
          </h1>
          <p className="text-white/80 text-[11px] font-black uppercase tracking-[0.4em] italic leading-relaxed">
            Last Calibration: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          <div className="md:col-span-4 space-y-6">
             <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-4">
                <Lock size={24} className="text-emerald-500/40" />
                <h3 className="text-xs font-black uppercase tracking-widest italic">Zero Leakage</h3>
                <p className="text-[10px] text-white/40 font-medium leading-relaxed italic">"Your strategies are yours. We do not sell your trading data to third-party liquidity providers or hedge funds."</p>
             </div>
             <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-4">
                <Database size={24} className="text-sky-500/40" />
                <h3 className="text-xs font-black uppercase tracking-widest italic">Data Sovereignty</h3>
                <p className="text-[10px] text-white/40 font-medium leading-relaxed italic">"Request an export or full purge of your journal artifacts at any time via the control terminal."</p>
             </div>
          </div>

          <div className="md:col-span-8 space-y-16">
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                   <span className="text-[11px] font-black px-3 py-1 bg-white text-black rounded-lg">01</span>
                   <h2 className="text-2xl font-black italic uppercase tracking-tighter">Data Accumulation</h2>
                </div>
                <p className="text-white/60 text-sm font-medium leading-relaxed italic">
                    We accumulate only the metadata required to optimize your trading performance. This includes entry/exit parameters, emotional tags, and strategic blueprints provided during your operational sessions.
                </p>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-4">
                   <span className="text-[11px] font-black px-3 py-1 bg-white text-black rounded-lg">02</span>
                   <h2 className="text-2xl font-black italic uppercase tracking-tighter">Neural Processing</h2>
                </div>
                <p className="text-white/60 text-sm font-medium leading-relaxed italic">
                    Your journal entries are processed by our internal analytical engine to generate performance insights. This processing is localized to your account and encrypted at rest using industry-standard protocols.
                </p>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-4">
                   <span className="text-[11px] font-black px-3 py-1 bg-white text-black rounded-lg">03</span>
                   <h2 className="text-2xl font-black italic uppercase tracking-tighter">Transmission Security</h2>
                </div>
                <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] space-y-4">
                    <div className="flex items-center gap-3">
                        <Eye size={18} className="text-emerald-500/40" />
                        <p className="text-white/80 text-sm font-black italic uppercase tracking-tight">
                            Identity Verification
                        </p>
                    </div>
                    <p className="text-white/60 text-[13px] font-medium leading-relaxed italic">
                        Access to your journal is protected by multi-factor authentication protocols. We monitor for suspicious login attempts to ensure your strategic edge remains confidential.
                    </p>
                </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
