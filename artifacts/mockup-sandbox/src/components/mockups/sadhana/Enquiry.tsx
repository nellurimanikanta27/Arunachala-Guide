import React, { useEffect, useState } from "react";

export function Enquiry() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{ minHeight: "844px", width: "390px", background: "#0A0604" }}
      className="relative flex flex-col items-center justify-center overflow-hidden font-sans text-white mx-auto selection:bg-[#C47A1E]/30"
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap"
        rel="stylesheet"
      />

      {/* Subtle background noise */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')",
        }}
      />

      {/* Main Content */}
      <div
        className={`flex flex-col items-center justify-center transition-all duration-[2000ms] ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <h1
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
          className="text-5xl font-light tracking-wide text-[#FFD98A] mb-16 italic"
        >
          Who am I?
        </h1>

        <button
          className="group relative flex h-24 w-24 items-center justify-center rounded-full border border-[#C47A1E]/30 bg-transparent transition-all duration-700 hover:border-[#FFD98A] hover:bg-[#C47A1E]/5 focus:outline-none focus:ring-1 focus:ring-[#FFD98A]/50"
          aria-label="Sit now"
        >
          <div className="absolute inset-0 rounded-full bg-[#C47A1E] opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-10" />
          <span
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            className="text-lg tracking-widest text-[#FFD98A]/70 transition-colors duration-500 group-hover:text-[#FFD98A]"
          >
            SIT
          </span>
        </button>
      </div>

      {/* Footer Info */}
      <div
        className={`absolute bottom-12 flex flex-col items-center gap-1 transition-opacity duration-[3000ms] delay-500 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="text-xs tracking-widest text-white/30 uppercase">
          12 days · last sit 2h ago
        </p>
        <p className="text-[10px] text-white/20 mt-1">Pournami in 4 days</p>
      </div>

      {/* Subtle Horizon Line (Arunachala) */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-24 transition-opacity duration-[4000ms] delay-1000 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        <svg
          viewBox="0 0 390 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 100V70C40 70 80 85 120 85C170 85 220 50 250 45C280 40 330 65 390 65V100H0Z"
            fill="url(#hill-gradient)"
          />
          <defs>
            <linearGradient
              id="hill-gradient"
              x1="195"
              y1="45"
              x2="195"
              y2="100"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#C47A1E" stopOpacity="0.05" />
              <stop offset="1" stopColor="#0A0604" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
