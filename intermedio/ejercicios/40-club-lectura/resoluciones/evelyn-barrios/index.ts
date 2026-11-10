export {};

type EstadoLectura = "Por Comenzar" | "En Progreso" | "Finalizado";

interface ResenaSocio {
  readonly socioId: string;
  readonly calificacion: number; // 1 a 5
  readonly comentarioBreve: string;
}

interface LibroDelMes {
  readonly isbn: string;
  readonly titulo: string;
  readonly autor: string;
  readonly paginasTotales: number;
  readonly resenas: readonly ResenaSocio[];
}

interface RegistroSocioClub {
  readonly socio: string;
  paginasLeidas: number;
  estado: EstadoLectura;
}

interface ReporteClubLectura {
  readonly libro: string;
  readonly calificacionPromedio: number;
  readonly porcentajeSocioCompletado: number;
}

function auditarSesionClub(libro: LibroDelMes, socios: readonly RegistroSocioClub[]): ReporteClubLectura {
  const sumaPuntos = libro.resenas.reduce((acc, r) => acc + r.calificacion, 0);
  const promedio = libro.resenas.length === 0 ? 0 : Number((sumaPuntos / libro.resenas.length).toFixed(1));

  const completados = socios.filter((s) => s.estado === "Finalizado").length;
  const totalSocios = socios.length === 0 ? 1 : socios.length;
  const porcentaje = Number(((completados / totalSocios) * 100).toFixed(1));

  return {
    libro: libro.titulo,
    calificacionPromedio: promedio,
    porcentajeSocioCompletado: porcentaje,
  };
}

const lecturaMarzo: LibroDelMes = {
  isbn: "978-8420651126",
  titulo: "Cien Anios de Soledad",
  autor: "Gabriel Garcia Marquez",
  paginasTotales: 471,
  resenas: [
    { socioId: "usr-01", calificacion: 5, comentarioBreve: "Una obra maestra absoluta del realismo magico." },
    { socioId: "usr-02", calificacion: 4, comentarioBreve: "Excelente prosa y arbol genealogico fascinante." },
  ],
};

const participacionSocios: RegistroSocioClub[] = [
  { socio: "Ana Lopez", paginasLeidas: 471, estado: "Finalizado" },
  { socio: "Roberto Mejia", paginasLeidas: 320, estado: "En Progreso" },
];

console.log("=== CLUB DE LECTURA MENSUAL ===");
const informeClub = auditarSesionClub(lecturaMarzo, participacionSocios);
console.log(`Libro auditado: ${informeClub.libro}`);
console.log(`Calificacion promedio del club: ${informeClub.calificacionPromedio} / 5.0`);
console.log(`Indice de miembros que terminaron el libro: ${informeClub.porcentajeSocioCompletado}%`);