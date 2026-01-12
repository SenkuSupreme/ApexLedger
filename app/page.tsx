"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  BarChart2, 
  Brain, 
  Zap, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  Activity, 
  Globe,
  Cpu,
  Database,
  Calendar as CalendarIcon,
  Search,
  Book,
  BookOpen,
  CheckSquare,
  Target,
  StickyNote,
  Notebook,
  Microscope,
  Timer,
  Eye,
  Activity as ActivityIcon,
  Calculator,
  Newspaper,
  Terminal,
  Sparkles,
  Maximize2,
  FileText,
  Workflow,
  LayoutDashboard,
  Clock,
  Gauge,
  Scan,
  Shapes,
  ChevronDown,
  Shield,
  Lock,
  ArrowUpRight,
  LineChart,
  GitBranch,
  Crosshair,
  TrendingDown,
  History,
  Compass,
  BarChart3
} from "lucide-react";
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

// --- Component: Feature Tag ---
const FeatureTag = ({ text, isAI = false }: { text: string; isAI?: boolean }) => (
  <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all ${isAI ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white" : "border-white/10 bg-white/5 text-white/40 group-hover:border-white/20"}`}>
    {isAI && <Sparkles size={10} className="animate-pulse" />}
    {text}
  </span>
);

// --- Component: Enhanced Feature Card ---
const FeatureCard = ({ 
  title, 
  desc, 
  icon: Icon, 
  isAI = false, 
  tags = [], 
  className = "" 
}: { 
  title: string; 
  desc: string; 
  icon: any; 
  isAI?: boolean; 
  tags?: string[];
  className?: string;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = cardRef.current;
    const spotlight = spotlightRef.current;
    if (!el || !spotlight) return;

    const onMove = (e: MouseEvent) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      
      gsap.to(el, {
        rotateY: x * 12,
        rotateX: -y * 12,
        scale: 1.03,
        duration: 0.4,
        ease: "power2.out"
      });

      gsap.to(spotlight, {
        opacity: 1,
        x: e.clientX - left,
        y: e.clientY - top,
        duration: 0.4,
        ease: "power2.out"
      });
    };

    const onLeave = () => {
      gsap.to(el, { rotateY: 0, rotateX: 0, scale: 1, duration: 0.8, ease: "elastic.out(1, 0.3)" });
      gsap.to(spotlight, { opacity: 0, duration: 0.4 });
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  });

  return (
    <div 
      ref={cardRef} 
      className={`group relative perspective-[2000px] border border-white/10 bg-[#080808] hover:border-indigo-500/40 transition-all duration-700 p-12 rounded-[3rem] flex flex-col justify-between aspect-square h-full overflow-hidden shadow-2xl ${className}`}
      style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d', WebkitFontSmoothing: 'antialiased', transform: 'translateZ(0) rotateZ(0.01deg)' }}
    >
      {/* Background Micro-Icon Watermark */}
      <div className="absolute -right-12 -bottom-12 opacity-[0.02] group-hover:opacity-[0.08] transition-all duration-1000 group-hover:scale-150 rotate-[-15deg] group-hover:rotate-0 pointer-events-none text-white overflow-hidden">
         <Icon size={240} />
      </div>

      {/* Dynamic Spotlight Glow */}
      <div 
        ref={spotlightRef}
        className="absolute w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 z-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.2)_0%,transparent_70%)]"
      />
      
      <div className="space-y-10 relative z-10">
        <div className={`w-20 h-20 border-2 border-white/5 flex items-center justify-center rounded-[1.5rem] group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 ${isAI ? "text-indigo-400 bg-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.3)]" : "text-white/20 bg-white/5 group-hover:text-indigo-500 group-hover:bg-indigo-500/5"}`}>
          <Icon size={40} />
        </div>
        
        <div className="space-y-5">
          <div className="flex items-center gap-3">
             <h3 className="text-3xl lg:text-4xl font-black uppercase italic text-white tracking-tighter leading-none group-hover:text-indigo-400 transition-colors duration-500">{title}</h3>
             {isAI && <Sparkles size={20} className="text-indigo-500 animate-pulse" />}
          </div>
          <p className="text-sm lg:text-base font-bold uppercase tracking-widest leading-relaxed text-white/30 group-hover:text-white/70 transition-colors duration-500">"{desc}"</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-10 relative z-10 group-hover:translate-x-1 transition-transform">
        {tags.map((tag, i) => <FeatureTag key={i} text={tag} isAI={tag.includes("AI")} />)}
      </div>

      {/* Glass Finishing Shimmer */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000 pointer-events-none" />
    </div>
  );
};

export default function ReimaginedLanding() {
  const { status } = useSession();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useGSAP(() => {
    // Reveal Animations
    gsap.utils.toArray(".reveal-up").forEach((el: any) => {
      gsap.from(el, {
        opacity: 0,
        y: 60,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });
    });
  }, { scope: containerRef });

  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard");
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [status, router]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  if (status === "authenticated") return <div className="h-screen bg-black flex items-center justify-center font-black text-xs uppercase tracking-[0.5em] text-white/20 animate-pulse">Initializing...</div>;

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/40 font-sans antialiased overflow-x-hidden">
      
      {/* --- VOID BACKGROUND SYSTEM --- */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.1)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-indigo-500 z-[110] origin-left shadow-[0_0_20px_rgba(99,102,241,0.6)]" style={{ scaleX }} />

      {/* Navigation */}
      <nav className={`fixed w-full z-[100] transition-all duration-1000 ${scrolled ? "bg-black/95 backdrop-blur-3xl py-4 border-b border-white/5 shadow-2xl" : "bg-transparent py-10"}`}>
        <div className="max-w-[1500px] mx-auto px-10 flex items-center justify-between">
          <div className="flex items-center gap-5 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="w-11 h-11 border-2 border-indigo-500/40 flex items-center justify-center rounded-[0.75rem] group-hover:border-indigo-400 group-hover:bg-indigo-500/10 transition-all duration-500">
               <Terminal size={22} className="text-white group-hover:text-indigo-400" />
            </div>
            <span className="text-3xl font-black uppercase italic tracking-tighter">Apex<span className="text-white/20 group-hover:text-white/40 transition-colors">Ledger</span></span>
          </div>
          
          <div className="hidden lg:flex items-center gap-14 text-[10px] font-black uppercase tracking-[0.5em] text-white/20">
            {['Control', 'Neural', 'Ledger', 'Logic', 'Arsenal'].map((item, i) => (
              <button key={item} onClick={() => scrollToSection(`sector-0${i+1}`)} className="hover:text-indigo-400 transition-all hover:tracking-[0.7em]">
                {item}
              </button>
            ))}
          </div>

          <Link href="/auth/signup" className="bg-white text-black px-8 py-3.5 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3">
            Deploy Node <ArrowUpRight size={14} />
          </Link>
        </div>
      </nav>

      <main>
        {/* --- CINEMATIC HERO --- */}
        <section className="min-h-screen flex flex-col items-center justify-center pt-52 pb-20 px-10 relative">
          <div className="max-w-7xl text-center space-y-12">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center">
              <span className="px-8 py-2.5 border border-indigo-500/30 bg-indigo-500/5 rounded-full text-[10px] font-black uppercase tracking-[0.8em] text-indigo-400 flex items-center gap-4">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" /> 
                Next-Generation Specification Hub
              </span>
            </motion.div>
            
            <h1 className="flex flex-col items-center select-none overflow-visible">
              <span className="text-[clamp(3.5rem,12vw,10rem)] font-black uppercase italic leading-[0.75] tracking-tighter text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.1)]">PEAK</span>
              <span className="text-[clamp(3.5rem,12vw,10rem)] font-black uppercase italic leading-[0.75] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent opacity-20">PERFORMANCE.</span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-white/30 max-w-4xl mx-auto font-medium leading-[1.1] italic uppercase tracking-tighter py-10">
              The elite command board for clinical execution. <br />
              <span className="text-white italic">Master the data. Solve the logic.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-10">
              <Link href="/auth/signup" className="h-16 px-12 flex items-center justify-center bg-white text-black font-black text-[12px] uppercase tracking-[0.3em] hover:bg-indigo-600 hover:text-white transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:scale-105">
                Launch Protocol <ArrowRight size={20} className="ml-5" />
              </Link>
              <button onClick={() => scrollToSection('sector-01')} className="text-white/20 hover:text-white transition-all text-[11px] font-black uppercase tracking-[0.5em] flex items-center gap-4 group">
                Protocol Map <ChevronDown size={14} className="group-hover:translate-y-2 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        {/* --- SECTOR 01: DASHBOARD --- */}
        <section id="sector-01" className="py-72 px-10 reveal-up">
           <div className="max-w-[1500px] mx-auto space-y-32">
              <div className="flex flex-col lg:flex-row justify-between items-end gap-16">
                 <div className="space-y-6">
                    <span className="text-[12px] font-black text-indigo-500 uppercase tracking-[0.8em]">Sector_01: Your Dashboard</span>
                    <h2 className="text-7xl md:text-8xl font-black uppercase italic leading-[0.8] text-white">Full Data<br/><span className="text-white/20">Control.</span></h2>
                 </div>
                 <p className="max-w-sm text-lg font-bold uppercase tracking-widest text-white/30 italic text-right leading-relaxed">Everything you need to track your growth and performance in one clean space.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                 <div className="lg:col-span-8">
                    <div className="h-full bg-[#070707] border border-white/10 rounded-[3rem] group hover:border-indigo-500/40 transition-all duration-1000 relative overflow-hidden shadow-[0_0_80px_rgba(0,0,0,1)] flex">
                       {/* Mock Sidebar */}
                       <div className="w-16 border-r border-white/5 h-full bg-black flex flex-col items-center py-10 gap-8 opacity-40 group-hover:opacity-100 transition-opacity">
                          {[LayoutDashboard, Activity, Zap, Layers, Globe, Shield].map((I, i) => (
                             <I key={i} size={18} className={i === 0 ? "text-indigo-500" : "text-white/20"} />
                          ))}
                       </div>
                       
                       <div className="flex-1 flex flex-col">
                          {/* Mock Header */}
                          <div className="p-8 border-b border-white/5 flex justify-between items-center">
                             <div className="flex items-center gap-4">
                                <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-2">
                                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                                   <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">NYC Session ACTIVE</span>
                                </div>
                                <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                                   <Globe size={10} className="text-white/30" />
                                   <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Market Open</span>
                                </div>
                             </div>
                             <div className="flex gap-2">
                                <div className="w-6 h-6 rounded-full bg-white/10" />
                                <div className="w-6 h-6 rounded-full bg-white/5" />
                             </div>
                          </div>

                          <div className="p-10 space-y-12">
                             <div className="flex flex-col md:flex-row justify-between items-end gap-12">
                                <div className="space-y-3">
                                   <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Portfolio Performance</span>
                                   <div className="text-6xl font-black italic tracking-tighter text-white tabular-nums">$242,592.50</div>
                                   <div className="flex items-center gap-4">
                                      <span className="text-emerald-500 text-xs font-black uppercase tracking-widest">+12.4% MONTHLY GROWTH</span>
                                      <div className="h-1 w-32 bg-emerald-500/10 rounded-full overflow-hidden">
                                         <div className="h-full bg-emerald-500 w-[78%]" />
                                      </div>
                                   </div>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
                                   {[
                                     { label: 'Win Rate', val: '72.4%' },
                                     { label: 'P/L Ratio', val: '2.84' },
                                     { label: 'Max DD', val: '2.1%' },
                                     { label: 'Sharpe', val: '3.2' }
                                   ].map((s, i) => (
                                     <div key={i} className="px-6 py-4 border border-white/5 bg-white/[0.02] rounded-2xl flex flex-col gap-1 items-start min-w-[120px] group/s hover:bg-white/5 transition-colors">
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest group-hover/s:text-indigo-400 transition-colors">{s.label}</span>
                                        <span className="text-lg font-black italic text-white">{s.val}</span>
                                     </div>
                                   ))}
                                </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 h-64">
                                {/* Equity Chart Mock */}
                                <div className="relative border border-white/5 bg-black/40 rounded-[2rem] p-8 overflow-hidden group/c">
                                   <div className="flex justify-between items-center mb-8 relative z-10">
                                      <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Equity Curve</span>
                                      <TrendingUp size={14} className="text-indigo-500" />
                                   </div>
                                   <div className="absolute inset-x-0 bottom-0 h-32 opacity-10 blur-sm bg-gradient-to-t from-indigo-500 to-transparent translate-y-8" />
                                   <div className="h-full flex items-end gap-1 relative z-10">
                                      {Array.from({length: 48}).map((_, i) => (
                                         <div key={i} className="flex-1 bg-indigo-500/20 group-hover/c:bg-indigo-500/40 transition-all duration-700 hover:!bg-indigo-400 hover:scale-y-110" style={{ height: `${20 + Math.random() * 80}%` }} />
                                      ))}
                                   </div>
                                </div>
                                
                                {/* Latest Activity Mock */}
                                <div className="border border-white/5 bg-black/40 rounded-[2rem] p-8 space-y-6">
                                   <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-white/20">
                                      Live Execution Tape <History size={14} />
                                   </div>
                                   <div className="space-y-3">
                                      {[
                                        { pair: 'GBPUSD', type: 'BUY', result: '+$4,210.50', color: 'emerald' },
                                        { pair: 'XAUUSD', type: 'SELL', result: '-$1,080.20', color: 'rose' },
                                        { pair: 'EURJPY', type: 'BUY', result: '+$2,842.10', color: 'emerald' },
                                        { pair: 'BTCUSD', type: 'SELL', result: '+$6,402.00', color: 'emerald' }
                                      ].map((t, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 border border-white/5 bg-white/[0.02] rounded-xl hover:bg-white/5 transition-colors">
                                           <div className="flex items-center gap-3">
                                              <div className={`w-1.5 h-1.5 rounded-full ${t.result.includes('+') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
                                              <span className="text-[11px] font-black text-white tracking-widest">{t.pair}</span>
                                              <span className="text-[8px] font-black text-white/20">{t.type}</span>
                                           </div>
                                           <span className={`text-[11px] font-black italic ${t.result.includes('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{t.result}</span>
                                        </div>
                                      ))}
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="lg:col-span-4 flex flex-col gap-10">
                    <FeatureCard title="Command Center" desc="The primary hub for all your market telemetry and analytics." icon={LayoutDashboard} tags={["Real-time", "Growth"]} />
                    <div className="p-16 border border-white/10 bg-black rounded-[4rem] flex flex-col justify-between items-center text-center group hover:border-indigo-500/40 transition-all">
                       <span className="text-xs font-black uppercase tracking-widest text-white/30">Total Executions</span>
                       <div className="text-8xl font-black italic group-hover:text-indigo-400 transition-colors">2.4k</div>
                       <Activity className="text-indigo-500/20" size={64} />
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* --- SECTOR 02: AI HUB --- */}
        <section id="sector-02" className="py-72 px-10 bg-zinc-950/20 reveal-up">
           <div className="max-w-[1500px] mx-auto space-y-40 text-center">
              <div className="space-y-12">
                 <div className="flex flex-col items-center gap-8">
                    <div className="w-24 h-24 border-2 border-indigo-500/20 rounded-[2rem] flex items-center justify-center bg-indigo-500/5 rotate-12 group hover:rotate-0 transition-transform duration-700 shadow-[0_0_50px_rgba(99,102,241,0.1)]">
                       <Sparkles size={48} className="text-indigo-500" />
                    </div>
                    <span className="text-[13px] font-black text-indigo-500 uppercase tracking-[1em]">Artificial Logic Unit</span>
                 </div>
                 <h2 className="text-7xl md:text-8xl font-black uppercase italic leading-[0.75] text-white">AI Power<br/><span className="text-white/20">Analysis.</span></h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                 <FeatureCard title="Neuro Insights" desc="AI identifies deep patterns and mistakes in your execution behavior." icon={Brain} isAI tags={["AI Matrix", "Audit"]} />
                 <FeatureCard title="Predictive Forecast" desc="Institutional price trajectories based on market structure logic." icon={TrendingUp} isAI tags={["AI Predictive", "SMC"]} />
                 <FeatureCard title="Forecast Detail" desc="Specific risk/reward mapping for every machine-generated setup." icon={Microscope} isAI tags={["AI Forecast", "SMC"]} />
                 <FeatureCard title="Neural Strategy" desc="Automated strategy refinement based on real-world desk performance." icon={Zap} isAI tags={["AI Refinement", "Rules"]} />
                 <FeatureCard title="Neuro Rules" desc="Self-adjusting risk checklists that sync with market volatility flow." icon={CheckSquare} isAI tags={["AI Governance", "Risk"]} />
                 <FeatureCard title="Confidence Scor" desc="Machine-scoring your setups based on multi-variate confluence." icon={Gauge} isAI tags={["AI Scoring", "Metrics"]} />
              </div>
           </div>
        </section>

        {/* --- SECTOR 03: JOURNAL --- */}
        <section id="sector-03" className="py-72 px-10 reveal-up">
           <div className="max-w-[1500px] mx-auto space-y-32">
              <div className="flex flex-col lg:flex-row justify-between items-end gap-16">
                 <div className="space-y-8 max-w-2xl">
                    <span className="text-[12px] font-black text-indigo-500 uppercase tracking-[0.8em]">Sector_03: Forensic Ledger</span>
                    <h2 className="text-7xl md:text-8xl font-black uppercase italic leading-[0.8] tracking-tighter text-white">Smart<br/><span className="text-white/20">Journaling.</span></h2>
                    <p className="text-2xl text-white/30 font-medium italic leading-[1.1] uppercase tracking-tighter pt-8">
                       Capture every fragment of your process. From high-fidelity <span className="text-white">Trade Cards</span> to institutional dossiers.
                    </p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-8 pb-4">
                    {[
                      { icon: BookOpen, label: "Journal Detail" },
                      { icon: Zap, label: "Trade Evidence" },
                      { icon: CalendarIcon, label: "Audit Calendar" },
                      { icon: Notebook, label: "Intelligence Notebook" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                         <div className="w-12 h-12 border border-white/5 rounded-xl flex items-center justify-center bg-white/[0.02] group-hover:border-indigo-500/50 group-hover:text-indigo-400 transition-all duration-500">
                            <item.icon size={20} />
                         </div>
                         <span className="text-[11px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">{item.label}</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                 <FeatureCard title="Forensic Notes" desc="Rich text environment for deep psychological and technical trade auditing." icon={StickyNote} tags={["Deep Archive", "Audit"]} />
                 <FeatureCard title="Neuro Insights" desc="AI identifies deep patterns and mistakes in your execution behavior." icon={Brain} isAI tags={["AI Matrix", "Audit"]} />
                 <FeatureCard title="Institutional Charts" desc="Visual evidence mapping for every execution across any timeframe." icon={LineChart} tags={["Telemetry", "Visuals"]} />
              </div>
           </div>
        </section>

        {/* --- SECTOR 04: STRATEGY --- */}
        <section id="sector-04" className="py-72 px-10 bg-[#080808] border-y border-white/5 reveal-up">
           <div className="max-w-[1500px] mx-auto space-y-40">
              <div className="flex flex-col lg:flex-row justify-between items-end gap-16">
                 <div className="space-y-8">
                    <span className="text-[12px] font-black text-indigo-500 uppercase tracking-[0.8em]">Sector_04: Logical Rules</span>
                    <h2 className="text-7xl md:text-8xl font-black uppercase italic leading-[0.8] text-white">Strategy<br/><span className="text-white/20">Builder.</span></h2>
                 </div>
                 <p className="max-w-md text-xl font-bold uppercase tracking-widest text-white/30 italic text-right leading-relaxed">Create and test your trading rules. Stay disciplined and trade without emotions.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                 <FeatureCard title="Core Strategy" desc="Multi-node logical blueprints for systematic execution and exits." icon={Workflow} tags={["Logic", "Arch"]} />
                 <FeatureCard title="Bias Forensics" desc="HTF directional alignment audit versus lower timeframe execution." icon={Eye} tags={["HTF", "Bias"]} />
                 <FeatureCard title="Market State" desc="Classification of the current environmental cycle and volatility flow." icon={Globe} tags={["Context", "AMD"]} />
                 <FeatureCard title="Execution Plan" desc="Seamless pipeline mapping from initial bias to final trade trigger." icon={Layers} tags={["Pipeline", "System"]} />
                 <FeatureCard title="Signal Trigger" desc="Precise visual filters for zero-hesitation execution on transactional timeframes." icon={Crosshair} tags={["Entry", "M1"]} />
                 <FeatureCard title="Confluence Scor" desc="Quantitative scoring of your setups based on multi-variate rule sets." icon={Gauge} tags={["Qual", "Node"]} />
                 <FeatureCard title="Strategic Stats" desc="Real-time performance metrics for every individual conceptual rule set." icon={ActivityIcon} tags={["Live", "Stats"]} />
                 <FeatureCard title="Logical Flow" desc="Recursive blueprinting of your entry and risk management rules." icon={GitBranch} tags={["Rules", "Logic"]} />
              </div>
           </div>
        </section>

        {/* --- SECTOR 05: THE TOOLKIT (REMASTERED) --- */}
        <section id="sector-05" className="py-80 px-10 relative overflow-hidden bg-black">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_70%)] pointer-events-none" />
           
           <div className="max-w-[1500px] mx-auto space-y-48 reveal-up">
              <div className="text-center space-y-10">
                 <div className="flex flex-col items-center gap-10">
                    <div className="w-24 h-24 border-2 border-white/10 rounded-[2.5rem] flex items-center justify-center bg-white/5 opacity-40">
                       <Terminal size={48} className="text-white" />
                    </div>
                    <span className="text-[14px] font-black text-indigo-500 uppercase tracking-[1.2em]">Sector_05: Institutional Arsenal</span>
                 </div>
                 <h2 className="text-7xl md:text-[10vw] font-black uppercase italic text-white tracking-widest leading-none">Complete Toolkit.</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                 {[
                   { icon: Target, label: "Goal Tracker", desc: "Long-range performance and account growth maps." },
                   { icon: CheckCircle2, label: "Daily Workflow", desc: "Daily speculative task list and execution routine." },
                   { icon: ActivityIcon, label: "Habit Tracker", desc: "Institutional discipline and behavioral telemetry." },
                   { icon: Newspaper, label: "Market Flux", desc: "High-impact economic events and news tracking." },
                   { icon: Microscope, label: "Research Bay", desc: "Macro institutional intelligence and market data." },
                   { icon: Calculator, label: "Risk Engine", desc: "Precise position sizing and risk management calculator." },
                   { icon: BarChart3, label: "Visual Metrics", desc: "Institutional-grade data visualization and charts." },
                   { icon: Timer, label: "Killzone Hub", desc: "Session overlap volatility and time-based alerts." },
                   { icon: Search, label: "Neural Search", desc: "Ai-powered retrieval of every note and archive node." },
                   { icon: Shield, label: "Privacy Core", desc: "End-to-End node encryption for every execution docket." },
                   { icon: Lock, label: "Security Hub", desc: "Multi-factor authentication and neural safety shield." },
                   { icon: Sparkles, label: "AI Checklist", desc: "Machine-governed trade and rule validation engine.", isAI: true }
                 ].map((tool, i) => (
                   <FeatureCard 
                     key={i}
                     title={tool.label}
                     desc={tool.desc}
                     icon={tool.icon}
                     isAI={tool.isAI}
                     tags={["Arsenal", tool.isAI ? "AI Powered" : "Forensics"]}
                   />
                 ))}
              </div>
           </div>
        </section>

        {/* --- ULTIMATE CTA --- */}
        <section className="py-96 px-10 text-center bg-black relative overflow-hidden reveal-up">
           <div className="max-w-6xl mx-auto space-y-32">
              <h2 className="text-7xl md:text-[10vw] font-black uppercase italic leading-[0.7] tracking-tighter text-white select-none">
                 Ready to <br /> <span className="text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-transparent">Start.</span>
              </h2>
              <div className="flex justify-center">
                 <Link href="/auth/signup" className="bg-indigo-600 text-white px-16 py-6 font-black text-xl uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-[0_30px_80px_rgba(79,70,229,0.3)] transform hover:scale-105 active:scale-95">
                    Start Now <ArrowRight size={24} className="ml-6" />
                 </Link>
              </div>
           </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="py-48 px-10 border-t border-white/5 bg-[#010101]">
         <div className="max-w-[1500px] mx-auto flex flex-col lg:flex-row justify-between items-center gap-32 opacity-20 hover:opacity-100 transition-opacity duration-1000">
            <div className="flex items-center gap-10">
              <Zap size={40} className="text-indigo-500" />
              <span className="text-4xl font-black italic tracking-tighter uppercase whitespace-nowrap">ApexLedger</span>
            </div>
            <div className="flex flex-wrap justify-center gap-24 text-[12px] font-black uppercase tracking-[0.6em]">
               <Link href="/terms" className="hover:text-indigo-400 transition-colors">Protocol Terms</Link>
               <Link href="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Dockets</Link>
               <span className="text-white/20 font-black">© 2026 APEXLEDGER CORE PROTOCOL</span>
            </div>
            <div className="flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.5em] text-white/20">
               <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-pulse" /> 
               Operational Status: ACTIVE Alpha
            </div>
         </div>
      </footer>

      <style jsx global>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #111; }
        ::-webkit-scrollbar-thumb:hover { background: #222; }
      `}</style>
    </div>
  );
}
