import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { embajadores } from "@/data/mockData"
import { formatCurrency } from "@/lib/utils"
import { Award, TrendingUp, Users, DollarSign, MapPin } from "lucide-react"

export default function EmbajadoresPage() {
  const totalVentas = embajadores.reduce((a, e) => a + e.ventas, 0)
  const totalComisiones = embajadores.reduce((a, e) => a + e.comisionEstimada, 0)
  const totalLeads = embajadores.reduce((a, e) => a + e.leadsAsignados, 0)

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Embajadores activos", value: embajadores.filter((e) => e.status === "activo").length, icon: Users, suffix: "" },
          { label: "Total ventas", value: totalVentas, icon: TrendingUp, suffix: " cierres" },
          { label: "Leads asignados", value: totalLeads, icon: Users, suffix: "" },
          { label: "Comisiones estimadas", value: formatCurrency(totalComisiones), icon: DollarSign, suffix: "" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-2xl font-bold text-primary">
                {kpi.value}{kpi.suffix}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Embajadores grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {embajadores.map((e, idx) => {
          const initials = e.nombre.split(" ").slice(0, 2).map((n) => n[0]).join("")
          const rank = idx + 1
          return (
            <Card key={e.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-base">{initials}</AvatarFallback>
                    </Avatar>
                    {rank <= 3 && (
                      <div className={`absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${rank === 1 ? "bg-primary text-primary-foreground" : rank === 2 ? "bg-slate-400 text-white" : "bg-amber-600 text-white"}`}>
                        {rank}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{e.nombre}</p>
                    <p className="text-xs text-muted-foreground truncate">{e.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{e.zona}</span>
                    </div>
                  </div>
                  <Badge variant={e.status === "activo" ? "success" : "secondary"} className="text-xs shrink-0">
                    {e.status === "activo" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Ventas", value: e.ventas },
                    { label: "Leads", value: e.leadsAsignados },
                    { label: "Tasa", value: `${e.tasa}%` },
                  ].map((s) => (
                    <div key={s.label} className="text-center p-2 bg-muted/40 rounded-lg">
                      <p className="text-lg font-bold text-primary">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Commission */}
                <div className="mb-3">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">Comisión estimada</span>
                    <span className="text-xs font-semibold text-primary">{formatCurrency(e.comisionEstimada)}</span>
                  </div>
                  <Progress value={e.tasa} className="h-1.5" />
                </div>

                <div className="flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    {e.tasa >= 80 ? "Top Performer" : e.tasa >= 50 ? "En camino" : "Necesita apoyo"}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Table view */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Resumen de rendimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["#", "Embajador", "Zona", "Ventas", "Leads", "Tasa", "Comisión", "Estado"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {embajadores.map((e, i) => (
                  <tr key={e.id} className="border-b border-border/40 hover:bg-accent/20 transition-colors">
                    <td className="py-2.5 px-3 text-xs text-muted-foreground">{i + 1}</td>
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-sm">{e.nombre}</p>
                      <p className="text-xs text-muted-foreground">{e.email}</p>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-muted-foreground">{e.zona}</td>
                    <td className="py-2.5 px-3 font-semibold">{e.ventas}</td>
                    <td className="py-2.5 px-3">{e.leadsAsignados}</td>
                    <td className="py-2.5 px-3">
                      <span className={`font-medium text-xs ${e.tasa >= 75 ? "text-green-400" : e.tasa >= 50 ? "text-amber-400" : "text-red-400"}`}>
                        {e.tasa}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-primary font-semibold text-xs whitespace-nowrap">
                      {formatCurrency(e.comisionEstimada)}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant={e.status === "activo" ? "success" : "secondary"} className="text-xs">
                        {e.status === "activo" ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
