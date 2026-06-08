export {};

// Ejercicio 7: Objetos avanzados
// Contexto: Biblioteca de peliculas

// TODO: modela peliculas con objetos avanzados.
interface peliculas {
  readonly id: string;
  titulo: string;
  duracion: number;
  director: string;
  lanzamiento: number;
  calificaciones: number[];
  readonly promedio: number;
}

const peli: peliculas = {
  id: "P1",
  titulo: "La isla misteriosa",
  duracion: 45,
  director: "Julius",
  lanzamiento: 2010,
  calificaciones: [8, 8, 9, 7],
  get promedio(): number {
    const suma = this.calificaciones.reduce((acc, nota) => acc + nota, 0);
    return suma / this.calificaciones.length;
  },
};

console.log(peli.id);
console.log(peli.titulo);
console.log(peli.duracion);
console.log(peli.director);
console.log(peli.lanzamiento);
console.log(peli.calificaciones);
console.log(peli.promedio);
