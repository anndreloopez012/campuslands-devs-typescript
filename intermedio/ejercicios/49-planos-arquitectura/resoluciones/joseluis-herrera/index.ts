export {};

type Estado = 'borrador' | 'revision' | 'aprobado';

interface Plano {
    readonly id: number;
    nombre: string;
    fecha: string;
    estado: Estado;
    area: number;
}

const planos: Plano[] = [
    { id: 1, nombre: 'Planta baja', fecha: '2026-01-13', estado: 'aprobado', area: 120 },
    { id: 2, nombre: 'Segundo piso', fecha: '2026-01-27', estado: 'revision', area: 95 },
    { id: 3, nombre: 'Fachada', fecha: '2026-02-10', estado: 'borrador', area: 60 },
    { id: 4, nombre: 'Cubierta', fecha: '2026-02-25', estado: 'aprobado', area: 110 },
];

function validarPlano(item: Plano): boolean {
    return item.nombre.trim() !== '' && !Number.isNaN(Date.parse(item.fecha)) && item.area > 0;
}

function filtrarPorMes(lista: Plano[], mes: string): Plano[] {
    return lista.filter((item) => item.fecha.startsWith(mes));
}

function contarPorEstado(lista: Plano[]): Record<Estado, number> {
    return lista.reduce((conteo, item) => {
        conteo[item.estado] += 1;
        return conteo;
    }, { 'borrador': 0, 'revision': 0, 'aprobado': 0 });
}

function calcularTotal(lista: Plano[]): number {
    return lista.reduce((total, item) => total + item.area, 0);
}

const validos = planos.filter(validarPlano);
const enero = filtrarPorMes(validos, '2026-01');
const confirmados = validos.filter((item) => item.estado === 'aprobado');

console.log('===== Control de planos 3D =====');

console.log('Planos validos:', validos.length);
console.log('Planos confirmados:', confirmados.length);
console.log('Area total:', calcularTotal(validos));
console.log('Area en enero:', calcularTotal(enero));
console.log('Conteo por estado:', contarPorEstado(validos));

console.log('\n===== PRUEBAS =====');

const casoNormal = calcularTotal([
    { id: 99, nombre: 'Prueba', fecha: '2026-01-15', estado: 'aprobado', area: 10 }
]);

const casoLimite = calcularTotal([]);

console.log('Caso normal:', casoNormal);
console.log('Caso limite:', casoLimite);
