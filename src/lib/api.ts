/**
 * API helpers — wired to the live ktree backend at Render.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://success-bikini-rip-limited.trycloudflare.com";
const WEBHOOK_NOTIFY = "https://n8n.srv1196471.hstgr.cloud/webhook/43e0fd4c-4b42-4464-a9e0-42ee50d3cdf0";
const WHATSAPP_LINK = "https://wa.me/250791276393";

/* ── Types ── */

export interface SignupPayload {
  fullName: string;
  whatsapp: string;
  email: string;
  country: string;
  deliveryTimes: string[];
  journeys: string[];
}

export interface NotifyPayload {
  name: string;
  phone: string;
  email: string;
  journey: string;
  timestamp: string;
}

export interface ExtractPayload {
  youtubeUrl: string;
}

export interface Spine {
  id: string;
  title: string;
  summary: string;
  targetOutcome: string;
  insightIds?: string[];
}

export interface Insight {
  id: string;
  title: string;
  insight: string;
  evidence: string[];
}

export interface Quote {
  text: string;
  speaker?: string;
  timestamp?: string;
  theme: string;
}

export interface VideoOverview {
  hook: string;
  summary: string;
  themes: string[];
  contentType: string;
  speaker?: string;
  estimatedDays: number;
}

export interface PipelineResult {
  overview?: VideoOverview;
  speakers?: string[];
  spines: Spine[];
  insights: Insight[];
  quotes: Quote[];
}

export interface JourneyMessage {
  day: number;
  sequence: number;
  formatted: string;
}

/* ── Pipeline API ── */

/** Run the full pipeline: transcript → insights → quotes → arc spines */
export async function generateArcs(videoUrl: string): Promise<PipelineResult> {
  const res = await fetch(`${API_BASE}/generate-arcs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ videoUrl }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Pipeline failed" }));
    throw new Error(err.error || `Pipeline failed (${res.status})`);
  }
  return res.json();
}

/** Generate a WhatsApp-ready journey from a selected arc spine */
export async function generateJourney(
  spine: Spine,
  insights: Insight[],
  quotes: Quote[]
): Promise<{ journey: JourneyMessage[] }> {
  const res = await fetch(`${API_BASE}/generate-journey`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ spine, insights, quotes }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Journey generation failed" }));
    throw new Error(err.error || `Journey generation failed (${res.status})`);
  }
  return res.json();
}

/* ── Legacy helpers (signup / waitlist) ── */

/** Submit the main signup form */
export async function submitSignup(payload: SignupPayload): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      window.location.href = `${WHATSAPP_LINK}?text=Hi%20Knowledge%20Tree%20Bot%20-%20unlock%20my%20learning%20journey!`;
      return true;
    }
    return false;
  } catch (err) {
    console.error("Signup error:", err);
    return false;
  }
}

/** Submit waitlist notification */
export async function submitNotify(payload: NotifyPayload): Promise<boolean> {
  try {
    const res = await fetch(WEBHOOK_NOTIFY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (err) {
    console.error("Notify error:", err);
    return false;
  }
}

/**
 * Extract insights from a YouTube URL (calls the real pipeline).
 * This is the main entry point used by the Hero component.
 */
export async function extractInsights(payload: ExtractPayload): Promise<{
  success: boolean;
  data?: PipelineResult;
  message?: string;
  error?: string;
}> {
  try {
    const data = await generateArcs(payload.youtubeUrl);
    return {
      success: true,
      data,
      message: `Found ${data.spines?.length || 0} learning journeys, ${data.insights?.length || 0} insights, and ${data.quotes?.length || 0} quotes.`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return { success: false, error: message };
  }
}
