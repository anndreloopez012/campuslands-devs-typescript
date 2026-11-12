export {};

type Estado = 'borrador' | 'activa' | 'finalizada';

interface Ruta {
    readonly id: number;
    nombre: string;
    fecha: string;
    estado: Estado;
    duracion: number;
}

const rutas: Ruta[] = [
    { id: 1, nombre: 'Centro historico', fecha: '2026-01-10', estado: 'activa', duracion: 3 },
    { id: 2, nombre: 'Ruta gastronomica', fecha: '2026-01-24', estado: 'activa', duracion: 4 },
    { id: 3, nombre: 'Miradores', fecha: '2026-02-08', estado: 'borrador', duracion: 5 },
    { id: 4, nombre: 'Museos', fecha: '2026-02-19', estado: 'finalizada', duracion: 2 },
];

function validarRuta(item: Ruta): boolean {
    return item.nombre.trim() !== '' && !Number.isNaN(Date.parse(item.fecha)) && item.duracion > 0;
}

function filtrarPorMes(lista: Ruta[], mes: string): Ruta[] {
    return lista.filter((item) => item.fecha.startsWith(mes));
}

function contarPorEstado(lista: Ruta[]): Record<Estado, number> {
    return lista.reduce((conteo, item) => {
        conteo[item.estado] += 1;
        return conteo;
    }, { 'borrador': 0, 'activa': 0, 'finalizada': 0 });
}

function calcularTotal(lista: Ruta[]): number {
    return lista.reduce((total, item) => total + item.duracion, 0);
}

const validos = rutas.filter(validarRuta);
const enero = filtrarPorMes(validos, '2026-01');
const confirmados = validos.filter((item) => item.estado === 'activa');

console.log('===== Rutas turisticas inteligentes =====');

console.log('Rutas validos:', validos.length);
console.log('Rutas confirmados:', confirmados.length);
console.log('Duracion total:', calcularTotal(validos));
console.log('Duracion en enero:', calcularTotal(enero));
console.log('Conteo por estado:', contarPorEstado(validos));

console.log('\n===== PRUEBAS =====');

const casoNormal = calcularTotal([
    { id: 99, nombre: 'Prueba', fecha: '2026-01-15', estado: 'activa', duracion: 10 }
]);

const casoLimite = calcularTotal([]);

console.log('Caso normal:', casoNormal);
console.log('Caso limite:', casoLimite);
