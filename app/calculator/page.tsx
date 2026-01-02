"use client";

import { useState, useEffect } from "react";
import { 
  Calculator, 
  Target, 
  Shield, 
  Zap, 
  Activity, 
  Database, 
  Globe, 
  Cpu,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Info,
  BarChart3,
  Dna,
  Scale,
  Percent
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type CalculatorMode = "position" | "pip" | "drawdown" | "leverage" | "consistency";
type AssetType = "forex" | "gold" | "commodities" | "crypto";

export default function CalculatorPage() {
  const [activeMode, setActiveMode] = useState<CalculatorMode>("position");
  
  // Position Size State
  const [balance, setBalance] = useState<number>(10000);
  const [riskPercent, setRiskPercent] = useState<number>(1);
  const [entryPrice, setEntryPrice] = useState<number>(1.0850);
  const [stopLoss, setStopLoss] = useState<number>(1.0820);
  const [assetType, setAssetType] = useState<AssetType>("forex");
  
  // Pip Calculator State
  const [lotSize, setLotSize] = useState<number>(1.0);
  const [pipsToCalc, setPipsToCalc] = useState<number>(50);
  
  // Drawdown State
  const [startBalance, setStartBalance] = useState<number>(100000);
  const [currentBalance, setCurrentBalance] = useState<number>(92000);
  
  // Leverage State
  const [totalExposure, setTotalExposure] = useState<number>(5.0); // in lots
  
  // Consistency State
  const [dailyProfits, setDailyProfits] = useState<string>("500, -200, 1200, 300, -50");

  // Computed Values
  const [results, setResults] = useState<any>({});

  const contractSizes = {
    forex: 100000,
    gold: 100,
    commodities: 1000,
    crypto: 1
  };

  useEffect(() => {
    const compute = () => {
      if (activeMode === "position") {
        const riskVal = (balance * riskPercent) / 100;
        const distance = Math.abs(entryPrice - stopLoss);
        const multiplier = assetType === "gold" ? 1 : 10000; // Simplified
        const pips = distance * multiplier;
        
        // lot = Risk / (Pips * Value per Pip)
        // For Forex 0.1 lots = 1$ per pip on 4/5 digit pairs. 
        // 1.0 lot = 10 units of currency (simplified)
        const unitsPerPip = assetType === "gold" ? 1 : 10;
        const calculatedLots = pips > 0 ? riskVal / (pips * unitsPerPip) : 0;
        
        setResults({
          riskAmount: riskVal,
          pipDistance: pips,
          lots: calculatedLots,
          units: calculatedLots * contractSizes[assetType]
        });
      } else if (activeMode === "pip") {
        const valuePerPip = lotSize * (assetType === "gold" ? 1 : 10);
        setResults({
          pipValue: valuePerPip,
          totalProfit: valuePerPip * pipsToCalc
        });
      } else if (activeMode === "drawdown") {
        const diff = startBalance - currentBalance;
        const percent = (diff / startBalance) * 100;
        setResults({
          lossAmount: diff,
          drawdownPercent: percent,
          recoveryNeeded: (diff / currentBalance) * 100
        });
      } else if (activeMode === "leverage") {
        const exposure = totalExposure * contractSizes[assetType] * entryPrice;
        const lev = exposure / balance;
        setResults({
          exposure,
          leverage: lev
        });
      } else if (activeMode === "consistency") {
        const profits = dailyProfits.split(",").map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
        const total = profits.reduce((a, b) => a + Math.abs(b), 0);
        const maxDay = Math.max(...profits.map(p => Math.abs(p)));
        const consistency = total > 0 ? (1 - (maxDay / total)) * 100 : 0;
        setResults({
          totalVolume: total,
          maxDay,
          score: consistency
        });
      }
    };

    compute();
  }, [activeMode, balance, riskPercent, entryPrice, stopLoss, assetType, lotSize, pipsToCalc, startBalance, currentBalance, totalExposure, dailyProfits]);

  const modes: { id: CalculatorMode; label: string; icon: any }[] = [
    { id: "position", label: "Position Size", icon: <Target size={16} /> },
    { id: "pip", label: "Pip Value", icon: <Activity size={16} /> },
    { id: "drawdown", label: "Drawdown", icon: <TrendingDown size={16} /> },
    { id: "leverage", label: "Leverage", icon: <Scale size={16} /> },
    { id: "consistency", label: "Consistency", icon: <Dna size={16} /> },
  ];

  const assets: AssetType[] = ["forex", "gold", "commodities", "crypto"];

  return (
    <div className="space-y-12 text-white font-sans relative min-h-screen pb-20 overflow-hidden px-4 md:px-8">
      {/* Institutional Background Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-amber-500/[0.03] blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-sky-500/[0.03] blur-[150px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Header Mesh */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-10 relative z-10 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
               <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-400">Calculator Active</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/5 rounded-full text-white/40">
               <Calculator size={10} className="text-amber-500/50" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em]">Precision Tools</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.02em] italic uppercase bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent leading-none">
            Calculators
          </h1>
          <p className="text-white/80 text-xs md:text-sm font-medium italic max-w-xl leading-relaxed">
            "Calculate your risk and position size with precision. Manage your recovery and maximize consistency across every trade."
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-white/[0.02] border border-white/5 rounded-[2rem] backdrop-blur-md">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                activeMode === mode.id 
                  ? "bg-white text-black shadow-xl shadow-white/5" 
                  : "text-white/40 hover:text-white/60 hover:bg-white/5"
              }`}
            >
              {mode.icon}
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        {/* Left Column: Input Panel */}
        <div className="lg:col-span-7 space-y-8">
           <motion.div 
             layout
             className="bg-[#0A0A0A]/40 backdrop-blur-xl border border-white/5 rounded-[3.5rem] p-12 shadow-3xl relative overflow-hidden group/inputs"
           >
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.01] pointer-events-none" />
              
              <div className="mb-10 flex items-center gap-6">
                <div className="flex items-center gap-2 p-1 bg-black/40 border border-white/10 rounded-2xl">
                  {assets.map(a => (
                    <button
                      key={a}
                      onClick={() => setAssetType(a)}
                      className={`px-5 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${
                        assetType === a ? "bg-amber-500 text-black" : "text-white/40 hover:text-white/60"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                {activeMode === "position" && (
                  <>
                    <InputBlock label="Account balance ($)" value={balance} onChange={setBalance} suffix="USD" />
                    <InputBlock label="Risk Exposure (%)" value={riskPercent} onChange={setRiskPercent} suffix="%" />
                    <InputBlock label="Entry price" value={entryPrice} onChange={setEntryPrice} icon={<TrendingUp size={20} />} />
                    <InputBlock label="Stop Loss" value={stopLoss} onChange={setStopLoss} icon={<TrendingDown size={20} />} />
                  </>
                )}
                {activeMode === "pip" && (
                  <>
                    <InputBlock label="Lot Size" value={lotSize} onChange={setLotSize} suffix="LOTS" />
                    <InputBlock label="Pip Target" value={pipsToCalc} onChange={setPipsToCalc} suffix="PIPS" />
                    <InputBlock label="Asset Price (for cross)" value={entryPrice} onChange={setEntryPrice} />
                  </>
                )}
                {activeMode === "drawdown" && (
                  <>
                    <InputBlock label="Starting Capital ($)" value={startBalance} onChange={setStartBalance} suffix="USD" />
                    <InputBlock label="Current Balance ($)" value={currentBalance} onChange={setCurrentBalance} suffix="USD" />
                  </>
                )}
                {activeMode === "leverage" && (
                  <>
                    <InputBlock label="Account Equity ($)" value={balance} onChange={setBalance} suffix="USD" />
                    <InputBlock label="Total Exposure (Lots)" value={totalExposure} onChange={setTotalExposure} suffix="LOTS" />
                    <InputBlock label="Market Price" value={entryPrice} onChange={setEntryPrice} />
                  </>
                )}
                {activeMode === "consistency" && (
                  <div className="md:col-span-2 space-y-4">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic pl-2">Daily Profit Array (USD)</label>
                    <textarea 
                      value={dailyProfits}
                      onChange={(e) => setDailyProfits(e.target.value)}
                      className="w-full h-32 bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 text-lg font-black italic tracking-tighter text-white focus:outline-none focus:border-amber-500/30 focus:bg-white/[0.04] transition-all resize-none"
                      placeholder="500, -200, 1200..."
                    />
                  </div>
                )}
              </div>

              <div className="mt-12 flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative group/warning overflow-hidden">
                 <div className="absolute inset-0 bg-amber-500/5 translate-x-full group-hover/warning:translate-x-0 transition-transform duration-500" />
                  <div className="flex items-center gap-4 relative z-10">
                    <Shield size={24} className="text-amber-500/60" />
                    <p className="text-[11px] font-black text-white/70 uppercase tracking-[0.2em] italic">Risk Monitor: Active</p>
                  </div>
                  <div className="h-2 w-32 bg-white/10 rounded-full relative z-10 overflow-hidden">
                    <div className="h-full bg-amber-500 w-[60%]" />
                  </div>
              </div>
           </motion.div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {activeMode === "position" && (
                <>
                  <StatSummary icon={<Target size={24} />} label="Pip Distance" value={`${results.pipDistance?.toFixed(1)} Pips`} />
                  <StatSummary icon={<Shield size={24} />} label="Max Loss ($)" value={`-$${results.riskAmount?.toFixed(2)}`} color="red" />
                </>
              )}
              {activeMode === "drawdown" && (
                <>
                  <StatSummary icon={<Percent size={24} />} label="Recovery Required" value={`${results.recoveryNeeded?.toFixed(2)}%`} color="amber" />
                  <StatSummary icon={<Database size={24} />} label="Total Loss" value={`-$${results.lossAmount?.toLocaleString()}`} color="red" />
                </>
              )}
           </div>
        </div>

        {/* Right Column: Result Panel */}
        <div className="lg:col-span-5 h-full">
           <motion.div 
             layout
             className="bg-white text-black rounded-[4rem] p-16 h-full shadow-3xl flex flex-col justify-between relative overflow-hidden group/result min-h-[600px]"
           >
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/5 blur-[80px] translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-16">
                    <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
                       <Calculator size={24} className="text-white" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.5em] italic text-black/60">Calculation Result</span>
                 </div>
                 <div className="space-y-4 mb-20">
                    <h3 className="text-[13px] font-black uppercase tracking-[0.5em] text-black/70 italic">
                      {activeMode === "position" ? "Recommended Position" : 
                       activeMode === "pip" ? "Profit per Pip" :
                       activeMode === "drawdown" ? "Current Drawdown" :
                       activeMode === "leverage" ? "Leverage Factor" : "Consistency Score"}
                    </h3>
                    <div className="flex items-baseline gap-4">
                       <h2 className="text-[6rem] font-black italic tracking-tighter leading-none tabular-nums">
                         {activeMode === "position" ? results.lots?.toFixed(2) :
                          activeMode === "pip" ? results.totalProfit?.toFixed(2) :
                          activeMode === "drawdown" ? results.drawdownPercent?.toFixed(2) :
                          activeMode === "leverage" ? results.leverage?.toFixed(1) : results.score?.toFixed(1)}
                       </h2>
                       <span className="text-2xl font-black uppercase tracking-widest text-black/30">
                         {activeMode === "position" ? "LOTS" : 
                          activeMode === "pip" ? "USD" :
                          activeMode === "leverage" ? ":1" : "%"}
                       </span>
                    </div>
                 </div>

                 <div className="space-y-8">
                    {activeMode === "position" && (
                      <>
                        <ResultRow label="Notional Volume" value={(results.units || 0).toLocaleString()} />
                        <ResultRow label="Value Per Pip" value={`$${((results.lots || 0) * (assetType === "gold" ? 1 : 10)).toFixed(2)}`} />
                      </>
                    )}
                    {activeMode === "pip" && (
                      <>
                        <ResultRow label="Value for 1 Pip" value={`$${results.pipValue?.toFixed(2)}`} />
                        <ResultRow label="Risk Ratio" value={`${(results.totalProfit / 100).toFixed(2)}% of 10k`} />
                      </>
                    )}
                    {activeMode === "drawdown" && (
                      <>
                        <ResultRow label="Peak Equity" value={`$${startBalance.toLocaleString()}`} />
                        <ResultRow label="Trough Equity" value={`$${currentBalance.toLocaleString()}`} />
                      </>
                    )}
                    {activeMode === "leverage" && (
                      <>
                        <ResultRow label="Market Value" value={`$${results.exposure?.toLocaleString()}`} />
                        <ResultRow label="Margin Used (approx)" value={`$${(results.exposure / 100).toFixed(2)}`} />
                      </>
                    )}
                    {activeMode === "consistency" && (
                      <>
                        <ResultRow label="Total Volume" value={`$${results.totalVolume?.toLocaleString()}`} />
                        <ResultRow label="Peak Variance" value={`$${results.maxDay?.toLocaleString()}`} />
                      </>
                    )}
                 </div>
              </div>

               <div className="relative z-10 pt-16">
                  <div className="bg-black text-white rounded-[2rem] p-8 group/cta hover:bg-amber-500 transition-all cursor-pointer shadow-2xl active:scale-95">
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] italic opacity-60 group-hover:opacity-100 transition-opacity">Ready to trade</span>
                       <Zap size={20} className="text-amber-500 group-hover:text-black" />
                    </div>
                    <h4 className="text-xl font-black italic uppercase tracking-tighter group-hover:text-black transition-colors">Apply Settings</h4>
                  </div>
               </div>
           </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-12 px-10 bg-white/[0.01] border border-white/5 rounded-[3rem] flex items-center gap-8 relative z-10">
         <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
            <Info size={24} className="text-white/20" />
         </div>
         <p className="text-[10px] font-medium text-white/40 italic leading-relaxed uppercase tracking-widest">
           "Calculations are based on standard market parameters. Always verify contract details with your broker before trading."
         </p>
      </div>
    </div>
  );
}

function InputBlock({ label, value, onChange, suffix, icon }: { label: string; value: any; onChange: (v: any) => void; suffix?: string; icon?: any }) {
  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em] italic pl-2">{label}</label>
      <div className="relative group/input">
          <input 
            type="number" 
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 text-2xl font-black italic tracking-tighter tabular-nums text-white/90 focus:outline-none focus:border-amber-500/30 focus:bg-white/[0.04] transition-all group-hover/input:border-white/10"
          />
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-white/40 group-hover/input:text-white/70 transition-colors flex items-center gap-2">
            {suffix}
            {icon}
          </div>
      </div>
    </div>
  );
}

function StatSummary({ icon, label, value, color = "sky" }: { icon: any; label: string; value: string; color?: string }) {
  return (
    <div className="bg-[#0A0A0A]/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-xl flex items-center gap-6 group hover:border-amber-500/20 transition-all">
      <div className={`p-4 bg-white/5 border border-white/10 rounded-2xl transition-all ${color === "red" ? "group-hover:bg-red-500/10 group-hover:border-red-500/20" : "group-hover:bg-amber-500/10 group-hover:border-amber-500/20"}`}>
        {icon}
      </div>
      <div>
        <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em] italic">{label}</span>
        <h3 className={`text-2xl font-black italic tracking-tighter tabular-nums ${color === "red" ? "text-red-500/80" : "text-white"}`}>{value}</h3>
      </div>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-black/5 pb-4">
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 italic">{label}</span>
      <span className="text-lg font-black italic tabular-nums">{value}</span>
    </div>
  );
}
