import { NextRequest, NextResponse } from "next/server";

// Valid public RSS Feeds
const RSS_FEEDS: Record<string, string[]> = {
  forex: [
    "https://www.forexlive.com/feed/news/", 
    "https://www.fxstreet.com/rss/news"
  ],
  crypto: [
    "https://cointelegraph.com/rss",
    "https://www.coindesk.com/arc/outboundfeeds/rss/"
  ],
  stocks: [
    "https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC,^DJI,^IXIC&region=US&lang=en-US",
    "https://www.investing.com/rss/stock_market_reviews.rss"
  ],
  commodities: [
    "https://www.investing.com/rss/commodities.rss",
    "https://custom-feed.kitco.com/feed?format=rss"
  ],
  economics: [
    "https://www.investing.com/rss/economic_indicators.rss",
    "https://tradingeconomics.com/rss/news.aspx"
  ],
  futures: [
     "https://www.investing.com/rss/commodities_fut.rss"
  ]
};

const getImpactLevel = (text: string): "high" | "medium" | "low" => {
    const highImpactKeywords = ["fed", "federal reserve", "interest rate", "inflation", "gdp", "unemployment", "central bank", "cpi", "nfp", "fomc"];
    const mediumImpactKeywords = ["earnings", "economic data", "trade war", "brexit", "election", "meeting", "minutes"];
    const lowerText = text.toLowerCase();
    if (highImpactKeywords.some((keyword) => lowerText.includes(keyword))) return "high";
    if (mediumImpactKeywords.some((keyword) => lowerText.includes(keyword))) return "medium";
    return "low";
};

// Helper to parse RSS XML using simple regex (since we don't have an XML parser lib)
const parseRSS = (xml: string, category: string) => {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemContent = match[1];
    
    // Extract fields
    const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || itemContent.match(/<title>(.*?)<\/title>/);
    const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
    const descMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || itemContent.match(/<description>(.*?)<\/description>/);
    const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/);
    const imageMatch = itemContent.match(/<enclosure[^>]*url=["'](.*?)["'][^>]*>/) || itemContent.match(/<media:content[^>]*url=["'](.*?)["'][^>]*>/);

    if (titleMatch && linkMatch) {
      const title = titleMatch[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#039;/g, "'");
      const description = descMatch ? descMatch[1].replace(/<[^>]*>?/gm, "") : ""; // strip html from desc
      
      items.push({
        title: title.trim(),
        description: description.slice(0, 200) + (description.length > 200 ? "..." : ""),
        url: linkMatch[1],
        urlToImage: imageMatch ? imageMatch[1] : null,
        publishedAt: pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString(),
        source: { name: new URL(linkMatch[1]).hostname.replace('www.','').split('.')[0].toUpperCase() },
        category,
        impact: getImpactLevel(title + " " + description)
      });
    }
  }
  return items;
};

const getMockNews = (category: string) => {
  // ... existing mock function content can essentially stay or be trimmed, 
  // keeping a minimal fallback just in case all fetches fail
  const baseNews = [
    {
      title: "Market data unavailable - System Offline",
      description: "Unable to retrieve real-time intelligence feeds at this moment.",
      url: "#",
      urlToImage: null,
      publishedAt: new Date().toISOString(),
      source: { name: "System" },
      category,
      impact: "low" as "high" | "medium" | "low"
    }
  ];
  return baseNews;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "forex";
    
    // Choose feeds based on category
    // Fallback to forex if category unknown
    const feeds = RSS_FEEDS[category] || RSS_FEEDS.forex;

    const feedPromises = feeds.map(async (url) => {
      try {
        const res = await fetch(url, { next: { revalidate: 300 } }); // cache for 5 mins
        if (!res.ok) return [];
        const txt = await res.text();
        return parseRSS(txt, category);
      } catch (e) {
        console.error(`Error fetching feed ${url}:`, e);
        return [];
      }
    });

    const results = await Promise.all(feedPromises);
    // Flatten and sort by date
    let articles = results.flat().sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Filter duplicates
    const seen = new Set();
    articles = articles.filter(a => {
      const duplicate = seen.has(a.title);
      seen.add(a.title);
      return !duplicate;
    });

    if (articles.length === 0) {
        articles = getMockNews(category);
    }

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