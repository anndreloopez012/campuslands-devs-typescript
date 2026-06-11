export {};

// Ejercicio 7: Objetos avanzados
    
type Director = { nombre: string; pais: string };
type Pelicula = {
  readonly id: string;
  titulo: string;
  genero: string;
  anio?: number;
  director: Director;
  calificaciones: number[];
  calcularPromedio(): number;
};
const biblioteca: Pelicula[] = [
  {
    id: "MOV-2049",
    titulo: "Orbita Final",
    genero: "Ciencia ficcion",
    anio: 2024,
    director: { nombre: "Laura Vega", pais: "Colombia" },
    calificaciones: [4.8, 4.6, 4.9, 4.7],
    calcularPromedio() {
      return (
        this.calificaciones.reduce((s, n) => s + n, 0) /
        this.calificaciones.length
      );
    },
  },
  {
    id: "MOV-1080",
    titulo: "Bajo la lluvia",
    genero: "Drama",
    director: { nombre: "Marco Ruiz", pais: "Mexico" },
    calificaciones: [3.9, 4.1, 4.0, 3.8],
    calcularPromedio() {
      return (
        this.calificaciones.reduce((s, n) => s + n, 0) /
        this.calificaciones.length
      );
    },
  },
];
for (const p of biblioteca) {
  const promedio = p.calcularPromedio();
  console.log(
    `${p.titulo} (${p.director.nombre}, ${p.director.pais}): ${promedio.toFixed(1)} / 5 - ${promedio > 4.5 ? "Recomendada" : "Pendiente por revisar"}`,
  );
}