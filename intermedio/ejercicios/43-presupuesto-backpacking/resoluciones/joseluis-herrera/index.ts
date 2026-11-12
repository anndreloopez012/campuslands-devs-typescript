export {};

type Estado = 'planificado' | 'pagado' | 'cancelado';

interface Gasto {
    readonly id: number;
    nombre: string;
    fecha: string;
    estado: Estado;
    monto: number;
}

const gastos: Gasto[] = [
    { id: 1, nombre: 'Tiquete aereo', fecha: '2026-01-05', estado: 'pagado', monto: 450000 },
    { id: 2, nombre: 'Hostal', fecha: '2026-01-20', estado: 'pagado', monto: 180000 },
    { id: 3, nombre: 'Comida', fecha: '2026-02-06', estado: 'planificado', monto: 120000 },
    { id: 4, nombre: 'Tour', fecha: '2026-02-17', estado: 'cancelado', monto: 90000 },
];

function validarGasto(item: Gasto): boolean {
    return item.nombre.trim() !== '' && !Number.isNaN(Date.parse(item.fecha)) && item.monto > 0;
}

function filtrarPorMes(lista: Gasto[], mes: string): Gasto[] {
    return lista.filter((item) => item.fecha.startsWith(mes));
}

function contarPorEstado(lista: Gasto[]): Record<Estado, number> {
    return lista.reduce((conteo, item) => {
        conteo[item.estado] += 1;
        return conteo;
    }, { 'planificado': 0, 'pagado': 0, 'cancelado': 0 });
}

function calcularTotal(lista: Gasto[]): number {
    return lista.reduce((total, item) => total + item.monto, 0);
}

const validos = gastos.filter(validarGasto);
const enero = filtrarPorMes(validos, '2026-01');
const confirmados = validos.filter((item) => item.estado === 'pagado');

console.log('===== Presupuesto backpacking =====');

console.log('Gastos validos:', validos.length);
console.log('Gastos confirmados:', confirmados.length);
console.log('Monto total:', calcularTotal(validos));
console.log('Monto en enero:', calcularTotal(enero));
console.log('Conteo por estado:', contarPorEstado(validos));

console.log('\n===== PRUEBAS =====');

const casoNormal = calcularTotal([
    { id: 99, nombre: 'Prueba', fecha: '2026-01-15', estado: 'pagado', monto: 10 }
]);

const casoLimite = calcularTotal([]);

console.log('Caso normal:', casoNormal);
console.log('Caso limite:', casoLimite);
