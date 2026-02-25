import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { webhooks } from "@/lib/webhooks"
import { useAuth } from "@/context/AuthContext"
import { formatCurrency } from "@/lib/utils"
import { leads as initialLeads, type Lead, type LeadStage } from "@/data/mockData"
import {
  Clock,
  User,
  MapPin,
  FileText,
  Calendar,
  UserCheck,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  X,
  TrendingUp,
} from "lucide-react"

const STAGES: LeadStage[] = [
  "Nuevo",
  "Contactado",
  "Visita Agendada",
  "Propuesta",
  "Negociación",
  "Firmado",
]

const STAGE_COLORS: Record<LeadStage, string> = {
  "Nuevo": "border-slate-500/30 bg-slate-500/10",
  "Contactado": "border-blue-500/30 bg-blue-500/10",
  "Visita Agendada": "border-amber-500/30 bg-amber-500/10",
  "Propuesta": "border-purple-500/30 bg-purple-500/10",
  "Negociación": "border-orange-500/30 bg-orange-500/10",
  "Firmado": "border-green-500/30 bg-green-500/10",
}

const STAGE_DOT_COLORS: Record<LeadStage, string> = {
  "Nuevo": "bg-slate-400",
  "Contactado": "bg-blue-400",
  "Visita Agendada": "bg-amber-400",
  "Propuesta": "bg-purple-400",
  "Negociación": "bg-orange-400",
  "Firmado": "bg-green-400",
}

const PROB_COLOR = (p: number) =>
  p >= 70 ? "text-green-400" : p >= 40 ? "text-amber-400" : "text-muted-foreground"

interface LeadCardProps {
  lead: Lead
  onAction: (action: string, lead: Lead) => void
  onStageChange: (lead: Lead, dir: 1 | -1) => void
}

function LeadCard({ lead, onAction, onStageChange }: LeadCardProps) {
  const [expanded, setExpanded] = useState(false)
  const stageIdx = STAGES.indexOf(lead.etapa)

  return (
    <div className="lead-card">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{lead.nombre}</p>
          <p className="text-xs text-muted-foreground">{lead.id}</p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-2 text-muted-foreground hover:text-foreground shrink-0"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Key info */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-primary font-semibold">
          <TrendingUp className="h-3 w-3" />
          {formatCurrency(lead.presupuesto)}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          {lead.asesor}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{lead.zona}</span>
        </div>
      </div>

      {/* Probability + time */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1 text-xs">
          <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${lead.probabilidad >= 70 ? "bg-green-500" : lead.probabilidad >= 40 ? "bg-amber-500" : "bg-muted-foreground/50"}`}
              style={{ width: `${lead.probabilidad}%` }}
            />
          </div>
          <span className={`font-medium ${PROB_COLOR(lead.probabilidad)}`}>{lead.probabilidad}%</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {lead.diasEnEtapa}d
        </div>
      </div>

      {/* Stage navigation */}
      <div className="flex gap-1 mb-2">
        <button
          onClick={() => onStageChange(lead, -1)}
          disabled={stageIdx === 0}
          className="flex-1 py-1 text-xs border border-border rounded-md hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Retroceder
        </button>
        <button
          onClick={() => onStageChange(lead, 1)}
          disabled={stageIdx === STAGES.length - 1}
          className="flex-1 py-1 text-xs border border-primary/30 text-primary rounded-md hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Avanzar →
        </button>
      </div>

      {/* Expanded actions */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5 animate-fade-in">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Acciones:</p>
          {[
            { label: "Generar Cotización", icon: FileText, action: "cotizacion" },
            { label: "Agendar Visita", icon: Calendar, action: "visita" },
            { label: "Derivar a Asesor", icon: UserCheck, action: "asesor" },
            { label: "Recordatorio Pago", icon: MessageSquare, action: "pago" },
          ].map((btn) => (
            <Button
              key={btn.action}
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-xs h-7"
              onClick={() => onAction(btn.action, lead)}
            >
              <btn.icon className="h-3.5 w-3.5" />
              {btn.label}
            </Button>
          ))}
          {lead.notas && (
            <div className="mt-2 p-2 bg-muted/40 rounded-md">
              <p className="text-xs text-muted-foreground">{lead.notas}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleAction = async (action: string, lead: Lead) => {
    const actionMap: Record<string, { label: string; fn: () => Promise<boolean> }> = {
      cotizacion: {
        label: "Cotización generada",
        fn: () => webhooks.generarCotizacion({ property_id: lead.id }),
      },
      visita: {
        label: "Visita agendada",
        fn: () => webhooks.agendarVisita({ contact_phone: lead.telefono }),
      },
      asesor: {
        label: "Lead derivado",
        fn: () => webhooks.derivarAsesor({ contact_phone: lead.telefono }),
      },
      pago: {
        label: "Recordatorio enviado",
        fn: () => webhooks.logActividad("recordatorio_pago", { leadId: lead.id, nombre: lead.nombre, telefono: lead.telefono }),
      },
    }

    const handler = actionMap[action]
    if (!handler) return

    handler.fn()
    webhooks.logActividad(`accion_lead_${action}`, {
      usuario: user?.email || "admin",
      leadId: lead.id,
      leadNombre: lead.nombre,
      accion: action,
    })

    toast({
      title: `✓ ${handler.label}`,
      description: `Webhook enviado para ${lead.nombre}`,
      variant: "success",
      duration: 3000,
    } as Parameters<typeof toast>[0])
  }

  const handleStageChange = (lead: Lead, dir: 1 | -1) => {
    const currentIdx = STAGES.indexOf(lead.etapa)
    const newIdx = currentIdx + dir
    if (newIdx < 0 || newIdx >= STAGES.length) return

    const newStage = STAGES[newIdx]
    setLeads((prev) =>
      prev.map((l) =>
        l.id === lead.id ? { ...l, etapa: newStage, diasEnEtapa: 0 } : l
      )
    )

    webhooks.logActividad("cambio_etapa_lead", {
      usuario: user?.email || "admin",
      leadId: lead.id,
      de: lead.etapa,
      a: newStage,
    })

    toast({
      title: `Lead avanzado`,
      description: `${lead.nombre} → ${newStage}`,
      duration: 2000,
    } as Parameters<typeof toast>[0])
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{leads.length} leads en pipeline</p>
        </div>
        <div className="flex gap-2">
          {selectedLead && (
            <Button variant="outline" size="sm" onClick={() => setSelectedLead(null)}>
              <X className="h-4 w-4 mr-1" /> Cerrar detalle
            </Button>
          )}
        </div>
      </div>

      {/* Kanban board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max">
          {STAGES.map((stage) => {
            const stageLeads = leads.filter((l) => l.etapa === stage)
            return (
              <div
                key={stage}
                className={`kanban-column w-60 flex-shrink-0 border ${STAGE_COLORS[stage]}`}
              >
                {/* Column header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${STAGE_DOT_COLORS[stage]}`} />
                    <h3 className="text-sm font-semibold">{stage}</h3>
                  </div>
                  <Badge variant="secondary" className="text-xs h-5 px-1.5">
                    {stageLeads.length}
                  </Badge>
                </div>

                {/* Cards */}
                <div className="space-y-2.5">
                  {stageLeads.length === 0 ? (
                    <div className="text-center py-8 text-xs text-muted-foreground/50">
                      Sin leads
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onAction={handleAction}
                        onStageChange={handleStageChange}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex flex-wrap gap-3 pt-2">
        {STAGES.map((stage) => {
          const count = leads.filter((l) => l.etapa === stage).length
          return (
            <div key={stage} className="flex items-center gap-2 text-xs">
              <div className={`h-2 w-2 rounded-full ${STAGE_DOT_COLORS[stage]}`} />
              <span className="text-muted-foreground">{stage}:</span>
              <span className="font-medium">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
