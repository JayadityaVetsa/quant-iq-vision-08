import { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export const WelcomeSection = () => {
  const isMobile = useIsMobile();
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMobile) return;
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const top = rect.top + scrollY;
      const windowHeight = window.innerHeight;
      const sectionCenter = top + rect.height / 2;
      const distance = (scrollY + windowHeight / 2) - sectionCenter;
      setOffset(distance);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  // Parallax: heading moves slower, subtitle moves a bit faster
  const headingStyle = isMobile ? {} : { transform: `translateY(${offset * 0.15}px)` };
  const subtitleStyle = isMobile ? {} : { transform: `translateY(${offset * 0.3}px)` };

  return (
    <div ref={containerRef} className="text-center space-y-6 animate-fadein-down relative overflow-visible">
      <h2
        className="text-4xl md:text-5xl font-extrabold bg-gradient-to-br from-blue-700 via-blue-400 to-slate-800 bg-clip-text text-transparent tracking-tight mb-4 drop-shadow-lg"
        style={headingStyle}
      >
        Welcome to QuantifyIQ
      </h2>
      <p
        className="text-xl md:text-2xl text-slate-700 max-w-2xl mx-auto font-medium leading-relaxed"
        style={subtitleStyle}
      >
        Intuitive portfolio optimization and risk analysis for early investors, students, and retail traders. Get started by creating your portfolio.
      </p>
    </div>
  );
};
