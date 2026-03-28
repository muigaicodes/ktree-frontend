"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getToken,
  getCreatorProfile,
  logoutCreator,
  createPlaylist,
  listPlaylists,
  getPlaylist,
  publishVideo,
  type Creator,
  type Playlist,
  type PlaylistDetail,
  type PlaylistVideo,
} from "@/lib/creatorApi";

/* ═══════════════════════════════════════════════════════════
   Creator Dashboard
   ═══════════════════════════════════════════════════════════ */

export default function CreatorDashboard() {
  const router = useRouter();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<PlaylistDetail | null>(null);
  const [view, setView] = useState<"builder" | "detail">("builder");

  // Load auth on mount
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/Creator/login");
      return;
    }
    getCreatorProfile().then((res) => {
      if (res.success && res.data) {
        setCreator(res.data.creator);
      } else {
        router.push("/Creator/login");
      }
      setAuthChecked(true);
    });
  }, [router]);

  // Load playlists
  const loadPlaylists = useCallback(async () => {
    const res = await listPlaylists();
    if (res.success && res.data) {
      setPlaylists(res.data.playlists);
    }
  }, []);

  useEffect(() => {
    if (authChecked && creator) loadPlaylists();
  }, [authChecked, creator, loadPlaylists]);

  const handleLogout = () => {
    logoutCreator();
    router.push("/Creator/login");
  };

  const handlePlaylistCreated = (playlist: Playlist) => {
    loadPlaylists();
    openPlaylistDetail(playlist.id);
  };

  const openPlaylistDetail = async (id: string) => {
    const res = await getPlaylist(id);
    if (res.success && res.data) {
      setActivePlaylist(res.data);
      setView("detail");
    }
  };

  if (!authChecked) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8faf9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--kt-muted)", fontSize: 14 }}>
          <Spinner /> Checking authentication...
        </div>
      </div>
    );
  }

  if (!creator) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f8faf9" }}>
      {/* Top bar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 24px",
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(225,230,236,0.8)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setView("builder")}>
          <img src="/logo-symbol.png" alt="Knowledge Tree" style={{ height: 32 }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--kt-green)", letterSpacing: "0.03em", textTransform: "uppercase" }}>
            Creator Studio
          </span>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 13, color: "var(--kt-muted)" }}>
            {creator.displayName}
          </div>
          <button
            onClick={handleLogout}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "6px 14px",
              borderRadius: 8,
              border: "1px solid var(--kt-border)",
              background: "#fff",
              color: "var(--kt-muted)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
        {view === "builder" ? (
          <>
            {/* Greeting */}
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--kt-dark)", letterSpacing: "-0.02em", margin: "0 0 6px" }}>
                Hey, {creator.displayName.split(" ")[0]} 👋
              </h1>
              <p style={{ fontSize: 14, color: "var(--kt-muted)", margin: 0 }}>
                Paste YouTube URLs below to turn your videos into structured learning journeys.
              </p>
            </div>

            {/* Playlist builder card */}
            <PlaylistBuilder onCreated={handlePlaylistCreated} />

            {/* Previous playlists */}
            {playlists.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--kt-dark)", margin: "0 0 16px" }}>
                  Your playlists
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {playlists.map((pl) => (
                    <PlaylistCard key={pl.id} playlist={pl} onClick={() => openPlaylistDetail(pl.id)} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : activePlaylist ? (
          <PlaylistDetailView
            detail={activePlaylist}
            onBack={() => { setView("builder"); setActivePlaylist(null); }}
            onRefresh={() => openPlaylistDetail(activePlaylist.playlist.id)}
          />
        ) : null}
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Playlist Builder — URL input + submit
   ═══════════════════════════════════════════════════════════ */

function PlaylistBuilder({ onCreated }: { onCreated: (p: Playlist) => void }) {
  const [urlInput, setUrlInput] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const parseUrls = (raw: string): string[] => {
    return raw
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && (s.includes("youtube.com") || s.includes("youtu.be")));
  };

  const urls = parseUrls(urlInput);

  const handleSubmit = async () => {
    if (urls.length === 0) {
      setError("Paste at least one valid YouTube URL");
      return;
    }
    setLoading(true);
    setError(null);

    const res = await createPlaylist(title.trim() || `Playlist — ${new Date().toLocaleDateString()}`, urls);
    setLoading(false);

    if (res.success && res.data) {
      setUrlInput("");
      setTitle("");
      onCreated(res.data.playlist);
    } else {
      setError(res.error || "Failed to create playlist");
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(11,74,36,0.08)",
        borderRadius: 18,
        padding: "32px 30px",
        boxShadow: "0 12px 40px rgba(8,51,26,0.05), 0 1px 3px rgba(0,0,0,0.03)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(11,74,36,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 3v12M3 9h12" stroke="#0B4A24" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--kt-dark)", margin: 0, letterSpacing: "-0.01em" }}>
            New playlist
          </h2>
          <p style={{ fontSize: 12, color: "var(--kt-muted)", margin: 0 }}>
            Paste YouTube URLs — one per line, or comma-separated
          </p>
        </div>
      </div>

      {/* Title */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--kt-dark)", display: "block", marginBottom: 5 }}>
          Playlist title <span style={{ fontWeight: 400, color: "var(--kt-muted)" }}>(optional)</span>
        </label>
        <input
          type="text"
          placeholder='e.g. "African Business Insights Series"'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            border: "1.5px solid var(--kt-border)",
            borderRadius: 10,
            padding: "11px 14px",
            fontSize: 14,
            fontFamily: "inherit",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* URL textarea */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--kt-dark)", display: "block", marginBottom: 5 }}>
          YouTube URLs
        </label>
        <textarea
          ref={textareaRef}
          placeholder={`https://www.youtube.com/watch?v=...\nhttps://www.youtube.com/watch?v=...\nhttps://youtu.be/...`}
          value={urlInput}
          onChange={(e) => { setUrlInput(e.target.value); setError(null); }}
          rows={6}
          style={{
            width: "100%",
            border: "1.5px solid var(--kt-border)",
            borderRadius: 10,
            padding: "12px 14px",
            fontSize: 13,
            fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
            outline: "none",
            boxSizing: "border-box",
            resize: "vertical",
            lineHeight: 1.7,
          }}
        />
      </div>

      {/* URL count + error */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ fontSize: 12, color: urls.length > 0 ? "var(--kt-green)" : "var(--kt-muted)", fontWeight: 600 }}>
          {urls.length > 0 ? `${urls.length} video${urls.length > 1 ? "s" : ""} detected` : "No URLs detected yet"}
          {urls.length > 20 && <span style={{ color: "#b91c1c" }}> — max 20</span>}
        </div>
        {urlInput.trim() && urls.length === 0 && (
          <div style={{ fontSize: 12, color: "#b91c1c" }}>No valid YouTube URLs found</div>
        )}
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#b91c1c", marginBottom: 14 }}>
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || urls.length === 0 || urls.length > 20}
        style={{
          width: "100%",
          padding: "14px 20px",
          fontSize: 15,
          fontWeight: 600,
          fontFamily: "inherit",
          border: "none",
          borderRadius: 12,
          cursor: loading || urls.length === 0 ? "default" : "pointer",
          background: loading || urls.length === 0 || urls.length > 20 ? "var(--kt-border)" : "var(--kt-green)",
          color: loading || urls.length === 0 || urls.length > 20 ? "var(--kt-muted)" : "#fff",
          boxShadow: urls.length > 0 && !loading ? "0 8px 24px rgba(11,74,36,0.25)" : "none",
          transition: "all 0.2s",
        }}
      >
        {loading ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Spinner /> Processing — this may take a few minutes...
          </span>
        ) : (
          `Build playlist${urls.length > 0 ? ` (${urls.length} video${urls.length > 1 ? "s" : ""})` : ""}`
        )}
      </button>

      {/* Timing note */}
      {urls.length > 0 && (
        <div style={{ fontSize: 11, color: "var(--kt-muted)", marginTop: 8, textAlign: "center" }}>
          Each video takes ~30–90s to process. We&apos;ll process them one at a time so you can track progress.
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Playlist Card (list item)
   ═══════════════════════════════════════════════════════════ */

function PlaylistCard({ playlist, onClick }: { playlist: Playlist; onClick: () => void }) {
  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: "#fefce8", text: "#a16207", label: "Pending" },
    processing: { bg: "#eff6ff", text: "#2563eb", label: "Processing" },
    completed: { bg: "#f0fdf4", text: "#16a34a", label: "Completed" },
    failed: { bg: "#fef2f2", text: "#dc2626", label: "Failed" },
  };

  const s = statusColors[playlist.status] || statusColors.pending;

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 20px",
        background: "#fff",
        border: "1px solid var(--kt-border)",
        borderRadius: 14,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(11,74,36,0.2)";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(8,51,26,0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--kt-border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--kt-dark)", marginBottom: 3 }}>
          {playlist.title}
        </div>
        <div style={{ fontSize: 12, color: "var(--kt-muted)" }}>
          {playlist.videoCount} video{playlist.videoCount !== 1 ? "s" : ""} · {playlist.completedCount} processed · {new Date(playlist.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Status badge */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          padding: "4px 10px",
          borderRadius: 999,
          background: s.bg,
          color: s.text,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        {playlist.status === "processing" && <Spinner size={10} />}
        {s.label}
      </div>

      {/* Arrow */}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
        <path d="M6 4l4 4-4 4" stroke="var(--kt-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Playlist Detail View — shows each video's status + results
   ═══════════════════════════════════════════════════════════ */

function PlaylistDetailView({
  detail,
  onBack,
  onRefresh,
}: {
  detail: PlaylistDetail;
  onBack: () => void;
  onRefresh: () => void;
}) {
  const isProcessing = detail.playlist.status === "processing";

  // Auto-refresh while processing
  useEffect(() => {
    if (!isProcessing) return;
    const interval = setInterval(onRefresh, 5000);
    return () => clearInterval(interval);
  }, [isProcessing, onRefresh]);

  const completedCount = detail.videos.filter((v) => v.status === "completed").length;
  const failedCount = detail.videos.filter((v) => v.status === "failed").length;
  const processingIndex = detail.videos.findIndex((v) => v.status === "processing");

  return (
    <div>
      {/* Back button + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button
          onClick={onBack}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "1px solid var(--kt-border)",
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4l-4 4 4 4" stroke="var(--kt-dark)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--kt-dark)", margin: 0, letterSpacing: "-0.02em" }}>
            {detail.playlist.title}
          </h1>
          <p style={{ fontSize: 13, color: "var(--kt-muted)", margin: "2px 0 0" }}>
            {detail.videos.length} video{detail.videos.length !== 1 ? "s" : ""} · {completedCount} done
            {failedCount > 0 && ` · ${failedCount} failed`}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--kt-muted)", marginBottom: 6 }}>
          <span>{isProcessing ? "Processing..." : detail.playlist.status === "completed" ? "All done!" : "Status: " + detail.playlist.status}</span>
          <span>{completedCount}/{detail.videos.length}</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: "var(--kt-border)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              borderRadius: 3,
              background: isProcessing ? "linear-gradient(90deg, #0B4A24, #16a34a)" : completedCount === detail.videos.length ? "#16a34a" : "var(--kt-green)",
              width: `${(completedCount / detail.videos.length) * 100}%`,
              transition: "width 0.5s ease",
            }}
          />
        </div>
      </div>

      {/* Video list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {detail.videos.map((video, idx) => (
          <VideoStatusRow key={video.id} video={video} index={idx} isActive={idx === processingIndex} playlistId={detail.playlist.id} onRefresh={onRefresh} />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Video Status Row
   ═══════════════════════════════════════════════════════════ */

function VideoStatusRow({ video, index, isActive, playlistId, onRefresh }: { video: PlaylistVideo; index: number; isActive: boolean; playlistId: string; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);

  const statusIcon = () => {
    switch (video.status) {
      case "completed":
        return (
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7l3 3 5-5" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        );
      case "processing":
        return (
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Spinner size={14} color="#2563eb" />
          </div>
        );
      case "failed":
        return (
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M4 4l6 6M10 4l-6 6" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
        );
      default:
        return (
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--kt-border)" }} />
          </div>
        );
    }
  };

  // Extract video ID for display
  const displayUrl = video.video_url.length > 60 ? video.video_url.slice(0, 57) + "..." : video.video_url;

  return (
    <div
      style={{
        background: "#fff",
        border: isActive ? "1.5px solid rgba(37,99,235,0.3)" : "1px solid var(--kt-border)",
        borderRadius: 12,
        overflow: "hidden",
        transition: "all 0.2s",
      }}
    >
      <div
        onClick={() => video.status === "completed" && setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          cursor: video.status === "completed" ? "pointer" : "default",
        }}
      >
        {/* Index */}
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--kt-muted)", width: 20, textAlign: "center", flexShrink: 0 }}>
          {index + 1}
        </div>

        {statusIcon()}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--kt-dark)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {video.title || displayUrl}
          </div>
          {video.title && (
            <div style={{ fontSize: 11, color: "var(--kt-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>
              {video.video_url}
            </div>
          )}
          {video.status === "failed" && video.error_message && (
            <div style={{ fontSize: 11, color: "#dc2626", marginTop: 3 }}>
              {video.error_message}
            </div>
          )}
        </div>

        {video.status === "processing" && (
          <div style={{ fontSize: 11, color: "#2563eb", fontWeight: 600, flexShrink: 0 }}>
            Running pipeline...
          </div>
        )}

        {video.status === "completed" && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{ flexShrink: 0, transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}
          >
            <path d="M4 6l4 4 4-4" stroke="var(--kt-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Expanded result preview */}
      {expanded && video.status === "completed" && (
        <div style={{ borderTop: "1px solid var(--kt-border)", padding: "16px 16px 16px 60px" }}>
          <VideoResultPreview video={video} playlistId={playlistId} onPublished={onRefresh} />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Video Result Preview (when expanded)
   ═══════════════════════════════════════════════════════════ */

function VideoResultPreview({ video, playlistId, onPublished }: { video: PlaylistVideo; playlistId: string; onPublished: () => void }) {
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ slugs: string[]; message: string } | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const result = video.pipeline_result;
  const spines = result?.spines || [];
  const insights = result?.insights || [];
  const quotes = result?.quotes || [];
  const overview = result?.overview;
  const alreadyPublished = video.journey_slugs && video.journey_slugs.length > 0;

  const handlePublish = async () => {
    setPublishing(true);
    setPublishError(null);
    const res = await publishVideo(playlistId, video.id);
    setPublishing(false);

    if (res.success && res.data) {
      setPublishResult({ slugs: res.data.journeySlugs, message: res.data.message });
      onPublished();
    } else {
      setPublishError(res.error || "Failed to publish");
    }
  };

  const journeySlugs = publishResult?.slugs || video.journey_slugs || [];

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
        {[
          { label: "Journeys", value: spines.length, color: "#0B4A24", bg: "rgba(11,74,36,0.06)" },
          { label: "Insights", value: insights.length, color: "#2563eb", bg: "#eff6ff" },
          { label: "Quotes", value: quotes.length, color: "#b07d10", bg: "#fef3e2" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              background: stat.bg,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 700, color: stat.color }}>{stat.value}</span>
            <span style={{ fontSize: 11, color: stat.color, fontWeight: 600 }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Overview */}
      {overview?.summary && (
        <div style={{ fontSize: 13, color: "var(--kt-text)", lineHeight: 1.6, marginBottom: 14 }}>
          {overview.summary}
        </div>
      )}

      {/* Themes */}
      {overview?.themes && overview.themes.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {overview.themes.map((theme, i) => (
            <span
              key={i}
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 999,
                background: "rgba(11,74,36,0.06)",
                color: "var(--kt-green)",
              }}
            >
              {theme}
            </span>
          ))}
        </div>
      )}

      {/* Journey spines */}
      {spines.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--kt-dark)", marginBottom: 8 }}>
            Learning journeys found:
          </div>
          {spines.map((spine, i) => (
            <div
              key={spine.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "8px 0",
                borderTop: i > 0 ? "1px dashed var(--kt-border)" : "none",
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: "rgba(11,74,36,0.06)",
                  color: "var(--kt-green)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--kt-dark)" }}>{spine.title}</div>
                <div style={{ fontSize: 11, color: "var(--kt-muted)", marginTop: 2 }}>
                  {spine.insightIds?.length || 0} insights · {spine.summary?.slice(0, 100)}{(spine.summary?.length || 0) > 100 ? "..." : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top quote */}
      {quotes.length > 0 && (
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fef3c7",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 12,
            color: "#92400e",
            lineHeight: 1.5,
            fontStyle: "italic",
            marginBottom: 14,
          }}
        >
          &ldquo;{quotes[0].text}&rdquo;
          {quotes[0].speaker && <span style={{ fontStyle: "normal", fontWeight: 600 }}> — {quotes[0].speaker}</span>}
        </div>
      )}

      {/* Publish button or published status */}
      {alreadyPublished || publishResult ? (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 16px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 12,
              marginBottom: 10,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l3.5 3.5L13 5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>
              Published
            </span>
            <span style={{ fontSize: 12, color: "var(--kt-muted)", marginLeft: 4 }}>
              — {journeySlugs.length} journey{journeySlugs.length !== 1 ? "s" : ""} saved and ready for subscribers
            </span>
          </div>

          {/* Journey links */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {journeySlugs.map((slug) => (
              <a
                key={slug}
                href={`/Journey/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: "rgba(11,74,36,0.06)",
                  color: "var(--kt-green)",
                  textDecoration: "none",
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M8 2L2 8M2 2h6v6" stroke="#0B4A24" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                View Journey #{slug}
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {publishError && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#b91c1c", marginBottom: 10 }}>
              {publishError}
            </div>
          )}
          <button
            onClick={handlePublish}
            disabled={publishing}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "inherit",
              border: "none",
              borderRadius: 12,
              cursor: publishing ? "wait" : "pointer",
              background: publishing ? "var(--kt-border)" : "var(--kt-green)",
              color: publishing ? "var(--kt-muted)" : "#fff",
              boxShadow: publishing ? "none" : "0 6px 20px rgba(11,74,36,0.25)",
              transition: "all 0.2s",
            }}
          >
            {publishing ? (
              <>
                <Spinner size={14} color="#fff" /> Publishing...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14 2L7.5 14l-2-5.5L0 6.5z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
                Publish to WhatsApp
              </>
            )}
          </button>
        </div>
      )}

      {/* Processing time */}
      {video.processing_completed_at && video.processing_started_at && (
        <div style={{ fontSize: 11, color: "var(--kt-muted)", marginTop: 10 }}>
          Processed in {Math.round((new Date(video.processing_completed_at).getTime() - new Date(video.processing_started_at).getTime()) / 1000)}s
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Spinner component
   ═══════════════════════════════════════════════════════════ */

function Spinner({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        border: `2px solid rgba(0,0,0,0.1)`,
        borderTopColor: color,
        borderRadius: "50%",
        display: "inline-block",
        animation: "spin 0.8s linear infinite",
      }}
    />
  );
}
