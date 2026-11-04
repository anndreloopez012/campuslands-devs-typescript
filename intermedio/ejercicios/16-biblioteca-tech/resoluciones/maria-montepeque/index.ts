export {};

type Categoria = "programacion" | "datos" | "redes" | "seguridad";

interface Autor {
  readonly nombre: string;
  readonly pais: string;
}

interface Libro {
  readonly id: number;
  readonly titulo: string;
  readonly autor: Autor;
  readonly categoria: Categoria;
  readonly paginas: number;
  readonly anio: number;
  readonly disponible: boolean;
}

interface ResumenCategoria {
  readonly categoria: Categoria;
  readonly libros: number;
  readonly paginasTotales: number;
}

const libros: readonly Libro[] = [
  { id: 1, titulo: "TypeScript en Accion", autor: { nombre: "Laura Mena", pais: "Mexico" }, categoria: "programacion", paginas: 320, anio: 2022, disponible: true },
  { id: 2, titulo: "Datos sin Miedo", autor: { nombre: "Raul Ortiz", pais: "Chile" }, categoria: "datos", paginas: 280, anio: 2020, disponible: false },
  { id: 3, titulo: "Redes desde Cero", autor: { nombre: "Ana Soto", pais: "Peru" }, categoria: "redes", paginas: 410, anio: 2018, disponible: true },
  { id: 4, titulo: "Hacking Etico", autor: { nombre: "Raul Ortiz", pais: "Chile" }, categoria: "seguridad", paginas: 350, anio: 2023, disponible: true },
  { id: 5, titulo: "Patrones Limpios", autor: { nombre: "Laura Mena", pais: "Mexico" }, categoria: "programacion", paginas: 260, anio: 2021, disponible: true },
  { id: 6, titulo: "", autor: { nombre: "Sin Titulo", pais: "Peru" }, categoria: "datos", paginas: 100, anio: 2019, disponible: true },
  { id: 7, titulo: "Paginas Negativas", autor: { nombre: "Ana Soto", pais: "Peru" }, categoria: "redes", paginas: -5, anio: 2017, disponible: false },
];

const esLibroValido = (libro: Libro): boolean =>
  libro.titulo.trim().length > 0 &&
  libro.autor.nombre.trim().length > 0 &&
  libro.paginas > 0 &&
  libro.anio >= 1950;

const resumirPorCategoria = (items: readonly Libro[]): ResumenCategoria[] => {
  const mapa = items.reduce<Partial<Record<Categoria, ResumenCategoria>>>(
    (acc, libro) => {
      const previo = acc[libro.categoria];
      acc[libro.categoria] = {
        categoria: libro.categoria,
        libros: (previo?.libros ?? 0) + 1,
        paginasTotales: (previo?.paginasTotales ?? 0) + libro.paginas,
      };
      return acc;
    },
    {},
  );

  return Object.values(mapa).sort((a, b) => b.libros - a.libros);
};

const autoresUnicos = (items: readonly Libro[]): string[] =>
  Array.from(new Set(items.map((libro) => libro.autor.nombre))).sort();

const validos = libros.filter(esLibroValido);
const invalidos = libros.filter((libro) => !esLibroValido(libro));
const disponibles = validos.filter((libro) => libro.disponible);

console.log("Ejercicio 16: Biblioteca tech");
console.log(
  `Libros validos: ${validos.length} | invalidos: ${invalidos.length} | disponibles: ${disponibles.length}`,
);
invalidos.forEach((libro) => console.log(`  - #${libro.id} tiene datos invalidos`));
console.log("Por categoria:");
resumirPorCategoria(validos).forEach((r) =>
  console.log(`  ${r.categoria}: ${r.libros} libro(s), ${r.paginasTotales} paginas`),
);
console.log(`Autores: ${autoresUnicos(validos).join(", ")}`);
