import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { webhooks } from "@/lib/webhooks"
import { useAuth } from "@/context/AuthContext"
import { pagosCobranza } from "@/data/mockData"
import { formatCurrency, formatDate } from "@/lib/utils"
import { MessageSquare, AlertTriangle, CheckCircle2, Clock, DollarSign, TrendingDown } from "lucide-react"

const statusConfig = {
  al_dia: { label: "Al día", variant: "success" as const, icon: CheckCircle2, color: "text-green-400" },
  pendiente: { label: "Pendiente", variant: "warning" as const, icon: Clock, color: "text-amber-400" },
  atrasado: { label: "Atrasado", variant: "error" as const, icon: AlertTriangle, color: "text-red-400" },
}

type FilterType = "todos" | "al_dia" | "pendiente" | "atrasado"

export default function CobranzaPage() {
  const [filter, setFilter] = useState<FilterType>("todos")
  const { toast } = useToast()
  const { user } = useAuth()

  const filtered = filter === "todos" ? pagosCobranza : pagosCobranza.filter((p) => p.status === filter)

  const totales = {
    al_dia: pagosCobranza.filter((p) => p.status === "al_dia").length,
    pendiente: pagosCobranza.filter((p) => p.status === "pendiente").length,
    atrasado: pagosCobranza.filter((p) => p.status === "atrasado").length,
    montoAtrasado: pagosCobranza
      .filter((p) => p.status === "atrasado")
      .reduce((acc, p) => acc + p.monto, 0),
    montoPendiente: pagosCobranza
      .filter((p) => p.status === "pendiente")
      .reduce((acc, p) => acc + p.monto, 0),
  }

  const handleRecordatorio = async (pago: typeof pagosCobranza[0]) => {
    webhooks.logActividad("recordatorio_pago_enviado", {
      usuario: user?.email || "admin",
      pagoId: pago.id,
      lead: pago.lead,
      propiedad: pago.propiedad,
      monto: pago.monto,
      telefono: pago.telefono,
      diasVencido: pago.diasVencido,
    })
    toast({
      title: "Recordatorio enviado",
      description: `WhatsApp enviado a ${pago.lead}`,
      variant: "success",
      duration: 3000,
    } as Parameters<typeof toast>[0])
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span className="text-xs text-muted-foreground">Al día</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{totales.al_dia}</p>
            <p className="text-xs text-muted-foreground">pagos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-muted-foreground">Pendiente</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">{totales.pendiente}</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(totales.montoPendiente)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-xs text-muted-foreground">Atrasado</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{totales.atrasado}</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(totales.montoAtrasado)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-400" />
              <span className="text-xs text-muted-foreground">Cartera vencida</span>
            </div>
            <p className="text-xl font-bold text-primary">{formatCurrency(totales.montoAtrasado)}</p>
            <p className="text-xs text-muted-foreground">MXN total</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Cartera de Cobranza
            </CardTitle>
            {/* Filters */}
            <div className="flex gap-1.5 flex-wrap">
              {([
                { key: "todos", label: "Todos" },
                { key: "al_dia", label: "Al día" },
                { key: "pendiente", label: "Pendiente" },
                { key: "atrasado", label: "Atrasado" },
              ] as { key: FilterType; label: string }[]).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                    filter === f.key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Cliente", "Propiedad", "Monto", "Vencimiento", "Atraso", "Asesor", "Estado", "Acción"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((pago) => {
                  const cfg = statusConfig[pago.status]
                  return (
                    <tr key={pago.id} className="border-b border-border/40 hover:bg-accent/20 transition-colors">
                      <td className="py-2.5 px-3">
                        <p className="font-medium text-xs whitespace-nowrap">{pago.lead}</p>
                        <p className="text-xs text-muted-foreground">{pago.telefono}</p>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-muted-foreground whitespace-nowrap">{pago.propiedad}</td>
                      <td className="py-2.5 px-3 font-semibold text-primary whitespace-nowrap">
                        {formatCurrency(pago.monto)}
                      </td>
                      <td className="py-2.5 px-3 text-xs whitespace-nowrap">{formatDate(pago.fechaVencimiento)}</td>
                      <td className="py-2.5 px-3">
                        {pago.diasVencido > 0 ? (
                          <span className="text-red-400 text-xs font-medium">{pago.diasVencido}d</span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-xs whitespace-nowrap">{pago.asesor.split(" ")[0]}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant={cfg.variant} className="text-[10px] gap-1 whitespace-nowrap">
                          <cfg.icon className="h-2.5 w-2.5" />
                          {cfg.label}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-xs h-7 whitespace-nowrap"
                          onClick={() => handleRecordatorio(pago)}
                        >
                          <MessageSquare className="h-3 w-3" />
                          WhatsApp
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-400/30" />
              <p>No hay registros en esta categoría</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
