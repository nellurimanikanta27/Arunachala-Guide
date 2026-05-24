import { useState } from "react";

/**
 * Tracking Screen — mockup of the new "one-screen pilgrimage" spec.
 *
 * Hard rule: once a walk starts, the pilgrim never leaves this screen.
 * Everything (japa, audio, capture, utilities, temple info) opens as an
 * overlay on top of the map. Session ends only on manual End or completion.
 */

const TERRACOTTA = "#9B3D12";
const TERRACOTTA_SOFT = "#C47A1E";
const CREAM = "#F8F1E7";
const INK = "#2B1810";

type TempleState = "done" | "current" | "upcoming";
const TEMPLES: { name: string; state: TempleState }[] = [
  { name: "Indra", state: "done" },
  { name: "Agni", state: "done" },
  { name: "Yama", state: "current" },
  { name: "Niruthi", state: "upcoming" },
  { name: "Varuna", state: "upcoming" },
  { name: "Vayu", state: "upcoming" },
  { name: "Kubera", state: "upcoming" },
  { name: "Esanya", state: "upcoming" },
];

type Overlay = null | "japa" | "audio" | "plus" | "utilities" | "temple" | "geofence";

export function TrackingScreen() {
  const [overlay, setOverlay] = useState<Overlay>("geofence");
  const [japaCount, setJapaCount] = useState(247);

  const completed = TEMPLES.filter((t) => t.state === "done").length;

  return (
    <div
      className="relative overflow-hidden select-none"
      style={{
        width: 390,
        height: 844,
        margin: "0 auto",
        background: CREAM,
        fontFamily: "system-ui, sans-serif",
        color: INK,
        borderRadius: 32,
        boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
      }}
    >
      {/* ─────────── TOP HEADER ─────────── */}
      <div
        style={{
          paddingTop: 50,
          paddingLeft: 18,
          paddingRight: 14,
          paddingBottom: 12,
          background: "linear-gradient(180deg, #FFFFFF 0%, #FDF6EB 100%)",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <div className="flex items-center justify-between">
          {/* Left: KM covered */}
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: INK, lineHeight: 1 }}>
              4.2 <span style={{ fontSize: 12, color: "#8A6E5C", fontWeight: 500 }}>km</span>
            </div>
            <div style={{ fontSize: 10, color: "#8A6E5C", marginTop: 2, letterSpacing: 0.3 }}>
              of 14 km · Girivalam
            </div>
          </div>

          {/* Right: timer + End */}
          <div className="flex items-center gap-2">
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: INK, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                1:24:08
              </div>
              <div style={{ fontSize: 9, color: "#8A6E5C", marginTop: 2, letterSpacing: 0.4 }}>
                LIVE SESSION
              </div>
            </div>
            <button
              style={{
                marginLeft: 6,
                padding: "8px 12px",
                borderRadius: 14,
                background: "rgba(155,61,18,0.08)",
                color: TERRACOTTA,
                fontSize: 11,
                fontWeight: 600,
                border: "none",
              }}
            >
              End
            </button>
          </div>
        </div>

        {/* ─────────── 8-TEMPLE PROGRESS STRIP ─────────── */}
        <div className="mt-3 flex items-center gap-1.5">
          <div className="flex-1 flex items-center">
            {TEMPLES.map((t, i) => {
              const isDone = t.state === "done";
              const isCurrent = t.state === "current";
              return (
                <div key={t.name} className="flex items-center" style={{ flex: 1 }}>
                  {/* dot */}
                  <div
                    style={{
                      width: isCurrent ? 14 : 10,
                      height: isCurrent ? 14 : 10,
                      borderRadius: 99,
                      background: isDone
                        ? TERRACOTTA
                        : isCurrent
                        ? TERRACOTTA
                        : "rgba(0,0,0,0.12)",
                      boxShadow: isCurrent
                        ? `0 0 0 4px rgba(155,61,18,0.18), 0 0 14px rgba(155,61,18,0.5)`
                        : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {isDone && (
                      <span style={{ color: "white", fontSize: 7, fontWeight: 700 }}>✓</span>
                    )}
                  </div>
                  {/* connector */}
                  {i < TEMPLES.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        background:
                          t.state === "done"
                            ? TERRACOTTA
                            : "rgba(0,0,0,0.08)",
                        marginLeft: 2,
                        marginRight: 2,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: TERRACOTTA,
              background: "rgba(155,61,18,0.08)",
              padding: "3px 7px",
              borderRadius: 8,
              marginLeft: 4,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {completed}/8
          </div>
        </div>

        <div style={{ fontSize: 10, color: "#8A6E5C", marginTop: 6, letterSpacing: 0.2 }}>
          Approaching <span style={{ color: TERRACOTTA, fontWeight: 600 }}>Yama Lingam</span> · 180 m
        </div>
      </div>

      {/* ─────────── MAP AREA (middle, fills) ─────────── */}
      <div
        style={{
          position: "absolute",
          top: 152,
          bottom: 92,
          left: 0,
          right: 0,
          background:
            "radial-gradient(ellipse at 55% 45%, #E8DCC4 0%, #D9C9A8 45%, #C9B68A 100%)",
          overflow: "hidden",
        }}
      >
        {/* Faux contour rings (the mountain) */}
        {[180, 140, 100, 60].map((r, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "55%",
              width: r * 2,
              height: r * 2,
              marginLeft: -r,
              marginTop: -r,
              borderRadius: "50%",
              border: "1px solid rgba(120,80,40,0.18)",
            }}
          />
        ))}
        {/* Mountain label */}
        <div
          style={{
            position: "absolute",
            top: "47%",
            left: "55%",
            transform: "translate(-50%, -50%)",
            fontSize: 11,
            fontWeight: 700,
            color: "rgba(120,80,40,0.55)",
            letterSpacing: 1.5,
          }}
        >
          ARUNACHALA
        </div>

        {/* Route path (svg arc around) */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          viewBox="0 0 390 600"
          preserveAspectRatio="none"
        >
          <path
            d="M 60 460 Q 40 300, 100 180 Q 220 90, 330 170 Q 380 290, 320 430 Q 220 510, 90 480"
            fill="none"
            stroke={TERRACOTTA}
            strokeWidth="3"
            strokeDasharray="0"
            opacity="0.9"
          />
          <path
            d="M 60 460 Q 40 300, 100 180 Q 220 90, 330 170 Q 380 290, 320 430 Q 220 510, 90 480"
            fill="none"
            stroke="white"
            strokeWidth="6"
            strokeDasharray="2,8"
            opacity="0.6"
          />
        </svg>

        {/* Temple pins */}
        {[
          { x: "16%", y: "75%", done: true },
          { x: "26%", y: "30%", done: true },
          { x: "58%", y: "13%", done: false, current: true },
          { x: "84%", y: "30%", done: false },
          { x: "85%", y: "68%", done: false },
          { x: "60%", y: "85%", done: false },
          { x: "38%", y: "87%", done: false },
          { x: "12%", y: "55%", done: false },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y,
              transform: "translate(-50%, -50%)",
              width: p.current ? 18 : 12,
              height: p.current ? 18 : 12,
              borderRadius: 99,
              background: p.done ? TERRACOTTA : p.current ? TERRACOTTA : "white",
              border: `2px solid ${TERRACOTTA}`,
              boxShadow: p.current
                ? `0 0 0 6px rgba(155,61,18,0.25), 0 0 18px rgba(155,61,18,0.6)`
                : "0 2px 4px rgba(0,0,0,0.2)",
            }}
          />
        ))}

        {/* User location dot */}
        <div
          style={{
            position: "absolute",
            left: "48%",
            top: "20%",
            transform: "translate(-50%, -50%)",
            width: 16,
            height: 16,
            borderRadius: 99,
            background: "#2E7CF6",
            border: "3px solid white",
            boxShadow: "0 0 0 8px rgba(46,124,246,0.18), 0 2px 6px rgba(0,0,0,0.3)",
          }}
        />

        {/* Floating memory thumbnails along route */}
        {[
          { x: "20%", y: "70%", emoji: "📷" },
          { x: "24%", y: "45%", emoji: "🎙️" },
          { x: "30%", y: "25%", emoji: "📷" },
        ].map((m, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: m.x,
              top: m.y,
              transform: "translate(-50%, -50%)",
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "white",
              border: `2px solid ${TERRACOTTA}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
          >
            {m.emoji}
          </div>
        ))}

        {/* Re-center FAB */}
        <button
          style={{
            position: "absolute",
            right: 12,
            top: 12,
            width: 36,
            height: 36,
            borderRadius: 18,
            background: "white",
            border: "none",
            fontSize: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          📍
        </button>
      </div>

      {/* ─────────── BOTTOM NAV — 4 BUTTONS ─────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 92,
          background: "white",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          paddingBottom: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          paddingLeft: 8,
          paddingRight: 8,
        }}
      >
        <NavBtn icon="📿" label="Japa" active={overlay === "japa"} onClick={() => setOverlay(overlay === "japa" ? null : "japa")} />
        <NavBtn icon="🎵" label="Audio" active={overlay === "audio"} onClick={() => setOverlay(overlay === "audio" ? null : "audio")} />
        <PlusBtn active={overlay === "plus"} onClick={() => setOverlay(overlay === "plus" ? null : "plus")} />
        <NavBtn icon="🧭" label="Utilities" active={overlay === "utilities"} onClick={() => setOverlay(overlay === "utilities" ? null : "utilities")} />
      </div>

      {/* ─────────── OVERLAYS ─────────── */}
      {overlay === "geofence" && (
        <GeofencePopup
          onOpen={() => setOverlay("temple")}
          onDismiss={() => setOverlay(null)}
        />
      )}
      {overlay === "japa" && (
        <JapaOverlay count={japaCount} setCount={setJapaCount} onClose={() => setOverlay(null)} />
      )}
      {overlay === "audio" && <AudioOverlay onClose={() => setOverlay(null)} />}
      {overlay === "plus" && <PlusSheet onClose={() => setOverlay(null)} />}
      {overlay === "utilities" && <UtilitiesOverlay onClose={() => setOverlay(null)} />}
      {overlay === "temple" && <TempleInfoOverlay onClose={() => setOverlay(null)} />}

      {/* Hint badge: "you are inside one session" */}
      {!overlay && (
        <div
          style={{
            position: "absolute",
            bottom: 100,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(43,24,16,0.85)",
            color: "white",
            fontSize: 9,
            padding: "4px 10px",
            borderRadius: 99,
            letterSpacing: 0.4,
          }}
        >
          Session active · everything stays here
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
function NavBtn({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        background: "transparent",
        border: "none",
        padding: 6,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          background: active ? "rgba(155,61,18,0.1)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 17,
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontSize: 9.5,
          color: active ? TERRACOTTA : "#8A6E5C",
          fontWeight: active ? 600 : 500,
        }}
      >
        {label}
      </span>
    </button>
  );
}

function PlusBtn({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 54,
        height: 54,
        borderRadius: 27,
        background: TERRACOTTA,
        color: "white",
        border: "none",
        fontSize: 28,
        fontWeight: 300,
        marginTop: -22,
        boxShadow: "0 8px 20px rgba(155,61,18,0.4)",
        transform: active ? "rotate(45deg)" : "none",
        transition: "transform 0.2s",
      }}
    >
      +
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────
function Sheet({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(2px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 92,
          background: "white",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 20,
          paddingBottom: 24,
          boxShadow: "0 -10px 30px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ width: 36, height: 4, background: "rgba(0,0,0,0.15)", borderRadius: 99, margin: "0 auto 14px" }} />
        <div className="flex items-center justify-between mb-3">
          <div style={{ fontSize: 15, fontWeight: 700, color: INK }}>{title}</div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", fontSize: 18, color: "#8A6E5C" }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </>
  );
}

function JapaOverlay({
  count,
  setCount,
  onClose,
}: {
  count: number;
  setCount: (n: number) => void;
  onClose: () => void;
}) {
  return (
    <Sheet onClose={onClose} title="Japa counter">
      <div
        style={{
          textAlign: "center",
          padding: "14px 0",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, color: TERRACOTTA, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
          {count}
        </div>
        <div style={{ fontSize: 11, color: "#8A6E5C", marginTop: 4, letterSpacing: 1 }}>
          OF 1008
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
            marginTop: 18,
          }}
        >
          <RoundBtn label="−" onClick={() => setCount(Math.max(0, count - 1))} />
          <button
            onClick={() => setCount(count + 1)}
            style={{
              flex: 1,
              maxWidth: 200,
              height: 56,
              borderRadius: 28,
              background: TERRACOTTA,
              color: "white",
              border: "none",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Tap to count
          </button>
          <RoundBtn label="↺" onClick={() => setCount(0)} />
        </div>
      </div>
    </Sheet>
  );
}

function RoundBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        border: "1px solid rgba(0,0,0,0.1)",
        background: "white",
        fontSize: 16,
        color: INK,
      }}
    >
      {label}
    </button>
  );
}

function AudioOverlay({ onClose }: { onClose: () => void }) {
  const tracks = [
    { kind: "🕉️", title: "Om Namah Shivaya", sub: "Chant · 108 reps" },
    { kind: "📖", title: "Talks with Ramana", sub: "Audiobook · 3 hr 12 min" },
    { kind: "🎶", title: "Arunachala Bhajans", sub: "Music · 14 tracks" },
    { kind: "🌿", title: "Forest at dawn", sub: "Ambient · 45 min" },
  ];
  return (
    <Sheet onClose={onClose} title="Audio">
      <div className="flex flex-col gap-2">
        {tracks.map((t) => (
          <div
            key={t.title}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ fontSize: 20 }}>{t.kind}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{t.title}</div>
              <div style={{ fontSize: 11, color: "#8A6E5C", marginTop: 1 }}>{t.sub}</div>
            </div>
            <button
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                background: TERRACOTTA,
                color: "white",
                border: "none",
                fontSize: 11,
              }}
            >
              ▶
            </button>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 10, color: "#8A6E5C", textAlign: "center", marginTop: 10 }}>
        Plays under the map · mini-player stays
      </div>
    </Sheet>
  );
}

function PlusSheet({ onClose }: { onClose: () => void }) {
  const actions = [
    { icon: "✍️", label: "Quick note", sub: "Saved to this session" },
    { icon: "📷", label: "Photo", sub: "GPS + time stamped" },
    { icon: "🎥", label: "Video", sub: "GPS + time stamped" },
  ];
  return (
    <Sheet onClose={onClose} title="Capture this moment">
      <div className="flex flex-col gap-2">
        {actions.map((a) => (
          <button
            key={a.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 14,
              borderRadius: 12,
              border: `1px solid rgba(155,61,18,0.15)`,
              background: "rgba(155,61,18,0.04)",
              textAlign: "left",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 17,
              }}
            >
              {a.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{a.label}</div>
              <div style={{ fontSize: 11, color: "#8A6E5C", marginTop: 1 }}>{a.sub}</div>
            </div>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

function UtilitiesOverlay({ onClose }: { onClose: () => void }) {
  const items = [
    { icon: "💧", label: "Water", nearest: "120 m" },
    { icon: "🚻", label: "Toilets", nearest: "220 m" },
    { icon: "🍛", label: "Annaprasadam", nearest: "Yama Lingam" },
    { icon: "🍴", label: "Restaurants", nearest: "650 m" },
    { icon: "🏛️", label: "Ashramas", nearest: "1.1 km" },
  ];
  return (
    <Sheet onClose={onClose} title="Nearby essentials">
      <div className="grid grid-cols-2 gap-2">
        {items.map((it) => (
          <button
            key={it.label}
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.06)",
              background: "white",
              textAlign: "left",
            }}
          >
            <div style={{ fontSize: 22 }}>{it.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: INK, marginTop: 6 }}>{it.label}</div>
            <div style={{ fontSize: 10, color: TERRACOTTA, marginTop: 2 }}>Nearest · {it.nearest}</div>
          </button>
        ))}
      </div>
      <div style={{ fontSize: 10, color: "#8A6E5C", textAlign: "center", marginTop: 10 }}>
        Tap a category to pin them on the map
      </div>
    </Sheet>
  );
}

function GeofencePopup({ onOpen, onDismiss }: { onOpen: () => void; onDismiss: () => void }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 160,
        left: 12,
        right: 12,
        background: "white",
        borderRadius: 16,
        padding: 14,
        boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
        border: `1px solid rgba(155,61,18,0.2)`,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          background: TERRACOTTA,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
        }}
      >
        🛕
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: "#8A6E5C" }}>Approaching</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>Yama Lingam</div>
      </div>
      <button
        onClick={onOpen}
        style={{
          padding: "8px 12px",
          background: TERRACOTTA,
          color: "white",
          fontSize: 11,
          fontWeight: 600,
          border: "none",
          borderRadius: 12,
        }}
      >
        Know
      </button>
      <button
        onClick={onDismiss}
        style={{
          background: "transparent",
          border: "none",
          fontSize: 16,
          color: "#8A6E5C",
          marginLeft: -4,
        }}
      >
        ✕
      </button>
    </div>
  );
}

function TempleInfoOverlay({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          bottom: 92,
          background: CREAM,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Hero */}
        <div
          style={{
            height: 180,
            background: `linear-gradient(180deg, #7A2E0E, ${TERRACOTTA})`,
            position: "relative",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              width: 32,
              height: 32,
              borderRadius: 16,
              background: "rgba(0,0,0,0.3)",
              color: "white",
              border: "none",
              fontSize: 14,
            }}
          >
            ✕
          </button>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", letterSpacing: 1.2 }}>
            3RD LINGAM · SOUTH
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "white", marginTop: 2 }}>
            Yama Lingam
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 2, fontStyle: "italic" }}>
            யம லிங்கம் · Lord of death
          </div>
        </div>

        <div style={{ padding: 20, overflow: "auto", flex: 1 }}>
          <div style={{ fontSize: 10, color: TERRACOTTA, letterSpacing: 1.2, fontWeight: 600 }}>
            SIGNIFICANCE
          </div>
          <div style={{ fontSize: 13, color: INK, lineHeight: 1.55, marginTop: 6 }}>
            Sacred to Yama, the guardian of dharma. Pilgrims pause here to remember that this body
            is temporary and that the walk itself — not the arrival — is the offering.
          </div>

          <div style={{ fontSize: 10, color: TERRACOTTA, letterSpacing: 1.2, fontWeight: 600, marginTop: 16 }}>
            HISTORY
          </div>
          <div style={{ fontSize: 13, color: INK, lineHeight: 1.55, marginTop: 6 }}>
            Mentioned in the Skanda Purana. The original shrine dates to the Chola period; the
            current structure was renovated in the 17th century.
          </div>

          <div style={{ fontSize: 10, color: TERRACOTTA, letterSpacing: 1.2, fontWeight: 600, marginTop: 16 }}>
            EXPERIENCE
          </div>
          <div style={{ fontSize: 13, color: INK, lineHeight: 1.55, marginTop: 6 }}>
            Most peaceful between 4–6 am. A small water tap is on the eastern side.
          </div>
        </div>

        <div
          style={{
            padding: 12,
            borderTop: "1px solid rgba(0,0,0,0.06)",
            background: "white",
            textAlign: "center",
            fontSize: 10,
            color: "#8A6E5C",
            letterSpacing: 0.3,
          }}
        >
          Your walk is still active in the background
        </div>
      </div>
    </>
  );
}
