export {};

type Estado = 'estrenada' | 'retirada';

interface Resena {
    nombre: string;
    puntuacion: number;
}

interface Pelicula {
    readonly id: number;
    nombre: string;
    estado: Estado;
    resenas: Resena[];
}

const peliculas: Pelicula[] = [
    { id: 1, nombre: 'La casa vacia', estado: 'estrenada', resenas: [
        { nombre: 'Critica uno', puntuacion: 8 },
        { nombre: 'Critica dos', puntuacion: 7 }
    ] },
    { id: 2, nombre: 'Voces en el pasillo', estado: 'estrenada', resenas: [
        { nombre: 'Critica uno', puntuacion: 6 },
        { nombre: 'Critica dos', puntuacion: 8 }
    ] },
    { id: 3, nombre: 'El faro negro', estado: 'retirada', resenas: [
        { nombre: 'Critica uno', puntuacion: 9 },
        { nombre: 'Critica dos', puntuacion: 9 }
    ] },
];

function validarPelicula(item: Pelicula): boolean {
    return item.nombre.trim() !== '' && item.resenas.length > 0;
}

function undefined(item: Pelicula): number {
    return item.resenas.reduce((total, actual) => total + actual.puntuacion, 0);
}

function calcularResumen(item: Pelicula) {
    return {
        ...item,
        totalPuntuacion: undefined(item)
    };
}

const resumenes = peliculas.filter(validarPelicula).map(calcularResumen);
const ranking = [...resumenes].sort((a, b) => b.totalPuntuacion - a.totalPuntuacion);
const totalGeneral = resumenes.reduce((total, item) => total + item.totalPuntuacion, 0);

console.log('===== Catalogo de peliculas de miedo =====');

console.log('Peliculas:', resumenes.length);
console.log('Puntuacion total:', totalGeneral);

console.log('\n===== RANKING =====');

ranking.forEach((item, index) => {
    console.log((index + 1) + '. ' + item.nombre + ' - Puntuacion total: ' + item.totalPuntuacion);
});

console.log('\n===== PRUEBAS =====');

const casoNormal = undefined({
    id: 99,
    nombre: 'Prueba',
    estado: 'estrenada',
    resenas: [
        { nombre: 'Uno', puntuacion: 10 },
        { nombre: 'Dos', puntuacion: 15 }
    ]
});

const casoLimite = undefined({
    id: 100,
    nombre: 'Prueba',
    estado: 'estrenada',
    resenas: []
});

console.log('Caso normal:', casoNormal);
console.log('Caso limite:', casoLimite);
