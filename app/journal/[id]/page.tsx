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
} from "lucide-react";
import {
  calculateTradeMetrics,
  formatCurrency,
  formatPercentage,
  formatRMultiple,
  TradeCalculationResult,
} from "@/lib/utils/tradeCalculations";
import { motion, AnimatePresence } from "framer-motion";
import TradeCharts from "@/components/TradeCharts";
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
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [calculatedMetrics, setCalculatedMetrics] =
    useState<TradeCalculationResult | null>(null);
  const [isAiCollapsed, setIsAiCollapsed] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

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

  // Markdown-like text renderer
  const renderMarkdownText = (text: string) => {
    if (!text) return null;

    return text.split("\n").map((line, index) => {
      // Handle headers
      if (line.startsWith("# ")) {
        return (
          <h1 key={index} className="text-xl font-bold text-white mt-4 mb-2">
            {line.substring(2)}
          </h1>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={index} className="text-lg font-bold text-white mt-3 mb-2">
            {line.substring(3)}
          </h2>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <h3 key={index} className="text-base font-bold text-white mt-2 mb-1">
            {line.substring(4)}
          </h3>
        );
      }

      // Handle bullet points
      if (line.startsWith("• ") || line.startsWith("- ")) {
        return (
          <div key={index} className="ml-4 text-white/90 mb-1">
            • {line.substring(2)}
          </div>
        );
      }

      // Handle numbered lists
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={index} className="ml-4 text-white/90 mb-1">
            {line}
          </div>
        );
      }

      // Handle bold text **text**
      if (line.includes("**")) {
        const parts = line.split("**");
        return (
          <div key={index} className="text-white/80 mb-2">
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <strong key={i} className="font-bold text-white">
                  {part}
                </strong>
              ) : (
                part
              )
            )}
          </div>
        );
      }

      // Handle empty lines
      if (line.trim() === "") {
        return <div key={index} className="h-2"></div>;
      }

      // Regular text
      return (
        <div key={index} className="text-white/80 mb-2">
          {line}
        </div>
      );
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
    if (editForm.entryPrice && editForm.quantity && editForm.portfolioBalance) {
      const inputParams = {
        entryPrice: editForm.entryPrice,
        exitPrice: editForm.exitPrice,
        stopLoss: editForm.stopLoss,
        takeProfit: editForm.takeProfit,
        quantity: editForm.quantity,
        direction: editForm.direction || "long",
        portfolioBalance: editForm.portfolioBalance || 10000,
        fees: editForm.fees || 0,
        assetType: editForm.assetType || "forex",
        symbol: editForm.symbol || "",
      };

      const metrics = calculateTradeMetrics(inputParams);
      setCalculatedMetrics(metrics);
    }
  }, [
    editForm.entryPrice,
    editForm.exitPrice,
    editForm.stopLoss,
    editForm.takeProfit,
    editForm.quantity,
    editForm.direction,
    editForm.portfolioBalance,
    editForm.fees,
    editForm.assetType,
    editForm.symbol,
  ]);

  useEffect(() => {
    if (!id) return;

    const fetchTrade = async () => {
      try {
        const res = await fetch(`/api/trades/${id}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setTrade(data);
        setEditForm(data);

        // Calculate metrics for the loaded trade to ensure consistency
        if (data.entryPrice && data.quantity && data.portfolioBalance) {
          const metrics = calculateTradeMetrics({
            entryPrice: data.entryPrice,
            exitPrice: data.exitPrice,
            stopLoss: data.stopLoss,
            takeProfit: data.takeProfit,
            quantity: data.quantity,
            direction: data.direction || "long",
            portfolioBalance: data.portfolioBalance || 10000,
            fees: data.fees || 0,
            assetType: data.assetType || "forex",
            symbol: data.symbol || "",
          });

          setCalculatedMetrics(metrics);
        }

        // Load existing AI analysis if available
        if (data.aiAnalysis && Object.keys(data.aiAnalysis).length > 0) {
          setAiAnalysis(data.aiAnalysis);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchTrade();
  }, [id]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");
        const data = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const currentScreenshots = editForm.screenshots || [];

      setEditForm({
        ...editForm,
        screenshots: [...currentScreenshots, ...uploadedUrls],
      });
      toast.success("Screenshots uploaded successfully");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeScreenshot = (index: number) => {
    const updatedScreenshots = [...(editForm.screenshots || [])];
    updatedScreenshots.splice(index, 1);
    setEditForm({
      ...editForm,
      screenshots: updatedScreenshots,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Always calculate updated metrics to ensure accuracy
      const updatedMetrics = calculateTradeMetrics({
        entryPrice: editForm.entryPrice,
        exitPrice: editForm.exitPrice,
        stopLoss: editForm.stopLoss,
        takeProfit: editForm.takeProfit,
        quantity: editForm.quantity,
        direction: editForm.direction || "long",
        portfolioBalance: editForm.portfolioBalance || 10000,
        fees: editForm.fees || 0,
        assetType: editForm.assetType || "forex",
        symbol: editForm.symbol || "",
      });

      // Merge calculated metrics with form data
      const dataToSave = {
        ...editForm,
        grossPnl: updatedMetrics.grossPnl,
        pnl: updatedMetrics.netPnl,
        riskAmount: updatedMetrics.riskAmount,
        accountRisk: updatedMetrics.accountRisk,
        rMultiple: updatedMetrics.rMultiple,
        targetRR: updatedMetrics.targetRR,
        actualRR: updatedMetrics.actualRR,
        positionValue: updatedMetrics.positionValue,
      };

      const res = await fetch(`/api/trades/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      if (res.ok) {
        const updatedTrade = await res.json();
        setTrade(updatedTrade);
        setEditForm(updatedTrade);
        // Update calculated metrics to match saved data
        setCalculatedMetrics(updatedMetrics);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  };

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

      // Use current form data if editing, otherwise use saved trade data
      const tradeDataToAnalyze = isEditing ? editForm : trade;

      const res = await fetch("/api/ai/analyze-sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tradeData: tradeDataToAnalyze,
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
              ...tradeDataToAnalyze,
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
                 <span className="text-[10px] uppercase tracking-[0.1em] text-[#ffffff20]">•</span>
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
            <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-2 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-400 italic">Forensic Analysis</span>
                   </div>
                   <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Status: SYNC-OK</span>
                </div>
                <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">
                  {trade.symbol} <span className="text-white/10 font-thin not-italic">/</span> {trade.direction === 'long' ? 'Execution Buy' : 'Execution Sell'}
                </h1>
            </div>
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
                {analyzingAI ? "Processing..." : "Neural Scan"}
              </button>
            </div>

            <div className="h-10 w-px bg-white/10" />

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-4 bg-white text-black px-10 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-blue-500 hover:text-white transition-all shadow-2xl active:scale-95"
              >
                <Edit3 size={14} />
                Edit
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-8 py-3.5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 py-3.5 bg-emerald-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-400 transition-all shadow-2xl disabled:opacity-30"
                >
                  {saving ? "Saving..." : "Commit Changes"}
                </button>
              </div>
            )}
            
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
                      <div className="prose prose-invert max-w-none">
                        <div className="text-sm leading-relaxed space-y-2">
                          {renderMarkdownText(
                            aiAnalysis?.fullAnalysis || "No analysis available"
                          )}
                        </div>
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
                            <div className="text-sm text-white/80">
                              {aiAnalysis?.sections?.whatMustStop}
                            </div>
                          </div>
                        )}

                        {aiAnalysis?.sections?.actionPlan && (
                          <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                            <h4 className="text-[10px] font-black text-green-400 uppercase tracking-[0.3em] italic mb-2">
                              ✅ Action Plan
                            </h4>
                            <div className="text-sm text-white/80">
                              {aiAnalysis?.sections?.actionPlan}
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
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.00001"
                          value={editForm.entryPrice || ""}
                          onChange={(e) => setEditForm({...editForm, entryPrice: parseFloat(e.target.value)})}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-blue-400 font-mono text-sm focus:border-blue-500/50 outline-none transition-all"
                        />
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-blue-400 tracking-tighter italic tabular-nums">
                            {trade.entryPrice?.toFixed(trade.symbol?.includes("JPY") ? 3 : 5) || "0.00000"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-white/[0.01] rounded-2xl group/item hover:bg-white/[0.03] transition-all">
                      <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">Stop Loss</label>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.00001"
                          value={editForm.stopLoss || ""}
                          onChange={(e) => setEditForm({...editForm, stopLoss: parseFloat(e.target.value)})}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-rose-400 font-mono text-sm focus:border-rose-500/50 outline-none transition-all"
                        />
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-rose-500/40 tracking-tighter italic tabular-nums">
                            {trade.stopLoss?.toFixed(trade.symbol?.includes("JPY") ? 3 : 5) || "---"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Exit Hub */}
                  <div className="space-y-4">
                    <div className="p-4 bg-white/[0.01] rounded-2xl group/item hover:bg-white/[0.03] transition-all">
                      <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">Exit Price</label>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.00001"
                          value={editForm.exitPrice || ""}
                          onChange={(e) => setEditForm({...editForm, exitPrice: parseFloat(e.target.value)})}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-purple-400 font-mono text-sm focus:border-purple-500/50 outline-none transition-all"
                        />
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-purple-400 tracking-tighter italic tabular-nums">
                            {trade.exitPrice?.toFixed(trade.symbol?.includes("JPY") ? 3 : 5) || "OPEN"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-white/[0.01] rounded-2xl group/item hover:bg-white/[0.03] transition-all">
                      <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">Take Profit</label>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.00001"
                          value={editForm.takeProfit || ""}
                          onChange={(e) => setEditForm({...editForm, takeProfit: parseFloat(e.target.value)})}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-emerald-400 font-mono text-sm focus:border-emerald-500/50 outline-none transition-all"
                        />
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-emerald-500/40 tracking-tighter italic tabular-nums">
                            {trade.takeProfit?.toFixed(trade.symbol?.includes("JPY") ? 3 : 5) || "---"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Volume Hub */}
                  <div className="space-y-4">
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl group/item hover:bg-white/[0.05] transition-all">
                      <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">Quantity</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.quantity || ""}
                          onChange={(e) => setEditForm({...editForm, quantity: parseFloat(e.target.value)})}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white font-mono text-sm focus:border-white/30 outline-none transition-all"
                        />
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-white/90 tracking-tighter font-mono">
                            {trade.quantity?.toLocaleString() || "0"}
                          </span>
                          <span className="text-[10px] font-black text-white/20 uppercase">Units</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl group/item hover:bg-white/[0.05] transition-all">
                      <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">Leverage</label>
                      {isEditing ? (
                        <select
                          value={editForm.leverage || "1:1"}
                          onChange={(e) => setEditForm({ ...editForm, leverage: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white font-mono text-sm outline-none cursor-pointer"
                        >
                          {["1:1", "1:10", "1:20", "1:30", "1:50", "1:100", "1:200", "1:500"].map(l => (
                            <option key={l} value={l} className="bg-[#0A0A0A]">{l}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-white/60 tracking-tighter font-mono">{trade.leverage || "1:1"}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata Hub */}
                  <div className="space-y-4">
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl group/item hover:bg-white/[0.05] transition-all">
                      <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">Risk %</label>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.accountRisk || ""}
                          onChange={(e) => setEditForm({...editForm, accountRisk: parseFloat(e.target.value)})}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-amber-400 font-mono text-sm focus:border-amber-500/50 outline-none transition-all"
                        />
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-amber-400 tracking-tighter font-mono">{trade.accountRisk?.toFixed(2) || "0.00"}</span>
                          <span className="text-[10px] font-black text-amber-400/40">%</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl group/item hover:bg-white/[0.05] transition-all">
                      <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">Fees</label>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.fees || ""}
                          onChange={(e) => setEditForm({...editForm, fees: parseFloat(e.target.value)})}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white/60 font-mono text-sm focus:border-white/30 outline-none transition-all"
                        />
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-white/40 tracking-tighter font-mono">${trade.fees?.toFixed(2) || "0.00"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                  <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6">
                     <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">Asset Class</label>
                          {isEditing ? (
                            <select 
                              value={editForm.assetType || "forex"}
                              onChange={(e) => setEditForm({...editForm, assetType: e.target.value})}
                              className="bg-transparent border-none text-white font-black uppercase text-[10px] tracking-[0.2em] outline-none p-0 italic"
                            >
                              <option value="forex" className="bg-[#0A0A0A]">Forex</option>
                              <option value="crypto" className="bg-[#0A0A0A]">Crypto</option>
                              <option value="stock" className="bg-[#0A0A0A]">Stock</option>
                              <option value="cfd" className="bg-[#0A0A0A]">CFD</option>
                              <option value="futures" className="bg-[#0A0A0A]">Futures</option>
                              <option value="indices" className="bg-[#0A0A0A]">Indices</option>
                            </select>
                          ) : (
                            <p className="text-sm font-bold text-white uppercase tracking-wider">{trade.assetType || "Forex"}</p>
                          )}
                     </div>
                     <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">Direction</label>
                          {isEditing ? (
                            <select 
                              value={editForm.direction || "long"}
                              onChange={(e) => setEditForm({...editForm, direction: e.target.value})}
                              className="bg-transparent border-none text-white font-bold uppercase text-xs outline-none p-0"
                            >
                              <option value="long">Long</option>
                              <option value="short">Short</option>
                            </select>
                          ) : (
                            <div className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${trade.direction === 'long' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {trade.direction === 'long' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                              {trade.direction}
                            </div>
                          )}
                     </div>
                     <div className="space-y-1">
                          <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">Entry Time</label>
                          <p className="text-sm font-mono text-white/80">{new Date(trade.timestampEntry).toLocaleString()}</p>
                     </div>
                     <div className="space-y-1 text-right">
                          <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">Outcome</label>
                          <div className={`text-sm font-bold uppercase tracking-wider ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                             {trade.pnl >= 0 ? "Profit" : "Loss"}
                          </div>
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
                 
                 {isEditing ? (
                    <div className="relative">
                      <textarea
                        value={editForm.notes || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, notes: e.target.value })
                        }
                        rows={10}
                        className="w-full bg-[#050505] border border-white/10 rounded-xl px-6 py-5 text-white/90 font-mono text-sm leading-relaxed focus:border-emerald-500/50 outline-none resize-none placeholder:text-white/40 max-h-[400px] overflow-y-auto"
                        placeholder="Write your trade notes here..."
                      />
                    </div>
                  ) : (
                    <div className="bg-[#050505] border border-white/10 rounded-xl p-6 h-[300px] relative overflow-hidden flex flex-col">
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
                  )}
              </div>
            </div>

            {/* Trade Analysis */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden relative group">
              <div className="relative p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-1">
                     <h3 className="text-xl font-black italic uppercase tracking-[0.02em] text-white flex items-center gap-3">
                       <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                       Trade Analysis
                     </h3>
                     <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.3em] italic">Detailed Market & Risk Analysis</p>
                  </div>
                </div>

              {/* Market Analysis */}
              <div className="space-y-6 mb-8">
                 <h4 className="text-[11px] font-black text-sky-400 uppercase tracking-[0.4em] italic mb-6">
                   Market Context
                 </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">
                       Daily Bias
                     </label>
                    {isEditing ? (
                      <select
                        value={editForm.dailyBias || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            dailyBias: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                      >
                        <option value="">Select bias</option>
                        <option value="bullish">Bullish</option>
                        <option value="bearish">Bearish</option>
                        <option value="neutral">Neutral</option>
                        <option value="ranging">Ranging</option>
                      </select>
                    ) : (
                      <p className="text-sm text-white/80 bg-white/5 rounded-lg p-3">
                        {trade.dailyBias || "Not specified"}
                      </p>
                    )}
                  </div>
                  <div>
                     <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">
                       Trade Type
                     </label>
                    {isEditing ? (
                      <select
                        value={editForm.tradeType || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            tradeType: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                      >
                        <option value="">Select type</option>
                        <option value="scalp">Scalp</option>
                        <option value="day">Day Trade</option>
                        <option value="swing">Swing</option>
                        <option value="position">Position</option>
                      </select>
                    ) : (
                      <p className="text-sm text-white/80 bg-white/5 rounded-lg p-3">
                        {trade.tradeType || "Not specified"}
                      </p>
                    )}
                  </div>
                  <div>
                      <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">
                       Entry Timeframe
                     </label>
                    {isEditing ? (
                      <select
                        value={editForm.entryTimeframe || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            entryTimeframe: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                      >
                        <option value="">Select timeframe</option>
                        <option value="1m">1 Minute</option>
                        <option value="5m">5 Minutes</option>
                        <option value="15m">15 Minutes</option>
                        <option value="1h">1 Hour</option>
                        <option value="4h">4 Hours</option>
                        <option value="1d">Daily</option>
                      </select>
                    ) : (
                      <p className="text-sm text-white/80 bg-white/5 rounded-lg p-3">
                        {trade.entryTimeframe || "Not specified"}
                      </p>
                    )}
                  </div>
                  <div>
                      <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">
                       News Impact
                     </label>
                    {isEditing ? (
                      <select
                        value={editForm.newsImpact || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            newsImpact: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                      >
                        <option value="">Select impact</option>
                        <option value="none">None</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    ) : (
                      <p className="text-sm text-white/80 bg-white/5 rounded-lg p-3">
                        {trade.newsImpact || "None"}
                      </p>
                    )}
                  </div>
                  <div>
                      <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">
                       Market Environment
                     </label>
                    {isEditing ? (
                      <select
                        value={editForm.marketEnvironment || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            marketEnvironment: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                      >
                        <option value="">Select Environment</option>
                        <option value="Trend">Trend</option>
                        <option value="Range">Range</option>
                        <option value="Volatility">Volatility</option>
                        <option value="Expansion">Expansion</option>
                        <option value="Consolidation">Consolidation</option>
                      </select>
                    ) : (
                      <p className="text-sm font-bold text-sky-400 bg-sky-500/10 rounded-lg p-3">
                        {trade.marketEnvironment || "Not specified"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Technical Setup */}
              <div className="space-y-6 mb-8">
                 <h4 className="text-[11px] font-black text-purple-400 uppercase tracking-[0.4em] italic mb-6">
                   Technical Setup
                 </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">
                      Market Conditions
                    </label>
                    {isEditing ? (
                      <textarea
                        value={(editForm.marketCondition || []).join(", ")}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            marketCondition: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter((s) => s),
                          })
                        }
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none resize-none text-sm"
                        placeholder="Enter conditions separated by commas (e.g., trending, high volatility, news event)"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {(trade.marketCondition || []).map(
                          (condition: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                            >
                              {condition}
                            </span>
                          )
                        )}
                        {(!trade.marketCondition ||
                          trade.marketCondition.length === 0) && (
                          <span className="text-white/60 text-sm italic">
                            None specified
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">
                      Trading Sessions
                    </label>
                    {isEditing ? (
                      <textarea
                        value={(editForm.sessions || []).join(", ")}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            sessions: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter((s) => s),
                          })
                        }
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none resize-none text-sm"
                        placeholder="London, New York, Asian..."
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {(trade.sessions || []).length > 0 ? (
                          (trade.sessions || []).map(
                            (session: string, i: number) => (
                              <span
                                key={i}
                                className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-300 text-xs font-bold rounded-lg uppercase tracking-wider"
                              >
                                {session}
                              </span>
                            )
                          )
                        ) : (
                          <span className="text-white/40 text-sm italic">
                            No sessions recorded
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">
                      Entry Signals
                    </label>
                    {isEditing ? (
                      <textarea
                        value={(editForm.entrySignal || []).join(", ")}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            entrySignal: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter((s) => s),
                          })
                        }
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none resize-none text-sm"
                        placeholder="Enter signals separated by commas (e.g., breakout, support bounce, MA cross)"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {(trade.entrySignal || []).map(
                          (signal: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                            >
                              {signal}
                            </span>
                          )
                        )}
                        {(!trade.entrySignal ||
                          trade.entrySignal.length === 0) && (
                          <span className="text-white/60 text-sm italic">
                            None specified
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">
                      Execution Architecture
                    </label>
                    {isEditing ? (
                      <select
                        value={editForm.executionArchitecture || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            executionArchitecture: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                      >
                         <option value="">Select Architecture</option>
                         <option value="Limit Order">Limit Order</option>
                         <option value="Market Execution">Market Execution</option>
                         <option value="Aggressive Entry">Aggressive Entry</option>
                         <option value="Conservative Entry">Conservative Entry</option>
                         <option value="Breakout">Breakout</option>
                         <option value="Retest">Retest</option>
                      </select>
                    ) : (
                      <p className="text-sm font-bold text-emerald-400 bg-emerald-500/10 rounded-lg p-3">
                        {trade.executionArchitecture || "Not specified"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">
                      Signal Trigger
                    </label>
                    {isEditing ? (
                      <select
                        value={editForm.signalTrigger || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            signalTrigger: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                      >
                         <option value="">Select Trigger</option>
                         <option value="Fair Value Gap">Fair Value Gap</option>
                         <option value="Order Block">Order Block</option>
                         <option value="Breaker Block">Breaker Block</option>
                         <option value="Liquidity Sweep">Liquidity Sweep</option>
                         <option value="MTF Alignment">MTF Alignment</option>
                      </select>
                    ) : (
                      <p className="text-sm font-bold text-amber-400 bg-amber-500/10 rounded-lg p-3">
                        {trade.signalTrigger || "Not specified"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">
                      Technical Confluence
                    </label>
                    {isEditing ? (
                      <select
                        value={editForm.technicalConfluence || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            technicalConfluence: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                      >
                         <option value="">Select Confluence</option>
                         <option value="HTF Bias">HTF Bias</option>
                         <option value="Key Level">Key Level</option>
                         <option value="Fibonacci">Fibonacci</option>
                         <option value="Indicator Cross">Indicator Cross</option>
                         <option value="Correlated Asset">Correlated Asset</option>
                      </select>
                    ) : (
                      <p className="text-sm font-bold text-purple-400 bg-purple-500/10 rounded-lg p-3">
                        {trade.technicalConfluence || "Not specified"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">
                      Key Levels
                    </label>
                    {isEditing ? (
                      <textarea
                        value={(editForm.keyLevels || []).join(", ")}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            keyLevels: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter((s) => s),
                          })
                        }
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none resize-none text-sm"
                        placeholder="Enter levels separated by commas (e.g., 1.2500, resistance, daily high)"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {(trade.keyLevels || []).map(
                          (level: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded-full"
                            >
                              {level}
                            </span>
                          )
                        )}
                        {(!trade.keyLevels || trade.keyLevels.length === 0) && (
                          <span className="text-white/60 text-sm italic">
                            None specified
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Risk Management */}
              <div className="space-y-6 mb-8">
                 <h4 className="text-[11px] font-black text-amber-400 uppercase tracking-[0.4em] italic mb-6">
                   Risk Management
                 </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">
                      SL Management
                    </label>
                    {isEditing ? (
                      <textarea
                        value={(editForm.slManagement || []).join(", ")}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            slManagement: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter((s) => s),
                          })
                        }
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none resize-none text-sm"
                        placeholder="Enter SL management separated by commas (e.g., moved to BE, trailed, held)"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {(trade.slManagement || []).map(
                          (sl: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full"
                            >
                              {sl}
                            </span>
                          )
                        )}
                        {(!trade.slManagement ||
                          trade.slManagement.length === 0) && (
                          <span className="text-white/60 text-sm italic">
                            None specified
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">
                      TP Management
                    </label>
                    {isEditing ? (
                      <textarea
                        value={(editForm.tpManagement || []).join(", ")}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            tpManagement: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter((s) => s),
                          })
                        }
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none resize-none text-sm"
                        placeholder="Enter TP management separated by commas (e.g., partial close, full target, manual close)"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {(trade.tpManagement || []).map(
                          (tp: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full"
                            >
                              {tp}
                            </span>
                          )
                        )}
                        {(!trade.tpManagement ||
                          trade.tpManagement.length === 0) && (
                          <span className="text-white/60 text-sm italic">
                            None specified
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Performance Analysis */}
              <div className="space-y-6">
                 <h4 className="text-[11px] font-black text-green-400 uppercase tracking-[0.4em] italic mb-6">
                   Performance Analysis
                 </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-[9px] font-black text-white/60 uppercase tracking-[0.3em] block mb-2 italic">
                      Outcome
                    </label>
                    {isEditing ? (
                      <select
                        value={editForm.outcome || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, outcome: e.target.value })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                      >
                        <option value="">Select outcome</option>
                        <option value="win">Win</option>
                        <option value="loss">Loss</option>
                        <option value="breakeven">Breakeven</option>
                      </select>
                    ) : (
                      <p className="text-sm text-white/80 bg-white/5 rounded-lg p-3">
                        {trade.outcome || "Not specified"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                      Mistakes
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editForm.mistakes || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, mistakes: e.target.value })
                        }
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none resize-none text-sm"
                        placeholder="Document any mistakes made..."
                      />
                    ) : (
                      <p className="text-sm text-white/80 bg-white/5 rounded-lg p-3 max-h-20 overflow-y-auto">
                        {trade.mistakes || "None documented"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                      Description
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editForm.description || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none resize-none text-sm"
                        placeholder="Describe the trade setup..."
                      />
                    ) : (
                      <p className="text-sm text-white/80 bg-white/5 rounded-lg p-3 max-h-20 overflow-y-auto">
                        {trade.description || "No description"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

                {/* Note to Self */}
                <div className="mt-6">
                  <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                    Note to Self
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editForm.noteToSelf || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, noteToSelf: e.target.value })
                      }
                      rows={3}
                      className="w-full bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-4 py-3 text-yellow-200 focus:border-yellow-500/50 outline-none resize-none"
                      placeholder="Personal reminder or lesson learned..."
                    />
                  ) : (
                    trade.noteToSelf && (
                      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
                        <p className="text-sm text-yellow-200">
                          {trade.noteToSelf}
                        </p>
                      </div>
                    )
                  )}
                </div>

                {/* Additional Trade Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                      Exchange
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.exchange || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, exchange: e.target.value })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                        placeholder="e.g., NASDAQ, NYSE, Binance"
                      />
                    ) : (
                      <p className="text-sm text-white/80 bg-white/5 rounded-lg p-3">
                        {trade.exchange || "Not specified"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                      Order Type
                    </label>
                    {isEditing ? (
                      <select
                        value={editForm.orderType || "Market"}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            orderType: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                      >
                        <option value="Market">Market</option>
                        <option value="Limit">Limit</option>
                        <option value="Stop">Stop</option>
                      </select>
                    ) : (
                      <p className="text-sm text-white/80 bg-white/5 rounded-lg p-3">
                        {trade.orderType || "Market"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                      Status
                    </label>
                    {isEditing ? (
                      <select
                        value={editForm.status || "Closed"}
                        onChange={(e) =>
                          setEditForm({ ...editForm, status: e.target.value })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                      >
                        <option value="Open">Open</option>
                        <option value="Closed">Closed</option>
                        <option value="Pending">Pending</option>
                      </select>
                    ) : (
                      <p className="text-sm text-white/80 bg-white/5 rounded-lg p-3">
                        {trade.status || "Closed"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                      Tags
                    </label>
                    {isEditing ? (
                      <textarea
                        value={(editForm.tags || []).join(", ")}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            tags: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter((s) => s),
                          })
                        }
                        rows={2}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none resize-none text-sm"
                        placeholder="Enter tags separated by commas (e.g., scalp, breakout, news)"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {(trade.tags || []).map((tag: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {(!trade.tags || trade.tags.length === 0) && (
                          <span className="text-white/60 text-sm italic">
                            No tags
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Chart Link */}
                <div className="mt-6">
                  <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                    Chart Link
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={editForm.chartLink || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, chartLink: e.target.value })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                      placeholder="https://tradingview.com/chart/..."
                    />
                  ) : (
                    trade.chartLink && (
                      <a
                        href={trade.chartLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm"
                      >
                        <ExternalLink size={16} />
                        View Chart Analysis
                      </a>
                    )
                  )}
                </div>
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
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] italic">Queue Active</span>
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Commit on Save</span>
                      </div>
                      {isEditing && (
                        <label className="cursor-pointer group/upload">
                           <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2 group-hover/upload:bg-blue-500/20 transition-all">
                              <Upload size={14} className="text-blue-400" />
                              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic">Upload Artifact</span>
                           </div>
                           <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                      )}
                    </div>
                </div>

                <div className="space-y-6">
                  {((editForm.screenshots || trade.screenshots) || []).length === 0 ? (
                    <div className="aspect-[21/9] rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center bg-white/[0.01]">
                        <ImageIcon size={48} className="text-white/10 mb-4" />
                        <p className="text-xs font-bold text-white/40 uppercase tracking-wider">No Screenshots Added</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(editForm.screenshots || trade.screenshots).map((screenshot: string, i: number) => (
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
                          {isEditing && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeScreenshot(i);
                              }}
                              className="absolute top-4 right-4 w-8 h-8 bg-red-500/80 hover:bg-red-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all shadow-xl backdrop-blur-md z-10"
                            >
                              <X size={14} />
                            </button>
                          )}
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

              {isEditing ? (
                <div className="grid grid-cols-2 gap-2">
                  {EMOTIONS.map((emotion) => (
                    <button
                      key={emotion.value}
                      onClick={() => setEditForm((prev: any) => ({ ...prev, emotion: emotion.value }))}
                      className={`p-3 rounded-xl border transition-all text-center flex flex-col items-center justify-center gap-1 ${
                        editForm.emotion === emotion.value
                          ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                          : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="text-xl">{emotion.emoji}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">{emotion.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
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
              )}
            </div>

            {/* Setup Quality */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 relative group overflow-hidden">
               <div className="absolute inset-0 bg-amber-500/[0.02] -z-10 group-hover:opacity-100 transition-opacity opacity-0" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-4 flex items-center gap-2 italic">
                  <div className="w-1 h-1 bg-amber-500 rounded-full" />
                  Setup Quality
                </h3>

              {isEditing ? (
                <div className="flex justify-between gap-1">
                  {[1, 2, 3, 4, 5].map((grade) => (
                    <button
                      key={grade}
                      onClick={() => setEditForm((prev: any) => ({ ...prev, setupGrade: grade }))}
                      className={`flex-1 aspect-square rounded-xl border transition-all flex items-center justify-center font-bold text-xs ${
                        editForm.setupGrade === grade
                          ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                          : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.05]"
                      }`}
                    >
                      {grade === 5 ? "A+" : grade === 4 ? "A" : grade === 3 ? "B" : grade === 2 ? "C" : "D"}
                    </button>
                  ))}
                </div>
              ) : (
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
              )}
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
              <p className="text-[10px] font-medium text-white/30 uppercase tracking-[0.2em] mb-10 leading-relaxed">
                Warning: This action will permanently delink the selected trade artifact from the neural registry.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDelete}
                  className="w-full py-4 bg-red-500 text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-red-400 transition-all shadow-2xl shadow-red-500/20"
                >
                  Confirm Termination
                </button>
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="w-full py-4 bg-white/[0.03] border border-white/10 text-white/40 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:text-white hover:bg-white/5 transition-all"
                >
                  Maintain Linkage
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
    </div>
  );
}
