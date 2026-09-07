"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function LiveClock() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return <div className="w-32 h-4 bg-gray-800 animate-pulse rounded"></div>; // Placeholder to prevent layout shift
  }

  return (
    <div className="font-inter">
      {format(time, "EEEE, MMMM d, yyyy • hh:mm:ss a")}
    </div>
  );
}
