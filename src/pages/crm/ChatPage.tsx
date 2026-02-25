import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { webhooks } from "@/lib/webhooks"
import { useAuth } from "@/context/AuthContext"
import { chatHistoryInitial, type ChatMessage } from "@/data/mockData"
import { formatCurrency } from "@/lib/utils"
import {
  Send,
  Bot,
  User,
  Headphones,
  RotateCcw,
  MapPin,
  DollarSign,
  Target,
  Clock,
  Zap,
} from "lucide-react"

const LEAD_PROFILE = {
  nombre: "Jorge Villanueva Castro",
  presupuesto: 2000000,
  zona: "Juriquilla, Querétaro",
  tipo: "Departamento",
  recamaras: 3,
  uso: "Habitacional",
  probabilidad: 65,
  etapa: "Visita Agendada",
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isLead = msg.role === "lead"
  const isIA = msg.role === "ia"
  const isHuman = msg.role === "human_agent"

  const time = new Date(msg.timestamp).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  })

  if (isLead) {
    return (
      <div className="flex justify-end mb-3">
        <div>
          <div className="chat-bubble-user">{msg.content}</div>
          <p className="text-xs text-muted-foreground text-right mt-1 mr-1">{time}</p>
        </div>
        <div className="ml-2 h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 self-end mb-5">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2 mb-3">
      <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${isIA ? "bg-primary/20" : "bg-blue-500/20"}`}>
        {isIA ? (
          <Bot className="h-3.5 w-3.5 text-primary" />
        ) : (
          <Headphones className="h-3.5 w-3.5 text-blue-400" />
        )}
      </div>
      <div className="max-w-[75%]">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs font-medium">{msg.agentName}</p>
          {isIA && <Badge variant="gold" className="text-[10px] px-1.5 py-0">IA</Badge>}
          {isHuman && <Badge variant="info" className="text-[10px] px-1.5 py-0">Asesor</Badge>}
        </div>
        <div className={isIA ? "chat-bubble-ia" : "chat-bubble-human"}>
          {msg.content}
        </div>
        <p className="text-xs text-muted-foreground mt-1 ml-1">{time}</p>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(chatHistoryInitial)
  const [inputValue, setInputValue] = useState("")
  const [isIAActive, setIsIAActive] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = () => {
    if (!inputValue.trim()) return

    const newMsg: ChatMessage = {
      id: `M${Date.now()}`,
      role: "lead",
      content: inputValue,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, newMsg])
    setInputValue("")

    webhooks.logActividad("chat_mensaje_enviado", {
      usuario: user?.email || "admin",
      mensaje: inputValue,
      iaActiva: isIAActive,
    })

    // Simulate IA response
    if (isIAActive) {
      setIsTyping(true)
      setTimeout(() => {
        const iaResponse: ChatMessage = {
          id: `M${Date.now() + 1}`,
          role: "ia",
          content: `Gracias por tu mensaje. Estoy procesando tu solicitud sobre "${inputValue.slice(0, 40)}...". ¿Hay algo más que quieras saber sobre nuestras propiedades en Querétaro?`,
          timestamp: new Date().toISOString(),
          agentName: "Agente IA Shitoushui",
        }
        setMessages((prev) => [...prev, iaResponse])
        setIsTyping(false)
      }, 1500)
    }
  }

  const handleEscalar = async () => {
    webhooks.logActividad("escalar_humano", { usuario: user?.email || "admin", lead: LEAD_PROFILE.nombre, etapa: LEAD_PROFILE.etapa })

    setIsIAActive(false)
    const msg: ChatMessage = {
      id: `M${Date.now()}`,
      role: "human_agent",
      content: `Hola Jorge, soy ${user?.nombre || "el asesor"}. La IA me ha transferido tu caso. Estoy aquí para ayudarte personalmente. ¿Tienes alguna pregunta sobre la propiedad en Juriquilla?`,
      timestamp: new Date().toISOString(),
      agentName: user?.nombre || "Asesor",
    }
    setMessages((prev) => [...prev, msg])

    toast({
      title: "Conversación escalada",
      description: "Ahora el asesor tiene control del chat",
      variant: "default",
      duration: 3000,
    } as Parameters<typeof toast>[0])
  }

  const handleIARetoma = async () => {
    webhooks.logActividad("ia_retoma_conversacion", { usuario: user?.email || "admin", lead: LEAD_PROFILE.nombre })

    setIsIAActive(true)
    const msg: ChatMessage = {
      id: `M${Date.now()}`,
      role: "ia",
      content: `¡Hola Jorge! Retomé la conversación. El asesor ya te atendió y quedamos en que tienes visita el jueves. ¿Tienes alguna pregunta adicional sobre el proyecto o los trámites?`,
      timestamp: new Date().toISOString(),
      agentName: "Agente IA Shitoushui",
    }
    setMessages((prev) => [...prev, msg])

    toast({
      title: "IA retomó la conversación",
      description: "El agente IA tiene control nuevamente",
      variant: "success",
      duration: 3000,
    } as Parameters<typeof toast>[0])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col xl:flex-row gap-4 h-[calc(100vh-8rem)]">
      {/* ─── CHAT PANEL ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden min-h-[500px]">
        {/* Chat header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-sm">{LEAD_PROFILE.nombre}</p>
              <p className="text-xs text-muted-foreground">{LEAD_PROFILE.zona}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isIAActive ? (
              <Badge variant="gold" className="gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-slow" />
                IA activa
              </Badge>
            ) : (
              <Badge variant="info" className="gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Asesor en control
              </Badge>
            )}
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4"
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-end gap-2 mb-3">
              <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="chat-bubble-ia">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Control buttons */}
        <div className="px-4 py-2 border-t border-border/50 flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleEscalar}
            disabled={!isIAActive}
          >
            <Headphones className="h-3.5 w-3.5" />
            Escalar a Humano
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleIARetoma}
            disabled={isIAActive}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            IA retoma conversación
          </Button>
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-border flex gap-2 shrink-0">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            rows={1}
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            style={{ maxHeight: "80px" }}
          />
          <Button
            onClick={sendMessage}
            variant="gold"
            size="icon"
            disabled={!inputValue.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ─── LEAD PROFILE PANEL ──────────────────────────────────────────── */}
      <div className="w-full xl:w-72 flex flex-col gap-3 shrink-0">
        {/* Profile card */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Perfil del Lead (IA extrae)</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Nombre", value: LEAD_PROFILE.nombre, icon: User },
              { label: "Zona", value: LEAD_PROFILE.zona, icon: MapPin },
              { label: "Presupuesto", value: formatCurrency(LEAD_PROFILE.presupuesto), icon: DollarSign },
              { label: "Tipo", value: `${LEAD_PROFILE.tipo} · ${LEAD_PROFILE.recamaras} rec.`, icon: Target },
              { label: "Uso", value: LEAD_PROFILE.uso, icon: Clock },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-2.5">
                <div className="p-1.5 bg-primary/10 rounded-md shrink-0 mt-0.5">
                  <item.icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Probability */}
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm font-semibold mb-3">Probabilidad de cierre</p>
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40 * (LEAD_PROFILE.probabilidad / 100)} ${2 * Math.PI * 40}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">{LEAD_PROFILE.probabilidad}%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Etapa: {LEAD_PROFILE.etapa}</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm font-semibold mb-3">Acciones rápidas</p>
          <div className="space-y-2">
            {[
              { label: "Generar Cotización", action: "cotizacion" },
              { label: "Agendar Visita", action: "visita" },
              { label: "Enviar Recordatorio", action: "pago" },
            ].map((btn) => (
              <Button
                key={btn.action}
                variant="outline"
                size="sm"
                className="w-full text-xs justify-start"
                onClick={() => {
                  webhooks.logActividad(`chat_accion_${btn.action}`, {
                    usuario: user?.email || "admin",
                    lead: LEAD_PROFILE.nombre,
                  })
                  toast({
                    title: "Acción enviada",
                    description: `${btn.label} para ${LEAD_PROFILE.nombre}`,
                    variant: "success",
                    duration: 2000,
                  } as Parameters<typeof toast>[0])
                }}
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
