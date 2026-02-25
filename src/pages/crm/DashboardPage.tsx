import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react"
import { ventasMensuales, leadsPorEtapa, topAsesores, leads } from "@/data/mockData"
import { formatCurrency } from "@/lib/utils"

const GOLD = "#D4AF37"
const ROJO = "#ef4444"
const VERDE = "#22c55e"

interface KPICardProps {
  title: string
  value: string
  change: number
  changeLabel: string
  icon: React.ReactNode
  prefix?: string
}

function KPICard({ title, value, change, changeLabel, icon }: KPICardProps) {
  const isPositive = change >= 0
  return (
    <div className="kpi-card animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 bg-primary/10 rounded-xl">{icon}</div>
        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}>
          {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {Math.abs(change)}%
        </div>
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{changeLabel}</p>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
  label?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-sm">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="text-muted-foreground">
            {p.name}: {p.name === "ventas" ? formatCurrency(p.value) : p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const recentLeads = leads.slice(0, 8)

export default function DashboardPage() {
  const totalVentasMes = 7400000
  const leadsNuevos = leads.filter((l) => l.etapa === "Nuevo").length
  const leadsTotal = leads.length
  const firmados = leads.filter((l) => l.etapa === "Firmado").length
  const tasaConversion = Math.round((firmados / leadsTotal) * 100)

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Ventas del mes"
          value={formatCurrency(totalVentasMes)}
          change={21}
          changeLabel="vs. enero 2026"
          icon={<DollarSign className="h-5 w-5 text-primary" />}
        />
        <KPICard
          title="Leads nuevos"
          value={leadsNuevos.toString()}
          change={15}
          changeLabel="esta semana"
          icon={<Users className="h-5 w-5 text-primary" />}
        />
        <KPICard
          title="Tasa de conversión"
          value={`${tasaConversion}%`}
          change={4}
          changeLabel="vs. mes anterior"
          icon={<Target className="h-5 w-5 text-primary" />}
        />
        <KPICard
          title="ROI estimado"
          value="3.8x"
          change={12}
          changeLabel="retorno de inversión"
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Line chart - ventas por mes */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ventas por mes (MXN)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={ventasMensuales} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="mes"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => <span style={{ color: "hsl(var(--muted-foreground))", fontSize: 12 }}>{value}</span>}
                />
                <Line
                  type="monotone"
                  dataKey="ventas"
                  stroke={GOLD}
                  strokeWidth={2.5}
                  dot={{ fill: GOLD, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="ventas"
                />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#60a5fa", r: 3 }}
                  name="leads"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie chart - leads por etapa */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Leads por etapa</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={leadsPorEtapa}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {leadsPorEtapa.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} leads`, name]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {leadsPorEtapa.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Bar chart - top asesores */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Asesores — Ventas (MXN)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topAsesores} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="nombre"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickFormatter={(v) => v.split(" ")[0]}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="monto" fill={GOLD} radius={[4, 4, 0, 0]} name="ventas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance cards */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Rendimiento asesores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topAsesores.map((a) => {
              const pct = Math.round((a.ventas / 5) * 100)
              return (
                <div key={a.nombre}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">{a.nombre.split(" ")[0]} {a.nombre.split(" ")[1]}</span>
                    <span className="text-xs text-muted-foreground">{a.ventas} ventas</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent leads table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Leads recientes</CardTitle>
            <Badge variant="secondary" className="text-xs">{recentLeads.length} leads</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Lead", "Presupuesto", "Zona", "Asesor", "Etapa", "Tiempo", "Prob."].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => {
                  const etapaColors: Record<string, string> = {
                    "Nuevo": "secondary",
                    "Contactado": "info",
                    "Visita Agendada": "warning",
                    "Propuesta": "info",
                    "Negociación": "warning",
                    "Firmado": "success",
                  }
                  return (
                    <tr key={lead.id} className="border-b border-border/40 hover:bg-accent/30 transition-colors">
                      <td className="py-2.5 px-3">
                        <p className="font-medium truncate max-w-[140px]">{lead.nombre}</p>
                        <p className="text-xs text-muted-foreground">{lead.fuente}</p>
                      </td>
                      <td className="py-2.5 px-3 text-primary font-medium">
                        {formatCurrency(lead.presupuesto)}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground text-xs">{lead.zona}</td>
                      <td className="py-2.5 px-3 text-xs">{lead.asesor.split(" ")[0]}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant={etapaColors[lead.etapa] as "secondary" | "info" | "warning" | "success"} className="text-xs">
                          {lead.etapa}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {lead.diasEnEtapa}d
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-medium ${lead.probabilidad >= 70 ? "text-green-400" : lead.probabilidad >= 40 ? "text-amber-400" : "text-muted-foreground"}`}>
                            {lead.probabilidad}%
                          </span>
                          <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${lead.probabilidad >= 70 ? "bg-green-500" : lead.probabilidad >= 40 ? "bg-amber-500" : "bg-muted-foreground"}`}
                              style={{ width: `${lead.probabilidad}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Propiedades disponibles", value: "4", color: VERDE },
          { label: "Propiedades apartadas", value: "2", color: "#f59e0b" },
          { label: "Propiedades vendidas", value: "2", color: ROJO },
          { label: "Pagos atrasados", value: "7", color: ROJO },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
