export {};

interface EstadoPlaylist {
    cancion: string;
    reproduciendo: boolean;
}

type EventoPlaylist =
    | { tipo: 'reproducir'; cancion: string }
    | { tipo: 'pausar' }
    | { tipo: 'detener' };

const estadoInicial: EstadoPlaylist = { cancion: '', reproduciendo: false };

function reducir(estado: EstadoPlaylist, evento: EventoPlaylist): EstadoPlaylist {
    switch (evento.tipo) {
        case 'reproducir':
            return { cancion: evento.cancion, reproduciendo: true };
        case 'pausar':
            return { ...estado, reproduciendo: false };
        case 'detener':
            return estadoInicial;
    }
}

const eventos: EventoPlaylist[] = [
    { tipo: 'reproducir', cancion: 'Neon Lights' },
    { tipo: 'pausar' },
    { tipo: 'reproducir', cancion: 'Midnight Drive' }
];

const estadoFinal = eventos.reduce(reducir, estadoInicial);

console.log('===== Playlist interactiva =====');

console.log('Cancion actual:', estadoFinal.cancion);
console.log('Reproduciendo:', estadoFinal.reproduciendo);

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', reducir(estadoInicial, { tipo: 'reproducir', cancion: 'Echoes' }));
console.log('Caso limite:', reducir(estadoInicial, { tipo: 'detener' }));
