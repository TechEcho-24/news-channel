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
  gold: MarketData | null;
  silver: MarketData | null;
  timestamp: number;
};

function TickerItem({ 
  title, 
  data, 
  prefix = "" 
}: { 
  title: string; 
  data: MarketData | null; 
  prefix?: string; 
}) {
  const [flashClass, setFlashClass] = useState("");
  const prevPriceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!data) return;

    if (prevPriceRef.current !== null && prevPriceRef.current !== data.price) {
      if (data.price > prevPriceRef.current) {
        setFlashClass("bg-green-50");
      } else {
        setFlashClass("bg-red-50");
      }
      const timer = setTimeout(() => {
        setFlashClass("transition-colors duration-1000");
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setFlashClass("");
    }
    prevPriceRef.current = data.price;
  }, [data]);

  if (!data) {
    return (
      <div className="flex items-center gap-1.5 pr-8 shrink-0">
        <span className="font-bold text-gray-700 text-xs">{title}</span>
        <div className="w-16 h-3 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  const isPositive = data.isPositive;
  const colorClass = isPositive ? "text-[#3b8744]" : "text-[#d62020]"; // Reuters style green/red
  const sign = isPositive ? "+" : "";
  const Arrow = isPositive ? "▲" : "▼";

  return (
    <div className={`flex items-baseline gap-1.5 pr-8 shrink-0 py-0.5 rounded ${flashClass}`}>
      <span className={`${colorClass} text-[9px] translate-y-[-1px]`}>{Arrow}</span>
      <span className="font-bold text-gray-700 text-[13px]">{title}</span>
      <span className="text-gray-500 text-[13px]">{prefix}{data.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
      <span className={`${colorClass} text-[13px]`}>{sign}{data.changePercent.toFixed(2)}%</span>
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
        if (isMounted) setMarketData(data);
      } catch (error) {
        console.error("Failed to fetch market data:", error);
      }
    };
    fetchData();
    const intervalId = setInterval(fetchData, 10000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="w-full bg-white border-b border-gray-200 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
      <div className="flex items-center w-max min-w-full px-4 py-1.5 font-inter">
        <TickerItem title="SENSEX" data={marketData?.sensex || null} />
        <TickerItem title="NIFTY" data={marketData?.nifty || null} />
        <TickerItem title="GOLD" data={marketData?.gold || null} prefix="₹" />
        <TickerItem title="SILVER" data={marketData?.silver || null} prefix="₹" />
        <span className="text-gray-500 text-[12px] ml-auto flex items-center font-medium pl-8">
           <span className="text-blue-600 text-[10px] mr-1.5">▶</span> Get real-time market data
        </span>
      </div>
    </div>
  );
}
