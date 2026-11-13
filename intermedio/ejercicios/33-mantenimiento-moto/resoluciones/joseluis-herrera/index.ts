export {};

type Estado = 'al-dia' | 'vencido' | 'revisado';

interface Moto {
    readonly id: number;
    nombre: string;
    estado: Estado;
    kilometros: number;
    meses: number;
}

class Coleccion<T> {
    private items: T[] = [];

    agregar(item: T): void {
        this.items.push(item);
    }

    listar(): T[] {
        return [...this.items];
    }
}

class SimuladorMantenimiento {
    private participantes = new Coleccion<Moto>();

    registrar(participante: Moto): void {
        if (participante.nombre.trim() !== '') {
            this.participantes.agregar(participante);
        }
    }

    calcularPuntaje(participante: Moto): number {
        return Math.max(0, participante.kilometros / 1000 - participante.meses);
    }

    simular() {
        return this.participantes.listar()
            .filter((participante) => participante.estado !== 'vencido')
            .map((participante) => ({
                ...participante,
                puntaje: this.calcularPuntaje(participante)
            }))
            .sort((a, b) => b.puntaje - a.puntaje);
    }
}

const motos: Moto[] = [
    { id: 1, nombre: 'Raptor 1000', estado: 'al-dia', kilometros: 4500, meses: 3 },
    { id: 2, nombre: 'Street 750', estado: 'vencido', kilometros: 12000, meses: 2 },
    { id: 3, nombre: 'Travel 900', estado: 'revisado', kilometros: 8000, meses: 8 },
];

const simulador = new SimuladorMantenimiento();
motos.forEach((participante) => simulador.registrar(participante));

const resultados = simulador.simular();

console.log('===== Plan de mantenimiento moto =====');

console.log('Motos:', resultados.length);
console.log('Puntaje total:', resultados.reduce((total, resultado) => total + resultado.puntaje, 0));

console.log('\n===== TABLA =====');

resultados.forEach((resultado, index) => {
    console.log((index + 1) + '. ' + resultado.nombre + ' - Puntaje: ' + resultado.puntaje.toFixed(2));
});

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', simulador.calcularPuntaje({
    id: 99,
    nombre: 'Prueba',
    estado: 'al-dia',
    kilometros: 10000,
    meses: 2
}));

console.log('Caso limite:', simulador.calcularPuntaje({
    id: 100,
    nombre: 'Prueba',
    estado: 'al-dia',
    kilometros: 0,
    meses: 0
}));
