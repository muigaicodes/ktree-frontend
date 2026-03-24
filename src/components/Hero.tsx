"use client";

import { useState } from "react";
import { extractInsights, type PipelineResult } from "@/lib/api";

export default function Hero() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [expandedJourney, setExpandedJourney] = useState<number | null>(null);

  const handleExtract = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setToast(null);
    setExpandedJourney(null);

    const res = await extractInsights({ youtubeUrl: url.trim() });
    setLoading(false);

    if (res.success && res.data) {
      setResult(res.data);
      setToast(res.message || "Pipeline complete!");
      setTimeout(() => setToast(null), 5000);
    } else {
      setError(res.error || "Something went wrong. Please try again.");
      setTimeout(() => setError(null), 6000);
    }
  };

  return (
    <section
      id="home"
      style={{ textAlign: "center", padding: "56px 28px 40px", maxWidth: 620, margin: "0 auto" }}
    >
      {/* Badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(11,74,36,0.06)",
          color: "var(--kt-green)",
          fontSize: 12,
          fontWeight: 600,
          padding: "6px 16px",
          borderRadius: 999,
          border: "1px solid rgba(11,74,36,0.12)",
          marginBottom: 20,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M6 1l1.2 2.8L10 5l-2.4 2 .4 2.8L6 8.4 3.8 9.8l.6-2.8L2 5l2.8-1.2z"
            stroke="#0B4A24"
            strokeWidth="1"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        AI-powered learning insights
      </div>

      {/* Heading */}
      <h1
        className="hero-title"
        style={{
          fontWeight: 800,
          color: "var(--kt-dark)",
          lineHeight: 1.12,
          letterSpacing: "-0.03em",
          margin: "0 0 14px",
        }}
      >
        Extract insights from any video
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: 17,
          color: "var(--kt-muted)",
          lineHeight: 1.55,
          maxWidth: 480,
          margin: "0 auto 26px",
        }}
      >
        Paste a YouTube URL to generate structured learning insights. We&apos;ll deliver them to
        your WhatsApp.
      </p>

      {/* URL Input */}
      <div
        className="hero-input-row"
        style={{
          background: "#fff",
          border: `1.5px solid ${loading ? "var(--kt-green)" : error ? "#dc2626" : "var(--kt-border)"}`,
          borderRadius: 999,
          padding: "5px 5px 5px 18px",
          maxWidth: 520,
          margin: "0 auto",
          transition: "border-color 0.2s, box-shadow 0.2s",
          boxShadow: loading ? "0 0 0 1px rgba(11,74,36,0.16)" : "none",
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            background: "rgba(11,74,36,0.06)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="3" width="12" height="8" rx="2" stroke="#6B7B8A" strokeWidth="1.2" />
            <path d="M6 6l2.5 1.5L6 9z" fill="#6B7B8A" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Paste a YouTube URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleExtract()}
          style={{
            border: "none",
            outline: "none",
            fontSize: 14,
            color: "var(--kt-dark)",
            fontFamily: "inherit",
            flex: 1,
            background: "transparent",
            minWidth: 0,
          }}
        />
        <button
          onClick={handleExtract}
          disabled={loading}
          style={{
            background: "var(--kt-green)",
            color: "#fff",
            border: "none",
            borderRadius: 999,
            padding: "10px 22px",
            fontSize: 13,
            fontWeight: 600,
            cursor: loading ? "wait" : "pointer",
            whiteSpace: "nowrap",
            fontFamily: "inherit",
            transition: "all 0.15s",
            boxShadow: "0 6px 20px rgba(11,74,36,0.25)",
          }}
        >
          {loading ? "Processing..." : "Extract insights"}
        </button>
      </div>

      {/* Trust signals */}
      <div
        className="trust-signals"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 22,
          marginTop: 18,
          fontSize: 12,
          color: "#9aa5ae",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="#9aa5ae" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Free to try
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <circle cx="5" cy="5" r="3.5" stroke="#9aa5ae" strokeWidth="1" />
            <path d="M5 3.5v2l1.2.8" stroke="#9aa5ae" strokeWidth="1" strokeLinecap="round" />
          </svg>
          Results in ~2 min
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 1C3 1 1.5 2.5 1.5 4.5c0 3 3.5 5 3.5 5s3.5-2 3.5-5C8.5 2.5 7 1 5 1z" stroke="#9aa5ae" strokeWidth="1" fill="none"/>
          </svg>
          Delivered via WhatsApp
        </span>
      </div>

      {/* Loading state */}
      {loading && (
        <div
          style={{
            marginTop: 24,
            padding: "16px 20px",
            background: "rgba(11,74,36,0.04)",
            borderRadius: 14,
            maxWidth: 400,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <p style={{ fontSize: 13, color: "var(--kt-muted)", margin: 0, lineHeight: 1.5 }}>
            Extracting transcript and running AI pipeline...
            <br />
            <span style={{ fontSize: 11, opacity: 0.7 }}>This may take 30-90 seconds on first request (server wake-up).</span>
          </p>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div
          style={{
            marginTop: 20,
            background: "#fef2f2",
            color: "#dc2626",
            borderRadius: 14,
            padding: "14px 20px",
            fontSize: 13,
            fontWeight: 600,
            maxWidth: 400,
            marginLeft: "auto",
            marginRight: "auto",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </div>
      )}

      {/* Success toast */}
      {toast && !result && (
        <div
          style={{
            marginTop: 20,
            background: "var(--kt-green)",
            color: "#fff",
            borderRadius: 14,
            padding: "14px 20px",
            fontSize: 13,
            fontWeight: 600,
            maxWidth: 400,
            marginLeft: "auto",
            marginRight: "auto",
            animation: "fadeIn 0.3s ease",
          }}
        >
          {toast}
        </div>
      )}

      {/* Pipeline results */}
      {result && (
        <div
          style={{
            marginTop: 28,
            textAlign: "left",
            maxWidth: 560,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {/* Video Overview */}
          {result.overview && (
            <div
              style={{
                background: "linear-gradient(135deg, rgba(11,74,36,0.04), rgba(11,74,36,0.08))",
                border: "1px solid rgba(11,74,36,0.12)",
                borderRadius: 16,
                padding: "20px 22px",
                marginBottom: 20,
              }}
            >
              {(result.overview.speaker || (result.speakers && result.speakers.length > 0)) && (
                <div style={{ fontSize: 12, color: "var(--kt-green)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {result.overview.speaker || result.speakers?.[0]}
                  {result.overview.contentType && <span style={{ color: "var(--kt-muted)", fontWeight: 500, textTransform: "lowercase", letterSpacing: 0 }}> — {result.overview.contentType}</span>}
                </div>
              )}
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--kt-dark)", lineHeight: 1.4, marginBottom: 8 }}>
                {result.overview.hook}
              </div>
              <div style={{ fontSize: 13, color: "var(--kt-muted)", lineHeight: 1.6, marginBottom: 12 }}>
                {result.overview.summary}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {result.overview.themes?.map((theme: string, i: number) => (
                  <span
                    key={i}
                    style={{
                      background: "rgba(11,74,36,0.08)",
                      color: "var(--kt-green)",
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: 999,
                    }}
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Summary bar */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 20,
              justifyContent: "center",
            }}
          >
            {[
              { label: "Journeys", count: result.spines?.length || 0, color: "#0B4A24" },
              { label: "Insights", count: result.insights?.length || 0, color: "#1e40af" },
              { label: "Quotes", count: result.quotes?.length || 0, color: "#92400e" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "#fff",
                  border: "1px solid var(--kt-border)",
                  borderRadius: 12,
                  padding: "10px 18px",
                  textAlign: "center",
                  flex: 1,
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.count}</div>
                <div style={{ fontSize: 11, color: "var(--kt-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Section heading */}
          <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--kt-dark)", marginBottom: 14, textAlign: "center" }}>
            Your learning journeys
          </h3>

          {/* Learning Journeys as accordions */}
          {result.spines?.map((spine: any, spineIndex: number) => {
            // Use insightIds if available, otherwise distribute evenly
            let journeyInsights: any[];
            if (spine.insightIds && spine.insightIds.length > 0) {
              journeyInsights = spine.insightIds
                .map((id: string) => (result.insights || []).find((ins: any) => ins.id === id))
                .filter(Boolean);
            } else {
              const insightsPerJourney = Math.max(1, Math.ceil((result.insights?.length || 0) / (result.spines?.length || 1)));
              const startIdx = spineIndex * insightsPerJourney;
              journeyInsights = (result.insights || []).slice(startIdx, startIdx + insightsPerJourney);
            }
            const quotesPerJourney = Math.max(1, Math.ceil((result.quotes?.length || 0) / (result.spines?.length || 1)));
            const journeyQuotes = (result.quotes || []).slice(spineIndex * quotesPerJourney, (spineIndex + 1) * quotesPerJourney);
            const isExpanded = expandedJourney === spineIndex;

            return (
              <div
                key={spineIndex}
                style={{
                  background: "#fff",
                  border: isExpanded ? "1.5px solid var(--kt-green)" : "1px solid var(--kt-border)",
                  borderRadius: 16,
                  marginBottom: 12,
                  overflow: "hidden",
                  boxShadow: isExpanded ? "0 8px 24px rgba(11,74,36,0.08)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {/* Journey header — clickable */}
                <div
                  onClick={() => setExpandedJourney(isExpanded ? null : spineIndex)}
                  style={{
                    padding: "16px 18px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span
                        style={{
                          background: "rgba(11,74,36,0.08)",
                          color: "var(--kt-green)",
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 999,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        Journey {spineIndex + 1}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--kt-muted)" }}>
                        {journeyInsights.length} days
                      </span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--kt-dark)", lineHeight: 1.3 }}>
                      {spine.title}
                    </div>
                    {(spine.summary || spine.targetOutcome) && (
                      <div style={{ fontSize: 12, color: "var(--kt-muted)", marginTop: 4, lineHeight: 1.5 }}>
                        {spine.summary}
                      </div>
                    )}
                  </div>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    style={{
                      flexShrink: 0,
                      marginTop: 4,
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  >
                    <path d="M5 8l5 5 5-5" stroke="var(--kt-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Expanded content — daily insights */}
                {isExpanded && (
                  <div style={{ padding: "0 18px 16px" }}>
                    {spine.targetOutcome && (
                      <div
                        style={{
                          background: "rgba(11,74,36,0.04)",
                          borderRadius: 10,
                          padding: "10px 14px",
                          marginBottom: 14,
                          fontSize: 12,
                          color: "var(--kt-green)",
                          lineHeight: 1.5,
                        }}
                      >
                        <strong>Goal:</strong> {spine.targetOutcome}
                      </div>
                    )}

                    {journeyInsights.map((insight: any, dayIndex: number) => (
                      <div
                        key={dayIndex}
                        style={{
                          padding: "14px 0",
                          borderTop: dayIndex > 0 ? "1px dashed var(--kt-border)" : "none",
                        }}
                      >
                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              background: "rgba(11,74,36,0.06)",
                              color: "var(--kt-green)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 11,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {dayIndex + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            {insight.title && (
                              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--kt-dark)", marginBottom: 6 }}>
                                {insight.title}
                              </div>
                            )}
                            {/* Lead with verbatim quote if available */}
                            {insight.evidence && insight.evidence.length > 0 && (
                              <div
                                style={{
                                  background: "#fffbeb",
                                  border: "1px solid #fef3c7",
                                  borderRadius: 10,
                                  padding: "10px 14px",
                                  marginBottom: 8,
                                  fontSize: 12,
                                  color: "#92400e",
                                  lineHeight: 1.5,
                                  fontStyle: "italic",
                                }}
                              >
                                &ldquo;{insight.evidence[0]}&rdquo;
                              </div>
                            )}
                            {/* Then the explanation */}
                            <div style={{ fontSize: 12, color: "var(--kt-muted)", lineHeight: 1.6 }}>
                              {insight.insight || insight.text || ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
