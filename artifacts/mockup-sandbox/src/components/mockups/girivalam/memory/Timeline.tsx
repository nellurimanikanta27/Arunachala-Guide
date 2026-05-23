export function Timeline() {
  return (
    <div className="min-h-screen" style={{
      background: "#FAF5EC", fontFamily: "system-ui, sans-serif",
      maxWidth: 390, margin: "0 auto",
    }}>
      <div className="px-6 pt-14 pb-5">
        <div className="text-[#9B3D12]/60 text-[10px] tracking-widest uppercase mb-1">My Pilgrimage</div>
        <div className="text-[#3A1A08] text-[26px] leading-tight" style={{ fontFamily: "Georgia, serif" }}>
          Three walks around<br/>Arunachala
        </div>
        <div className="text-[#5C3820]/70 text-[12px] mt-2">First walk · 23 May 2026 · Pournami 🌕</div>
      </div>

      <div className="px-4 pb-12 space-y-3">
        {[
          { n: 1, name: "Indra Lingam", time: "5:42 AM", note: "Started in the dark. Cool air. A dog walked with me for the first 100 m.", icon: "🎙️" },
          { n: 2, name: "Agni Lingam", time: "6:38 AM", note: "Sat for 8 min. Wanted to burn away the impatience.", icon: "📷" },
          { n: 3, name: "Yama Lingam", time: "7:21 AM", note: "Sunrise hit just as I arrived. Cried a little.", icon: "❤️" },
          { n: 4, name: "Niruthi Lingam", time: "8:04 AM", note: "Halfway. Tired legs, quiet mind.", icon: "✍️" },
        ].map((m) => (
          <div key={m.n} className="flex gap-3">
            <div className="flex flex-col items-center pt-1">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold"
                style={{ background: "#9B3D12" }}>{m.n}</div>
              <div className="w-px flex-1 mt-1" style={{ background: "rgba(155,61,18,0.25)" }} />
            </div>
            <div className="flex-1 pb-3">
              <div className="flex items-baseline justify-between">
                <div className="text-[#3A1A08] text-[14px] font-medium" style={{ fontFamily: "Georgia, serif" }}>
                  {m.name}
                </div>
                <div className="text-[#5C3820]/60 text-[10px]">{m.time}</div>
              </div>
              <div className="text-[#5C3820]/80 text-[12px] mt-1 leading-snug italic">"{m.note}"</div>
              <div className="text-[10px] text-[#9B3D12]/70 mt-1">{m.icon} saved</div>
            </div>
          </div>
        ))}

        <div className="mt-6 pt-4 px-2 text-center"
          style={{ borderTop: "1px solid rgba(155,61,18,0.15)" }}>
          <div className="text-[#9B3D12]/60 text-[10px] tracking-widest uppercase mb-1">On this day</div>
          <div className="text-[#3A1A08] text-[13px]" style={{ fontFamily: "Georgia, serif" }}>
            One year ago you sat at Varuna Lingam at sunset.
          </div>
          <button className="mt-2 text-[#9B3D12] text-[11px] underline underline-offset-2">
            Read what you wrote
          </button>
        </div>
      </div>
    </div>
  );
}
