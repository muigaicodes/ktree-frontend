/**
 * API helpers — placeholder functions for the CTO to connect to the real backend.
 *
 * Current backend:
 *   - Webhook: https://n8n.srv1196471.hstgr.cloud/webhook/knowledgtree (main form)
 *   - Webhook: https://n8n.srv1196471.hstgr.cloud/webhook/43e0fd4c-... (waitlist notify)
 *   - WhatsApp redirect: https://wa.me/250791276393
 *
 * TODO (CTO): Replace these with real API calls to your pipeline backend.
 */

const WEBHOOK_MAIN = "https://n8n.srv1196471.hstgr.cloud/webhook/knowledgtree";
const WEBHOOK_NOTIFY = "https://n8n.srv1196471.hstgr.cloud/webhook/43e0fd4c-4b42-4464-a9e0-42ee50d3cdf0";
const WHATSAPP_LINK = "https://wa.me/250791276393";

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

/** Submit the main signup form */
export async function submitSignup(payload: SignupPayload): Promise<boolean> {
  try {
    const res = await fetch(WEBHOOK_MAIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      // Redirect to WhatsApp after successful submission
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
 * Extract insights from a YouTube URL.
 *
 * TODO (CTO): Connect this to your LLM pipeline backend.
 * Expected flow:
 *   1. POST the YouTube URL to your pipeline API
 *   2. Backend processes video → extracts transcript → runs LLM → returns insights
 *   3. Return the insights to the frontend
 *
 * For now this returns a placeholder response.
 */
export async function extractInsights(payload: ExtractPayload): Promise<{
  success: boolean;
  jobId?: string;
  message?: string;
}> {
  // TODO: Replace with real API call
  // const res = await fetch('/api/extract', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // });
  // return res.json();

  console.log("Extract insights called with:", payload.youtubeUrl);

  // Simulate processing
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        jobId: "placeholder-" + Date.now(),
        message: "Job submitted! Your video is being processed. It usually takes a few minutes.",
      });
    }, 1500);
  });
}
