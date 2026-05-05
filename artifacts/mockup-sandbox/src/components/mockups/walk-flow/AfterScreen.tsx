export function AfterScreen() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #3A0F00 0%, #5C1A00 40%, #9B3D12 100%)',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: 390,
        margin: '0 auto',
      }}
    >
      {/* Top space */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center pt-20 gap-6">

        {/* Om glow */}
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center mb-2"
          style={{
            background: 'rgba(196,122,30,0.15)',
            border: '2px solid rgba(196,122,30,0.4)',
            boxShadow: '0 0 60px rgba(196,122,30,0.3)',
          }}
        >
          <span style={{ fontSize: 52, color: '#E09A2A' }}>ॐ</span>
        </div>

        {/* Main message — appears slowly in real version */}
        <div>
          <div className="text-white text-3xl font-bold leading-tight mb-3">
            You have walked<br />the full circle.
          </div>
          <div
            className="text-lg font-medium"
            style={{ color: '#E09A2A' }}
          >
            The hill has seen you.
          </div>
        </div>

        {/* Walk summary */}
        <div
          className="w-full rounded-2xl p-5 mt-2"
          style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="text-white/50 text-xs tracking-widest uppercase mb-4">Today's Walk</div>
          <div className="flex justify-around">
            {[
              { value: '14.2 km', label: 'Distance' },
              { value: '3 hr 47 min', label: 'Duration' },
              { value: '312', label: 'Chants' },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="text-white/40 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="h-px bg-white/10 my-4" />
          <div className="flex items-center justify-center gap-2">
            <span style={{ color: '#E09A2A' }}>🙏</span>
            <span className="text-white/60 text-sm">Your 12th Girivalam</span>
          </div>
        </div>

        {/* Ramana quote */}
        <div className="px-2">
          <div className="text-white/50 text-sm italic leading-relaxed">
            "The present moment always will have been. Rest in what is."
          </div>
          <div className="text-[#E09A2A] text-xs mt-2">— Sri Ramana Maharshi</div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="px-5 pb-12 flex flex-col gap-3 mt-4">
        <button
          className="w-full rounded-2xl py-4 flex items-center justify-center gap-3"
          style={{ background: 'rgba(196,122,30,0.25)', border: '1px solid rgba(196,122,30,0.4)' }}
        >
          <span className="text-lg">💚</span>
          <span className="text-white font-semibold">Share with family</span>
        </button>
        <button
          className="w-full rounded-2xl py-4 flex items-center justify-center gap-3"
          style={{ background: 'rgba(0,0,0,0.2)' }}
        >
          <span className="text-lg">🧘</span>
          <span className="text-white/70 font-medium">Rest & Meditate</span>
        </button>

        <div className="text-center text-white/30 text-xs pt-2">
          Arunachala Shiva · ॐ नमः शिवाय
        </div>
      </div>
    </div>
  );
}
