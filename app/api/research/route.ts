import { NextRequest, NextResponse } from "next/server";

// Mock database - in production, use MongoDB or your preferred database
let researchNotes: any[] = [
  {
    _id: "1",
    title: "EUR/USD Technical Analysis - Weekly Outlook",
    content: `The EUR/USD pair has been consolidating within a tight range of 1.0850-1.0950 over the past week. Key resistance at 1.0950 has held firm, while support at 1.0850 continues to provide a floor for the pair.

Technical Indicators:
- RSI: Currently at 52, showing neutral momentum
- MACD: Slight bullish divergence forming
- Moving Averages: Price trading between 20 and 50 EMA

Upcoming Events:
- ECB Meeting Minutes (Thursday)
- US CPI Data (Friday)
- German GDP Preliminary (Friday)

Trading Plan:
- Long above 1.0960 targeting 1.1020
- Short below 1.0840 targeting 1.0780
- Risk management: 2% per trade`,
    category: "technical",
    tags: ["EURUSD", "technical-analysis", "weekly-outlook"],
    isFavorite: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    _id: "2",
    title: "Federal Reserve Policy Impact on USD Pairs",
    content: `Analysis of how recent Fed policy changes are affecting major USD currency pairs and commodities.

Key Points:
- Hawkish stance supporting USD strength
- Impact on emerging market currencies
- Commodity price correlations

The Federal Reserve's recent policy shift towards a more hawkish stance has created significant ripple effects across global currency markets. The USD has strengthened considerably against most major currencies, with particular impact on:

1. EUR/USD: Breaking below key support levels
2. GBP/USD: Facing pressure from both Fed policy and UK economic concerns
3. USD/JPY: Benefiting from interest rate differentials
4. Commodity currencies (AUD, CAD, NZD): Under pressure from strong USD

Trading Implications:
- Look for USD strength continuation
- Monitor commodity price correlations
- Watch for central bank interventions`,
    category: "fundamental",
    tags: ["USD", "federal-reserve", "policy"],
    isFavorite: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const favorites = searchParams.get("favorites") === "true";

    let filteredNotes = [...researchNotes];

    // Filter by category
    if (category && category !== "all") {
      filteredNotes = filteredNotes.filter(note => note.category === category);
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredNotes = filteredNotes.filter(note =>
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower) ||
        note.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filter favorites
    if (favorites) {
      filteredNotes = filteredNotes.filter(note => note.isFavorite);
    }

    return NextResponse.json({
      success: true,
      notes: filteredNotes,
      total: filteredNotes.length
    });

  } catch (error) {
    console.error("Research API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch research notes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newNote = {
      _id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    researchNotes.unshift(newNote);

    return NextResponse.json({
      success: true,
      note: newNote
    });

  } catch (error) {
    console.error("Research POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create research note" },
      { status: 500 }
    );
  }
}