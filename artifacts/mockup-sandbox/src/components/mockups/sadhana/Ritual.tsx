import React, { useState } from 'react';
import { Play, Check, Moon, ChevronRight, BookOpen, Clock, Heart } from 'lucide-react';

export function Ritual() {
  const [practices, setPractices] = useState([
    { id: 1, text: 'Self-Enquiry Meditation', sub: '20 min sit', done: true, icon: Clock },
    { id: 2, text: 'Arunachala Shiva Japa', sub: '108 repetitions', done: false, icon: Heart },
    { id: 3, text: 'Read Ramana Gita', sub: '1 verse', done: false, icon: BookOpen }
  ]);

  const togglePractice = (id: number) => {
    setPractices(practices.map(p => p.id === id ? { ...p, done: !p.done } : p));
  };

  // Generate 30 day grid
  const days = Array.from({ length: 30 }, (_, i) => {
    if (i < 12) return 'done';
    if (i === 12) return 'today';
    return 'upcoming';
  });

  return (
    <div style={{ minHeight: '844px', width: '390px', background: '#0A0604' }} className="relative text-white overflow-hidden font-sans flex flex-col">
      {/* Font imports */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .bg-grain { position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.03; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E"); pointer-events: none; z-index: 10; }
        .hide-scroll::-webkit-scrollbar { display: none; }
      `}</style>
      
      <div className="bg-grain"></div>

      {/* Header */}
      <div className="pt-14 pb-6 px-6 flex justify-between items-end relative z-20">
        <div>
          <p className="text-[#FFD98A]/60 text-xs font-medium tracking-widest uppercase mb-1">Thursday, Oct 12</p>
          <h1 className="font-serif text-3xl font-semibold text-[#FFD98A]">Daily Ritual</h1>
        </div>
        <div className="flex flex-col items-center justify-center bg-[#C47A1E]/10 border border-[#C47A1E]/30 rounded-xl px-3 py-1.5">
          <span className="text-xl font-serif text-[#FFD98A] font-medium leading-none">12</span>
          <span className="text-[9px] uppercase tracking-wider text-[#C47A1E]">Streak</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scroll px-6 pb-24 relative z-20">
        
        {/* Today's Practices */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm uppercase tracking-widest text-white/50 font-medium">Today's Check-in</h2>
            <span className="text-xs text-[#C47A1E] font-medium">1 / 3 done</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {practices.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div 
                  key={p.id} 
                  onClick={() => togglePractice(p.id)}
                  className={`flex items-center p-4 cursor-pointer transition-colors ${idx !== practices.length - 1 ? 'border-b border-white/5' : ''} ${p.done ? 'bg-[#C47A1E]/5' : 'hover:bg-white/5'}`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${p.done ? 'bg-[#C47A1E] border-[#C47A1E]' : 'border-white/20'}`}>
                    {p.done && <Check size={14} className="text-[#0A0604] stroke-[3]" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium transition-colors ${p.done ? 'text-white/70 line-through' : 'text-white/90'}`}>{p.text}</p>
                    <p className="text-xs text-white/40 mt-0.5">{p.sub}</p>
                  </div>
                  {p.id === 1 && !p.done && (
                    <button className="h-8 px-3 bg-[#C47A1E] rounded-full flex items-center justify-center text-[#0A0604] text-xs font-semibold">
                      Sit Now
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 40-Day Vow (Mandala) */}
        <section className="mb-8">
          <div className="bg-gradient-to-br from-[#1c130d] to-[#0f0906] border border-[#C47A1E]/20 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#FFD98A" strokeWidth="1">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2v20M2 12h20"></path>
                <circle cx="12" cy="12" r="4"></circle>
              </svg>
            </div>
            
            <p className="text-[10px] uppercase tracking-widest text-[#FFD98A]/60 mb-1">Mandala Vow</p>
            <h3 className="font-serif text-xl text-[#FFD98A] mb-4">40 Days of Arunachala Shiva</h3>
            
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm text-white/60">Day 12 of 40</span>
              <span className="text-sm font-medium text-[#C47A1E]">30%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#C47A1E] rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>
        </section>

        {/* 30 Day Streak Grid */}
        <section className="mb-8">
          <h2 className="text-sm uppercase tracking-widest text-white/50 font-medium mb-4">Activity Log</h2>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="grid grid-cols-7 gap-2">
              {days.map((status, i) => (
                <div 
                  key={i} 
                  className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-medium
                    ${status === 'done' ? 'bg-[#C47A1E] text-[#0A0604]' : 
                      status === 'today' ? 'border border-[#C47A1E] text-[#C47A1E]' : 
                      'bg-white/5 text-transparent'}`
                  }
                >
                  {status === 'done' && <Check size={10} strokeWidth={3} />}
                  {status === 'today' && i+1}
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-white/40 mt-4">October 2023</p>
          </div>
        </section>

        {/* Ramana Quote */}
        <section className="mb-4">
          <div className="border border-white/10 p-6 rounded-2xl bg-gradient-to-b from-white/5 to-transparent text-center">
            <p className="font-serif text-lg text-white/90 italic leading-snug mb-4">
              "Your duty is to be; and not to be this or that. 'I am that I am' sums up the whole truth."
            </p>
            <p className="text-xs text-[#FFD98A]/70 uppercase tracking-widest">— Sri Ramana Maharshi</p>
          </div>
        </section>
      </div>

      {/* Footer - Pournami Reminder */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0A0604] via-[#0A0604] to-transparent z-30">
        <div className="flex items-center justify-center space-x-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full py-3 px-6">
          <Moon size={16} className="text-[#FFD98A]" />
          <span className="text-sm text-white/80 font-medium">Pournami in 4 days</span>
          <ChevronRight size={16} className="text-white/40" />
        </div>
      </div>
    </div>
  );
}
