export default function Creators() {
  const featured = [
    { initials: "MM", name: "Mike McGuiness", journey: "#45 How to Build a Startup", bg: "rgba(11,74,36,0.08)", color: "#0B4A24" },
    { initials: "OB", name: "Orange Book", journey: "#77 Thought Triggering Thoughts", bg: "#fef3e2", color: "#b07d10" },
    { initials: "DS", name: "David Senra", journey: "#82 History's Greatest Entrepreneurs", bg: "#e8f0fb", color: "#3b6fb5" },
    { initials: "BS", name: "Bright Simons", journey: "#120 African Markets", bg: "#f3e8fb", color: "#7b3db5" },
  ];

  return (
    <section id="creators" style={{ padding: "0 28px 44px", maxWidth: 1120, margin: "0 auto" }}>
      <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--kt-green)", fontWeight: 600, marginBottom: 6 }}>
        For YouTube creators
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 700, color: "var(--kt-dark)", letterSpacing: "-0.02em", margin: "0 0 16px" }}>
        Turn your videos into learning journeys
      </h2>

      <div
        style={{
          background: "rgba(11,74,36,0.03)",
          border: "1px solid rgba(11,74,36,0.1)",
          borderRadius: "var(--kt-radius-xl)",
          padding: 32,
          display: "flex",
          gap: 32,
          alignItems: "flex-start",
        }}
      >
        {/* Left content */}
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--kt-dark)", marginBottom: 8, letterSpacing: "-0.02em" }}>
            Got a YouTube channel with valuable content?
          </h3>
          <p style={{ fontSize: 14, color: "var(--kt-muted)", lineHeight: 1.6, marginBottom: 16 }}>
            We&apos;ll extract insights from your videos, turn them into structured learning journeys,
            and feature them on our site. Your audience gets a new way to learn from you. You get distribution.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {[
              { icon: "plus", text: "You share your video URLs", desc: " — we do the rest. AI extracts the key insights and structures them into daily lessons." },
              { icon: "check", text: "We feature your journey", desc: " on Knowledge Tree with full credit. Learners subscribe and receive your content via WhatsApp." },
              { icon: "clock", text: "Your audience learns at their pace", desc: " — bite-size insights, delivered where they already spend time." },
            ].map((item) => (
              <div key={item.text} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    background: "rgba(11,74,36,0.06)",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    {item.icon === "plus" && <path d="M6 2v8M2 6h8" stroke="#0B4A24" strokeWidth="1.3" strokeLinecap="round" />}
                    {item.icon === "check" && <path d="M2 6l3 3 5-5" stroke="#0B4A24" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />}
                    {item.icon === "clock" && (
                      <>
                        <circle cx="6" cy="6" r="4" stroke="#0B4A24" strokeWidth="1.2" />
                        <path d="M6 4v2.5l1.5 1" stroke="#0B4A24" strokeWidth="1.2" strokeLinecap="round" />
                      </>
                    )}
                  </svg>
                </div>
                <p style={{ fontSize: 13, color: "var(--kt-muted)", lineHeight: 1.5, margin: 0 }}>
                  <strong style={{ color: "var(--kt-dark)" }}>{item.text}</strong>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <a
            href="https://docs.google.com/forms/d/1ziy7LnBQOsU1k3hp9WG7rY0aU4993BcPt0lf-y1-DrI/preview"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--kt-green)",
              color: "#fff",
              border: "none",
              borderRadius: 999,
              padding: "10px 20px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 8px 24px rgba(11,74,36,0.25)",
              textDecoration: "none",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11 3L3 11M3 3h8v8" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Get in touch
          </a>
        </div>

        {/* Right — featured creators */}
        <div
          style={{
            width: 280,
            flexShrink: 0,
            background: "#fff",
            border: "1px solid var(--kt-border)",
            borderRadius: "var(--kt-radius-lg)",
            padding: 18,
            boxShadow: "var(--kt-shadow-soft)",
          }}
        >
          <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--kt-dark)", marginBottom: 12 }}>
            Featured creators and thought-leaders
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {featured.map((c) => (
              <div
                key={c.initials}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  background: "rgba(11,74,36,0.03)",
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 700,
                    background: c.bg,
                    color: c.color,
                    flexShrink: 0,
                  }}
                >
                  {c.initials}
                </div>
                <div style={{ fontSize: 11 }}>
                  <div style={{ fontWeight: 600, color: "var(--kt-dark)" }}>{c.name}</div>
                  <div style={{ color: "var(--kt-muted)" }}>{c.journey}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
