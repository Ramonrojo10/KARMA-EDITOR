const N8N_URL = import.meta.env.VITE_N8N_URL || "http://localhost:5678"

interface WebhookPayload {
  [key: string]: unknown
}

// Fire-and-forget — no espera respuesta de n8n
async function postWebhook(path: string, payload: WebhookPayload): Promise<boolean> {
  try {
    const response = await fetch(`${N8N_URL}/webhook/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    })
    return response.ok
  } catch {
    // Silent fail - demo works without n8n
    return false
  }
}

// Chat síncrono — espera la respuesta IA de n8n (hasta 20s)
// n8n debe responder con: { "respuesta": "..." }
async function postWebhookChat(path: string, payload: WebhookPayload): Promise<string | null> {
  try {
    const response = await fetch(`${N8N_URL}/webhook/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000),
    })
    if (!response.ok) return null
    const data = await response.json()
    // Acepta cualquiera de estos campos de respuesta del nodo de n8n
    return (
      data?.respuesta ??
      data?.message ??
      data?.output ??
      data?.text ??
      null
    )
  } catch {
    return null
  }
}

export const webhooks = {
  generarCotizacion: (leadData: WebhookPayload) =>
    postWebhook("cotizacion", { ...leadData, timestamp: new Date().toISOString() }),

  agendarVisita: (leadData: WebhookPayload) =>
    postWebhook("agendar-visita", { ...leadData, timestamp: new Date().toISOString() }),

  derivarAsesor: (leadData: WebhookPayload) =>
    postWebhook("derivar-asesor", { ...leadData, timestamp: new Date().toISOString() }),

  recordatorioPago: (leadData: WebhookPayload) =>
    postWebhook("recordatorio-pago", { ...leadData, timestamp: new Date().toISOString() }),

  escalarHumano: (chatData: WebhookPayload) =>
    postWebhook("escalar-humano", { ...chatData, timestamp: new Date().toISOString() }),

  iaRetomaConversacion: (chatData: WebhookPayload) =>
    postWebhook("ia-retoma", { ...chatData, timestamp: new Date().toISOString() }),

  logActividad: (accion: string, usuario: string, datos: WebhookPayload) =>
    postWebhook("log-actividad", {
      accion,
      usuario,
      timestamp: new Date().toISOString(),
      datos,
    }),

  // Notifica a n8n que llegó un nuevo lead desde la landing
  contactoIniciado: (lead: { nombre: string; email: string; telefono: string; mensaje: string }) =>
    postWebhook("contacto-landing", {
      ...lead,
      fuente: "landing-page",
      timestamp: new Date().toISOString(),
    }),

  // Envía mensaje del visitante a n8n y espera respuesta IA
  // Payload que recibe n8n:
  //   lead: { nombre, email, telefono, mensaje }
  //   historial: [{ role: "user"|"ia", content: string }, ...]
  //   mensajeActual: string
  chatLanding: (
    lead: { nombre: string; email: string; telefono: string; mensaje: string },
    historial: { role: "user" | "ia"; content: string }[],
    mensajeActual: string
  ) =>
    postWebhookChat("chat-landing", {
      lead,
      historial,
      mensajeActual,
      timestamp: new Date().toISOString(),
    }),
}

