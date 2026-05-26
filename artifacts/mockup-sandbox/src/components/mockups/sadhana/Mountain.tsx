import React, { useState } from "react";
import { Moon } from "lucide-react";

export function Mountain() {
  const [isSitting, setIsSitting] = useState(false);
  const [sitTime, setSitTime] = useState(0);
  const streak = 12;

  // Approximate relative coordinates for the 12 lights on the mountain.
  // Using percentages where x is left to right, y is top to bottom relative to the mountain bounds.
  const lights = [
    { x: 30, y: 70 },
    { x: 45, y: 80 },
    { x: 60, y: 65 },
    { x: 75, y: 75 },
    { x: 20, y: 85 },
    { x: 85, y: 90 },
    { x: 35, y: 55 },
    { x: 50, y: 50 },
    { x: 65, y: 45 },
    { x: 55, y: 75 },
    { x: 40, y: 90 },
    { x: 70, y: 85 },
  ];

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&display=swap"
      />
      <div
        style={{ minHeight: "844px", width: "390px", background: "#0A0604" }}
        className="relative flex flex-col items-center overflow-hidden font-sans text-white mx-auto shadow-2xl"
      >
        {/* Subtle noise texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        ></div>

        {/* Ambient background glow */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[#C47A1E] opacity-10 blur-[100px] rounded-full pointer-events-none"></div>

        {/* Top Header */}
        <div className="absolute top-0 w-full pt-14 pb-4 px-6 flex justify-between items-center z-20">
          <div className="flex flex-col">
            <span className="text-[#FFD98A] text-xs font-semibold tracking-widest uppercase opacity-80">
              Sadhana
            </span>
            <span className="font-['Cormorant_Garamond'] text-lg opacity-60">
              {streak} Days
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1 border border-white/10">
            <Moon size={12} className="text-[#FFD98A]" />
            <span className="text-xs text-white/80">Pournami in 4d</span>
          </div>
        </div>

        {/* Main Mountain Area */}
        <div className="relative w-full h-[60%] mt-8 z-10 flex flex-col justify-end">
          <button
            onClick={() => setIsSitting(!isSitting)}
            className="absolute inset-0 w-full h-full focus:outline-none flex flex-col items-center justify-center group"
          >
            {/* The Mountain SVG Silhouette */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute bottom-0 w-[140%] h-[80%] left-1/2 -translate-x-1/2 drop-shadow-2xl transition-transform duration-1000 group-hover:scale-105"
            >
              <defs>
                <linearGradient
                  id="mountainGrad"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#1C110A" />
                  <stop offset="50%" stopColor="#0F0805" />
                  <stop offset="100%" stopColor="#0A0604" />
                </linearGradient>
                <linearGradient
                  id="mountainEdge"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#C47A1E" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#C47A1E" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 100 C 20 90, 35 40, 50 15 C 60 25, 75 80, 100 100 Z"
                fill="url(#mountainGrad)"
                stroke="url(#mountainEdge)"
                strokeWidth="0.5"
              />
            </svg>

            {/* Lights representing streak */}
            {lights.slice(0, streak).map((light, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-[#FFD98A] shadow-[0_0_8px_2px_rgba(255,217,138,0.6)] animate-pulse"
                style={{
                  left: `${light.x}%`,
                  top: `${light.y}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "3s",
                }}
              />
            ))}

            {/* Overlay Text / Interaction */}
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/40 backdrop-blur-sm">
              <span className="font-['Cormorant_Garamond'] text-4xl text-[#FFD98A] mb-2">
                {isSitting ? "Pause" : "Sit"}
              </span>
              <span className="text-xs uppercase tracking-widest text-white/60">
                Tap to {isSitting ? "pause" : "start"}
              </span>
            </div>
            
            {!isSitting && (
               <div className="absolute top-1/4 flex flex-col items-center transition-opacity duration-500 group-hover:opacity-0 pointer-events-none">
                  <span className="text-[#FFD98A] text-sm uppercase tracking-widest mb-1 opacity-50">Arunachala</span>
               </div>
            )}

            {isSitting && (
              <div className="absolute top-1/4 flex flex-col items-center transition-opacity duration-500 pointer-events-none">
                <span className="font-['Cormorant_Garamond'] text-5xl text-[#FFD98A] drop-shadow-lg">
                  {Math.floor(sitTime / 60)}:
                  {(sitTime % 60).toString().padStart(2, "0")}
                </span>
                <span className="text-xs uppercase tracking-widest text-[#FFD98A]/60 mt-2">
                  Sitting
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Bottom Content Area */}
        <div className="relative z-20 flex flex-col items-center justify-center flex-1 px-8 pb-12 text-center">
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#C47A1E]/50 to-transparent mb-8"></div>
          
          <p className="font-['Cormorant_Garamond'] text-2xl italic leading-relaxed text-white/90">
            "Your duty is to be, and not to be this or that."
          </p>
          <span className="mt-4 text-xs font-semibold tracking-widest text-[#C47A1E] uppercase">
            — Ramana Maharshi
          </span>
          
          <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#C47A1E]/50 to-transparent mt-8"></div>
        </div>
      </div>
    </>
  );
}
