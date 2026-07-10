"use client";

import {useEffect, useRef, useState, type CSSProperties, type ReactNode} from "react";

export function Reveal({children, className = "", delay = 0}: {children: ReactNode; className?: string; delay?: number}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "hidden" | "visible">("idle");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      setState("visible");
      return;
    }
    if (element.getBoundingClientRect().top <= window.innerHeight * 0.92) {
      setState("visible");
      return;
    }
    setState("hidden");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setState("visible");
        observer.disconnect();
      },
      {rootMargin: "0px 0px -8% 0px", threshold: 0.12},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`reveal ${className}`.trim()}
      data-state={state}
      ref={ref}
      style={{"--reveal-delay": `${delay}ms`} as CSSProperties}
    >
      {children}
    </div>
  );
}
