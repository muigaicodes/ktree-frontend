import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Journeys from "@/components/Journeys";
import HowItWorks from "@/components/HowItWorks";
import Creators from "@/components/Creators";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(11,74,36,0.04), transparent 55%), radial-gradient(circle at bottom right, rgba(11,74,36,0.05), transparent 60%)",
      }}
    >
      <Navbar />
      <main>
        <Hero />

        {/* Or divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            maxWidth: 520,
            margin: "0 auto",
            padding: "8px 28px 36px",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "var(--kt-border)" }} />
          <span
            style={{
              fontSize: 11,
              color: "#aaa",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            or browse ready journeys
          </span>
          <div style={{ flex: 1, height: 1, background: "var(--kt-border)" }} />
        </div>

        <Journeys />
        <HowItWorks />
        <Creators />
      </main>
      <Footer />
    </div>
  );
}
