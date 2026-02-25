import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Eye, EyeOff, Lock, Mail, ArrowLeft, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("admin@shitoushui.com")
  const [password, setPassword] = useState("demo2026")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate("/crm", { replace: true })
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const success = await login(email, password)
    setLoading(false)
    if (success) {
      navigate("/crm", { replace: true })
    } else {
      setError("Credenciales incorrectas. Verifica tu email y contraseña.")
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format"
          alt="Luxury property"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-background/20" />
        <div className="absolute inset-0 flex flex-col justify-end p-12">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="h-7 w-7 text-primary" />
              <span className="font-bold text-2xl">
                <span className="gold-gradient">Shitoushui</span>
              </span>
            </div>
            <h2 className="text-3xl font-bold mb-3">Portal de Equipo</h2>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
              Gestiona tus leads, propiedades y cobranzas desde un solo lugar.
              CRM potenciado con IA para tu equipo de ventas.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Leads activos", value: "15" },
              { label: "Ventas este mes", value: "$7.4M" },
              { label: "Tasa conversión", value: "32%" },
            ].map((s) => (
              <div key={s.label} className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-xl p-4">
                <p className="text-2xl font-bold text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al sitio
          </Link>

          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">
              <span className="gold-gradient">Shitoushui</span>
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Bienvenido de vuelta</h1>
            <p className="text-muted-foreground text-sm">
              Ingresa tus credenciales para acceder al CRM
            </p>
          </div>

          {/* Demo credentials hint */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
            <p className="text-xs text-muted-foreground mb-1 font-medium text-primary">Credenciales de demo</p>
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Email:</strong> admin@shitoushui.com
            </p>
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Contraseña:</strong> demo2026
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="mb-1.5 block">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="admin@shitoushui.com"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="mb-1.5 block">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="gold"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Ingresando...
                </span>
              ) : (
                "Ingresar al CRM"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
