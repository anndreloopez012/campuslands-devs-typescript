export {};

type Servicio = 'mantenimiento' | 'reparacion' | 'diagnostico';

interface Orden {
    readonly id: number;
    nombre: string;
    servicio: Servicio;
    costo: number;
    horas: number;
}

const ordenes: Orden[] = [
    { id: 1, nombre: 'Cambio de aceite', servicio: 'mantenimiento', costo: 120000, horas: 1.5 },
    { id: 2, nombre: 'Reparacion de frenos', servicio: 'reparacion', costo: 350000, horas: 4 },
    { id: 3, nombre: 'Revision general', servicio: 'diagnostico', costo: 90000, horas: 1 },
    { id: 4, nombre: 'Ajuste de motor', servicio: 'reparacion', costo: 600000, horas: 6 },
];

function validarOrden(item: Orden): boolean {
    return item.nombre.trim() !== '' && item.costo >= 0 && item.horas >= 0;
}

function calcularCostoHora(costo: number, horas: number): number {
    return horas === 0 ? 0 : costo / horas;
}

function calcularResumen(item: Orden) {
    return {
        ...item,
        costoHora: calcularCostoHora(item.costo, item.horas)
    };
}

const resumenes = ordenes.filter(validarOrden).map(calcularResumen);
const ranking = [...resumenes].sort((a, b) => b.costoHora - a.costoHora);

const totalCosto = resumenes.reduce((total, item) => total + item.costo, 0);
const totalHoras = resumenes.reduce((total, item) => total + item.horas, 0);

console.log('===== Ordenes de taller de motos =====');

console.log('Ordenes:', resumenes.length);
console.log('Costo totales:', totalCosto);
console.log('Horas totales:', totalHoras);

console.log('\n===== RANKING =====');

ranking.forEach((item, index) => {
    console.log((index + 1) + '. ' + item.nombre + ' - Costo por hora: ' + item.costoHora.toFixed(2));
});

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', calcularCostoHora(20, 10));
console.log('Caso limite:', calcularCostoHora(15, 0));
