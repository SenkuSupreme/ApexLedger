import { useMemo } from "react";
import { resampleData } from "./utils";
import { Candle, Timeframe } from "./types";

export const useChartData = (baseData: Candle[], currentTime: number, timeframe: Timeframe) => {
    return useMemo(() => {
         if (baseData.length === 0) return { viewData: [], currentCandle: null };
         
         // Resample
         const tfData = resampleData(baseData, timeframe);
         
         // Filter to Current Time
         const cutOffIndex = tfData.findIndex(d => d.time > currentTime);
         const sliced = cutOffIndex === -1 ? tfData : tfData.slice(0, cutOffIndex);
         
         // Find M1 candle corresponding to currentTime for marker placement accuracy if needed
         // But for the chart visualization, we just need the resampled data up to this point.
         
         return { viewData: sliced };
    }, [baseData, currentTime, timeframe]);
};
