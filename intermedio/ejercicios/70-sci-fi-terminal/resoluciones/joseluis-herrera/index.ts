export {};

interface EstadoTerminal {
    encendida: boolean;
    energia: number;
    comando: string;
}

type EventoTerminal =
    | { tipo: 'encender' }
    | { tipo: 'ejecutar'; comando: string; costo: number }
    | { tipo: 'recargar'; cantidad: number };

const estadoInicial: EstadoTerminal = { encendida: false, energia: 100, comando: '' };

function reducir(estado: EstadoTerminal, evento: EventoTerminal): EstadoTerminal {
    switch (evento.tipo) {
        case 'encender':
            return { ...estado, encendida: true };
        case 'ejecutar':
            if (!estado.encendida || evento.costo > estado.energia) {
                return estado;
            }
            return {
                ...estado,
                energia: estado.energia - evento.costo,
                comando: evento.comando
            };
        case 'recargar':
            return { ...estado, energia: Math.min(100, estado.energia + evento.cantidad) };
    }
}

const eventos: EventoTerminal[] = [
    { tipo: 'encender' },
    { tipo: 'ejecutar', comando: 'escanear', costo: 30 },
    { tipo: 'recargar', cantidad: 10 }
];

const estadoFinal = eventos.reduce(reducir, estadoInicial);

console.log('===== Terminal sci-fi =====');

console.log('Energia:', estadoFinal.energia);
console.log('Comando:', estadoFinal.comando);
console.log('Encendida:', estadoFinal.encendida);

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', reducir(estadoInicial, { tipo: 'ejecutar', comando: 'test', costo: 10 }));
console.log('Caso limite:', reducir(estadoInicial, { tipo: 'encender' }));
