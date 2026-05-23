export function AtBanner() {
  return (
    <div className="min-h-screen flex flex-col" style={{
      background: "linear-gradient(160deg, #1A0500 0%, #3A0F00 60%, #5C1A00 100%)",
      fontFamily: "system-ui, sans-serif", maxWidth: 390, margin: "0 auto",
    }}>
      <div className="flex items-center justify-between px-6 pt-14 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#C47A1E] animate-pulse" />
          <span className="text-[#C47A1E] text-xs font-medium">Walking · 2.0 km</span>
        </div>
        <span className="text-white/30 text-xs">1 hr 12 min</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="flex gap-1.5 mb-6">
          {[1,2,3,4,5,6,7,8].map(n => (
            <div key={n} className={`h-1.5 rounded-full ${n <= 2 ? "bg-[#C47A1E] w-5" : "bg-white/20 w-4"}`} />
          ))}
        </div>
        <div className="font-bold text-white leading-none mb-2 text-center"
          style={{ fontSize: 88, letterSpacing: -2 }}>247</div>
        <div className="text-white/30 text-[10px] tracking-widest uppercase">tap to count</div>
      </div>

      {/* MORPHING BANNER — state 3: ARRIVED (inside 150 m geofence) */}
      <div className="mx-4 mb-6 rounded-2xl overflow-hidden"
        style={{ background: "rgba(155,61,18,0.92)", border: "1px solid rgba(255,200,140,0.35)",
                 boxShadow: "0 0 40px rgba(196,122,30,0.35)" }}>
        <div className="px-5 pt-4 pb-3">
          <div className="text-white/70 text-[10px] tracking-widest uppercase mb-1">You have reached</div>
          <div className="text-white text-[22px] font-semibold leading-tight" style={{ fontFamily: "Georgia, serif" }}>
            Agni Lingam
          </div>
          <div className="text-white/80 text-[13px] mt-2 leading-snug" style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>
            Fire. Sit briefly. What do you want to burn away on this walk?
          </div>
        </div>

        <div className="px-5 pt-3 pb-2" style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          <div className="text-white/65 text-[11px] mb-3">Save this moment</div>
          <div className="flex items-center justify-between">
            {[
              { i: "📷", l: "Photo" },
              { i: "🎙️", l: "Voice" },
              { i: "✍️", l: "Note" },
              { i: "❤️", l: "Feeling" },
            ].map(b => (
              <button key={b.l} className="flex flex-col items-center gap-1.5">
                <div className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.18)" }}>
                  <span className="text-base">{b.i}</span>
                </div>
                <span className="text-white/70 text-[10px]">{b.l}</span>
              </button>
            ))}
          </div>
        </div>

        <button className="w-full py-2.5 text-center text-white/55 text-[11px]"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.12)" }}>
          Just keep walking
        </button>
      </div>
    </div>
  );
}
