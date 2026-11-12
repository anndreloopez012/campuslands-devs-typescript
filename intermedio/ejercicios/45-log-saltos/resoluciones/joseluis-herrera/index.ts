export {};

type Estado = 'planificado' | 'completado' | 'cancelado';

interface Salto {
    readonly id: number;
    nombre: string;
    fecha: string;
    estado: Estado;
    altitud: number;
}

const saltos: Salto[] = [
    { id: 1, nombre: 'Salto tandem', fecha: '2026-01-07', estado: 'completado', altitud: 3500 },
    { id: 2, nombre: 'Salto solo', fecha: '2026-01-21', estado: 'completado', altitud: 4000 },
    { id: 3, nombre: 'Salto curso', fecha: '2026-02-04', estado: 'planificado', altitud: 3000 },
    { id: 4, nombre: 'Salto nocturno', fecha: '2026-02-16', estado: 'cancelado', altitud: 3200 },
];

function validarSalto(item: Salto): boolean {
    return item.nombre.trim() !== '' && !Number.isNaN(Date.parse(item.fecha)) && item.altitud > 0;
}

function filtrarPorMes(lista: Salto[], mes: string): Salto[] {
    return lista.filter((item) => item.fecha.startsWith(mes));
}

function contarPorEstado(lista: Salto[]): Record<Estado, number> {
    return lista.reduce((conteo, item) => {
        conteo[item.estado] += 1;
        return conteo;
    }, { 'planificado': 0, 'completado': 0, 'cancelado': 0 });
}

function calcularTotal(lista: Salto[]): number {
    return lista.reduce((total, item) => total + item.altitud, 0);
}

const validos = saltos.filter(validarSalto);
const enero = filtrarPorMes(validos, '2026-01');
const confirmados = validos.filter((item) => item.estado === 'completado');

console.log('===== Log avanzado de saltos =====');

console.log('Saltos validos:', validos.length);
console.log('Saltos confirmados:', confirmados.length);
console.log('Altitud total:', calcularTotal(validos));
console.log('Altitud en enero:', calcularTotal(enero));
console.log('Conteo por estado:', contarPorEstado(validos));

console.log('\n===== PRUEBAS =====');

const casoNormal = calcularTotal([
    { id: 99, nombre: 'Prueba', fecha: '2026-01-15', estado: 'completado', altitud: 10 }
]);

const casoLimite = calcularTotal([]);

console.log('Caso normal:', casoNormal);
console.log('Caso limite:', casoLimite);
