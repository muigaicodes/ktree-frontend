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
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img
            src="/phone_mockup.png"
            alt="WhatsApp learning journey preview"
            style={{
              maxWidth: 260,
              width: "100%",
              borderRadius: 24,
              boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
