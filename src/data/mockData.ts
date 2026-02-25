export type LeadStage =
  | "Nuevo"
  | "Contactado"
  | "Visita Agendada"
  | "Propuesta"
  | "Negociación"
  | "Firmado"

export interface Lead {
  id: string
  nombre: string
  email: string
  telefono: string
  presupuesto: number
  zona: string
  asesor: string
  etapa: LeadStage
  probabilidad: number
  diasEnEtapa: number
  fuente: string
  notas: string
  fechaCreacion: string
  avatar?: string
}

export interface Embajador {
  id: string
  nombre: string
  email: string
  zona: string
  ventas: number
  leadsAsignados: number
  comisionEstimada: number
  tasa: number
  status: "activo" | "inactivo"
  avatar?: string
}

export interface Propiedad {
  id: string
  nombre: string
  zona: string
  ciudad: string
  precio: number
  tipo: string
  habitaciones: number
  m2: number
  status: "disponible" | "apartado" | "vendido"
  descripcion: string
  imagen: string
}

export interface PagoCobranza {
  id: string
  lead: string
  propiedad: string
  monto: number
  fechaVencimiento: string
  diasVencido: number
  status: "al_dia" | "pendiente" | "atrasado"
  telefono: string
  asesor: string
}

export interface ChatMessage {
  id: string
  role: "ia" | "human_agent" | "lead"
  content: string
  timestamp: string
  agentName?: string
}

// ─── LEADS ────────────────────────────────────────────────────────────────────
export const leads: Lead[] = [
  {
    id: "L001",
    nombre: "Carlos Mendoza Ríos",
    email: "carlos.mendoza@gmail.com",
    telefono: "+52 55 1234 5678",
    presupuesto: 2800000,
    zona: "Santa Fe, CDMX",
    asesor: "Ana Gutiérrez",
    etapa: "Nuevo",
    probabilidad: 15,
    diasEnEtapa: 1,
    fuente: "Instagram",
    notas: "Interesado en departamentos de 3 recámaras",
    fechaCreacion: "2026-02-21",
  },
  {
    id: "L002",
    nombre: "Sofía Ramírez Torres",
    email: "sofia.ramirez@outlook.com",
    telefono: "+52 81 9876 5432",
    presupuesto: 1500000,
    zona: "San Pedro Garza García, MTY",
    asesor: "Luis Hernández",
    etapa: "Nuevo",
    probabilidad: 20,
    diasEnEtapa: 2,
    fuente: "Facebook Ads",
    notas: "Primer departamento, busca financiamiento",
    fechaCreacion: "2026-02-20",
  },
  {
    id: "L003",
    nombre: "Jorge Villanueva Castro",
    email: "j.villanueva@empresa.mx",
    telefono: "+52 442 555 8901",
    presupuesto: 3000000,
    zona: "Juriquilla, Querétaro",
    asesor: "María López",
    etapa: "Contactado",
    probabilidad: 35,
    diasEnEtapa: 3,
    fuente: "Referido",
    notas: "Inversionista, busca rendimiento de renta",
    fechaCreacion: "2026-02-18",
  },
  {
    id: "L004",
    nombre: "Valeria Moreno Sáenz",
    email: "valeria.moreno@hotmail.com",
    telefono: "+52 55 2345 6789",
    presupuesto: 2200000,
    zona: "Polanco, CDMX",
    asesor: "Ana Gutiérrez",
    etapa: "Contactado",
    probabilidad: 40,
    diasEnEtapa: 5,
    fuente: "Google Ads",
    notas: "Le interesa amenidades de lujo",
    fechaCreacion: "2026-02-16",
  },
  {
    id: "L005",
    nombre: "Roberto Fuentes Díaz",
    email: "rfuentes@business.mx",
    telefono: "+52 81 3456 7890",
    presupuesto: 1800000,
    zona: "Valle Oriente, MTY",
    asesor: "Carlos Reyes",
    etapa: "Visita Agendada",
    probabilidad: 55,
    diasEnEtapa: 2,
    fuente: "Página web",
    notas: "Visita agendada para el 25 de febrero",
    fechaCreacion: "2026-02-14",
  },
  {
    id: "L006",
    nombre: "Patricia Olvera Jiménez",
    email: "patricia.olvera@gmail.com",
    telefono: "+52 442 678 9012",
    presupuesto: 2500000,
    zona: "El Campanario, Querétaro",
    asesor: "María López",
    etapa: "Visita Agendada",
    probabilidad: 60,
    diasEnEtapa: 1,
    fuente: "WhatsApp",
    notas: "Casa con jardín, 4 recámaras",
    fechaCreacion: "2026-02-13",
  },
  {
    id: "L007",
    nombre: "Alejandro Núñez Barrera",
    email: "a.nunez@finanzas.mx",
    telefono: "+52 55 4567 8901",
    presupuesto: 3000000,
    zona: "Lomas de Chapultepec, CDMX",
    asesor: "Luis Hernández",
    etapa: "Propuesta",
    probabilidad: 70,
    diasEnEtapa: 4,
    fuente: "Embajador",
    notas: "Recibió propuesta de 3 inmuebles",
    fechaCreacion: "2026-02-10",
  },
  {
    id: "L008",
    nombre: "Isabella Vargas Peña",
    email: "isabella.vargas@gmail.com",
    telefono: "+52 81 5678 9012",
    presupuesto: 1200000,
    zona: "Cumbres, MTY",
    asesor: "Carlos Reyes",
    etapa: "Propuesta",
    probabilidad: 65,
    diasEnEtapa: 6,
    fuente: "Instagram",
    notas: "Comparando 2 propiedades",
    fechaCreacion: "2026-02-09",
  },
  {
    id: "L009",
    nombre: "Manuel Espinoza Leiva",
    email: "mespinoza@corporativo.mx",
    telefono: "+52 442 789 0123",
    presupuesto: 2700000,
    zona: "Zibatá, Querétaro",
    asesor: "Ana Gutiérrez",
    etapa: "Negociación",
    probabilidad: 80,
    diasEnEtapa: 7,
    fuente: "Referido",
    notas: "Negociando precio, posible cierre esta semana",
    fechaCreacion: "2026-02-05",
  },
  {
    id: "L010",
    nombre: "Fernanda Castillo Wong",
    email: "fcastillo@luxury.mx",
    telefono: "+52 55 6789 0123",
    presupuesto: 3000000,
    zona: "Santa Fe, CDMX",
    asesor: "María López",
    etapa: "Negociación",
    probabilidad: 85,
    diasEnEtapa: 3,
    fuente: "Evento",
    notas: "Quiere incluir bodega y 2 cajones",
    fechaCreacion: "2026-02-03",
  },
  {
    id: "L011",
    nombre: "Ricardo Montoya Ruiz",
    email: "r.montoya@gmail.com",
    telefono: "+52 81 7890 1234",
    presupuesto: 1900000,
    zona: "San Pedro Garza García, MTY",
    asesor: "Luis Hernández",
    etapa: "Firmado",
    probabilidad: 100,
    diasEnEtapa: 0,
    fuente: "Referido",
    notas: "Firmó contrato el 15 feb. Entrega marzo",
    fechaCreacion: "2026-01-20",
  },
  {
    id: "L012",
    nombre: "Daniela Herrera Santos",
    email: "d.herrera@outlook.com",
    telefono: "+52 442 890 1234",
    presupuesto: 2100000,
    zona: "Juriquilla, Querétaro",
    asesor: "Carlos Reyes",
    etapa: "Firmado",
    probabilidad: 100,
    diasEnEtapa: 0,
    fuente: "Google Ads",
    notas: "Firma completada, pendiente escrituración",
    fechaCreacion: "2026-01-18",
  },
  {
    id: "L013",
    nombre: "Héctor Bautista Méndez",
    email: "h.bautista@empresa.mx",
    telefono: "+52 55 8901 2345",
    presupuesto: 850000,
    zona: "Polanco, CDMX",
    asesor: "Ana Gutiérrez",
    etapa: "Nuevo",
    probabilidad: 10,
    diasEnEtapa: 0,
    fuente: "TikTok",
    notas: "Recién ingresado, pendiente primer contacto",
    fechaCreacion: "2026-02-22",
  },
  {
    id: "L014",
    nombre: "Lucía Campos Vega",
    email: "lucia.campos@gmail.com",
    telefono: "+52 81 9012 3456",
    presupuesto: 2400000,
    zona: "Valle Oriente, MTY",
    asesor: "María López",
    etapa: "Contactado",
    probabilidad: 30,
    diasEnEtapa: 8,
    fuente: "Facebook Ads",
    notas: "Respondió al segundo mensaje, seguimiento activo",
    fechaCreacion: "2026-02-12",
  },
  {
    id: "L015",
    nombre: "Andrés Morales Guzmán",
    email: "a.morales@invierte.mx",
    telefono: "+52 442 012 3456",
    presupuesto: 3000000,
    zona: "El Campanario, Querétaro",
    asesor: "Luis Hernández",
    etapa: "Firmado",
    probabilidad: 100,
    diasEnEtapa: 0,
    fuente: "Embajador",
    notas: "Cerrado. Primer pago recibido",
    fechaCreacion: "2026-01-10",
  },
]

// ─── EMBAJADORES ──────────────────────────────────────────────────────────────
export const embajadores: Embajador[] = [
  {
    id: "E001",
    nombre: "Ana Gutiérrez Flores",
    email: "ana.gutierrez@shitoushui.mx",
    zona: "CDMX",
    ventas: 4,
    leadsAsignados: 5,
    comisionEstimada: 280000,
    tasa: 80,
    status: "activo",
  },
  {
    id: "E002",
    nombre: "Luis Hernández Mora",
    email: "luis.hernandez@shitoushui.mx",
    zona: "Monterrey",
    ventas: 3,
    leadsAsignados: 4,
    comisionEstimada: 195000,
    tasa: 75,
    status: "activo",
  },
  {
    id: "E003",
    nombre: "María López Reyna",
    email: "maria.lopez@shitoushui.mx",
    zona: "Querétaro",
    ventas: 5,
    leadsAsignados: 5,
    comisionEstimada: 350000,
    tasa: 100,
    status: "activo",
  },
  {
    id: "E004",
    nombre: "Carlos Reyes Padilla",
    email: "carlos.reyes@shitoushui.mx",
    zona: "Monterrey / Querétaro",
    ventas: 2,
    leadsAsignados: 3,
    comisionEstimada: 120000,
    tasa: 67,
    status: "activo",
  },
  {
    id: "E005",
    nombre: "Elena Vásquez Torres",
    email: "elena.vasquez@shitoushui.mx",
    zona: "CDMX",
    ventas: 1,
    leadsAsignados: 3,
    comisionEstimada: 60000,
    tasa: 33,
    status: "inactivo",
  },
]

// ─── PROPIEDADES ──────────────────────────────────────────────────────────────
export const propiedades: Propiedad[] = [
  {
    id: "P001",
    nombre: "Torre Zibatá Penthouse",
    zona: "Zibatá",
    ciudad: "Querétaro",
    precio: 3000000,
    tipo: "Penthouse",
    habitaciones: 4,
    m2: 280,
    status: "disponible",
    descripcion: "Penthouse de lujo con terraza privada y vista panorámica a las montañas",
    imagen: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format",
  },
  {
    id: "P002",
    nombre: "Residencia El Campanario",
    zona: "El Campanario",
    ciudad: "Querétaro",
    precio: 2500000,
    tipo: "Casa",
    habitaciones: 4,
    m2: 320,
    status: "disponible",
    descripcion: "Casa con jardín privado, alberca y 4 cajones de estacionamiento",
    imagen: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&auto=format",
  },
  {
    id: "P003",
    nombre: "Departamento Santa Fe Premium",
    zona: "Santa Fe",
    ciudad: "CDMX",
    precio: 2800000,
    tipo: "Departamento",
    habitaciones: 3,
    m2: 185,
    status: "apartado",
    descripcion: "Departamento de lujo en torre con amenidades de clase mundial",
    imagen: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format",
  },
  {
    id: "P004",
    nombre: "Loft Polanco Exclusivo",
    zona: "Polanco",
    ciudad: "CDMX",
    precio: 2200000,
    tipo: "Loft",
    habitaciones: 2,
    m2: 145,
    status: "disponible",
    descripcion: "Loft de doble altura en la zona más exclusiva de CDMX",
    imagen: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&auto=format",
  },
  {
    id: "P005",
    nombre: "Piso Valle Oriente",
    zona: "Valle Oriente",
    ciudad: "Monterrey",
    precio: 1900000,
    tipo: "Departamento",
    habitaciones: 3,
    m2: 165,
    status: "vendido",
    descripcion: "Departamento en exclusiva zona corporativa de Monterrey",
    imagen: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format",
  },
  {
    id: "P006",
    nombre: "Residencia San Pedro Garza García",
    zona: "San Pedro Garza García",
    ciudad: "Monterrey",
    precio: 2100000,
    tipo: "Casa",
    habitaciones: 4,
    m2: 290,
    status: "vendido",
    descripcion: "Casa en fraccionamiento privado, acabados de primer nivel",
    imagen: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format",
  },
  {
    id: "P007",
    nombre: "Departamento Juriquilla Eco",
    zona: "Juriquilla",
    ciudad: "Querétaro",
    precio: 1200000,
    tipo: "Departamento",
    habitaciones: 2,
    m2: 110,
    status: "disponible",
    descripcion: "Departamento sustentable, paneles solares y jardín comunal",
    imagen: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format",
  },
  {
    id: "P008",
    nombre: "Suite Lomas de Chapultepec",
    zona: "Lomas de Chapultepec",
    ciudad: "CDMX",
    precio: 3000000,
    tipo: "Suite",
    habitaciones: 3,
    m2: 210,
    status: "apartado",
    descripcion: "Suite en edificio art déco, vistas al bosque de Chapultepec",
    imagen: "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=600&auto=format",
  },
]

// ─── COBRANZA ─────────────────────────────────────────────────────────────────
export const pagosCobranza: PagoCobranza[] = [
  {
    id: "C001",
    lead: "Ricardo Montoya Ruiz",
    propiedad: "Piso Valle Oriente",
    monto: 380000,
    fechaVencimiento: "2026-03-01",
    diasVencido: 0,
    status: "al_dia",
    telefono: "+52 81 7890 1234",
    asesor: "Luis Hernández",
  },
  {
    id: "C002",
    lead: "Daniela Herrera Santos",
    propiedad: "Departamento Juriquilla Eco",
    monto: 210000,
    fechaVencimiento: "2026-02-25",
    diasVencido: 0,
    status: "pendiente",
    telefono: "+52 442 890 1234",
    asesor: "Carlos Reyes",
  },
  {
    id: "C003",
    lead: "Andrés Morales Guzmán",
    propiedad: "Residencia El Campanario",
    monto: 500000,
    fechaVencimiento: "2026-02-10",
    diasVencido: 12,
    status: "atrasado",
    telefono: "+52 442 012 3456",
    asesor: "Luis Hernández",
  },
  {
    id: "C004",
    lead: "Manuel Espinoza Leiva",
    propiedad: "Residencia San Pedro Garza García",
    monto: 270000,
    fechaVencimiento: "2026-02-18",
    diasVencido: 4,
    status: "atrasado",
    telefono: "+52 442 789 0123",
    asesor: "Ana Gutiérrez",
  },
  {
    id: "C005",
    lead: "Fernanda Castillo Wong",
    propiedad: "Torre Zibatá Penthouse",
    monto: 600000,
    fechaVencimiento: "2026-03-05",
    diasVencido: 0,
    status: "pendiente",
    telefono: "+52 55 6789 0123",
    asesor: "María López",
  },
  {
    id: "C006",
    lead: "Ricardo Montoya Ruiz",
    propiedad: "Piso Valle Oriente",
    monto: 190000,
    fechaVencimiento: "2026-02-01",
    diasVencido: 21,
    status: "atrasado",
    telefono: "+52 81 7890 1234",
    asesor: "Luis Hernández",
  },
  {
    id: "C007",
    lead: "Daniela Herrera Santos",
    propiedad: "Departamento Juriquilla Eco",
    monto: 105000,
    fechaVencimiento: "2026-01-25",
    diasVencido: 28,
    status: "atrasado",
    telefono: "+52 442 890 1234",
    asesor: "Carlos Reyes",
  },
  {
    id: "C008",
    lead: "Andrés Morales Guzmán",
    propiedad: "Residencia El Campanario",
    monto: 250000,
    fechaVencimiento: "2026-03-15",
    diasVencido: 0,
    status: "al_dia",
    telefono: "+52 442 012 3456",
    asesor: "Luis Hernández",
  },
  {
    id: "C009",
    lead: "Ricardo Montoya Ruiz",
    propiedad: "Piso Valle Oriente",
    monto: 190000,
    fechaVencimiento: "2026-04-01",
    diasVencido: 0,
    status: "al_dia",
    telefono: "+52 81 7890 1234",
    asesor: "Luis Hernández",
  },
  {
    id: "C010",
    lead: "Andrés Morales Guzmán",
    propiedad: "Residencia El Campanario",
    monto: 250000,
    fechaVencimiento: "2026-04-15",
    diasVencido: 0,
    status: "al_dia",
    telefono: "+52 442 012 3456",
    asesor: "Luis Hernández",
  },
  {
    id: "C011",
    lead: "Fernanda Castillo Wong",
    propiedad: "Torre Zibatá Penthouse",
    monto: 600000,
    fechaVencimiento: "2026-01-30",
    diasVencido: 23,
    status: "atrasado",
    telefono: "+52 55 6789 0123",
    asesor: "María López",
  },
  {
    id: "C012",
    lead: "Daniela Herrera Santos",
    propiedad: "Departamento Juriquilla Eco",
    monto: 105000,
    fechaVencimiento: "2026-03-25",
    diasVencido: 0,
    status: "al_dia",
    telefono: "+52 442 890 1234",
    asesor: "Carlos Reyes",
  },
  {
    id: "C013",
    lead: "Manuel Espinoza Leiva",
    propiedad: "Residencia San Pedro Garza García",
    monto: 270000,
    fechaVencimiento: "2026-03-18",
    diasVencido: 0,
    status: "pendiente",
    telefono: "+52 442 789 0123",
    asesor: "Ana Gutiérrez",
  },
  {
    id: "C014",
    lead: "Fernanda Castillo Wong",
    propiedad: "Torre Zibatá Penthouse",
    monto: 600000,
    fechaVencimiento: "2026-04-05",
    diasVencido: 0,
    status: "al_dia",
    telefono: "+52 55 6789 0123",
    asesor: "María López",
  },
  {
    id: "C015",
    lead: "Andrés Morales Guzmán",
    propiedad: "Residencia El Campanario",
    monto: 250000,
    fechaVencimiento: "2026-02-05",
    diasVencido: 17,
    status: "atrasado",
    telefono: "+52 442 012 3456",
    asesor: "Luis Hernández",
  },
  {
    id: "C016",
    lead: "Ricardo Montoya Ruiz",
    propiedad: "Piso Valle Oriente",
    monto: 190000,
    fechaVencimiento: "2026-02-15",
    diasVencido: 7,
    status: "atrasado",
    telefono: "+52 81 7890 1234",
    asesor: "Luis Hernández",
  },
  {
    id: "C017",
    lead: "Daniela Herrera Santos",
    propiedad: "Departamento Juriquilla Eco",
    monto: 105000,
    fechaVencimiento: "2026-04-25",
    diasVencido: 0,
    status: "al_dia",
    telefono: "+52 442 890 1234",
    asesor: "Carlos Reyes",
  },
  {
    id: "C018",
    lead: "Manuel Espinoza Leiva",
    propiedad: "Residencia San Pedro Garza García",
    monto: 270000,
    fechaVencimiento: "2026-04-18",
    diasVencido: 0,
    status: "al_dia",
    telefono: "+52 442 789 0123",
    asesor: "Ana Gutiérrez",
  },
  {
    id: "C019",
    lead: "Fernanda Castillo Wong",
    propiedad: "Torre Zibatá Penthouse",
    monto: 600000,
    fechaVencimiento: "2026-05-05",
    diasVencido: 0,
    status: "al_dia",
    telefono: "+52 55 6789 0123",
    asesor: "María López",
  },
  {
    id: "C020",
    lead: "Andrés Morales Guzmán",
    propiedad: "Residencia El Campanario",
    monto: 500000,
    fechaVencimiento: "2026-02-22",
    diasVencido: 0,
    status: "pendiente",
    telefono: "+52 442 012 3456",
    asesor: "Luis Hernández",
  },
]

// ─── CHAT HISTORY ─────────────────────────────────────────────────────────────
export const chatHistoryInitial: ChatMessage[] = [
  {
    id: "M001",
    role: "ia",
    content:
      "¡Hola! Bienvenido a Shitoushui Inmobiliaria. Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
    timestamp: "2026-02-22T09:00:00",
    agentName: "Agente IA Shitoushui",
  },
  {
    id: "M002",
    role: "lead",
    content: "Hola, estoy buscando un departamento en Querétaro, zona Juriquilla",
    timestamp: "2026-02-22T09:01:30",
  },
  {
    id: "M003",
    role: "ia",
    content:
      "¡Excelente elección! Juriquilla es una de las zonas más exclusivas de Querétaro. ¿Cuál es tu presupuesto aproximado?",
    timestamp: "2026-02-22T09:01:45",
    agentName: "Agente IA Shitoushui",
  },
  {
    id: "M004",
    role: "lead",
    content: "Tengo entre 1.5 y 2 millones de pesos disponibles",
    timestamp: "2026-02-22T09:02:15",
  },
  {
    id: "M005",
    role: "ia",
    content:
      "Perfecto, con ese presupuesto tenemos opciones muy interesantes. ¿Cuántas recámaras necesitas? ¿Es para vivir o como inversión?",
    timestamp: "2026-02-22T09:02:30",
    agentName: "Agente IA Shitoushui",
  },
  {
    id: "M006",
    role: "lead",
    content: "Para vivir, con mi familia. Necesitamos 3 recámaras mínimo",
    timestamp: "2026-02-22T09:03:00",
  },
  {
    id: "M007",
    role: "ia",
    content:
      "Entendido. Tengo identificado que estás buscando: zona Juriquilla, presupuesto $1.5-2M MXN, 3 recámaras, para uso habitacional. Déjame buscar las mejores opciones para ti. ¿Me puedes dar tu nombre completo?",
    timestamp: "2026-02-22T09:03:20",
    agentName: "Agente IA Shitoushui",
  },
  {
    id: "M008",
    role: "lead",
    content: "Jorge Villanueva Castro",
    timestamp: "2026-02-22T09:03:45",
  },
  {
    id: "M009",
    role: "ia",
    content:
      "Gracias Jorge. Voy a conectarte con uno de nuestros asesores especializados en Querétaro para darte atención personalizada. Un momento por favor.",
    timestamp: "2026-02-22T09:04:00",
    agentName: "Agente IA Shitoushui",
  },
  {
    id: "M010",
    role: "human_agent",
    content:
      "¡Hola Jorge! Soy María López, asesora de Shitoushui Inmobiliaria. La IA me pasó tu caso. Vi que buscas departamento en Juriquilla con 3 recámaras. Tenemos el proyecto Juriquilla Eco que podría interesarte. ¿Tienes disponibilidad para una visita esta semana?",
    timestamp: "2026-02-22T09:05:30",
    agentName: "María López",
  },
  {
    id: "M011",
    role: "lead",
    content: "Sí, puedo el jueves por la tarde",
    timestamp: "2026-02-22T09:06:00",
  },
  {
    id: "M012",
    role: "human_agent",
    content:
      "Perfecto, agendo una visita el jueves 26 de febrero a las 3pm en el corporativo de ventas en Juriquilla. Te envío los datos por WhatsApp. ¿Tu número es el que registraste?",
    timestamp: "2026-02-22T09:06:30",
    agentName: "María López",
  },
  {
    id: "M013",
    role: "lead",
    content: "Sí, el +52 442 555 8901",
    timestamp: "2026-02-22T09:07:00",
  },
  {
    id: "M014",
    role: "human_agent",
    content:
      "Listo Jorge, quedamos el jueves. Voy a dejar que nuestro agente IA te confirme los detalles y esté disponible si tienes alguna pregunta mientras tanto.",
    timestamp: "2026-02-22T09:07:30",
    agentName: "María López",
  },
  {
    id: "M015",
    role: "ia",
    content:
      "¡Hola de nuevo Jorge! Retomé la conversación para confirmarte: tu visita quedó agendada para el jueves 26 de febrero a las 3pm. Recibirás un WhatsApp con la dirección exacta. ¿Tienes alguna otra pregunta sobre los proyectos o facilidades de pago?",
    timestamp: "2026-02-22T09:08:00",
    agentName: "Agente IA Shitoushui",
  },
]

// ─── DASHBOARD CHARTS DATA ─────────────────────────────────────────────────────
export const ventasMensuales = [
  { mes: "Sep", ventas: 3200000, leads: 22 },
  { mes: "Oct", ventas: 4100000, leads: 28 },
  { mes: "Nov", ventas: 3800000, leads: 25 },
  { mes: "Dic", ventas: 5200000, leads: 31 },
  { mes: "Ene", ventas: 6100000, leads: 38 },
  { mes: "Feb", ventas: 7400000, leads: 45 },
]

export const leadsPorEtapa = [
  { name: "Nuevo", value: 3, color: "#64748b" },
  { name: "Contactado", value: 3, color: "#3b82f6" },
  { name: "Visita Agendada", value: 2, color: "#f59e0b" },
  { name: "Propuesta", value: 2, color: "#8b5cf6" },
  { name: "Negociación", value: 2, color: "#f97316" },
  { name: "Firmado", value: 3, color: "#22c55e" },
]

export const topAsesores = [
  { nombre: "María López", ventas: 5, monto: 11300000 },
  { nombre: "Ana Gutiérrez", ventas: 4, monto: 9700000 },
  { nombre: "Luis Hernández", ventas: 3, monto: 6900000 },
  { nombre: "Carlos Reyes", ventas: 2, monto: 3800000 },
  { nombre: "Elena Vásquez", ventas: 1, monto: 2200000 },
]
