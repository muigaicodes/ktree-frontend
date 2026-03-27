"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginCreator, registerCreator } from "@/lib/creatorApi";

export default function CreatorLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [channelUrl, setChannelUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError(null);

    const result =
      mode === "login"
        ? await loginCreator(email.trim(), password)
        : await registerCreator(email.trim(), password, displayName.trim() || undefined, channelUrl.trim() || undefined);

    setLoading(false);

    if (result.success) {
      router.push("/Creator/dashboard");
    } else {
      setError(result.error || "Something went wrong");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg, #f8faf9 0%, #edf5f0 40%, #fafbfa 100%)",
        padding: "24px",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 40,
          cursor: "pointer",
        }}
        onClick={() => router.push("/")}
      >
        <img src="/logo-symbol.png" alt="Knowledge Tree" style={{ height: 40 }} />
        <span
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "var(--kt-green)",
            letterSpacing: "0.03em",
            textTransform: "uppercase",
          }}
        >
          Knowledge Tree
        </span>
      </div>

      {/* Auth card */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          borderRadius: 20,
          border: "1px solid rgba(11,74,36,0.08)",
          boxShadow: "0 20px 60px rgba(8,51,26,0.08), 0 1px 3px rgba(0,0,0,0.04)",
          padding: "40px 36px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--kt-dark)",
              letterSpacing: "-0.02em",
              margin: "0 0 6px",
            }}
          >
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p style={{ fontSize: 13, color: "var(--kt-muted)", margin: 0 }}>
            {mode === "login"
              ? "Sign in to your creator dashboard"
              : "Start turning your videos into learning journeys"}
          </p>
        </div>

        {/* Mode toggle */}
        <div
          style={{
            display: "flex",
            background: "rgba(11,74,36,0.04)",
            borderRadius: 10,
            padding: 3,
            marginBottom: 24,
          }}
        >
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); }}
              style={{
                flex: 1,
                padding: "9px 0",
                fontSize: 13,
                fontWeight: 600,
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s",
                background: mode === m ? "#fff" : "transparent",
                color: mode === m ? "var(--kt-green)" : "var(--kt-muted)",
                boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
              }}
            >
              {m === "login" ? "Sign in" : "Register"}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 13,
              color: "#b91c1c",
              marginBottom: 16,
              lineHeight: 1.4,
            }}
          >
            {error}
          </div>
        )}

        {/* Form fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "register" && (
            <div>
              <label style={labelStyle}>Display name</label>
              <input
                type="text"
                placeholder="e.g. Solomon Muigai"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onKeyDown={handleKeyDown}
                style={inputStyle}
              />
            </div>
          )}

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              style={inputStyle}
              autoComplete="email"
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              placeholder={mode === "register" ? "Minimum 8 characters" : "••••••••"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              style={inputStyle}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {mode === "register" && (
            <div>
              <label style={labelStyle}>
                YouTube channel URL <span style={{ color: "var(--kt-muted)", fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="url"
                placeholder="https://youtube.com/@yourchannel"
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                style={inputStyle}
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: 22,
            padding: "14px 20px",
            fontSize: 15,
            fontWeight: 600,
            fontFamily: "inherit",
            border: "none",
            borderRadius: 12,
            cursor: loading ? "wait" : "pointer",
            background: loading ? "var(--kt-muted)" : "var(--kt-green)",
            color: "#fff",
            boxShadow: loading ? "none" : "0 8px 24px rgba(11,74,36,0.25)",
            transition: "all 0.2s",
          }}
        >
          {loading ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
              {mode === "login" ? "Signing in..." : "Creating account..."}
            </span>
          ) : (
            mode === "login" ? "Sign in" : "Create account"
          )}
        </button>
      </div>

      {/* Footer note */}
      <p style={{ fontSize: 12, color: "var(--kt-muted)", marginTop: 24, textAlign: "center" }}>
        By continuing, you agree to Knowledge Tree&apos;s Terms of Service.
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

/* ── Shared styles ── */

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "var(--kt-dark)",
  display: "block",
  marginBottom: 5,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1.5px solid var(--kt-border)",
  borderRadius: 10,
  padding: "12px 14px",
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};
