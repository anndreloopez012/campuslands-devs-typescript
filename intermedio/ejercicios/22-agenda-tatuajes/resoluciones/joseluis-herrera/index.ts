export {};

type Estado = 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
type Categoria = 'realismo' | 'lineal' | 'tradicional';

interface Cita {
    readonly id: number;
    nombre: string;
    estado: Estado;
    categoria: Categoria;
    valor: number;
}

const citas: Cita[] = [
    { id: 1, nombre: 'Cita realismo', estado: 'confirmada', categoria: 'realismo', valor: 4 },
    { id: 2, nombre: 'Cita lineal', estado: 'pendiente', categoria: 'lineal', valor: 1.5 },
    { id: 3, nombre: 'Cita tradicional', estado: 'confirmada', categoria: 'tradicional', valor: 2 },
    { id: 4, nombre: 'Cita realismo dos', estado: 'cancelada', categoria: 'realismo', valor: 5 },
];

function validarCita(registro: Cita): boolean {
    return registro.nombre.trim() !== '' && registro.valor >= 0;
}

function contarPorEstado(lista: Cita[]): Record<Estado, number> {
    return lista.reduce((conteo, registro) => {
        conteo[registro.estado] += 1;
        return conteo;
    }, { pendiente: 0, confirmada: 0, completada: 0, cancelada: 0 });
}

function agruparPorCategoria(lista: Cita[]): Map<Categoria, number> {
    const grupos = new Map<Categoria, number>();

    lista.forEach((registro) => {
        grupos.set(registro.categoria, (grupos.get(registro.categoria) ?? 0) + registro.valor);
    });

    return grupos;
}

function cumpleRegla(registro: Cita): boolean {
    return registro.estado === 'confirmada' && registro.valor >= 2;
}

const validos = citas.filter(validarCita);
const aprobados = validos.filter(cumpleRegla);
const conteo = contarPorEstado(validos);
const grupos = agruparPorCategoria(validos);
const categoriasUsadas = new Set(validos.map((registro) => registro.categoria));

console.log('===== Agenda de tatuajes =====');

console.log('Citas validos:', validos.length);
console.log('Horas total:', validos.reduce((total, registro) => total + registro.valor, 0));
console.log('citas confirmadas de al menos 2 horas:', aprobados.length);
console.log('Conteo por estado:', conteo);
console.log('Categorias usadas:', [...categoriasUsadas]);

grupos.forEach((total, categoria) => {
    console.log(categoria + ':', total);
});

console.log('\n===== PRUEBAS =====');

console.log('Caso normal:', cumpleRegla({
    id: 99,
    nombre: 'Prueba',
    estado: 'confirmada',
    categoria: 'realismo',
    valor: 4
}));

console.log('Caso limite:', cumpleRegla({
    id: 100,
    nombre: 'Prueba',
    estado: 'confirmada',
    categoria: 'realismo',
    valor: 0
}));
