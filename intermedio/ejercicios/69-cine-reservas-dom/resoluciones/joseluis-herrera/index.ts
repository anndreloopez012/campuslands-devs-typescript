export {};

interface EstadoReserva {
    asientos: string[];
    confirmada: boolean;
}

type EventoReserva =
    | { tipo: 'seleccionar'; asiento: string }
    | { tipo: 'confirmar' }
    | { tipo: 'cancelar' };

const estadoInicial: EstadoReserva = { asientos: [], confirmada: false };

function reducir(estado: EstadoReserva, evento: EventoReserva): EstadoReserva {
    switch (evento.tipo) {
        case 'seleccionar':
            if (estado.asientos.includes(evento.asiento)) {
                return estado;
            }
            return { ...estado, asientos: [...estado.asientos, evento.asiento] };
        case 'confirmar':
            return estado.asientos.length > 0 ? { ...estado, confirmada: true } : estado;
        case 'cancelar':
            return estadoInicial;
    }
}

const eventos: EventoReserva[] = [
    { tipo: 'seleccionar', asiento: 'A1' },
    { tipo: 'seleccionar', asiento: 'A2' },
    { tipo: 'confirmar' }
];

const estadoFinal = eventos.reduce(reducir, estadoInicial);

console.log('===== Reservas de cine DOM =====');

console.log('Asientos:', estadoFinal.asientos);
console.log('Confirmada:', estadoFinal.confirmada);

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', reducir(estadoInicial, { tipo: 'seleccionar', asiento: 'B1' }));
console.log('Caso limite:', reducir(estadoInicial, { tipo: 'confirmar' }));
