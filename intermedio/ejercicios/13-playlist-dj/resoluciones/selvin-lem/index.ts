export {};

interface Track {
    title: string;
    artist: string;
    genre: string;
    minutes: number;
    popular: boolean;
}

const tracks: Track[] = [
    { title: "Luz de noche", artist: "Nara", genre: "house", minutes: 4, popular: true },
    { title: "Orbit", artist: "K-Drive", genre: "electro", minutes: 5, popular: false },
    { title: "Sin pausa", artist: "Milo", genre: "house", minutes: 3, popular: true },
    { title: "Prisma", artist: "Eli", genre: "techno", minutes: 6, popular: false },
];

const setlist = tracks.filter((track) => track.genre === "house");
const totalMinutes = setlist.reduce((sum, track) => sum + track.minutes, 0);

console.log("Set de house");
setlist.forEach((track) => console.log(`${track.title} - ${track.artist}`));
console.log(`Duracion: ${totalMinutes} minutos`);
console.log(`Canciones populares: ${setlist.filter((track) => track.popular).length}`);
