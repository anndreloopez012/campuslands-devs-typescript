export {};

type Tipo = 'sport' | 'naked' | 'touring';

interface Moto {
    readonly id: number;
    nombre: string;
    tipo: Tipo;
    velocidadMaxima: number;
    tiempoVuelta: number;
}

const motos: Moto[] = [
    { id: 1, nombre: 'Raptor 1000', tipo: 'sport', velocidadMaxima: 299, tiempoVuelta: 1.42 },
    { id: 2, nombre: 'Street 750', tipo: 'naked', velocidadMaxima: 220, tiempoVuelta: 1.68 },
    { id: 3, nombre: 'Travel 900', tipo: 'touring', velocidadMaxima: 240, tiempoVuelta: 1.75 },
    { id: 4, nombre: 'Track 1200', tipo: 'sport', velocidadMaxima: 310, tiempoVuelta: 1.35 },
];

function validarMoto(item: Moto): boolean {
    return item.nombre.trim() !== '' && item.velocidadMaxima >= 0 && item.tiempoVuelta >= 0;
}

function calcularRendimiento(velocidadMaxima: number, tiempoVuelta: number): number {
    return tiempoVuelta === 0 ? 0 : velocidadMaxima / tiempoVuelta;
}

function calcularResumen(item: Moto) {
    return {
        ...item,
        rendimiento: calcularRendimiento(item.velocidadMaxima, item.tiempoVuelta)
    };
}

const resumenes = motos.filter(validarMoto).map(calcularResumen);
const ranking = [...resumenes].sort((a, b) => b.rendimiento - a.rendimiento);

const totalVelocidadmaxima = resumenes.reduce((total, item) => total + item.velocidadMaxima, 0);
const totalTiempodevuelta = resumenes.reduce((total, item) => total + item.tiempoVuelta, 0);

console.log('===== Telemetria de motos deportivas =====');

console.log('Motos:', resumenes.length);
console.log('Velocidad maxima totales:', totalVelocidadmaxima);
console.log('Tiempo de vuelta totales:', totalTiempodevuelta);

console.log('\n===== RANKING =====');

ranking.forEach((item, index) => {
    console.log((index + 1) + '. ' + item.nombre + ' - Rendimiento: ' + item.rendimiento.toFixed(2));
});

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', calcularRendimiento(20, 10));
console.log('Caso limite:', calcularRendimiento(15, 0));
