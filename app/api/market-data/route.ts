import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

// Revalidate every 5 seconds to prevent excessive caching of live data
export const revalidate = 5;

export async function GET() {
  try {
    // ^BSESN is BSE SENSEX, ^NSEI is NIFTY 50
    const quotes = await yahooFinance.quote(['^BSESN', '^NSEI']) as any[];
    
    if (!quotes || quotes.length === 0) {
      throw new Error("No data returned from Yahoo Finance");
    }

    const formatData = (quote: any) => {
      return {
        symbol: quote.symbol,
        name: quote.shortName || quote.longName || quote.symbol,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        isPositive: quote.regularMarketChange >= 0
      };
    };

    const sensex = quotes.find(q => q.symbol === '^BSESN');
    const nifty = quotes.find(q => q.symbol === '^NSEI');

    return NextResponse.json({
      sensex: sensex ? formatData(sensex) : null,
      nifty: nifty ? formatData(nifty) : null,
      timestamp: Date.now()
    });

  } catch (error: any) {
    console.error("Market Data Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch market data", details: error.message },
      { status: 500 }
    );
  }
}
