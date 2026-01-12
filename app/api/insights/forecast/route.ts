import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchMultiTimeframeData, analyzeMarketMultiTimeframe, isAnalysisStillValid, fetchCurrentPrice } from '@/lib/analysis_engine';
import dbConnect from '@/lib/db';
import Forecast from '@/lib/models/Forecast';

// GET: Retrieve saved forecast from Database
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return new NextResponse('Missing symbol', { status: 400 });
    }

    await dbConnect();
    
    // @ts-ignore
    const existingForecast = await Forecast.findOne({ symbol: symbol.toUpperCase() });

    if (!existingForecast) {
        return NextResponse.json(null); 
    }

    const response = NextResponse.json(existingForecast.analysis);
    
    // Inject Institutional Edge Caching (1 min fresh, 2 min stale-while-revalidate)
    response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    
    return response;

  } catch (error) {
    console.error('[FORECAST_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// POST: Trigger new multi-timeframe analysis (4H, 15M, 5M, 1M)
export async function POST(req: Request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session || !session.user) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
  
       const { symbol, previousAnalysis, force } = await req.json();
  
      if (!symbol) {
        return new NextResponse('Missing symbol', { status: 400 });
      }
  
      // 1. Try to fetch from DB first if not forced
      await dbConnect();
      // @ts-ignore
      const dbForecast = await Forecast.findOne({ symbol: symbol.toUpperCase() });
      
      // Early return if DB data is valid and not forced
      if (!force && dbForecast) {
          // If it's very fresh (< 1 hour), just return it without even checking price if no previousAnalysis was sent
          const age = Date.now() - new Date(dbForecast.updatedAt).getTime();
          if (age < 3600000 && !previousAnalysis) {
              return NextResponse.json(dbForecast.analysis);
          }

          // Otherwise, fetch just the current price for validation (surgical check)
          const currentPrice = await fetchCurrentPrice(symbol);
          
          if (currentPrice > 0) {
              const validity = isAnalysisStillValid(dbForecast.analysis, currentPrice);
              if (validity.valid) {
                  return NextResponse.json(dbForecast.analysis);
              }
          }
      }

      // 2. Perform Full Data Fetch for New Analysis
      const tfData = await fetchMultiTimeframeData(symbol);
      const hasData = Object.values(tfData).some(candles => candles.length > 0);
      if (!hasData) return new NextResponse('API Rate Limit Exhausted', { status: 503 });
      
      const priceAtFetch = tfData['1M'].slice(-1)[0]?.close || tfData['15M'].slice(-1)[0]?.close || 0;

      // 3. Perform Multi-Timeframe SMC Analysis
      const analysis = analyzeMarketMultiTimeframe(symbol.toUpperCase(), tfData);

      await dbConnect();

      // 3. Save to DB (Upsert: Update if exists, Insert if new)
      // @ts-ignore
      await Forecast.findOneAndUpdate(
          { symbol: symbol.toUpperCase() },
          { 
              symbol: symbol.toUpperCase(),
              analysis: analysis,
              updatedAt: new Date()
          },
          { upsert: true, new: true }
      );
  
      return NextResponse.json(analysis);
  
    } catch (error) {
      console.error('[FORECAST_POST]', error);
      return new NextResponse('Internal Error', { status: 500 });
    }
}
