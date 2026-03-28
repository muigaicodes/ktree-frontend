"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.ktree.uk";

interface Message {
  id: string;
  orderIndex: number;
  messageNumber: number;
  content: string;
  mediaUrl: string | null;
}

interface JourneyData {
  journey: { slug: string; title: string; createdAt: string };
  messages: Message[];
  totalDays: number;
}

/** Parse WhatsApp-formatted content into structured parts */
function parseContent(content: string) {
  const lines = content.split("\n");
  const parts: Array<{ type: "title" | "quote" | "text" | "cta"; text: string }> = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Bold title: *text*
    if (trimmed.startsWith("*") && trimmed.endsWith("*") && trimmed.length > 2) {
      parts.push({ type: "title", text: trimmed.slice(1, -1) });
    }
    // Italic quote: _"text"_
    else if (trimmed.startsWith('_"') && trimmed.endsWith('"_')) {
      parts.push({ type: "quote", text: trimmed.slice(2, -2) });
    }
    // CTA line
    else if (trimmed.includes("*MORE*") || trimmed.includes("Type *MORE*")) {
      // Skip CTA lines — not relevant for web reader
    }
    // Commands line
    else if (trimmed.startsWith("Commands:")) {
      // Skip
    }
    // Regular text
    else {
      parts.push({ type: "text", text: trimmed });
    }
  }

  return parts;
}

export default function JourneyReader() {
  const params = useParams();
  const slug = params?.slug as string;

  const [data, setData] = useState<JourneyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState(0);
  const [revealedDays, setRevealedDays] = useState(1);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`${API_BASE}/journey/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Journey not found");
        return res.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at top left, rgba(11,74,36,0.04), transparent 55%)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid var(--kt-border)", borderTopColor: "var(--kt-green)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "var(--kt-muted)", fontSize: 14 }}>Loading journey...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at top left, rgba(11,74,36,0.04), transparent 55%)" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <img src="/logo-symbol.png" alt="Knowledge Tree" style={{ height: 48, margin: "0 auto 16px" }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--kt-dark)", marginBottom: 8 }}>Journey not found</h1>
          <p style={{ fontSize: 14, color: "var(--kt-muted)", marginBottom: 24 }}>This learning journey doesn&apos;t exist or may have been removed.</p>
          <Link href="/" style={{ background: "var(--kt-green)", color: "#fff", padding: "10px 24px", borderRadius: 999, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
            ← Back to Knowledge Tree
          </Link>
        </div>
      </div>
    );
  }

  const messages = data.messages;
  const message = messages[currentDay];
  const parts = message ? parseContent(message.content) : [];
  const titlePart = parts.find((p) => p.type === "title");
  const isOrientation = currentDay === 0;
  const totalInsights = messages.length - 1; // First message is orientation

  const handleNext = () => {
    if (currentDay < messages.length - 1) {
      const nextDay = currentDay + 1;
      setCurrentDay(nextDay);
      if (nextDay >= revealedDays) setRevealedDays(nextDay + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentDay > 0) {
      setCurrentDay(currentDay - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top left, rgba(11,74,36,0.04), transparent 55%), radial-gradient(circle at bottom right, rgba(11,74,36,0.05), transparent 60%)" }}>
      {/* Top bar */}
      <nav style={{ display: "flex", alignItems: "center", padding: "14px 24px", borderBottom: "1px solid var(--kt-border)", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 10 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <img src="/logo-symbol.png" alt="Knowledge Tree" style={{ height: 32 }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--kt-dark)" }}>Knowledge Tree</span>
        </Link>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 12, color: "var(--kt-muted)" }}>
            {isOrientation ? "Overview" : `Day ${currentDay} of ${totalInsights}`}
          </span>
          <a
            href={`${API_BASE}/journey/${slug}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "6px 14px", borderRadius: 8,
              border: "1.5px solid var(--kt-border)", background: "#fff",
              fontSize: 12, fontWeight: 600, color: "var(--kt-dark)",
              textDecoration: "none", cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--kt-green)"; e.currentTarget.style.color = "var(--kt-green)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--kt-border)"; e.currentTarget.style.color = "var(--kt-dark)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8m0 0l-3-3m3 3l3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            PDF
          </a>
        </div>
      </nav>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px 80px" }}>
        {/* Journey title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--kt-dark)", lineHeight: 1.2, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
            {data.journey.title}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "var(--kt-muted)" }}>
            <span>{totalInsights} insights</span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--kt-border)" }} />
            <span>{totalInsights} day journey</span>
          </div>
        </div>

        {/* Progress dots */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28, flexWrap: "wrap" }}>
          {messages.map((_, i) => (
            <button
              key={i}
              onClick={() => i < revealedDays && setCurrentDay(i)}
              style={{
                width: i === currentDay ? 24 : 10,
                height: 10,
                borderRadius: 999,
                border: "none",
                background: i === currentDay ? "var(--kt-green)" : i < revealedDays ? "rgba(11,74,36,0.2)" : "var(--kt-border)",
                cursor: i < revealedDays ? "pointer" : "default",
                transition: "all 0.2s",
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Content card */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--kt-border)", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.04)" }}>
          {/* Day header */}
          {titlePart && (
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--kt-border)", background: isOrientation ? "rgba(11,74,36,0.03)" : "transparent" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--kt-green)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                {isOrientation ? "Journey overview" : `Day ${currentDay}`}
              </div>
              <h2 style={{ fontSize: 19, fontWeight: 700, color: "var(--kt-dark)", margin: 0, lineHeight: 1.3 }}>
                {titlePart.text}
              </h2>
            </div>
          )}

          {/* Body */}
          <div style={{ padding: "20px 24px 24px" }}>
            {parts
              .filter((p) => p.type !== "title")
              .map((p, i) => {
                if (p.type === "quote") {
                  return (
                    <div key={i} style={{ background: "#fffbeb", border: "1px solid #fef3c7", borderRadius: 12, padding: "16px 20px", margin: "14px 0", fontSize: 15, color: "#92400e", lineHeight: 1.65, fontStyle: "italic" }}>
                      &ldquo;{p.text}&rdquo;
                    </div>
                  );
                }
                if (p.type === "text") {
                  // Check if it's a numbered list item
                  const isListItem = /^\d+\.\s/.test(p.text);
                  if (isListItem) {
                    return (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", margin: "6px 0", fontSize: 14.5, color: "var(--kt-text)", lineHeight: 1.6 }}>
                        <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(11,74,36,0.08)", color: "var(--kt-green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>
                          {p.text.match(/^(\d+)/)?.[1]}
                        </span>
                        <span>{p.text.replace(/^\d+\.\s*/, "")}</span>
                      </div>
                    );
                  }
                  // Check if it's a "From:" line
                  if (p.text.startsWith("From:")) {
                    return (
                      <div key={i} style={{ fontSize: 13, color: "var(--kt-muted)", marginBottom: 8 }}>
                        {p.text}
                      </div>
                    );
                  }
                  return (
                    <p key={i} style={{ fontSize: 15, color: "var(--kt-text)", lineHeight: 1.7, margin: "10px 0" }}>
                      {p.text}
                    </p>
                  );
                }
                return null;
              })}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, gap: 12 }}>
          <button
            onClick={handlePrev}
            disabled={currentDay === 0}
            style={{
              padding: "12px 20px",
              borderRadius: 10,
              border: "1.5px solid var(--kt-border)",
              background: "#fff",
              color: currentDay === 0 ? "var(--kt-border)" : "var(--kt-dark)",
              fontSize: 14,
              fontWeight: 500,
              cursor: currentDay === 0 ? "default" : "pointer",
              fontFamily: "inherit",
            }}
          >
            ← Previous
          </button>

          {currentDay < messages.length - 1 ? (
            <button
              onClick={handleNext}
              style={{
                padding: "12px 24px",
                borderRadius: 10,
                border: "none",
                background: "var(--kt-green)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 6px 20px rgba(11,74,36,0.25)",
              }}
            >
              {isOrientation ? "Start journey →" : "Next insight →"}
            </button>
          ) : (
            <div style={{ padding: "12px 24px", borderRadius: 10, background: "rgba(11,74,36,0.06)", color: "var(--kt-green)", fontSize: 14, fontWeight: 600, textAlign: "center" }}>
              🎉 Journey complete!
            </div>
          )}
        </div>

        {/* Day list (collapsed) */}
        <details style={{ marginTop: 32 }}>
          <summary style={{ fontSize: 13, fontWeight: 600, color: "var(--kt-muted)", cursor: "pointer", marginBottom: 12 }}>
            All insights ({totalInsights})
          </summary>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {messages.map((msg, i) => {
              const msgParts = parseContent(msg.content);
              const msgTitle = msgParts.find((p) => p.type === "title")?.text || `Day ${i}`;
              const isRevealed = i < revealedDays;
              const isCurrent = i === currentDay;

              return (
                <button
                  key={i}
                  onClick={() => isRevealed && setCurrentDay(i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: isCurrent ? "rgba(11,74,36,0.06)" : "transparent",
                    cursor: isRevealed ? "pointer" : "default",
                    opacity: isRevealed ? 1 : 0.4,
                    textAlign: "left",
                    fontFamily: "inherit",
                    width: "100%",
                  }}
                >
                  <span style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: isCurrent ? "var(--kt-green)" : isRevealed ? "rgba(11,74,36,0.1)" : "var(--kt-border)",
                    color: isCurrent ? "#fff" : isRevealed ? "var(--kt-green)" : "var(--kt-muted)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, flexShrink: 0,
                  }}>
                    {i === 0 ? "⊙" : i}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: isCurrent ? 600 : 400, color: isCurrent ? "var(--kt-dark)" : "var(--kt-text)" }}>
                    {i === 0 ? "Overview" : msgTitle}
                  </span>
                </button>
              );
            })}
          </div>
        </details>

        {/* WhatsApp Subscribe Form */}
        <SubscribeForm slug={slug} journeyTitle={data.journey.title} totalInsights={totalInsights} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Subscribe Form — get this journey on WhatsApp
   ═══════════════════════════════════════════════════════════ */

const COUNTRIES = [
  { name: "Kenya", code: "+254", flag: "🇰🇪" },
  { name: "Rwanda", code: "+250", flag: "🇷🇼" },
  { name: "Nigeria", code: "+234", flag: "🇳🇬" },
  { name: "South Africa", code: "+27", flag: "🇿🇦" },
  { name: "Uganda", code: "+256", flag: "🇺🇬" },
  { name: "Tanzania", code: "+255", flag: "🇹🇿" },
  { name: "Ghana", code: "+233", flag: "🇬🇭" },
  { name: "Ethiopia", code: "+251", flag: "🇪🇹" },
  { name: "Egypt", code: "+20", flag: "🇪🇬" },
  { name: "India", code: "+91", flag: "🇮🇳" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { name: "United States", code: "+1", flag: "🇺🇸" },
  { name: "UAE", code: "+971", flag: "🇦🇪" },
  { name: "Other", code: "+", flag: "🌍" },
];

function SubscribeForm({ slug, journeyTitle, totalInsights }: { slug: string; journeyTitle: string; totalInsights: number }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+254");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("Morning");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState("");

  const handleSubscribe = async () => {
    const fullPhone = countryCode + phoneLocal.replace(/^0+/, "").replace(/\s/g, "");
    if (!phoneLocal.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/journey/${slug}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Learner",
          phone: fullPhone,
          country: COUNTRIES.find((c) => c.code === countryCode)?.name || "Kenya",
          deliveryTime,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setDone(true);
        setResultMessage(data.message || "Subscribed!");
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Network error — please try again");
    }

    setLoading(false);
  };

  if (done) {
    return (
      <div style={{ marginTop: 32, border: "1.5px solid #16a34a", borderRadius: 16, padding: "28px 24px", textAlign: "center", background: "#f0fdf4" }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>✓</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--kt-dark)", marginBottom: 4 }}>You&apos;re subscribed!</div>
        <div style={{ fontSize: 13, color: "var(--kt-muted)", lineHeight: 1.5 }}>{resultMessage}</div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 32, border: "1.5px solid var(--kt-green)", borderRadius: 16, padding: "28px 24px", background: "rgba(11,74,36,0.015)" }}>
      {!showForm ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--kt-dark)", marginBottom: 6 }}>
            Get this journey on WhatsApp
          </div>
          <div style={{ fontSize: 13, color: "var(--kt-muted)", marginBottom: 16, lineHeight: 1.5 }}>
            {`${totalInsights} insights delivered daily — one bite-size lesson at a time. Type MORE when you're ready for the next one.`}
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: "var(--kt-green)",
              color: "#fff",
              border: "none",
              borderRadius: 999,
              padding: "12px 28px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 6px 20px rgba(11,74,36,0.25)",
            }}
          >
            Subscribe for free →
          </button>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--kt-dark)", marginBottom: 4, textAlign: "center" }}>
            Get &ldquo;{journeyTitle}&rdquo; on WhatsApp
          </div>
          <div style={{ fontSize: 12, color: "var(--kt-muted)", marginBottom: 18, textAlign: "center" }}>
            We&apos;ll deliver one insight per day. Type MORE for the next one.
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#b91c1c", marginBottom: 14 }}>
              {error}
            </div>
          )}

          <div style={{ maxWidth: 400, margin: "0 auto" }}>
            {/* Name */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--kt-dark)", display: "block", marginBottom: 4 }}>Your name</label>
              <input
                type="text"
                placeholder="e.g. Solomon"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", border: "1.5px solid var(--kt-border)", borderRadius: 10, padding: "11px 14px", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Phone */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--kt-dark)", display: "block", marginBottom: 4 }}>WhatsApp number</label>
              <div style={{ display: "flex", gap: 6 }}>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  style={{ width: 110, border: "1.5px solid var(--kt-border)", borderRadius: 10, padding: "11px 8px", fontSize: 14, fontFamily: "inherit", outline: "none", background: "#fff", cursor: "pointer" }}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.name} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </select>
                <input
                  type="tel"
                  placeholder="7XX XXX XXX"
                  value={phoneLocal}
                  onChange={(e) => setPhoneLocal(e.target.value)}
                  style={{ flex: 1, border: "1.5px solid var(--kt-border)", borderRadius: 10, padding: "11px 14px", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            {/* Delivery time */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--kt-dark)", display: "block", marginBottom: 6 }}>Preferred time</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { id: "Morning", emoji: "🌅", label: "Morning" },
                  { id: "Midday", emoji: "🌞", label: "Midday" },
                  { id: "Evening", emoji: "🌙", label: "Evening" },
                ].map((t) => {
                  const isActive = deliveryTime === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setDeliveryTime(t.id)}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        border: isActive ? "1.5px solid var(--kt-green)" : "1.5px solid var(--kt-border)",
                        borderRadius: 10,
                        padding: "10px 8px",
                        fontSize: 13,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? "var(--kt-green)" : "var(--kt-muted)",
                        background: isActive ? "rgba(11,74,36,0.04)" : "#fff",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <span>{t.emoji}</span> {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubscribe}
              disabled={loading || !phoneLocal.trim()}
              style={{
                width: "100%",
                padding: "14px 20px",
                fontSize: 15,
                fontWeight: 600,
                fontFamily: "inherit",
                border: "none",
                borderRadius: 10,
                cursor: loading || !phoneLocal.trim() ? "default" : "pointer",
                background: loading || !phoneLocal.trim() ? "var(--kt-border)" : "var(--kt-green)",
                color: loading || !phoneLocal.trim() ? "var(--kt-muted)" : "#fff",
                boxShadow: phoneLocal.trim() && !loading ? "0 6px 20px rgba(11,74,36,0.25)" : "none",
                transition: "all 0.15s",
              }}
            >
              {loading ? "Subscribing..." : "Send me insights →"}
            </button>
            <div style={{ fontSize: 11, color: "var(--kt-muted)", marginTop: 8, textAlign: "center" }}>
              No spam, ever. Just your daily learning insight.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
