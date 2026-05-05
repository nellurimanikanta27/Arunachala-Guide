import { useState } from "react";

export function DuringScreen() {
  const [count, setCount] = useState(247);

  return (
    <div
      className="min-h-screen flex flex-col select-none"
      style={{
        background: 'linear-gradient(160deg, #2E0800 0%, #5C1A00 60%, #3A0F00 100%)',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: 390,
        margin: '0 auto',
        cursor: 'pointer',
      }}
      onClick={() => setCount(c => c + 1)}
    >
      {/* Top bar — minimal */}
      <div className="flex items-center justify-between px-6 pt-14 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#C47A1E] animate-pulse" />
          <span className="text-[#C47A1E] text-xs font-medium">Walking · 2 km covered</span>
        </div>
        <span className="text-white/30 text-xs">1 hr 12 min</span>
      </div>

      {/* Giant central tap area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
        {/* Lingam progress */}
        <div className="flex gap-1.5 mb-4">
          {[1,2,3,4,5,6,7,8].map(n => (
            <div
              key={n}
              className={`h-1.5 rounded-full transition-all ${n <= 2 ? 'bg-[#C47A1E] w-5' : 'bg-white/20 w-4'}`}
            />
          ))}
        </div>

        {/* The count — the heart of the screen */}
        <div className="text-center">
          <div
            className="font-bold text-white leading-none mb-2"
            style={{ fontSize: 96, letterSpacing: -2, textShadow: '0 0 60px rgba(196,122,30,0.4)' }}
          >
            {count}
          </div>
          <div className="text-white/30 text-xs tracking-widest uppercase">Tap anywhere to count</div>
        </div>

        {/* Om symbol — breathing */}
        <div className="mt-6 w-20 h-20 rounded-full border border-white/10 flex items-center justify-center"
          style={{ background: 'rgba(155,61,18,0.3)' }}>
          <span className="text-3xl text-white/60">ॐ</span>
        </div>

        <div className="text-white/25 text-xs mt-2 text-center">
          Om Namah Shivaya
        </div>
      </div>

      {/* Near lingam banner — appears when close */}
      <div className="mx-4 mb-4 rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(196,122,30,0.15)', border: '1px solid rgba(196,122,30,0.3)' }}>
        <span className="text-xl">🔴</span>
        <div className="flex-1">
          <div className="text-[#E09A2A] text-sm font-semibold">Approaching Agni Lingam</div>
          <div className="text-white/50 text-xs">South direction · 180m ahead</div>
        </div>
        <span className="text-white/40 text-xs">›</span>
      </div>

      {/* Bottom bar — 3 icons only */}
      <div className="flex items-center justify-around px-8 pb-10 pt-4 border-t border-white/10">
        {/* Water */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(155,61,18,0.4)' }}>
            <span className="text-xl">💧</span>
          </div>
          <span className="text-white/50 text-[10px]">600m</span>
        </div>

        {/* Lingam progress */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(155,61,18,0.4)' }}>
            <span className="text-sm font-bold text-[#C47A1E]">2/8</span>
          </div>
          <span className="text-white/50 text-[10px]">Lingams</span>
        </div>

        {/* Emergency */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(180,20,20,0.5)', border: '1px solid rgba(255,80,80,0.3)' }}>
            <span className="text-xl">🆘</span>
          </div>
          <span className="text-white/50 text-[10px]">Help</span>
        </div>
      </div>
    </div>
  );
}
