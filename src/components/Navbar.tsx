"use client";

import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const scrollTo = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        padding: "14px 28px",
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(225,230,236,0.8)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src="/logo-symbol.png" alt="Knowledge Tree" style={{ height: 36 }} />
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "var(--kt-green)",
            letterSpacing: "0.03em",
            textTransform: "uppercase",
          }}
        >
          Knowledge Tree
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: 999,
            background: "rgba(11,74,36,0.08)",
            color: "var(--kt-green)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          Beta
        </span>
      </div>

      {/* Desktop links */}
      <div className={`nav-links${open ? " open" : ""}`}>
        {[
          { label: "Home", id: "home" },
          { label: "How it works", id: "how-it-works" },
          { label: "Journeys", id: "journeys" },
          { label: "Creators", id: "creators" },
        ].map((item) => (
          <span
            key={item.id}
            onClick={() => scrollTo(item.id)}
            style={{ cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--kt-dark)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--kt-muted)")}
          >
            {item.label}
          </span>
        ))}
        <a
          href="/Creator/login"
          style={{
            padding: "6px 14px",
            borderRadius: 8,
            background: "rgba(11,74,36,0.06)",
            color: "var(--kt-green)",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          Creator Studio
        </a>
      </div>

      {/* Hamburger button */}
      <button className="nav-hamburger" onClick={() => setOpen(!open)} aria-label="Menu">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          {open ? (
            <path d="M5 5l10 10M15 5L5 15" stroke="var(--kt-dark)" strokeWidth="1.5" strokeLinecap="round" />
          ) : (
            <>
              <path d="M3 6h14M3 10h14M3 14h14" stroke="var(--kt-dark)" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
        </svg>
      </button>
    </nav>
  );
}
