"use client";

import { useState } from "react";
import { journeys, categories, type Journey } from "@/lib/journeys";
import { submitNotify } from "@/lib/api";

function WaitlistModal({
  journey,
  onClose,
}: {
  journey: Journey | null;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!journey) return null;

  const handleSubmit = async () => {
    if (!name || !phone || !email) return;
    setLoading(true);
    const ok = await submitNotify({
      name,
      phone,
      email,
      journey: journey.title,
      timestamp: new Date().toISOString(),
    });
    setLoading(false);
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setName("");
        setPhone("");
        setEmail("");
      }, 1500);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(7,24,34,0.75)",
        backdropFilter: "blur(8px)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "var(--kt-radius-xl)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.24)",
          maxWidth: 480,
          width: "100%",
        }}
      >
        <div
          style={{
            padding: "24px 24px 20px",
            borderBottom: "1px solid var(--kt-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
          }}
        >
          <div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "var(--kt-dark)",
                margin: "0 0 4px",
                letterSpacing: "-0.02em",
              }}
            >
              Notify me when this launches
            </h3>
            <p style={{ fontSize: 13, color: "var(--kt-muted)", margin: 0 }}>
              We&apos;ll let you know as soon as this journey is available.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "1px solid var(--kt-border)",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div style={{ padding: 24 }}>
          {[
            { label: "Full name", value: name, set: setName, placeholder: "e.g. Solomon Muigai", type: "text" },
            { label: "Phone number", value: phone, set: setPhone, placeholder: "+254 7XX XXX XXX", type: "tel" },
            { label: "Email", value: email, set: setEmail, placeholder: "you@example.com", type: "email" },
          ].map((field) => (
            <div key={field.label} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontWeight: 500, fontSize: 13, color: "var(--kt-dark)", marginBottom: 4 }}>
                {field.label}
              </label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                style={{
                  width: "100%",
                  borderRadius: 999,
                  border: "1px solid var(--kt-border)",
                  padding: "8px 12px",
                  fontSize: 13,
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
            </div>
          ))}
        </div>
        <div style={{ padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: success ? "#10b981" : "var(--kt-green)",
              color: "#fff",
              border: "none",
              borderRadius: 999,
              padding: "11px 20px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 10px 30px rgba(11,74,36,0.28)",
            }}
          >
            {success ? "✓ You're on the list!" : loading ? "Sending..." : "Notify me"}
          </button>
          <p style={{ fontSize: 11, color: "var(--kt-muted)", textAlign: "center" }}>
            We&apos;ll only contact you about this journey. No spam, ever.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Journeys() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [waitlistJourney, setWaitlistJourney] = useState<Journey | null>(null);

  const filtered =
    activeCategory === "All"
      ? journeys
      : journeys.filter((j) => j.category === activeCategory);

  return (
    <>
      <section id="journeys" style={{ padding: "0 28px 44px", maxWidth: 1120, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: "var(--kt-dark)", letterSpacing: "-0.02em", margin: 0 }}>
            Ready-made journeys
          </h2>
          <span style={{ fontSize: 13, color: "var(--kt-green)", fontWeight: 600, cursor: "pointer" }}>
            View all →
          </span>
        </div>
        <p style={{ fontSize: 14, color: "var(--kt-muted)", marginBottom: 20, maxWidth: 520 }}>
          Don&apos;t have a video? Start learning from curated journeys right away.
        </p>

        {/* Filter tags */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                background: activeCategory === cat ? "var(--kt-green)" : "#fff",
                color: activeCategory === cat ? "#fff" : "var(--kt-muted)",
                border: `1px solid ${activeCategory === cat ? "var(--kt-green)" : "var(--kt-border)"}`,
                borderRadius: 999,
                padding: "6px 16px",
                fontSize: 12,
                fontWeight: activeCategory === cat ? 600 : 500,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.12s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Journey cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 18,
          }}
        >
          {filtered.map((j, i) => (
            <article
              key={i}
              onClick={() => j.isWaitlist && setWaitlistJourney(j)}
              style={{
                background: "#fff",
                border: "1px solid var(--kt-border)",
                borderRadius: "var(--kt-radius-lg)",
                padding: "18px 18px 20px",
                boxShadow: "var(--kt-shadow-soft)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                cursor: j.isWaitlist ? "pointer" : "default",
                opacity: j.isWaitlist ? 0.75 : 1,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(11,74,36,0.3)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 22px 50px rgba(8,51,26,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--kt-border)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "var(--kt-shadow-soft)";
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  padding: "4px 10px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  width: "fit-content",
                  background: j.isWaitlist ? "#fff4e6" : "rgba(11,74,36,0.06)",
                  color: j.isWaitlist ? "#a85a00" : "var(--kt-green)",
                }}
              >
                {j.isWaitlist ? "Join Waitlist" : j.code}
              </span>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--kt-dark)", lineHeight: 1.3, margin: 0 }}>
                {j.title}
              </h3>
              <p style={{ fontSize: 12, color: "var(--kt-muted)", margin: 0 }}>by {j.author}</p>
              <p style={{ fontSize: 13, color: "var(--kt-muted)", lineHeight: 1.5, margin: 0, flex: 1 }}>
                {j.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {waitlistJourney && (
        <WaitlistModal journey={waitlistJourney} onClose={() => setWaitlistJourney(null)} />
      )}
    </>
  );
}
