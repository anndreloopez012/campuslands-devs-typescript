export {};

type Estado = 'en-cola' | 'procesando' | 'completado' | 'fallido';

interface Render {
    readonly id: number;
    nombre: string;
    fecha: string;
    estado: Estado;
    horas: number;
}

const renders: Render[] = [
    { id: 1, nombre: 'Escena interior', fecha: '2026-01-11', estado: 'completado', horas: 14 },
    { id: 2, nombre: 'Animacion corta', fecha: '2026-01-26', estado: 'procesando', horas: 20 },
    { id: 3, nombre: 'Fachada', fecha: '2026-02-09', estado: 'en-cola', horas: 8 },
    { id: 4, nombre: 'Personaje', fecha: '2026-02-23', estado: 'fallido', horas: 12 },
];

function validarRender(item: Render): boolean {
    return item.nombre.trim() !== '' && !Number.isNaN(Date.parse(item.fecha)) && item.horas > 0;
}

function filtrarPorMes(lista: Render[], mes: string): Render[] {
    return lista.filter((item) => item.fecha.startsWith(mes));
}

function contarPorEstado(lista: Render[]): Record<Estado, number> {
    return lista.reduce((conteo, item) => {
        conteo[item.estado] += 1;
        return conteo;
    }, { 'en-cola': 0, 'procesando': 0, 'completado': 0, 'fallido': 0 });
}

function calcularTotal(lista: Render[]): number {
    return lista.reduce((total, item) => total + item.horas, 0);
}

const validos = renders.filter(validarRender);
const enero = filtrarPorMes(validos, '2026-01');
const confirmados = validos.filter((item) => item.estado === 'completado');

console.log('===== Render farm 3D =====');

console.log('Renders validos:', validos.length);
console.log('Renders confirmados:', confirmados.length);
console.log('Horas total:', calcularTotal(validos));
console.log('Horas en enero:', calcularTotal(enero));
console.log('Conteo por estado:', contarPorEstado(validos));

console.log('\n===== PRUEBAS =====');

const casoNormal = calcularTotal([
    { id: 99, nombre: 'Prueba', fecha: '2026-01-15', estado: 'completado', horas: 10 }
]);

const casoLimite = calcularTotal([]);

console.log('Caso normal:', casoNormal);
console.log('Caso limite:', casoLimite);
