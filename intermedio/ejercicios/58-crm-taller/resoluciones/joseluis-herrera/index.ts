export {};

interface Cliente {
    readonly id: number;
    nombre: string;
    ordenes: number;
    gasto: number;
}

type EventoCliente = {
    tipo: 'registrado';
    nombre: string;
};

class ErrorCrm extends Error {
    constructor(mensaje: string) {
        super(mensaje);
        this.name = 'ErrorCrm';
    }
}

const datos: Cliente[] = [
    { id: 1, nombre: 'Carlos', ordenes: 5, gasto: 900000 },
    { id: 2, nombre: 'Maria', ordenes: 3, gasto: 450000 },
    { id: 3, nombre: 'Andres', ordenes: 1, gasto: 120000 },
    { id: 4, nombre: 'Laura', ordenes: 8, gasto: 1600000 },
];

async function obtenerClientes(fallar: boolean = false): Promise<Cliente[]> {
    await new Promise((resolve) => setTimeout(resolve, 10));

    if (fallar) {
        throw new ErrorCrm('No se pudo cargar el CRM del taller');
    }

    return datos;
}

function validarCliente(item: Cliente): boolean {
    return item.nombre.trim() !== '' && item.ordenes >= 0 && item.gasto >= 0;
}

function calcularGastoPromedio(item: Cliente): number {
    return item.ordenes === 0 ? 0 : item.gasto / item.ordenes;
}

function manejarEvento(evento: EventoCliente): void {
    console.log('Evento:', evento.tipo, evento.nombre);
}

async function main(): Promise<void> {
    const respuesta = await obtenerClientes();
    const validos = respuesta.filter(validarCliente);

    console.log('===== Mini CRM de taller =====');

    console.log('Clientes recibidos:', respuesta.length);
    console.log('Clientes validos:', validos.length);
    console.log('Ordenes total:', validos.reduce((total, item) => total + item.ordenes, 0));
    console.log('Gasto total:', validos.reduce((total, item) => total + item.gasto, 0));

    validos.forEach((item) => {
        console.log(item.nombre + ': ' + calcularGastoPromedio(item).toFixed(2));
    });

    if (validos.length > 0) {
        manejarEvento({ tipo: 'registrado', nombre: validos[0].nombre });
    }

    try {
        await obtenerClientes(true);
    } catch (error) {
        if (error instanceof ErrorCrm) {
            console.log('Error controlado:', error.message);
        } else {
            console.log('Error inesperado');
        }
    }
}

void main();
