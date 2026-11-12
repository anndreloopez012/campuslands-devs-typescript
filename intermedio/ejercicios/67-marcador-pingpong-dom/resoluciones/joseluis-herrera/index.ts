export {};

interface EstadoMarcador {
    puntosA: number;
    puntosB: number;
    terminado: boolean;
}

type EventoMarcador =
    | { tipo: 'anotar'; jugador: 'A' | 'B' }
    | { tipo: 'reiniciar' };

const estadoInicial: EstadoMarcador = { puntosA: 0, puntosB: 0, terminado: false };

function reducir(estado: EstadoMarcador, evento: EventoMarcador): EstadoMarcador {
    switch (evento.tipo) {
        case 'anotar':
            const puntosA = evento.jugador === 'A' ? estado.puntosA + 1 : estado.puntosA;
            const puntosB = evento.jugador === 'B' ? estado.puntosB + 1 : estado.puntosB;
            const terminado = (puntosA >= 11 || puntosB >= 11) && Math.abs(puntosA - puntosB) >= 2;
            return { puntosA, puntosB, terminado };
        case 'reiniciar':
            return estadoInicial;
    }
}

const eventos: EventoMarcador[] = [
    { tipo: 'anotar', jugador: 'A' },
    { tipo: 'anotar', jugador: 'A' },
    { tipo: 'anotar', jugador: 'B' }
];

const estadoFinal = eventos.reduce(reducir, estadoInicial);

console.log('===== Marcador pingpong DOM =====');

console.log('Puntos A:', estadoFinal.puntosA);
console.log('Puntos B:', estadoFinal.puntosB);
console.log('Terminado:', estadoFinal.terminado);

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', reducir(estadoInicial, { tipo: 'anotar', jugador: 'A' }));
console.log('Caso limite:', reducir(estadoInicial, { tipo: 'reiniciar' }));
