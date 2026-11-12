export {};

type Estado = 'pendiente' | 'aprobado' | 'rechazado';
type Categoria = 'mig' | 'tig' | 'electrodo';

interface Inspeccion {
    readonly id: number;
    nombre: string;
    estado: Estado;
    categoria: Categoria;
    valor: number;
}

const inspecciones: Inspeccion[] = [
    { id: 1, nombre: 'Union MIG uno', estado: 'aprobado', categoria: 'mig', valor: 90 },
    { id: 2, nombre: 'Union TIG uno', estado: 'pendiente', categoria: 'tig', valor: 85 },
    { id: 3, nombre: 'Union electrodo uno', estado: 'aprobado', categoria: 'electrodo', valor: 70 },
    { id: 4, nombre: 'Union MIG dos', estado: 'rechazado', categoria: 'mig', valor: 60 },
];

function validarInspeccion(registro: Inspeccion): boolean {
    return registro.nombre.trim() !== '' && registro.valor >= 0;
}

function contarPorEstado(lista: Inspeccion[]): Record<Estado, number> {
    return lista.reduce((conteo, registro) => {
        conteo[registro.estado] += 1;
        return conteo;
    }, { pendiente: 0, aprobado: 0, rechazado: 0 });
}

function agruparPorCategoria(lista: Inspeccion[]): Map<Categoria, number> {
    const grupos = new Map<Categoria, number>();

    lista.forEach((registro) => {
        grupos.set(registro.categoria, (grupos.get(registro.categoria) ?? 0) + registro.valor);
    });

    return grupos;
}

function cumpleRegla(registro: Inspeccion): boolean {
    return registro.estado === 'aprobado' && registro.valor >= 80;
}

const validos = inspecciones.filter(validarInspeccion);
const aprobados = validos.filter(cumpleRegla);
const conteo = contarPorEstado(validos);
const grupos = agruparPorCategoria(validos);
const categoriasUsadas = new Set(validos.map((registro) => registro.categoria));

console.log('===== Control de soldadura =====');

console.log('Inspecciones validos:', validos.length);
console.log('Resistencia total:', validos.reduce((total, registro) => total + registro.valor, 0));
console.log('soldaduras aprobadas con resistencia alta:', aprobados.length);
console.log('Conteo por estado:', conteo);
console.log('Categorias usadas:', [...categoriasUsadas]);

grupos.forEach((total, categoria) => {
    console.log(categoria + ':', total);
});

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', cumpleRegla({
    id: 99,
    nombre: 'Prueba',
    estado: 'aprobado',
    categoria: 'mig',
    valor: 90
}));

console.log('Caso limite:', cumpleRegla({
    id: 100,
    nombre: 'Prueba',
    estado: 'aprobado',
    categoria: 'mig',
    valor: 0
}));
