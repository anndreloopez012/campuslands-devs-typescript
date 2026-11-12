export {};

interface Lectura {
    readonly id: number;
    nombre: string;
    temperatura: number;
    presion: number;
}

type EventoLectura = {
    tipo: 'registrado';
    nombre: string;
};

class ErrorSensores extends Error {
    constructor(mensaje: string) {
        super(mensaje);
        this.name = 'ErrorSensores';
    }
}

const datos: Lectura[] = [
    { id: 1, nombre: 'Motor caliente', temperatura: 92, presion: 33 },
    { id: 2, nombre: 'Motor frio', temperatura: 70, presion: 30 },
    { id: 3, nombre: 'Presion alta', temperatura: 90, presion: 38 },
    { id: 4, nombre: 'Rango normal', temperatura: 89, presion: 32 },
];

async function obtenerLecturas(fallar: boolean = false): Promise<Lectura[]> {
    await new Promise((resolve) => setTimeout(resolve, 10));

    if (fallar) {
        throw new ErrorSensores('Los sensores de la moto no respondieron');
    }

    return datos;
}

function validarLectura(item: Lectura): boolean {
    return item.nombre.trim() !== '' && item.temperatura >= 0 && item.presion >= 0;
}

function calcularDesviacion(item: Lectura): number {
    return Math.abs(item.temperatura - 90) + Math.abs(item.presion - 32);
}

function manejarEvento(evento: EventoLectura): void {
    console.log('Evento:', evento.tipo, evento.nombre);
}

async function main(): Promise<void> {
    const respuesta = await obtenerLecturas();
    const validos = respuesta.filter(validarLectura);

    console.log('===== Panel DOM de sensores moto =====');

    console.log('Lecturas recibidos:', respuesta.length);
    console.log('Lecturas validos:', validos.length);
    console.log('Temperatura total:', validos.reduce((total, item) => total + item.temperatura, 0));
    console.log('Presion total:', validos.reduce((total, item) => total + item.presion, 0));

    validos.forEach((item) => {
        console.log(item.nombre + ': ' + calcularDesviacion(item).toFixed(2));
    });

    if (validos.length > 0) {
        manejarEvento({ tipo: 'registrado', nombre: validos[0].nombre });
    }

    try {
        await obtenerLecturas(true);
    } catch (error) {
        if (error instanceof ErrorSensores) {
            console.log('Error controlado:', error.message);
        } else {
            console.log('Error inesperado');
        }
    }
}

void main();
