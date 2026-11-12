export {};

type Estado = 'programada' | 'en-curso' | 'finalizada';

interface Vuelta {
    nombre: string;
    tiempo: number;
}

interface Carrera {
    readonly id: number;
    nombre: string;
    estado: Estado;
    vueltas: Vuelta[];
}

const carreras: Carrera[] = [
    { id: 1, nombre: 'Gran Premio Norte', estado: 'finalizada', vueltas: [
        { nombre: 'Vuelta rapida', tiempo: 78.4 },
        { nombre: 'Vuelta media', tiempo: 82.1 }
    ] },
    { id: 2, nombre: 'Circuito Costero', estado: 'en-curso', vueltas: [
        { nombre: 'Vuelta inicial', tiempo: 85.2 },
        { nombre: 'Vuelta dos', tiempo: 84.7 }
    ] },
    { id: 3, nombre: 'Gran Premio Sur', estado: 'programada', vueltas: [
        { nombre: 'Vuelta uno', tiempo: 90.1 },
        { nombre: 'Vuelta dos', tiempo: 89.5 }
    ] },
];

function validarCarrera(item: Carrera): boolean {
    return item.nombre.trim() !== '' && item.vueltas.length > 0;
}

function undefined(item: Carrera): number {
    return item.vueltas.reduce((total, actual) => total + actual.tiempo, 0);
}

function calcularResumen(item: Carrera) {
    return {
        ...item,
        totalTiempo: undefined(item)
    };
}

const resumenes = carreras.filter(validarCarrera).map(calcularResumen);
const ranking = [...resumenes].sort((a, b) => a.totalTiempo - b.totalTiempo);
const totalGeneral = resumenes.reduce((total, item) => total + item.totalTiempo, 0);

console.log('===== Simulador de carrera por vueltas =====');

console.log('Carreras:', resumenes.length);
console.log('Tiempo total:', totalGeneral);

console.log('\n===== RANKING =====');

ranking.forEach((item, index) => {
    console.log((index + 1) + '. ' + item.nombre + ' - Tiempo total: ' + item.totalTiempo);
});

console.log('\n===== PRUEBAS =====');

const casoNormal = undefined({
    id: 99,
    nombre: 'Prueba',
    estado: 'programada',
    vueltas: [
        { nombre: 'Uno', tiempo: 10 },
        { nombre: 'Dos', tiempo: 15 }
    ]
});

const casoLimite = undefined({
    id: 100,
    nombre: 'Prueba',
    estado: 'programada',
    vueltas: []
});

console.log('Caso normal:', casoNormal);
console.log('Caso limite:', casoLimite);
