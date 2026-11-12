export {};

type Estado = 'boceto' | 'terminado' | 'archivado';

interface Dibujo {
    readonly id: number;
    nombre: string;
    fecha: string;
    estado: Estado;
    horas: number;
}

const dibujos: Dibujo[] = [
    { id: 1, nombre: 'Retrato digital', fecha: '2026-01-06', estado: 'terminado', horas: 12 },
    { id: 2, nombre: 'Estudio de manos', fecha: '2026-01-18', estado: 'terminado', horas: 6 },
    { id: 3, nombre: 'Paisaje', fecha: '2026-02-01', estado: 'boceto', horas: 4 },
    { id: 4, nombre: 'Personaje', fecha: '2026-02-13', estado: 'archivado', horas: 8 },
];

function validarDibujo(item: Dibujo): boolean {
    return item.nombre.trim() !== '' && !Number.isNaN(Date.parse(item.fecha)) && item.horas > 0;
}

function filtrarPorMes(lista: Dibujo[], mes: string): Dibujo[] {
    return lista.filter((item) => item.fecha.startsWith(mes));
}

function contarPorEstado(lista: Dibujo[]): Record<Estado, number> {
    return lista.reduce((conteo, item) => {
        conteo[item.estado] += 1;
        return conteo;
    }, { 'boceto': 0, 'terminado': 0, 'archivado': 0 });
}

function calcularTotal(lista: Dibujo[]): number {
    return lista.reduce((total, item) => total + item.horas, 0);
}

const validos = dibujos.filter(validarDibujo);
const enero = filtrarPorMes(validos, '2026-01');
const confirmados = validos.filter((item) => item.estado === 'terminado');

console.log('===== Portafolio de dibujo =====');

console.log('Dibujos validos:', validos.length);
console.log('Dibujos confirmados:', confirmados.length);
console.log('Horas total:', calcularTotal(validos));
console.log('Horas en enero:', calcularTotal(enero));
console.log('Conteo por estado:', contarPorEstado(validos));

console.log('\n===== PRUEBAS =====');

const casoNormal = calcularTotal([
    { id: 99, nombre: 'Prueba', fecha: '2026-01-15', estado: 'terminado', horas: 10 }
]);

const casoLimite = calcularTotal([]);

console.log('Caso normal:', casoNormal);
console.log('Caso limite:', casoLimite);
