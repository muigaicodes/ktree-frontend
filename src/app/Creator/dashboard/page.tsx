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

          {/* Journey links with share + preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {journeySlugs.map((slug) => (
              <JourneyCard key={slug} slug={slug} />
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
   Journey Card — shows journey with share buttons + inline preview
   ═══════════════════════════════════════════════════════════ */

const JOURNEY_API = "https://api.ktree.uk";

interface JourneyMessage {
  id: string;
  orderIndex: number;
  messageNumber: number;
  content: string;
  mediaUrl: string | null;
}

function parseContent(content: string) {
  const lines = content.split("\n");
  const parts: Array<{ type: "title" | "quote" | "text" | "cta"; text: string }> = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("*") && trimmed.endsWith("*") && trimmed.length > 2) {
      parts.push({ type: "title", text: trimmed.slice(1, -1) });
    } else if (trimmed.startsWith('_"') && trimmed.endsWith('"_')) {
      parts.push({ type: "quote", text: trimmed.slice(2, -2) });
    } else if (trimmed.includes("*MORE*") || trimmed.includes("Type *MORE*") || trimmed.startsWith("Commands:")) {
      // Skip
    } else {
      parts.push({ type: "text", text: trimmed });
    }
  }
  return parts;
}

function JourneyCard({ slug }: { slug: string }) {
  const [showPreview, setShowPreview] = useState(false);
  const [messages, setMessages] = useState<JourneyMessage[]>([]);
  const [journeyTitle, setJourneyTitle] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewDay, setPreviewDay] = useState(0);

  const journeyUrl = `https://ktree-export.vercel.app/Journey/${slug}`;

  const handlePreview = async () => {
    if (showPreview) {
      setShowPreview(false);
      return;
    }
    if (messages.length > 0) {
      setShowPreview(true);
      return;
    }
    setLoadingPreview(true);
    try {
      const res = await fetch(`${JOURNEY_API}/journey/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setJourneyTitle(data.journey?.title || `Journey #${slug}`);
        setShowPreview(true);
      }
    } catch {
      // silently fail
    }
    setLoadingPreview(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(journeyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Check out this learning journey: ${journeyTitle || "Knowledge Tree"}\n${journeyUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Check out this learning journey on @KnowledgeTree 🌳\n${journeyUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(journeyUrl)}`, "_blank");
  };

  const currentMessage = messages[previewDay];
  const parts = currentMessage ? parseContent(currentMessage.content) : [];
  const titlePart = parts.find((p) => p.type === "title");

  return (
    <div style={{ border: "1px solid var(--kt-border)", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px" }}>
        <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--kt-dark)" }}>
          Journey #{slug}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 4 }}>
          {/* Preview toggle */}
          <button
            onClick={handlePreview}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "5px 10px", borderRadius: 6, border: "1px solid var(--kt-border)",
              background: showPreview ? "rgba(11,74,36,0.06)" : "#fff",
              color: showPreview ? "var(--kt-green)" : "var(--kt-muted)",
              fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {loadingPreview ? <Spinner size={10} /> : (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 6s2-4 5-4 5 4 5 4-2 4-5 4S1 6 1 6z" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="6" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            )}
            {showPreview ? "Hide" : "Preview"}
          </button>

          {/* Open in new tab */}
          <a
            href={`/Journey/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "5px 10px", borderRadius: 6, border: "1px solid var(--kt-border)",
              background: "#fff", color: "var(--kt-muted)",
              fontSize: 11, fontWeight: 600, textDecoration: "none", fontFamily: "inherit",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M8 2L2 8M2 2h6v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Open
          </a>

          {/* Copy link */}
          <button
            onClick={handleCopy}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "5px 10px", borderRadius: 6, border: "1px solid var(--kt-border)",
              background: copied ? "#f0fdf4" : "#fff",
              color: copied ? "#16a34a" : "var(--kt-muted)",
              fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {copied ? "Copied!" : (
              <>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.1" />
                  <path d="M7 3V2a1 1 0 00-1-1H2a1 1 0 00-1 1v4a1 1 0 001 1h1" stroke="currentColor" strokeWidth="1.1" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>

        {/* Share icons */}
        <div style={{ display: "flex", gap: 3, marginLeft: 4 }}>
          <button onClick={shareOnWhatsApp} title="Share on WhatsApp" style={{ width: 26, height: 26, borderRadius: 6, border: "none", background: "#25D366", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
          </button>
          <button onClick={shareOnTwitter} title="Share on X" style={{ width: 26, height: 26, borderRadius: 6, border: "none", background: "#000", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </button>
          <button onClick={shareOnLinkedIn} title="Share on LinkedIn" style={{ width: 26, height: 26, borderRadius: 6, border: "none", background: "#0A66C2", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </button>
        </div>
      </div>

      {/* Inline preview */}
      {showPreview && messages.length > 0 && (
        <div style={{ borderTop: "1px solid var(--kt-border)", padding: "16px" }}>
          {/* Journey title */}
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--kt-dark)", marginBottom: 4 }}>
            {journeyTitle}
          </div>
          <div style={{ fontSize: 11, color: "var(--kt-muted)", marginBottom: 14 }}>
            {messages.length - 1} insights · {messages.length - 1} day journey
          </div>

          {/* Day navigation dots */}
          <div style={{ display: "flex", gap: 3, marginBottom: 14, flexWrap: "wrap" }}>
            {messages.map((_, i) => (
              <button
                key={i}
                onClick={() => setPreviewDay(i)}
                style={{
                  width: i === previewDay ? 20 : 8,
                  height: 8,
                  borderRadius: 999,
                  border: "none",
                  background: i === previewDay ? "var(--kt-green)" : "rgba(11,74,36,0.15)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  padding: 0,
                }}
              />
            ))}
          </div>

          {/* Message content */}
          <div style={{ background: "#fafbfa", borderRadius: 10, padding: "14px 16px", border: "1px solid var(--kt-border)" }}>
            {titlePart && (
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--kt-dark)", marginBottom: 8 }}>
                {previewDay === 0 ? "Overview" : `Day ${previewDay}`}: {titlePart.text}
              </div>
            )}
            {parts
              .filter((p) => p.type !== "title")
              .slice(0, 4)
              .map((p, i) => {
                if (p.type === "quote") {
                  return (
                    <div key={i} style={{ background: "#fffbeb", border: "1px solid #fef3c7", borderRadius: 8, padding: "8px 12px", margin: "8px 0", fontSize: 12, color: "#92400e", fontStyle: "italic", lineHeight: 1.5 }}>
                      &ldquo;{p.text}&rdquo;
                    </div>
                  );
                }
                return (
                  <p key={i} style={{ fontSize: 12, color: "var(--kt-text)", lineHeight: 1.6, margin: "6px 0" }}>
                    {p.text.length > 200 ? p.text.slice(0, 200) + "..." : p.text}
                  </p>
                );
              })}
          </div>

          {/* Nav buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
            <button
              onClick={() => setPreviewDay(Math.max(0, previewDay - 1))}
              disabled={previewDay === 0}
              style={{ fontSize: 12, fontWeight: 500, padding: "6px 12px", borderRadius: 6, border: "1px solid var(--kt-border)", background: "#fff", color: previewDay === 0 ? "var(--kt-border)" : "var(--kt-dark)", cursor: previewDay === 0 ? "default" : "pointer", fontFamily: "inherit" }}
            >
              ← Prev
            </button>
            <span style={{ fontSize: 11, color: "var(--kt-muted)", alignSelf: "center" }}>
              {previewDay === 0 ? "Overview" : `Day ${previewDay}`} of {messages.length - 1}
            </span>
            <button
              onClick={() => setPreviewDay(Math.min(messages.length - 1, previewDay + 1))}
              disabled={previewDay === messages.length - 1}
              style={{ fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 6, border: "none", background: previewDay === messages.length - 1 ? "var(--kt-border)" : "var(--kt-green)", color: previewDay === messages.length - 1 ? "var(--kt-muted)" : "#fff", cursor: previewDay === messages.length - 1 ? "default" : "pointer", fontFamily: "inherit" }}
            >
              Next →
            </button>
          </div>
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
