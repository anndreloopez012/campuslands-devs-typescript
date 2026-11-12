export {};

type Fase = 'esperando' | 'jugando';

interface EstadoTabla {
    fase: Fase;
    partidos: number;
    puntos: number;
}

type EventoTabla =
    | { tipo: 'jugar-partido'; gano: boolean }
    | { tipo: 'reiniciar' };

const estadoInicial: EstadoTabla = { fase: 'esperando', partidos: 0, puntos: 0 };

function reducir(estado: EstadoTabla, evento: EventoTabla): EstadoTabla {
    switch (evento.tipo) {
        case 'jugar-partido':
            return {
                fase: 'jugando',
                partidos: estado.partidos + 1,
                puntos: estado.puntos + (evento.gano ? 3 : 1)
            };
        case 'reiniciar':
            return estadoInicial;
    }
}

const eventos: EventoTabla[] = [
    { tipo: 'jugar-partido', gano: true },
    { tipo: 'jugar-partido', gano: false },
    { tipo: 'jugar-partido', gano: true }
];

const estadoFinal = eventos.reduce(reducir, estadoInicial);

console.log('===== Tabla futsal interactiva =====');

console.log('Partidos:', estadoFinal.partidos);
console.log('Puntos:', estadoFinal.puntos);
console.log('Promedio:', estadoFinal.puntos / estadoFinal.partidos);

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', reducir(estadoInicial, { tipo: 'jugar-partido', gano: true }));
console.log('Caso limite:', reducir(estadoInicial, { tipo: 'reiniciar' }));
