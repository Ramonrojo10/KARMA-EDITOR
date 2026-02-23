import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Building2,
  Star,
  Users,
  TrendingUp,
  Shield,
  Instagram,
  Facebook,
  Linkedin,
  ArrowRight,
  Send,
  Bot,
  User,
} from "lucide-react"
import { propiedades } from "@/data/mockData"
import { formatCurrency } from "@/lib/utils"

const statusColor = {
  disponible: "success",
  apartado: "warning",
  vendido: "error",
} as const

const statusLabel = {
  disponible: "Disponible",
  apartado: "Apartado",
  vendido: "Vendido",
}

export default function LandingPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  })
  const [chatStarted, setChatStarted] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ia"; content: string; time: string }[]>([])
  const [chatInput, setChatInput] = useState("")
  const [iaTyping, setIaTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages, iaTyping])

  const now = () =>
    new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const nombre = formData.nombre.trim().split(" ")[0]
    const interés = formData.mensaje.trim()
      ? `"${formData.mensaje.trim()}"`
      : "una propiedad de lujo"
    setChatMessages([
      {
        role: "ia",
        content: `¡Hola ${nombre}! Soy el asistente de Shitoushui Inmobiliaria. Ya recibí tu información y sé que buscas ${interés}. Estoy aquí para orientarte. ¿Tienes alguna zona o rango de presupuesto en mente?`,
        time: now(),
      },
    ])
    setChatStarted(true)
  }

  const IA_RESPONSES = [
    (name: string) =>
      `Perfecto, ${name}. Tenemos desarrollos en CDMX, Monterrey y Querétaro que podrían encajar con lo que buscas. ¿Te gustaría ver opciones disponibles ahora mismo?`,
    () =>
      "Excelente pregunta. Nuestros asesores especializados pueden preparar una propuesta personalizada según tu presupuesto. ¿Cuándo te viene bien una llamada?",
    (name: string) =>
      `Entendido, ${name}. Agenda una visita sin compromiso y te mostramos el desarrollo en persona. ¿Prefieres entre semana o fin de semana?`,
    () =>
      "Con gusto te enviamos un catálogo digital con disponibilidad, precios y renders de cada proyecto. ¿A qué correo te lo mandamos?",
  ]

  const sendChatMessage = () => {
    if (!chatInput.trim()) return
    const nombre = formData.nombre.trim().split(" ")[0]
    const userMsg = { role: "user" as const, content: chatInput.trim(), time: now() }
    setChatMessages((prev) => [...prev, userMsg])
    setChatInput("")
    setIaTyping(true)

    const pick = IA_RESPONSES[Math.floor(Math.random() * IA_RESPONSES.length)]
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { role: "ia", content: pick(nombre), time: now() },
      ])
      setIaTyping(false)
    }, 1200)
  }

  const handleChatKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendChatMessage()
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ─── NAVBAR ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg tracking-tight">
              <span className="gold-gradient">Shitoushui</span>
            </span>
            <span className="text-muted-foreground text-sm hidden sm:block">Inmobiliaria</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#proyectos" className="hover:text-foreground transition-colors">Proyectos</a>
            <a href="#nosotros" className="hover:text-foreground transition-colors">Nosotros</a>
            <a href="#contacto" className="hover:text-foreground transition-colors">Contacto</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="#contacto">
              <Button variant="outline" size="sm">Contactar</Button>
            </a>
          </div>
        </div>
      </nav>

      {/* ─── HERO ───────────────────────────────────────────────────────── */}
      <section className="relative pt-16 min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&auto=format"
            alt="Luxury property"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        {/* Decorative orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-3xl animate-fade-in">
            <Badge variant="gold" className="mb-6 px-4 py-1.5 text-xs uppercase tracking-widest">
              ✦ Desarrollos de Lujo en México
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              Vive el{" "}
              <span className="gold-gradient">lujo</span>{" "}
              que mereces
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed">
              Shitoushui Inmobiliaria transforma espacios en experiencias únicas.
              Desarrollos premium en Querétaro, CDMX y Monterrey.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#proyectos">
                <Button variant="gold" size="lg" className="gap-2">
                  Ver Proyectos <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <a href="#contacto">
                <Button variant="outline" size="lg">
                  Hablar con un asesor
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-border/40">
              {[
                { value: "+150", label: "Propiedades vendidas" },
                { value: "$3B+", label: "MXN en transacciones" },
                { value: "98%", label: "Clientes satisfechos" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROPIEDADES ────────────────────────────────────────────────── */}
      <section id="proyectos" className="landing-section max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <Badge variant="gold" className="mb-4 px-3 py-1 text-xs uppercase tracking-widest">
            Portafolio
          </Badge>
          <h2 className="text-4xl font-bold mb-4">
            Nuestros <span className="gold-gradient">Proyectos</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Desde penthouses con vista panorámica hasta residencias con amenidades exclusivas,
            cada propiedad está diseñada para superar tus expectativas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {propiedades.map((p) => (
            <div
              key={p.id}
              className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={p.imagen}
                  alt={p.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant={statusColor[p.status]}>{statusLabel[p.status]}</Badge>
                </div>
                <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm rounded-lg px-2.5 py-1">
                  <span className="text-xs font-semibold text-primary">{p.tipo}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-1">{p.nombre}</h3>
                <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                  <MapPin className="h-3.5 w-3.5" />
                  {p.zona}, {p.ciudad}
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{p.descripcion}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(p.precio)}</p>
                    <p className="text-xs text-muted-foreground">{p.habitaciones} rec · {p.m2} m²</p>
                  </div>
                  <a href="#contacto">
                    <Button variant="outline" size="sm" className="gap-1">
                      Info <ChevronRight className="h-3 w-3" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── NOSOTROS ───────────────────────────────────────────────────── */}
      <section id="nosotros" className="landing-section bg-card/30 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="gold" className="mb-4 px-3 py-1 text-xs uppercase tracking-widest">
                Quiénes somos
              </Badge>
              <h2 className="text-4xl font-bold mb-6">
                Expertos en <span className="gold-gradient">bienes raíces</span> de alto valor
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Fundada con la misión de democratizar el acceso a propiedades de lujo en México,
                Shitoushui Inmobiliaria ha liderado el mercado premium por más de una década,
                combinando tecnología de vanguardia con atención personalizada.
              </p>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Nuestro equipo de asesores certificados conoce a fondo cada mercado local,
                garantizando que encuentres la propiedad perfecta para tu estilo de vida o portafolio de inversión.
              </p>
              <div className="space-y-3">
                {[
                  "Presencia en 3 estados de México",
                  "Financiamiento a medida con los mejores bancos",
                  "Asesoría legal y notarial incluida",
                  "Tecnología IA para matching de propiedades",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Building2, label: "Propiedades", value: "+200" },
                { icon: Users, label: "Clientes felices", value: "+500" },
                { icon: TrendingUp, label: "Años de experiencia", value: "12+" },
                { icon: Shield, label: "Garantía de servicio", value: "100%" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-card border border-border rounded-xl p-6 text-center hover:border-primary/30 transition-colors"
                >
                  <item.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <p className="text-2xl font-bold mb-1">{item.value}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIOS ────────────────────────────────────────────────── */}
      <section className="landing-section max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">
            Lo que dicen nuestros <span className="gold-gradient">clientes</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              nombre: "Andrés Morales",
              ciudad: "Querétaro",
              texto: "El proceso fue increíblemente fluido. El asesor me ayudó a encontrar exactamente lo que buscaba en tiempo récord.",
            },
            {
              nombre: "Fernanda Castillo",
              ciudad: "CDMX",
              texto: "Shitoushui tiene propiedades únicas que no encuentras en ningún otro lugar. La atención personalizada marca la diferencia.",
            },
            {
              nombre: "Ricardo Montoya",
              ciudad: "Monterrey",
              texto: "Compré mi departamento con total confianza. El equipo legal se encargó de todo. 100% recomendado.",
            },
          ].map((t) => (
            <div key={t.nombre} className="bg-card border border-border rounded-xl p-6">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">"{t.texto}"</p>
              <div>
                <p className="font-semibold text-sm">{t.nombre}</p>
                <p className="text-xs text-muted-foreground">{t.ciudad}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CONTACTO ───────────────────────────────────────────────────── */}
      <section id="contacto" className="landing-section bg-card/30 border-t border-border/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <Badge variant="gold" className="mb-4 px-3 py-1 text-xs uppercase tracking-widest">
                Contacto
              </Badge>
              <h2 className="text-4xl font-bold mb-4">
                Hablemos de tu <span className="gold-gradient">próxima propiedad</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Uno de nuestros asesores especializados te contactará en menos de 24 horas.
                Sin compromiso, sin costos ocultos.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Phone, label: "+52 55 1234 5678", sublabel: "Lun–Vie 9am–7pm" },
                  { icon: Mail, label: "contacto@shitoushui.mx", sublabel: "Respuesta en 2h" },
                  { icon: MapPin, label: "CDMX · MTY · Querétaro", sublabel: "Oficinas propias" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.sublabel}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {chatStarted ? (
                /* ── CHAT WIDGET ───────────────────────────────────────── */
                <div className="flex flex-col h-[480px]">
                  {/* header */}
                  <div className="px-5 py-3 border-b border-border flex items-center gap-3 bg-card shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Asistente Shitoushui</p>
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                        <p className="text-xs text-muted-foreground">En línea</p>
                      </div>
                    </div>
                    <Badge variant="gold" className="ml-auto text-[10px] px-1.5">IA</Badge>
                  </div>

                  {/* messages */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                        {msg.role === "ia" && (
                          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <Bot className="h-3 w-3 text-primary" />
                          </div>
                        )}
                        <div className="max-w-[78%]">
                          <div className={msg.role === "ia" ? "chat-bubble-ia" : "chat-bubble-user"}>
                            {msg.content}
                          </div>
                          <p className={`text-[10px] text-muted-foreground mt-1 ${msg.role === "user" ? "text-right" : ""}`}>
                            {msg.time}
                          </p>
                        </div>
                        {msg.role === "user" && (
                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <User className="h-3 w-3 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    ))}

                    {/* typing indicator */}
                    {iaTyping && (
                      <div className="flex items-end gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <Bot className="h-3 w-3 text-primary" />
                        </div>
                        <div className="chat-bubble-ia">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 150}ms` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* input */}
                  <div className="px-4 py-3 border-t border-border flex gap-2 shrink-0">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={handleChatKey}
                      placeholder="Escribe tu mensaje..."
                      className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                    />
                    <Button
                      onClick={sendChatMessage}
                      variant="gold"
                      size="icon"
                      disabled={!chatInput.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                /* ── FORMULARIO ────────────────────────────────────────── */
                <form onSubmit={handleSubmit} className="space-y-5 p-8">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Nombre completo</label>
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Tu nombre"
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="tu@email.com"
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Teléfono</label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      placeholder="+52 55 0000 0000"
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">¿Qué estás buscando?</label>
                    <textarea
                      rows={4}
                      value={formData.mensaje}
                      onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                      placeholder="Describe la propiedad de tus sueños: ciudad, tipo, presupuesto..."
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground resize-none"
                    />
                  </div>
                  <Button type="submit" variant="gold" className="w-full" size="lg">
                    Comenzar contacto
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 bg-card/20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="font-bold text-lg">
                  <span className="gold-gradient">Shitoushui</span> Inmobiliaria
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Desarrollos inmobiliarios de lujo en México.
                Tu hogar, tu inversión, tu legado.
              </p>
              <div className="flex gap-3 mt-4">
                {[Instagram, Facebook, Linkedin].map((Icon, i) => (
                  <button
                    key={i}
                    className="p-2 border border-border rounded-lg hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm mb-4">Proyectos</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {["Querétaro", "CDMX", "Monterrey"].map((c) => (
                  <li key={c}>
                    <a href="#proyectos" className="hover:text-foreground transition-colors">{c}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-sm mb-4">Empresa</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#nosotros" className="hover:text-foreground transition-colors">Nosotros</a></li>
                <li><a href="#contacto" className="hover:text-foreground transition-colors">Contacto</a></li>
                <li>
                  <Link
                    to="/login"
                    className="text-muted-foreground/50 hover:text-muted-foreground transition-colors text-xs"
                  >
                    Portal de equipo →
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© 2026 Shitoushui Inmobiliaria. Todos los derechos reservados.</p>
            <p>Desarrollado con tecnología de vanguardia</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
