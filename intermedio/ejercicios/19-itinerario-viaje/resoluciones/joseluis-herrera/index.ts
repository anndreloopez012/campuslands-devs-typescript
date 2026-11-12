export {};

type Estado = 'planificado' | 'en-curso' | 'finalizado';

interface Parada {
    nombre: string;
    costo: number;
}

interface Viaje {
    readonly id: number;
    nombre: string;
    estado: Estado;
    paradas: Parada[];
}

const viajes: Viaje[] = [
    { id: 1, nombre: 'Ruta cafetera', estado: 'planificado', paradas: [
        { nombre: 'Salento', costo: 120000 },
        { nombre: 'Filandia', costo: 80000 }
    ] },
    { id: 2, nombre: 'Costa caribe', estado: 'en-curso', paradas: [
        { nombre: 'Cartagena', costo: 250000 },
        { nombre: 'Santa Marta', costo: 180000 }
    ] },
    { id: 3, nombre: 'Montaña fria', estado: 'finalizado', paradas: [
        { nombre: 'Villa de Leyva', costo: 90000 },
        { nombre: 'Raquira', costo: 50000 }
    ] },
];

function validarViaje(item: Viaje): boolean {
    return item.nombre.trim() !== '' && item.paradas.length > 0;
}

function undefined(item: Viaje): number {
    return item.paradas.reduce((total, actual) => total + actual.costo, 0);
}

function calcularResumen(item: Viaje) {
    return {
        ...item,
        totalCosto: undefined(item)
    };
}

const resumenes = viajes.filter(validarViaje).map(calcularResumen);
const ranking = [...resumenes].sort((a, b) => b.totalCosto - a.totalCosto);
const totalGeneral = resumenes.reduce((total, item) => total + item.totalCosto, 0);

console.log('===== Itinerario de viaje =====');

console.log('Viajes:', resumenes.length);
console.log('Costo total:', totalGeneral);

console.log('\n===== RANKING =====');

ranking.forEach((item, index) => {
    console.log((index + 1) + '. ' + item.nombre + ' - Costo total: ' + item.totalCosto);
});

console.log('\n===== PRUEBAS =====');

const casoNormal = undefined({
    id: 99,
    nombre: 'Prueba',
    estado: 'planificado',
    paradas: [
        { nombre: 'Uno', costo: 10 },
        { nombre: 'Dos', costo: 15 }
    ]
});

const casoLimite = undefined({
    id: 100,
    nombre: 'Prueba',
    estado: 'planificado',
    paradas: []
});

console.log('Caso normal:', casoNormal);
console.log('Caso limite:', casoLimite);
