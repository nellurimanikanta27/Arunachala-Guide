export function BeforeScreen() {
  return (
    <div className="min-h-screen bg-[#FDF8F2] flex flex-col" style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 390, margin: '0 auto' }}>
      {/* Header */}
      <div className="bg-gradient-to-br from-[#5C1A00] to-[#9B3D12] px-5 pt-14 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-white/60 text-xs">ॐ</span>
          <span className="text-white/60 text-xs font-medium tracking-wide">Arunachala Pilgrimage Guide</span>
        </div>
        <div className="text-white text-4xl font-bold tracking-tight mb-1">Girivalam</div>
        <div className="text-white/60 text-sm">Tiruvannamalai, Tamil Nadu</div>
      </div>

      <div className="flex-1 px-4 py-4 flex flex-col gap-3 overflow-auto">
        {/* Sacred Moment Card */}
        <div className="bg-white rounded-2xl p-4 border border-[#EDD8C4] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌔</span>
              <div>
                <div className="text-sm font-semibold text-[#1E0A00]">First Quarter</div>
                <div className="text-xs text-[#9A6040]">Shukla Ekadashi</div>
              </div>
            </div>
            <div className="bg-[#FFF0E6] border border-[#EDD8C4] px-3 py-1.5 rounded-xl">
              <div className="text-xs font-semibold text-[#9B3D12]">Pournami in 3 days · Sat 9 May</div>
            </div>
          </div>
          <div className="h-px bg-[#F5EAE0] mb-3" />
          <div className="text-xs text-[#5C3018] italic leading-relaxed mb-2">
            "Happiness is your nature. It is not wrong to desire it. What is wrong is seeking it outside when it is inside."
          </div>
          <div className="text-xs font-semibold text-[#9B3D12]">— Sri Ramana Maharshi</div>
        </div>

        {/* Mode banner */}
        <div className="bg-[#9B3D12] rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-2xl">🚶</span>
          </div>
          <div className="flex-1">
            <div className="text-white font-bold text-base">Ready to Walk?</div>
            <div className="text-white/70 text-xs mt-0.5">Tap below to begin your Girivalam</div>
          </div>
        </div>

        {/* Begin Walk CTA */}
        <button className="w-full bg-[#5C1A00] rounded-2xl py-5 flex flex-col items-center gap-1 shadow-lg">
          <span className="text-white text-xl font-bold tracking-wide">Begin my Girivalam</span>
          <span className="text-white/60 text-xs">14 km · ~4 hours · Sacred path</span>
        </button>

        {/* Feature rows */}
        <div className="text-[10px] font-semibold text-[#C4956A] tracking-widest mt-1 ml-1">BEFORE YOUR WALK</div>
        {[
          { icon: '📅', title: 'Pournami Calendar', sub: 'Next 12 months of sacred dates' },
          { icon: '🏠', title: 'Where to Stay', sub: 'Ashrams, dharamshalas, lodges' },
          { icon: '🎒', title: 'What to Carry', sub: 'Packing checklist before you go' },
          { icon: '🚌', title: 'How to Reach', sub: 'Routes from Chennai, Bangalore' },
        ].map((f) => (
          <div key={f.title} className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 border border-[#F5EAE0]">
            <span className="text-xl">{f.icon}</span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-[#1E0A00]">{f.title}</div>
              <div className="text-xs text-[#9A6040]">{f.sub}</div>
            </div>
            <span className="text-[#C4956A] text-sm">›</span>
          </div>
        ))}

        <div className="text-center text-xs text-[#C4956A] py-3">ॐ नमः शिवाय · Arunachala Shiva</div>
      </div>
    </div>
  );
}
