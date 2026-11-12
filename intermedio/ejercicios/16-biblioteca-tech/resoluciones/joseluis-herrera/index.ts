export {};

type Estado = 'disponible' | 'prestado';

interface Capitulo {
    nombre: string;
    paginas: number;
}

interface Libro {
    readonly id: number;
    nombre: string;
    estado: Estado;
    capitulos: Capitulo[];
}

const libros: Libro[] = [
    { id: 1, nombre: 'TypeScript practico', estado: 'disponible', capitulos: [
        { nombre: 'Fundamentos', paginas: 24 },
        { nombre: 'Tipos', paginas: 32 }
    ] },
    { id: 2, nombre: 'Algoritmos claros', estado: 'prestado', capitulos: [
        { nombre: 'Ordenamiento', paginas: 40 },
        { nombre: 'Busqueda', paginas: 36 }
    ] },
    { id: 3, nombre: 'Node en accion', estado: 'disponible', capitulos: [
        { nombre: 'Modulos', paginas: 30 },
        { nombre: 'Eventos', paginas: 26 }
    ] },
];

function validarLibro(item: Libro): boolean {
    return item.nombre.trim() !== '' && item.capitulos.length > 0;
}

function undefined(item: Libro): number {
    return item.capitulos.reduce((total, actual) => total + actual.paginas, 0);
}

function calcularResumen(item: Libro) {
    return {
        ...item,
        totalPaginas: undefined(item)
    };
}

const resumenes = libros.filter(validarLibro).map(calcularResumen);
const ranking = [...resumenes].sort((a, b) => b.totalPaginas - a.totalPaginas);
const totalGeneral = resumenes.reduce((total, item) => total + item.totalPaginas, 0);

console.log('===== Biblioteca tech =====');

console.log('Libros:', resumenes.length);
console.log('Paginas totales:', totalGeneral);

console.log('\n===== RANKING =====');

ranking.forEach((item, index) => {
    console.log((index + 1) + '. ' + item.nombre + ' - Paginas totales: ' + item.totalPaginas);
});

console.log('\n===== PRUEBAS =====');

const casoNormal = undefined({
    id: 99,
    nombre: 'Prueba',
    estado: 'disponible',
    capitulos: [
        { nombre: 'Uno', paginas: 10 },
        { nombre: 'Dos', paginas: 15 }
    ]
});

const casoLimite = undefined({
    id: 100,
    nombre: 'Prueba',
    estado: 'disponible',
    capitulos: []
});

console.log('Caso normal:', casoNormal);
console.log('Caso limite:', casoLimite);
