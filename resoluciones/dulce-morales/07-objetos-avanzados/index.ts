export {};

// Ejercicio 7: Objetos avanzados
// Contexto: Biblioteca de peliculas
// Resolucion: Dulce Morales

type Director = {
  readonly nombre: string;
  readonly pais: string;
  premiosOscar?: number; // opcional: no todos los directores tienen Oscar
};

type Pelicula = {
  readonly id: string; // no debe cambiar nunca
  titulo: string;
  readonly anio: number;
  director: Director; // objeto anidado
  calificaciones: readonly number[]; // de 1 a 5, no se puede hacer push
  subtitulo?: string; // opcional
  calcularPromedio(): number; // metodo con tipo de retorno
  esRecomendada(): boolean;
};

const PROMEDIO_RECOMENDADA: number = 4.5;

// Crea una pelicula con sus metodos. Evita repetir los metodos en cada objeto.
function crearPelicula(
  datos: Omit<Pelicula, "calcularPromedio" | "esRecomendada">,
): Pelicula {
  return {
    ...datos,
    calcularPromedio(): number {
      if (this.calificaciones.length === 0) {
        return 0;
      }
      const suma: number = this.calificaciones.reduce(
        (acumulado: number, nota: number): number => acumulado + nota,
        0,
      );
      return suma / this.calificaciones.length;
    },
    // Reto extra: recomendada si el promedio es mayor a 4.5
    esRecomendada(): boolean {
      return this.calcularPromedio() > PROMEDIO_RECOMENDADA;
    },
  };
}

const biblioteca: Pelicula[] = [
  crearPelicula({
    id: "PEL-001",
    titulo: "El viaje de Chihiro",
    anio: 2001,
    director: { nombre: "Hayao Miyazaki", pais: "Japon", premiosOscar: 2 },
    calificaciones: [5, 5, 4.5, 5, 4.8],
  }),
  crearPelicula({
    id: "PEL-002",
    titulo: "Roma",
    anio: 2018,
    director: { nombre: "Alfonso Cuaron", pais: "Mexico", premiosOscar: 5 },
    calificaciones: [4.5, 4, 5, 4.2],
  }),
  crearPelicula({
    id: "PEL-003",
    titulo: "Parasitos",
    subtitulo: "Gisaengchung",
    anio: 2019,
    director: { nombre: "Bong Joon-ho", pais: "Corea del Sur", premiosOscar: 4 },
    calificaciones: [5, 4.8, 4.9, 4.7],
  }),
  crearPelicula({
    id: "PEL-004",
    titulo: "Cronos",
    anio: 1993,
    director: { nombre: "Guillermo del Toro", pais: "Mexico" },
    calificaciones: [3.8, 4.1, 3.5],
  }),
];

// Si descomentas estas lineas, TypeScript marca error por ser readonly:
// biblioteca[0].id = "PEL-999";
// biblioteca[0].director.nombre = "Otro director";
// biblioteca[0].calificaciones.push(1);

// Las propiedades que no son readonly si se pueden cambiar
biblioteca[3].titulo = "La invencion de Cronos";

function mostrarPelicula(pelicula: Pelicula): void {
  const titulo: string = pelicula.subtitulo
    ? `${pelicula.titulo} (${pelicula.subtitulo})`
    : pelicula.titulo;
  const oscars: string =
    pelicula.director.premiosOscar !== undefined
      ? `${pelicula.director.premiosOscar} Oscar`
      : "sin datos de Oscar";
  const promedio: number = pelicula.calcularPromedio();
  const marca: string = pelicula.esRecomendada() ? "RECOMENDADA" : "-";

  console.log(`[${pelicula.id}] ${titulo} - ${pelicula.anio}`);
  console.log(`  Director: ${pelicula.director.nombre} (${pelicula.director.pais}, ${oscars})`);
  console.log(`  Promedio: ${promedio.toFixed(2)} / 5   ${marca}`);
}

console.log("========== BIBLIOTECA DE PELICULAS ==========");
biblioteca.forEach((pelicula: Pelicula): void => {
  mostrarPelicula(pelicula);
});
console.log("=============================================");

const recomendadas: string[] = biblioteca
  .filter((pelicula: Pelicula): boolean => pelicula.esRecomendada())
  .map((pelicula: Pelicula): string => pelicula.titulo);
console.log(`Recomendadas (promedio > ${PROMEDIO_RECOMENDADA}): ${recomendadas.join(", ")}`);
