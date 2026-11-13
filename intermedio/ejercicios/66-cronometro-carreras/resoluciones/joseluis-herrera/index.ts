export {};

type Fase = 'listo' | 'corriendo' | 'finalizado';

interface EstadoCronometro {
    fase: Fase;
    vuelta: number;
    tiempo: number;
}

type EventoCronometro =
    | { tipo: 'iniciar' }
    | { tipo: 'marcar-vuelta'; tiempo: number }
    | { tipo: 'finalizar' };

const estadoInicial: EstadoCronometro = { fase: 'listo', vuelta: 0, tiempo: 0 };

function reducir(estado: EstadoCronometro, evento: EventoCronometro): EstadoCronometro {
    switch (evento.tipo) {
        case 'iniciar':
            return { ...estado, fase: 'corriendo' };
        case 'marcar-vuelta':
            return evento.tiempo > 0
                ? { ...estado, vuelta: estado.vuelta + 1, tiempo: estado.tiempo + evento.tiempo }
                : estado;
        case 'finalizar':
            return { ...estado, fase: 'finalizado' };
    }
}

const eventos: EventoCronometro[] = [
    { tipo: 'iniciar' },
    { tipo: 'marcar-vuelta', tiempo: 62 },
    { tipo: 'marcar-vuelta', tiempo: 60 },
    { tipo: 'finalizar' }
];

const estadoFinal = eventos.reduce(reducir, estadoInicial);

console.log('===== Cronometro de carreras =====');

console.log('Vueltas:', estadoFinal.vuelta);
console.log('Tiempo total:', estadoFinal.tiempo);
console.log('Fase final:', estadoFinal.fase);

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', reducir(estadoInicial, { tipo: 'marcar-vuelta', tiempo: 60 }));
console.log('Caso limite:', reducir(estadoInicial, { tipo: 'finalizar' }));
