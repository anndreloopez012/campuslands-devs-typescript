export {};

type CategoriaTech = "Frontend" | "Backend" | "Cloud & DevOps" | "Arquitectura" | "Inteligencia Artificial";

interface LibroTech {
  readonly isbn: string;
  readonly titulo: string;
  readonly autor: string;
  readonly categoria: CategoriaTech;
  readonly paginas: number;
  readonly anioPublicacion: number;
  readonly copiasDisponibles: number;
}

interface EstadisticasBiblioteca {
  readonly totalLibros: number;
  readonly totalCopiasDisponibles: number;
  readonly librosPorCategoria: Record<CategoriaTech, number>;
  readonly librosAgotados: readonly LibroTech[];
}

function auditarBiblioteca(catalogo: readonly LibroTech[]): EstadisticasBiblioteca {
  const librosPorCategoria: Record<CategoriaTech, number> = {
    Frontend: 0,
    Backend: 0,
    "Cloud & DevOps": 0,
    Arquitectura: 0,
    "Inteligencia Artificial": 0,
  };

  let totalCopias = 0;
  const agotados: LibroTech[] = [];

  for (const libro of catalogo) {
    librosPorCategoria[libro.categoria] += 1;
    totalCopias += libro.copiasDisponibles;
    if (libro.copiasDisponibles === 0) {
      agotados.push(libro);
    }
  }

  return {
    totalLibros: catalogo.length,
    totalCopiasDisponibles: totalCopias,
    librosPorCategoria,
    librosAgotados: agotados,
  };
}

const acervoLibros: LibroTech[] = [
  { isbn: "978-0132350884", titulo: "Clean Code", autor: "Robert C. Martin", categoria: "Arquitectura", paginas: 464, anioPublicacion: 2008, copiasDisponibles: 4 },
  { isbn: "978-1491950296", titulo: "Designing Data-Intensive Applications", autor: "Martin Kleppmann", categoria: "Backend", paginas: 616, anioPublicacion: 2017, copiasDisponibles: 2 },
  { isbn: "978-1449331818", titulo: "Learning JavaScript Design Patterns", autor: "Addy Osmani", categoria: "Frontend", paginas: 254, anioPublicacion: 2012, copiasDisponibles: 0 },
];

console.log("=== BIBLIOTECA TECH ===");
const metricas = auditarBiblioteca(acervoLibros);
console.log(`Titulos en catalogo: ${metricas.totalLibros} | Copias en stock: ${metricas.totalCopiasDisponibles}`);
console.log(`Libros por categoria - Frontend: ${metricas.librosPorCategoria.Frontend}, Backend: ${metricas.librosPorCategoria.Backend}`);
console.log(`Titulos actualmente agotados: ${metricas.librosAgotados.map((l) => l.titulo).join(", ") || "Ninguno"}`);