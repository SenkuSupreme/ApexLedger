"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  BarChart2, 
  Brain, 
  History, 
  Shield, 
  LineChart, 
  Zap, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  Activity, 
  Lock,
  Globe,
  Cpu,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [status, router]);

  if (status === "authenticated") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-white/40 font-black text-xs uppercase tracking-[0.5em] animate-pulse">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground selection:bg-primary/10 selection:text-primary font-sans antialiased relative overflow-hidden">
      
      {/* Institutional Background Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-[1200px] h-[1200px] bg-blue-500/[0.04] blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[1200px] h-[1200px] bg-purple-500/[0.04] blur-[150px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>
      
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-700 border-b ${scrolled ? "bg-black/60 backdrop-blur-2xl border-white/10" : "bg-transparent border-transparent"}`}>
        <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer">
            <span className="text-2xl font-black tracking-tighter italic uppercase group-hover:text-blue-400 transition-colors text-white">Apex<span className="text-white/50">Ledger</span></span>
          </div>
          
          <div className="hidden lg:flex items-center gap-12 text-xs font-black uppercase tracking-[0.3em] text-white">
            <Link href="#features" className="hover:text-white transition-colors duration-300">Features</Link>
            <Link href="#methodology" className="hover:text-white transition-colors duration-300">Methodology</Link>
          </div>

          <div className="flex items-center gap-6">
            <Link 
              href="/auth/signin" 
              className="text-white/30 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.3em]"
            >
              Log In
            </Link>
            <Link 
              href="/auth/signup" 
              className="group relative flex items-center gap-3 bg-white text-black hover:bg-blue-500 hover:text-white px-8 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <span className="relative z-10">Get Started</span>
              <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-screen pt-40 pb-20 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,10,50,0.5)_0%,transparent_100%)] blur-3xl pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "circOut" }}
            className="mb-8 inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:border-blue-500/50 transition-colors cursor-default"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_15px_rgba(96,165,250,0.8)] relative z-10" />
            <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.3em] relative z-10">System v1.0 Operational</span>
          </motion.div>

          <div className="relative z-10 max-w-7xl mx-auto space-y-2">
            <motion.h1 
               initial={{ opacity: 0, y: 100 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
               className="text-[12vw] leading-[0.85] font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 drop-shadow-2xl mix-blend-overlay"
            >
              Trade
            </motion.h1>
            <motion.h1 
               initial={{ opacity: 0, y: 100 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
               className="text-[12vw] leading-[0.85] font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-b from-white/80 to-white/20"
            >
              With Logic.
            </motion.h1>
            <motion.div
               initial={{ scaleX: 0 }}
               animate={{ scaleX: 1 }}
               transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }} 
               className="h-1 w-32 bg-blue-500 mx-auto mt-12 mb-12" 
            />
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-lg md:text-2xl text-white/50 max-w-2xl mx-auto font-medium leading-relaxed tracking-wide px-4"
          >
            The institutional-grade journal for traders who treat the market as a <span className="text-white font-bold italic">profession</span> of probabilities, not a casino of luck.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-16 flex flex-col sm:flex-row items-center gap-6"
          >
            <Link 
              href="/auth/signup"
              className="group relative h-16 px-10 flex items-center bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.25em] overflow-hidden hover:scale-105 transition-transform duration-300"
            >
              <div className="absolute inset-0 bg-blue-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 will-change-transform" />
              <span className="relative z-10 group-hover:text-white transition-colors">Confirm Entry</span>
              <ArrowRight size={16} className="ml-4 relative z-10 group-hover:text-white transition-colors group-hover:translate-x-1 duration-300" />
            </Link>
            
            <Link
              href="#workflow"
              className="text-white/40 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] transition-colors border-b border-transparent hover:border-white/40 pb-1"
            >
              Explore Architecture
            </Link>
          </motion.div>
        </section>

        {/* Dashboard Preview */}
        <section className="px-8 pb-40 relative">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-7xl mx-auto"
          >
            <div className="relative rounded-[4rem] border border-white/5 bg-[#0A0A0A]/60 backdrop-blur-3xl p-4 shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden group">
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
               <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 rounded-[4rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
               
               <div className="aspect-[16/9] bg-black rounded-[3rem] overflow-hidden relative border border-white/5 shadow-inner">
                  {/* Dashboard Mockup Content (Simplified for preview) */}
                  <div className="h-full w-full p-12 flex flex-col">
                     <div className="flex items-center justify-between mb-16 border-b border-white/5 pb-8">
                        <div className="flex items-center gap-6">
                           <div className="flex gap-2">
                              <div className="w-3 h-3 rounded-full bg-white/5" />
                              <div className="w-3 h-3 rounded-full bg-white/5" />
                              <div className="w-3 h-3 rounded-full bg-white/5" />
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Dashboard Preview</span>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] text-blue-400 font-black tracking-widest uppercase">Secure</div>
                        </div>
                     </div>
                     <div className="grid grid-cols-12 gap-10 flex-1">
                        <div className="col-span-8 space-y-10">
                           <div className="h-full bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden">
                              <div className="flex justify-between items-end mb-10">
                                 <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-2 block">Total Equity</span>
                                    <h3 className="text-5xl font-black text-white italic tracking-tighter tabular-nums">$124,592.00</h3>
                                 </div>
                                 <Activity className="text-blue-500/40" size={32} />
                              </div>
                              {/* Visual spacer for chart */}
                              <div className="h-32 w-full mt-12 bg-gradient-to-r from-blue-500/5 via-blue-500/10 to-transparent rounded-full opacity-20 blur-3xl animate-pulse" />
                           </div>
                        </div>
                        <div className="col-span-4 space-y-8">
                           <div className="h-1/2 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10">
                              <div className="flex items-center justify-between mb-8">
                                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Performance Analysis</span>
                                 <Brain size={20} className="text-purple-500/40" />
                              </div>
                              <div className="space-y-4">
                                 <div className="h-1 bg-white/5 rounded-full w-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[68%]" />
                                 </div>
                                 <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">Efficiency: 68%</span>
                              </div>
                           </div>
                           <div className="h-1/2 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10">
                              <div className="flex items-center justify-between mb-8">
                                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Connection Latency</span>
                                 <Globe size={20} className="text-emerald-500/40" />
                              </div>
                              <span className="text-3xl font-black text-emerald-500/40 font-mono tracking-widest">14MS</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </section>

        {/* Workflow Section (Replaces Methodology) */}
        <section id="workflow" className="py-40 px-8 relative z-20 overflow-hidden scroll-mt-32">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-blue-900/10 to-transparent blur-[120px]" />
          
          <div className="max-w-7xl mx-auto relative z-10">
             <div className="flex flex-col gap-12 mb-32">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Operational Lifecycle</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.9] text-white">
                  The Trader's<br/><span className="text-white/20">Loop.</span>
                </h2>
             </div>
             
             <div className="space-y-40">
                {/* Step 1: PLAN */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center group">
                   <div className="order-2 lg:order-1 relative">
                      <div className="absolute inset-0 bg-blue-500/20 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                      <div className="relative border border-white/10 bg-white/[0.02] p-8 rounded-3xl backdrop-blur-md">
                          <div className="aspect-[4/3] rounded-2xl bg-[#0a0a0a]/50 border border-white/5 overflow-hidden relative">
                             {/* Abstract Rep of Strategy Page */}
                             <div className="absolute inset-4 border border-dashed border-white/10 rounded-xl flex flex-col p-6 gap-4">
                                <div className="flex justify-between items-center">
                                   <div className="h-8 w-1/3 bg-white/10 rounded-lg" />
                                   <div className="px-3 py-1 rounded-full bg-blue-500/20 text-[8px] text-blue-400 font-black uppercase tracking-widest border border-blue-500/20">Active</div>
                                </div>
                                <div className="flex-1 bg-white/5 rounded-lg border-l-4 border-blue-500/50 p-4 space-y-3">
                                   <div className="flex gap-2">
                                      <div className="h-2 w-12 bg-white/20 rounded" />
                                      <div className="h-2 w-full bg-white/5 rounded" />
                                   </div>
                                   <div className="flex gap-2">
                                      <div className="h-2 w-8 bg-white/20 rounded" />
                                      <div className="h-2 w-3/4 bg-white/5 rounded" />
                                   </div>
                                   <div className="mt-4 flex gap-2">
                                      {['LONG', 'R:R 1:3', 'A+'].map(tag => (
                                         <span key={tag} className="px-2 py-0.5 bg-white/5 rounded text-[6px] text-white/40 border border-white/5">{tag}</span>
                                      ))}
                                   </div>
                                </div>
                             </div>
                          </div>
                          {/* Floating Decor */}
                          <div className="absolute -right-4 -bottom-4 px-4 py-2 bg-black border border-white/10 rounded-lg flex items-center gap-3 shadow-2xl">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[10px] text-white/60 font-mono">Blueprint Verified</span>
                          </div>
                       </div>
                   </div>
                   <div className="order-1 lg:order-2 space-y-8">
                      <span className="text-blue-500 font-black text-xs uppercase tracking-[0.4em]">01 — Preparation</span>
                      <h3 className="text-5xl font-black uppercase italic tracking-tighter">Codify Your<br/>Edge.</h3>
                      <p className="text-xl text-white/50 leading-relaxed max-w-md">
                         Use the <span className="text-white">Strategy Foundry</span> to define rigid rules. If it's not written down, it's not a system. Build Notion-style blueprints for every setup.
                      </p>
                      <ul className="space-y-3">
                        {['Define Entry & Exit Criteria', 'Set Risk Parameters', 'Market Structural Bias'].map(item => (
                          <li key={item} className="flex items-center gap-3 text-sm text-white/60 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {item}
                          </li>
                        ))}
                      </ul>
                   </div>
                </div>

                {/* Step 2: EXECUTE */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center group">
                   <div className="space-y-8">
                      <span className="text-purple-500 font-black text-xs uppercase tracking-[0.4em]">02 — Execution</span>
                      <h3 className="text-5xl font-black uppercase italic tracking-tighter">Live Session<br/>Command.</h3>
                      <p className="text-xl text-white/50 leading-relaxed max-w-md">
                         Monitor the markets with the <span className="text-white">Session Dashboard</span>. Track active sessions, volatility, and ensure you are in sync with the institutional flow.
                      </p>
                      <ul className="space-y-3">
                        {['Sydney, Tokyo, London, NY Sessions', 'Live Volatility Tracking', 'Market Environment Checks'].map(item => (
                          <li key={item} className="flex items-center gap-3 text-sm text-white/60 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> {item}
                          </li>
                        ))}
                      </ul>
                   </div>
                   <div className="relative">
                      <div className="absolute inset-0 bg-purple-500/20 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                       <div className="relative border border-white/10 bg-white/[0.02] p-8 rounded-3xl backdrop-blur-md">
                          <div className="aspect-[4/3] rounded-2xl bg-[#0a0a0a]/50 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden p-6">
                              <div className="w-full flex justify-between items-start mb-8">
                                 <div className="space-y-1">
                                    <div className="text-[8px] text-white/40 uppercase tracking-widest">Session Volatility</div>
                                    <div className="text-xl font-black italic text-white tabular-nums">14.2<span className="text-xs text-white/40">%</span></div>
                                 </div>
                                 <Activity size={24} className="text-purple-500" />
                              </div>
                              <div className="w-full h-32 flex items-end gap-1">
                                 {[40, 60, 45, 70, 85, 60, 75, 50, 65, 80, 55, 70].map((h, i) => (
                                    <div key={i} className="flex-1 bg-purple-500/20 rounded-t-sm relative group hover:bg-purple-500/40 transition-colors" style={{ height: `${h}%` }}>
                                       <div className="absolute bottom-0 inset-x-0 h-[20%] bg-purple-500/50 blur-[2px]" />
                                    </div>
                                 ))}
                              </div>
                              <div className="mt-6 w-full flex justify-between text-[8px] text-white/20 font-mono uppercase">
                                 <span>London Open</span>
                                 <span>Pre-NY</span>
                              </div>
                          </div>
                          {/* Floating Decor */}
                          <div className="absolute -left-4 top-10 px-4 py-2 bg-black border border-white/10 rounded-lg flex items-center gap-3 shadow-2xl">
                              <Zap size={12} className="text-yellow-500" />
                              <span className="text-[10px] text-white/60 font-mono">High Impact Expectancy</span>
                          </div>
                       </div>
                   </div>
                </div>

                {/* Step 3: REVIEW */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center group">
                   <div className="order-2 lg:order-1 relative">
                      <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                       <div className="relative border border-white/10 bg-white/[0.02] p-8 rounded-3xl backdrop-blur-md">
                          <div className="aspect-[4/3] rounded-2xl bg-[#0a0a0a]/50 border border-white/5 overflow-hidden relative p-6">
                             <div className="grid grid-cols-2 gap-4 h-full">
                                <div className="bg-white/5 rounded-lg flex flex-col p-3 border border-white/5">
                                   <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center mb-2"><CheckCircle2 size={12} className="text-emerald-500" /></div>
                                   <div className="h-1.5 w-12 bg-white/20 rounded mb-1" />
                                   <div className="h-1.5 w-8 bg-white/10 rounded" />
                                </div>
                                <div className="bg-white/5 rounded-lg border border-white/5 p-3 opacity-50">
                                   <div className="h-1.5 w-full bg-white/10 rounded mb-2" />
                                   <div className="h-1.5 w-2/3 bg-white/5 rounded" />
                                </div>
                                <div className="bg-white/5 rounded-lg border border-white/5 p-3 opacity-50">
                                   <div className="h-8 w-8 rounded-full border-2 border-white/10 mb-2" />
                                </div>
                                <div className="bg-white/5 rounded-lg border border-white/5 p-3 flex flex-col justify-end">
                                   <div className="text-[10px] font-black text-white">IMPROVED</div>
                                   <div className="text-[8px] text-white/40">+24% Edge</div>
                                </div>
                             </div>
                             {/* Floating Decor */}
                              <div className="absolute -right-4 top-1/2 -translate-y-1/2 px-4 py-3 bg-black border border-white/10 rounded-xl flex flex-col gap-1 shadow-2xl">
                                  <span className="text-[8px] text-white/40 uppercase tracking-widest">Win Rate</span>
                                  <div className="flex items-baseline gap-1">
                                     <span className="text-xl font-black text-emerald-500">68%</span>
                                     <span className="text-[8px] text-emerald-500/50">▲ 2.4%</span>
                                  </div>
                              </div>
                          </div>
                       </div>
                   </div>
                   <div className="order-1 lg:order-2 space-y-8">
                      <span className="text-emerald-500 font-black text-xs uppercase tracking-[0.4em]">03 — Analysis</span>
                      <h3 className="text-5xl font-black uppercase italic tracking-tighter">Forensic<br/>Review.</h3>
                      <p className="text-xl text-white/50 leading-relaxed max-w-md">
                         This is where the money is made. Use the <span className="text-white">Journal & Analytics</span> to find leaks. Fix mistakes. Compound your improvements.
                      </p>
                      <ul className="space-y-3">
                        {['Tag-based Filtering', 'P&L Analytics', 'Chart Forensics Gallery'].map(item => (
                          <li key={item} className="flex items-center gap-3 text-sm text-white/60 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {item}
                          </li>
                        ))}
                      </ul>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* Features Bento */}
        <section id="features" className="py-40 px-8 scroll-mt-32">
          <div className="max-w-7xl mx-auto">
             <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-12">
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter italic uppercase leading-none">Institutional<br/><span className="text-white/20">Essentials.</span></h2>
                <div className="max-w-md space-y-6">
                   <p className="text-white/60 text-[13px] font-black uppercase tracking-[0.3em] italic">"The terminal strips away the noise. High-impact tools to help your P&L."</p>
                   <div className="h-px w-full bg-white/5" />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { icon: <Layers size={48} />, title: "Strategy Foundry", desc: "Build institutional blueprints. A Notion-style editor to codify your edge, rules, and execution criteria.", color: "blue", dark: true },
                  { icon: <Activity size={48} />, title: "Session Intelligence", desc: "Live session tracking. Know exactly the volatility and expectancy of London Open vs New York Close.", color: "purple", dark: false },
                  { icon: <Cpu size={48} />, title: "Execution Architecture", desc: "Map your trade lifecycle. From bias formation to signal triggers and management protocols.", color: "red", dark: true },
                  { icon: <Database size={48} />, title: "Journal Forensics", desc: "Detailed artifact logging. Store charts, tag setups, and review via a high-fidelity terminal interface.", color: "emerald", dark: false },
                ].map((feature, i) => (
                  <div 
                    key={i} 
                    className="p-16 rounded-[4rem] min-h-[500px] flex flex-col justify-between group transition-all duration-700 relative overflow-hidden bg-black/40 backdrop-blur-md border border-white/10 hover:border-white/20"
                  >
                     <div className={`absolute inset-0 bg-${feature.color}-500 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700`} />
                     <div className="text-white/20 group-hover:text-white transition-colors duration-500">
                        {feature.icon}
                     </div>
                     <div className="space-y-6">
                        <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-none">{feature.title}</h3>
                        <p className="text-white/60 group-hover:text-white/80 text-xl font-black uppercase tracking-tight italic transition-colors">
                           "{feature.desc}"
                        </p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-64 px-8 border-t border-white/5 relative overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-500/[0.05] blur-[150px] -z-10" />
           <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter italic uppercase leading-none mb-20 animate-pulse break-words px-4">
                No Color.<br/><span className="opacity-20">Just Alpha.</span>
              </h2>
              <Link 
                href="/auth/signup"
                className="inline-flex items-center gap-6 bg-white text-black px-16 py-8 rounded-[2.5rem] font-black text-xl uppercase tracking-[0.4em] hover:bg-blue-500 hover:text-white transition-all shadow-3xl active:scale-95 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative z-10">Get Started</span>
                <ArrowRight size={24} className="relative z-10 group-hover:translate-x-2 transition-transform" />
              </Link>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-border bg-background text-muted-foreground text-[10px] font-black uppercase tracking-[0.4em] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="flex items-center gap-4 group cursor-pointer">
              <span className="text-xl font-black italic tracking-tighter text-muted-foreground">Apex<span className="text-white/30">Ledger</span></span>
           </div>
           <div className="flex gap-16">
              <Link href="/terms" className="hover:text-white transition-colors italic">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-white transition-colors italic">Privacy Policy</Link>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="italic text-white/40">EST. 2024</span>
           </div>
        </div>
      </footer>
    </div>
  );
}
