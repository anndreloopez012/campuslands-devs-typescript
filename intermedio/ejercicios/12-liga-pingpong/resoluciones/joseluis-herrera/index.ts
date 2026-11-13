export {};

type Estado = 'pendiente' | 'jugado';

interface Set {
    nombre: string;
    puntos: number;
}

interface Partido {
    readonly id: number;
    nombre: string;
    estado: Estado;
    sets: Set[];
}

const partidos: Partido[] = [
    { id: 1, nombre: 'Ana vs Luis', estado: 'jugado', sets: [
        { nombre: 'Set uno', puntos: 11 },
        { nombre: 'Set dos', puntos: 9 }
    ] },
    { id: 2, nombre: 'Marta vs Pablo', estado: 'jugado', sets: [
        { nombre: 'Set uno', puntos: 11 },
        { nombre: 'Set dos', puntos: 11 }
    ] },
    { id: 3, nombre: 'Eva vs Hugo', estado: 'pendiente', sets: [
        { nombre: 'Set uno', puntos: 7 },
        { nombre: 'Set dos', puntos: 11 }
    ] },
];

function validarPartido(item: Partido): boolean {
    return item.nombre.trim() !== '' && item.sets.length > 0;
}

function undefined(item: Partido): number {
    return item.sets.reduce((total, actual) => total + actual.puntos, 0);
}

function calcularResumen(item: Partido) {
    return {
        ...item,
        totalPuntos: undefined(item)
    };
}

const resumenes = partidos.filter(validarPartido).map(calcularResumen);
const ranking = [...resumenes].sort((a, b) => b.totalPuntos - a.totalPuntos);
const totalGeneral = resumenes.reduce((total, item) => total + item.totalPuntos, 0);

console.log('===== Liga de pingpong =====');

console.log('Partidos:', resumenes.length);
console.log('Puntos totales:', totalGeneral);

console.log('\n===== RANKING =====');

ranking.forEach((item, index) => {
    console.log((index + 1) + '. ' + item.nombre + ' - Puntos totales: ' + item.totalPuntos);
});

console.log('\n===== PRUEBAS =====');

const casoNormal = undefined({
    id: 99,
    nombre: 'Prueba',
    estado: 'pendiente',
    sets: [
        { nombre: 'Uno', puntos: 10 },
        { nombre: 'Dos', puntos: 15 }
    ]
});

const casoLimite = undefined({
    id: 100,
    nombre: 'Prueba',
    estado: 'pendiente',
    sets: []
});

console.log('Caso normal:', casoNormal);
console.log('Caso limite:', casoLimite);
