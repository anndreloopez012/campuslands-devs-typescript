export {};

type Estado = 'abierto' | 'cerrado';

interface Plato {
    nombre: string;
    precio: number;
}

interface Pedido {
    readonly id: number;
    nombre: string;
    estado: Estado;
    platos: Plato[];
}

const pedidos: Pedido[] = [
    { id: 1, nombre: 'Mesa uno', estado: 'abierto', platos: [
        { nombre: 'Hamburguesa', precio: 18000 },
        { nombre: 'Papas', precio: 8000 }
    ] },
    { id: 2, nombre: 'Mesa dos', estado: 'cerrado', platos: [
        { nombre: 'Tacos', precio: 15000 },
        { nombre: 'Nachos', precio: 12000 }
    ] },
    { id: 3, nombre: 'Mesa tres', estado: 'abierto', platos: [
        { nombre: 'Burrito', precio: 20000 },
        { nombre: 'Agua', precio: 3000 }
    ] },
];

function validarPedido(item: Pedido): boolean {
    return item.nombre.trim() !== '' && item.platos.length > 0;
}

function undefined(item: Pedido): number {
    return item.platos.reduce((total, actual) => total + actual.precio, 0);
}

function calcularResumen(item: Pedido) {
    return {
        ...item,
        totalPrecio: undefined(item)
    };
}

const resumenes = pedidos.filter(validarPedido).map(calcularResumen);
const ranking = [...resumenes].sort((a, b) => b.totalPrecio - a.totalPrecio);
const totalGeneral = resumenes.reduce((total, item) => total + item.totalPrecio, 0);

console.log('===== Pedidos de food truck =====');

console.log('Pedidos:', resumenes.length);
console.log('Precio total:', totalGeneral);

console.log('\n===== RANKING =====');

ranking.forEach((item, index) => {
    console.log((index + 1) + '. ' + item.nombre + ' - Precio total: ' + item.totalPrecio);
});

console.log('\n===== PRUEBAS =====');

const casoNormal = undefined({
    id: 99,
    nombre: 'Prueba',
    estado: 'abierto',
    platos: [
        { nombre: 'Uno', precio: 10 },
        { nombre: 'Dos', precio: 15 }
    ]
});

const casoLimite = undefined({
    id: 100,
    nombre: 'Prueba',
    estado: 'abierto',
    platos: []
});

console.log('Caso normal:', casoNormal);
console.log('Caso limite:', casoLimite);
