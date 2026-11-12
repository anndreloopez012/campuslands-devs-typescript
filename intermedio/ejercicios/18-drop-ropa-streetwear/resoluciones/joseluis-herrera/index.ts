export {};

type Estado = 'activo' | 'agotado';

interface Prenda {
    nombre: string;
    precio: number;
}

interface Drop {
    readonly id: number;
    nombre: string;
    estado: Estado;
    prendas: Prenda[];
}

const drops: Drop[] = [
    { id: 1, nombre: 'Drop urbano', estado: 'activo', prendas: [
        { nombre: 'Hoodie oversize', precio: 180000 },
        { nombre: 'Jogger', precio: 120000 }
    ] },
    { id: 2, nombre: 'Drop minimal', estado: 'agotado', prendas: [
        { nombre: 'Camiseta boxy', precio: 90000 },
        { nombre: 'Cargo', precio: 150000 }
    ] },
    { id: 3, nombre: 'Drop invierno', estado: 'activo', prendas: [
        { nombre: 'Chaqueta puffer', precio: 320000 },
        { nombre: 'Bufanda', precio: 60000 }
    ] },
];

function validarDrop(item: Drop): boolean {
    return item.nombre.trim() !== '' && item.prendas.length > 0;
}

function undefined(item: Drop): number {
    return item.prendas.reduce((total, actual) => total + actual.precio, 0);
}

function calcularResumen(item: Drop) {
    return {
        ...item,
        totalPrecio: undefined(item)
    };
}

const resumenes = drops.filter(validarDrop).map(calcularResumen);
const ranking = [...resumenes].sort((a, b) => b.totalPrecio - a.totalPrecio);
const totalGeneral = resumenes.reduce((total, item) => total + item.totalPrecio, 0);

console.log('===== Drop de ropa streetwear =====');

console.log('Drops:', resumenes.length);
console.log('Valor total:', totalGeneral);

console.log('\n===== RANKING =====');

ranking.forEach((item, index) => {
    console.log((index + 1) + '. ' + item.nombre + ' - Valor total: ' + item.totalPrecio);
});

console.log('\n===== PRUEBAS =====');

const casoNormal = undefined({
    id: 99,
    nombre: 'Prueba',
    estado: 'activo',
    prendas: [
        { nombre: 'Uno', precio: 10 },
        { nombre: 'Dos', precio: 15 }
    ]
});

const casoLimite = undefined({
    id: 100,
    nombre: 'Prueba',
    estado: 'activo',
    prendas: []
});

console.log('Caso normal:', casoNormal);
console.log('Caso limite:', casoLimite);
