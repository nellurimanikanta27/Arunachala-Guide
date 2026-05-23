import { useState } from "react";

type Item = {
  key: string;
  label: string;
  sublabel?: string;
  icon: string;
  tint: string;
};

const ITEMS: Item[] = [
  { key: "annaprasadam", label: "Annaprasadam", sublabel: "Free food · donations", icon: "🍛", tint: "#9B3D12" },
  { key: "restaurants",  label: "Restaurants",  sublabel: "Nearby", icon: "🍴", tint: "#8A4A1F" },
  { key: "washrooms",    label: "Washrooms",    sublabel: "Nearest 220 m", icon: "🚻", tint: "#7A4226" },
  { key: "audio",        label: "Audio books",  sublabel: "Ramana · Talks", icon: "📖", tint: "#9B3D12" },
  { key: "music",        label: "Music",        sublabel: "Chants · Bhajans", icon: "🎵", tint: "#8A4A1F" },
  { key: "japa",         label: "Japa counter", sublabel: "247 / 1008", icon: "📿", tint: "#7A4226" },
];

export function EdgePanel() {
  const [open, setOpen] = useState(true);

  return (
    <div
      className="relative min-h-screen overflow-hidden select-none"
      style={{
        background: "linear-gradient(160deg, #2E0800 0%, #5C1A00 60%, #3A0F00 100%)",
        fontFamily: "system-ui, sans-serif",
        maxWidth: 390,
        margin: "0 auto",
      }}
    >
      {/* Walk screen behind */}
      <div className="flex flex-col h-screen">
        <div className="flex items-center justify-between px-6 pt-14 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#C47A1E] animate-pulse" />
            <span className="text-[#C47A1E] text-xs font-medium">Walking · 2 km</span>
          </div>
          <span className="text-white/30 text-xs">1 hr 12 min</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="flex gap-1.5 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className={`h-1.5 rounded-full ${n <= 2 ? "bg-[#C47A1E] w-5" : "bg-white/20 w-4"}`}
              />
            ))}
          </div>

          <div
            className="font-bold text-white leading-none mb-2 text-center"
            style={{ fontSize: 88, letterSpacing: -2, textShadow: "0 0 60px rgba(196,122,30,0.4)" }}
          >
            247
          </div>
          <div className="text-white/30 text-[10px] tracking-widest uppercase">tap anywhere to count</div>

          <div
            className="mt-8 w-20 h-20 rounded-full border border-white/10 flex items-center justify-center"
            style={{ background: "rgba(155,61,18,0.3)" }}
          >
            <span className="text-3xl text-white/60">ॐ</span>
          </div>
        </div>
      </div>

      {/* Backdrop dim when open */}
      {open && (
        <div
          className="absolute inset-0 transition-opacity"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Edge tab — always visible thin handle on the right */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{
            width: 18,
            height: 96,
            background: "rgba(155,61,18,0.55)",
            borderTopLeftRadius: 12,
            borderBottomLeftRadius: 12,
            border: "1px solid rgba(196,122,30,0.35)",
            borderRight: "none",
            color: "rgba(255,255,255,0.7)",
            fontSize: 14,
          }}
        >
          ‹
        </button>
      )}

      {/* The edge panel itself */}
      <div
        className="absolute top-1/2 -translate-y-1/2 right-0 transition-transform"
        style={{
          transform: open ? "translate(0, -50%)" : "translate(110%, -50%)",
          transitionDuration: "260ms",
        }}
      >
        <div
          className="flex flex-col gap-3 py-5 pl-5 pr-4"
          style={{
            background: "rgba(20, 6, 0, 0.85)",
            backdropFilter: "blur(18px)",
            borderTopLeftRadius: 28,
            borderBottomLeftRadius: 28,
            border: "1px solid rgba(196,122,30,0.25)",
            borderRight: "none",
            boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
            width: 220,
          }}
        >
          <div className="flex items-center justify-between mb-1 pl-1">
            <span className="text-white/40 text-[10px] tracking-widest uppercase">Quick</span>
            <button
              onClick={() => setOpen(false)}
              className="text-white/40 text-base leading-none w-6 h-6 flex items-center justify-center"
            >
              ›
            </button>
          </div>

          {ITEMS.map((it) => (
            <button
              key={it.key}
              className="flex items-center gap-3 text-left"
              style={{ background: "transparent" }}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: `${it.tint}`,
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
                }}
              >
                <span className="text-lg">{it.icon}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white/90 text-[13px] font-medium leading-tight">{it.label}</span>
                {it.sublabel && (
                  <span className="text-white/40 text-[10px] leading-tight mt-0.5">{it.sublabel}</span>
                )}
              </div>
            </button>
          ))}

          <div className="pt-2 mt-1 border-t border-white/5 pl-1">
            <span className="text-white/25 text-[9px] tracking-wider uppercase">
              Swipe edge anytime
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
