export {};

type Estado = 'disponible' | 'agotado';

interface Actividad {
    nombre: string;
    costo: number;
}

interface Paquete {
    readonly id: number;
    nombre: string;
    estado: Estado;
    actividades: Actividad[];
}

const paquetes: Paquete[] = [
    { id: 1, nombre: 'Aventura extrema', estado: 'disponible', actividades: [
        { nombre: 'Rafting', costo: 150000 },
        { nombre: 'Canopy', costo: 100000 }
    ] },
    { id: 2, nombre: 'Tour cultural', estado: 'disponible', actividades: [
        { nombre: 'Museo', costo: 40000 },
        { nombre: 'Ciudad historica', costo: 60000 }
    ] },
    { id: 3, nombre: 'Playa todo incluido', estado: 'agotado', actividades: [
        { nombre: 'Snorkel', costo: 120000 },
        { nombre: 'Paseo en bote', costo: 90000 }
    ] },
];

function validarPaquete(item: Paquete): boolean {
    return item.nombre.trim() !== '' && item.actividades.length > 0;
}

function undefined(item: Paquete): number {
    return item.actividades.reduce((total, actual) => total + actual.costo, 0);
}

function calcularResumen(item: Paquete) {
    return {
        ...item,
        totalCosto: undefined(item)
    };
}

const resumenes = paquetes.filter(validarPaquete).map(calcularResumen);
const ranking = [...resumenes].sort((a, b) => b.totalCosto - a.totalCosto);
const totalGeneral = resumenes.reduce((total, item) => total + item.totalCosto, 0);

console.log('===== Comparador de turismo =====');

console.log('Paquetes:', resumenes.length);
console.log('Costo total:', totalGeneral);

console.log('\n===== RANKING =====');

ranking.forEach((item, index) => {
    console.log((index + 1) + '. ' + item.nombre + ' - Costo total: ' + item.totalCosto);
});

console.log('\n===== PRUEBAS =====');

const casoNormal = undefined({
    id: 99,
    nombre: 'Prueba',
    estado: 'disponible',
    actividades: [
        { nombre: 'Uno', costo: 10 },
        { nombre: 'Dos', costo: 15 }
    ]
});

const casoLimite = undefined({
    id: 100,
    nombre: 'Prueba',
    estado: 'disponible',
    actividades: []
});

console.log('Caso normal:', casoNormal);
console.log('Caso limite:', casoLimite);
