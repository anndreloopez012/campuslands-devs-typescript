export {};

type Estado = 'borrador' | 'publicada';

interface Cancion {
    nombre: string;
    duracion: number;
}

interface Playlist {
    readonly id: number;
    nombre: string;
    estado: Estado;
    canciones: Cancion[];
}

const playlists: Playlist[] = [
    { id: 1, nombre: 'Noche synth', estado: 'publicada', canciones: [
        { nombre: 'Neon Lights', duracion: 215 },
        { nombre: 'Midnight Drive', duracion: 240 }
    ] },
    { id: 2, nombre: 'Foco lo-fi', estado: 'borrador', canciones: [
        { nombre: 'Rainy Day', duracion: 180 },
        { nombre: 'Coffee Break', duracion: 205 }
    ] },
    { id: 3, nombre: 'Fiesta retro', estado: 'publicada', canciones: [
        { nombre: 'Dance Again', duracion: 230 },
        { nombre: 'Sunset', duracion: 210 }
    ] },
];

function validarPlaylist(item: Playlist): boolean {
    return item.nombre.trim() !== '' && item.canciones.length > 0;
}

function undefined(item: Playlist): number {
    return item.canciones.reduce((total, actual) => total + actual.duracion, 0);
}

function calcularResumen(item: Playlist) {
    return {
        ...item,
        totalDuracion: undefined(item)
    };
}

const resumenes = playlists.filter(validarPlaylist).map(calcularResumen);
const ranking = [...resumenes].sort((a, b) => b.totalDuracion - a.totalDuracion);
const totalGeneral = resumenes.reduce((total, item) => total + item.totalDuracion, 0);

console.log('===== Curador de playlist =====');

console.log('Playlists:', resumenes.length);
console.log('Duracion total:', totalGeneral);

console.log('\n===== RANKING =====');

ranking.forEach((item, index) => {
    console.log((index + 1) + '. ' + item.nombre + ' - Duracion total: ' + item.totalDuracion);
});

console.log('\n===== PRUEBAS =====');

const casoNormal = undefined({
    id: 99,
    nombre: 'Prueba',
    estado: 'borrador',
    canciones: [
        { nombre: 'Uno', duracion: 10 },
        { nombre: 'Dos', duracion: 15 }
    ]
});

const casoLimite = undefined({
    id: 100,
    nombre: 'Prueba',
    estado: 'borrador',
    canciones: []
});

console.log('Caso normal:', casoNormal);
console.log('Caso limite:', casoLimite);
