export {};

// Ejercicio 07: 
type Director = {
  nombre: string;
  pais: string;
};

// 2) Tipo principal de la pelicula.
type Pelicula = {
  readonly id: string;    
  titulo: string;
  genero: string;
  anio?: number;             
  director: Director;          
  calificaciones: number[];
  calcularPromedio(): number;   
  esRecomendada(): boolean;  
};

// 3) Funcion fabrica: crea peliculas sin repetir la logica de los metodos.
function crearPelicula(
  id: string,
  titulo: string,
  genero: string,
  director: Director,
  calificaciones: number[],
  anio?: number
): Pelicula {
  return {
    id,
    titulo,
    genero,
    director,
    calificaciones,
    anio,
    calcularPromedio(): number {
      if (this.calificaciones.length === 0) return 0;
      const total = this.calificaciones.reduce((suma, nota) => suma + nota, 0);
      return total / this.calificaciones.length;
    },
    esRecomendada(): boolean {
      return this.calcularPromedio() > 4.5; 
    },
  };
}

// 4) Biblioteca de peliculas.
const biblioteca: Pelicula[] = [
  crearPelicula(
    "MOV-2049",
    "Orbita Final",
    "Ciencia ficcion",
    { nombre: "Laura Vega", pais: "Colombia" },
    [4.8, 4.6, 4.9, 4.7],
    2023
  ),
  crearPelicula(
    "MOV-1801",
    "El Jardin Silencioso",
    "Drama",
    { nombre: "Marco Ruiz", pais: "Mexico" },
    [4.2, 4.0, 4.3] 
  ),
  crearPelicula(
    "MOV-3500",
    "Cumbre Helada",
    "Aventura",
    { nombre: "Ana Torres", pais: "Argentina" },
    [4.9, 4.7, 5.0, 4.8, 4.6],
    2024
  ),
];

// 5) Recorremos la biblioteca y mostramos el resultado.
console.log("=== Biblioteca de peliculas ===\n");

for (const pelicula of biblioteca) {
  const promedio: number = pelicula.calcularPromedio();
  const estado: string = pelicula.esRecomendada()
    ? "Recomendada"
    : "Pendiente por revisar";

  console.log(`${pelicula.titulo} (${pelicula.anio ?? "ano desconocido"})`);
  console.log(`  Director: ${pelicula.director.nombre} - ${pelicula.director.pais}`);
  console.log(`  Genero: ${pelicula.genero}`);
  console.log(`  Promedio: ${promedio.toFixed(1)} / 5`);
  console.log(`  Estado: ${estado}\n`);
}
