export {};

// Ejercicio 7: Objetos avanzados
// Contexto: Biblioteca de peliculas

// Definición de la estructura para el Director
interface Director {
  nombre: string;
  nacionalidad: string;
}

// Definición de la estructura para la Película
interface Pelicula {
  readonly id: number; // Propiedad de solo lectura
  titulo: string;
  director: Director; // Objeto anidado
  calificaciones: number[];
  genero?: string; // Propiedad opcional
  calcularPromedio(): number; // Método con tipo de retorno
}

// Implementación del objeto Película
const miPelicula: Pelicula = {
  id: 101,
  titulo: "Inception",
  director: {
    nombre: "Christopher Nolan",
    nacionalidad: "Británica",
  },
  calificaciones: [4.8, 5.0, 4.5, 4.7],
  genero: "Ciencia Ficción",

  calcularPromedio(): number {
    const suma = this.calificaciones.reduce((acc, curr) => acc + curr, 0);
    return suma / this.calificaciones.length;
  },
};

// Cálculo del promedio y validación del reto extra
const promedio = miPelicula.calcularPromedio();
const esRecomendada = promedio > 4.5;

// Impresión de resultados
console.log(`Película: ${miPelicula.titulo}`);
console.log(`Director: ${miPelicula.director.nombre}`);
console.log(`Promedio de calificaciones: ${promedio.toFixed(2)}`);
console.log(`Recomendada: ${esRecomendada ? "Sí" : "No"}`);
