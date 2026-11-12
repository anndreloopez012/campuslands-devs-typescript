export {};

type Estado = 'pendiente' | 'aprobado' | 'rechazado';

interface Inspeccion {
    readonly id: number;
    nombre: string;
    fecha: string;
    estado: Estado;
    longitud: number;
}

const inspecciones: Inspeccion[] = [
    { id: 1, nombre: 'Cordón norte', fecha: '2026-01-14', estado: 'aprobado', longitud: 120 },
    { id: 2, nombre: 'Cordón sur', fecha: '2026-01-28', estado: 'aprobado', longitud: 95 },
    { id: 3, nombre: 'Cordón este', fecha: '2026-02-11', estado: 'pendiente', longitud: 80 },
    { id: 4, nombre: 'Cordón oeste', fecha: '2026-02-26', estado: 'rechazado', longitud: 110 },
];

function validarInspeccion(item: Inspeccion): boolean {
    return item.nombre.trim() !== '' && !Number.isNaN(Date.parse(item.fecha)) && item.longitud > 0;
}

function filtrarPorMes(lista: Inspeccion[], mes: string): Inspeccion[] {
    return lista.filter((item) => item.fecha.startsWith(mes));
}

function contarPorEstado(lista: Inspeccion[]): Record<Estado, number> {
    return lista.reduce((conteo, item) => {
        conteo[item.estado] += 1;
        return conteo;
    }, { 'pendiente': 0, 'aprobado': 0, 'rechazado': 0 });
}

function calcularTotal(lista: Inspeccion[]): number {
    return lista.reduce((total, item) => total + item.longitud, 0);
}

const validos = inspecciones.filter(validarInspeccion);
const enero = filtrarPorMes(validos, '2026-01');
const confirmados = validos.filter((item) => item.estado === 'aprobado');

console.log('===== Inspeccion visual soldadura =====');

console.log('Inspecciones validos:', validos.length);
console.log('Inspecciones confirmados:', confirmados.length);
console.log('Longitud total:', calcularTotal(validos));
console.log('Longitud en enero:', calcularTotal(enero));
console.log('Conteo por estado:', contarPorEstado(validos));

console.log('\n===== PRUEBAS =====');

const casoNormal = calcularTotal([
    { id: 99, nombre: 'Prueba', fecha: '2026-01-15', estado: 'aprobado', longitud: 10 }
]);

const casoLimite = calcularTotal([]);

console.log('Caso normal:', casoNormal);
console.log('Caso limite:', casoLimite);
