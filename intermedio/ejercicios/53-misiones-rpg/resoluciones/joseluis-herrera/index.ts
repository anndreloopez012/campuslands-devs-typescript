export {};

interface Mision {
    readonly id: number;
    nombre: string;
    nivel: number;
    recompensa: number;
}

type EventoMision = {
    tipo: 'registrado';
    nombre: string;
};

class ErrorMisiones extends Error {
    constructor(mensaje: string) {
        super(mensaje);
        this.name = 'ErrorMisiones';
    }
}

const datos: Mision[] = [
    { id: 1, nombre: 'Rescate en la aldea', nivel: 2, recompensa: 200 },
    { id: 2, nombre: 'Cueva del dragon', nivel: 5, recompensa: 800 },
    { id: 3, nombre: 'Entrega urgente', nivel: 1, recompensa: 50 },
    { id: 4, nombre: 'Guardian del bosque', nivel: 4, recompensa: 600 },
];

async function obtenerMisiones(fallar: boolean = false): Promise<Mision[]> {
    await new Promise((resolve) => setTimeout(resolve, 10));

    if (fallar) {
        throw new ErrorMisiones('No se pudieron cargar las misiones del gremio');
    }

    return datos;
}

function validarMision(item: Mision): boolean {
    return item.nombre.trim() !== '' && item.nivel >= 0 && item.recompensa >= 0;
}

function calcularRecompensaPorNivel(item: Mision): number {
    return item.nivel === 0 ? 0 : item.recompensa / item.nivel;
}

function manejarEvento(evento: EventoMision): void {
    console.log('Evento:', evento.tipo, evento.nombre);
}

async function main(): Promise<void> {
    const respuesta = await obtenerMisiones();
    const validos = respuesta.filter(validarMision);

    console.log('===== Gestor de misiones RPG =====');

    console.log('Misiones recibidos:', respuesta.length);
    console.log('Misiones validos:', validos.length);
    console.log('Nivel total:', validos.reduce((total, item) => total + item.nivel, 0));
    console.log('Recompensa total:', validos.reduce((total, item) => total + item.recompensa, 0));

    validos.forEach((item) => {
        console.log(item.nombre + ': ' + calcularRecompensaPorNivel(item).toFixed(2));
    });

    if (validos.length > 0) {
        manejarEvento({ tipo: 'registrado', nombre: validos[0].nombre });
    }

    try {
        await obtenerMisiones(true);
    } catch (error) {
        if (error instanceof ErrorMisiones) {
            console.log('Error controlado:', error.message);
        } else {
            console.log('Error inesperado');
        }
    }
}

void main();
