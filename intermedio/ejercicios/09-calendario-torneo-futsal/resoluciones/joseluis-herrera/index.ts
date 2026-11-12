export {};

type Condicion = 'local' | 'visitante';

interface Partido {
    readonly id: number;
    nombre: string;
    condicion: Condicion;
    golesFavor: number;
    golesContra: number;
}

const partidos: Partido[] = [
    { id: 1, nombre: 'Tigres vs Halcones', condicion: 'local', golesFavor: 4, golesContra: 2 },
    { id: 2, nombre: 'Tigres vs Lobos', condicion: 'visitante', golesFavor: 1, golesContra: 3 },
    { id: 3, nombre: 'Tigres vs Aguilas', condicion: 'local', golesFavor: 5, golesContra: 0 },
    { id: 4, nombre: 'Tigres vs Panteras', condicion: 'visitante', golesFavor: 2, golesContra: 2 },
];

function validarPartido(item: Partido): boolean {
    return item.nombre.trim() !== '' && item.golesFavor >= 0 && item.golesContra >= 0;
}

function calcularDiferencia(golesFavor: number, golesContra: number): number {
    return golesFavor - golesContra;
}

function calcularResumen(item: Partido) {
    return {
        ...item,
        diferencia: calcularDiferencia(item.golesFavor, item.golesContra)
    };
}

const resumenes = partidos.filter(validarPartido).map(calcularResumen);
const ranking = [...resumenes].sort((a, b) => b.diferencia - a.diferencia);

const totalGolesafavor = resumenes.reduce((total, item) => total + item.golesFavor, 0);
const totalGolesencontra = resumenes.reduce((total, item) => total + item.golesContra, 0);

console.log('===== Calendario de torneo futsal =====');

console.log('Partidos:', resumenes.length);
console.log('Goles a favor totales:', totalGolesafavor);
console.log('Goles en contra totales:', totalGolesencontra);

console.log('\n===== RANKING =====');

ranking.forEach((item, index) => {
    console.log((index + 1) + '. ' + item.nombre + ' - Diferencia de goles: ' + item.diferencia.toFixed(0));
});

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', calcularDiferencia(20, 10));
console.log('Caso limite:', calcularDiferencia(15, 0));
