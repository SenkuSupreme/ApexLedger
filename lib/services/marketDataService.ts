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
        'stocks': symbol,
        'indices': symbol,
        'cfd': symbol,
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
      
      if (assetType !== 'stocks' && assetType !== 'crypto') {
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
      } else if (assetType === 'stocks' && data.c) {
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

  // Fallback to mock data for demo purposes
  private generateMockData(symbol: string, assetType: string): MarketDataPoint {
    const basePrice = this.getBasePriceForSymbol(symbol, assetType);
    const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
    const price = basePrice * (1 + variation);
    
    return {
      symbol: symbol.toUpperCase(),
      assetType,
      price: parseFloat(price.toFixed(5)),
      change: parseFloat((basePrice * variation).toFixed(5)),
      changePercent: parseFloat((variation * 100).toFixed(2))
    };
  }

  private getBasePriceForSymbol(symbol: string, assetType: string): number {
    // Mock base prices for common symbols
    const basePrices: { [key: string]: number } = {
      // Forex
      'EURUSD': 1.0850,
      'GBPUSD': 1.2650,
      'USDJPY': 149.50,
      'AUDUSD': 0.6580,
      'USDCAD': 1.3720,
      'USDCHF': 0.8950,
      'NZDUSD': 0.5920,
      'EURGBP': 0.8580,
      
      // Crypto
      'BTCUSD': 43500,
      'ETHUSD': 2650,
      'ADAUSD': 0.48,
      'SOLUSD': 98.50,
      'DOTUSD': 7.20,
      
      // Stocks
      'AAPL': 195.50,
      'GOOGL': 142.80,
      'MSFT': 378.90,
      'TSLA': 248.50,
      'AMZN': 153.40,
      
      // Indices
      'SPX500': 4580.50,
      'NAS100': 16250.30,
      'US30': 37200.80,
      'GER40': 16800.20,
      
      // Default
      'DEFAULT': 100.00
    };

    return basePrices[symbol.toUpperCase()] || basePrices['DEFAULT'];
  }

  async fetchMarketData(symbol: string, assetType: string): Promise<MarketDataPoint | null> {
    try {
      // Try Twelve Data first
      let data = await this.fetchFromTwelveData(symbol, assetType);
      
      // Fallback to Finhub for stocks/crypto
      if (!data && (assetType === 'stocks' || assetType === 'crypto')) {
        data = await this.fetchFromFinhub(symbol, assetType);
      }
      
      // Fallback to mock data for demo
      if (!data) {
        console.log(`Using mock data for ${symbol} (${assetType})`);
        data = this.generateMockData(symbol, assetType);
      }

      return data;
    } catch (error) {
      console.error(`Error fetching market data for ${symbol}:`, error);
      return this.generateMockData(symbol, assetType);
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
    console.log(`Updating ${symbols.length} symbols...`);
    
    for (const { symbol, assetType } of symbols) {
      try {
        const data = await this.fetchMarketData(symbol, assetType);
        if (data) {
          await this.saveMarketData(data);
          console.log(`Updated ${symbol}: $${data.price}`);
        }
        
        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 1200)); // 1.2 seconds between requests
      } catch (error) {
        console.error(`Failed to update ${symbol}:`, error);
      }
    }
  }
}

export const marketDataService = new MarketDataService();