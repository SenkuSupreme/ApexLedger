import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Layers, Zap } from "lucide-react";

export default function TradeForm({
  isBacktest = false,
}: {
  isBacktest?: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm();
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [strategies, setStrategies] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/portfolios")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPortfolios(data);
          if (data.length > 0) {
            const defaultPort = data.find((p: any) => p.isDefault) || data[0];
            setValue("portfolioId", defaultPort._id);
          }
        }
      });

    fetch("/api/strategies")
      .then((res) => res.json())
      .then((data) => {
        const stratList = Array.isArray(data) ? data : [];
        setStrategies(stratList);
        // Prompt user if no strategies exist
        if (stratList.length === 0 && !isBacktest) {
           // We can handle this in the UI below
        }
      });
  }, [setValue, isBacktest]);

  const watchedValues = watch();

  // Simple real-time R calc (dirty implementation for speed)
  if (typeof window !== "undefined") {
    const entry = parseFloat(watchedValues.entryPrice);
    const sl = parseFloat(watchedValues.stopLoss);
    const tp = parseFloat(watchedValues.takeProfit);
    const exit = parseFloat(watchedValues.exitPrice);
    const elem = document.getElementById("r-display");

    if (elem && entry && sl) {
      const risk = Math.abs(entry - sl);
      let r = 0;
      if (exit) {
        // realize R
        r =
          (watchedValues.direction === "long" ? exit - entry : entry - exit) /
          risk;
      } else if (tp) {
        // planned R
        r = Math.abs(tp - entry) / risk;
      }
      elem.innerText = r ? `${r.toFixed(2)}R` : "--";
      elem.style.color = r >= 2 ? "#4ade80" : r < 1 ? "#ef4444" : "#fff"; // Green if > 2R, Red if < 1R
    }
  }

  const onSubmit = async (data: any) => {
    // Basic PnL calc if not provided (should be more robust)
    const pnl =
      data.direction === "long"
        ? (data.exitPrice - data.entryPrice) * data.quantity
        : (data.entryPrice - data.exitPrice) * data.quantity;

    // subtract fees
    const finalPnl = pnl - (data.fees || 0);

    // Calculate R-Multiple
    let rMultiple = 0;
    if (data.stopLoss && data.entryPrice) {
      const risk = Math.abs(data.entryPrice - data.stopLoss);
      if (risk > 0) {
        // If executed trade
        if (data.exitPrice) {
          const reward =
            data.direction === "long"
              ? data.exitPrice - data.entryPrice
              : data.entryPrice - data.exitPrice;
          rMultiple = reward / risk;
        }
        // If planning (calculated based on TP)
        else if (data.takeProfit) {
          const plantedReward = Math.abs(data.takeProfit - data.entryPrice);
          rMultiple = plantedReward / risk;
        }
      }
    }

    const payload = {
      ...data,
      pnl: finalPnl,
      rMultiple,
      inBacktest: isBacktest,
    };

    const res = await fetch("/api/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push(isBacktest ? "/backtester" : "/journal");
      router.refresh();
    } else {
      const errorData = await res.json();
      alert(errorData.message || "Error saving trade");
    }
  };

  if (strategies.length === 0 && !isBacktest) {
    return (
      <div className="max-w-2xl bg-[#0A0A0A] p-10 rounded-3xl border border-white/10 text-center space-y-6">
        <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Layers size={32} className="text-amber-400" />
        </div>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">No Strategies Detected</h2>
        <p className="text-gray-400 max-w-sm mx-auto leading-relaxed">
          The institutional ledger requires an active strategy to record execution blueprints. Create your first strategy core before logging trades.
        </p>
        <button
          onClick={() => router.push("/strategies")}
          className="px-8 py-4 bg-white text-black rounded-full font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
        >
          Create Core Strategy
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-2xl bg-[#0A0A0A] p-6 rounded-xl border border-white/10"
    >
      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-[0.2em]">
            Symbol <span className="text-rose-500">*</span>
          </label>
          <input
            {...register("symbol", { required: true })}
            className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-3 text-white focus:border-white/30 outline-none uppercase transition-colors"
            placeholder="EURUSD"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-[0.2em]">
            Asset Type <span className="text-rose-500">*</span>
          </label>
          <select
            {...register("assetType", { required: true })}
            className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-3 text-white focus:border-white/30 outline-none appearance-none"
          >
            <option value="forex">Forex</option>
            <option value="crypto">Crypto</option>
            <option value="stock">Stock</option>
            <option value="cfd">CFD</option>
            <option value="futures">Futures</option>
            <option value="indices">Indices</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-[0.2em]">
            Portfolio <span className="text-rose-500">*</span>
          </label>
          <select
            {...register("portfolioId", { required: true })}
            className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-3 text-white focus:border-white/30 outline-none appearance-none"
          >
            {portfolios.map((p: any) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-[0.2em]">
            Strategy <span className="text-rose-500">*</span>
          </label>
          <select
            {...register("strategyId", { required: true })}
            className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-3 text-white focus:border-white/30 outline-none appearance-none"
          >
            <option value="">Select Strategy</option>
            {strategies.map((s: any) => (
              <option key={s._id} value={s._id}>
                {s.name} {s.isTemplate ? "(Blueprint)" : "(System)"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-[0.2em]">
            Entry Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="datetime-local"
            {...register("timestampEntry", { required: true })}
            className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-3 text-white focus:border-white/30 outline-none font-mono"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-[0.2em]">
            Direction <span className="text-rose-500">*</span>
          </label>
          <select
            {...register("direction", { required: true })}
            className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-3 text-white focus:border-white/30 outline-none appearance-none font-mono"
          >
            <option value="long">LONG</option>
            <option value="short">SHORT</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-[0.2em]">
            Entry Price <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            step="any"
            {...register("entryPrice", { required: true })}
            className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-3 text-white focus:border-white/30 outline-none font-mono"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-[0.2em]">
            Exit Price
          </label>
          <input
            type="number"
            step="any"
            {...register("exitPrice")}
            className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-3 text-white focus:border-white/30 outline-none font-mono"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-[0.2em]">
            Quantity <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            step="any"
            {...register("quantity", { required: true })}
            className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-3 text-white focus:border-white/30 outline-none font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-[0.2em]">
            Bias
          </label>
          <select
            {...register("dailyBias")}
            className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-3 text-white focus:border-white/30 outline-none appearance-none"
          >
            <option value="">Select Bias</option>
            <option value="Bullish">Bullish</option>
            <option value="Bearish">Bearish</option>
            <option value="Bullish Ranging">Bullish Ranging</option>
            <option value="Bearish Ranging">Bearish Ranging</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-[0.2em]">
            Session <span className="text-rose-500">*</span>
          </label>
          <select
            {...register("sessions", { required: true })}
            className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-3 text-white focus:border-white/30 outline-none appearance-none"
          >
            <option value="">Select Session</option>
            <option value="Sydney">Sydney</option>
            <option value="Tokyo">Tokyo</option>
            <option value="London">London</option>
            <option value="New York">New York</option>
            <option value="Asian-London Overlap">Asian-London Overlap</option>
            <option value="London-NY Overlap">London-NY Overlap</option>
            <option value="London Pre-Market">London Pre-Market</option>
            <option value="US Pre-Market">US Pre-Market</option>
            <option value="After Hours">After Hours</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-mono uppercase text-gray-400 mb-2">
            Market Environment
          </label>
          <select
            {...register("marketEnvironment")}
            className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-3 text-white focus:border-white/30 outline-none appearance-none"
          >
            <option value="">Select Environment</option>
            <option value="Trend">Trend</option>
            <option value="Range">Range</option>
            <option value="Volatility">Volatility</option>
            <option value="Expansion">Expansion</option>
            <option value="Consolidation">Consolidation</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-mono uppercase text-gray-400 mb-2">
            Execution Architecture
          </label>
          <select
            {...register("executionArchitecture")}
            className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-3 text-white focus:border-white/30 outline-none appearance-none"
          >
            <option value="">Select Architecture</option>
            <option value="Limit Order">Limit Order</option>
            <option value="Market Execution">Market Execution</option>
            <option value="Aggressive Entry">Aggressive Entry</option>
            <option value="Conservative Entry">Conservative Entry</option>
            <option value="Breakout">Breakout</option>
            <option value="Retest">Retest</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-mono uppercase text-gray-400 mb-2">
            Signal Trigger
          </label>
          <select
            {...register("signalTrigger")}
            className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-3 text-white focus:border-white/30 outline-none appearance-none"
          >
            <option value="">Select Trigger</option>
            <option value="Fair Value Gap">Fair Value Gap</option>
            <option value="Order Block">Order Block</option>
            <option value="Breaker Block">Breaker Block</option>
            <option value="Liquidity Sweep">Liquidity Sweep</option>
            <option value="MTF Alignment">MTF Alignment</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-mono uppercase text-gray-400 mb-2">
            Technical Confluence
          </label>
          <select
            {...register("technicalConfluence")}
            className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-3 text-white focus:border-white/30 outline-none appearance-none"
          >
            <option value="">Select Confluence</option>
            <option value="HTF Bias">HTF Bias</option>
            <option value="Key Level">Key Level</option>
            <option value="Fibonacci">Fibonacci</option>
            <option value="Indicator Cross">Indicator Cross</option>
            <option value="Correlated Asset">Correlated Asset</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 p-4 bg-white/5 rounded-lg border border-white/5">
        <div>
          <label className="block text-xs font-mono uppercase text-gray-400 mb-2">
            Stop Loss
          </label>
          <input
            type="number"
            step="any"
            {...register("stopLoss")}
            className="w-full bg-[#000] border border-white/10 rounded-lg px-3 py-3 text-white focus:border-white/30 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase text-gray-400 mb-2">
            Take Profit
          </label>
          <input
            type="number"
            step="any"
            {...register("takeProfit")}
            className="w-full bg-[#000] border border-white/10 rounded-lg px-3 py-3 text-white focus:border-white/30 outline-none"
          />
        </div>
        <div className="col-span-2 pt-2 border-t border-white/5 flex justify-between items-center">
          <span className="text-xs text-gray-400 font-mono">Risk Analysis</span>
          <div className="flex gap-4 text-xs font-mono">
            <span className="text-gray-400">
              R-Multiple:{" "}
              <span className="text-white font-bold" id="r-display">
                --
              </span>
            </span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono uppercase text-gray-400 mb-2">
          Notes
        </label>
        <textarea
          {...register("notes")}
          rows={4}
          className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-3 text-white focus:border-white/30 outline-none"
          placeholder="Notes"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-mono uppercase text-gray-400">
            Tags
          </label>
          <button
            type="button"
            onClick={async () => {
              const notes = document.querySelector("textarea")?.value;
              if (!notes) return alert("Please enter notes first");

              const res = await fetch("/api/ai/suggest-tags", {
                method: "POST",
                body: JSON.stringify({ notes }),
              });
              const data = await res.json();
              if (data.tags) {
                // Handle new format { tag, confidence }
                const suggestedTags = data.tags.map((t: any) => t.tag || t);

                const currentTags = document.getElementById(
                  "tags-input"
                ) as HTMLInputElement;
                if (currentTags) {
                  const existing = currentTags.value
                    ? currentTags.value.split(",").map((t) => t.trim())
                    : [];
                  const newTags = [...new Set([...existing, ...suggestedTags])];
                  currentTags.value = newTags.join(", ");
                  // trigger change logic if needed
                }
              }
            }}
            className="text-[10px] bg-white/5 border border-white/10 text-gray-400 px-2 py-1 rounded hover:bg-white/10 transition-colors uppercase tracking-wider"
          >
            ✨ AI Suggest
          </button>
        </div>
        <input
          id="tags-input"
          {...register("tags")}
          className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-3 text-white focus:border-white/30 outline-none"
          placeholder="Tags"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-white text-black hover:bg-gray-200 font-bold text-sm transition-colors"
        >
          Save Trade
        </button>
      </div>
    </form>
  );
}
