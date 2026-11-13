export {};

type Estado = 'pendiente' | 'confirmada' | 'cancelada';

interface Reserva {
    readonly id: number;
    nombre: string;
    fecha: string;
    estado: Estado;
    personas: number;
}

const reservas: Reserva[] = [
    { id: 1, nombre: 'Familia Gomez', fecha: '2026-01-12', estado: 'confirmada', personas: 4 },
    { id: 2, nombre: 'Mesa de trabajo', fecha: '2026-02-03', estado: 'confirmada', personas: 8 },
    { id: 3, nombre: 'Cumpleanos', fecha: '2026-02-18', estado: 'pendiente', personas: 6 },
    { id: 4, nombre: 'Cena privada', fecha: '2026-03-05', estado: 'cancelada', personas: 2 },
];

function validarReserva(item: Reserva): boolean {
    return item.nombre.trim() !== '' && !Number.isNaN(Date.parse(item.fecha)) && item.personas > 0;
}

function filtrarPorMes(lista: Reserva[], mes: string): Reserva[] {
    return lista.filter((item) => item.fecha.startsWith(mes));
}

function contarPorEstado(lista: Reserva[]): Record<Estado, number> {
    return lista.reduce((conteo, item) => {
        conteo[item.estado] += 1;
        return conteo;
    }, { 'pendiente': 0, 'confirmada': 0, 'cancelada': 0 });
}

function calcularTotal(lista: Reserva[]): number {
    return lista.reduce((total, item) => total + item.personas, 0);
}

const validos = reservas.filter(validarReserva);
const enero = filtrarPorMes(validos, '2026-01');
const confirmados = validos.filter((item) => item.estado === 'confirmada');

console.log('===== Reservas de restaurante =====');

console.log('Reservas validos:', validos.length);
console.log('Reservas confirmados:', confirmados.length);
console.log('Personas total:', calcularTotal(validos));
console.log('Personas en enero:', calcularTotal(enero));
console.log('Conteo por estado:', contarPorEstado(validos));

console.log('\n===== PRUEBAS =====');

const casoNormal = calcularTotal([
    { id: 99, nombre: 'Prueba', fecha: '2026-01-15', estado: 'confirmada', personas: 10 }
]);

const casoLimite = calcularTotal([]);

console.log('Caso normal:', casoNormal);
console.log('Caso limite:', casoLimite);
