export {};

type Fase = 'detenido' | 'corriendo' | 'terminado';

interface EstadoTimer {
    fase: Fase;
    round: number;
    segundos: number;
}

type EventoTimer =
    | { tipo: 'iniciar' }
    | { tipo: 'avanzar'; segundos: number };

const estadoInicial: EstadoTimer = { fase: 'detenido', round: 1, segundos: 0 };

function reducir(estado: EstadoTimer, evento: EventoTimer): EstadoTimer {
    switch (evento.tipo) {
        case 'iniciar':
            return { ...estado, fase: 'corriendo' };
        case 'avanzar':
            if (estado.fase !== 'corriendo') {
                return estado;
            }
            const total = estado.segundos + evento.segundos;
            if (total < 180) {
                return { ...estado, segundos: total };
            }
            if (estado.round >= 3) {
                return { ...estado, fase: 'terminado', segundos: 180 };
            }
            return { ...estado, round: estado.round + 1, segundos: total - 180 };
    }
}

const eventos: EventoTimer[] = [
    { tipo: 'iniciar' },
    { tipo: 'avanzar', segundos: 60 },
    { tipo: 'avanzar', segundos: 120 }
];

const estadoFinal = eventos.reduce(reducir, estadoInicial);

console.log('===== Timer de rounds kickboxing =====');

console.log('Round final:', estadoFinal.round);
console.log('Segundos:', estadoFinal.segundos);
console.log('Fase final:', estadoFinal.fase);

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', reducir(estadoInicial, { tipo: 'avanzar', segundos: 30 }));
console.log('Caso limite:', reducir(estadoInicial, { tipo: 'iniciar' }));
