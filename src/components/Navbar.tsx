"use client";

export default function Navbar() {
  const scrollTo = (id: string) => {
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
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          gap: 20,
          fontSize: 14,
          color: "var(--kt-muted)",
        }}
      >
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
      </div>
    </nav>
  );
}
