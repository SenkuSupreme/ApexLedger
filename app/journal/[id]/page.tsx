"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit3,
  Save,
  X,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Calendar,
  Clock,
  BarChart3,
  Brain,
  Heart,
  Star,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Calculator,
  Shield,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Share2,
  Download,
  Copy,
  Activity,
  Globe,
} from "lucide-react";
import {
  calculateTradeMetrics,
  formatCurrency,
  formatPercentage,
  formatRMultiple,
  TradeCalculationResult,
} from "@/lib/utils/tradeCalculations";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import TradeCharts from "@/components/TradeCharts";
import NewTradeDialog from "@/components/NewTradeDialog";
import { toast } from "sonner";

interface AIAnalysis {
  model?: string;
  timestamp?: string;
  fullAnalysis?: string;
  sections?: {
    traderScore?: {
      overall?: string;
      riskDiscipline?: string;
      executionQuality?: string;
      consistency?: string;
    };
    whatMustStop?: string;
    actionPlan?: string;
  };
}

const EMOTIONS = [
  { value: "confident", emoji: "😎", label: "Confident" },
  { value: "nervous", emoji: "😰", label: "Nervous" },
  { value: "excited", emoji: "🤩", label: "Excited" },
  { value: "frustrated", emoji: "😤", label: "Frustrated" },
  { value: "calm", emoji: "😌", label: "Calm" },
  { value: "greedy", emoji: "🤑", label: "Greedy" },
  { value: "fearful", emoji: "😨", label: "Fearful" },
  { value: "neutral", emoji: "😐", label: "Neutral" },
];

export default function TradeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [trade, setTrade] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [calculatedMetrics, setCalculatedMetrics] =
    useState<TradeCalculationResult | null>(null);
  const [isAiCollapsed, setIsAiCollapsed] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Share functionality - PDF generation removed, only trade card generation available

  const generateTradeCard = async () => {
    try {
      toast.info("Generating trade card...");
      const cardElement = document.getElementById("trade-card");
      if (!cardElement) {
        console.error("Trade card element not found");
        toast.error("Trade card element not found. Please try again.");
        return;
      }

      // Store original className and remove it to avoid Tailwind positioning conflicts
      const originalClassName = cardElement.className;
      cardElement.className = "";

      // Make the card visible temporarily for capture
      cardElement.style.display = "block";
      cardElement.style.position = "fixed";
      cardElement.style.top = "0";
      cardElement.style.left = "0";
      cardElement.style.width = "420px";
      cardElement.style.height = "650px";
      cardElement.style.zIndex = "9999";
      cardElement.style.visibility = "visible";
      cardElement.style.backgroundColor = "#0A0A0A";
      cardElement.style.color = "#ffffff";
      cardElement.style.overflow = "hidden";

      // Wait for rendering to ensure fonts are loaded
      await new Promise(resolve => setTimeout(resolve, 500));

      const { toPng } = await import("html-to-image");

      const dataUrl = await toPng(cardElement, {
        backgroundColor: '#0A0A0A',
        width: 420,
        height: 650,
        pixelRatio: 2, // High quality
        cacheBust: true,
      });

      // Create download link
      const link = document.createElement("a");
      link.download = `trade-card-${trade.symbol}-${trade._id}.png`;
      link.href = dataUrl;
      link.click();
      
      toast.success("Trade card generated successfully!");
    } catch (error: any) {
      console.error("Trade card generation failed:", error);
      toast.error(`Failed to generate trade card: ${error.message || "Unknown error"}`);
    } finally {
      const cardElement = document.getElementById("trade-card");
      if (cardElement) {
        // Restore original className
        cardElement.className = "fixed -top-[9999px] left-0 w-[420px] h-[650px] bg-[#0A0A0A] text-white overflow-hidden";
        // Hide the card again
        cardElement.style.display = "";
        cardElement.style.position = "";
        cardElement.style.top = "";
        cardElement.style.left = "";
        cardElement.style.width = "";
        cardElement.style.height = "";
        cardElement.style.zIndex = "";
        cardElement.style.visibility = "";
        cardElement.style.backgroundColor = "";
        cardElement.style.color = "";
        cardElement.style.overflow = "";
      }
    }
  };

  const copyTradeLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Trade link copied to clipboard!");
    });
  };


  // Helper function to get display value (prioritize calculated over stored for accuracy)
  const getDisplayValue = (
    storedValue: number | undefined,
    calculatedValue: number | undefined,
    fallback = 0
  ) => {
    // If we have a calculated value, use it (it's more accurate)
    if (calculatedValue !== undefined && calculatedValue !== null) {
      return calculatedValue;
    }
    // Otherwise use stored value or fallback
    return storedValue ?? fallback;
  };

  // Calculate real-time metrics whenever form data changes
  useEffect(() => {
    if (trade?.entryPrice && trade?.quantity && trade?.portfolioBalance) {
      const inputParams = {
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        stopLoss: trade.stopLoss,
        takeProfit: trade.takeProfit,
        quantity: trade.quantity,
        direction: trade.direction || "long",
        portfolioBalance: trade.portfolioBalance || 10000,
        fees: trade.fees || 0,
        assetType: trade.assetType || "forex",
        symbol: trade.symbol || "",
      };

      const metrics = calculateTradeMetrics(inputParams);
      setCalculatedMetrics(metrics);
    }
  }, [
    trade?.entryPrice,
    trade?.exitPrice,
    trade?.stopLoss,
    trade?.takeProfit,
    trade?.quantity,
    trade?.direction,
    trade?.portfolioBalance,
    trade?.fees,
    trade?.assetType,
    trade?.symbol,
  ]);

  const fetchTradeData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/trades/${id}`);
      if (!res.ok) throw new Error("Failed to fetch trade");
      const data = await res.json();
      setTrade(data);
      
      // Calculate metrics
      const metrics = calculateTradeMetrics({
        entryPrice: data.entryPrice,
        exitPrice: data.exitPrice,
        stopLoss: data.stopLoss,
        takeProfit: data.takeProfit,
        quantity: data.quantity,
        direction: data.direction,
        portfolioBalance: data.portfolioBalance || 10000,
        fees: data.fees || 0,
        assetType: data.assetType,
        symbol: data.symbol,
      });
      setCalculatedMetrics(metrics);

      // Check for existing AI analysis
      if (data.aiAnalysis) {
        setAiAnalysis(data.aiAnalysis);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load trade data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTradeData();
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/trades/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/journal");
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const analyzeWithAI = async () => {
    if (!trade.notes && !trade.description && !trade.mistakes) {
      toast.info("No notes or trade data to analyze");
      return;
    }

    setAnalyzingAI(true);
    try {
      // Fetch all user trades for context
      const allTradesRes = await fetch("/api/trades");
      const allTradesData = await allTradesRes.json();

      const res = await fetch("/api/ai/analyze-sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tradeData: trade,
          allTradeData: {
            totalTrades: allTradesData.pagination?.total || 0,
            recentTrades: allTradesData.trades?.slice(0, 10) || [],
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data.analysis);
        setIsAiCollapsed(true); // Automatically collapse after analysis as requested

        // Save AI analysis to database
        try {
          await fetch(`/api/trades/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...trade,
              aiAnalysis: data.analysis,
            }),
          });
        } catch (saveError) {
          console.error("Failed to save AI analysis:", saveError);
        }
      } else {
        throw new Error("Analysis failed");
      }
    } catch (error) {
      console.error("AI Analysis failed:", error);
      toast.error("AI Analysis failed. Please try again.");
    } finally {
      setAnalyzingAI(false);
    }
  };

  // Calculate derived metrics
  const calculateMetrics = () => {
    if (!trade) return {};

    const duration = trade.timestampExit
      ? Math.abs(
          new Date(trade.timestampExit).getTime() -
            new Date(trade.timestampEntry).getTime()
        ) /
        (1000 * 60 * 60)
      : 0;

    const riskAmount =
      trade.stopLoss && trade.entryPrice
        ? Math.abs(trade.entryPrice - trade.stopLoss) * trade.quantity
        : 0;

    const returnOnRisk = riskAmount > 0 ? (trade.pnl / riskAmount) * 100 : 0;

    return {
      duration: duration.toFixed(1),
      riskAmount: riskAmount.toFixed(2),
      returnOnRisk: returnOnRisk.toFixed(1),
      winRate: trade.pnl > 0 ? 100 : 0,
    };
  };

  const metrics = calculateMetrics();

  if (loading)
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-white/60 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
        Loading...
      </div>
    );

  if (!trade)
    return (
      <div className="flex h-[80vh] w-full items-center justify-center text-white/60">
        <div className="text-center space-y-4">
          <AlertTriangle size={48} className="mx-auto text-red-500/60" />
          <h2 className="text-xl font-bold">Trade Not Found</h2>
          <Link href="/journal" className="text-sky-500 hover:text-sky-400">
            ← Back to Journal
          </Link>
        </div>
      </div>
    );

  return (
    <div className="relative min-h-screen pb-20 font-sans text-white">
      {/* Institutional Background Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[1200px] h-[1200px] bg-blue-500/[0.03] blur-[150px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[1200px] h-[1200px] bg-purple-500/[0.03] blur-[150px] translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Sharing Artifacts (Hidden) */}
      <div className="hidden">
        {/* Trade Card for Sharing */}
        <div
          id="trade-card"
          className="fixed -top-[9999px] left-0 w-[420px] h-[650px] bg-[#050505] text-white overflow-hidden"
          style={{ 
            fontFamily: "Inter, sans-serif",
            backgroundColor: "#050505"
          }}
        >
          {/* 3D Star Background & Vignette */}
          <div className="absolute inset-0 z-0">
             {/* Stars - varied sizes */}
             <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 40px 70px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 50px 160px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 90px 40px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 130px 80px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 160px 120px, #ffffff, rgba(0,0,0,0))',
                backgroundSize: '200px 200px',
                opacity: 0.3
             }}></div>
             <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(1px 1px at 10px 10px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 150px 150px, #ffffff, rgba(0,0,0,0))',
                backgroundSize: '300px 300px',
                opacity: 0.15,
                transform: 'rotate(45deg)'
             }}></div>

             {/* Vignette - Fading in from corners to middle */}
             <div className="absolute inset-0" style={{
                background: 'radial-gradient(circle at center, transparent 30%, #000000 120%)'
             }}></div>
             
             {/* Center Glow connection */}
             <div className="absolute inset-0 opacity-20" style={{
                background: `radial-gradient(circle at center, ${trade.pnl > 0 ? '#34d39922' : '#f8717122'} 0%, transparent 70%)`
             }}></div>
          </div>
          
          <div className="relative z-10 h-full flex flex-col p-8">
            {/* Header: Date & Status */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#ffffff66] font-semibold">
                  {new Date(trade.timestampEntry).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: trade.status === 'Open' ? '#3b82f6' : '#ffffff33' }}></div>
                  <span className="text-[10px] uppercase tracking-widest text-[#ffffff99] font-semibold">{trade.status || 'CLOSED'}</span>
                </div>
              </div>
              <div className="px-3 py-1">
                <span 
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: trade.direction === 'long' ? '#34d399' : '#f87171' }}
                >
                  {trade.direction?.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Main Asset Info & Time Context */}
            <div className="text-center mb-8">
              <h1 className="text-6xl font-black text-white mb-2 tracking-tighter drop-shadow-2xl">
                {trade.symbol}
              </h1>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#ffffff66] font-medium">
                {trade.assetType?.toUpperCase() || "ASSET"} • EXECUTION REPORT
              </span>
            </div>

            {/* Temporal Data Floating in Space */}
            <div className="w-full mb-8 flex justify-center items-center px-4 relative">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-20 right-20 h-px bg-gradient-to-r from-transparent via-[#ffffff1a] to-transparent"></div>
                
                <div className="w-full flex justify-between items-center z-10">
                  <div className="flex flex-col gap-1 text-center bg-[#00000040] p-2 rounded-lg backdrop-blur-sm">
                    <span className="text-[8px] uppercase tracking-widest text-[#ffffff4d] font-semibold">Entry Time</span>
                    <span className="text-sm font-mono text-white font-medium tracking-tighter">
                      {new Date(trade.timestampEntry).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })} <span className="text-[8px] text-[#ffffff33]">UTC</span>
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 text-center bg-[#00000040] p-2 rounded-lg backdrop-blur-sm">
                    <span className="text-[8px] uppercase tracking-widest text-[#ffffff4d] font-semibold">Exit Time</span>
                    <span className="text-sm font-mono text-white font-medium tracking-tighter">
                      {trade.timestampExit ? new Date(trade.timestampExit).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) : "--:--"} <span className="text-[8px] text-[#ffffff33]">UTC</span>
                    </span>
                  </div>
                </div>
            </div>

            {/* P&L Display & Outcome */}
            <div className="text-center mb-10 relative">
              <div 
                className="text-7xl font-medium tracking-tighter tabular-nums relative inline-block z-10 drop-shadow-lg"
                style={{ color: getDisplayValue(trade.pnl, calculatedMetrics?.netPnl) >= 0 ? "#34d399" : "#f87171" }}
              >
                {getDisplayValue(trade.pnl, calculatedMetrics?.netPnl) >= 0 ? "+" : ""}
                ${Math.abs(getDisplayValue(trade.pnl, calculatedMetrics?.netPnl)).toFixed(2)}
              </div>
              <div className="mt-2 flex items-center justify-center gap-2">
                 <span className="text-[10px] uppercase tracking-[0.2em] text-[#ffffff4d] font-semibold">Net P&L</span>
                 <span className="text-[10px] uppercase tracking-[0.1em] text-[#ffffff20]"> • </span>
                 <span 
                   className="text-[10px] uppercase tracking-[0.2em] font-bold"
                   style={{ color: getDisplayValue(trade.pnl, calculatedMetrics?.netPnl) >= 0 ? "#34d399" : "#f87171" }}
                 >
                   {getDisplayValue(trade.pnl, calculatedMetrics?.netPnl) > 0 ? "PROFIT" : getDisplayValue(trade.pnl, calculatedMetrics?.netPnl) < 0 ? "LOSS" : "BREAK-EVEN"}
                 </span>
              </div>
            </div>

            {/* Detailed Execution Matrix */}
            <div className="grid grid-cols-4 gap-2 mb-6 pt-6 border-t border-[#ffffff0a]">
              <div className="flex flex-col gap-1 text-center">
                <span className="text-[8px] uppercase tracking-widest text-[#ffffff4d] font-semibold">Entry</span>
                <span className="text-sm font-medium text-[#ffffffcc] tabular-nums">
                  {trade.entryPrice?.toFixed(trade.symbol?.includes("JPY") ? 3 : 5)}
                </span>
              </div>
              <div className="flex flex-col gap-1 text-center">
                <span className="text-[8px] uppercase tracking-widest text-[#ffffff4d] font-semibold">Exit</span>
                <span className="text-sm font-medium text-[#ffffffcc] tabular-nums">
                  {trade.exitPrice?.toFixed(trade.symbol?.includes("JPY") ? 3 : 5) || "---"}
                </span>
              </div>
               <div className="flex flex-col gap-1 text-center">
                <span className="text-[8px] uppercase tracking-widest text-[#ffffff4d] font-semibold">Stop</span>
                <span className="text-sm font-medium text-[#f87171] tabular-nums">
                  {trade.stopLoss?.toFixed(trade.symbol?.includes("JPY") ? 3 : 5) || "---"}
                </span>
              </div>
              <div className="flex flex-col gap-1 text-center">
                <span className="text-[8px] uppercase tracking-widest text-[#ffffff4d] font-semibold">Target</span>
                <span className="text-sm font-medium text-[#34d399] tabular-nums">
                  {trade.takeProfit?.toFixed(trade.symbol?.includes("JPY") ? 3 : 5) || "---"}
                </span>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 gap-8 py-4 bg-[#ffffff05] rounded-lg">
              <div className="flex flex-col gap-1 text-center">
                <span className="text-[9px] uppercase tracking-widest text-[#ffffff4d] font-semibold">Risk Load</span>
                <span className="text-xl font-bold text-[#ffffff] tabular-nums">
                  {getDisplayValue(trade.accountRisk, calculatedMetrics?.accountRisk).toFixed(1)}%
                </span>
              </div>
              <div className="flex flex-col gap-1 text-center">
                <span className="text-[9px] uppercase tracking-widest text-[#ffffff4d] font-semibold">R-Multiple</span>
                <span 
                  className="text-xl font-bold tabular-nums"
                  style={{ color: getDisplayValue(trade.rMultiple, calculatedMetrics?.rMultiple) >= 0 ? '#34d399' : '#f87171' }}
                >
                  {getDisplayValue(trade.rMultiple, calculatedMetrics?.rMultiple).toFixed(2)}R
                </span>
              </div>
            </div>

            {/* Footer Brand */}
            <div className="mt-4 flex justify-center items-center">
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] font-mono">
                APEX LEDGER
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & Actions Terminal */}
      <div className="px-12 py-10 border-b border-white/5 bg-[#050505]/40 mb-12 shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-10">
            <button
              onClick={() => router.back()}
              className="group p-4 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.06] hover:border-white/20 transition-all active:scale-95 shadow-inner"
            >
              <ArrowLeft size={18} className="text-white/40 group-hover:text-white group-hover:-translate-x-1 transition-all" />
            </button>
            <div className="h-10 w-px bg-white/5" />
                 <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                       <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                       <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-400 italic">Trade Archive</span>
                    </div>
                 </div>
                 <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">
                   {trade.symbol} <span className="text-white/10 font-thin not-italic">/</span> {trade.direction === 'long' ? 'Buy Execution' : 'Sell Execution'}
                 </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 bg-white/[0.02] border border-white/5 p-1.5 rounded-2xl shadow-inner">
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-3 px-6 py-2.5 rounded-xl hover:bg-white/[0.05] text-white/60 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest italic"
              >
                <Share2 size={14} />
                Share
              </button>
               <button
                onClick={analyzeWithAI}
                disabled={analyzingAI}
                className="flex items-center gap-3 px-6 py-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 hover:bg-purple-500/20 transition-all text-[10px] font-black uppercase tracking-widest italic disabled:opacity-30"
              >
                <Brain size={14} className={analyzingAI ? "animate-spin" : ""} />
                {analyzingAI ? "Processing..." : "AI Intelligence"}
              </button>
            </div>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-4 bg-white text-black px-10 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-sky-500 hover:text-white transition-all shadow-2xl active:scale-95"
            >
              <Edit3 size={14} />
              Edit
            </button>
            
            <button
               onClick={() => setShowDeleteDialog(true)}
               className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-rose-500/40 hover:bg-rose-500 hover:text-white transition-all group active:scale-95 shadow-inner"
            >
               <Trash2 size={16} className="group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 space-y-12">
        {/* Trade Metadata Matrix (Replacement for original header/actions) */}

        {/* Forensic Neural Audit */}
        {aiAnalysis && (
          <div className="bg-[#0A0A0A] border border-purple-500/20 rounded-2xl overflow-hidden relative group shadow-[0_0_30px_rgba(168,85,247,0.05)]">
            <div className="absolute inset-0 bg-purple-500/[0.02] -z-10" />
            
            <div className="bg-purple-500/5 px-6 py-4 border-b border-purple-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <Brain size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-purple-400 uppercase tracking-[0.4em] flex items-center gap-2 italic">
                       AI Trade Analysis
                       <span className="px-1.5 py-0.5 rounded text-[8px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-black not-italic">CONFIDENTIAL</span>
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1.5">
                         <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                         <span className="text-[10px] font-mono text-purple-300/60 uppercase">
                            Model: {aiAnalysis?.model || "Analysis v1"}
                         </span>
                      </div>
                      <span className="text-purple-500/20">•</span>
                      <span className="text-[10px] font-mono text-purple-300/60 uppercase">
                        {aiAnalysis?.timestamp ? new Date(aiAnalysis.timestamp).toLocaleTimeString() : "Pending Sync"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={analyzeWithAI}
                    disabled={analyzingAI}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-all disabled:opacity-50 text-[10px] uppercase tracking-wider font-bold"
                  >
                    <RefreshCw size={12} className={analyzingAI ? "animate-spin" : ""} />
                    {analyzingAI ? "Processing..." : "Rerun Scan"}
                  </button>
                  
                  <button
                    onClick={() => setIsAiCollapsed(!isAiCollapsed)}
                    className="p-1.5 hover:bg-purple-500/10 rounded-lg transition-colors border border-transparent hover:border-purple-500/20 text-purple-400"
                  >
                    {isAiCollapsed ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronUp size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            <AnimatePresence>
              {!isAiCollapsed && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-6 space-y-6">
                    {/* Trader Score Dashboard */}
                    {aiAnalysis?.sections?.traderScore && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-black/20 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-white mb-1">
                            {aiAnalysis?.sections?.traderScore?.overall || "0"}
                          </div>
                           <div className="text-xs text-purple-300 uppercase tracking-[0.3em] font-black italic">
                             Overall
                           </div>
                        </div>
                        <div className="bg-black/20 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-white mb-1">
                            {aiAnalysis?.sections?.traderScore?.riskDiscipline || "0"}
                          </div>
                           <div className="text-xs text-purple-300 uppercase tracking-[0.3em] font-black italic">
                             Risk
                           </div>
                        </div>
                        <div className="bg-black/20 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-white mb-1">
                            {aiAnalysis?.sections?.traderScore?.executionQuality ||
                              "0"}
                          </div>
                           <div className="text-xs text-purple-300 uppercase tracking-[0.3em] font-black italic">
                             Execution
                           </div>
                        </div>
                        <div className="bg-black/20 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-white mb-1">
                            {aiAnalysis?.sections?.traderScore?.consistency || "0"}
                          </div>
                           <div className="text-xs text-purple-300 uppercase tracking-[0.3em] font-black italic">
                             Consistency
                           </div>
                        </div>
                      </div>
                    )}

                    {/* Full Analysis Text */}
                    <div className="bg-black/10 rounded-lg p-6 border border-white/5">
                      <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                        <ReactMarkdown 
                          components={{
                            p: ({children}) => {
                              const text = children?.toString() || "";
                              if (/^[A-Z\s&()]+\:$/.test(text.trim())) {
                                return (
                                  <h4 className="text-[11px] font-black text-purple-400 uppercase tracking-[0.2em] mt-8 mb-3 italic first:mt-0 border-b border-purple-500/10 pb-2">
                                    {children}
                                  </h4>
                                );
                              }
                              return <p className="text-white/80 mb-4 last:mb-0 leading-relaxed">{children}</p>;
                            },
                            ul: ({children}) => <ul className="space-y-2 mb-6 ml-4">{children}</ul>,
                            li: ({children}) => (
                              <li className="flex items-start gap-3 text-sm text-white/90 group/li">
                                <span className="text-purple-500 font-bold mt-0.5">•</span>
                                <span className="flex-1">{children}</span>
                              </li>
                            ),
                            strong: ({children}) => <strong className="font-black text-white">{children}</strong>,
                            h1: ({children}) => <h1 className="text-xl font-black text-white mt-8 mb-4 italic uppercase tracking-wider">{children}</h1>,
                            h2: ({children}) => <h2 className="text-lg font-black text-white mt-6 mb-3 italic uppercase tracking-wider">{children}</h2>,
                            h3: ({children}) => <h3 className="text-base font-black text-white mt-4 mb-2 italic uppercase tracking-wider">{children}</h3>,
                            hr: () => <hr className="my-8 border-white/5" />,
                          }}
                        >
                          {(aiAnalysis?.fullAnalysis || "No analysis available").replace(/^[ \t]*•[ \t]+/gm, '* ')}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {/* Quick Action Items */}
                    {(aiAnalysis?.sections?.whatMustStop ||
                      aiAnalysis?.sections?.actionPlan) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {aiAnalysis?.sections?.whatMustStop && (
                          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                            <h4 className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em] italic mb-2">
                              🚫 Must Stop Immediately
                            </h4>
                            <div className="text-sm text-white/80 prose prose-invert max-w-none">
                              <ReactMarkdown components={{
                                p: ({children}) => <p className="leading-relaxed mb-0">{children}</p>,
                                ul: ({children}) => <ul className="space-y-1 mt-2">{children}</ul>,
                                li: ({children}) => (
                                  <li className="flex items-start gap-2 text-xs">
                                    <span className="text-red-400">•</span>
                                    <span>{children}</span>
                                  </li>
                                ),
                                strong: ({children}) => <strong className="font-bold text-white">{children}</strong>,
                              }}>
                                {(aiAnalysis?.sections?.whatMustStop || "").replace(/^[ \t]*•[ \t]+/gm, '* ')}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}

                        {aiAnalysis?.sections?.actionPlan && (
                          <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                            <h4 className="text-[10px] font-black text-green-400 uppercase tracking-[0.3em] italic mb-2">
                              ✅ Action Plan
                            </h4>
                            <div className="text-sm text-white/80 prose prose-invert max-w-none">
                              <ReactMarkdown components={{
                                p: ({children}) => <p className="leading-relaxed mb-0">{children}</p>,
                                ul: ({children}) => <ul className="space-y-1 mt-2">{children}</ul>,
                                li: ({children}) => (
                                  <li className="flex items-start gap-2 text-xs">
                                    <span className="text-green-400">•</span>
                                    <span>{children}</span>
                                  </li>
                                ),
                                strong: ({children}) => <strong className="font-bold text-white">{children}</strong>,
                              }}>
                                {(aiAnalysis?.sections?.actionPlan || "").replace(/^[ \t]*•[ \t]+/gm, '* ')}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Quant Metrics Array */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Gross Yield */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 relative group">
             <div className="absolute inset-0 bg-blue-500/[0.02] -z-10 group-hover:opacity-100 transition-opacity opacity-0" />
             <div className="flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-3">
                   <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em]">Gross P&L</span>
                   <TrendingUp size={12} className="text-blue-500/50" />
                </div>
                <div className={`text-xl font-black font-mono tracking-tighter ${getDisplayValue(trade.grossPnl, calculatedMetrics?.grossPnl) >= 0 ? "text-blue-400" : "text-rose-400"}`}>
                   {getDisplayValue(trade.grossPnl, calculatedMetrics?.grossPnl) >= 0 ? "+" : ""}${getDisplayValue(trade.grossPnl, calculatedMetrics?.grossPnl).toFixed(2)}
                </div>
             </div>
          </div>
          
          {/* Net P&L */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 relative group">
             <div className="absolute inset-0 bg-emerald-500/[0.02] -z-10 group-hover:opacity-100 transition-opacity opacity-0" />
             <div className="flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-3">
                   <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em]">Net P&L</span>
                   <DollarSign size={12} className="text-emerald-500/50" />
                </div>
                <div className={`text-xl font-black font-mono tracking-tighter ${getDisplayValue(trade.pnl, calculatedMetrics?.netPnl) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                   {getDisplayValue(trade.pnl, calculatedMetrics?.netPnl) >= 0 ? "+" : ""}${getDisplayValue(trade.pnl, calculatedMetrics?.netPnl).toFixed(2)}
                </div>
             </div>
          </div>

          {/* R-Multiple */}
           <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 relative group">
             <div className="absolute inset-0 bg-sky-500/[0.02] -z-10 group-hover:opacity-100 transition-opacity opacity-0" />
             <div className="flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-3">
                   <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em]">R-Multiple</span>
                   <Target size={12} className="text-sky-500/50" />
                </div>
                <div className="text-xl font-black font-mono tracking-tighter text-sky-400">
                   {getDisplayValue(trade.rMultiple, calculatedMetrics?.rMultiple).toFixed(2)}R
                </div>
             </div>
          </div>

          {/* Account Risk */}
           <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 relative group">
             <div className="absolute inset-0 bg-amber-500/[0.02] -z-10 group-hover:opacity-100 transition-opacity opacity-0" />
             <div className="flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-3">
                   <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em]">Account Risk</span>
                   <Shield size={12} className="text-amber-500/50" />
                </div>
                <div className="text-xl font-black font-mono tracking-tighter text-amber-400">
                   {getDisplayValue(trade.accountRisk, calculatedMetrics?.accountRisk).toFixed(2)}%
                </div>
             </div>
          </div>

          {/* Risk Amount */}
           <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 relative group">
             <div className="absolute inset-0 bg-purple-500/[0.02] -z-10 group-hover:opacity-100 transition-opacity opacity-0" />
             <div className="flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-3">
                   <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em]">Risk Amount</span>
                   <Calculator size={12} className="text-purple-500/50" />
                </div>
                <div className="text-xl font-black font-mono tracking-tighter text-purple-400">
                   ${getDisplayValue(trade.riskAmount, calculatedMetrics?.riskAmount).toFixed(2)}
                </div>
             </div>
          </div>
          
          {/* Target RR */}
           <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 relative group">
             <div className="absolute inset-0 bg-indigo-500/[0.02] -z-10 group-hover:opacity-100 transition-opacity opacity-0" />
             <div className="flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-3">
                   <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em]">Target R:R</span>
                   <BarChart3 size={12} className="text-indigo-500/50" />
                </div>
                <div className="text-xl font-black font-mono tracking-tighter text-indigo-400">
                   1:{getDisplayValue(trade.targetRR, calculatedMetrics?.targetRR).toFixed(1)}
                </div>
             </div>
          </div>
        </div>

        {/* Trade Charts Section */}
        <TradeCharts trade={trade} calculatedMetrics={calculatedMetrics} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Trade Details Forensic Matrix */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-50" />
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <div className="relative p-8">
                <div className="flex items-center justify-between mb-12">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black italic uppercase tracking-[0.02em] text-white flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      Trade Details
                    </h3>
                    <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.3em] italic">Full Trade Analysis • System Synced</p>
                  </div>
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] italic">
                    Trade ID: {trade._id.slice(-8).toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {/* Entry Hub */}
                  <div className="space-y-4">
                    <div className="p-4 bg-white/[0.01] rounded-2xl group/item hover:bg-white/[0.03] transition-all">
                      <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">Entry Price</label>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-blue-400 tracking-tighter italic tabular-nums">
                            {trade.entryPrice?.toFixed(trade.symbol?.includes("JPY") ? 3 : 5) || "0.00000"}
                          </span>
                        </div>
                    </div>

                    <div className="p-4 bg-white/[0.01] rounded-2xl group/item hover:bg-white/[0.03] transition-all">
                      <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">Stop Loss</label>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-rose-500/40 tracking-tighter italic tabular-nums">
                            {trade.stopLoss?.toFixed(trade.symbol?.includes("JPY") ? 3 : 5) || "---"}
                          </span>
                        </div>
                    </div>
                  </div>

                  {/* Exit Hub */}
                  <div className="space-y-4">
                    <div className="p-4 bg-white/[0.01] rounded-2xl group/item hover:bg-white/[0.03] transition-all">
                      <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">Exit Price</label>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-purple-400 tracking-tighter italic tabular-nums">
                            {trade.exitPrice?.toFixed(trade.symbol?.includes("JPY") ? 3 : 5) || "OPEN"}
                          </span>
                        </div>
                    </div>

                    <div className="p-4 bg-white/[0.01] rounded-2xl group/item hover:bg-white/[0.03] transition-all">
                      <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">Take Profit</label>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-emerald-500/40 tracking-tighter italic tabular-nums">
                            {trade.takeProfit?.toFixed(trade.symbol?.includes("JPY") ? 3 : 5) || "---"}
                          </span>
                        </div>
                    </div>
                  </div>

                  {/* Volume Hub */}
                  <div className="space-y-4">
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl group/item hover:bg-white/[0.05] transition-all">
                      <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">Quantity</label>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-white/90 tracking-tighter font-mono">
                            {trade.quantity?.toLocaleString() || "0"}
                          </span>
                          <span className="text-[10px] font-black text-white/20 uppercase">Units</span>
                        </div>
                    </div>

                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl group/item hover:bg-white/[0.05] transition-all">
                      <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">Leverage</label>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-white/60 tracking-tighter font-mono">{trade.leverage || "1:1"}</span>
                        </div>
                    </div>
                  </div>

                  {/* Metadata Hub */}
                  <div className="space-y-4">
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl group/item hover:bg-white/[0.05] transition-all">
                      <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">Risk %</label>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-amber-400 tracking-tighter font-mono">{trade.accountRisk?.toFixed(2) || "0.00"}</span>
                          <span className="text-[10px] font-black text-amber-400/40">%</span>
                        </div>
                    </div>

                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl group/item hover:bg-white/[0.05] transition-all">
                      <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">Fees</label>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-white/40 tracking-tighter font-mono">${trade.fees?.toFixed(2) || "0.00"}</span>
                        </div>
                    </div>
                  </div>
                </div>

                  <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6">
                     <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">Asset Class</label>
                            <p className="text-sm font-bold text-white uppercase tracking-wider">{trade.assetType || "Forex"}</p>
                     </div>
                     <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">Direction</label>
                            <div className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${trade.direction === 'long' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {trade.direction === 'long' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                              {trade.direction}
                            </div>
                     </div>
                     <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">Entry Time</label>
                          <p className="text-sm font-mono text-white/80">{new Date(trade.timestampEntry).toLocaleString()}</p>
                     </div>
                      <div className="space-y-1 text-right">
                           <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">Exit Time</label>
                           <p className="text-sm font-mono text-white/80">
                             {trade.timestampExit ? new Date(trade.timestampExit).toLocaleString() : "ACTIVE_TRADE"}
                           </p>
                      </div>
                  </div>
              </div>
            </div>

            {/* Trade Notes */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden relative group">
              <div className="p-8">
                 <h3 className="text-xl font-black italic uppercase tracking-[0.02em] text-white flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Trade Notes
                 </h3>
                 
                     <div className="bg-[#050505] border border-white/10 rounded-xl p-6 h-[200px] relative overflow-hidden flex flex-col">
                       <div className="relative z-10 prose prose-invert max-w-none prose-sm overflow-y-auto pr-2 custom-scrollbar">
                          {trade.notes ? (
                             <div className="whitespace-pre-wrap font-sans text-white/90 leading-relaxed">
                               {trade.notes}
                             </div>
                          ) : (
                             <div className="flex items-center justify-center h-40 text-white/40 text-sm tracking-wider uppercase">
                                No notes recorded
                             </div>
                          )}
                       </div>
                    </div>
              </div>
            </div>

            {/* Trade Analysis */}
              {/* Trade Analysis Forensic Stream */}
              <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden relative group">
                <div className="relative p-8">
                  <div className="flex items-center justify-between mb-10">
                    <div className="space-y-1">
                       <h3 className="text-xl font-black italic uppercase tracking-[0.02em] text-white flex items-center gap-3">
                         <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse" />
                         Trade Detail Analysis
                       </h3>
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] italic">Full Execution Metrics</p>
                    </div>
                  </div>

                  {/* Market Section */}
                  <div className="space-y-10 mb-12">
                    <div className="flex items-center gap-4">
                      <Globe size={18} className="text-sky-400" />
                      <h4 className="text-[11px] font-black text-sky-400 uppercase tracking-[0.4em] italic leading-none">
                        Market
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.03] transition-all">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 italic">Bias</label>
                        <div className={`text-base font-black italic uppercase tracking-tighter ${
                          trade.dailyBias?.toLowerCase().includes('bull') ? 'text-emerald-400' : 
                          trade.dailyBias?.toLowerCase().includes('bear') ? 'text-rose-400' : 
                          'text-white'
                        }`}>
                          {trade.dailyBias || "NEUTRAL"}
                        </div>
                      </div>

                      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.03] transition-all">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 italic">Environment</label>
                        <div className="text-base font-black italic uppercase tracking-tighter text-sky-400">
                          {trade.marketEnvironment || "STABLE"}
                        </div>
                      </div>

                      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.03] transition-all">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 italic">Setup Type</label>
                        <div className="text-base font-black italic uppercase tracking-tighter text-emerald-400">
                          {trade.executionArchitecture || "STANDARD"}
                        </div>
                      </div>

                      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.03] transition-all">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 italic">News Impact</label>
                        <div className={`text-base font-black italic uppercase tracking-tighter ${
                          trade.newsImpact === 'High' ? 'text-rose-400' : 
                          trade.newsImpact === 'Medium' ? 'text-amber-400' : 
                          'text-sky-400'
                        }`}>
                          {trade.newsImpact || "NONE"}
                        </div>
                      </div>

                      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.03] transition-all">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 italic">Archetype</label>
                        <div className="text-base font-black italic uppercase tracking-tighter text-white/60">
                          {trade.tradeType || "NOT_SPECIFIED"}
                        </div>
                      </div>

                      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.03] transition-all lg:col-span-3">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 italic">Conditions</label>
                        <div className="flex flex-wrap gap-2 text-base font-black italic uppercase tracking-tighter text-sky-400/60">
                          {(trade.marketCondition || []).map((cond: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 text-white/40 text-[10px] font-black rounded-lg uppercase tracking-widest">
                               {cond}
                            </span>
                          ))}
                          {(!trade.marketCondition || trade.marketCondition.length === 0) && "STANDARD"}
                        </div>
                      </div>

                      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.03] transition-all">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 italic">Timeframe</label>
                        <div className="text-base font-black italic uppercase tracking-tighter text-white">
                          {trade.entryTimeframe || "N/A"}
                        </div>
                      </div>
                      
                      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.03] transition-all col-span-1 lg:col-span-2">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 italic">Active Sessions</label>
                        <div className="flex flex-wrap gap-2 text-base font-black italic uppercase tracking-tighter text-sky-400/60">
                          {(trade.sessions || []).map((session: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[10px] font-black rounded-lg uppercase tracking-widest">
                               {session}
                            </span>
                          ))}
                          {(!trade.sessions || trade.sessions.length === 0) && "GLOBAL"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Technical Section */}
                  <div className="space-y-10">
                    <div className="flex items-center gap-4">
                      <Activity size={18} className="text-purple-400" />
                      <h4 className="text-[11px] font-black text-purple-400 uppercase tracking-[0.4em] italic leading-none">
                        Technical
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.03] transition-all">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 italic">Primary Confluence</label>
                        <div className="text-base font-black italic uppercase tracking-tighter text-purple-400">
                          {trade.technicalConfluence || "DIRECT"}
                        </div>
                      </div>

                      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.03] transition-all">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 italic">Core Signal</label>
                        <div className="text-base font-black italic uppercase tracking-tighter text-amber-400">
                          {trade.signalTrigger || "RAW"}
                        </div>
                      </div>

                      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.03] transition-all">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 italic">Execution</label>
                        <div className="text-base font-black italic uppercase tracking-tighter text-sky-400">
                          {trade.orderType || "MARKET"}
                        </div>
                      </div>

                      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.03] transition-all lg:col-span-2">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 italic">Confirmation Stack</label>
                        <div className="flex flex-wrap gap-2">
                          {(trade.confluences || []).map((conf: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-black rounded-lg uppercase tracking-widest">
                               {conf}
                            </span>
                          ))}
                          {(!trade.confluences || trade.confluences.length === 0) && (
                            <span className="text-white/20 text-[10px] font-black uppercase tracking-widest italic">NONE_RECORDED</span>
                          )}
                        </div>
                      </div>

                      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.03] transition-all lg:col-span-2">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 italic">Levels</label>
                        <div className="flex flex-wrap gap-2">
                          {(trade.keyLevels || []).map((level: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-black rounded-lg uppercase tracking-widest">
                              {level}
                            </span>
                          ))}
                          {(!trade.keyLevels || trade.keyLevels.length === 0) && (
                            <span className="text-white/20 text-[10px] font-black uppercase tracking-widest italic">NONE_RECORDED</span>
                          )}
                        </div>
                      </div>

                      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.03] transition-all lg:col-span-2">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 italic">Entry Triggers</label>
                        <div className="flex flex-wrap gap-2">
                          {(trade.entrySignal || []).map((sig: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-black rounded-lg uppercase tracking-widest">
                               {sig}
                            </span>
                          ))}
                          {(!trade.entrySignal || trade.entrySignal.length === 0) && (
                            <span className="text-white/20 text-[10px] font-black uppercase tracking-widest italic">NONE_RECORDED</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

              {/* Risk Management */}
              <div className="space-y-6 mb-8 mt-12">
                 <h4 className="text-[11px] font-black text-amber-400 uppercase tracking-[0.4em] italic mb-6">
                   Risk
                 </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.03] transition-all lg:col-span-2">
                    <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 italic">
                      SL Management
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(trade.slManagement || []).map(
                        (sl: string, i: number) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-black rounded-lg uppercase tracking-widest"
                          >
                            {sl}
                          </span>
                        )
                      )}
                      {(!trade.slManagement ||
                        trade.slManagement.length === 0) && (
                        <span className="text-white/20 text-[10px] font-black uppercase tracking-widest italic">
                          NONE_RECORDED
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.03] transition-all lg:col-span-2">
                    <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 italic">
                      TP Management
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(trade.tpManagement || []).map(
                        (tp: string, i: number) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-black rounded-lg uppercase tracking-widest"
                          >
                            {tp}
                          </span>
                        )
                      )}
                      {(!trade.tpManagement ||
                        trade.tpManagement.length === 0) && (
                        <span className="text-white/20 text-[10px] font-black uppercase tracking-widest italic">
                          NONE_RECORDED
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.03] transition-all">
                    <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 italic">Target RR</label>
                    <div className="text-base font-black italic uppercase tracking-tighter text-sky-400">
                      {trade.targetRR ? `${trade.targetRR}R` : "N/A"}
                    </div>
                  </div>

                  <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.03] transition-all">
                    <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 italic">Actual RR</label>
                    <div className="text-base font-black italic uppercase tracking-tighter text-emerald-400">
                      {trade.actualRR ? `${trade.actualRR}R` : "N/A"}
                    </div>
                  </div>

                  <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.03] transition-all">
                    <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 italic">Exposure</label>
                    <div className="text-base font-black italic uppercase tracking-tighter text-purple-400">
                      {trade.portfolioBalance ? `$${trade.portfolioBalance.toLocaleString()}` : "N/A"}
                    </div>
                  </div>
                </div>
              </div>

                  <div className="space-y-6 mt-12">
                    <div className="flex items-center gap-4">
                      <TrendingUp size={18} className="text-emerald-400" />
                      <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] italic leading-none">
                        Performance
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.03] transition-all">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 italic">Outcome</label>
                        <div className={`text-base font-black italic uppercase tracking-tighter ${trade.outcome === 'win' ? 'text-emerald-400' : trade.outcome === 'loss' ? 'text-rose-400' : 'text-white'}`}>
                          {trade.outcome || "PENDING"}
                        </div>
                      </div>

                      <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.03] transition-all col-span-3">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 italic">Review</label>
                        <p className="text-sm text-white/60 leading-relaxed italic">
                          {trade.mistakes || "NO_DEVIATIONS_RECORDED"}
                        </p>
                      </div>
                    </div>
                  </div>

                   {/* Links */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                    <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.03] transition-all lg:col-span-2">
                       <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 italic text-sky-400">Exchange</label>
                       <span className="text-sm font-black text-white/80 uppercase tracking-widest">{trade.exchange || "GLOBAL"}</span>
                    </div>

                    <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.03] transition-all lg:col-span-2">
                       <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 italic text-purple-400">Chart</label>
                       {trade.chartLink ? (
                         <a href={trade.chartLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
                            <ExternalLink size={14} />
                            <span className="text-xs font-black uppercase tracking-widest">Access Signal Map</span>
                         </a>
                       ) : (
                         <span className="text-xs font-black text-white/20 uppercase tracking-widest italic">NONE_LINKED</span>
                       )}
                    </div>
                  </div>

                  {/* Personal Notes */}
                  { (trade.noteToSelf) && (
                    <div className="mt-12 bg-amber-500/[0.02] border border-amber-500/10 rounded-3xl p-8 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                         <Star size={40} className="text-amber-500" />
                       </div>
                       <label className="text-[10px] font-black text-amber-500/60 uppercase tracking-[0.4em] block mb-4 italic">Personal Review / Notes to Self</label>
                       <div className="text-lg font-black italic tracking-tight text-amber-200/90 leading-tight">
                         {trade.noteToSelf}
                       </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Trade Screenshots */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-blue-500/[0.02] -z-10 group-hover:opacity-100 transition-opacity opacity-0" />
              
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black italic uppercase tracking-[0.02em] text-white flex items-center gap-3">
                       <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                       Trade Screenshots
                    </h3>
                    <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.3em] italic">Chart Analysis & Execution</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {(trade.screenshots || []).length === 0 ? (
                    <div className="aspect-[21/9] rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center bg-white/[0.01]">
                        <ImageIcon size={48} className="text-white/10 mb-4" />
                        <p className="text-xs font-bold text-white/40 uppercase tracking-wider">No Screenshots Added</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(trade.screenshots || []).map((screenshot: string, i: number) => (
                        <div key={i} className="relative group/card aspect-video rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all shadow-2xl">
                           <img
                            src={screenshot}
                            alt={`Screenshot ${i + 1}`}
                            className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700 cursor-pointer"
                            onClick={() => setActiveImage(screenshot)}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity flex flex-col justify-end p-4 pointer-events-none">
                             <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] mb-1 italic">Image {i + 1}</p>
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setActiveImage(screenshot);
                               }}
                               className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] pointer-events-auto hover:text-blue-300 transition-colors"
                             >
                               Click to View Full Artifact
                             </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Psychology */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 relative group overflow-hidden">
               <div className="absolute inset-0 bg-blue-500/[0.02] -z-10 group-hover:opacity-100 transition-opacity opacity-0" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-4 flex items-center gap-2 italic">
                  <div className="w-1 h-1 bg-red-500 rounded-full" />
                  Psychology
                </h3>

                <div className="flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                  <div className="w-16 h-16 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-3xl shadow-inner">
                    {EMOTIONS.find((e) => e.value === trade.emotion)?.emoji || "😐"}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] italic">Sentiment</p>
                    <p className="text-xl font-bold uppercase tracking-tight text-white/90">
                      {trade.emotion || "Neutral"}
                    </p>
                  </div>
                </div>
            </div>

            {/* Setup Quality */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 relative group overflow-hidden">
               <div className="absolute inset-0 bg-amber-500/[0.02] -z-10 group-hover:opacity-100 transition-opacity opacity-0" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-4 flex items-center gap-2 italic">
                  <div className="w-1 h-1 bg-amber-500 rounded-full" />
                  Setup Quality
                </h3>

                <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Grade</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black italic text-amber-500 tracking-tighter">
                        {trade.setupGrade === 5 ? "A+" : trade.setupGrade === 4 ? "A" : trade.setupGrade === 3 ? "B" : trade.setupGrade === 2 ? "C" : trade.setupGrade === 1 ? "D" : "N/A"}
                      </span>
                      <span className="text-[10px] font-bold text-white/40 uppercase">Quality</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 flex items-center justify-center">
                     <Star size={14} className="text-amber-500" />
                  </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
               <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-6 italic">Key Metrics</h3>
              
              <div className="space-y-4">
                {trade.strategy && (
                  <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400">
                        <Target size={16} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-sky-400/60 uppercase tracking-[0.3em] italic">Active Strategy</p>
                        <p className="text-sm font-bold text-sky-400 uppercase tracking-tight">{trade.strategy.name}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Gross Profit</span>
                    <span className={`font-mono text-xs font-bold ${getDisplayValue(trade.grossPnl, calculatedMetrics?.grossPnl) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {getDisplayValue(trade.grossPnl, calculatedMetrics?.grossPnl) >= 0 ? "+" : ""}${getDisplayValue(trade.grossPnl, calculatedMetrics?.grossPnl).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Risk Amount</span>
                    <span className="font-mono text-xs font-bold text-amber-500">${trade.riskAmount?.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Risk Reward</span>
                    <span className="font-mono text-xs font-bold text-purple-400">
                       {getDisplayValue(trade.rMultiple, calculatedMetrics?.rMultiple).toFixed(2)}R
                    </span>
                  </div>
                  <div className="h-px bg-white/5 my-2" />
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest italic">Net Profit</span>
                    <span className={`text-lg font-black italic tracking-tighter ${getDisplayValue(trade.pnl, calculatedMetrics?.netPnl) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {getDisplayValue(trade.pnl, calculatedMetrics?.netPnl) >= 0 ? "+" : ""}${getDisplayValue(trade.pnl, calculatedMetrics?.netPnl).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] italic">Time</p>
                        <p className="text-[10px] font-mono text-white/60">{new Date(trade.timestampEntry).toLocaleTimeString()}</p>
                      </div>
                      <div className="text-right space-y-0.5">
                        <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] italic">Status</p>
                        <div className="flex items-center gap-1.5 justify-end">
                          <div className={`w-1 h-1 rounded-full ${trade.status === 'Open' ? 'bg-blue-500 animate-pulse' : 'bg-white/20'}`} />
                          <p className="text-[10px] font-bold text-white/80 uppercase">{trade.status || 'Archived'}</p>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Tags Section */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-4 italic">Categorization</h3>
                <div className="flex flex-wrap gap-2">
                  {(trade.tags || []).map((tag: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 text-white/40 text-[9px] font-black rounded-lg uppercase tracking-widest italic">
                       #{tag}
                    </span>
                  ))}
                  {(!trade.tags || trade.tags.length === 0) && (
                    <span className="text-white/10 text-[9px] font-black uppercase tracking-widest italic">NO_TAGS_APPLIED</span>
                  )}
                </div>
            </div>
        </div>
      </div>
    </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center justify-between p-8 border-b border-white/5">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold uppercase tracking-tight text-white">Share Trade</h3>
                  <p className="text-xs font-medium text-white/50 uppercase tracking-wider">Select sharing method</p>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-3 hover:bg-white/5 rounded-2xl transition-all text-white/40 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-4">
                <button
                  onClick={copyTradeLink}
                  className="w-full flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <Copy size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-white">Copy Link</p>
                      <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">Direct Link to Trade</p>
                    </div>
                  </div>
                  <ChevronDown className="text-white/20 -rotate-90" size={16} />
                </button>

                <button
                  onClick={generateTradeCard}
                  className="w-full flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <ImageIcon size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-white">Image Card</p>
                      <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">Shareable Image</p>
                    </div>
                  </div>
                  <ChevronDown className="text-white/20 -rotate-90" size={16} />
                </button>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Terminal */}
      <AnimatePresence>
        {showDeleteDialog && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-red-950/20 backdrop-blur-xl z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0A0A0A] border border-red-500/20 rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-[0_0_100px_rgba(239,68,68,0.1)]"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                <Trash2 size={32} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">Terminate Artifact?</h3>
              <p className="text-white/40 text-xs font-medium leading-relaxed mb-8">
                Warning: This action will permanently delete this trade from your journal.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDelete}
                  className="w-full py-4 bg-red-500 text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-red-400 transition-all shadow-2xl shadow-red-500/20"
                >
                  Delete Trade
                </button>
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="w-full py-4 bg-white/[0.03] border border-white/10 text-white/40 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Lightbox Terminal */}
      <AnimatePresence>
        {activeImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[200] flex items-center justify-center p-4 md:p-12"
            onClick={() => setActiveImage(null)}
          >
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-8 right-8 p-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white hover:bg-white/10 transition-all z-10 group"
            >
              <X size={24} className="group-hover:rotate-90 transition-transform" />
            </button>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-7xl w-full h-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={activeImage} 
                alt="Full artifact view" 
                className="max-w-full max-h-full object-contain rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5"
              />
              <div className="absolute bottom-[-40px] left-0 right-0 flex justify-center">
                 <div className="px-6 py-2 bg-white/[0.03] border border-white/10 rounded-full backdrop-blur-md">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] italic">Full Artifact Inspection Mode</span>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <NewTradeDialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        trade={trade}
        onSuccess={() => {
          fetchTradeData();
          setIsEditModalOpen(false);
          toast.success("Trade updated successfully");
        }}
      />
    </div>
  );
}
