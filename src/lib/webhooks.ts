/**
 * Webhooks — landing page → n8n CRM_IA_MASTER_WORKFLOW
 *
 * Paths match the n8n workflow triggers exactly:
 *   lead-created, chat-message, request-visit, request-info, manual-followup
 *
 * VITE_N8N_URL must point to your n8n instance (e.g. https://n8n2.0.karmaops.online)
 */

const N8N_URL = import.meta.env.VITE_N8N_URL || "https://n8n2.0.karmaops.online"

interface WebhookPayload {
  [key: string]: unknown
}

// ─── Session lead ID (stable for the browser tab) ─────────────────────────────
// Generated on first form submit; reused for all subsequent chat messages.
let _sessionLeadId: string | null = null

function getSessionLeadId(): string {
  if (_sessionLeadId) return _sessionLeadId
  const stored = sessionStorage.getItem("shitou_lead_id")
  if (stored) { _sessionLeadId = stored; return stored }
  const id = crypto.randomUUID()
  sessionStorage.setItem("shitou_lead_id", id)
  _sessionLeadId = id
  return id
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

/** Fire-and-forget POST — doesn't block UI */
async function postWebhook(path: string, payload: WebhookPayload): Promise<boolean> {
  try {
    const response = await fetch(`${N8N_URL}/webhook/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    })
    return response.ok
  } catch {
    return false
  }
}

/** Synchronous POST — waits up to 20s for IA reply */
async function postWebhookSync(path: string, payload: WebhookPayload): Promise<WebhookPayload | null> {
  try {
    const response = await fetch(`${N8N_URL}/webhook/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000),
    })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

// ─── Webhook exports ──────────────────────────────────────────────────────────

export const webhooks = {

  /**
   * Triggered when the visitor submits the contact form.
   * Creates a new lead in crm_leads (or updates if same UUID).
   * Returns the assigned lead_id so we can reuse it in chat.
   */
  contactoIniciado: async (lead: {
    nombre: string
    email: string
    telefono: string
    mensaje: string
  }): Promise<{ lead_id?: string } | null> => {
    const lead_id = getSessionLeadId()
    const result = await postWebhookSync("lead-created", {
      lead_id,
      nombre:          lead.nombre,
      email:           lead.email || undefined,
      telefono:        lead.telefono || undefined,
      source:          "landing-page",
      referrer:        document.referrer || "direct",
      user_agent:      navigator.userAgent,
      time_on_page:    Math.round((Date.now() - _pageLoadTime) / 1000),
    })
    return result as { lead_id?: string } | null
  },

  /**
   * Sends a chat message to n8n GPT and waits for the IA reply.
   * n8n responds with: { reply: "...", score: N, lead_class: "..." }
   */
  chatLanding: async (
    lead: { nombre: string; email: string; telefono: string; mensaje: string },
    historial: { role: "user" | "ia"; content: string }[],
    mensajeActual: string
  ): Promise<string | null> => {
    const lead_id = getSessionLeadId()
    const data = await postWebhookSync("chat-message", {
      lead_id,
      message: mensajeActual,
      context: {
        time_on_page:   Math.round((Date.now() - _pageLoadTime) / 1000),
        page_history:   historial.map(h => h.content).slice(-4),
      },
      metadata: {
        session_id: lead_id,
        timestamp:  Date.now(),
        // Pass lead contact info so n8n can enrich the lead if needed
        lead_nombre:   lead.nombre,
        lead_email:    lead.email,
        lead_telefono: lead.telefono,
      },
    })
    if (!data) return null
    // Accept multiple response field names
    return (
      (data.reply    as string | undefined) ??
      (data.message  as string | undefined) ??
      (data.respuesta as string | undefined) ??
      (data.output   as string | undefined) ??
      (data.text     as string | undefined) ??
      null
    )
  },

  /** Visitor clicks "Agendar visita" button */
  agendarVisita: (visitData: {
    property_id?: string
    preferred_date?: string
    contact_phone?: string
  }) =>
    postWebhook("request-visit", {
      lead_id:        getSessionLeadId(),
      action:         "request-visit",
      source:         "landing-page",
      ...visitData,
    }),

  /** Visitor requests property info sheet / PDF */
  generarCotizacion: (info: { property_id?: string; email?: string }) =>
    postWebhook("request-info", {
      lead_id:  getSessionLeadId(),
      action:   "request-info",
      source:   "landing-page",
      ...info,
    }),

  /** Visitor explicitly requests a call */
  derivarAsesor: (data: { preferred_time?: string; contact_phone?: string }) =>
    postWebhook("request-call", {
      lead_id:  getSessionLeadId(),
      action:   "request-call",
      source:   "landing-page",
      ...data,
    }),

  /** Log a generic activity (analytics) */
  logActividad: (accion: string, datos: WebhookPayload = {}) =>
    postWebhook("property-viewed", {
      lead_id:  getSessionLeadId(),
      action:   accion,
      source:   "landing-page",
      ...datos,
    }),
}

// Track how long the visitor has been on the page
const _pageLoadTime = Date.now()
