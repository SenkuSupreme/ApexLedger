"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Globe, Lock, Scale, AlertTriangle, FileCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 font-sans antialiased overflow-x-hidden pb-40 relative">
      
      {/* Background System */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-32 relative z-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-12 mb-32"
        >
          <Link href="/" className="inline-flex items-center gap-3 text-white/30 hover:text-white transition-all group">
             <div className="w-10 h-10 border border-white/10 rounded-xl flex items-center justify-center bg-white/[0.03] group-hover:border-indigo-500/50 group-hover:bg-indigo-500/10 transition-all duration-500">
               <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Back Home</span>
          </Link>
          
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400">
                 <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-[0.3em]">Terms of Service</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.03] border border-white/5 rounded-full text-white/60">
                 <Scale size={12} className="text-indigo-500/50" />
                 <span className="text-[9px] font-black uppercase tracking-[0.3em]">Our Rules</span>
              </div>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.85] text-white">
              Terms of<br/><span className="text-white/20">Service.</span>
            </h1>
            
            <div className="flex items-center gap-6">
               <div className="h-px w-20 bg-white/10" />
               <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.4em] italic leading-relaxed">
                 Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
               </p>
            </div>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
          
          {/* Sidebar Modules */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-4 space-y-8"
          >
             <div className="p-10 bg-[#080808] border border-white/10 rounded-[3rem] space-y-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-transparent pointer-events-none" />
                <Globe size={32} className="text-indigo-500/40 group-hover:scale-110 transition-transform duration-700" />
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Universal</h3>
                <p className="text-[11px] text-white/40 font-bold leading-relaxed italic uppercase tracking-widest">"Our terms are designed to protect both the operator and the platform in a high-fidelity trading environment."</p>
             </div>

             <div className="p-10 bg-[#080808] border border-white/10 rounded-[3rem] space-y-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.03] to-transparent pointer-events-none" />
                <FileCheck size={32} className="text-purple-500/40 group-hover:scale-110 transition-transform duration-700" />
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Data Rights</h3>
                <p className="text-[11px] text-white/40 font-bold leading-relaxed italic uppercase tracking-widest">"You retain full ownership of your journal entries and strategic blueprints. We are merely the ledger."</p>
             </div>
          </motion.div>

          {/* Core Clauses */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-8 space-y-32"
          >
            {[
              {
                id: "01",
                title: "Our Agreement",
                content: "By using ApexLedger, you agree to our terms. This platform is an educational tool for recording trades and should not be seen as financial advice."
              },
              {
                id: "02",
                title: "Your Access",
                content: "We give you a private license to use our analysis tools for your own personal development and to improve your trading skills."
              },
              {
                id: "03",
                title: "Market Risk",
                content: "Trading is risky and you could lose your capital. The data shown here does not guarantee future results. You are responsible for your own trades.",
                isWarning: true
              }
            ].map((section, i) => (
              <section key={i} className="space-y-10 group">
                <div className="flex items-center gap-6">
                   <div className="w-12 h-12 border border-white/10 rounded-xl flex items-center justify-center bg-white/[0.03] text-indigo-500 font-black italic text-lg opacity-40 group-hover:opacity-100 group-hover:border-indigo-500/40 transition-all duration-700">
                      {section.id}
                   </div>
                   <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white group-hover:translate-x-2 transition-transform duration-700">{section.title}</h2>
                </div>
                
                <div className={`p-1 w-full bg-gradient-to-r from-white/10 via-transparent to-transparent mb-8`} />

                {section.isWarning ? (
                  <div className="p-12 bg-rose-500/5 border border-rose-500/10 rounded-[3rem] space-y-6 relative overflow-hidden">
                     <div className="flex items-center gap-4">
                        <AlertTriangle size={20} className="text-rose-500" />
                        <span className="text-xs font-black uppercase tracking-[0.4em] text-rose-500">Critical Risk Disclosure</span>
                     </div>
                     <p className="text-rose-500/80 text-xl font-medium leading-relaxed italic uppercase tracking-tighter">
                        {section.content}
                     </p>
                  </div>
                ) : (
                  <p className="text-white/30 text-xl font-medium leading-relaxed italic uppercase tracking-tighter max-w-3xl">
                    {section.content}
                  </p>
                )}
              </section>
            ))}

            {/* Legal Contact */}
            <div className="pt-20">
               <div className="p-12 border border-white/5 bg-white/[0.01] rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-10">
                  <div className="space-y-2 text-center md:text-left">
                     <h4 className="text-lg font-black uppercase tracking-widest italic text-white/60">Legal Question?</h4>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">We believe in being clear and fair.</p>
                  </div>
                  <Link href="mailto:support@apexledger.com" className="px-10 py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95">
                     Contact Us
                  </Link>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
