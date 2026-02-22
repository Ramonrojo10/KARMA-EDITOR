const N8N_URL = import.meta.env.VITE_N8N_URL || "http://localhost:5678"

interface WebhookPayload {
  [key: string]: unknown
}

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
}
