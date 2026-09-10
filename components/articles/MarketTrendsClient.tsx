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

function TickerBox({ 
  title, 
  data, 
  prefix = "", 
  unit = "", 
  bgColor = "bg-gray-50",
  borderColor = "border-gray-100" 
}: { 
  title: string; 
  data: MarketData | null; 
  prefix?: string; 
  unit?: string;
  bgColor?: string;
  borderColor?: string;
}) {
  const [flashClass, setFlashClass] = useState("");
  const prevPriceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!data) return;

    if (prevPriceRef.current !== null && prevPriceRef.current !== data.price) {
      if (data.price > prevPriceRef.current) {
        setFlashClass("bg-green-100 transition-none");
      } else {
        setFlashClass("bg-red-100 transition-none");
      }

      const timer = setTimeout(() => {
        setFlashClass(`${bgColor} transition-colors duration-1000`);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setFlashClass(bgColor);
    }

    prevPriceRef.current = data.price;
  }, [data, bgColor]);

  if (!data) {
    return (
      <div className={`${bgColor} p-2 rounded-md border ${borderColor} flex flex-col items-center justify-center h-full min-h-[64px]`}>
        <span className="text-[9px] text-gray-500 font-semibold mb-1 tracking-wider font-inter">{title}</span>
        <div className="w-12 h-3 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  const isPositive = data.isPositive;
  const arrow = isPositive ? "▲" : "▼";
  const colorClass = isPositive ? "text-green-600" : "text-red-600";
  const sign = isPositive ? "+" : "";

  return (
    <div className={`p-2.5 rounded-md border ${borderColor} flex flex-col ${flashClass}`}>
      <div className="flex justify-between items-start mb-0.5">
        <span className="text-[10px] text-gray-500 font-bold tracking-widest font-inter uppercase">{title}</span>
        <span className="relative flex h-1.5 w-1.5 mt-0.5">
          <span className={`${isPositive ? 'bg-green-400' : 'bg-red-400'} animate-ping absolute inline-flex h-full w-full rounded-full opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}></span>
        </span>
      </div>
      <div className="flex items-baseline gap-1 mb-0.5">
        <span className="font-bold text-base md:text-lg leading-none text-gray-800">
          {prefix}{data.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className={`${colorClass} text-[10px] font-medium flex items-center`}>
          {arrow} {sign}{prefix}{Math.abs(data.change).toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({sign}{data.changePercent.toFixed(2)}%)
        </span>
        {unit && <span className="text-[9px] text-gray-400 font-medium ml-1">{unit}</span>}
      </div>
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

    fetchData();

    // Poll every 10 seconds for real-time market updates
    const intervalId = setInterval(fetchData, 10000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="flex flex-col space-y-4">
      {/* Live Stock Market */}
      <div>
        <h3 className="font-black uppercase tracking-widest text-xs border-b-2 border-gray-200 pb-2 mb-3 font-inter text-gray-900 flex justify-between items-center">
          <span>Live Market</span>
          <span className="text-[10px] font-normal text-gray-400 lowercase">live</span>
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <TickerBox title="SENSEX" data={marketData?.sensex || null} />
          <TickerBox title="NIFTY 50" data={marketData?.nifty || null} />
        </div>
      </div>

      {/* Live Commodities (Gold & Silver) */}
      <div>
        <h3 className="font-black uppercase tracking-widest text-xs border-b-2 border-gray-200 pb-2 mb-3 font-inter text-gray-900 flex justify-between items-center">
          <span>Commodities</span>
          <span className="text-[10px] font-normal text-gray-400 lowercase">real rate</span>
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <TickerBox 
            title="Gold (24K)" 
            data={marketData?.gold || null} 
            prefix="₹" 
            unit="per 10g" 
            bgColor="bg-amber-50/70"
            borderColor="border-amber-200/80"
          />
          <TickerBox 
            title="Silver" 
            data={marketData?.silver || null} 
            prefix="₹" 
            unit="per kg" 
            bgColor="bg-slate-50"
            borderColor="border-slate-200"
          />
        </div>
      </div>
    </div>
  );
}
