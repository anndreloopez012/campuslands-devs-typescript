
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)

export type CategoriaTech =
    | 'Programacion'
    | 'Arquitectura'
    | 'InteligenciaArtificial'
    | 'BasesDeDatos'
    | 'DevOps'
    | 'Ciberseguridad';

export type FormatoLibro = 'Fisico' | 'Digital' | 'AudioLibro';

export interface LibroTech {
    readonly id: string;
    readonly isbn: string;
    readonly titulo: string;
    readonly autor: string;
    readonly categoria: CategoriaTech;
    readonly formato: FormatoLibro;
    readonly paginas: number;
    readonly precioUSD: number;
    readonly ejemplaresDisponibles: number;
    readonly anioPublicacion: number;
    readonly calificacion: number; // Evaluacion de 1.0 a 5.0
}

export interface MetricasBiblioteca {
    readonly totalTitulos: number;
    readonly totalEjemplaresEnStock: number;
    readonly valorTotalInventarioUSD: number;
    readonly precioPromedioUSD: number;
    readonly calificacionPromedio: number;
    readonly libroMejorCalificado: LibroTech | null;
    readonly desglosePorCategoria: Readonly<Record<CategoriaTech, number>>;
}

export interface ResumenBibliotecaTech {
    readonly totalLibrosValidos: number;
    readonly metricas: MetricasBiblioteca;
    readonly librosProcesados: readonly LibroTech[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO

export function validarLibroTech(libro: LibroTech): ResultadoValidacion<LibroTech> {
    const errores: string[] = [];

    if (libro.isbn.trim().length === 0) {
        errores.push(`El libro "${libro.titulo}" debe incluir un ISBN valido.`);
    }

    if (libro.paginas <= 0 || libro.paginas > 5000) {
        errores.push(`La cantidad de paginas de "${libro.titulo}" esta fuera de rango (${libro.paginas} pag).`);
    }

    if (libro.precioUSD < 0) {
        errores.push(`El precio del libro "${libro.titulo}" no puede ser negativo.`);
    }

    if (libro.ejemplaresDisponibles < 0) {
        errores.push(`La cantidad de ejemplares en stock no puede ser negativa en "${libro.titulo}".`);
    }

    if (libro.calificacion < 1.0 || libro.calificacion > 5.0) {
        errores.push(`La calificacion de "${libro.titulo}" debe estar entre 1.0 y 5.0 (${libro.calificacion}).`);
    }

    if (libro.anioPublicacion < 1950 || libro.anioPublicacion > 2030) {
        errores.push(`El anio de publicacion (${libro.anioPublicacion}) de "${libro.titulo}" es invalido.`);
    }

    return errores.length === 0
        ? { esValido: true, datos: libro }
        : { esValido: false, errores };
}

export function validarBibliotecaRaw(libros: readonly LibroTech[]): readonly string[] {
    const advertencias: string[] = [];
    const isbnsVistos = new Set<string>();

    if (libros.length === 0) {
        advertencias.push('La biblioteca tech no contiene libros registrados en el inventario.');
    }

    for (const libro of libros) {
        if (isbnsVistos.has(libro.isbn)) {
            advertencias.push(`ISBN duplicado detectado: "${libro.titulo}" (ISBN: ${libro.isbn}).`);
        }
        isbnsVistos.add(libro.isbn);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS DE BIBLIOTECA

const CATEGORIAS_DISPONIBLES: readonly CategoriaTech[] = [
    'Programacion',
    'Arquitectura',
    'InteligenciaArtificial',
    'BasesDeDatos',
    'DevOps',
    'Ciberseguridad'
];

export function calcularMetricasBiblioteca(libros: readonly LibroTech[]): MetricasBiblioteca {
    if (libros.length === 0) {
        const desgloseVacio = CATEGORIAS_DISPONIBLES.reduce((acc, cat) => {
            acc[cat] = 0;
            return acc;
        }, {} as Record<CategoriaTech, number>);

        return {
            totalTitulos: 0,
            totalEjemplaresEnStock: 0,
            valorTotalInventarioUSD: 0,
            precioPromedioUSD: 0,
            calificacionPromedio: 0,
            libroMejorCalificado: null,
            desglosePorCategoria: desgloseVacio
        };
    }

    const totalEjemplaresEnStock = libros.reduce((acc, l) => acc + l.ejemplaresDisponibles, 0);

    const valorTotalInventarioUSD = Number(
        libros.reduce((acc, l) => acc + l.precioUSD * l.ejemplaresDisponibles, 0).toFixed(2)
    );

    const sumaPrecios = libros.reduce((acc, l) => acc + l.precioUSD, 0);
    const precioPromedioUSD = Number((sumaPrecios / libros.length).toFixed(2));

    const sumaCalificaciones = libros.reduce((acc, l) => acc + l.calificacion, 0);
    const calificacionPromedio = Number((sumaCalificaciones / libros.length).toFixed(2));

    const libroMejorCalificado = [...libros].sort(
        (a, b) => b.calificacion - a.calificacion
    )[0] ?? null;

    const desglosePorCategoria = libros.reduce((acc, l) => {
        acc[l.categoria] = (acc[l.categoria] ?? 0) + 1;
        return acc;
    }, CATEGORIAS_DISPONIBLES.reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {} as Record<CategoriaTech, number>));

    return {
        totalTitulos: libros.length,
        totalEjemplaresEnStock,
        valorTotalInventarioUSD,
        precioPromedioUSD,
        calificacionPromedio,
        libroMejorCalificado,
        desglosePorCategoria
    };
}

export function procesarBibliotecaTech(librosRaw: readonly LibroTech[]): ResumenBibliotecaTech {
    const advertencias: string[] = [...validarBibliotecaRaw(librosRaw)];
    const librosValidos: LibroTech[] = [];

    for (const raw of librosRaw) {
        const res = validarLibroTech(raw);
        if (res.esValido) {
            librosValidos.push(res.datos);
        } else {
            advertencias.push(...res.errores);
        }
    }

    const metricas = calcularMetricasBiblioteca(librosValidos);

    return {
        totalLibrosValidos: librosValidos.length,
        metricas,
        librosProcesados: librosValidos,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenBiblioteca(resumen: ResumenBibliotecaTech, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` BIBLIOTECA TECH - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Titulos Validados   : ${resumen.totalLibrosValidos}`);
    console.log(`Ejemplares en Stock : ${resumen.metricas.totalEjemplaresEnStock}`);
    console.log(`Valor del Inventario: $${resumen.metricas.valorTotalInventarioUSD.toLocaleString()} USD`);
    console.log(`Precio Promedio     : $${resumen.metricas.precioPromedioUSD} USD`);
    console.log(`Calificacion Prom   : ${resumen.metricas.calificacionPromedio} / 5.0`);
    console.log(`Mejor Calificado    : ${resumen.metricas.libroMejorCalificado ? `${resumen.metricas.libroMejorCalificado.titulo} (${resumen.metricas.libroMejorCalificado.calificacion} estrellas)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE INVENTARIO (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR CATEGORIA TECH:`);
    Object.entries(resumen.metricas.desglosePorCategoria).forEach(([categoria, cantidad]) => {
        console.log(`   - ${categoria.padEnd(22)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.librosProcesados.map((l) => ({
            ID: l.id,
            ISBN: l.isbn,
            Titulo: l.titulo,
            Autor: l.autor,
            Categoria: l.categoria,
            Formato: l.formato,
            Precio: `$${l.precioUSD}`,
            Stock: l.ejemplaresDisponibles,
            Calificacion: `${l.calificacion} / 5.0`
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

// --- CASO 1: Catálogo Regular de Libros de Tecnología (Caso Normal) ---
const bibliotecaNormal: readonly LibroTech[] = [
    {
        id: 'LIB-001',
        isbn: '978-0132350884',
        titulo: 'Clean Code',
        autor: 'Robert C. Martin',
        categoria: 'Programacion',
        formato: 'Fisico',
        paginas: 464,
        precioUSD: 42.5,
        ejemplaresDisponibles: 12,
        anioPublicacion: 2008,
        calificacion: 4.7
    },
    {
        id: 'LIB-002',
        isbn: '978-0134494166',
        titulo: 'Clean Architecture',
        autor: 'Robert C. Martin',
        categoria: 'Arquitectura',
        formato: 'Digital',
        paginas: 432,
        precioUSD: 38.0,
        ejemplaresDisponibles: 25,
        anioPublicacion: 2017,
        calificacion: 4.8
    },
    {
        id: 'LIB-003',
        isbn: '978-1491957660',
        titulo: 'Designing Data-Intensive Applications',
        autor: 'Martin Kleppmann',
        categoria: 'BasesDeDatos',
        formato: 'Fisico',
        paginas: 616,
        precioUSD: 54.99,
        ejemplaresDisponibles: 8,
        anioPublicacion: 2017,
        calificacion: 4.9
    },
    {
        id: 'LIB-004',
        isbn: '978-0262035613',
        titulo: 'Deep Learning',
        autor: 'Ian Goodfellow',
        categoria: 'InteligenciaArtificial',
        formato: 'AudioLibro',
        paginas: 800,
        precioUSD: 65.0,
        ejemplaresDisponibles: 15,
        anioPublicacion: 2016,
        calificacion: 4.6
    }
];

// --- CASO 2: ISBN Duplicado, Páginas Negativas y Calificación Inválida (Caso Límite) ---
const bibliotecaLimiteCorrupta: readonly LibroTech[] = [
    {
        id: 'LIB-005',
        isbn: '', // ISBN Vacio -> Invalido
        titulo: 'Libro Sin ISBN',
        autor: 'Anonimo',
        categoria: 'DevOps',
        formato: 'Digital',
        paginas: 200,
        precioUSD: 20.0,
        ejemplaresDisponibles: 5,
        anioPublicacion: 2024,
        calificacion: 4.0
    },
    {
        id: 'LIB-006',
        isbn: '978-9999999999',
        titulo: 'Libro Con Paginas Negativas',
        autor: 'Error Author',
        categoria: 'Ciberseguridad',
        formato: 'Fisico',
        paginas: -50, // Paginas negativas -> Invalido
        precioUSD: 30.0,
        ejemplaresDisponibles: 3,
        anioPublicacion: 2023,
        calificacion: 6.5 // Calificacion > 5.0 -> Invalido
    },
    {
        id: 'LIB-007',
        isbn: '978-0132350884', // ISBN Duplicado con Clean Code
        titulo: 'Clean Code Duplicado',
        autor: 'Robert C. Martin',
        categoria: 'Programacion',
        formato: 'Fisico',
        paginas: 464,
        precioUSD: 42.5,
        ejemplaresDisponibles: 2,
        anioPublicacion: 2008,
        calificacion: 4.7
    }
];

// Ejecución
const resumenNormal = procesarBibliotecaTech(bibliotecaNormal);
mostrarResumenBiblioteca(resumenNormal, 'Caso Normal - Inventario Principal Tech');

const resumenLimite = procesarBibliotecaTech(bibliotecaLimiteCorrupta);
mostrarResumenBiblioteca(resumenLimite, 'Caso Limite - Registros Corruptos e ISBN Duplicado');