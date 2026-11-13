export {};

type GeneroLiterario = 'Realismo Magico' | 'Ciencia Ficcion' | 'Novela Historica' | 'Ensayo Filosofico' | 'Misterio';
type EstadoLecturaClub = 'EnDebateActual' | 'Completado' | 'ProximaLectura' | 'Abandonado';

interface FichaLibroClub {
  readonly libroId: string;
  readonly titulo: string;
  readonly autor: string;
  readonly genero: GeneroLiterario;
  readonly totalPaginas: number;
  readonly paginasLeidasPromedio: number;
  readonly calificacionMiembros: number;
  readonly participantesActivos: number;
  estado: EstadoLecturaClub;
}

interface ResumenSesionClubLectura {
  readonly identificador: string;
  readonly obra: string;
  readonly genero: GeneroLiterario;
  readonly avanceLecturaPct: number;
  readonly indiceImpactoClub: number;
  readonly estatusDebate: string;
}

const catalogoClubLecturaGlobal: readonly FichaLibroClub[] = [
  {
    libroId: "LIB-4001",
    titulo: "Cien Años de Soledad",
    autor: "Gabriel García Márquez",
    genero: "Realismo Magico",
    totalPaginas: 496,
    paginasLeidasPromedio: 496,
    calificacionMiembros: 9.6,
    participantesActivos: 28,
    estado: "Completado",
  },
  {
    libroId: "LIB-4002",
    titulo: "Dune",
    autor: "Frank Herbert",
    genero: "Ciencia Ficcion",
    totalPaginas: 704,
    paginasLeidasPromedio: 528,
    calificacionMiembros: 9.1,
    participantesActivos: 24,
    estado: "EnDebateActual",
  },
  {
    libroId: "LIB-4003",
    titulo: "El Nombre de la Rosa",
    autor: "Umberto Eco",
    genero: "Novela Historica",
    totalPaginas: 612,
    paginasLeidasPromedio: 612,
    calificacionMiembros: 8.9,
    participantesActivos: 19,
    estado: "Completado",
  },
  {
    libroId: "LIB-4004",
    titulo: "La Sombra del Viento",
    autor: "Carlos Ruiz Zafón",
    genero: "Misterio",
    totalPaginas: 576,
    paginasLeidasPromedio: 345,
    calificacionMiembros: 8.8,
    participantesActivos: 22,
    estado: "EnDebateActual",
  },
  {
    libroId: "LIB-4005",
    titulo: "El Mundo de Sofía",
    autor: "Jostein Gaarder",
    genero: "Ensayo Filosofico",
    totalPaginas: 638,
    paginasLeidasPromedio: 120,
    calificacionMiembros: 7.4,
    participantesActivos: 9,
    estado: "Abandonado",
  }
];

function validarLibroActivoEnClub(libro: FichaLibroClub): boolean {
  return (
    libro.estado !== "Abandonado" &&
    libro.totalPaginas > 0 &&
    libro.paginasLeidasPromedio >= 0 &&
    libro.participantesActivos > 0
  );
}

function calcularPorcentajeAvance(leidas: number, totales: number): number {
  const porcentaje = Math.min(100, (leidas / totales) * 100);
  return Number(porcentaje.toFixed(1));
}

function calcularIndiceImpactoLiterario(libro: FichaLibroClub, avancePct: number): number {
  const baseCalificacion = libro.calificacionMiembros * 7.5;
  const bonoParticipacion = Math.min(15, libro.participantesActivos * 0.5);
  const bonoAvance = avancePct * 0.1;
  return Number(Math.min(100, baseCalificacion + bonoParticipacion + bonoAvance).toFixed(1));
}

function clasificarEstatusDebate(avancePct: number, estado: EstadoLecturaClub): string {
  if (estado === "Completado") return "Lectura Finalizada y Reseñada";
  if (avancePct >= 75) return "Recta Final de Discusión";
  if (avancePct >= 40) return "Debate Activo en Curso";
  return "Introducción y Primeros Capítulos";
}

function procesarSesionesClubLectura(libros: readonly FichaLibroClub[]): readonly ResumenSesionClubLectura[] {
  return libros
    .filter(validarLibroActivoEnClub)
    .map(libro => {
      const avance = calcularPorcentajeAvance(libro.paginasLeidasPromedio, libro.totalPaginas);
      return {
        identificador: libro.libroId,
        obra: `"${libro.titulo}" - ${libro.autor}`,
        genero: libro.genero,
        avanceLecturaPct: avance,
        indiceImpactoClub: calcularIndiceImpactoLiterario(libro, avance),
        estatusDebate: clasificarEstatusDebate(avance, libro.estado),
      };
    })
    .sort((a, b) => b.indiceImpactoClub - a.indiceImpactoClub);
}

function imprimirReporteClubLectura(titulo: string, resumen: readonly ResumenSesionClubLectura[]): void {
  console.log(`=== [CLUB DE LECTURA] ${titulo} ===`);
  resumen.forEach((item, indice) => {
    console.log(
      `${indice + 1}. [${item.identificador}] ${item.obra} | Género: ${item.genero} | Avance: ${item.avanceLecturaPct}% | Impacto: ${item.indiceImpactoClub}/100 | Estatus: ${item.estatusDebate}`
    );
  });
  console.log("=================================================================================\n");
}

const reporteClubOficial = procesarSesionesClubLectura(catalogoClubLecturaGlobal);
imprimirReporteClubLectura("Bitácora General de Lecturas del Club", reporteClubOficial);

// Caso: Obra monumental clásica de más de 1,400 páginas completada al 100% con participación récord
const libroCasoLimite: readonly FichaLibroClub[] = [
  {
    libroId: "LIB-9999",
    titulo: "Los Miserables (Edición Íntegra Comentada)",
    autor: "Victor Hugo",
    genero: "Novela Historica",
    totalPaginas: 1488,
    paginasLeidasPromedio: 1488,
    calificacionMiembros: 9.9,
    participantesActivos: 45,
    estado: "Completado",
  }
];

const resultadoLimite = procesarSesionesClubLectura(libroCasoLimite);
imprimirReporteClubLectura("Caso: Obra Monumental Completada con Participación Récord", resultadoLimite);