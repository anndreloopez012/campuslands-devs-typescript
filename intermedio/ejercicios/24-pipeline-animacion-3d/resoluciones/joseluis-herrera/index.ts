export {};

type Estado = 'modelado' | 'animado' | 'renderizado' | 'revisado';
type Categoria = 'personaje' | 'vehiculo' | 'escenario';

interface Tarea {
    readonly id: number;
    nombre: string;
    estado: Estado;
    categoria: Categoria;
    valor: number;
}

const tareas: Tarea[] = [
    { id: 1, nombre: 'Caminata personaje', estado: 'revisado', categoria: 'personaje', valor: 48 },
    { id: 2, nombre: 'Auto deportivo', estado: 'animado', categoria: 'vehiculo', valor: 36 },
    { id: 3, nombre: 'Plaza central', estado: 'renderizado', categoria: 'escenario', valor: 24 },
    { id: 4, nombre: 'Carrera personaje', estado: 'revisado', categoria: 'personaje', valor: 30 },
];

function validarTarea(registro: Tarea): boolean {
    return registro.nombre.trim() !== '' && registro.valor >= 0;
}

function contarPorEstado(lista: Tarea[]): Record<Estado, number> {
    return lista.reduce((conteo, registro) => {
        conteo[registro.estado] += 1;
        return conteo;
    }, { modelado: 0, animado: 0, renderizado: 0, revisado: 0 });
}

function agruparPorCategoria(lista: Tarea[]): Map<Categoria, number> {
    const grupos = new Map<Categoria, number>();

    lista.forEach((registro) => {
        grupos.set(registro.categoria, (grupos.get(registro.categoria) ?? 0) + registro.valor);
    });

    return grupos;
}

function cumpleRegla(registro: Tarea): boolean {
    return registro.estado === 'revisado' && registro.valor >= 24;
}

const validos = tareas.filter(validarTarea);
const aprobados = validos.filter(cumpleRegla);
const conteo = contarPorEstado(validos);
const grupos = agruparPorCategoria(validos);
const categoriasUsadas = new Set(validos.map((registro) => registro.categoria));

console.log('===== Pipeline de animacion 3D =====');

console.log('Tareas validos:', validos.length);
console.log('Frames total:', validos.reduce((total, registro) => total + registro.valor, 0));
console.log('tareas revisadas de al menos 24 frames:', aprobados.length);
console.log('Conteo por estado:', conteo);
console.log('Categorias usadas:', [...categoriasUsadas]);

grupos.forEach((total, categoria) => {
    console.log(categoria + ':', total);
});

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', cumpleRegla({
    id: 99,
    nombre: 'Prueba',
    estado: 'revisado',
    categoria: 'personaje',
    valor: 48
}));

console.log('Caso limite:', cumpleRegla({
    id: 100,
    nombre: 'Prueba',
    estado: 'revisado',
    categoria: 'personaje',
    valor: 0
}));
