export default function HowItWorks() {
  const steps = [
    {
      num: "1",
      title: "Find your content",
      desc: "Paste a YouTube URL or browse our ready-made journeys from top minds and operators.",
    },
    {
      num: "2",
      title: "Enter your WhatsApp number",
      desc: "Tell us where to send your insights. No account needed, no app to download.",
    },
    {
      num: "3",
      title: "Learn at your pace",
      desc: "Receive bite-size ideas, examples and prompts. Want more? Just tap for the next insight.",
    },
  ];

  return (
    <section id="how-it-works" style={{ padding: "0 28px 44px", maxWidth: 1120, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--kt-green)", fontWeight: 600, marginBottom: 6 }}>
          How it works
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: "var(--kt-dark)", letterSpacing: "-0.02em", margin: "0 0 4px" }}>
          Learn on WhatsApp
        </h2>
        <p style={{ fontSize: 14, color: "var(--kt-muted)", maxWidth: 520, margin: 0, lineHeight: 1.5 }}>
          No apps to install. No accounts to create. Just knowledge, delivered where you already are.
        </p>
      </div>

      <div className="howitworks-grid">
        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {steps.map((step, i) => (
            <div
              key={step.num}
              style={{
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
                padding: "18px 0",
                borderTop: i > 0 ? "1px dashed rgba(11,74,36,0.15)" : "none",
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  background: "rgba(11,74,36,0.06)",
                  color: "var(--kt-green)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {step.num}
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--kt-dark)", margin: "0 0 3px" }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 13, color: "var(--kt-muted)", lineHeight: 1.5, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Phone mockup */}
        <div>
          <div
            style={{
              background: "#111b21",
              borderRadius: 30,
              padding: 10,
              maxWidth: 260,
              margin: "0 auto",
              boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
              border: "3px solid #2a2a2a",
            }}
          >
            {/* Status bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 10px 4px",
                fontSize: 9,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              <span>20:29</span>
              <span>●●●</span>
            </div>

            {/* Chat header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8l5 5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "var(--kt-green)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  color: "#fff",
                  fontWeight: 700,
                }}
              >
                KT
              </div>
              <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>Knowledge Tree</span>
            </div>

            {/* Chat body */}
            <div style={{ padding: "10px 8px", minHeight: 260 }}>
              {/* Video thumbnail bubble */}
              <div
                style={{
                  background: "#1f2c34",
                  borderRadius: "10px 10px 10px 3px",
                  padding: 6,
                  marginBottom: 6,
                  maxWidth: "90%",
                }}
              >
                <div
                  style={{
                    background: "#0a1014",
                    borderRadius: 8,
                    height: 80,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M5 3l6 4-6 4V3z" fill="rgba(255,255,255,0.8)" />
                    </svg>
                  </div>
                </div>
                <div style={{ padding: "2px 6px 6px", fontSize: 11, lineHeight: 1.5, color: "rgba(255,255,255,0.9)" }}>
                  <strong>*How do you build a great company?*</strong>
                  <br /><br />
                  In the clip above, Sam Altman walks through 9 things he has seen the best founders do:
                </div>
              </div>

              {/* Insight message */}
              <div
                style={{
                  background: "#1f2c34",
                  borderRadius: "10px 10px 10px 3px",
                  padding: "8px 10px",
                  marginBottom: 6,
                  maxWidth: "90%",
                  fontSize: 11,
                  lineHeight: 1.5,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                <strong>*#1 Get to know your users really well*</strong>
                <br /><br />
                The best founders do customer support themselves.
              </div>

              {/* Second insight */}
              <div
                style={{
                  background: "#1f2c34",
                  borderRadius: "10px 10px 10px 3px",
                  padding: "8px 10px",
                  marginBottom: 6,
                  maxWidth: "90%",
                  fontSize: 11,
                  lineHeight: 1.5,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                <strong>*#2 Have a short cycle time &amp; understand compound growth*</strong>
                <br /><br />
                The cycle here is: talk to customer → build product → get in front of user → repeat.
              </div>
            </div>

            {/* Message input */}
            <div
              style={{
                display: "flex",
                gap: 6,
                padding: "6px 8px 10px",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  flex: 1,
                  background: "#1f2c34",
                  borderRadius: 20,
                  padding: "7px 12px",
                  fontSize: 10,
                  color: "rgba(255,255,255,0.35)",
                }}
              >
                Message
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
