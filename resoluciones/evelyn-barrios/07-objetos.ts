export {};

interface Pelicula {
  readonly id: number;
  titulo: string;
  info: {
    director: string;
    estreno: number;
  };
  genero?: string;
  reproducir: () => string;
}

const miCine: Pelicula = {
  id: 1,
  titulo: "Interstellar",
  info: { director: "Nolan", estreno: 2014 },
  reproducir: () => "La película está comenzando...",
};

console.log(`Viendo: ${miCine.titulo}`);
console.log(miCine.reproducir());
