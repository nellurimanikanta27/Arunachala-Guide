export function NearBanner() {
  return (
    <div className="min-h-screen flex flex-col" style={{
      background: "linear-gradient(160deg, #1A0500 0%, #3A0F00 60%, #5C1A00 100%)",
      fontFamily: "system-ui, sans-serif", maxWidth: 390, margin: "0 auto",
    }}>
      <div className="flex items-center justify-between px-6 pt-14 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#C47A1E] animate-pulse" />
          <span className="text-[#C47A1E] text-xs font-medium">Walking · 1.9 km</span>
        </div>
        <span className="text-white/30 text-xs">1 hr 04 min</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="flex gap-1.5 mb-6">
          {[1,2,3,4,5,6,7,8].map(n => (
            <div key={n} className={`h-1.5 rounded-full ${n <= 1 ? "bg-[#C47A1E] w-5" : "bg-white/20 w-4"}`} />
          ))}
        </div>
        <div className="font-bold text-white leading-none mb-2 text-center"
          style={{ fontSize: 88, letterSpacing: -2 }}>231</div>
        <div className="text-white/30 text-[10px] tracking-widest uppercase">tap to count</div>
        <div className="mt-8 w-20 h-20 rounded-full border border-white/10 flex items-center justify-center"
          style={{ background: "rgba(155,61,18,0.3)" }}>
          <span className="text-3xl text-white/60">ॐ</span>
        </div>
      </div>

      {/* MORPHING BANNER — state 2: near (≤300 m), preview opens */}
      <div className="mx-4 mb-6 rounded-2xl px-4 py-4"
        style={{ background: "rgba(196,122,30,0.18)", border: "1px solid rgba(196,122,30,0.35)" }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-[#E09A2A] animate-pulse" />
          <div className="text-[#E09A2A] text-[10px] tracking-widest uppercase font-medium">
            Agni Lingam · 140 m
          </div>
        </div>
        <div className="text-white/90 text-[15px] leading-snug" style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>
          Fire. Sit briefly.
          <br/>What do you want to burn away on this walk?
        </div>
      </div>
    </div>
  );
}
