export {};

interface Auto {
    readonly id: number;
    nombre: string;
    valor: number;
    anio: number;
}

type EventoAuto = {
    tipo: 'registrado';
    nombre: string;
};

class ErrorGaraje extends Error {
    constructor(mensaje: string) {
        super(mensaje);
        this.name = 'ErrorGaraje';
    }
}

const datos: Auto[] = [
    { id: 1, nombre: 'Falcon GT', valor: 900000, anio: 2020 },
    { id: 2, nombre: 'Vortex R', valor: 1300000, anio: 2022 },
    { id: 3, nombre: 'Apex S', valor: 700000, anio: 2019 },
    { id: 4, nombre: 'Clasico 1968', valor: 2000000, anio: 1968 },
];

async function obtenerAutos(fallar: boolean = false): Promise<Auto[]> {
    await new Promise((resolve) => setTimeout(resolve, 10));

    if (fallar) {
        throw new ErrorGaraje('No se pudo consultar el garaje de lujo');
    }

    return datos;
}

function validarAuto(item: Auto): boolean {
    return item.nombre.trim() !== '' && item.valor >= 0 && item.anio >= 0;
}

function calcularValorAnual(item: Auto): number {
    return item.valor / (2026 - item.anio + 1);
}

function manejarEvento(evento: EventoAuto): void {
    console.log('Evento:', evento.tipo, evento.nombre);
}

async function main(): Promise<void> {
    const respuesta = await obtenerAutos();
    const validos = respuesta.filter(validarAuto);

    console.log('===== Garaje de lujo =====');

    console.log('Autos recibidos:', respuesta.length);
    console.log('Autos validos:', validos.length);
    console.log('Valor total:', validos.reduce((total, item) => total + item.valor, 0));
    console.log('Anio total:', validos.reduce((total, item) => total + item.anio, 0));

    validos.forEach((item) => {
        console.log(item.nombre + ': ' + calcularValorAnual(item).toFixed(2));
    });

    if (validos.length > 0) {
        manejarEvento({ tipo: 'registrado', nombre: validos[0].nombre });
    }

    try {
        await obtenerAutos(true);
    } catch (error) {
        if (error instanceof ErrorGaraje) {
            console.log('Error controlado:', error.message);
        } else {
            console.log('Error inesperado');
        }
    }
}

void main();
