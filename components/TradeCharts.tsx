"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface TradeChartsProps {
  trade: any;
  calculatedMetrics?: any;
}

export default function TradeCharts({
  trade,
  calculatedMetrics,
}: TradeChartsProps) {
  // Memoize price movement data to prevent continuous regeneration
  const priceMovementData = useMemo(() => {
    if (!trade.entryPrice) return [];

    const entry = trade.entryPrice;
    const exit = trade.exitPrice || entry;
    const stopLoss = trade.stopLoss || entry * 0.98;
    const takeProfit = trade.takeProfit || entry * 1.02;

    const data = [];
    const steps = 20;

    // Use trade ID as seed for consistent random data
    const seed = trade._id ? parseInt(trade._id.slice(-8), 16) : 12345;
    let random = seed;

    const seededRandom = () => {
      random = (random * 9301 + 49297) % 233280;
      return random / 233280;
    };

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      let price;

      if (trade.exitPrice) {
        // Simulate realistic price movement with seeded random
        const volatility = seededRandom() * 0.002 - 0.001;
        price = entry + (exit - entry) * progress + volatility * entry;
      } else {
        // Open trade - show current unrealized movement
        price = entry + (seededRandom() - 0.5) * 0.01 * entry;
      }

      data.push({
        time: i,
        price: price,
        entry: entry,
        stopLoss: stopLoss,
        takeProfit: takeProfit,
      });
    }

    return data;
  }, [
    trade.entryPrice,
    trade.exitPrice,
    trade.stopLoss,
    trade.takeProfit,
    trade._id,
  ]);

  return (
    <div className="space-y-8">
      {/* Price Movement Chart */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={20} className="text-blue-500" />
          <h3 className="text-lg font-bold text-white">
            Price Movement Analysis
          </h3>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceMovementData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.3}
              />
              <XAxis
                dataKey="time"
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={["dataMin - 0.001", "dataMax + 0.001"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: any, name: any) => [
                  typeof value === "number" ? value.toFixed(5) : value,
                  name,
                ]}
              />

              {/* Reference lines */}
              <Line
                dataKey="entry"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Entry Price"
              />
              <Line
                dataKey="stopLoss"
                stroke="#ef4444"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                name="Stop Loss"
              />
              <Line
                dataKey="takeProfit"
                stroke="#22c55e"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                name="Take Profit"
              />

              {/* Actual price movement */}
              <Line
                dataKey="price"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={false}
                name="Price"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trade Summary Statistics */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-6">Trade Summary</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-xs text-white/60 uppercase tracking-wider mb-1">
              Duration
            </div>
            <div className="text-lg font-bold text-white">
              {trade.timestampExit
                ? `${Math.round(
                    (new Date(trade.timestampExit).getTime() -
                      new Date(trade.timestampEntry).getTime()) /
                      (1000 * 60 * 60)
                  )}h`
                : "Open"}
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-xs text-white/60 uppercase tracking-wider mb-1">
              Position Size
            </div>
            <div className="text-lg font-bold text-white">
              ${((trade.entryPrice || 0) * (trade.quantity || 0)).toFixed(2)}
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-xs text-white/60 uppercase tracking-wider mb-1">
              Max Risk
            </div>
            <div className="text-lg font-bold text-red-400">
              $
              {(calculatedMetrics?.riskAmount || trade.riskAmount || 0).toFixed(
                2
              )}
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-xs text-white/60 uppercase tracking-wider mb-1">
              Fees Paid
            </div>
            <div className="text-lg font-bold text-orange-400">
              ${(trade.fees || 0).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
