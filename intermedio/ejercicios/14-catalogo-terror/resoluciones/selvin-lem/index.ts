export {};

type AgeRating = "13+" | "16+" | "18+";

interface Movie {
    title: string;
    year: number;
    rating: number;
    ageRating: AgeRating;
}

const movies: Movie[] = [
    { title: "La casa del lago", year: 2021, rating: 7.8, ageRating: "16+" },
    { title: "Noche roja", year: 2023, rating: 8.4, ageRating: "18+" },
    { title: "El pasillo", year: 2019, rating: 6.9, ageRating: "13+" },
];

const recommended = movies.filter((movie) => movie.rating >= 7.5);
const averageRating =
    movies.reduce((sum, movie) => sum + movie.rating, 0) / movies.length;

recommended.forEach((movie) => {
    console.log(`${movie.title} (${movie.year}) | ${movie.ageRating} | ${movie.rating}/10`);
});
console.log(`Promedio del catalogo: ${averageRating.toFixed(1)}/10`);
