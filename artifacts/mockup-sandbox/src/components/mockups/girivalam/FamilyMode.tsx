/**
 * Family Mode — three-screen flow:
 *  1. Uncle's phone: pairing code generated, share to family
 *  2. Daughter's phone: live walk view, "Send a flower" button
 *  3. Uncle's phone: flower arrives on the path, with daughter's message
 *
 * Dark/gold premium theme to match the reference. No emoji as icons.
 */

const BG = "#0A0604";
const PANEL = "rgba(20,12,6,0.92)";
const GOLD = "#C47A1E";
const GOLD_SOFT = "rgba(196,122,30,0.55)";
const HAIRLINE = "rgba(196,122,30,0.18)";
const TEXT = "#FFFFFF";
const TEXT_DIM = "rgba(255,255,255,0.55)";

const PHONE_W = 340;
const PHONE_H = 720;

export function FamilyMode() {
  return (
    <div
      style={{
        background: "#000",
        padding: 36,
        minHeight: "100vh",
        display: "flex",
        gap: 28,
        justifyContent: "center",
        alignItems: "flex-start",
        fontFamily:
          'Inter, -apple-system, system-ui, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <PhoneFrame label="1. Uncle pairs his family" sub="ONE-TIME · 15 seconds">
        <UnclePairing />
      </PhoneFrame>
      <PhoneFrame label="2. Daughter watches live" sub="HER PHONE · BANGALORE">
        <DaughterWatching />
      </PhoneFrame>
      <PhoneFrame label="3. Uncle receives a flower" sub="HIS PHONE · ON THE PATH">
        <UncleReceives />
      </PhoneFrame>
    </div>
  );
}

function PhoneFrame({
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
            "0 0 0 8px #1a1a1a, 0 30px 80px rgba(196,122,30,0.15)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────── SCREEN 1 — Uncle pairing ─────────────────────── */
function UnclePairing() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `radial-gradient(ellipse at 50% 0%, #2A1A0E 0%, ${BG} 60%)`,
        padding: "60px 24px 24px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: 2,
            color: GOLD,
            fontWeight: 500,
          }}
        >
          FAMILY MODE
        </div>
        <div
          style={{
            fontSize: 22,
            color: TEXT,
            fontWeight: 600,
            marginTop: 8,
            letterSpacing: -0.3,
            lineHeight: 1.25,
          }}
        >
          Let your family walk with you
        </div>
        <div
          style={{
            fontSize: 13,
            color: TEXT_DIM,
            marginTop: 10,
            lineHeight: 1.5,
          }}
        >
          They will see where you are on the mountain. They can send a flower to
          your path. Nothing more.
        </div>
      </div>

      {/* Code card */}
      <div
        style={{
          marginTop: 12,
          padding: 22,
          borderRadius: 20,
          background: PANEL,
          border: `1px solid ${GOLD_SOFT}`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: TEXT_DIM,
            letterSpacing: 2,
            fontWeight: 500,
          }}
        >
          YOUR FAMILY CODE
        </div>
        <div
          style={{
            fontSize: 42,
            color: GOLD,
            fontWeight: 700,
            letterSpacing: 12,
            marginTop: 12,
            fontVariantNumeric: "tabular-nums",
            textShadow: `0 0 24px rgba(196,122,30,0.6)`,
          }}
        >
          7 4 2 8
        </div>
        <div
          style={{
            fontSize: 11,
            color: TEXT_DIM,
            marginTop: 10,
            lineHeight: 1.5,
          }}
        >
          Share this number with your family.
          <br />
          They open the app and type it in.
        </div>
      </div>

      {/* Share buttons */}
      <button
        style={{
          marginTop: 18,
          padding: "16px 20px",
          borderRadius: 16,
          background: GOLD,
          color: "#0A0604",
          fontSize: 15,
          fontWeight: 600,
          border: "none",
          width: "100%",
          boxShadow: "0 8px 24px rgba(196,122,30,0.4)",
        }}
      >
        Send to family on WhatsApp
      </button>
      <button
        style={{
          marginTop: 10,
          padding: "14px 20px",
          borderRadius: 16,
          background: "transparent",
          color: TEXT_DIM,
          fontSize: 13,
          fontWeight: 500,
          border: `1px solid ${HAIRLINE}`,
          width: "100%",
        }}
      >
        Skip for now
      </button>

      <div
        style={{
          marginTop: "auto",
          fontSize: 10,
          color: "rgba(255,255,255,0.35)",
          textAlign: "center",
          fontStyle: "italic",
          lineHeight: 1.6,
        }}
      >
        Your walk stays on your phone.
        <br />
        Only your location is shared, only with this code.
      </div>
    </div>
  );
}

/* ─────────────────────── SCREEN 2 — Daughter watching ─────────────────────── */
function DaughterWatching() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: BG,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          padding: "56px 20px 14px",
          borderBottom: `1px solid ${HAIRLINE}`,
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: GOLD,
            letterSpacing: 2,
            fontWeight: 500,
          }}
        >
          FAMILY · APPA IS WALKING
        </div>
        <div
          style={{
            fontSize: 20,
            color: TEXT,
            fontWeight: 600,
            marginTop: 6,
            letterSpacing: -0.3,
          }}
        >
          Ravi Kumar · Karthigai Pournami
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 8,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              background: GOLD,
              boxShadow: `0 0 8px ${GOLD}`,
            }}
          />
          <span style={{ fontSize: 11, color: TEXT_DIM }}>
            Live now · 7.2 km of 14 km
          </span>
        </div>
      </div>

      {/* Faux map with route + uncle position */}
      <div
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          background: `radial-gradient(ellipse at center, #1A0F08 0%, ${BG} 70%)`,
        }}
      >
        {/* contours */}
        {[180, 140, 100, 60].map((r, i) => (
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
              border: "1px solid rgba(196,122,30,0.08)",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 9,
            color: "rgba(255,255,255,0.35)",
            letterSpacing: 3,
            fontWeight: 600,
          }}
        >
          ARUNACHALA
        </div>

        {/* route dots */}
        {Array.from({ length: 32 }).map((_, i) => {
          const a = (i / 32) * Math.PI * 2;
          const rx = 120;
          const ry = 150;
          const isDone = i < 16;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                marginLeft: Math.cos(a) * rx - 2,
                marginTop: Math.sin(a) * ry - 2,
                width: 4,
                height: 4,
                borderRadius: 2,
                background: isDone ? GOLD : "rgba(196,122,30,0.25)",
                boxShadow: isDone ? `0 0 6px ${GOLD}` : "none",
              }}
            />
          );
        })}

        {/* Uncle's position (animated pulse) */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            marginLeft: -12 + Math.cos(Math.PI * 0.5) * 120,
            marginTop: -12 + Math.sin(Math.PI * 0.5) * 150,
            width: 24,
            height: 24,
            borderRadius: 12,
            background: "rgba(196,122,30,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              background: GOLD,
              border: "2px solid white",
              boxShadow: `0 0 16px ${GOLD}`,
            }}
          />
        </div>

        {/* Uncle label */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            marginLeft: -32 + Math.cos(Math.PI * 0.5) * 120,
            marginTop: 18 + Math.sin(Math.PI * 0.5) * 150,
            fontSize: 10,
            color: GOLD,
            fontWeight: 600,
            letterSpacing: 0.5,
            background: "rgba(10,6,4,0.8)",
            padding: "3px 8px",
            borderRadius: 8,
          }}
        >
          Appa · Yama Lingam
        </div>
      </div>

      {/* Send a flower button */}
      <div
        style={{
          padding: "16px 20px 24px",
          background: "rgba(20,12,6,0.95)",
          borderTop: `1px solid ${HAIRLINE}`,
        }}
      >
        <button
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: 18,
            background: `linear-gradient(180deg, ${GOLD} 0%, #A86214 100%)`,
            color: "#0A0604",
            fontSize: 15,
            fontWeight: 600,
            border: "none",
            boxShadow: `0 8px 20px rgba(196,122,30,0.4)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <FlowerIcon size={18} color="#0A0604" />
          Send Appa a flower
        </button>
        <div
          style={{
            fontSize: 10,
            color: TEXT_DIM,
            textAlign: "center",
            marginTop: 10,
            fontStyle: "italic",
          }}
        >
          You sent a flower 22 minutes ago · Last at Indra Lingam
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── SCREEN 3 — Uncle receives ─────────────────────── */
function UncleReceives() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: BG,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top header (mini, since uncle is mid-walk) */}
      <div
        style={{
          padding: "56px 20px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 26,
              color: TEXT,
              fontWeight: 700,
              letterSpacing: -0.5,
              lineHeight: 1,
            }}
          >
            7.2 <span style={{ fontSize: 12, color: TEXT_DIM }}>KM</span>
          </div>
          <div
            style={{
              fontSize: 10,
              color: TEXT_DIM,
              letterSpacing: 1.5,
              marginTop: 2,
            }}
          >
            Covered
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 14, color: GOLD, fontWeight: 600 }}>
            01:42:18
          </div>
          <div
            style={{
              fontSize: 9,
              color: TEXT_DIM,
              letterSpacing: 0.5,
              marginTop: 2,
            }}
          >
            Live Session
          </div>
        </div>
      </div>

      {/* Faux map */}
      <div
        style={{
          position: "absolute",
          top: 110,
          bottom: 0,
          left: 0,
          right: 0,
          background: `radial-gradient(ellipse at center, #1A0F08 0%, ${BG} 70%)`,
        }}
      >
        {[180, 140, 100].map((r, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "45%",
              width: r * 2,
              height: r * 2,
              marginLeft: -r,
              marginTop: -r,
              borderRadius: "50%",
              border: "1px solid rgba(196,122,30,0.08)",
            }}
          />
        ))}

        {/* Route dots with flowers along the way */}
        {Array.from({ length: 32 }).map((_, i) => {
          const a = (i / 32) * Math.PI * 2;
          const rx = 110;
          const ry = 140;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: "50%",
                top: "45%",
                marginLeft: Math.cos(a) * rx - 2,
                marginTop: Math.sin(a) * ry - 2,
                width: 4,
                height: 4,
                borderRadius: 2,
                background: i < 16 ? GOLD : "rgba(196,122,30,0.25)",
                boxShadow: i < 16 ? `0 0 6px ${GOLD}` : "none",
              }}
            />
          );
        })}

        {/* Flowers from family along the completed path */}
        {[
          { angle: 0.1, label: "Lakshmi" },
          { angle: 0.3, label: "Priya" },
          { angle: 0.45, label: "Lakshmi" },
        ].map((f, i) => {
          const a = f.angle * Math.PI * 2;
          const rx = 110;
          const ry = 140;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: "50%",
                top: "45%",
                marginLeft: Math.cos(a) * rx - 10,
                marginTop: Math.sin(a) * ry - 10,
              }}
            >
              <FlowerIcon size={20} color={GOLD} glow />
            </div>
          );
        })}

        {/* Uncle's current position */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "45%",
            marginLeft: -10 + Math.cos(Math.PI * 0.5) * 110,
            marginTop: -10 + Math.sin(Math.PI * 0.5) * 140,
            width: 20,
            height: 20,
            borderRadius: 10,
            background: "rgba(196,122,30,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              background: GOLD,
              border: "2px solid white",
              boxShadow: `0 0 14px ${GOLD}`,
            }}
          />
        </div>
      </div>

      {/* Incoming flower notification */}
      <div
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 100,
          padding: 16,
          borderRadius: 18,
          background: PANEL,
          border: `1px solid ${GOLD_SOFT}`,
          display: "flex",
          alignItems: "center",
          gap: 14,
          boxShadow: `0 0 32px rgba(196,122,30,0.25)`,
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            background: "rgba(196,122,30,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <FlowerIcon size={22} color={GOLD} />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 10,
              color: GOLD,
              letterSpacing: 1.5,
              fontWeight: 500,
            }}
          >
            FROM YOUR DAUGHTER
          </div>
          <div
            style={{
              fontSize: 15,
              color: TEXT,
              fontWeight: 600,
              marginTop: 3,
              lineHeight: 1.3,
            }}
          >
            Lakshmi sent a flower
          </div>
          <div
            style={{
              fontSize: 11,
              color: TEXT_DIM,
              marginTop: 3,
              fontStyle: "italic",
              lineHeight: 1.4,
            }}
          >
            "Appa, walking with you. — Bangalore"
          </div>
        </div>
      </div>

      {/* Bottom nav (4 buttons, minimal) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "12px 24px 24px",
          background: "rgba(10,6,4,0.95)",
          borderTop: `1px solid ${HAIRLINE}`,
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        {["Japa", "Audio"].map((l) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                background: "rgba(255,255,255,0.04)",
                margin: "0 auto",
              }}
            />
            <div
              style={{
                fontSize: 9,
                color: TEXT_DIM,
                marginTop: 4,
                letterSpacing: 0.5,
              }}
            >
              {l}
            </div>
          </div>
        ))}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            background: GOLD,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 6px 16px rgba(196,122,30,0.5)`,
            color: "#0A0604",
            fontSize: 28,
            fontWeight: 300,
          }}
        >
          +
        </div>
        {["Utilities"].map((l) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                background: "rgba(255,255,255,0.04)",
                margin: "0 auto",
              }}
            />
            <div
              style={{
                fontSize: 9,
                color: TEXT_DIM,
                marginTop: 4,
                letterSpacing: 0.5,
              }}
            >
              {l}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────── Flower icon (hand-drawn SVG, not emoji) ─────────────────────── */
function FlowerIcon({
  size = 20,
  color = "#C47A1E",
  glow = false,
}: {
  size?: number;
  color?: string;
  glow?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{
        filter: glow ? `drop-shadow(0 0 6px ${color})` : undefined,
      }}
    >
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const rad = (a * Math.PI) / 180;
        return (
          <ellipse
            key={a}
            cx={12 + Math.cos(rad) * 4}
            cy={12 + Math.sin(rad) * 4}
            rx={3}
            ry={5}
            fill={color}
            opacity={0.85}
            transform={`rotate(${a} ${12 + Math.cos(rad) * 4} ${12 + Math.sin(rad) * 4})`}
          />
        );
      })}
      <circle cx={12} cy={12} r={2.5} fill="#FFE9B0" />
    </svg>
  );
}

export default FamilyMode;
