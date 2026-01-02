import Link from "next/link";
import { ArrowLeft, Shield, Globe, Lock } from "lucide-react";

export default function Terms() {
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
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400">
               <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em]">Legal Protocol</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/5 rounded-full text-white/60">
               <Shield size={10} className="text-blue-500/50" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em]">Compliance</span>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-[0.02em] leading-none bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent">
            Terms of<br/>Service
          </h1>
          <p className="text-white/80 text-[11px] font-black uppercase tracking-[0.4em] italic leading-relaxed">
            Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          <div className="md:col-span-4 space-y-6">
             <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-4">
                <Globe size={24} className="text-blue-500/40" />
                <h3 className="text-xs font-black uppercase tracking-widest italic">Global Standard</h3>
                <p className="text-[10px] text-white/40 font-medium leading-relaxed italic">"Our terms are designed to protect both the operator and the platform in a high-fidelity trading environment."</p>
             </div>
             <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-4">
                <Lock size={24} className="text-purple-500/40" />
                <h3 className="text-xs font-black uppercase tracking-widest italic">Data Rights</h3>
                <p className="text-[10px] text-white/40 font-medium leading-relaxed italic">"You retain full ownership of your journal entries and strategic blueprints."</p>
             </div>
          </div>

          <div className="md:col-span-8 space-y-16">
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                   <span className="text-[11px] font-black px-3 py-1 bg-white text-black rounded-lg">01</span>
                   <h2 className="text-2xl font-black italic uppercase tracking-tighter">Operational Agreement</h2>
                </div>
                <p className="text-white/60 text-sm font-medium leading-relaxed italic">
                    By initializing your session with ApexLedger, you enter into a binding operational agreement. You acknowledge that our platform serves as a high-fidelity recording instrument and not as a financial advisory service.
                </p>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-4">
                   <span className="text-[11px] font-black px-3 py-1 bg-white text-black rounded-lg">02</span>
                   <h2 className="text-2xl font-black italic uppercase tracking-tighter">Usage License</h2>
                </div>
                <p className="text-white/60 text-sm font-medium leading-relaxed italic">
                    ApexLedger grants you a non-exclusive, non-transferable license to utilize our analytical engine. This access is intended for personal development and strategic refinement within your professional trading scope.
                </p>
            </section>

            <section className="space-y-6">
                <div className="flex items-center gap-4">
                   <span className="text-[11px] font-black px-3 py-1 bg-white text-black rounded-lg">03</span>
                   <h2 className="text-2xl font-black italic uppercase tracking-tighter">Risk Assessment</h2>
                </div>
                <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-[2rem] space-y-4">
                    <p className="text-white/80 text-sm font-black italic uppercase tracking-tight">
                        Trading involves extreme capital risk.
                    </p>
                    <p className="text-white/60 text-[13px] font-medium leading-relaxed italic">
                        Past performance data generated by ApexLedger analytics is not indicative of future market conditions. You are solely responsible for your executions and capital deployment.
                    </p>
                </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
