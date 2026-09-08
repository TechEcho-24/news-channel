"use client";

import { useEffect, useState, useRef } from "react";

type MarketData = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
};

type ApiResponse = {
  sensex: MarketData | null;
  nifty: MarketData | null;
  timestamp: number;
};

function TickerBox({ title, data }: { title: string; data: MarketData | null }) {
  const [flashClass, setFlashClass] = useState("");
  const prevPriceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!data) return;

    if (prevPriceRef.current !== null && prevPriceRef.current !== data.price) {
      // Price changed, trigger flash animation
      if (data.price > prevPriceRef.current) {
        setFlashClass("bg-green-100 transition-none"); // Instant green
      } else {
        setFlashClass("bg-red-100 transition-none"); // Instant red
      }

      // Fade back to normal
      const timer = setTimeout(() => {
        setFlashClass("bg-gray-50 transition-colors duration-1000");
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setFlashClass("bg-gray-50");
    }

    prevPriceRef.current = data.price;
  }, [data]);

  if (!data) {
    return (
      <div className="bg-gray-50 p-3 rounded border border-gray-100 flex flex-col items-center justify-center h-full min-h-[80px]">
        <span className="text-[10px] text-gray-500 font-semibold mb-1 tracking-wider font-inter">{title}</span>
        <div className="w-16 h-4 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  const isPositive = data.isPositive;
  const arrow = isPositive ? "▲" : "▼";
  const colorClass = isPositive ? "text-green-600" : "text-red-600";
  const sign = isPositive ? "+" : "";

  return (
    <div className={`p-3 rounded border border-gray-100 flex flex-col ${flashClass}`}>
      <div className="flex justify-between items-start">
         <span className="text-[10px] text-gray-500 font-semibold mb-1 tracking-wider font-inter">{title}</span>
         <span className="relative flex h-2 w-2 mt-1">
           <span className={`${isPositive ? 'bg-green-400' : 'bg-red-400'} animate-ping absolute inline-flex h-full w-full rounded-full opacity-75`}></span>
           <span className={`relative inline-flex rounded-full h-2 w-2 ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}></span>
         </span>
      </div>
      <span className="font-bold text-lg leading-none mb-1">
        {data.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <span className={`${colorClass} text-[11px] font-semibold flex items-center`}>
        {arrow} {sign}{data.change.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({sign}{data.changePercent.toFixed(2)}%)
      </span>
    </div>
  );
}

export default function MarketTrendsClient() {
  const [marketData, setMarketData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const res = await fetch("/api/market-data", { cache: 'no-store' });
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        if (isMounted) {
          setMarketData(data);
        }
      } catch (error) {
        console.error("Failed to fetch market data:", error);
      }
    };

    // Initial fetch
    fetchData();

    // Poll every 10 seconds
    const intervalId = setInterval(fetchData, 10000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div>
      <h3 className="font-bold capitalize tracking-wider text-sm border-b-2 border-black pb-2 mb-6 font-inter">Live Market</h3>
      <div className="grid grid-cols-2 gap-4">
        <TickerBox title="SENSEX" data={marketData?.sensex || null} />
        <TickerBox title="NIFTY 50" data={marketData?.nifty || null} />
      </div>
    </div>
  );
}
