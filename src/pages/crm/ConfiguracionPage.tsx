import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import {
  Settings,
  User,
  Webhook,
  Bell,
  Shield,
  CheckCircle2,
  Building2,
  Globe,
  Key,
} from "lucide-react"

const N8N_URL = import.meta.env.VITE_N8N_URL || "http://localhost:5678"

export default function ConfiguracionPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [n8nUrl, setN8nUrl] = useState(N8N_URL)
  const [notifications, setNotifications] = useState({
    nuevoLead: true,
    pagosAtrasados: true,
    cierreCercano: true,
    reporteSemanal: false,
  })

  const handleSave = () => {
    toast({
      title: "Configuración guardada",
      description: "Los cambios se aplicaron correctamente",
      variant: "success",
      duration: 2500,
    } as Parameters<typeof toast>[0])
  }

  const handleTestWebhook = async () => {
    try {
      await fetch(`${n8nUrl}/webhook/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true, timestamp: new Date().toISOString() }),
        signal: AbortSignal.timeout(5000),
      })
      toast({
        title: "Webhook respondió",
        description: "Conexión exitosa con n8n",
        variant: "success",
        duration: 3000,
      } as Parameters<typeof toast>[0])
    } catch {
      toast({
        title: "Sin conexión a n8n",
        description: "El CRM funciona en modo demo. Los webhooks se enviarán cuando n8n esté disponible.",
        duration: 4000,
      } as Parameters<typeof toast>[0])
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Perfil de usuario
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
            <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
              {user?.avatar || "AD"}
            </div>
            <div>
              <p className="font-semibold">{user?.nombre}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge variant="gold" className="mt-1 text-xs">{user?.rol}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">Nombre</Label>
              <Input defaultValue={user?.nombre} />
            </div>
            <div>
              <Label className="mb-1.5 block">Email</Label>
              <Input defaultValue={user?.email} disabled />
            </div>
          </div>
          <Button onClick={handleSave} variant="gold" size="sm">Guardar cambios</Button>
        </CardContent>
      </Card>

      {/* N8N Config */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Webhook className="h-4 w-4 text-primary" />
            Integración N8N
          </CardTitle>
          <CardDescription>
            URL del servidor de automatizaciones. Los webhooks se envían silenciosamente si no hay conexión.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-1.5 block flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              URL de N8N
            </Label>
            <div className="flex gap-2">
              <Input
                value={n8nUrl}
                onChange={(e) => setN8nUrl(e.target.value)}
                placeholder="http://localhost:5678"
                className="font-mono text-sm"
              />
              <Button variant="outline" size="sm" onClick={handleTestWebhook}>
                Probar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Variable de entorno: <code className="bg-muted px-1 rounded text-primary">VITE_N8N_URL</code>
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Webhooks configurados:</p>
            <div className="space-y-2">
              {[
                { path: "/webhook/cotizacion", label: "Generar cotización" },
                { path: "/webhook/agendar-visita", label: "Agendar visita" },
                { path: "/webhook/derivar-asesor", label: "Derivar a asesor" },
                { path: "/webhook/recordatorio-pago", label: "Recordatorio de pago" },
                { path: "/webhook/escalar-humano", label: "Escalar a humano (Chat)" },
                { path: "/webhook/ia-retoma", label: "IA retoma conversación" },
                { path: "/webhook/log-actividad", label: "Log de actividad (Postgres)" },
              ].map((wh) => (
                <div key={wh.path} className="flex items-center gap-3 p-2.5 bg-muted/30 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{wh.label}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">{n8nUrl}{wh.path}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} variant="gold" size="sm">Guardar configuración</Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: "nuevoLead" as const, label: "Nuevo lead ingresado", desc: "Alerta cuando llega un lead nuevo al pipeline" },
            { key: "pagosAtrasados" as const, label: "Pagos atrasados", desc: "Recordatorio diario de cartera vencida" },
            { key: "cierreCercano" as const, label: "Cierre cercano", desc: "Leads en Negociación con alta probabilidad" },
            { key: "reporteSemanal" as const, label: "Reporte semanal", desc: "Resumen de KPIs cada lunes" },
          ].map((n) => (
            <div key={n.key} className="flex items-center justify-between p-3 border border-border rounded-xl">
              <div>
                <p className="text-sm font-medium">{n.label}</p>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </div>
              <button
                onClick={() => setNotifications((prev) => ({ ...prev, [n.key]: !prev[n.key] }))}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  notifications[n.key] ? "bg-primary" : "bg-border"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications[n.key] ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
          <Button onClick={handleSave} variant="gold" size="sm">Guardar preferencias</Button>
        </CardContent>
      </Card>

      {/* System info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Información del sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { icon: Building2, label: "Empresa", value: "Shitoushui Inmobiliaria" },
              { icon: Key, label: "Versión CRM", value: "v1.0.0 — Demo 2026" },
              { icon: Settings, label: "Stack", value: "Vite + React + TypeScript + shadcn/ui" },
              { icon: Webhook, label: "Automatizaciones", value: "n8n (modo demo activo)" },
            ].map((info) => (
              <div key={info.label} className="flex items-center gap-3">
                <info.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground w-36">{info.label}:</span>
                <span className="text-sm font-medium">{info.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
