export {};

interface Compuesto {
    readonly id: number;
    nombre: string;
    reactivos: number;
    productos: number;
}

type EventoCompuesto = {
    tipo: 'registrado';
    nombre: string;
};

class ErrorQuimica extends Error {
    constructor(mensaje: string) {
        super(mensaje);
        this.name = 'ErrorQuimica';
    }
}

const datos: Compuesto[] = [
    { id: 1, nombre: 'Metano', reactivos: 1, productos: 2 },
    { id: 2, nombre: 'Agua', reactivos: 2, productos: 2 },
    { id: 3, nombre: 'Dioxido de carbono', reactivos: 1, productos: 3 },
    { id: 4, nombre: 'Amoniaco', reactivos: 1, productos: 4 },
];

async function obtenerCompuestos(fallar: boolean = false): Promise<Compuesto[]> {
    await new Promise((resolve) => setTimeout(resolve, 10));

    if (fallar) {
        throw new ErrorQuimica('No se pudo obtener el catalogo de compuestos');
    }

    return datos;
}

function validarCompuesto(item: Compuesto): boolean {
    return item.nombre.trim() !== '' && item.reactivos >= 0 && item.productos >= 0;
}

function calcularBalance(item: Compuesto): number {
    return item.productos - item.reactivos;
}

function manejarEvento(evento: EventoCompuesto): void {
    console.log('Evento:', evento.tipo, evento.nombre);
}

async function main(): Promise<void> {
    const respuesta = await obtenerCompuestos();
    const validos = respuesta.filter(validarCompuesto);

    console.log('===== Balance quimico simple =====');

    console.log('Compuestos recibidos:', respuesta.length);
    console.log('Compuestos validos:', validos.length);
    console.log('Reactivos total:', validos.reduce((total, item) => total + item.reactivos, 0));
    console.log('Productos total:', validos.reduce((total, item) => total + item.productos, 0));

    validos.forEach((item) => {
        console.log(item.nombre + ': ' + calcularBalance(item).toFixed(2));
    });

    if (validos.length > 0) {
        manejarEvento({ tipo: 'registrado', nombre: validos[0].nombre });
    }

    try {
        await obtenerCompuestos(true);
    } catch (error) {
        if (error instanceof ErrorQuimica) {
            console.log('Error controlado:', error.message);
        } else {
            console.log('Error inesperado');
        }
    }
}

void main();
