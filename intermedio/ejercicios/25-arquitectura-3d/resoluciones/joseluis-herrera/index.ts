export {};

type Estado = 'borrador' | 'revision' | 'aprobado' | 'rechazado';
type Categoria = 'interior' | 'exterior' | 'plano';

interface Render {
    readonly id: number;
    nombre: string;
    estado: Estado;
    categoria: Categoria;
    valor: number;
}

const renders: Render[] = [
    { id: 1, nombre: 'Sala principal', estado: 'aprobado', categoria: 'interior', valor: 2560 },
    { id: 2, nombre: 'Fachada norte', estado: 'revision', categoria: 'exterior', valor: 1920 },
    { id: 3, nombre: 'Planta baja', estado: 'aprobado', categoria: 'plano', valor: 1280 },
    { id: 4, nombre: 'Cocina', estado: 'rechazado', categoria: 'interior', valor: 3840 },
];

function validarRender(registro: Render): boolean {
    return registro.nombre.trim() !== '' && registro.valor >= 0;
}

function contarPorEstado(lista: Render[]): Record<Estado, number> {
    return lista.reduce((conteo, registro) => {
        conteo[registro.estado] += 1;
        return conteo;
    }, { borrador: 0, revision: 0, aprobado: 0, rechazado: 0 });
}

function agruparPorCategoria(lista: Render[]): Map<Categoria, number> {
    const grupos = new Map<Categoria, number>();

    lista.forEach((registro) => {
        grupos.set(registro.categoria, (grupos.get(registro.categoria) ?? 0) + registro.valor);
    });

    return grupos;
}

function cumpleRegla(registro: Render): boolean {
    return registro.estado === 'aprobado' && registro.valor >= 1920;
}

const validos = renders.filter(validarRender);
const aprobados = validos.filter(cumpleRegla);
const conteo = contarPorEstado(validos);
const grupos = agruparPorCategoria(validos);
const categoriasUsadas = new Set(validos.map((registro) => registro.categoria));

console.log('===== Revision de renders arquitectura =====');

console.log('Renders validos:', validos.length);
console.log('Resolucion total:', validos.reduce((total, registro) => total + registro.valor, 0));
console.log('renders aprobados en alta resolucion:', aprobados.length);
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
    categoria: 'interior',
    valor: 2560
}));

console.log('Caso limite:', cumpleRegla({
    id: 100,
    nombre: 'Prueba',
    estado: 'aprobado',
    categoria: 'interior',
    valor: 0
}));
