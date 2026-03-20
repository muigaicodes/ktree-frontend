export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--kt-border)",
        padding: "16px 28px 18px",
        fontSize: 11,
        color: "var(--kt-muted)",
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <span>© {new Date().getFullYear()} Knowledge Tree.</span>
        <span>Built with love for people who never stop learning.</span>
      </div>
    </footer>
  );
}
