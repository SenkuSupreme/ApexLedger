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
  Share2,
  Download,
  Copy,
} from "lucide-react";
import {
  calculateTradeMetrics,
  formatCurrency,
  formatPercentage,
  formatRMultiple,
  TradeCalculationResult,
} from "@/lib/utils/tradeCalculations";
import TradeCharts from "@/components/TradeCharts";

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
  const [isAiCollapsed, setIsAiCollapsed] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Share functionality
  const generatePDF = async () => {
    try {
      const element = document.getElementById("trade-content");
      if (!element) return;

      // Dynamic import for client-side only
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(element, {
        backgroundColor: "#0A0A0A",
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`trade-${(trade as any).symbol}-${(trade as any)._id}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const generateTradeCard = async () => {
    try {
      const cardElement = document.getElementById("trade-card");
      if (!cardElement) {
        console.error("Trade card element not found");
        alert("Trade card element not found. Please try again.");
        return;
      }

      // Make the card visible temporarily for capture
      cardElement.style.position = "fixed";
      cardElement.style.top = "0";
      cardElement.style.left = "0";
      cardElement.style.zIndex = "9999";

      const html2canvas = (await import("html2canvas")).default;

      const canvas = await html2canvas(cardElement, {
        backgroundColor: "#0A0A0A",
        scale: 3,
        logging: false,
        useCORS: true,
        width: 400,
        height: 600,
        allowTaint: true,
        foreignObjectRendering: true,
      });

      // Hide the card again
      cardElement.style.position = "fixed";
      cardElement.style.top = "-9999px";
      cardElement.style.left = "0";
      cardElement.style.zIndex = "auto";

      // Create download link
      const link = document.createElement("a");
      link.download = `trade-card-${trade.symbol}-${trade._id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Trade card generation failed:", error);
      alert("Failed to generate trade card. Please try again.");
    }
  };

  const copyTradeLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert("Trade link copied to clipboard!");
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
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload images. Please try again.");
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
      alert("No notes or trade data to analyze");
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
      alert("AI Analysis failed. Please try again.");
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
        Loading Trade Analysis...
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
    <div className="space-y-8 text-white">
      {/* Trade Card for Sharing (Hidden) */}
      <div
        id="trade-card"
        className="fixed -top-[9999px] left-0 w-[380px] h-[600px] bg-black text-white overflow-hidden border border-white/20"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {/* 3D Grid Background */}
        <div className="absolute inset-0">
          {/* Base black background */}
          <div className="absolute inset-0 bg-black"></div>

          {/* 3D Grid Effect */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px, 40px 40px, 8px 8px, 8px 8px",
              backgroundPosition: "0 0, 0 0, 0 0, 0 0",
            }}
          ></div>

          {/* 3D Perspective Lines */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-blue-500/50 via-transparent to-purple-500/50 transform -translate-x-1/2"></div>
            <div className="absolute left-0 top-1/2 w-full h-px bg-gradient-to-r from-blue-500/50 via-transparent to-purple-500/50 transform -translate-y-1/2"></div>
          </div>

          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-transparent"></div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-500/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-emerald-500/20 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-orange-500/20 to-transparent"></div>
        </div>

        <div className="relative z-10 h-full flex flex-col p-4">
          {/* Header Section */}
          <div className="text-center mb-4">
            {/* Brand */}
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 bg-white/10 rounded-lg border border-white/20">
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-md flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
              <span className="text-white font-bold text-xs tracking-wide">
                TRADE CARD
              </span>
            </div>

            {/* Symbol & Direction */}
            <h1 className="text-3xl font-black mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
              {trade.symbol}
            </h1>

            <div className="flex items-center justify-center gap-2">
              <div
                className={`px-4 py-1 rounded-md text-xs font-bold border ${
                  trade.direction === "long"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-red-500/20 text-red-400 border-red-500/40"
                }`}
              >
                {trade.direction.toUpperCase()}
              </div>
              <div className="px-3 py-1 bg-white/10 rounded-md text-xs text-white/80 border border-white/20">
                {trade.assetType?.toUpperCase() || "FOREX"}
              </div>
            </div>
          </div>

          {/* P&L Display */}
          <div className="text-center mb-4 p-3 bg-white/5 rounded-xl border border-white/20">
            <div className="mb-1">
              <span className="text-xs text-white/70 uppercase tracking-wider font-medium">
                NET P&L
              </span>
            </div>
            <div
              className={`text-4xl font-black mb-1 tracking-tight ${
                getDisplayValue(trade.pnl, calculatedMetrics?.netPnl) >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {getDisplayValue(trade.pnl, calculatedMetrics?.netPnl) >= 0
                ? "+"
                : ""}
              $
              {getDisplayValue(trade.pnl, calculatedMetrics?.netPnl).toFixed(2)}
            </div>
          </div>

          {/* Entry/Exit Points */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-xl p-3 border border-white/20">
              <div className="text-center">
                <div className="text-xs text-blue-400 uppercase tracking-wider font-bold mb-1">
                  ENTRY
                </div>
                <div className="text-lg font-black text-white">
                  $
                  {(trade.entryPrice || 0).toFixed(
                    trade.symbol?.includes("JPY") ? 3 : 5
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/20">
              <div className="text-center">
                <div className="text-xs text-purple-400 uppercase tracking-wider font-bold mb-1">
                  EXIT
                </div>
                <div className="text-lg font-black text-white">
                  {trade.exitPrice
                    ? `$${trade.exitPrice.toFixed(
                        trade.symbol?.includes("JPY") ? 3 : 5
                      )}`
                    : "OPEN"}
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-white/5 rounded-lg p-3 border border-white/20">
              <div className="text-center">
                <div className="text-lg font-black text-white mb-1">
                  {getDisplayValue(
                    trade.rMultiple,
                    calculatedMetrics?.rMultiple
                  ).toFixed(1)}
                  R
                </div>
                <div className="text-xs text-white/70 uppercase tracking-wider font-medium">
                  R-MULT
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-3 border border-white/20">
              <div className="text-center">
                <div className="text-lg font-black text-amber-400 mb-1">
                  {getDisplayValue(
                    trade.accountRisk,
                    calculatedMetrics?.accountRisk
                  ).toFixed(1)}
                  %
                </div>
                <div className="text-xs text-amber-300/80 uppercase tracking-wider font-medium">
                  RISK
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-3 border border-white/20">
              <div className="text-center">
                <div className="text-lg font-black text-emerald-400 mb-1">
                  {trade.quantity || 0}
                </div>
                <div className="text-xs text-emerald-300/80 uppercase tracking-wider font-medium">
                  SIZE
                </div>
              </div>
            </div>
          </div>

          {/* Stop Loss & Take Profit */}
          {(trade.stopLoss || trade.takeProfit) && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {trade.stopLoss && (
                <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
                  <div className="text-center">
                    <div className="text-xs text-red-400 uppercase tracking-wider font-bold mb-1">
                      STOP LOSS
                    </div>
                    <div className="text-sm font-black text-red-300">
                      $
                      {trade.stopLoss.toFixed(
                        trade.symbol?.includes("JPY") ? 3 : 5
                      )}
                    </div>
                  </div>
                </div>
              )}

              {trade.takeProfit && (
                <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/30">
                  <div className="text-center">
                    <div className="text-xs text-emerald-400 uppercase tracking-wider font-bold mb-1">
                      TAKE PROFIT
                    </div>
                    <div className="text-sm font-black text-emerald-300">
                      $
                      {trade.takeProfit.toFixed(
                        trade.symbol?.includes("JPY") ? 3 : 5
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Date & Footer */}
          <div className="mt-auto">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg border border-white/20">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-white/90 font-medium">
                  {new Date(trade.timestampEntry).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-3"></div>
            <div className="text-center">
              <span className="text-white/60 text-xs font-medium tracking-wide">
                PROFESSIONAL ANALYSIS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div id="trade-content">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                {trade.symbol}
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-bold ${
                    trade.direction === "long"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {trade.direction.toUpperCase()}
                </span>
              </h1>
              <p className="text-white/60 text-sm mt-1">
                {new Date(trade.timestampEntry).toLocaleDateString()} •{" "}
                {trade.assetType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors"
            >
              <Share2 size={16} />
              Share
            </button>

            <button
              onClick={analyzeWithAI}
              disabled={analyzingAI}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors disabled:opacity-50"
            >
              <Brain size={16} />
              {analyzingAI ? "Analyzing..." : "AI Analysis"}
            </button>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-lg hover:bg-sky-500/30 transition-colors"
              >
                <Edit3 size={16} />
                Edit Trade
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-lg hover:bg-gray-500/30 transition-colors"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            )}

            <button
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* AI Analysis Results */}
        {aiAnalysis && (
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl overflow-hidden">
            <div className="bg-purple-500/10 px-6 py-4 border-b border-purple-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain size={20} className="text-purple-400" />
                  <h3 className="text-lg font-bold text-purple-400">
                    Professional Trading Analysis
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={analyzeWithAI}
                    disabled={analyzingAI}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 transition-colors disabled:opacity-50 text-xs"
                  >
                    <RefreshCw size={14} />
                    {analyzingAI ? "Re-analyzing..." : "Re-analyze"}
                  </button>
                  <div className="text-xs text-purple-300 font-mono">
                    Model: {aiAnalysis?.model || "Unknown"} •{" "}
                    {aiAnalysis?.timestamp
                      ? new Date(aiAnalysis.timestamp).toLocaleTimeString()
                      : "Unknown time"}
                  </div>
                  <button
                    onClick={() => setIsAiCollapsed(!isAiCollapsed)}
                    className="p-1 hover:bg-purple-500/20 rounded transition-colors"
                  >
                    {isAiCollapsed ? (
                      <ChevronDown size={16} className="text-purple-400" />
                    ) : (
                      <ChevronUp size={16} className="text-purple-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {!isAiCollapsed && (
              <div className="p-6 space-y-6">
                {/* Trader Score Dashboard */}
                {aiAnalysis?.sections?.traderScore && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-black/20 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {aiAnalysis.sections.traderScore.overall || "0"}
                      </div>
                      <div className="text-xs text-purple-300 uppercase tracking-wider">
                        Overall
                      </div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {aiAnalysis.sections.traderScore.riskDiscipline || "0"}
                      </div>
                      <div className="text-xs text-purple-300 uppercase tracking-wider">
                        Risk
                      </div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {aiAnalysis.sections.traderScore.executionQuality ||
                          "0"}
                      </div>
                      <div className="text-xs text-purple-300 uppercase tracking-wider">
                        Execution
                      </div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {aiAnalysis.sections.traderScore.consistency || "0"}
                      </div>
                      <div className="text-xs text-purple-300 uppercase tracking-wider">
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
                    {aiAnalysis.sections?.whatMustStop && (
                      <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                        <h4 className="text-sm font-bold text-red-400 mb-2 uppercase tracking-wider">
                          🚫 Must Stop Immediately
                        </h4>
                        <div className="text-sm text-white/80">
                          {aiAnalysis.sections.whatMustStop}
                        </div>
                      </div>
                    )}

                    {aiAnalysis.sections?.actionPlan && (
                      <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                        <h4 className="text-sm font-bold text-green-400 mb-2 uppercase tracking-wider">
                          ✅ Action Plan
                        </h4>
                        <div className="text-sm text-white/80">
                          {aiAnalysis.sections.actionPlan}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp size={20} className="text-blue-500" />
              <span
                className={`text-2xl font-bold ${
                  getDisplayValue(
                    trade.grossPnl,
                    calculatedMetrics?.grossPnl
                  ) >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {getDisplayValue(trade.grossPnl, calculatedMetrics?.grossPnl) >=
                0
                  ? "+"
                  : ""}
                $
                {getDisplayValue(
                  trade.grossPnl,
                  calculatedMetrics?.grossPnl
                ).toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-white/60 uppercase tracking-wider">
              Gross Yield
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign size={20} className="text-green-500" />
              <span
                className={`text-2xl font-bold ${
                  getDisplayValue(trade.pnl, calculatedMetrics?.netPnl) >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {getDisplayValue(trade.pnl, calculatedMetrics?.netPnl) >= 0
                  ? "+"
                  : ""}
                $
                {getDisplayValue(trade.pnl, calculatedMetrics?.netPnl).toFixed(
                  2
                )}
              </span>
            </div>
            <div className="text-xs text-white/60 uppercase tracking-wider">
              Net P&L
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Target size={20} className="text-sky-500" />
              <span className="text-2xl font-bold text-white">
                {getDisplayValue(
                  trade.rMultiple,
                  calculatedMetrics?.rMultiple
                ).toFixed(2)}
                R
              </span>
            </div>
            <div className="text-xs text-white/60 uppercase tracking-wider">
              R-Multiple
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Shield size={20} className="text-amber-500" />
              <span className="text-2xl font-bold text-white">
                {getDisplayValue(
                  trade.accountRisk,
                  calculatedMetrics?.accountRisk
                ).toFixed(2)}
                %
              </span>
            </div>
            <div className="text-xs text-white/60 uppercase tracking-wider">
              Account Risk
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Calculator size={20} className="text-purple-500" />
              <span className="text-2xl font-bold text-white">
                $
                {getDisplayValue(
                  trade.riskAmount,
                  calculatedMetrics?.riskAmount
                ).toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-white/60 uppercase tracking-wider">
              Risk Amount
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 size={20} className="text-purple-500" />
              <span className="text-2xl font-bold text-white">
                {getDisplayValue(
                  trade.targetRR,
                  calculatedMetrics?.targetRR
                ).toFixed(1)}{" "}
                : 1
              </span>
            </div>
            <div className="text-xs text-white/60 uppercase tracking-wider">
              Risk-Reward
            </div>
          </div>
        </div>

        {/* Trade Charts Section */}
        <TradeCharts trade={trade} calculatedMetrics={calculatedMetrics} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Trade Details */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <BarChart3 size={20} />
                Trade Execution
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                    Entry Price
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.00001"
                      value={editForm.entryPrice || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          entryPrice: parseFloat(e.target.value),
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                    />
                  ) : (
                    <p className="text-lg font-bold text-white">
                      {trade.entryPrice?.toFixed(5) || "-"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                    Exit Price
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.00001"
                      value={editForm.exitPrice || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          exitPrice: parseFloat(e.target.value),
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                    />
                  ) : (
                    <p className="text-lg font-bold text-white">
                      {trade.exitPrice?.toFixed(5) || "-"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                    Quantity
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.quantity || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          quantity: parseFloat(e.target.value),
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                    />
                  ) : (
                    <p className="text-lg font-bold text-white">
                      {trade.quantity || "-"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                    Stop Loss
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.00001"
                      value={editForm.stopLoss || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          stopLoss: parseFloat(e.target.value),
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                    />
                  ) : (
                    <p className="text-lg font-bold text-white">
                      {trade.stopLoss?.toFixed(5) || "-"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                    Take Profit
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.00001"
                      value={editForm.takeProfit || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          takeProfit: parseFloat(e.target.value),
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                    />
                  ) : (
                    <p className="text-lg font-bold text-white">
                      {trade.takeProfit?.toFixed(5) || "-"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                    Fees
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.fees || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          fees: parseFloat(e.target.value),
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                    />
                  ) : (
                    <p className="text-lg font-bold text-white">
                      ${trade.fees?.toFixed(2) || "0.00"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                    Leverage
                  </label>
                  {isEditing ? (
                    <select
                      value={editForm.leverage || "1:1"}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          leverage: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                    >
                      <option value="1:1">1:1</option>
                      <option value="1:10">1:10</option>
                      <option value="1:20">1:20</option>
                      <option value="1:30">1:30</option>
                      <option value="1:50">1:50</option>
                      <option value="1:100">1:100</option>
                      <option value="1:200">1:200</option>
                      <option value="1:400">1:400</option>
                      <option value="1:500">1:500</option>
                      <option value="1:1000">1:1000</option>
                    </select>
                  ) : (
                    <p className="text-lg font-bold text-white">
                      {trade.leverage || "1:1"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                    Direction
                  </label>
                  {isEditing ? (
                    <select
                      value={editForm.direction || "long"}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          direction: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                    >
                      <option value="long">Long</option>
                      <option value="short">Short</option>
                    </select>
                  ) : (
                    <p className="text-lg font-bold text-white capitalize">
                      {trade.direction || "-"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                    Asset Type
                  </label>
                  {isEditing ? (
                    <select
                      value={editForm.assetType || "forex"}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          assetType: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                    >
                      <option value="forex">Foreign Exchange (Forex)</option>
                      <option value="stock">Stock</option>
                      <option value="crypto">Cryptocurrency</option>
                      <option value="cfd">CFD</option>
                      <option value="futures">Futures</option>
                      <option value="indices">Indices</option>
                    </select>
                  ) : (
                    <p className="text-lg font-bold text-white capitalize">
                      {trade.assetType || "-"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                    Symbol
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.symbol || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          symbol: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                    />
                  ) : (
                    <p className="text-lg font-bold text-white">
                      {trade.symbol || "-"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                    Portfolio Balance
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.portfolioBalance || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          portfolioBalance: parseFloat(e.target.value),
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                    />
                  ) : (
                    <p className="text-lg font-bold text-white">
                      ${trade.portfolioBalance?.toFixed(2) || "0.00"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                    Setup Grade
                  </label>
                  {isEditing ? (
                    <select
                      value={editForm.setupGrade || 3}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          setupGrade: parseInt(e.target.value),
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                    >
                      <option value={1}>1 - Poor</option>
                      <option value={2}>2 - Below Average</option>
                      <option value={3}>3 - Average</option>
                      <option value={4}>4 - Good</option>
                      <option value={5}>5 - Excellent</option>
                    </select>
                  ) : (
                    <p className="text-lg font-bold text-white">
                      {trade.setupGrade || 3}/5
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                    Emotion
                  </label>
                  {isEditing ? (
                    <select
                      value={editForm.emotion || "neutral"}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          emotion: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                    >
                      {EMOTIONS.map((emotion) => (
                        <option key={emotion.value} value={emotion.value}>
                          {emotion.emoji} {emotion.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-lg font-bold text-white capitalize">
                      {EMOTIONS.find((e) => e.value === trade.emotion)?.emoji}{" "}
                      {trade.emotion || "neutral"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                    Outcome
                  </label>
                  {isEditing ? (
                    <select
                      value={editForm.outcome || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          outcome: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none"
                    >
                      <option value="">Select outcome</option>
                      <option value="win">Win</option>
                      <option value="loss">Loss</option>
                      <option value="breakeven">Breakeven</option>
                      <option value="stopped-out">Stopped Out</option>
                      <option value="target-hit">Target Hit</option>
                    </select>
                  ) : (
                    <p className="text-lg font-bold text-white capitalize">
                      {trade.outcome || "-"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                    Entry Time
                  </label>
                  {isEditing ? (
                    <input
                      type="datetime-local"
                      value={
                        editForm.timestampEntry
                          ? new Date(editForm.timestampEntry)
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          timestampEntry: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none text-sm"
                    />
                  ) : (
                    <p className="text-sm font-mono text-white">
                      {new Date(trade.timestampEntry).toLocaleString()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                    Exit Time
                  </label>
                  {isEditing ? (
                    <input
                      type="datetime-local"
                      value={
                        editForm.timestampExit
                          ? new Date(editForm.timestampExit)
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          timestampExit: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500/50 outline-none text-sm"
                    />
                  ) : (
                    <p className="text-sm font-mono text-white">
                      {trade.timestampExit
                        ? new Date(trade.timestampExit).toLocaleString()
                        : "Open"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Notes & Analysis */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8">
              <h3 className="text-xl font-bold mb-6">Trade Notes & Analysis</h3>

              {isEditing ? (
                <textarea
                  value={editForm.notes || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  rows={8}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-sky-500/50 outline-none resize-none"
                  placeholder="Describe your thought process, market conditions, and lessons learned..."
                />
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 min-h-[200px]">
                  <p className="text-white/90 whitespace-pre-wrap leading-relaxed">
                    {trade.notes || "No notes available"}
                  </p>
                </div>
              )}
            </div>

            {/* Comprehensive Trade Data */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8">
              <h3 className="text-xl font-bold mb-6">
                Complete Trade Analysis
              </h3>

              {/* Market Analysis */}
              <div className="space-y-6 mb-8">
                <h4 className="text-lg font-semibold text-sky-400">
                  Market Analysis
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
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
                    <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
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
                    <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
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
                    <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
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
                </div>
              </div>

              {/* Technical Setup */}
              <div className="space-y-6 mb-8">
                <h4 className="text-lg font-semibold text-purple-400">
                  Technical Setup
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
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
                    <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
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
                        placeholder="Enter sessions separated by commas (e.g., London, New York, Asian)"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {(trade.sessions || []).map(
                          (session: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full"
                            >
                              {session}
                            </span>
                          )
                        )}
                        {(!trade.sessions || trade.sessions.length === 0) && (
                          <span className="text-white/60 text-sm italic">
                            None specified
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
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
                    <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
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
                <h4 className="text-lg font-semibold text-amber-400">
                  Risk Management
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
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
                    <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
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
                <h4 className="text-lg font-semibold text-green-400">
                  Performance Analysis
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
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

                {/* Screenshots */}
                <div className="mt-6">
                  <label className="text-xs text-white/60 uppercase tracking-wider block mb-2">
                    Screenshots
                  </label>

                  {isEditing && (
                    <div className="mb-4">
                      <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-white/40 transition-colors">
                        <div className="text-center">
                          <Upload
                            size={24}
                            className="mx-auto mb-2 text-white/60"
                          />
                          <p className="text-sm text-white/60">
                            {uploading
                              ? "Uploading..."
                              : "Click to upload images"}
                          </p>
                        </div>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  )}

                  {(editForm.screenshots || trade.screenshots) &&
                    (editForm.screenshots || trade.screenshots).length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {(editForm.screenshots || trade.screenshots).map(
                          (screenshot: string, i: number) => (
                            <div key={i} className="relative group">
                              <img
                                src={screenshot}
                                alt={`Screenshot ${i + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-white/10 hover:border-white/30 transition-colors cursor-pointer"
                                onClick={() =>
                                  window.open(screenshot, "_blank")
                                }
                              />
                              {isEditing && (
                                <button
                                  onClick={() => removeScreenshot(i)}
                                  className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={12} />
                                </button>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Emotion Tracking */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Heart size={18} className="text-red-500" />
                Emotional State
              </h3>

              {isEditing ? (
                <div className="grid grid-cols-2 gap-3">
                  {EMOTIONS.map((emotion) => (
                    <button
                      key={emotion.value}
                      onClick={() =>
                        setEditForm((prev: any) => ({
                          ...prev,
                          emotion: emotion.value,
                        }))
                      }
                      className={`p-3 rounded-lg border transition-colors text-center min-h-[70px] flex flex-col items-center justify-center ${
                        editForm.emotion === emotion.value
                          ? "bg-sky-500/20 border-sky-500/50 text-sky-400"
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      <div className="text-lg mb-1">{emotion.emoji}</div>
                      <div className="text-[10px] font-medium uppercase tracking-wide leading-tight text-center break-words max-w-full">
                        {emotion.label}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  {trade.emotion ? (
                    <div className="inline-flex items-center gap-3 bg-white/5 rounded-lg p-4">
                      <span className="text-3xl">
                        {EMOTIONS.find((e) => e.value === trade.emotion)
                          ?.emoji || "😐"}
                      </span>
                      <span className="text-lg font-medium capitalize">
                        {trade.emotion}
                      </span>
                    </div>
                  ) : (
                    <div className="text-white/60 italic">
                      No emotion recorded
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Setup Grade */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Star size={18} className="text-yellow-500" />
                Setup Grade
              </h3>

              {isEditing ? (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((grade) => (
                    <button
                      key={grade}
                      onClick={() =>
                        setEditForm((prev: any) => ({ ...prev, setupGrade: grade }))
                      }
                      className={`w-12 h-12 rounded-lg border transition-colors ${
                        editForm.setupGrade === grade
                          ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400"
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {grade === 5
                        ? "A+"
                        : grade === 4
                        ? "A"
                        : grade === 3
                        ? "B"
                        : grade === 2
                        ? "C"
                        : "D"}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${
                      (trade.setupGrade || 0) >= 4
                        ? "bg-green-500/20 text-green-400"
                        : (trade.setupGrade || 0) >= 3
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {trade.setupGrade === 5
                      ? "A+"
                      : trade.setupGrade === 4
                      ? "A"
                      : trade.setupGrade === 3
                      ? "B"
                      : trade.setupGrade === 2
                      ? "C"
                      : trade.setupGrade === 1
                      ? "D"
                      : "-"}
                  </div>
                </div>
              )}
            </div>

            {/* Strategy Info */}
            {trade.strategy && (
              <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4">Strategy Used</h3>
                <div className="flex items-center gap-3 bg-sky-500/10 border border-sky-500/20 rounded-lg p-4">
                  <div className="w-3 h-3 bg-sky-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-sky-400">
                      {trade.strategy.name}
                    </div>
                    <div className="text-xs text-white/60">
                      {trade.strategy.isTemplate ? "Blueprint" : "System"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Commission</span>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.fees || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          fees: parseFloat(e.target.value),
                        })
                      }
                      className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs focus:border-sky-500/50 outline-none"
                    />
                  ) : (
                    <span className="font-mono">
                      ${trade.fees?.toFixed(2) || "0.00"}
                    </span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Gross Yield</span>
                  <span
                    className={`font-mono ${
                      getDisplayValue(
                        trade.grossPnl,
                        calculatedMetrics?.grossPnl
                      ) >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {getDisplayValue(
                      trade.grossPnl,
                      calculatedMetrics?.grossPnl
                    ) >= 0
                      ? "+"
                      : ""}
                    $
                    {getDisplayValue(
                      trade.grossPnl,
                      calculatedMetrics?.grossPnl
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Net Realized Profit</span>
                  <span
                    className={`font-mono font-bold ${
                      getDisplayValue(trade.pnl, calculatedMetrics?.netPnl) >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {getDisplayValue(trade.pnl, calculatedMetrics?.netPnl) >= 0
                      ? "+"
                      : ""}
                    $
                    {getDisplayValue(
                      trade.pnl,
                      calculatedMetrics?.netPnl
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Risk Amount</span>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.riskAmount || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          riskAmount: parseFloat(e.target.value),
                        })
                      }
                      className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-white text-xs focus:border-sky-500/50 outline-none"
                    />
                  ) : (
                    <span className="font-mono">
                      ${trade.riskAmount?.toFixed(2) || "0.00"}
                    </span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Risk % of Account</span>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.accountRisk || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          accountRisk: parseFloat(e.target.value),
                        })
                      }
                      className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-amber-400 text-xs focus:border-sky-500/50 outline-none"
                    />
                  ) : (
                    <span className="font-mono text-amber-400">
                      {trade.accountRisk?.toFixed(2) || "0.00"}%
                    </span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Portfolio Balance</span>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.portfolioBalance || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          portfolioBalance: parseFloat(e.target.value),
                        })
                      }
                      className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-green-400 text-xs focus:border-sky-500/50 outline-none"
                    />
                  ) : (
                    <span className="font-mono text-green-400">
                      ${trade.portfolioBalance?.toFixed(2) || "0.00"}
                    </span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Position Value</span>
                  <span className="font-mono">
                    $
                    {((trade.entryPrice || 0) * (trade.quantity || 0)).toFixed(
                      2
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Risk-Reward Ratio</span>
                  <span className="font-mono text-sky-400">
                    ≈ {trade.targetRR?.toFixed(1) || "0.0"} : 1
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Actual R:R</span>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.actualRR || editForm.rMultiple || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          actualRR: parseFloat(e.target.value),
                          rMultiple: parseFloat(e.target.value),
                        })
                      }
                      className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-purple-400 text-xs focus:border-sky-500/50 outline-none"
                    />
                  ) : (
                    <span className="font-mono text-purple-400">
                      {trade.actualRR?.toFixed(2) ||
                        trade.rMultiple?.toFixed(2) ||
                        "0.00"}
                      R
                    </span>
                  )}
                </div>
                <div className="border-t border-white/10 pt-3 mt-4">
                  <div className="flex justify-between">
                    <span className="text-white/60">Entry Time</span>
                    <span className="font-mono text-xs">
                      {new Date(trade.timestampEntry).toLocaleTimeString()}
                    </span>
                  </div>
                  {trade.timestampExit && (
                    <div className="flex justify-between mt-2">
                      <span className="text-white/60">Exit Time</span>
                      <span className="font-mono text-xs">
                        {new Date(trade.timestampExit).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Share Trade</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-white/60" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <button
                onClick={generatePDF}
                className="w-full flex items-center gap-3 p-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 transition-colors"
              >
                <Download size={20} />
                <div className="text-left">
                  <div className="font-medium">Download PDF</div>
                  <div className="text-sm opacity-80">
                    Complete trade analysis report
                  </div>
                </div>
              </button>

              <button
                onClick={generateTradeCard}
                className="w-full flex items-center gap-3 p-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 transition-colors"
              >
                <ImageIcon size={20} />
                <div className="text-left">
                  <div className="font-medium">Generate Trade Card</div>
                  <div className="text-sm opacity-80">
                    Shareable social media card
                  </div>
                </div>
              </button>

              <button
                onClick={copyTradeLink}
                className="w-full flex items-center gap-3 p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors"
              >
                <Copy size={20} />
                <div className="text-left">
                  <div className="font-medium">Copy Link</div>
                  <div className="text-sm opacity-80">Share trade URL</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-red-500/20 rounded-xl w-full max-w-md p-6">
            <div className="text-center">
              <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Delete Trade
              </h3>
              <p className="text-white/70 mb-6">
                Are you sure you want to delete this trade? This action cannot
                be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
