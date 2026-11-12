export {};

interface Mensaje {
    readonly id: number;
    nombre: string;
    caracteres: number;
    reportes: number;
}

type EventoMensaje = {
    tipo: 'registrado';
    nombre: string;
};

class ErrorChat extends Error {
    constructor(mensaje: string) {
        super(mensaje);
        this.name = 'ErrorChat';
    }
}

const datos: Mensaje[] = [
    { id: 1, nombre: 'Buen trabajo equipo', caracteres: 19, reportes: 0 },
    { id: 2, nombre: 'Agrupen en mid', caracteres: 14, reportes: 0 },
    { id: 3, nombre: 'Mensaje ofensivo', caracteres: 18, reportes: 3 },
    { id: 4, nombre: 'Cuidado con el gank', caracteres: 21, reportes: 1 },
];

async function obtenerMensajes(fallar: boolean = false): Promise<Mensaje[]> {
    await new Promise((resolve) => setTimeout(resolve, 10));

    if (fallar) {
        throw new ErrorChat('El canal de chat no esta disponible');
    }

    return datos;
}

function validarMensaje(item: Mensaje): boolean {
    return item.nombre.trim() !== '' && item.caracteres >= 0 && item.reportes >= 0;
}

function calcularLegitimidad(item: Mensaje): number {
    return Math.max(0, item.caracteres - item.reportes * 10);
}

function manejarEvento(evento: EventoMensaje): void {
    console.log('Evento:', evento.tipo, evento.nombre);
}

async function main(): Promise<void> {
    const respuesta = await obtenerMensajes();
    const validos = respuesta.filter(validarMensaje);

    console.log('===== Chat de equipo MOBA =====');

    console.log('Mensajes recibidos:', respuesta.length);
    console.log('Mensajes validos:', validos.length);
    console.log('Caracteres total:', validos.reduce((total, item) => total + item.caracteres, 0));
    console.log('Reportes total:', validos.reduce((total, item) => total + item.reportes, 0));

    validos.forEach((item) => {
        console.log(item.nombre + ': ' + calcularLegitimidad(item).toFixed(2));
    });

    if (validos.length > 0) {
        manejarEvento({ tipo: 'registrado', nombre: validos[0].nombre });
    }

    try {
        await obtenerMensajes(true);
    } catch (error) {
        if (error instanceof ErrorChat) {
            console.log('Error controlado:', error.message);
        } else {
            console.log('Error inesperado');
        }
    }
}

void main();
