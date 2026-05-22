const TERRACOTTA = "#9B3D12";
const CREAM = "#FAF4EC";
const INK = "#2A1F18";
const MUTED = "#7A6A5C";

interface Entry {
  label: string;
  title: string;
  body: string;
  meta?: string;
}

const ENTRIES: Entry[] = [
  {
    label: "HIDDEN CAVE",
    title: "Pavalakundru",
    body:
      "Before Virupaksha, before Skandasramam, Ramana lived here as a teenager — a tiny rock shelter on the eastern slope. Almost no modern pilgrim climbs to it. The original silence is still there.",
    meta: "20 min climb · East face",
  },
  {
    label: "THE HILL'S BODY",
    title: "Older than the continents",
    body:
      "Arunachala is one of the oldest exposed rocks on Earth — roughly 3.5 billion years. It is older than most landmasses, older than oxygen in the atmosphere, older than multicellular life. You are walking around something that was here before anything was here.",
  },
  {
    label: "FORGOTTEN SHRINE",
    title: "Adi-Annamalai",
    body:
      "The 'first' Arunachaleswarar — on the western side of the hill, predating the main temple. On most days it is completely empty. The priest will let you sit alone in the sanctum if you ask quietly.",
    meta: "West side · 9 km from main temple",
  },
  {
    label: "QUIET TEACHING",
    title: "Ramana on losing things",
    body:
      "A devotee complained that he had lost his bag with all his money. Ramana said only: 'When you lose something small, you grieve. When you lose the body, who will grieve? Find that one first.' This exchange appears in no famous book.",
    meta: "From the ashram daybook",
  },
  {
    label: "VILLAGE",
    title: "Adiannamalai's potters",
    body:
      "Three families on the western edge still shape clay lamps the old way, for the Karthigai Deepam fire on the summit. They have done this for eleven generations. They do not advertise.",
  },
];

const CHIPS = ["Hidden Caves", "Forgotten Shrines", "The Hill's Body", "Quiet Teachings", "Villages", "Saints"];

export function BeyondArunachala() {
  return (
    <div style={{ minHeight: "100vh", background: CREAM, fontFamily: "'Inter', system-ui, sans-serif", color: INK }}>
      {/* Top bar — matches the app */}
      <div style={{ background: TERRACOTTA, padding: "16px 20px", color: "#fff" }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Beyond Arunachala</div>
      </div>

      {/* Hero */}
      <div style={{ padding: "28px 20px 16px" }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: TERRACOTTA, fontWeight: 600, marginBottom: 10 }}>
          WHAT MOST PILGRIMS NEVER HEAR
        </div>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
            fontSize: 32,
            lineHeight: 1.15,
            fontWeight: 500,
            margin: 0,
            marginBottom: 12,
            color: INK,
          }}
        >
          The hill has layers most people walk right past.
        </h1>
        <p style={{ fontSize: 14, lineHeight: 1.55, color: MUTED, margin: 0 }}>
          A small, slowly growing collection of the rare — caves, shrines, teachings, and stories you will not find on the first page of a search. One entry at a time, when something is worth telling.
        </p>
      </div>

      {/* Category chips */}
      <div style={{ padding: "12px 20px 8px", overflowX: "auto", whiteSpace: "nowrap" }}>
        {CHIPS.map((chip, i) => (
          <span
            key={chip}
            style={{
              display: "inline-block",
              padding: "7px 14px",
              borderRadius: 999,
              border: `1px solid ${i === 0 ? TERRACOTTA : "rgba(155,61,18,0.25)"}`,
              background: i === 0 ? TERRACOTTA : "transparent",
              color: i === 0 ? "#fff" : TERRACOTTA,
              fontSize: 12,
              fontWeight: 500,
              marginRight: 8,
            }}
          >
            {chip}
          </span>
        ))}
      </div>

      {/* Entries */}
      <div style={{ padding: "20px 20px 32px" }}>
        {ENTRIES.map((e, i) => (
          <article
            key={e.title}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              boxShadow: "0 1px 3px rgba(42,31,24,0.06), 0 1px 2px rgba(42,31,24,0.04)",
              borderLeft: `3px solid ${TERRACOTTA}`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 10, letterSpacing: 1.6, color: TERRACOTTA, fontWeight: 600 }}>{e.label}</span>
              <span style={{ fontSize: 10, color: MUTED }}>#{String(i + 1).padStart(2, "0")}</span>
            </div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                fontSize: 22,
                lineHeight: 1.25,
                fontWeight: 600,
                margin: 0,
                marginBottom: 10,
                color: INK,
              }}
            >
              {e.title}
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "#3D2F26", margin: 0 }}>{e.body}</p>
            {e.meta && (
              <div
                style={{
                  marginTop: 14,
                  paddingTop: 12,
                  borderTop: "1px solid rgba(42,31,24,0.08)",
                  fontSize: 11,
                  color: MUTED,
                  fontStyle: "italic",
                }}
              >
                {e.meta}
              </div>
            )}
          </article>
        ))}

        {/* Footer note — keeps the philosophy visible */}
        <div
          style={{
            textAlign: "center",
            padding: "24px 12px",
            fontSize: 12,
            color: MUTED,
            lineHeight: 1.6,
            fontStyle: "italic",
          }}
        >
          Curated, never aggregated.
          <br />
          If it is on the first page of Google, it is not here.
        </div>
      </div>
    </div>
  );
}
