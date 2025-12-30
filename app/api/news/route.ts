import { NextRequest, NextResponse } from "next/server";

// Free news sources and RSS feeds
const NEWS_SOURCES = {
  forex: [
    {
      name: "ForexLive",
      url: "https://www.forexlive.com/feed/",
      type: "rss"
    },
    {
      name: "FXStreet",
      url: "https://www.fxstreet.com/rss",
      type: "rss"
    }
  ],
  crypto: [
    {
      name: "CoinDesk",
      url: "https://feeds.coindesk.com/rss",
      type: "rss"
    }
  ],
  stocks: [
    {
      name: "MarketWatch",
      url: "https://feeds.marketwatch.com/marketwatch/topstories/",
      type: "rss"
    }
  ],
  economics: [
    {
      name: "Reuters Economics",
      url: "https://feeds.reuters.com/reuters/businessNews",
      type: "rss"
    }
  ]
};

// Mock news data for demonstration
const getMockNews = (category: string) => {
  const baseNews = [
    {
      title: "Federal Reserve Signals Potential Rate Changes in Q2",
      description: "The Federal Reserve indicated possible monetary policy adjustments following recent economic data showing mixed signals in inflation and employment metrics.",
      url: "https://www.reuters.com/markets/us/",
      urlToImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop",
      publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      source: { name: "Financial Times" },
      category,
      impact: "high"
    },
    {
      title: "EUR/USD Breaks Key Resistance Level at 1.0950",
      description: "The euro strengthened against the dollar following positive eurozone economic data and dovish comments from Fed officials.",
      url: "https://www.forexlive.com/",
      urlToImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=200&fit=crop",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      source: { name: "Reuters" },
      category,
      impact: "medium"
    },
    {
      title: "Gold Reaches New Monthly High Amid Market Uncertainty",
      description: "Gold prices surged to new monthly highs as investors seek safe-haven assets amid ongoing geopolitical tensions and economic uncertainty.",
      url: "https://www.marketwatch.com/investing/metal/gold",
      urlToImage: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&h=200&fit=crop",
      publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      source: { name: "MarketWatch" },
      category,
      impact: "medium"
    },
    {
      title: "Bitcoin Volatility Increases Ahead of ETF Decision",
      description: "Bitcoin price action shows increased volatility as the market awaits regulatory decisions on spot Bitcoin ETF applications.",
      url: "https://www.coindesk.com/markets/",
      urlToImage: "https://images.unsplash.com/photo-1518544866330-4e4815de2e40?w=400&h=200&fit=crop",
      publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      source: { name: "CoinDesk" },
      category,
      impact: "high"
    },
    {
      title: "Weekly Economic Calendar: Key Events to Watch",
      description: "This week's economic calendar includes important data releases including CPI, GDP, and central bank meetings that could impact market sentiment.",
      url: "https://www.investing.com/economic-calendar/",
      urlToImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=200&fit=crop",
      publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      source: { name: "Economic Times" },
      category,
      impact: "medium"
    }
  ];

  // Filter and customize based on category
  return baseNews.map(article => ({
    ...article,
    category,
    title: category === 'crypto' ? article.title.replace('EUR/USD', 'BTC/USD') : article.title,
    description: category === 'crypto' ? article.description.replace('euro', 'bitcoin') : article.description
  }));
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "forex";

    // For now, return mock data
    // In production, you would implement RSS parsing or use other free APIs
    const articles = getMockNews(category);

    return NextResponse.json({
      success: true,
      articles,
      category,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("News API error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch news",
        articles: getMockNews("forex")
      },
      { status: 500 }
    );
  }
}