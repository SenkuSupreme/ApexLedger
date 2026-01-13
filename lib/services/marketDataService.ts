// Market Data Service using free APIs with rate limiting
import MarketData from '@/lib/models/MarketData';
import dbConnect from '@/lib/db';

interface MarketDataPoint {
  symbol: string;
  assetType: string;
  price: number;
  bid?: number;
  ask?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  change?: number;
  changePercent?: number;
}

class MarketDataService {
  private rateLimitDelay = 1000; // 1 second between requests
  private lastRequestTime = 0;

  private async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
  }

  // Free Twelve Data API (500 requests/day)
  private async fetchFromTwelveData(symbol: string, assetType: string): Promise<MarketDataPoint | null> {
    try {
      await this.waitForRateLimit();
      
      // Map asset types to Twelve Data formats
      const symbolMap: { [key: string]: string } = {
        'forex': symbol.length === 6 ? `${symbol.slice(0, 3)}/${symbol.slice(3)}` : symbol,
        'crypto': symbol.includes('USD') ? symbol : `${symbol}/USD`,
        'stock': symbol,
        'stocks': symbol,
        'indices': {
          'US100': 'NDX',
          'NAS100': 'NDX',
          'SPX500': 'SPX',
          'US30': 'DJI',
          'GER40': 'DAX',
          'UK100': 'FTSE',
        }[symbol.toUpperCase()] || symbol,
        'cfd': {
          'XAUUSD': 'XAU/USD',
          'XAGUSD': 'XAG/USD',
          'XPTUSD': 'XPT/USD',
          'XPALUSD': 'XPD/USD',
          'USOIL': 'WTI/USD',
          'UKOIL': 'BRENT/USD',
        }[symbol.toUpperCase()] || symbol,
        'futures': symbol
      };

      const mappedSymbol = symbolMap[assetType] || symbol;
      const apiKey = process.env.TWELVE_DATA_API_KEY || 'demo'; // Use demo for testing
      
      const response = await fetch(
        `https://api.twelvedata.com/price?symbol=${mappedSymbol}&apikey=${apiKey}`,
        { 
          headers: { 'User-Agent': 'TradingJournal/1.0' },
          next: { revalidate: 60 } // Cache for 1 minute
        }
      );

      if (!response.ok) {
        console.warn(`Twelve Data API error for ${symbol}: ${response.status}`);
        return null;
      }

      const data = await response.json();
      
      if (data.price) {
        return {
          symbol: symbol.toUpperCase(),
          assetType,
          price: parseFloat(data.price),
        };
      }

      return null;
    } catch (error) {
      console.error(`Error fetching from Twelve Data for ${symbol}:`, error);
      return null;
    }
  }

  // Free Finhub API (60 requests/minute)
  private async fetchFromFinhub(symbol: string, assetType: string): Promise<MarketDataPoint | null> {
    try {
      await this.waitForRateLimit();
      
      if (assetType !== 'stocks' && assetType !== 'stock' && assetType !== 'crypto') {
        return null; // Finhub mainly for stocks and crypto
      }

      const apiKey = process.env.FINHUB_API_KEY || 'demo';
      const endpoint = assetType === 'crypto' 
        ? `https://finnhub.io/api/v1/crypto/candle?symbol=BINANCE:${symbol}USDT&resolution=1&from=${Math.floor(Date.now()/1000) - 3600}&to=${Math.floor(Date.now()/1000)}&token=${apiKey}`
        : `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;

      const response = await fetch(endpoint);
      
      if (!response.ok) {
        console.warn(`Finhub API error for ${symbol}: ${response.status}`);
        return null;
      }

      const data = await response.json();
      
      if (assetType === 'crypto' && data.c && data.c.length > 0) {
        return {
          symbol: symbol.toUpperCase(),
          assetType,
          price: data.c[data.c.length - 1], // Latest close price
          open: data.o[data.o.length - 1],
          high: data.h[data.h.length - 1],
          low: data.l[data.l.length - 1],
          close: data.c[data.c.length - 1],
          volume: data.v[data.v.length - 1]
        };
      } else if ((assetType === 'stocks' || assetType === 'stock') && data.c) {
        return {
          symbol: symbol.toUpperCase(),
          assetType,
          price: data.c,
          open: data.o,
          high: data.h,
          low: data.l,
          close: data.c,
          change: data.d,
          changePercent: data.dp
        };
      }

      return null;
    } catch (error) {
      console.error(`Error fetching from Finhub for ${symbol}:`, error);
      return null;
    }
  }

  async fetchMarketData(symbol: string, assetType: string): Promise<MarketDataPoint | null> {
    try {
      // Primary: Twelve Data
      let data = await this.fetchFromTwelveData(symbol, assetType);
      
      // Secondary Fallback: Finhub (only for stocks/crypto if Twelve Data fails)
      if (!data && (assetType === 'stocks' || assetType === 'stock' || assetType === 'crypto')) {
        data = await this.fetchFromFinhub(symbol, assetType);
      }
      
      return data;
    } catch (error) {
      console.error(`Critical error fetching market data for ${symbol}:`, error);
      return null;
    }
  }

  async saveMarketData(data: MarketDataPoint): Promise<void> {
    try {
      await dbConnect();
      
      await MarketData.create({
        ...data,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error saving market data:', error);
    }
  }

  async getLatestPrice(symbol: string, assetType: string): Promise<number | null> {
    try {
      await dbConnect();
      
      // Check if we have recent data (within 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentData = await MarketData.findOne({
        symbol: symbol.toUpperCase(),
        assetType,
        timestamp: { $gte: fiveMinutesAgo }
      }).sort({ timestamp: -1 });

      if (recentData) {
        return recentData.price;
      }

      // Fetch fresh data
      const freshData = await this.fetchMarketData(symbol, assetType);
      if (freshData) {
        await this.saveMarketData(freshData);
        return freshData.price;
      }

      return null;
    } catch (error) {
      console.error(`Error getting latest price for ${symbol}:`, error);
      return null;
    }
  }

  async updateMultipleSymbols(symbols: { symbol: string; assetType: string }[]): Promise<void> {
    console.log(`Updating ${symbols.length} symbols via Real-Time API...`);
    
    for (const { symbol, assetType } of symbols) {
      try {
        const data = await this.fetchMarketData(symbol, assetType);
        if (data) {
          await this.saveMarketData(data);
          console.log(`Live Update Success | ${symbol}: $${data.price}`);
        }
        
        // Rate limiting delay for API compliance
        await new Promise(resolve => setTimeout(resolve, 1500)); 
      } catch (error) {
        console.error(`Failed live update for ${symbol}:`, error);
      }
    }
  }
}

export const marketDataService = new MarketDataService();