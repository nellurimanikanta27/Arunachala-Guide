/**
 * Companion Features board — 3 new features in the dark/gold style:
 *   1. Sankalpa thread (intention prompt)
 *   2. Silent walk mode (dim screen)
 *   3. End-of-walk ritual (8 lingams glow)
 *
 * Layout mimics the reference: 3 phones in a row, supporting detail cards below.
 */

const BG = "#0A0604";
const PANEL = "rgba(20,12,6,0.92)";
const GOLD = "#C47A1E";
const GOLD_SOFT = "rgba(196,122,30,0.55)";
const HAIRLINE = "rgba(196,122,30,0.18)";
const TEXT = "#FFFFFF";
const TEXT_DIM = "rgba(255,255,255,0.55)";

const PHONE_W = 320;
const PHONE_H = 680;

export function CompanionFeatures() {
  return (
    <div
      style={{
        background: "#000",
        padding: 36,
        minHeight: "100vh",
        fontFamily:
          'Inter, -apple-system, system-ui, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: 28,
          color: GOLD,
          fontSize: 11,
          letterSpacing: 3,
          fontWeight: 600,
        }}
      >
        COMPANION FEATURES · NEW
      </div>
      <div
        style={{
          textAlign: "center",
          fontSize: 26,
          color: TEXT,
          fontWeight: 600,
          letterSpacing: -0.4,
          marginBottom: 36,
        }}
      >
        Sankalpa · Silent Walk · End Ritual
      </div>

      {/* Phone row */}
      <div
        style={{
          display: "flex",
          gap: 32,
          justifyContent: "center",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <Phone label="1. Sankalpa — set the why" sub="BEFORE THE WALK">
          <SankalpaScreen />
        </Phone>
        <Phone label="2. Silent walk — phone rests" sub="DURING · DIM SCREEN">
          <SilentScreen />
        </Phone>
        <Phone label="3. End ritual — receive it back" sub="WALK COMPLETE">
          <RitualScreen />
        </Phone>
      </div>

      {/* Supporting detail cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(280px, 1fr))",
          gap: 20,
          maxWidth: 1120,
          margin: "44px auto 0",
        }}
      >
        <DetailCard
          title="HOW SANKALPA WORKS"
          rows={[
            ["Tap", "Begin my Girivalam"],
            ["Type", "one line · your reason"],
            ["Optional", "turn on silent walk"],
            ["Saved", "to this walk only"],
          ]}
        />
        <DetailCard
          title="HOW SILENT MODE FEELS"
          rows={[
            ["Screen", "goes dark"],
            ["Phone", "rests in your pocket"],
            ["Vibration", "soft buzz at each lingam"],
            ["Wake", "tap anywhere to wake"],
          ]}
        />
        <DetailCard
          title="HOW THE RITUAL CLOSES"
          rows={[
            ["Screen", "fades to black"],
            ["8 lingams", "glow one by one"],
            ["Stat", "km and time"],
            ["Returned", "your sankalpa, in italics"],
          ]}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────── PHONE FRAME ─────────────────────────── */
function Phone({
  children,
  label,
  sub,
}: {
  children: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        style={{
          fontSize: 11,
          letterSpacing: 1.5,
          color: GOLD,
          fontWeight: 600,
          marginBottom: 4,
        }}
      >
        {label.toUpperCase()}
      </div>
      <div
        style={{
          fontSize: 9,
          letterSpacing: 1,
          color: "rgba(255,255,255,0.4)",
          marginBottom: 14,
        }}
      >
        {sub}
      </div>
      <div
        style={{
          width: PHONE_W,
          height: PHONE_H,
          borderRadius: 40,
          background: BG,
          border: "1px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
          position: "relative",
          boxShadow:
            "0 0 0 8px #1a1a1a, 0 30px 80px rgba(196,122,30,0.18)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ────────────────────── SCREEN 1 — Sankalpa prompt ────────────────────── */
function SankalpaScreen() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `radial-gradient(ellipse at 50% 0%, #2A1A0E 0%, ${BG} 60%)`,
        padding: "60px 22px 22px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: 2.5,
          color: GOLD,
          fontWeight: 500,
          textAlign: "center",
        }}
      >
        SANKALPA · YOUR INTENTION
      </div>
      <div
        style={{
          fontSize: 22,
          color: TEXT,
          fontWeight: 600,
          marginTop: 10,
          letterSpacing: -0.3,
          textAlign: "center",
          lineHeight: 1.28,
        }}
      >
        Why are you walking today?
      </div>
      <div
        style={{
          fontSize: 12,
          color: TEXT_DIM,
          marginTop: 12,
          textAlign: "center",
          lineHeight: 1.5,
          padding: "0 8px",
        }}
      >
        One line, in your own words. The app will return it to you at the end of your walk.
      </div>

      {/* Input */}
      <div
        style={{
          marginTop: 22,
          padding: 16,
          minHeight: 90,
          borderRadius: 14,
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${HAIRLINE}`,
          fontSize: 14,
          color: TEXT,
          lineHeight: 1.5,
          fontStyle: "italic",
        }}
      >
        For my mother&rsquo;s health{" "}
        <span style={{ color: "rgba(255,255,255,0.35)" }}>|</span>
      </div>

      {/* Silent toggle */}
      <div
        style={{
          marginTop: 16,
          padding: 14,
          borderRadius: 14,
          background: "rgba(255,255,255,0.03)",
          border: `1px solid ${HAIRLINE}`,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: TEXT, fontWeight: 600 }}>
            Walk in silence
          </div>
          <div
            style={{
              fontSize: 10,
              color: TEXT_DIM,
              marginTop: 3,
              lineHeight: 1.4,
            }}
          >
            Phone stays dark. Vibrates only when you reach a lingam.
          </div>
        </div>
        {/* Switch ON */}
        <div
          style={{
            width: 40,
            height: 22,
            borderRadius: 11,
            background: GOLD,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              width: 18,
              height: 18,
              borderRadius: 9,
              background: "#FFE9B0",
              boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
            }}
          />
        </div>
      </div>

      <button
        style={{
          marginTop: 22,
          padding: "16px 20px",
          borderRadius: 16,
          background: GOLD,
          color: "#0A0604",
          fontSize: 14,
          fontWeight: 600,
          border: "none",
          boxShadow: "0 8px 24px rgba(196,122,30,0.4)",
        }}
      >
        Begin the walk
      </button>
      <div
        style={{
          marginTop: 10,
          textAlign: "center",
          fontSize: 12,
          color: TEXT_DIM,
        }}
      >
        Not now
      </div>
    </div>
  );
}

/* ────────────────────── SCREEN 2 — Silent walk ────────────────────── */
function SilentScreen() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#000",
        position: "relative",
      }}
    >
      {/* Faint outline of the walk screen behind, very dim */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.08,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 56,
            left: 22,
            fontSize: 36,
            color: GOLD,
            fontWeight: 700,
          }}
        >
          7.2
        </div>
        <div
          style={{
            position: "absolute",
            top: 56,
            right: 22,
            fontSize: 16,
            color: GOLD,
            fontWeight: 600,
          }}
        >
          01:42:18
        </div>
        {[200, 160, 120].map((r, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: r * 2,
              height: r * 2,
              marginLeft: -r,
              marginTop: -r,
              borderRadius: "50%",
              border: `1px solid ${GOLD}`,
            }}
          />
        ))}
      </div>

      {/* The silent overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.93)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 36px",
        }}
      >
        <MoonIcon size={36} color={GOLD} />
        <div
          style={{
            fontSize: 17,
            color: GOLD,
            fontWeight: 600,
            letterSpacing: 1.5,
            marginTop: 14,
          }}
        >
          Silent walk
        </div>
        <div
          style={{
            fontSize: 13,
            color: TEXT_DIM,
            textAlign: "center",
            lineHeight: 1.55,
            marginTop: 10,
          }}
        >
          Phone is resting. It will vibrate gently when you reach a lingam.
        </div>

        {/* Vibration ripple hint */}
        <div
          style={{
            position: "absolute",
            bottom: 180,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          {[1, 0.7, 0.4].map((op, i) => (
            <div
              key={i}
              style={{
                width: 50 + i * 18,
                height: 14,
                borderRadius: 7,
                border: `1px solid rgba(196,122,30,${op * 0.45})`,
                opacity: op,
              }}
            />
          ))}
          <div
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: 1.5,
              marginTop: 8,
            }}
          >
            BUZZ · LINGAM #3 REACHED
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 60,
            fontSize: 10,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: 1.5,
            fontStyle: "italic",
          }}
        >
          Tap anywhere to wake
        </div>
      </div>
    </div>
  );
}

/* ────────────────────── SCREEN 3 — End-of-walk ritual ────────────────────── */
function RitualScreen() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#000",
        padding: "70px 26px 26px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: 2.5,
          color: GOLD,
          fontWeight: 500,
        }}
      >
        YOUR WALK IS COMPLETE
      </div>

      <div
        style={{
          fontSize: 56,
          color: TEXT,
          fontWeight: 700,
          letterSpacing: -1,
          marginTop: 8,
          lineHeight: 1,
        }}
      >
        14.0
        <span
          style={{
            fontSize: 18,
            color: TEXT_DIM,
            fontWeight: 500,
            marginLeft: 6,
          }}
        >
          km
        </span>
      </div>
      <div
        style={{
          fontSize: 13,
          color: TEXT_DIM,
          letterSpacing: 1,
          marginTop: 4,
        }}
      >
        3h 12m
      </div>

      {/* 8 lingams glowing in sequence */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 30,
          marginBottom: 22,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => {
          const lit = 1 - i * 0.08;
          return (
            <div
              key={i}
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                background: "rgba(196,122,30,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: lit,
                boxShadow: `0 0 ${10 - i}px ${GOLD}`,
              }}
            >
              <TempleIcon size={14} color={GOLD} />
            </div>
          );
        })}
      </div>

      {/* Sankalpa returned card */}
      <div
        style={{
          width: "100%",
          padding: "20px 18px",
          borderRadius: 16,
          background: "rgba(196,122,30,0.06)",
          border: "1px solid rgba(196,122,30,0.25)",
          textAlign: "center",
          marginTop: 6,
        }}
      >
        <div
          style={{
            fontSize: 9,
            color: GOLD,
            letterSpacing: 2,
            fontWeight: 500,
          }}
        >
          YOU BEGAN WITH THIS IN YOUR HEART
        </div>
        <div
          style={{
            fontSize: 15,
            color: TEXT,
            marginTop: 10,
            lineHeight: 1.5,
            fontStyle: "italic",
          }}
        >
          &ldquo;For my mother&rsquo;s health.&rdquo;
        </div>
        <div
          style={{
            fontSize: 11,
            color: TEXT_DIM,
            marginTop: 12,
            letterSpacing: 0.5,
          }}
        >
          The mountain has heard it.
        </div>
      </div>

      <button
        style={{
          marginTop: 28,
          padding: "13px 36px",
          borderRadius: 22,
          background: GOLD,
          color: "#0A0604",
          fontSize: 14,
          fontWeight: 600,
          border: "none",
          letterSpacing: 0.5,
          boxShadow: "0 6px 18px rgba(196,122,30,0.4)",
        }}
      >
        Close
      </button>
    </div>
  );
}

/* ────────────────────── Supporting detail card ────────────────────── */
function DetailCard({
  title,
  rows,
}: {
  title: string;
  rows: [string, string][];
}) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 16,
        background: PANEL,
        border: `1px solid ${HAIRLINE}`,
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: 2,
          color: GOLD,
          fontWeight: 600,
          marginBottom: 14,
          paddingBottom: 10,
          borderBottom: `1px solid ${HAIRLINE}`,
        }}
      >
        {title}
      </div>
      {rows.map(([k, v], i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            padding: "6px 0",
            fontSize: 12,
          }}
        >
          <span
            style={{
              color: TEXT_DIM,
              letterSpacing: 1,
              fontSize: 10,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            {k}
          </span>
          <span style={{ color: TEXT, fontWeight: 500 }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────── Icons (hand-drawn SVG) ────────────────────── */
function MoonIcon({ size = 24, color = GOLD }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"
        fill={color}
        style={{ filter: `drop-shadow(0 0 8px ${color})` }}
      />
    </svg>
  );
}

function TempleIcon({ size = 20, color = GOLD }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2 L4 7 L4 9 L20 9 L20 7 Z M5 10 L5 20 L9 20 L9 14 L15 14 L15 20 L19 20 L19 10 Z"
        fill={color}
      />
      <rect x="11" y="14" width="2" height="6" fill={BG} />
    </svg>
  );
}

void GOLD_SOFT;

export default CompanionFeatures;
