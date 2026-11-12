export {};

type Estado = 'solicitada' | 'aprobada' | 'entregada' | 'rechazada';
type Categoria = 'personaje' | 'escenario' | 'icono';

interface Comision {
    readonly id: number;
    nombre: string;
    estado: Estado;
    categoria: Categoria;
    valor: number;
}

const comisiones: Comision[] = [
    { id: 1, nombre: 'Retrato de personaje', estado: 'entregada', categoria: 'personaje', valor: 80 },
    { id: 2, nombre: 'Icono simple', estado: 'aprobada', categoria: 'icono', valor: 35 },
    { id: 3, nombre: 'Escenario detallado', estado: 'entregada', categoria: 'escenario', valor: 120 },
    { id: 4, nombre: 'Personaje extra', estado: 'rechazada', categoria: 'personaje', valor: 60 },
];

function validarComision(registro: Comision): boolean {
    return registro.nombre.trim() !== '' && registro.valor >= 0;
}

function contarPorEstado(lista: Comision[]): Record<Estado, number> {
    return lista.reduce((conteo, registro) => {
        conteo[registro.estado] += 1;
        return conteo;
    }, { solicitada: 0, aprobada: 0, entregada: 0, rechazada: 0 });
}

function agruparPorCategoria(lista: Comision[]): Map<Categoria, number> {
    const grupos = new Map<Categoria, number>();

    lista.forEach((registro) => {
        grupos.set(registro.categoria, (grupos.get(registro.categoria) ?? 0) + registro.valor);
    });

    return grupos;
}

function cumpleRegla(registro: Comision): boolean {
    return registro.estado === 'entregada' && registro.valor >= 50;
}

const validos = comisiones.filter(validarComision);
const aprobados = validos.filter(cumpleRegla);
const conteo = contarPorEstado(validos);
const grupos = agruparPorCategoria(validos);
const categoriasUsadas = new Set(validos.map((registro) => registro.categoria));

console.log('===== Comisiones de dibujo =====');

console.log('Comisiones validos:', validos.length);
console.log('Precio total:', validos.reduce((total, registro) => total + registro.valor, 0));
console.log('comisiones entregadas desde 50:', aprobados.length);
console.log('Conteo por estado:', conteo);
console.log('Categorias usadas:', [...categoriasUsadas]);

grupos.forEach((total, categoria) => {
    console.log(categoria + ':', total);
});

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', cumpleRegla({
    id: 99,
    nombre: 'Prueba',
    estado: 'entregada',
    categoria: 'personaje',
    valor: 100
}));

console.log('Caso limite:', cumpleRegla({
    id: 100,
    nombre: 'Prueba',
    estado: 'entregada',
    categoria: 'personaje',
    valor: 0
}));
