export {};

interface Auto {
    readonly id: number;
    nombre: string;
    potencia: number;
    precio: number;
}

type EventoAuto = {
    tipo: 'registrado';
    nombre: string;
};

class ErrorAutos extends Error {
    constructor(mensaje: string) {
        super(mensaje);
        this.name = 'ErrorAutos';
    }
}

const datos: Auto[] = [
    { id: 1, nombre: 'Falcon GT', potencia: 720, precio: 180000 },
    { id: 2, nombre: 'Vortex R', potencia: 900, precio: 250000 },
    { id: 3, nombre: 'Apex S', potencia: 650, precio: 150000 },
    { id: 4, nombre: 'Clasico 1968', potencia: 300, precio: 400000 },
];

async function obtenerAutos(fallar: boolean = false): Promise<Auto[]> {
    await new Promise((resolve) => setTimeout(resolve, 10));

    if (fallar) {
        throw new ErrorAutos('La API de autos premium no respondio');
    }

    return datos;
}

function validarAuto(item: Auto): boolean {
    return item.nombre.trim() !== '' && item.potencia >= 0 && item.precio >= 0;
}

function calcularPotenciaPorPrecio(item: Auto): number {
    return item.precio === 0 ? 0 : (item.potencia / item.precio) * 1000;
}

function manejarEvento(evento: EventoAuto): void {
    console.log('Evento:', evento.tipo, evento.nombre);
}

async function main(): Promise<void> {
    const respuesta = await obtenerAutos();
    const validos = respuesta.filter(validarAuto);

    console.log('===== Comparador de autos premium =====');

    console.log('Autos recibidos:', respuesta.length);
    console.log('Autos validos:', validos.length);
    console.log('Potencia total:', validos.reduce((total, item) => total + item.potencia, 0));
    console.log('Precio total:', validos.reduce((total, item) => total + item.precio, 0));

    validos.forEach((item) => {
        console.log(item.nombre + ': ' + calcularPotenciaPorPrecio(item).toFixed(2));
    });

    if (validos.length > 0) {
        manejarEvento({ tipo: 'registrado', nombre: validos[0].nombre });
    }

    try {
        await obtenerAutos(true);
    } catch (error) {
        if (error instanceof ErrorAutos) {
            console.log('Error controlado:', error.message);
        } else {
            console.log('Error inesperado');
        }
    }
}

void main();
