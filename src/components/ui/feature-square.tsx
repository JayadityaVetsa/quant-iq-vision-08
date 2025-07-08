import React, { useRef, useEffect, useState } from "react";

interface FeatureSquareProps {
  section: "welcome" | "quickstats" | "features" | "metrics";
  children: React.ReactNode;
}

export const FeatureSquare: React.FC<FeatureSquareProps> = ({ section, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Unique styles per section
  let base = "w-full min-h-[220px] md:min-h-[320px] flex items-center justify-center transition-all duration-700 ease-out will-change-transform";
  let style = "";
  switch (section) {
    case "welcome":
      style = "bg-gradient-to-br from-blue-50/80 to-slate-100/80 rounded-3xl shadow-2xl";
      break;
    case "quickstats":
      style = "bg-white/80 rounded-2xl shadow-xl border border-slate-200/60";
      break;
    case "features":
      style = "bg-gradient-to-br from-slate-50/90 to-blue-100/80 rounded-2xl shadow-xl";
      break;
    case "metrics":
      style = "bg-white/90 rounded-2xl shadow-2xl border border-slate-200/60";
      break;
  }

  // Animation
  const anim = visible
    ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
    : "opacity-0 translate-y-12 scale-95 pointer-events-none";

  return (
    <div
      ref={ref}
      className={`${base} ${style} ${anim}`}
      style={{
        transitionProperty: "opacity, transform",
        transitionDuration: "0.7s",
        transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {children}
    </div>
  );
}; 