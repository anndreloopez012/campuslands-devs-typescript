export {};

type Estado = 'en-subasta' | 'vendido' | 'retirado';

interface Auto {
    readonly id: number;
    nombre: string;
    estado: Estado;
    oferta: number;
    anio: number;
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

class SimuladorSubasta {
    private participantes = new Coleccion<Auto>();

    registrar(participante: Auto): void {
        if (participante.nombre.trim() !== '') {
            this.participantes.agregar(participante);
        }
    }

    calcularPuntaje(participante: Auto): number {
        return participante.oferta / (2026 - participante.anio + 1);
    }

    simular() {
        return this.participantes.listar()
            .filter((participante) => participante.estado !== 'retirado')
            .map((participante) => ({
                ...participante,
                puntaje: this.calcularPuntaje(participante)
            }))
            .sort((a, b) => b.puntaje - a.puntaje);
    }
}

const autos: Auto[] = [
    { id: 1, nombre: 'Falcon GT', estado: 'en-subasta', oferta: 250000, anio: 2020 },
    { id: 2, nombre: 'Vortex R', estado: 'vendido', oferta: 400000, anio: 2022 },
    { id: 3, nombre: 'Clasico 1968', estado: 'retirado', oferta: 180000, anio: 1968 },
];

const simulador = new SimuladorSubasta();
autos.forEach((participante) => simulador.registrar(participante));

const resultados = simulador.simular();

console.log('===== Subasta de autos de lujo =====');

console.log('Autos:', resultados.length);
console.log('Puntaje total:', resultados.reduce((total, resultado) => total + resultado.puntaje, 0));

console.log('\n===== TABLA =====');

resultados.forEach((resultado, index) => {
    console.log((index + 1) + '. ' + resultado.nombre + ' - Puntaje: ' + resultado.puntaje.toFixed(2));
});

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', simulador.calcularPuntaje({
    id: 99,
    nombre: 'Prueba',
    estado: 'en-subasta',
    oferta: 300000,
    anio: 2020
}));

console.log('Caso limite:', simulador.calcularPuntaje({
    id: 100,
    nombre: 'Prueba',
    estado: 'en-subasta',
    oferta: 0,
    anio: 0
}));
