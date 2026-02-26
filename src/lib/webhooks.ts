/**
 * Webhooks — landing page → n8n CRM_CHAT_WORKFLOW
 *
 * Single endpoint: POST /webhook/chat-message
 * - First contact: send nombre + email + telefono + message (creates lead in DB)
 * - Returning user: send lead_id (from localStorage) + message
 *
 * VITE_N8N_URL must point to your n8n instance (e.g. https://n8n2.0.karmaops.online)
 */

const N8N_URL = import.meta.env.VITE_N8N_URL || "https://n8n2.0.karmaops.online"

const LEAD_KEY        = "karma_lead_id"
const LEAD_NOMBRE_KEY = "karma_lead_nombre"
const LEAD_EMAIL_KEY  = "karma_lead_email"

// ─── Stored session helpers ───────────────────────────────────────────────────

export function getStoredLeadId(): string | null {
  return localStorage.getItem(LEAD_KEY)
}

export function getStoredLeadNombre(): string | null {
  return localStorage.getItem(LEAD_NOMBRE_KEY)
}

function storeLeadSession(lead_id: string, nombre: string, email: string) {
  localStorage.setItem(LEAD_KEY, lead_id)
  localStorage.setItem(LEAD_NOMBRE_KEY, nombre)
  localStorage.setItem(LEAD_EMAIL_KEY, email)
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

async function postWebhookSync(
  path: string,
  payload: Record<string, unknown>
): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${N8N_URL}/webhook/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// ─── Webhook exports ──────────────────────────────────────────────────────────

export const webhooks = {
  /**
   * Send a chat message to n8n and wait for the AI reply.
   *
   * First contact (no lead_id in localStorage):
   *   Pass nombre + email + telefono — n8n creates the lead in crm_leads.
   *
   * Returning user (lead_id in localStorage):
   *   Only pass lead_id + message — n8n looks up existing lead.
   *
   * On success, stores the DB-assigned lead_id (e.g. "L0042") in localStorage.
   * Returns { reply, lead_id } or { reply: null, lead_id: null } on failure.
   */
  chatMessage: async (params: {
    nombre?: string
    email?: string
    telefono?: string
    message: string
  }): Promise<{ reply: string | null; lead_id: string | null }> => {
    const storedLeadId = getStoredLeadId()

    const payload: Record<string, unknown> = { message: params.message }

    if (storedLeadId) {
      payload.lead_id = storedLeadId
    } else {
      payload.nombre = params.nombre
      payload.email  = params.email
      if (params.telefono) payload.telefono = params.telefono
    }

    const data = await postWebhookSync("chat-message", payload)
    if (!data) return { reply: null, lead_id: null }

    // Persist lead_id the first time n8n returns it
    const returnedLeadId = data.lead_id as string | undefined
    if (returnedLeadId && !storedLeadId && params.nombre && params.email) {
      storeLeadSession(returnedLeadId, params.nombre, params.email)
    }

    const reply =
      (data.reply     as string | undefined) ??
      (data.message   as string | undefined) ??
      (data.respuesta as string | undefined) ??
      null

    return { reply, lead_id: returnedLeadId ?? storedLeadId ?? null }
  },

  /**
   * Stub kept for CRM internal pages that call logActividad.
   * No longer fires a webhook — chat history is stored by CRM_CHAT_WORKFLOW.
   */
  logActividad: (_accion: string, _datos: Record<string, unknown> = {}): Promise<boolean> =>
    Promise.resolve(false),
}

// Track how long the visitor has been on the page
export const _pageLoadTime = Date.now()
