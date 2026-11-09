
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions y Literales)

export type GeneroLiterario =
    | 'Ficcion'
    | 'NoFiccion'
    | 'CienciaFiccion'
    | 'Fantasia'
    | 'Misterio'
    | 'Biografia'
    | 'Historia'
    | 'DesarrolloPersonal';

export type EstadoLectura =
    | 'Pendiente'
    | 'EnLectura'
    | 'Finalizado'
    | 'Abandonado';

export type RolMiembro = 'Lider' | 'Moderador' | 'Lector';

export interface LibroLectura {
    readonly id: string;
    readonly titulo: string;
    readonly autor: string;
    readonly genero: GeneroLiterario;
    readonly numeroPaginas: number;
    readonly anioPublicacion: number;
    readonly isbn: string;
}

export interface MiembroClub {
    readonly id: string;
    readonly nombre: string;
    readonly rol: RolMiembro;
    readonly fechaIngreso: string;
}

export interface LecturaSesion {
    readonly id: string;
    readonly libro: LibroLectura;
    readonly miembro: MiembroClub;
    readonly estado: EstadoLectura;
    readonly calificacion: number; // 1.0 a 5.0
    readonly paginasLeidas: number;
    readonly opinion: string;
}

export interface ClubDeLectura {
    readonly id: string;
    readonly nombreClub: string;
    readonly ciudad: string;
    readonly lecturas: readonly LecturaSesion[];
}

export interface MetricasClubLectura {
    readonly totalLecturas: number;
    readonly lecturasFinalizadas: number;
    readonly porcentajeFinalizacion: number;
    readonly promedioCalificacion: number;
    readonly totalPaginasLeidas: number;
    readonly libroMejorCalificado: LibroLectura | null;
    readonly desglosePorGenero: Readonly<Record<GeneroLiterario, number>>;
    readonly desglosePorEstado: Readonly<Record<EstadoLectura, number>>;
}

export interface ResumenClubLectura {
    readonly clubId: string;
    readonly nombreClub: string;
    readonly totalLecturasValidas: number;
    readonly metricas: MetricasClubLectura;
    readonly lecturasProcesadas: readonly LecturaSesion[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. TYPE GUARDS Y FUNCIONES DE VALIDACIÓN DE DOMINIO

export function esLecturaCompletada(lectura: LecturaSesion): boolean {
    return lectura.estado === 'Finalizado' && lectura.paginasLeidas >= lectura.libro.numeroPaginas;
}

export function validarLibro(libro: LibroLectura): ResultadoValidacion<LibroLectura> {
    const errores: string[] = [];

    if (libro.numeroPaginas <= 0) {
        errores.push(`El numero de paginas de "${libro.titulo}" debe ser mayor a 0 (${libro.numeroPaginas} pags).`);
    }

    if (libro.anioPublicacion < -3000 || libro.anioPublicacion > 2027) {
        errores.push(`Año de publicacion invalido (${libro.anioPublicacion}) para "${libro.titulo}".`);
    }

    if (libro.titulo.trim().length === 0) {
        errores.push('El libro debe registrar un titulo valido.');
    }

    return errores.length === 0
        ? { esValido: true, datos: libro }
        : { esValido: false, errores };
}

export function validarLecturaSesion(lectura: LecturaSesion): ResultadoValidacion<LecturaSesion> {
    const errores: string[] = [];

    if (lectura.calificacion < 1.0 || lectura.calificacion > 5.0) {
        errores.push(`Calificacion fuera de rango (${lectura.calificacion}) en la lectura del libro "${lectura.libro.titulo}".`);
    }

    if (lectura.paginasLeidas < 0 || lectura.paginasLeidas > lectura.libro.numeroPaginas) {
        errores.push(
            `Paginas leidas (${lectura.paginasLeidas}) fuera de rango para "${lectura.libro.titulo}" (max: ${lectura.libro.numeroPaginas}).`
        );
    }

    if (lectura.estado === 'Finalizado' && lectura.paginasLeidas < lectura.libro.numeroPaginas) {
        errores.push(
            `Inconsistencia en "${lectura.libro.titulo}": Marcado como Finalizado pero paginas leidas (${lectura.paginasLeidas}) es menor al total (${lectura.libro.numeroPaginas}).`
        );
    }

    return errores.length === 0
        ? { esValido: true, datos: lectura }
        : { esValido: false, errores };
}

export function validarClubRaw(club: ClubDeLectura): readonly string[] {
    const advertencias: string[] = [];
    const idsVistos = new Set<string>();

    if (club.lecturas.length === 0) {
        advertencias.push(`El club de lectura "${club.nombreClub}" no tiene registros de lectura.`);
    }

    for (const l of club.lecturas) {
        if (idsVistos.has(l.id)) {
            advertencias.push(`Registro de lectura duplicado detectado por ID: ${l.id}.`);
        }
        idsVistos.add(l.id);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS (Uso de reduce, Record y Math)

const GENEROS_LITERARIOS: readonly GeneroLiterario[] = [
    'Ficcion',
    'NoFiccion',
    'CienciaFiccion',
    'Fantasia',
    'Misterio',
    'Biografia',
    'Historia',
    'DesarrolloPersonal'
];

const ESTADOS_LECTURA: readonly EstadoLectura[] = [
    'Pendiente',
    'EnLectura',
    'Finalizado',
    'Abandonado'
];

export function calcularMetricasClub(lecturas: readonly LecturaSesion[]): MetricasClubLectura {
    if (lecturas.length === 0) {
        const desgloseGeneroVacio = GENEROS_LITERARIOS.reduce((acc, g) => {
            acc[g] = 0;
            return acc;
        }, {} as Record<GeneroLiterario, number>);

        const desgloseEstadoVacio = ESTADOS_LECTURA.reduce((acc, e) => {
            acc[e] = 0;
            return acc;
        }, {} as Record<EstadoLectura, number>);

        return {
            totalLecturas: 0,
            lecturasFinalizadas: 0,
            porcentajeFinalizacion: 0,
            promedioCalificacion: 0,
            totalPaginasLeidas: 0,
            libroMejorCalificado: null,
            desglosePorGenero: desgloseGeneroVacio,
            desglosePorEstado: desgloseEstadoVacio
        };
    }

    const lecturasFinalizadas = lecturas.filter((l) => l.estado === 'Finalizado').length;
    const porcentajeFinalizacion = Number(((lecturasFinalizadas / lecturas.length) * 100).toFixed(1));

    const sumaCalificaciones = lecturas.reduce((acc, l) => acc + l.calificacion, 0);
    const promedioCalificacion = Number((sumaCalificaciones / lecturas.length).toFixed(2));

    const totalPaginasLeidas = lecturas.reduce((acc, l) => acc + l.paginasLeidas, 0);

    const mejorLectura = [...lecturas].sort((a, b) => b.calificacion - a.calificacion)[0] ?? null;
    const libroMejorCalificado = mejorLectura ? mejorLectura.libro : null;

    // Agrupaciones mediante reduce y Record
    const desglosePorGenero = lecturas.reduce((acc, l) => {
        acc[l.libro.genero] = (acc[l.libro.genero] ?? 0) + 1;
        return acc;
    }, GENEROS_LITERARIOS.reduce((acc, g) => ({ ...acc, [g]: 0 }), {} as Record<GeneroLiterario, number>));

    const desglosePorEstado = lecturas.reduce((acc, l) => {
        acc[l.estado] = (acc[l.estado] ?? 0) + 1;
        return acc;
    }, ESTADOS_LECTURA.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EstadoLectura, number>));

    return {
        totalLecturas: lecturas.length,
        lecturasFinalizadas,
        porcentajeFinalizacion,
        promedioCalificacion,
        totalPaginasLeidas,
        libroMejorCalificado,
        desglosePorGenero,
        desglosePorEstado
    };
}

export function procesarClubLectura(clubRaw: ClubDeLectura): ResumenClubLectura {
    const advertencias: string[] = [...validarClubRaw(clubRaw)];
    const lecturasValidas: LecturaSesion[] = [];

    for (const rawLectura of clubRaw.lecturas) {
        const resLibro = validarLibro(rawLectura.libro);
        const resLectura = validarLecturaSesion(rawLectura);

        if (!resLibro.esValido) {
            advertencias.push(...resLibro.errores.map((err) => `Sesion ${rawLectura.id}: ${err}`));
        }
        if (!resLectura.esValido) {
            advertencias.push(...resLectura.errores);
        }

        if (resLibro.esValido && resLectura.esValido) {
            lecturasValidas.push(rawLectura);
        }
    }

    const metricas = calcularMetricasClub(lecturasValidas);

    return {
        clubId: clubRaw.id,
        nombreClub: clubRaw.nombreClub,
        totalLecturasValidas: lecturasValidas.length,
        metricas,
        lecturasProcesadas: lecturasValidas,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenClub(resumen: ResumenClubLectura, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` CLUB DE LECTURA - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Club de Lectura     : ${resumen.nombreClub}`);
    console.log(`Lecturas Validadas  : ${resumen.totalLecturasValidas}`);
    console.log(`Lecturas Completas  : ${resumen.metricas.lecturasFinalizadas} de ${resumen.metricas.totalLecturas} (${resumen.metricas.porcentajeFinalizacion}%)`);
    console.log(`Promedio Valoracion : ${resumen.metricas.promedioCalificacion} / 5.0`);
    console.log(`Total Paginas Leidas: ${resumen.metricas.totalPaginasLeidas.toLocaleString()} paginas`);
    console.log(`Libro Top Rating    : ${resumen.metricas.libroMejorCalificado ? `"${resumen.metricas.libroMejorCalificado.titulo}" por ${resumen.metricas.libroMejorCalificado.autor}` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE REGISTRO (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR GENERO LITERARIO:`);
    Object.entries(resumen.metricas.desglosePorGenero).forEach(([genero, cantidad]) => {
        console.log(`   - ${genero.padEnd(18)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.lecturasProcesadas.map((l) => ({
            ID: l.id,
            Libro: l.libro.titulo,
            Genero: l.libro.genero,
            Lector: l.miembro.nombre,
            Rol: l.miembro.rol,
            'Paginas': `${l.paginasLeidas}/${l.libro.numeroPaginas}`,
            Calificacion: `${l.calificacion}/5`,
            Estado: l.estado
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const libro1: LibroLectura = {
    id: 'b-01',
    titulo: 'Cien Años de Soledad',
    autor: 'Gabriel García Márquez',
    genero: 'Ficcion',
    numeroPaginas: 417,
    anioPublicacion: 1967,
    isbn: '978-0307474728'
};

const libro2: LibroLectura = {
    id: 'b-02',
    titulo: 'Dune',
    autor: 'Frank Herbert',
    genero: 'CienciaFiccion',
    numeroPaginas: 688,
    anioPublicacion: 1965,
    isbn: '978-0441172719'
};

const libro3: LibroLectura = {
    id: 'b-03',
    titulo: 'Sapiens: De animales a dioses',
    autor: 'Yuval Noah Harari',
    genero: 'Historia',
    numeroPaginas: 496,
    anioPublicacion: 2014,
    isbn: '978-8499926223'
};

const miembro1: MiembroClub = { id: 'm-01', nombre: 'Jose Rodriguez', rol: 'Lider', fechaIngreso: '2025-01-10' };
const miembro2: MiembroClub = { id: 'm-02', nombre: 'Ana Martinez', rol: 'Moderador', fechaIngreso: '2025-03-15' };

// --- CASO 1: Sesión de Lectura Mensual del Club (Caso Normal) ---
const clubNormal: ClubDeLectura = {
    id: 'CLUB-MACONDO-2026',
    nombreClub: 'Círculo de Lectores Macondo',
    ciudad: 'Ciudad de Guatemala',
    lecturas: [
        {
            id: 'lec-01',
            libro: libro1,
            miembro: miembro1,
            estado: 'Finalizado',
            calificacion: 5.0,
            paginasLeidas: 417,
            opinion: 'Una obra maestra indiscutible del realismo magico.'
        },
        {
            id: 'lec-02',
            libro: libro2,
            miembro: miembro2,
            estado: 'EnLectura',
            calificacion: 4.5,
            paginasLeidas: 350,
            opinion: 'Construccion de mundo fascinante y profunda.'
        },
        {
            id: 'lec-03',
            libro: libro3,
            miembro: miembro1,
            estado: 'Finalizado',
            calificacion: 4.8,
            paginasLeidas: 496,
            opinion: 'Gran perspectiva sobre la historia de la humanidad.'
        }
    ]
};

// --- CASO 2: Calificación Fuera de Rango, Páginas Incoherentes e ID Duplicado (Caso Límite) ---
const libroCorrupto: LibroLectura = {
    id: 'b-99',
    titulo: 'Libro Error Paginas',
    autor: 'Anonimo',
    genero: 'Ficcion',
    numeroPaginas: 0, // Paginas 0 -> Invalido
    anioPublicacion: -5000, // Año invalido (< -3000)
    isbn: '000'
};

const clubLimiteCorrupto: ClubDeLectura = {
    id: 'CLUB-FAIL-02',
    nombreClub: 'Club Con Inconsistencias',
    ciudad: 'Desconocida',
    lecturas: [
        {
            id: 'lec-04',
            libro: libroCorrupto,
            miembro: miembro1,
            estado: 'Finalizado',
            calificacion: 6.0, // Calificacion > 5 -> Invalida
            paginasLeidas: 100, // Finalizado con menos paginas de las leidas
            opinion: 'Error en registro'
        },
        {
            id: 'lec-01', // ID duplicado
            libro: libro1,
            miembro: miembro1,
            estado: 'Finalizado',
            calificacion: 5.0,
            paginasLeidas: 417,
            opinion: 'Copia duplicada'
        }
    ]
};

// Ejecución
const resumenNormal = procesarClubLectura(clubNormal);
mostrarResumenClub(resumenNormal, 'Caso Normal - Circulo de Lectores Macondo');

const resumenLimite = procesarClubLectura(clubLimiteCorrupto);
mostrarResumenClub(resumenLimite, 'Caso Limite - Calificacion Fuera de Rango y Paginas Incoherentes');