export {};

type CategoriaLibroTech = 'Arquitectura Backend' | 'Bases de Datos' | 'DevOps & Cloud' | 'Algoritmos y Estructuras' | 'Frontend Avanzado';
type EstadoDisponibilidad = 'Disponible' | 'Prestado' | 'EnRestauracion' | 'BajaInventario';

interface FichaLibroTech {
  readonly libroId: string;
  readonly titulo: string;
  readonly autor: string;
  readonly categoria: CategoriaLibroTech;
  readonly anioPublicacion: number;
  readonly numeroPaginas: number;
  readonly prestamosTotales: number;
  estado: EstadoDisponibilidad;
}

interface ResumenBibliotecaTech {
  readonly obra: string;
  readonly categoria: CategoriaLibroTech;
  readonly volumenPaginas: string;
  readonly indiceDemanda: number;
  readonly clasificacionEjemplar: string;
}

const inventarioServidorCentral: readonly FichaLibroTech[] = [
  {
    libroId: "LIB-401",
    titulo: "Designing Data-Intensive Applications",
    autor: "Martin Kleppmann",
    categoria: "Bases de Datos",
    anioPublicacion: 2017,
    numeroPaginas: 616,
    prestamosTotales: 340,
    estado: "Disponible",
  },
  {
    libroId: "LIB-402",
    titulo: "Clean Architecture",
    autor: "Robert C. Martin",
    categoria: "Arquitectura Backend",
    anioPublicacion: 2017,
    numeroPaginas: 432,
    prestamosTotales: 280,
    estado: "Disponible",
  },
  {
    libroId: "LIB-403",
    titulo: "Kubernetes Up & Running",
    autor: "Kelsey Hightower",
    categoria: "DevOps & Cloud",
    anioPublicacion: 2019,
    numeroPaginas: 240,
    prestamosTotales: 195,
    estado: "Prestado",
  },
  {
    libroId: "LIB-404",
    titulo: "TypeScript Deep Dive",
    autor: "Basarat Ali Syed",
    categoria: "Frontend Avanzado",
    anioPublicacion: 2021,
    numeroPaginas: 380,
    prestamosTotales: 410,
    estado: "Disponible",
  },
  {
    libroId: "LIB-405",
    titulo: "Legacy Code Refactoring",
    autor: "Aether Vance",
    categoria: "Algoritmos y Estructuras",
    anioPublicacion: 2012,
    numeroPaginas: 520,
    prestamosTotales: 45,
    estado: "BajaInventario",
  }
];

function validarEjemplarActivo(libro: FichaLibroTech): boolean {
  return libro.estado !== "BajaInventario" && libro.estado !== "EnRestauracion";
}

function calcularIndiceDemanda(libro: FichaLibroTech): number {
  const factorPrestamos = libro.prestamosTotales * 0.5;
  const factorExtension = Math.min(libro.numeroPaginas * 0.1, 40);
  const antiguedadAnios = 2026 - libro.anioPublicacion;
  const bonificacionVigencia = antiguedadAnios <= 5 ? 25 : 10;
  const indiceBruto = factorPrestamos + factorExtension + bonificacionVigencia;
  return Number(indiceBruto.toFixed(2));
}

function formatearVolumenPaginas(paginas: number): string {
  if (paginas >= 500) return `${paginas} págs (Volumen Extenso)`;
  if (paginas >= 300) return `${paginas} págs (Formato Estándar)`;
  return `${paginas} págs (Guía Rápida)`;
}

function clasificarDemandaTecnica(indice: number): string {
  if (indice >= 200) return "Referencia Esencial de Alta Demanda";
  if (indice >= 140) return "Libro de Consulta Frecuente";
  if (indice >= 90) return "Lectura Recomendada de Especialidad";
  return "Ejemplar de Baja Rotación";
}

function procesarBibliotecaTech(libros: readonly FichaLibroTech[]): readonly ResumenBibliotecaTech[] {
  return libros
    .filter(validarEjemplarActivo)
    .map(libro => {
      const indice = calcularIndiceDemanda(libro);
      return {
        obra: `${libro.titulo} - ${libro.autor} [${libro.libroId}]`,
        categoria: libro.categoria,
        volumenPaginas: formatearVolumenPaginas(libro.numeroPaginas),
        indiceDemanda: indice,
        clasificacionEjemplar: clasificarDemandaTecnica(indice),
      };
    })
    .sort((a, b) => b.indiceDemanda - a.indiceDemanda);
}

function imprimirReporteBiblioteca(titulo: string, catalogo: readonly ResumenBibliotecaTech[]): void {
  console.log(`=== [BIBLIOTECA TECH] ${titulo} ===`);
  catalogo.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Obra: ${item.obra} (${item.categoria}) | Extensión: ${item.volumenPaginas} | Índice: ${item.indiceDemanda} | Estado: ${item.clasificacionEjemplar}`
    );
  });
  console.log("=================================================================================\n");
}

const resultadoInventarioOficial = procesarBibliotecaTech(inventarioServidorCentral);
imprimirReporteBiblioteca("Catálogo de Referencias Técnicas Activas", resultadoInventarioOficial);

// Caso: Obra de arquitectura de sistemas masiva con índices de préstamo récord histórico
const libroCasoMasivo: readonly FichaLibroTech[] = [
  {
    libroId: "LIB-999",
    titulo: "Distributed Systems Engineering Patterns",
    autor: "Soren Lindqvist",
    categoria: "Arquitectura Backend",
    anioPublicacion: 2024,
    numeroPaginas: 750,
    prestamosTotales: 620,
    estado: "Disponible",
  }
];

const resultadoMasivo = procesarBibliotecaTech(libroCasoMasivo);
imprimirReporteBiblioteca("Caso: Manual Técnico Masivo de Alta Rotación", resultadoMasivo);