export {};

type Fase = 'apagado' | 'acelerando' | 'maxima' | 'detenido';

interface EstadoAuto {
    fase: Fase;
    velocidad: number;
}

type EventoAuto =
    | { tipo: 'encender' }
    | { tipo: 'acelerar'; cantidad: number }
    | { tipo: 'frenar' };

const estadoInicial: EstadoAuto = { fase: 'apagado', velocidad: 0 };

function reducir(estado: EstadoAuto, evento: EventoAuto): EstadoAuto {
    switch (evento.tipo) {
        case 'encender':
            return { fase: 'acelerando', velocidad: 0 };
        case 'acelerar':
            if (estado.fase === 'apagado') {
                return estado;
            }
            const velocidad = estado.velocidad + evento.cantidad;
            return { fase: velocidad >= 300 ? 'maxima' : 'acelerando', velocidad };
        case 'frenar':
            return { fase: 'detenido', velocidad: 0 };
    }
}

const eventos: EventoAuto[] = [
    { tipo: 'encender' },
    { tipo: 'acelerar', cantidad: 120 },
    { tipo: 'acelerar', cantidad: 200 }
];

const estadoFinal = eventos.reduce(reducir, estadoInicial);

console.log('===== Simulador de aceleracion hypercar =====');

console.log('Velocidad final:', estadoFinal.velocidad);
console.log('Fase final:', estadoFinal.fase);

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', reducir(estadoInicial, { tipo: 'acelerar', cantidad: 50 }));
console.log('Caso limite:', reducir(estadoInicial, { tipo: 'encender' }));
