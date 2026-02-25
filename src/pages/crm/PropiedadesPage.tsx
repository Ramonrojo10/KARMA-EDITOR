import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { propiedades } from "@/data/mockData"
import { formatCurrency } from "@/lib/utils"
import { MapPin, Home, BedDouble, Square } from "lucide-react"

type StatusFilter = "todos" | "disponible" | "apartado" | "vendido"

const statusConfig = {
  disponible: { label: "Disponible", variant: "success" as const },
  apartado: { label: "Apartado", variant: "warning" as const },
  vendido: { label: "Vendido", variant: "error" as const },
}

export default function PropiedadesPage() {
  const [filter, setFilter] = useState<StatusFilter>("todos")
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = filter === "todos" ? propiedades : propiedades.filter((p) => p.status === filter)

  const counts = {
    todos: propiedades.length,
    disponible: propiedades.filter((p) => p.status === "disponible").length,
    apartado: propiedades.filter((p) => p.status === "apartado").length,
    vendido: propiedades.filter((p) => p.status === "vendido").length,
  }

  return (
    <div className="space-y-6">
      {/* KPI bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: "todos" as const, label: "Total", color: "text-foreground" },
          { key: "disponible" as const, label: "Disponibles", color: "text-green-400" },
          { key: "apartado" as const, label: "Apartadas", color: "text-amber-400" },
          { key: "vendido" as const, label: "Vendidas", color: "text-red-400" },
        ].map((s) => (
          <div key={s.key} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{counts[s.key]}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: "todos", label: "Todas" },
          { key: "disponible", label: "Disponibles" },
          { key: "apartado", label: "Apartadas" },
          { key: "vendido", label: "Vendidas" },
        ] as { key: StatusFilter; label: string }[]).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 text-sm rounded-lg border transition-colors ${
              filter === f.key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Properties grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((p) => {
          const cfg = statusConfig[p.status]
          const isSelected = selected === p.id
          return (
            <Card
              key={p.id}
              className={`group overflow-hidden cursor-pointer transition-all hover:border-primary/30 ${isSelected ? "border-primary/50 shadow-xl shadow-primary/10" : ""}`}
              onClick={() => setSelected(isSelected ? null : p.id)}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={p.imagen}
                  alt={p.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute top-3 left-3">
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                </div>
                <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm rounded-lg px-2 py-1">
                  <span className="text-xs font-medium text-primary">{p.tipo}</span>
                </div>
                <div className="absolute bottom-3 left-3">
                  <p className="text-xl font-bold text-white">{formatCurrency(p.precio)}</p>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1">{p.nombre}</h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                  <MapPin className="h-3.5 w-3.5" />
                  {p.zona}, {p.ciudad}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <BedDouble className="h-3.5 w-3.5" />
                    {p.habitaciones} rec.
                  </div>
                  <div className="flex items-center gap-1">
                    <Square className="h-3.5 w-3.5" />
                    {p.m2} m²
                  </div>
                  <div className="flex items-center gap-1">
                    <Home className="h-3.5 w-3.5" />
                    {p.tipo}
                  </div>
                </div>
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-border/50 animate-fade-in">
                    <p className="text-sm text-muted-foreground">{p.descripcion}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
