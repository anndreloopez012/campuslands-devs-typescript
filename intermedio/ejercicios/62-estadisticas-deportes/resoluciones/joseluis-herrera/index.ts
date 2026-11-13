export {};

type Fase = 'inicial' | 'en-vivo' | 'finalizado';

interface EstadoDashboard {
    fase: Fase;
    deporte: string;
    goles: number;
}

type EventoDashboard =
    | { tipo: 'iniciar'; deporte: string }
    | { tipo: 'registrar'; goles: number }
    | { tipo: 'finalizar' };

const estadoInicial: EstadoDashboard = { fase: 'inicial', deporte: '', goles: 0 };

function reducir(estado: EstadoDashboard, evento: EventoDashboard): EstadoDashboard {
    switch (evento.tipo) {
        case 'iniciar':
            return { ...estado, fase: 'en-vivo', deporte: evento.deporte };
        case 'registrar':
            return evento.goles > 0 ? { ...estado, goles: estado.goles + evento.goles } : estado;
        case 'finalizar':
            return { ...estado, fase: 'finalizado' };
    }
}

const eventos: EventoDashboard[] = [
    { tipo: 'iniciar', deporte: 'futbol' },
    { tipo: 'registrar', goles: 2 },
    { tipo: 'registrar', goles: 1 },
    { tipo: 'finalizar' }
];

const estadoFinal = eventos.reduce(reducir, estadoInicial);

console.log('===== Dashboard multi-deporte =====');

console.log('Deporte:', estadoFinal.deporte);
console.log('Goles:', estadoFinal.goles);
console.log('Fase final:', estadoFinal.fase);

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', reducir(estadoInicial, { tipo: 'iniciar', deporte: 'baloncesto' }));
console.log('Caso limite:', reducir(estadoInicial, { tipo: 'registrar', goles: 3 }));
