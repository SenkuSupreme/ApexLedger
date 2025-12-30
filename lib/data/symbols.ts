// Comprehensive symbol database with asset type mapping
export interface SymbolData {
  symbol: string;
  name: string;
  assetType: 'forex' | 'crypto' | 'cfd' | 'futures' | 'stocks' | 'indices';
  exchange?: string;
  description?: string;
}

export const SYMBOLS_DATABASE: SymbolData[] = [
  // Major Forex Pairs
  { symbol: 'EURUSD', name: 'Euro / US Dollar', assetType: 'forex', description: 'EUR/USD Major Pair' },
  { symbol: 'GBPUSD', name: 'British Pound / US Dollar', assetType: 'forex', description: 'GBP/USD Cable' },
  { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', assetType: 'forex', description: 'USD/JPY Major Pair' },
  { symbol: 'USDCHF', name: 'US Dollar / Swiss Franc', assetType: 'forex', description: 'USD/CHF Swissie' },
  { symbol: 'AUDUSD', name: 'Australian Dollar / US Dollar', assetType: 'forex', description: 'AUD/USD Aussie' },
  { symbol: 'USDCAD', name: 'US Dollar / Canadian Dollar', assetType: 'forex', description: 'USD/CAD Loonie' },
  { symbol: 'NZDUSD', name: 'New Zealand Dollar / US Dollar', assetType: 'forex', description: 'NZD/USD Kiwi' },
  
  // Minor Forex Pairs
  { symbol: 'EURGBP', name: 'Euro / British Pound', assetType: 'forex', description: 'EUR/GBP Cross' },
  { symbol: 'EURJPY', name: 'Euro / Japanese Yen', assetType: 'forex', description: 'EUR/JPY Cross' },
  { symbol: 'GBPJPY', name: 'British Pound / Japanese Yen', assetType: 'forex', description: 'GBP/JPY Cross' },
  { symbol: 'EURCHF', name: 'Euro / Swiss Franc', assetType: 'forex', description: 'EUR/CHF Cross' },
  { symbol: 'EURAUD', name: 'Euro / Australian Dollar', assetType: 'forex', description: 'EUR/AUD Cross' },
  { symbol: 'GBPCHF', name: 'British Pound / Swiss Franc', assetType: 'forex', description: 'GBP/CHF Cross' },
  { symbol: 'AUDCAD', name: 'Australian Dollar / Canadian Dollar', assetType: 'forex', description: 'AUD/CAD Cross' },
  { symbol: 'AUDJPY', name: 'Australian Dollar / Japanese Yen', assetType: 'forex', description: 'AUD/JPY Cross' },
  { symbol: 'CADJPY', name: 'Canadian Dollar / Japanese Yen', assetType: 'forex', description: 'CAD/JPY Cross' },
  { symbol: 'CHFJPY', name: 'Swiss Franc / Japanese Yen', assetType: 'forex', description: 'CHF/JPY Cross' },

  // Major Cryptocurrencies
  { symbol: 'BTCUSD', name: 'Bitcoin / US Dollar', assetType: 'crypto', description: 'Bitcoin' },
  { symbol: 'ETHUSD', name: 'Ethereum / US Dollar', assetType: 'crypto', description: 'Ethereum' },
  { symbol: 'ADAUSD', name: 'Cardano / US Dollar', assetType: 'crypto', description: 'Cardano' },
  { symbol: 'SOLUSD', name: 'Solana / US Dollar', assetType: 'crypto', description: 'Solana' },
  { symbol: 'DOTUSD', name: 'Polkadot / US Dollar', assetType: 'crypto', description: 'Polkadot' },
  { symbol: 'AVAXUSD', name: 'Avalanche / US Dollar', assetType: 'crypto', description: 'Avalanche' },
  { symbol: 'MATICUSD', name: 'Polygon / US Dollar', assetType: 'crypto', description: 'Polygon' },
  { symbol: 'LINKUSD', name: 'Chainlink / US Dollar', assetType: 'crypto', description: 'Chainlink' },
  { symbol: 'UNIUSD', name: 'Uniswap / US Dollar', assetType: 'crypto', description: 'Uniswap' },
  { symbol: 'LTCUSD', name: 'Litecoin / US Dollar', assetType: 'crypto', description: 'Litecoin' },
  { symbol: 'BCHUSD', name: 'Bitcoin Cash / US Dollar', assetType: 'crypto', description: 'Bitcoin Cash' },
  { symbol: 'XRPUSD', name: 'Ripple / US Dollar', assetType: 'crypto', description: 'Ripple' },

  // Major US Stocks
  { symbol: 'AAPL', name: 'Apple Inc.', assetType: 'stocks', exchange: 'NASDAQ', description: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', assetType: 'stocks', exchange: 'NASDAQ', description: 'Microsoft' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', assetType: 'stocks', exchange: 'NASDAQ', description: 'Google' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', assetType: 'stocks', exchange: 'NASDAQ', description: 'Amazon' },
  { symbol: 'TSLA', name: 'Tesla Inc.', assetType: 'stocks', exchange: 'NASDAQ', description: 'Tesla' },
  { symbol: 'META', name: 'Meta Platforms Inc.', assetType: 'stocks', exchange: 'NASDAQ', description: 'Meta (Facebook)' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', assetType: 'stocks', exchange: 'NASDAQ', description: 'NVIDIA' },
  { symbol: 'NFLX', name: 'Netflix Inc.', assetType: 'stocks', exchange: 'NASDAQ', description: 'Netflix' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', assetType: 'stocks', exchange: 'NASDAQ', description: 'AMD' },
  { symbol: 'INTC', name: 'Intel Corporation', assetType: 'stocks', exchange: 'NASDAQ', description: 'Intel' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', assetType: 'stocks', exchange: 'NYSE', description: 'JPMorgan' },
  { symbol: 'BAC', name: 'Bank of America Corp.', assetType: 'stocks', exchange: 'NYSE', description: 'Bank of America' },
  { symbol: 'WMT', name: 'Walmart Inc.', assetType: 'stocks', exchange: 'NYSE', description: 'Walmart' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', assetType: 'stocks', exchange: 'NYSE', description: 'Johnson & Johnson' },
  { symbol: 'PG', name: 'Procter & Gamble Co.', assetType: 'stocks', exchange: 'NYSE', description: 'Procter & Gamble' },

  // Major Indices
  { symbol: 'SPX500', name: 'S&P 500 Index', assetType: 'indices', description: 'S&P 500' },
  { symbol: 'NAS100', name: 'NASDAQ 100 Index', assetType: 'indices', description: 'NASDAQ 100' },
  { symbol: 'US30', name: 'Dow Jones Industrial Average', assetType: 'indices', description: 'Dow Jones' },
  { symbol: 'GER40', name: 'DAX 40 Index', assetType: 'indices', description: 'German DAX' },
  { symbol: 'UK100', name: 'FTSE 100 Index', assetType: 'indices', description: 'UK FTSE 100' },
  { symbol: 'FRA40', name: 'CAC 40 Index', assetType: 'indices', description: 'French CAC 40' },
  { symbol: 'JPN225', name: 'Nikkei 225 Index', assetType: 'indices', description: 'Japanese Nikkei' },
  { symbol: 'AUS200', name: 'ASX 200 Index', assetType: 'indices', description: 'Australian ASX 200' },
  { symbol: 'HK50', name: 'Hang Seng Index', assetType: 'indices', description: 'Hong Kong Hang Seng' },
  { symbol: 'EUSTX50', name: 'Euro Stoxx 50', assetType: 'indices', description: 'Euro Stoxx 50' },

  // Commodities (CFDs)
  { symbol: 'XAUUSD', name: 'Gold / US Dollar', assetType: 'cfd', description: 'Gold CFD' },
  { symbol: 'XAGUSD', name: 'Silver / US Dollar', assetType: 'cfd', description: 'Silver CFD' },
  { symbol: 'USOIL', name: 'US Crude Oil', assetType: 'cfd', description: 'WTI Crude Oil' },
  { symbol: 'UKOIL', name: 'UK Brent Oil', assetType: 'cfd', description: 'Brent Crude Oil' },
  { symbol: 'NATGAS', name: 'Natural Gas', assetType: 'cfd', description: 'Natural Gas CFD' },
  { symbol: 'COPPER', name: 'Copper', assetType: 'cfd', description: 'Copper CFD' },
  { symbol: 'PLATINUM', name: 'Platinum', assetType: 'cfd', description: 'Platinum CFD' },
  { symbol: 'PALLADIUM', name: 'Palladium', assetType: 'cfd', description: 'Palladium CFD' },

  // Futures
  { symbol: 'ES', name: 'E-mini S&P 500 Futures', assetType: 'futures', description: 'ES Futures' },
  { symbol: 'NQ', name: 'E-mini NASDAQ 100 Futures', assetType: 'futures', description: 'NQ Futures' },
  { symbol: 'YM', name: 'E-mini Dow Futures', assetType: 'futures', description: 'YM Futures' },
  { symbol: 'RTY', name: 'E-mini Russell 2000 Futures', assetType: 'futures', description: 'RTY Futures' },
  { symbol: 'CL', name: 'Crude Oil Futures', assetType: 'futures', description: 'CL Futures' },
  { symbol: 'GC', name: 'Gold Futures', assetType: 'futures', description: 'GC Futures' },
  { symbol: 'SI', name: 'Silver Futures', assetType: 'futures', description: 'SI Futures' },
  { symbol: 'NG', name: 'Natural Gas Futures', assetType: 'futures', description: 'NG Futures' },
  { symbol: 'ZN', name: '10-Year Treasury Note Futures', assetType: 'futures', description: 'ZN Futures' },
  { symbol: 'ZB', name: '30-Year Treasury Bond Futures', assetType: 'futures', description: 'ZB Futures' }
];

// Search function for symbols
export function searchSymbols(query: string, limit: number = 10): SymbolData[] {
  if (!query || query.length < 1) return SYMBOLS_DATABASE.slice(0, limit);
  
  const searchTerm = query.toLowerCase();
  
  return SYMBOLS_DATABASE
    .filter(symbol => 
      symbol.symbol.toLowerCase().includes(searchTerm) ||
      symbol.name.toLowerCase().includes(searchTerm) ||
      symbol.description?.toLowerCase().includes(searchTerm)
    )
    .slice(0, limit);
}

// Get asset type for a symbol
export function getAssetTypeForSymbol(symbol: string): string | null {
  const found = SYMBOLS_DATABASE.find(s => s.symbol.toLowerCase() === symbol.toLowerCase());
  return found ? found.assetType : null;
}

// Get symbol details
export function getSymbolDetails(symbol: string): SymbolData | null {
  return SYMBOLS_DATABASE.find(s => s.symbol.toLowerCase() === symbol.toLowerCase()) || null;
}