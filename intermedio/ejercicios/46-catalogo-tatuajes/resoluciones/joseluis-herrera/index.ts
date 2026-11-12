export {};

type Estado = 'pendiente' | 'confirmada' | 'cancelada';

interface Sesion {
    readonly id: number;
    nombre: string;
    fecha: string;
    estado: Estado;
    sesiones: number;
}

const sesiones: Sesion[] = [
    { id: 1, nombre: 'Realismo brazo', fecha: '2026-01-09', estado: 'confirmada', sesiones: 3 },
    { id: 2, nombre: 'Lineal muneca', fecha: '2026-01-19', estado: 'confirmada', sesiones: 1 },
    { id: 3, nombre: 'Tradicional pierna', fecha: '2026-02-05', estado: 'pendiente', sesiones: 2 },
    { id: 4, nombre: 'Realismo espalda', fecha: '2026-02-21', estado: 'cancelada', sesiones: 4 },
];

function validarSesion(item: Sesion): boolean {
    return item.nombre.trim() !== '' && !Number.isNaN(Date.parse(item.fecha)) && item.sesiones > 0;
}

function filtrarPorMes(lista: Sesion[], mes: string): Sesion[] {
    return lista.filter((item) => item.fecha.startsWith(mes));
}

function contarPorEstado(lista: Sesion[]): Record<Estado, number> {
    return lista.reduce((conteo, item) => {
        conteo[item.estado] += 1;
        return conteo;
    }, { 'pendiente': 0, 'confirmada': 0, 'cancelada': 0 });
}

function calcularTotal(lista: Sesion[]): number {
    return lista.reduce((total, item) => total + item.sesiones, 0);
}

const validos = sesiones.filter(validarSesion);
const enero = filtrarPorMes(validos, '2026-01');
const confirmados = validos.filter((item) => item.estado === 'confirmada');

console.log('===== Catalogo de estilos tattoo =====');

console.log('Sesiones validos:', validos.length);
console.log('Sesiones confirmados:', confirmados.length);
console.log('Sesiones total:', calcularTotal(validos));
console.log('Sesiones en enero:', calcularTotal(enero));
console.log('Conteo por estado:', contarPorEstado(validos));

console.log('\n===== PRUEBAS =====');

const casoNormal = calcularTotal([
    { id: 99, nombre: 'Prueba', fecha: '2026-01-15', estado: 'confirmada', sesiones: 10 }
]);

const casoLimite = calcularTotal([]);

console.log('Caso normal:', casoNormal);
console.log('Caso limite:', casoLimite);
