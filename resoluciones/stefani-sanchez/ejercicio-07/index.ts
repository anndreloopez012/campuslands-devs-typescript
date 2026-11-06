export {};

// Ejercicio 07: Objetos Avanzados
// Contexto: Biblioteca de Películas de Cine y Streaming

type Director = {
  readonly nombre: string;
  nacionalidad: string;
  premiosOscar: number;
};

type Pelicula = {
  readonly id: string;
  titulo: string;
  anioEstreno: number;
  duracionMinutos: number;
  director: Director;
  readonly generos: readonly string[];
  calificacion: number;
  premios?: string[];
  obtenerSinopsis(): string;
};

const coleccionCine: Pelicula[] = [
  {
    id: "MV-001",
    titulo: "Interstellar",
    anioEstreno: 2014,
    duracionMinutos: 169,
    director: {
      nombre: "Christopher Nolan",
      nacionalidad: "Británica",
      premiosOscar: 2
    },
    generos: ["Ciencia Ficción", "Drama", "Aventura"],
    calificacion: 8.7,
    premios: ["Mejores Efectos Visuales"],
    obtenerSinopsis() {
      return `"${this.titulo}" dirigida por ${this.director.nombre} explora agujeros de gusano para salvar la humanidad.`;
    }
  },
  {
    id: "MV-002",
    titulo: "Spirited Away",
    anioEstreno: 2001,
    duracionMinutos: 125,
    director: {
      nombre: "Hayao Miyazaki",
      nacionalidad: "Japonesa",
      premiosOscar: 1
    },
    generos: ["Animación", "Fantasía", "Aventura"],
    calificacion: 8.6,
    obtenerSinopsis() {
      return `"${this.titulo}" narra la travesía de Chihiro en un mundo de espíritus mágicos.`;
    }
  }
];

console.log("=== BIBLIOTECA CINEMATOGRÁFICA ===");
coleccionCine.forEach((pelicula) => {
  console.log(`ID: ${pelicula.id} | Título: ${pelicula.titulo} (${pelicula.anioEstreno})`);
  console.log(`Director: ${pelicula.director.nombre} [${pelicula.director.nacionalidad}]`);
  console.log(`Géneros: ${pelicula.generos.join(", ")} | Rating: ${pelicula.calificacion}/10`);
  console.log(`Sinopsis: ${pelicula.obtenerSinopsis()}`);
  if (pelicula.premios && pelicula.premios.length > 0) {
    console.log(`Premios: ${pelicula.premios.join(", ")}`);
  }
  console.log("------------------------------------------");
});
