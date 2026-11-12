export {};

type Posicion = 'delantero' | 'mediocampista' | 'defensa';

interface Futbolista {
    readonly id: number;
    nombre: string;
    posicion: Posicion;
    goles: number;
    partidos: number;
}

const futbolistas: Futbolista[] = [
    { id: 1, nombre: 'Mateo', posicion: 'delantero', goles: 21, partidos: 24 },
    { id: 2, nombre: 'Julian', posicion: 'mediocampista', goles: 9, partidos: 22 },
    { id: 3, nombre: 'Andres', posicion: 'defensa', goles: 3, partidos: 20 },
    { id: 4, nombre: 'Luis', posicion: 'delantero', goles: 14, partidos: 12 },
];

function validarFutbolista(item: Futbolista): boolean {
    return item.nombre.trim() !== '' && item.goles >= 0 && item.partidos >= 0;
}

function calcularPromedioGoles(goles: number, partidos: number): number {
    return partidos === 0 ? 0 : goles / partidos;
}

function calcularResumen(item: Futbolista) {
    return {
        ...item,
        promedioGoles: calcularPromedioGoles(item.goles, item.partidos)
    };
}

const resumenes = futbolistas.filter(validarFutbolista).map(calcularResumen);
const ranking = [...resumenes].sort((a, b) => b.promedioGoles - a.promedioGoles);

const totalGoles = resumenes.reduce((total, item) => total + item.goles, 0);
const totalPartidos = resumenes.reduce((total, item) => total + item.partidos, 0);

console.log('===== Ranking de jugadores de futbol =====');

console.log('Futbolistas:', resumenes.length);
console.log('Goles totales:', totalGoles);
console.log('Partidos totales:', totalPartidos);

console.log('\n===== RANKING =====');

ranking.forEach((item, index) => {
    console.log((index + 1) + '. ' + item.nombre + ' - Goles por partido: ' + item.promedioGoles.toFixed(2));
});

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', calcularPromedioGoles(20, 10));
console.log('Caso limite:', calcularPromedioGoles(15, 0));
