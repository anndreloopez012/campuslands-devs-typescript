export {};

interface Zona {
    readonly id: number;
    nombre: string;
    objetos: number;
    peligro: number;
}

type EventoZona = {
    tipo: 'registrado';
    nombre: string;
};

class ErrorMapa extends Error {
    constructor(mensaje: string) {
        super(mensaje);
        this.name = 'ErrorMapa';
    }
}

const datos: Zona[] = [
    { id: 1, nombre: 'Ciudad central', objetos: 25, peligro: 4 },
    { id: 2, nombre: 'Puerto', objetos: 18, peligro: 6 },
    { id: 3, nombre: 'Granja', objetos: 10, peligro: 2 },
    { id: 4, nombre: 'Base militar', objetos: 30, peligro: 9 },
];

async function obtenerZonas(fallar: boolean = false): Promise<Zona[]> {
    await new Promise((resolve) => setTimeout(resolve, 10));

    if (fallar) {
        throw new ErrorMapa('No se pudo descargar el mapa de loot');
    }

    return datos;
}

function validarZona(item: Zona): boolean {
    return item.nombre.trim() !== '' && item.objetos >= 0 && item.peligro >= 0;
}

function calcularValor(item: Zona): number {
    return Math.max(0, item.objetos * 10 - item.peligro * 5);
}

function manejarEvento(evento: EventoZona): void {
    console.log('Evento:', evento.tipo, evento.nombre);
}

async function main(): Promise<void> {
    const respuesta = await obtenerZonas();
    const validos = respuesta.filter(validarZona);

    console.log('===== Mapa de loot battle royale =====');

    console.log('Zonas recibidos:', respuesta.length);
    console.log('Zonas validos:', validos.length);
    console.log('Objetos total:', validos.reduce((total, item) => total + item.objetos, 0));
    console.log('Peligro total:', validos.reduce((total, item) => total + item.peligro, 0));

    validos.forEach((item) => {
        console.log(item.nombre + ': ' + calcularValor(item).toFixed(2));
    });

    if (validos.length > 0) {
        manejarEvento({ tipo: 'registrado', nombre: validos[0].nombre });
    }

    try {
        await obtenerZonas(true);
    } catch (error) {
        if (error instanceof ErrorMapa) {
            console.log('Error controlado:', error.message);
        } else {
            console.log('Error inesperado');
        }
    }
}

void main();
