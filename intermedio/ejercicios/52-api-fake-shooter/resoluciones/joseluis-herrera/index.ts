export {};

interface Jugador {
    readonly id: number;
    nombre: string;
    kills: number;
    deaths: number;
}

type EventoJugador = {
    tipo: 'registrado';
    nombre: string;
};

class ErrorApiShooter extends Error {
    constructor(mensaje: string) {
        super(mensaje);
        this.name = 'ErrorApiShooter';
    }
}

const datos: Jugador[] = [
    { id: 1, nombre: 'Shadow', kills: 25, deaths: 10 },
    { id: 2, nombre: 'Ghost', kills: 30, deaths: 15 },
    { id: 3, nombre: 'Raven', kills: 12, deaths: 8 },
    { id: 4, nombre: 'Hunter', kills: 15, deaths: 0 },
];

async function obtenerJugadores(fallar: boolean = false): Promise<Jugador[]> {
    await new Promise((resolve) => setTimeout(resolve, 10));

    if (fallar) {
        throw new ErrorApiShooter('La API de jugadores no respondio correctamente');
    }

    return datos;
}

function validarJugador(item: Jugador): boolean {
    return item.nombre.trim() !== '' && item.kills >= 0 && item.deaths >= 0;
}

function calcularKd(item: Jugador): number {
    return item.deaths === 0 ? item.kills : item.kills / item.deaths;
}

function manejarEvento(evento: EventoJugador): void {
    console.log('Evento:', evento.tipo, evento.nombre);
}

async function main(): Promise<void> {
    const respuesta = await obtenerJugadores();
    const validos = respuesta.filter(validarJugador);

    console.log('===== Cliente API fake shooter =====');

    console.log('Jugadores recibidos:', respuesta.length);
    console.log('Jugadores validos:', validos.length);
    console.log('Kills total:', validos.reduce((total, item) => total + item.kills, 0));
    console.log('Deaths total:', validos.reduce((total, item) => total + item.deaths, 0));

    validos.forEach((item) => {
        console.log(item.nombre + ': ' + calcularKd(item).toFixed(2));
    });

    if (validos.length > 0) {
        manejarEvento({ tipo: 'registrado', nombre: validos[0].nombre });
    }

    try {
        await obtenerJugadores(true);
    } catch (error) {
        if (error instanceof ErrorApiShooter) {
            console.log('Error controlado:', error.message);
        } else {
            console.log('Error inesperado');
        }
    }
}

void main();
