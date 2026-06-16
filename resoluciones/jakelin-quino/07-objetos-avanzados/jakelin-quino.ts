export {};

// Ejercicio 7: Objetos avanzados
// Contexto: Biblioteca de peliculas

// TODO: modela peliculas con objetos avanzados.

console.log("--------Ejercicio 7: Objetos avanzados--------")
export {};

type Director = {
  nombre: string;
  experiencia: number;
};

type Pelicula = {
  readonly id: number;
  titulo: string;
  director:string;
  calificaciones: number[];
  esRecomendada?: boolean;
  calcularPromedio: () => number;
};

const miPelicula: Pelicula = {
  id: 1,
  titulo: "Inception",
  director: "Christopher Nolan",
  calificaciones: [5, 4.8, 4.5, 5],
  calcularPromedio(): number {
    const total = this.calificaciones.reduce((suma, nota) => suma + nota, 0);
    return total / this.calificaciones.length;
  },
};

const promedio = miPelicula.calcularPromedio();
if (promedio > 5) {
  miPelicula.esRecomendada = true;
}

console.log(`Película: ${miPelicula.titulo}`);
console.log(`Director: ${miPelicula.director}`);
console.log(`Promedio: ${promedio}`);
console.log(`¿Recomendada?: ${miPelicula.esRecomendada ? "Sí" : "No"}`);