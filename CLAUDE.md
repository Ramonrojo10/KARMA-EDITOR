# KARMA EDITOR — Contexto del Proyecto

## Stack
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Base de datos**: PostgreSQL — base `karma_editor`
- **Automatización**: n8n en `https://n8n2.0.karmaops.online`
- **MCP**: n8n-mcp configurado en `.mcp.json` → usar siempre para crear/modificar workflows directamente

## Tablas PostgreSQL (karma_editor)
```
crm_actividad | crm_chat_mensajes | crm_embajadores | crm_leads
crm_pagos     | crm_propiedades   | executions      | settings
users         | videos
```

### crm_leads (tabla principal de leads)
```sql
id             VARCHAR(10)   PK NOT NULL
nombre         VARCHAR(255)  NOT NULL
email          VARCHAR(255)
telefono       VARCHAR(50)
presupuesto    NUMERIC(12,2)
zona           VARCHAR(255)
asesor         VARCHAR(255)
etapa          VARCHAR(50)   DEFAULT 'Nuevo'
probabilidad   INTEGER       DEFAULT 10
dias_en_etapa  INTEGER       DEFAULT 0
fuente         VARCHAR(100)
notas          TEXT          ← lo genera la IA (resumen estructurado para el asesor)
fecha_creacion DATE          DEFAULT CURRENT_DATE
created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
updated_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
```

## Webhooks de n8n (src/lib/webhooks.ts)

### `contacto-landing` (POST, fire-and-forget)
Se dispara cuando el visitante envía el formulario de la landing.
Payload:
```json
{
  "nombre": "...",
  "email": "...",
  "telefono": "...",
  "interes_inicial": "...",   // texto libre del form, NO va a notas
  "fuente": "landing-page",
  "etapa": "Nuevo",
  "probabilidad": 10,
  "timestamp": "..."
}
```
**n8n debe**: INSERT en `crm_leads` (generar `id` tipo `L001`), `notas = null` inicialmente.

### `chat-landing` (POST, síncrono — espera respuesta IA hasta 20s)
Se dispara en cada mensaje del visitante durante el chat de la landing.
Payload:
```json
{
  "lead": { "nombre", "email", "telefono", "interes_inicial" },
  "historial": [{ "role": "user"|"ia", "content": "..." }],
  "mensajeActual": "...",
  "timestamp": "..."
}
```
**n8n debe**:
1. Responder con `{ "respuesta": "..." }` para el chat
2. Actualizar `crm_leads.notas` con resumen estructurado (zona, presupuesto, tipo, disponibilidad, etc.)

### Otros webhooks existentes
- `cotizacion` — generar cotización para un lead
- `agendar-visita` — agendar visita
- `derivar-asesor` — derivar lead a asesor
- `recordatorio-pago` — recordatorio de pago
- `escalar-humano` — escalar chat a agente humano
- `ia-retoma` — IA retoma conversación tras agente humano
- `log-actividad` — log de acciones en el CRM

## Decisiones tomadas
- `notas` en `crm_leads` = resumen **generado por la IA** durante el chat, NO es el mensaje del formulario
- `interes_inicial` = texto libre del formulario (contexto para la IA, no se almacena directamente)
- El frontend usa mockData local mientras no haya integración con DB

## Branch activo
`claude/list-postgres-tables-w0CkO`

## Pendiente (próxima sesión)
- Crear workflows en n8n usando MCP:
  1. `contacto-landing` → INSERT en `crm_leads`
  2. `chat-landing` → respuesta IA + UPDATE `crm_leads.notas`
