export {};

type PlanSuscripcion = "Basico" | "Estandar" | "Premium 4K";
type GeneroPelicula = "Accion" | "Drama" | "Ciencia Ficcion" | "Documental";

interface ContenidoStreaming {
  readonly id: string;
  readonly titulo: string;
  readonly genero: GeneroPelicula;
  readonly calificacionUsuarios: number;
  readonly disponibleEnPlan: PlanSuscripcion;
  readonly duracionMinutos: number;
}

interface PerfilUsuario {
  readonly usuario: string;
  readonly planContratado: PlanSuscripcion;
  readonly generosFavoritos: readonly GeneroPelicula[];
}

function esPlanSuficiente(planUsuario: PlanSuscripcion, planRequerido: PlanSuscripcion): boolean {
  const jerarquia: Record<PlanSuscripcion, number> = {
    "Basico": 1,
    "Estandar": 2,
    "Premium 4K": 3,
  };
  return jerarquia[planUsuario] >= jerarquia[planRequerido];
}

function recomendarContenido(catalogo: readonly ContenidoStreaming[], perfil: PerfilUsuario): ContenidoStreaming[] {
  return catalogo
    .filter((c) => esPlanSuficiente(perfil.planContratado, c.disponibleEnPlan))
    .filter((c) => perfil.generosFavoritos.includes(c.genero))
    .sort((a, b) => b.calificacionUsuarios - a.calificacionUsuarios);
}

const catalogoCine: ContenidoStreaming[] = [
  { id: "str-01", titulo: "Interstellar", genero: "Ciencia Ficcion", calificacionUsuarios: 4.9, disponibleEnPlan: "Estandar", duracionMinutos: 169 },
  { id: "str-02", titulo: "Oppenheimer", genero: "Drama", calificacionUsuarios: 4.8, disponibleEnPlan: "Premium 4K", duracionMinutos: 180 },
  { id: "str-03", titulo: "Mad Max: Fury Road", genero: "Accion", calificacionUsuarios: 4.7, disponibleEnPlan: "Basico", duracionMinutos: 120 },
];

const cliente: PerfilUsuario = {
  usuario: "Carlos Gomez",
  planContratado: "Estandar",
  generosFavoritos: ["Ciencia Ficcion", "Accion"],
};

console.log("=== RECOMENDADOR DE STREAMING ===");
const sugerencias = recomendarContenido(catalogoCine, cliente);
console.log(`Recomendaciones personalizadas para ${cliente.usuario} (${cliente.planContratado}):`);
sugerencias.forEach((p) => {
  console.log(`- ${p.titulo} [${p.genero}] | Calificacion: ${p.calificacionUsuarios} / 5.0 | Plan: ${p.disponibleEnPlan}`);
});