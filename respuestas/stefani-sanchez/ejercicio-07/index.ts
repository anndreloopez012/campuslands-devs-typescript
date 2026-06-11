export {};

type Director = {
  nombre: string;
  pais: string;
};

type Pelicula = {
  readonly id: string;
  titulo: string;
  genero: string;
  director: Director;
  calificaciones: number[];
  calcularPromedio(): number;
};

const pelicula: Pelicula = {
  id: "MOV-2049",
  titulo: "Orbita Final",
  genero: "Ciencia ficcion",
  director: { nombre: "Laura Vega", pais: "Colombia" },
  calificaciones: [4.8, 4.6, 4.9, 4.7],
  calcularPromedio(): number {
    const total = this.calificaciones.reduce((suma, nota) => suma + nota, 0);
    return total / this.calificaciones.length;
  },
};

const promedio: number = pelicula.calcularPromedio();
console.log(`${pelicula.titulo} dirigida por ${pelicula.director.nombre}: ${promedio.toFixed(1)} / 5`);
console.log(promedio >= 4.5 ? "Recomendada" : "Pendiente por revisar");
