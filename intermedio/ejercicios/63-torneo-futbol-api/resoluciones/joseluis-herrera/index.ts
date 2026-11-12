export {};

type Fase = 'programado' | 'jugando' | 'finalizado';

interface EstadoTorneo {
    fase: Fase;
    partidos: number;
    goles: number;
}

type EventoTorneo =
    | { tipo: 'iniciar-partido' }
    | { tipo: 'gol'; cantidad: number }
    | { tipo: 'terminar-partido' };

const estadoInicial: EstadoTorneo = { fase: 'programado', partidos: 0, goles: 0 };

function reducir(estado: EstadoTorneo, evento: EventoTorneo): EstadoTorneo {
    switch (evento.tipo) {
        case 'iniciar-partido':
            return { ...estado, fase: 'jugando' };
        case 'gol':
            return evento.cantidad > 0 ? { ...estado, goles: estado.goles + evento.cantidad } : estado;
        case 'terminar-partido':
            return { ...estado, fase: 'finalizado', partidos: estado.partidos + 1 };
    }
}

const eventos: EventoTorneo[] = [
    { tipo: 'iniciar-partido' },
    { tipo: 'gol', cantidad: 2 },
    { tipo: 'terminar-partido' }
];

const estadoFinal = eventos.reduce(reducir, estadoInicial);

console.log('===== Torneo futbol asincrono =====');

console.log('Partidos:', estadoFinal.partidos);
console.log('Goles:', estadoFinal.goles);
console.log('Fase final:', estadoFinal.fase);

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', reducir(estadoInicial, { tipo: 'gol', cantidad: 1 }));
console.log('Caso limite:', reducir(estadoInicial, { tipo: 'terminar-partido' }));
