
// 1. CAPA DE DOMINIO Y DTOs (Data Transfer Objects)

export type GeneroLiterario =
    | 'CienciaFiccion'
    | 'IngenieriaSoftware'
    | 'Fantasia'
    | 'Historia'
    | 'Filosofia'
    | 'Thriller';

export type EstadoLectura =
    | 'Pendiente'
    | 'EnProgreso'
    | 'Completado'
    | 'Abandonado';

export interface LibroDominio {
    readonly id: string;
    readonly isbn: string;
    readonly titulo: string;
    readonly autor: string;
    readonly genero: GeneroLiterario;
    readonly anioPublicacion: number;
    readonly paginasTotales: number;
    readonly paginasLeidas: number;
    readonly estadoLectura: EstadoLectura;
    readonly calificacion: number | null;
    readonly actualizadoEnISO: string;
}

// DTO de entrada para registrar nuevos libros
export interface CrearLibroDTO {
    readonly isbn: string;
    readonly titulo: string;
    readonly autor: string;
    readonly genero: GeneroLiterario;
    readonly anioPublicacion: number;
    readonly paginasTotales: number;
    readonly paginasLeidasIniciales?: number;
    readonly calificacionInicial?: number | null;
}

// DTO de actualización de progreso de lectura
export interface ActualizarProgresoLecturaDTO {
    readonly libroId: string;
    readonly nuevasPaginasLeidas: number;
    readonly nuevaCalificacion?: number | null;
    readonly marcarAbandonado?: boolean;
}

// DTO serializable para persistencia en localStorage
export interface LibroPersistenciaDTO {
    readonly v: 1;
    readonly id: string;
    readonly isbn: string;
    readonly titulo: string;
    readonly autor: string;
    readonly genero: GeneroLiterario;
    readonly anioPublicacion: number;
    readonly paginasTotales: number;
    readonly paginasLeidas: number;
    readonly estadoLectura: EstadoLectura;
    readonly calificacion: number | null;
    readonly actualizadoEnISO: string;
}

export type ResultadoOperacion<T> =
    | { readonly ok: true; readonly valor: T }
    | { readonly ok: false; readonly errores: readonly string[] };

export interface EstadisticasGenero {
    readonly cantidadLibros: number;
    readonly paginasLeidas: number;
    readonly porcentajeCompletado: number;
}

export interface ReporteBiblioteca {
    readonly reporteId: string;
    readonly claveStorage: string;
    readonly totalLibrosCatalogo: number;
    readonly totalPaginasCatalogo: number;
    readonly totalPaginasLeidas: number;
    readonly porcentajeProgresoGlobal: number;
    readonly promedioCalificacion: number;
    readonly libroMasExtenso: LibroDominio | null;
    readonly libroMejorCalificado: LibroDominio | null;
    readonly desglosePorEstado: Readonly<Record<EstadoLectura, number>>;
    readonly desglosePorGenero: Readonly<Record<GeneroLiterario, EstadisticasGenero>>;
    readonly libros: readonly LibroDominio[];
    readonly advertencias: readonly string[];
}

// 2. ADAPTADOR DE LOCALSTORAGE Y REPOSITORIO GENÉRICO EN MEMORIA

// Contrato compatible con Web Storage API (window.localStorage) y entorno Node.js
export interface ProveedorStorage {
    getItem(clave: string): string | null;
    setItem(clave: string, valor: string): void;
    removeItem(clave: string): void;
    clear(): void;
}

export class AdaptadorLocalStorageMemoria implements ProveedorStorage {
    private readonly almacenamiento: Map<string, string> = new Map();

    public getItem(clave: string): string | null {
        return this.almacenamiento.get(clave) ?? null;
    }

    public setItem(clave: string, valor: string): void {
        this.almacenamiento.set(clave, valor);
    }

    public removeItem(clave: string): void {
        this.almacenamiento.delete(clave);
    }

    public clear(): void {
        this.almacenamiento.clear();
    }

    public obtenerBytesAlmacenados(clave: string): number {
        const raw = this.getItem(clave);
        return raw ? Buffer.byteLength(raw, 'utf8') : 0;
    }
}

export class RepositorioBibliotecaLocalStorage<
    TDominio extends { readonly id: string },
    TDto
> {
    private readonly cacheMemoria: Map<string, TDominio> = new Map();

    constructor(
        private readonly storage: ProveedorStorage,
        private readonly claveStorage: string,
        private readonly aPersistenciaDTO: (entidad: TDominio) => TDto,
        private readonly desdePersistenciaDTO: (raw: unknown) => ResultadoOperacion<TDominio>
    ) { }

    public hidratarDesdeStorage(): readonly string[] {
        const advertencias: string[] = [];
        this.cacheMemoria.clear();

        const contenidoCrudo = this.storage.getItem(this.claveStorage);
        if (!contenidoCrudo) {
            return advertencias;
        }

        try {
            const parsed: unknown = JSON.parse(contenidoCrudo);
            if (!Array.isArray(parsed)) {
                advertencias.push(
                    `Formato corrupto en localStorage bajo la clave "${this.claveStorage}": se esperaba un arreglo JSON.`
                );
                return advertencias;
            }

            parsed.forEach((registroCrudo, idx) => {
                const res = this.desdePersistenciaDTO(registroCrudo);
                if (res.ok) {
                    this.cacheMemoria.set(res.valor.id, res.valor);
                } else {
                    advertencias.push(
                        `Registro #${idx + 1} ignorado en localStorage: ${res.errores.join(' | ')}`
                    );
                }
            });
        } catch {
            advertencias.push(
                `Error de sintaxis JSON al leer "${this.claveStorage}" desde localStorage.`
            );
        }

        return advertencias;
    }

    private sincronizarConStorage(): void {
        const listaDTOs = Array.from(this.cacheMemoria.values()).map((entidad) =>
            this.aPersistenciaDTO(entidad)
        );
        this.storage.setItem(this.claveStorage, JSON.stringify(listaDTOs));
    }

    public guardar(entidad: TDominio): void {
        this.cacheMemoria.set(entidad.id, entidad);
        this.sincronizarConStorage();
    }

    public obtenerPorId(id: string): TDominio | undefined {
        return this.cacheMemoria.get(id);
    }

    public obtenerTodos(): readonly TDominio[] {
        return Array.from(this.cacheMemoria.values());
    }

    public eliminarPorId(id: string): boolean {
        const eliminado = this.cacheMemoria.delete(id);
        if (eliminado) {
            this.sincronizarConStorage();
        }
        return eliminado;
    }
}

// 3. VALIDACIONES Y TRANSFORMADORES DE DTO <-> DOMINIO

const GENEROS_VALIDOS: readonly GeneroLiterario[] = [
    'CienciaFiccion',
    'IngenieriaSoftware',
    'Fantasia',
    'Historia',
    'Filosofia',
    'Thriller'
];

const ESTADOS_VALIDOS: readonly EstadoLectura[] = [
    'Pendiente',
    'EnProgreso',
    'Completado',
    'Abandonado'
];

function esObjetoRegistro(valor: unknown): valor is Record<string, unknown> {
    return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function esGeneroValido(valor: unknown): valor is GeneroLiterario {
    return typeof valor === 'string' && GENEROS_VALIDOS.some((g) => g === valor);
}

function esEstadoValido(valor: unknown): valor is EstadoLectura {
    return typeof valor === 'string' && ESTADOS_VALIDOS.some((e) => e === valor);
}

export function determinarEstadoLectura(
    paginasLeidas: number,
    paginasTotales: number,
    abandonado: boolean = false
): EstadoLectura {
    if (abandonado) return 'Abandonado';
    if (paginasLeidas <= 0) return 'Pendiente';
    if (paginasLeidas >= paginasTotales) return 'Completado';
    return 'EnProgreso';
}

export function validarCrearLibroDTO(dto: CrearLibroDTO): ResultadoOperacion<CrearLibroDTO> {
    const errores: string[] = [];
    const isbnLimpio = dto.isbn.replace(/[-\s]/g, '');

    if (isbnLimpio.length !== 10 && isbnLimpio.length !== 13) {
        errores.push(`ISBN inválido ("${dto.isbn}") para "${dto.titulo}": debe tener 10 o 13 dígitos.`);
    }

    if (dto.titulo.trim().length < 2) {
        errores.push(`El título del libro ("${dto.titulo}") debe tener al menos 2 caracteres.`);
    }

    if (dto.autor.trim().length < 2) {
        errores.push(`El autor de "${dto.titulo}" es obligatorio.`);
    }

    const anioActual = new Date().getFullYear();
    if (dto.anioPublicacion < 1450 || dto.anioPublicacion > anioActual + 1) {
        errores.push(
            `Año de publicación fuera de rango (${dto.anioPublicacion}) en "${dto.titulo}".`
        );
    }

    if (dto.paginasTotales <= 0 || dto.paginasTotales > 10000) {
        errores.push(
            `Cantidad de páginas totales inválida (${dto.paginasTotales}) en "${dto.titulo}".`
        );
    }

    const leidas = dto.paginasLeidasIniciales ?? 0;
    if (leidas < 0 || leidas > dto.paginasTotales) {
        errores.push(
            `Páginas leídas (${leidas}) inconsistentes con el total (${dto.paginasTotales}) en "${dto.titulo}".`
        );
    }

    if (
        dto.calificacionInicial !== undefined &&
        dto.calificacionInicial !== null &&
        (dto.calificacionInicial < 1 || dto.calificacionInicial > 5)
    ) {
        errores.push(
            `Calificación fuera de escala 1-5 (${dto.calificacionInicial}) en "${dto.titulo}".`
        );
    }

    return errores.length === 0
        ? { ok: true, valor: dto }
        : { ok: false, errores };
}

export function mapearCrearDTOADominio(
    dto: CrearLibroDTO,
    secuencia: number
): LibroDominio {
    const paginasLeidas = dto.paginasLeidasIniciales ?? 0;
    const estadoLectura = determinarEstadoLectura(paginasLeidas, dto.paginasTotales);
    const isbnNormalizado = dto.isbn.trim();

    return {
        id: `lib-${isbnNormalizado.replace(/[-\s]/g, '')}-${secuencia}`,
        isbn: isbnNormalizado,
        titulo: dto.titulo.trim(),
        autor: dto.autor.trim(),
        genero: dto.genero,
        anioPublicacion: dto.anioPublicacion,
        paginasTotales: dto.paginasTotales,
        paginasLeidas,
        estadoLectura,
        calificacion: dto.calificacionInicial ?? null,
        actualizadoEnISO: new Date().toISOString()
    };
}

export function mapearDominioAPersistenciaDTO(libro: LibroDominio): LibroPersistenciaDTO {
    return {
        v: 1,
        id: libro.id,
        isbn: libro.isbn,
        titulo: libro.titulo,
        autor: libro.autor,
        genero: libro.genero,
        anioPublicacion: libro.anioPublicacion,
        paginasTotales: libro.paginasTotales,
        paginasLeidas: libro.paginasLeidas,
        estadoLectura: libro.estadoLectura,
        calificacion: libro.calificacion,
        actualizadoEnISO: libro.actualizadoEnISO
    };
}

export function deserializarLibroDesdeStorage(
    raw: unknown
): ResultadoOperacion<LibroDominio> {
    if (!esObjetoRegistro(raw)) {
        return { ok: false, errores: ['El elemento almacenado no es un objeto válido.'] };
    }

    const {
        id,
        isbn,
        titulo,
        autor,
        genero,
        anioPublicacion,
        paginasTotales,
        paginasLeidas,
        estadoLectura,
        calificacion,
        actualizadoEnISO
    } = raw;

    if (
        typeof id !== 'string' ||
        typeof isbn !== 'string' ||
        typeof titulo !== 'string' ||
        typeof autor !== 'string' ||
        !esGeneroValido(genero) ||
        typeof anioPublicacion !== 'number' ||
        typeof paginasTotales !== 'number' ||
        paginasTotales <= 0 ||
        typeof paginasLeidas !== 'number' ||
        paginasLeidas < 0 ||
        paginasLeidas > paginasTotales ||
        !esEstadoValido(estadoLectura) ||
        (calificacion !== null && typeof calificacion !== 'number') ||
        typeof actualizadoEnISO !== 'string'
    ) {
        return {
            ok: false,
            errores: ['Esquema de DTO persistido inválido o corrupto en localStorage.']
        };
    }

    return {
        ok: true,
        valor: {
            id,
            isbn,
            titulo,
            autor,
            genero,
            anioPublicacion,
            paginasTotales,
            paginasLeidas,
            estadoLectura,
            calificacion,
            actualizadoEnISO
        }
    };
}

// 4. SERVICIO DE APLICACIÓN Y GENERACIÓN DE REPORTES

export function generarReporteBiblioteca(
    libros: readonly LibroDominio[],
    claveStorage: string,
    advertencias: readonly string[]
): ReporteBiblioteca {
    const desglosePorEstado = libros.reduce(
        (acc, lib) => {
            acc[lib.estadoLectura] = (acc[lib.estadoLectura] ?? 0) + 1;
            return acc;
        },
        ESTADOS_VALIDOS.reduce(
            (acc, est) => ({ ...acc, [est]: 0 }),
            {} as Record<EstadoLectura, number>
        )
    );

    const desglosePorGenero = GENEROS_VALIDOS.reduce((acc, gen) => {
        const delGenero = libros.filter((l) => l.genero === gen);
        const totalPag = delGenero.reduce((s, l) => s + l.paginasTotales, 0);
        const leidasPag = delGenero.reduce((s, l) => s + l.paginasLeidas, 0);
        const porcentajeCompletado =
            totalPag > 0 ? Number(((leidasPag / totalPag) * 100).toFixed(1)) : 0;

        acc[gen] = {
            cantidadLibros: delGenero.length,
            paginasLeidas: leidasPag,
            porcentajeCompletado
        };
        return acc;
    }, {} as Record<GeneroLiterario, EstadisticasGenero>);

    const totalPaginasCatalogo = libros.reduce((acc, l) => acc + l.paginasTotales, 0);
    const totalPaginasLeidas = libros.reduce((acc, l) => acc + l.paginasLeidas, 0);
    const porcentajeProgresoGlobal =
        totalPaginasCatalogo > 0
            ? Number(((totalPaginasLeidas / totalPaginasCatalogo) * 100).toFixed(1))
            : 0;

    const calificados = libros.filter(
        (l): l is LibroDominio & { readonly calificacion: number } => l.calificacion !== null
    );
    const promedioCalificacion =
        calificados.length > 0
            ? Number(
                (
                    calificados.reduce((acc, l) => acc + l.calificacion, 0) / calificados.length
                ).toFixed(2)
            )
            : 0;

    const libroMasExtenso =
        [...libros].sort((a, b) => b.paginasTotales - a.paginasTotales)[0] ?? null;

    const libroMejorCalificado =
        [...calificados].sort((a, b) => b.calificacion - a.calificacion)[0] ?? null;

    return {
        reporteId: `REP-BIBLIO-${Date.now()}`,
        claveStorage,
        totalLibrosCatalogo: libros.length,
        totalPaginasCatalogo,
        totalPaginasLeidas,
        porcentajeProgresoGlobal,
        promedioCalificacion,
        libroMasExtenso,
        libroMejorCalificado,
        desglosePorEstado,
        desglosePorGenero,
        libros,
        advertencias
    };
}

export class ServicioBibliotecaLocalStorage {
    private readonly repositorio: RepositorioBibliotecaLocalStorage<
        LibroDominio,
        LibroPersistenciaDTO
    >;
    private readonly advertencias: string[] = [];
    private secuenciaId = 1;

    constructor(
        storage: ProveedorStorage,
        private readonly claveStorage: string
    ) {
        this.repositorio = new RepositorioBibliotecaLocalStorage(
            storage,
            claveStorage,
            mapearDominioAPersistenciaDTO,
            deserializarLibroDesdeStorage
        );
        const advertenciasHidratacion = this.repositorio.hidratarDesdeStorage();
        this.advertencias.push(...advertenciasHidratacion);
    }

    public registrarLibro(dto: CrearLibroDTO): ResultadoOperacion<LibroDominio> {
        const validacion = validarCrearLibroDTO(dto);
        if (!validacion.ok) {
            this.advertencias.push(...validacion.errores);
            return validacion;
        }

        const isbnNormalizado = dto.isbn.replace(/[-\s]/g, '');
        const duplicado = this.repositorio
            .obtenerTodos()
            .some((l) => l.isbn.replace(/[-\s]/g, '') === isbnNormalizado);

        if (duplicado) {
            const msg = `ISBN duplicado en biblioteca: "${dto.isbn}" ("${dto.titulo}") ya existe en localStorage.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const nuevoLibro = mapearCrearDTOADominio(dto, this.secuenciaId++);
        this.repositorio.guardar(nuevoLibro);
        return { ok: true, valor: nuevoLibro };
    }

    public actualizarProgresoLectura(
        dto: ActualizarProgresoLecturaDTO
    ): ResultadoOperacion<LibroDominio> {
        const existente = this.repositorio.obtenerPorId(dto.libroId);
        if (!existente) {
            const msg = `No se encontró el libro con ID "${dto.libroId}" para actualizar progreso.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        if (dto.nuevasPaginasLeidas < 0 || dto.nuevasPaginasLeidas > existente.paginasTotales) {
            const msg = `Progreso inválido (${dto.nuevasPaginasLeidas}/${existente.paginasTotales} págs) en "${existente.titulo}".`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        if (
            dto.nuevaCalificacion !== undefined &&
            dto.nuevaCalificacion !== null &&
            (dto.nuevaCalificacion < 1 || dto.nuevaCalificacion > 5)
        ) {
            const msg = `Calificación inválida (${dto.nuevaCalificacion}) al actualizar "${existente.titulo}".`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const nuevoEstado = determinarEstadoLectura(
            dto.nuevasPaginasLeidas,
            existente.paginasTotales,
            dto.marcarAbandonado ?? false
        );

        const libroActualizado: LibroDominio = {
            ...existente,
            paginasLeidas: dto.nuevasPaginasLeidas,
            estadoLectura: nuevoEstado,
            calificacion:
                dto.nuevaCalificacion !== undefined ? dto.nuevaCalificacion : existente.calificacion,
            actualizadoEnISO: new Date().toISOString()
        };

        this.repositorio.guardar(libroActualizado);
        return { ok: true, valor: libroActualizado };
    }

    public obtenerReporteFinal(): ReporteBiblioteca {
        return generarReporteBiblioteca(
            this.repositorio.obtenerTodos(),
            this.claveStorage,
            this.advertencias
        );
    }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarReporteBiblioteca(reporte: ReporteBiblioteca, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` BIBLIOTECA CON LOCALSTORAGE - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Reporte ID          : ${reporte.reporteId}`);
    console.log(`Clave localStorage  : ${reporte.claveStorage}`);
    console.log(`Total de Libros     : ${reporte.totalLibrosCatalogo}`);
    console.log(`Progreso Global     : ${reporte.totalPaginasLeidas} / ${reporte.totalPaginasCatalogo} págs (${reporte.porcentajeProgresoGlobal}%)`);
    console.log(`Calificación Media  : ${reporte.promedioCalificacion > 0 ? `${reporte.promedioCalificacion} / 5.00` : 'Sin calificar'}`);
    console.log(`Libro Más Extenso   : ${reporte.libroMasExtenso ? `"${reporte.libroMasExtenso.titulo}" (${reporte.libroMasExtenso.paginasTotales} págs)` : 'N/A'}`);
    console.log(`Mejor Calificado    : ${reporte.libroMejorCalificado ? `"${reporte.libroMejorCalificado.titulo}" (${reporte.libroMejorCalificado.calificacion}/5)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (reporte.advertencias.length > 0) {
        console.log(`ADVERTENCIAS Y VALIDACIONES DE PERSISTENCIA (${reporte.advertencias.length}):`);
        reporte.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`ESTADO DE LECTURA:`);
    Object.entries(reporte.desglosePorEstado).forEach(([estado, cantidad]) => {
        console.log(`   - ${estado.padEnd(16)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        reporte.libros.map((l) => ({
            ID: l.id,
            ISBN: l.isbn,
            Título: l.titulo,
            Autor: l.autor,
            Género: l.genero,
            Progreso: `${l.paginasLeidas}/${l.paginasTotales} (${Math.round((l.paginasLeidas / l.paginasTotales) * 100)}%)`,
            Estado: l.estadoLectura,
            Rating: l.calificacion !== null ? `${l.calificacion}/5` : 'N/A'
        }))
    );
}

// 6. CASOS DE PRUEBA (Caso Normal con Rehidratación y Caso Límite)

async function ejecutarPruebas(): Promise<void> {
    // Simulación de latencia I/O inicial
    await new Promise((resolve) => setTimeout(resolve, 10));

    // --- CASO 1: Flujo Normal + Persistencia y Rehidratación desde localStorage ---
    const storageNormal = new AdaptadorLocalStorageMemoria();
    const claveNormal = 'campuslands.biblioteca.v1';

    const servicio1 = new ServicioBibliotecaLocalStorage(storageNormal, claveNormal);

    const l1 = servicio1.registrarLibro({
        isbn: '978-0132350884',
        titulo: 'Clean Code',
        autor: 'Robert C. Martin',
        genero: 'IngenieriaSoftware',
        anioPublicacion: 2008,
        paginasTotales: 464,
        paginasLeidasIniciales: 464,
        calificacionInicial: 5
    });

    servicio1.registrarLibro({
        isbn: '978-0441172719',
        titulo: 'Dune',
        autor: 'Frank Herbert',
        genero: 'CienciaFiccion',
        anioPublicacion: 1965,
        paginasTotales: 688,
        paginasLeidasIniciales: 310,
        calificacionInicial: 4.8
    });

    const l3 = servicio1.registrarLibro({
        isbn: '978-0135957059',
        titulo: 'The Pragmatic Programmer',
        autor: 'Andrew Hunt & David Thomas',
        genero: 'IngenieriaSoftware',
        anioPublicacion: 2019,
        paginasTotales: 352,
        paginasLeidasIniciales: 0
    });

    if (l3.ok) {
        servicio1.actualizarProgresoLectura({
            libroId: l3.valor.id,
            nuevasPaginasLeidas: 180,
            nuevaCalificacion: 4.9
        });
    }

    // Rehidratamos una nueva instancia del servicio leyendo directamente del mismo localStorage
    const servicioRehidratado = new ServicioBibliotecaLocalStorage(storageNormal, claveNormal);
    if (l1.ok) {
        // Confirmamos que la clave persiste intacta en localStorage
        const bytes = storageNormal.obtenerBytesAlmacenados(claveNormal);
        console.log(`[STORAGE INFO] Payload persistido en "${claveNormal}": ${bytes} bytes.`);
    }

    const reporteNormal = servicioRehidratado.obtenerReporteFinal();
    mostrarReporteBiblioteca(reporteNormal, 'Caso Normal - Registro, Actualización y Rehidratación');

    // --- CASO 2: Storage Corrupto Preexistente, ISBN Duplicado y Datos Inválidos ---
    const storageLimite = new AdaptadorLocalStorageMemoria();
    const claveLimite = 'campuslands.biblioteca.corrupta';

    // Inyectamos registros preexistentes en localStorage: 1 válido y 1 corrupto
    storageLimite.setItem(
        claveLimite,
        JSON.stringify([
            {
                v: 1,
                id: 'lib-9788445000663-0',
                isbn: '978-8445000663',
                titulo: 'El Señor de los Anillos',
                autor: 'J.R.R. Tolkien',
                genero: 'Fantasia',
                anioPublicacion: 1954,
                paginasTotales: 1272,
                paginasLeidas: 600,
                estadoLectura: 'EnProgreso',
                calificacion: 5,
                actualizadoEnISO: '2026-11-12T08:00:00.000Z'
            },
            {
                id: 'registro-roto',
                titulo: 'JSON Incompleto',
                paginasTotales: -100
            }
        ])
    );

    const servicioLimite = new ServicioBibliotecaLocalStorage(storageLimite, claveLimite);

    // Intento de registrar ISBN duplicado con el ya hidratado
    servicioLimite.registrarLibro({
        isbn: '978-8445000663',
        titulo: 'El Señor de los Anillos (Duplicado)',
        autor: 'J.R.R. Tolkien',
        genero: 'Fantasia',
        anioPublicacion: 1954,
        paginasTotales: 1272
    });

    // Intento de registrar DTO con múltiples errores de validación
    servicioLimite.registrarLibro({
        isbn: '123',
        titulo: 'X',
        autor: '',
        genero: 'Thriller',
        anioPublicacion: 3025,
        paginasTotales: -50,
        paginasLeidasIniciales: 200,
        calificacionInicial: 9
    });

    // Intento de actualizar un ID inexistente
    servicioLimite.actualizarProgresoLectura({
        libroId: 'lib-inexistente-999',
        nuevasPaginasLeidas: 50
    });

    const reporteLimite = servicioLimite.obtenerReporteFinal();
    mostrarReporteBiblioteca(reporteLimite, 'Caso Límite - Storage Corrupto, Duplicados y Errores DTO');
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecución:', err));