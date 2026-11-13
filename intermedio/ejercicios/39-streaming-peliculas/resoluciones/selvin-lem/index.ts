export {};

interface Movie {
    title: string;
    genre: string;
    rating: number;
    available: boolean;
}

const catalog: Movie[] = [
    { title: "Orbita", genre: "ciencia ficcion", rating: 8.4, available: true },
    { title: "La ultima puerta", genre: "terror", rating: 7.8, available: true },
    { title: "Dias de verano", genre: "drama", rating: 8.1, available: false },
    { title: "Marea roja", genre: "drama", rating: 7.2, available: true },
];

const preferredGenre = "drama";
const recommendations = catalog
    .filter(
        (movie) =>
            movie.available &&
            movie.genre === preferredGenre &&
            movie.rating >= 7.5,
    )
    .sort((first, second) => second.rating - first.rating);

console.log(`Recomendaciones de ${preferredGenre}`);
recommendations.forEach((movie) => console.log(`${movie.title} - ${movie.rating}/10`));
if (recommendations.length === 0) console.log("No hay titulos disponibles con ese filtro.");
