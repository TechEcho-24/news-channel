"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function TopProgressBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPath = useRef<string>(pathname);

  useEffect(() => {
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;

    // Start progress
    setWidth(0);
    setVisible(true);

    let current = 0;
    timer.current = setInterval(() => {
      current += Math.random() * 15;
      if (current >= 90) {
        current = 90;
        if (timer.current) clearInterval(timer.current);
      }
      setWidth(current);
    }, 120);

    // Complete after short delay
    const finish = setTimeout(() => {
      if (timer.current) clearInterval(timer.current);
      setWidth(100);
      setTimeout(() => setVisible(false), 300);
    }, 600);

    return () => {
      if (timer.current) clearInterval(timer.current);
      clearTimeout(finish);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[3px] bg-blue-600 transition-all duration-200 ease-out shadow-[0_0_8px_rgba(37,99,235,0.7)]"
      style={{ width: `${width}%`, opacity: width === 100 ? 0 : 1, transition: width === 100 ? "opacity 0.3s, width 0.2s" : "width 0.2s" }}
    />
  );
}
