/**
 * Creator API — auth + playlist builder
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.ktree.uk";

const TOKEN_KEY = "ktree_creator_token";

/* ── Token management ── */

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/* ── Authed fetch helper ── */

async function creatorFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(`${API_BASE}${path}`, { ...options, headers });
}

/* ── Types ── */

export interface Creator {
  id: string;
  email: string;
  displayName: string;
  channelUrl?: string;
  createdAt?: string;
  playlistCount?: number;
}

export interface AuthResponse {
  token: string;
  creator: Creator;
}

export interface PlaylistVideo {
  id: string;
  video_url: string;
  title: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  error_message: string | null;
  journey_slugs: string[];
  pipeline_result: {
    overview?: { hook?: string; summary?: string; speaker?: string; themes?: string[]; estimatedDays?: number };
    spines?: Array<{ id: string; title: string; summary: string; insightIds?: string[] }>;
    insights?: Array<{ id: string; title: string; insight: string; evidence: string[] }>;
    quotes?: Array<{ text: string; speaker?: string; theme: string }>;
  } | null;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  created_at: string;
}

export interface Playlist {
  id: string;
  title: string;
  status: "pending" | "processing" | "completed" | "failed";
  videoCount: number;
  completedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistDetail {
  playlist: Playlist;
  videos: PlaylistVideo[];
}

/* ── Auth endpoints ── */

export async function registerCreator(
  email: string,
  password: string,
  displayName?: string,
  channelUrl?: string
): Promise<{ success: boolean; data?: AuthResponse; error?: string }> {
  try {
    const res = await creatorFetch("/creator/register", {
      method: "POST",
      body: JSON.stringify({ email, password, displayName, channelUrl }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || "Registration failed" };
    setToken(data.token);
    return { success: true, data };
  } catch {
    return { success: false, error: "Network error" };
  }
}

export async function loginCreator(
  email: string,
  password: string
): Promise<{ success: boolean; data?: AuthResponse; error?: string }> {
  try {
    const res = await creatorFetch("/creator/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || "Login failed" };
    setToken(data.token);
    return { success: true, data };
  } catch {
    return { success: false, error: "Network error" };
  }
}

export async function getCreatorProfile(): Promise<{ success: boolean; data?: { creator: Creator }; error?: string }> {
  try {
    const res = await creatorFetch("/creator/me");
    if (!res.ok) {
      if (res.status === 401) clearToken();
      return { success: false, error: "Not authenticated" };
    }
    return { success: true, data: await res.json() };
  } catch {
    return { success: false, error: "Network error" };
  }
}

export function logoutCreator(): void {
  clearToken();
}

/* ── Playlist endpoints ── */

export async function createPlaylist(
  title: string,
  videoUrls: string[]
): Promise<{ success: boolean; data?: { playlist: Playlist & { videos: PlaylistVideo[] } }; error?: string }> {
  try {
    const res = await creatorFetch("/creator/playlists", {
      method: "POST",
      body: JSON.stringify({ title, videoUrls }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || "Failed to create playlist" };
    return { success: true, data };
  } catch {
    return { success: false, error: "Network error" };
  }
}

export async function listPlaylists(): Promise<{ success: boolean; data?: { playlists: Playlist[] }; error?: string }> {
  try {
    const res = await creatorFetch("/creator/playlists");
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || "Failed to fetch playlists" };
    return { success: true, data };
  } catch {
    return { success: false, error: "Network error" };
  }
}

export async function getPlaylist(id: string): Promise<{ success: boolean; data?: PlaylistDetail; error?: string }> {
  try {
    const res = await creatorFetch(`/creator/playlists/${id}`);
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || "Failed to fetch playlist" };
    return { success: true, data };
  } catch {
    return { success: false, error: "Network error" };
  }
}
