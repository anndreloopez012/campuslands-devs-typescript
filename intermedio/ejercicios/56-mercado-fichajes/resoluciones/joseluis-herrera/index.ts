export {};

interface Fichaje {
    readonly id: number;
    nombre: string;
    costo: number;
    goles: number;
}

type EventoFichaje = {
    tipo: 'registrado';
    nombre: string;
};

class ErrorFichajes extends Error {
    constructor(mensaje: string) {
        super(mensaje);
        this.name = 'ErrorFichajes';
    }
}

const datos: Fichaje[] = [
    { id: 1, nombre: 'Delantero estrella', costo: 5000000, goles: 25 },
    { id: 2, nombre: 'Mediocampista joven', costo: 2500000, goles: 8 },
    { id: 3, nombre: 'Defensa veterano', costo: 1200000, goles: 2 },
    { id: 4, nombre: 'Portero', costo: 1800000, goles: 0 },
];

async function obtenerFichajes(fallar: boolean = false): Promise<Fichaje[]> {
    await new Promise((resolve) => setTimeout(resolve, 10));

    if (fallar) {
        throw new ErrorFichajes('No se pudo consultar el mercado de fichajes');
    }

    return datos;
}

function validarFichaje(item: Fichaje): boolean {
    return item.nombre.trim() !== '' && item.costo >= 0 && item.goles >= 0;
}

function calcularCostoPorGol(item: Fichaje): number {
    return item.goles === 0 ? 0 : item.costo / item.goles;
}

function manejarEvento(evento: EventoFichaje): void {
    console.log('Evento:', evento.tipo, evento.nombre);
}

async function main(): Promise<void> {
    const respuesta = await obtenerFichajes();
    const validos = respuesta.filter(validarFichaje);

    console.log('===== Mercado de fichajes futbol =====');

    console.log('Fichajes recibidos:', respuesta.length);
    console.log('Fichajes validos:', validos.length);
    console.log('Costo total:', validos.reduce((total, item) => total + item.costo, 0));
    console.log('Goles total:', validos.reduce((total, item) => total + item.goles, 0));

    validos.forEach((item) => {
        console.log(item.nombre + ': ' + calcularCostoPorGol(item).toFixed(2));
    });

    if (validos.length > 0) {
        manejarEvento({ tipo: 'registrado', nombre: validos[0].nombre });
    }

    try {
        await obtenerFichajes(true);
    } catch (error) {
        if (error instanceof ErrorFichajes) {
            console.log('Error controlado:', error.message);
        } else {
            console.log('Error inesperado');
        }
    }
}

void main();
