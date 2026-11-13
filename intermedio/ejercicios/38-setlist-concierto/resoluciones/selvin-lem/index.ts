export {};

type Moment = "apertura" | "medio" | "cierre";

interface Song {
    title: string;
    minutes: number;
    moment: Moment;
    acoustic: boolean;
}

const songs: Song[] = [
    { title: "Primer pulso", minutes: 4, moment: "apertura", acoustic: false },
    { title: "Viento azul", minutes: 5, moment: "medio", acoustic: true },
    { title: "Sin regreso", minutes: 4, moment: "cierre", acoustic: false },
    { title: "Otra ciudad", minutes: 3, moment: "medio", acoustic: false },
];

const order: Record<Moment, number> = { apertura: 0, medio: 1, cierre: 2 };
const setlist = [...songs].sort(
    (first, second) => order[first.moment] - order[second.moment],
);
const totalMinutes = setlist.reduce((total, song) => total + song.minutes, 0);

setlist.forEach((song, index) => {
    console.log(`${index + 1}. ${song.title}${song.acoustic ? " (acustica)" : ""}`);
});
console.log(`Duracion del concierto: ${totalMinutes} minutos`);
