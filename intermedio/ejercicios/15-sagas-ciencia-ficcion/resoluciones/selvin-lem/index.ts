export {};

interface Film {
    title: string;
    saga: string;
    episode: number;
    runtime: number;
}

const films: Film[] = [
    { title: "El primer viaje", saga: "Cronicas de Orión", episode: 1, runtime: 124 },
    { title: "Mundos lejanos", saga: "Cronicas de Orión", episode: 3, runtime: 139 },
    { title: "La señal", saga: "Cronicas de Orión", episode: 2, runtime: 131 },
    { title: "Planeta cero", saga: "Horizonte", episode: 1, runtime: 116 },
];

const saga = "Cronicas de Orión";
const episodes = films
    .filter((film) => film.saga === saga)
    .sort((first, second) => first.episode - second.episode);
const totalRuntime = episodes.reduce((sum, film) => sum + film.runtime, 0);

episodes.forEach((film) => {
    console.log(`${film.episode}. ${film.title} - ${film.runtime} min`);
});
console.log(`Duracion total de ${saga}: ${totalRuntime} minutos`);
