
// 1. CAPA DE DOMINIO Y DTOs (Data Transfer Objects)

export type CategoriaAtraccionTuristica =
    | 'ArqueologiaHistoria'
    | 'NaturalezaAventura'
    | 'MiradorPanoramico'
    | 'GastronomiaLocal'
    | 'MuseoArte';

export type EstadoAccesoAtraccion =
    | 'AbiertoAlPublico'
    | 'CupoLimitado'
    | 'CerradoPorMantenimiento';

export type CriterioOrdenTurismo =
    | 'MejorCalificacion'
    | 'MenorCostoEntrada'
    | 'MayorCercania'
    | 'MasPopular';

export interface CoordenadasGPS {
    readonly latitud: number;
    readonly longitud: number;
}

export interface PuntoTuristicoDominio {
    readonly id: string;
    readonly codigoPunto: string;
    readonly nombre: string;
    readonly region: string;
    readonly pais: string;
    readonly categoria: CategoriaAtraccionTuristica;
    readonly coordenadas: CoordenadasGPS;
    readonly distanciaCentroKm: number;
    readonly costoEntradaUSD: number;
    readonly calificacionPromedio: number;
    readonly totalResenas: number;
    readonly duracionVisitaMin: number;
    readonly estadoAcceso: EstadoAccesoAtraccion;
    readonly marcadoFavoritoMapa: boolean;
    readonly visitadoPorUsuario: boolean;
}

// DTO de entrada para registrar un punto turístico en el mapa/lista
export interface CrearPuntoTuristicoDTO {
    readonly codigoPunto: string;
    readonly nombre: string;
    readonly region: string;
    readonly pais: string;
    readonly categoria: CategoriaAtraccionTuristica;
    readonly latitud: number;
    readonly longitud: number;
    readonly distanciaCentroKm: number;
    readonly costoEntradaUSD: number;
    readonly calificacionPromedio: number;
    readonly totalResenas: number;
    readonly duracionVisitaMin: number;
    readonly estadoAcceso?: EstadoAccesoAtraccion;
}

// DTO de filtros interactivos en el mapa/lista turística
export interface FiltroListaTuristicaDTO {
    readonly textoBusqueda?: string;
    readonly categoria?: CategoriaAtraccionTuristica;
    readonly region?: string;
    readonly precioMaximoUSD?: number;
    readonly calificacionMinima?: number;
    readonly distanciaMaximaKm?: number;
    readonly soloAbiertos?: boolean;
    readonly soloFavoritos?: boolean;
    readonly ordenarPor?: CriterioOrdenTurismo;
}

// DTO de interacción del usuario con un marcador del mapa o tarjeta de lista
export interface InteraccionMarcadorTuristicoDTO {
    readonly codigoPunto: string;
    readonly accion: 'AlternarFavorito' | 'MarcarVisitado' | 'AgregarResena';
    readonly nuevaCalificacionUsuario?: number;
}

// Proyección tipada para renderizado de marcador en el mapa y tarjeta en lista
export interface MarcadorMapaTuristicoView {
    readonly markerId: string;
    readonly tituloPin: string;
    readonly coordenadasTexto: string;
    readonly badgePrecio: string;
    readonly badgeRating: string;
    readonly iconoEstado: string;
    readonly resaltadoEnMapa: boolean;
}

export type ResultadoOperacion<T> =
    | { readonly ok: true; readonly valor: T }
    | { readonly ok: false; readonly errores: readonly string[] };

export interface ResumenCategoriaTurismo {
    readonly totalPuntos: number;
    readonly abiertosCount: number;
    readonly costoPromedioUSD: number;
    readonly calificacionMedia: number;
}

export interface ReporteTurismoInteractivo {
    readonly reporteId: string;
    readonly nombreGuiaInteractiva: string;
    readonly totalPuntosCatalogo: number;
    readonly puntosAbiertosCount: number;
    readonly favoritosSeleccionadosCount: number;
    readonly puntosVisitadosCount: number;
    readonly costoTotalRutaFavoritosUSD: number;
    readonly tiempoTotalRutaFavoritosHoras: number;
    readonly calificacionGlobalPromedio: number;
    readonly puntoMejorCalificado: PuntoTuristicoDominio | null;
    readonly puntoMasCercano: PuntoTuristicoDominio | null;
    readonly desglosePorCategoria: Readonly<Record<CategoriaAtraccionTuristica, ResumenCategoriaTurismo>>;
    readonly resultadosListaFiltrada: readonly PuntoTuristicoDominio[];
    readonly marcadoresMapaActivos: readonly MarcadorMapaTuristicoView[];
    readonly advertencias: readonly string[];
}

// 2. REPOSITORIO GENÉRICO EN MEMORIA (Generics & Encapsulamiento)

export class RepositorioEnMemoria<T extends { readonly id: string }> {
    private readonly registros: Map<string, T> = new Map();

    public guardar(entidad: T): void {
        this.registros.set(entidad.id, entidad);
    }

    public obtenerPorId(id: string): T | undefined {
        return this.registros.get(id);
    }

    public buscarUno(predicado: (item: T) => boolean): T | undefined {
        for (const item of this.registros.values()) {
            if (predicado(item)) {
                return item;
            }
        }
        return undefined;
    }

    public obtenerTodos(): readonly T[] {
        return Array.from(this.registros.values());
    }

    public contar(): number {
        return this.registros.size;
    }
}

// 3. VALIDACIONES Y TRANSFORMACIONES DE DTO <-> DOMINIO

const CATEGORIAS_TURISMO: readonly CategoriaAtraccionTuristica[] = [
    'ArqueologiaHistoria',
    'NaturalezaAventura',
    'MiradorPanoramico',
    'GastronomiaLocal',
    'MuseoArte'
];

export function validarCrearPuntoTuristicoDTO(
    dto: CrearPuntoTuristicoDTO
): ResultadoOperacion<CrearPuntoTuristicoDTO> {
    const errores: string[] = [];

    if (dto.codigoPunto.trim().length < 4) {
        errores.push(`Código de punto turístico inválido ("${dto.codigoPunto}"): mínimo 4 caracteres.`);
    }

    if (dto.nombre.trim().length < 3) {
        errores.push(`El nombre de la atracción ("${dto.nombre}") es obligatorio.`);
    }

    if (dto.region.trim().length < 2 || dto.pais.trim().length < 2) {
        errores.push(`Ubicación geográfica incompleta en "${dto.codigoPunto}".`);
    }

    if (dto.latitud < -90 || dto.latitud > 90) {
        errores.push(`Latitud GPS fuera de rango (${dto.latitud}) en "${dto.nombre}".`);
    }

    if (dto.longitud < -180 || dto.longitud > 180) {
        errores.push(`Longitud GPS fuera de rango (${dto.longitud}) en "${dto.nombre}".`);
    }

    if (dto.distanciaCentroKm < 0 || dto.distanciaCentroKm > 2000) {
        errores.push(`Distancia al centro inválida (${dto.distanciaCentroKm} km) en "${dto.nombre}".`);
    }

    if (dto.costoEntradaUSD < 0 || dto.costoEntradaUSD > 1000) {
        errores.push(`Costo de entrada fuera de rango ($${dto.costoEntradaUSD}) en "${dto.nombre}".`);
    }

    if (dto.calificacionPromedio < 1 || dto.calificacionPromedio > 5) {
        errores.push(`Calificación fuera de escala 1-5 (${dto.calificacionPromedio}) en "${dto.nombre}".`);
    }

    if (dto.totalResenas < 0 || !Number.isInteger(dto.totalResenas)) {
        errores.push(`Total de reseñas inválido (${dto.totalResenas}) en "${dto.nombre}".`);
    }

    if (dto.duracionVisitaMin <= 0 || dto.duracionVisitaMin > 1440) {
        errores.push(`Duración estimada de visita inválida (${dto.duracionVisitaMin} min) en "${dto.nombre}".`);
    }

    return errores.length === 0
        ? { ok: true, valor: dto }
        : { ok: false, errores };
}

export function validarFiltroTurismoDTO(
    filtro: FiltroListaTuristicaDTO
): ResultadoOperacion<FiltroListaTuristicaDTO> {
    const errores: string[] = [];

    if (filtro.precioMaximoUSD !== undefined && filtro.precioMaximoUSD < 0) {
        errores.push(`El precio máximo de filtro ($${filtro.precioMaximoUSD}) no puede ser negativo.`);
    }

    if (
        filtro.calificacionMinima !== undefined &&
        (filtro.calificacionMinima < 1 || filtro.calificacionMinima > 5)
    ) {
        errores.push(`Calificación mínima inválida (${filtro.calificacionMinima}) en filtro: debe estar entre 1 y 5.`);
    }

    if (filtro.distanciaMaximaKm !== undefined && filtro.distanciaMaximaKm <= 0) {
        errores.push(`La distancia máxima de filtro (${filtro.distanciaMaximaKm} km) debe ser mayor a 0.`);
    }

    return errores.length === 0
        ? { ok: true, valor: filtro }
        : { ok: false, errores };
}

export function mapearPuntoTuristicoDTOADominio(
    dto: CrearPuntoTuristicoDTO,
    secuencia: number
): PuntoTuristicoDominio {
    const codigoLimpio = dto.codigoPunto.trim().toUpperCase();

    return {
        id: `poi-${codigoLimpio}-${secuencia}`,
        codigoPunto: codigoLimpio,
        nombre: dto.nombre.trim(),
        region: dto.region.trim(),
        pais: dto.pais.trim(),
        categoria: dto.categoria,
        coordenadas: {
            latitud: Number(dto.latitud.toFixed(6)),
            longitud: Number(dto.longitud.toFixed(6))
        },
        distanciaCentroKm: Number(dto.distanciaCentroKm.toFixed(1)),
        costoEntradaUSD: Number(dto.costoEntradaUSD.toFixed(2)),
        calificacionPromedio: Number(dto.calificacionPromedio.toFixed(2)),
        totalResenas: dto.totalResenas,
        duracionVisitaMin: dto.duracionVisitaMin,
        estadoAcceso: dto.estadoAcceso ?? 'AbiertoAlPublico',
        marcadoFavoritoMapa: false,
        visitadoPorUsuario: false
    };
}

export function proyectarMarcadorMapa(
    punto: PuntoTuristicoDominio
): MarcadorMapaTuristicoView {
    return {
        markerId: `map-pin-${punto.codigoPunto.toLowerCase()}`,
        tituloPin: `${punto.nombre} (${punto.region})`,
        coordenadasTexto: `${punto.coordenadas.latitud.toFixed(4)}, ${punto.coordenadas.longitud.toFixed(4)}`,
        badgePrecio: punto.costoEntradaUSD === 0 ? 'Entrada Libre' : `$${punto.costoEntradaUSD.toFixed(2)} USD`,
        badgeRating: `${punto.calificacionPromedio.toFixed(1)}/5 (${punto.totalResenas})`,
        iconoEstado:
            punto.estadoAcceso === 'AbiertoAlPublico'
                ? 'ABIERTO'
                : punto.estadoAcceso === 'CupoLimitado'
                    ? 'CUPO LIMITADO'
                    : 'CERRADO',
        resaltadoEnMapa: punto.marcadoFavoritoMapa
    };
}

// 4. MOTOR DE FILTRADO Y ORDENAMIENTO INMUTABLE PARA LISTA Y MAPA

export function filtrarYOrdenarPuntosTuristicos(
    puntos: readonly PuntoTuristicoDominio[],
    filtro: FiltroListaTuristicaDTO
): readonly PuntoTuristicoDominio[] {
    const filtrados = puntos.filter((punto) => {
        if (filtro.textoBusqueda && filtro.textoBusqueda.trim().length > 0) {
            const termino = filtro.textoBusqueda.trim().toLowerCase();
            const coincide =
                punto.nombre.toLowerCase().includes(termino) ||
                punto.region.toLowerCase().includes(termino) ||
                punto.pais.toLowerCase().includes(termino) ||
                punto.codigoPunto.toLowerCase().includes(termino);
            if (!coincide) return false;
        }

        if (filtro.categoria && punto.categoria !== filtro.categoria) {
            return false;
        }

        if (
            filtro.region &&
            punto.region.toLowerCase() !== filtro.region.trim().toLowerCase()
        ) {
            return false;
        }

        if (
            filtro.precioMaximoUSD !== undefined &&
            punto.costoEntradaUSD > filtro.precioMaximoUSD
        ) {
            return false;
        }

        if (
            filtro.calificacionMinima !== undefined &&
            punto.calificacionPromedio < filtro.calificacionMinima
        ) {
            return false;
        }

        if (
            filtro.distanciaMaximaKm !== undefined &&
            punto.distanciaCentroKm > filtro.distanciaMaximaKm
        ) {
            return false;
        }

        if (filtro.soloAbiertos && punto.estadoAcceso === 'CerradoPorMantenimiento') {
            return false;
        }

        if (filtro.soloFavoritos && !punto.marcadoFavoritoMapa) {
            return false;
        }

        return true;
    });

    if (!filtro.ordenarPor) {
        return filtrados;
    }

    const copiaOrdenable = [...filtrados];

    switch (filtro.ordenarPor) {
        case 'MejorCalificacion':
            return copiaOrdenable.sort((a, b) => b.calificacionPromedio - a.calificacionPromedio);
        case 'MenorCostoEntrada':
            return copiaOrdenable.sort((a, b) => a.costoEntradaUSD - b.costoEntradaUSD);
        case 'MayorCercania':
            return copiaOrdenable.sort((a, b) => a.distanciaCentroKm - b.distanciaCentroKm);
        case 'MasPopular':
            return copiaOrdenable.sort((a, b) => b.totalResenas - a.totalResenas);
    }
}

// 5. GENERACIÓN DE REPORTES Y SERVICIO DE LISTA TURÍSTICA INTERACTIVA

export function generarReporteTurismo(
    nombreGuiaInteractiva: string,
    catalogo: readonly PuntoTuristicoDominio[],
    listaFiltrada: readonly PuntoTuristicoDominio[],
    advertencias: readonly string[]
): ReporteTurismoInteractivo {
    const puntosAbiertosCount = catalogo.filter(
        (p) => p.estadoAcceso !== 'CerradoPorMantenimiento'
    ).length;

    const favoritos = catalogo.filter((p) => p.marcadoFavoritoMapa);
    const favoritosSeleccionadosCount = favoritos.length;
    const puntosVisitadosCount = catalogo.filter((p) => p.visitadoPorUsuario).length;

    const costoTotalRutaFavoritosUSD = Number(
        favoritos.reduce((acc, p) => acc + p.costoEntradaUSD, 0).toFixed(2)
    );

    const minutosFavoritos = favoritos.reduce((acc, p) => acc + p.duracionVisitaMin, 0);
    const tiempoTotalRutaFavoritosHoras = Number((minutosFavoritos / 60).toFixed(1));

    const calificacionGlobalPromedio =
        catalogo.length > 0
            ? Number(
                (
                    catalogo.reduce((acc, p) => acc + p.calificacionPromedio, 0) /
                    catalogo.length
                ).toFixed(2)
            )
            : 0;

    const puntoMejorCalificado =
        [...catalogo].sort((a, b) => b.calificacionPromedio - a.calificacionPromedio)[0] ??
        null;

    const puntoMasCercano =
        [...catalogo].sort((a, b) => a.distanciaCentroKm - b.distanciaCentroKm)[0] ?? null;

    const desglosePorCategoria = CATEGORIAS_TURISMO.reduce((acc, cat) => {
        const delGrupo = catalogo.filter((p) => p.categoria === cat);
        const abiertosCount = delGrupo.filter(
            (p) => p.estadoAcceso !== 'CerradoPorMantenimiento'
        ).length;
        const costoPromedioUSD =
            delGrupo.length > 0
                ? Number(
                    (
                        delGrupo.reduce((s, p) => s + p.costoEntradaUSD, 0) / delGrupo.length
                    ).toFixed(2)
                )
                : 0;
        const calificacionMedia =
            delGrupo.length > 0
                ? Number(
                    (
                        delGrupo.reduce((s, p) => s + p.calificacionPromedio, 0) /
                        delGrupo.length
                    ).toFixed(2)
                )
                : 0;

        acc[cat] = {
            totalPuntos: delGrupo.length,
            abiertosCount,
            costoPromedioUSD,
            calificacionMedia
        };
        return acc;
    }, {} as Record<CategoriaAtraccionTuristica, ResumenCategoriaTurismo>);

    const marcadoresMapaActivos = listaFiltrada.map((p) => proyectarMarcadorMapa(p));

    return {
        reporteId: `REP-TURISMO-${Date.now()}`,
        nombreGuiaInteractiva,
        totalPuntosCatalogo: catalogo.length,
        puntosAbiertosCount,
        favoritosSeleccionadosCount,
        puntosVisitadosCount,
        costoTotalRutaFavoritosUSD,
        tiempoTotalRutaFavoritosHoras,
        calificacionGlobalPromedio,
        puntoMejorCalificado,
        puntoMasCercano,
        desglosePorCategoria,
        resultadosListaFiltrada: listaFiltrada,
        marcadoresMapaActivos,
        advertencias
    };
}

export class ServicioListaTuristicaInteractiva {
    private readonly repoPuntos = new RepositorioEnMemoria<PuntoTuristicoDominio>();
    private readonly advertencias: string[] = [];
    private secuenciaPunto = 1;
    private filtroActivo: FiltroListaTuristicaDTO = {};

    constructor(private readonly nombreGuiaInteractiva: string) { }

    public registrarPuntoTuristico(
        dto: CrearPuntoTuristicoDTO
    ): ResultadoOperacion<PuntoTuristicoDominio> {
        const validacion = validarCrearPuntoTuristicoDTO(dto);
        if (!validacion.ok) {
            this.advertencias.push(...validacion.errores);
            return validacion;
        }

        const codigoNormalizado = dto.codigoPunto.trim().toUpperCase();
        const duplicado = this.repoPuntos.buscarUno(
            (p) => p.codigoPunto === codigoNormalizado
        );
        if (duplicado) {
            const msg = `Código turístico duplicado: "${codigoNormalizado}" ("${dto.nombre}") ya está en el mapa.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const dominio = mapearPuntoTuristicoDTOADominio(dto, this.secuenciaPunto++);
        this.repoPuntos.guardar(dominio);
        return { ok: true, valor: dominio };
    }

    public interactuarConMarcador(
        dto: InteraccionMarcadorTuristicoDTO
    ): ResultadoOperacion<PuntoTuristicoDominio> {
        const codigoNormalizado = dto.codigoPunto.trim().toUpperCase();
        const punto = this.repoPuntos.buscarUno(
            (p) => p.codigoPunto === codigoNormalizado
        );

        if (!punto) {
            const msg = `Marcador turístico "${codigoNormalizado}" no encontrado en el mapa.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        if (dto.accion === 'AlternarFavorito') {
            const actualizado: PuntoTuristicoDominio = {
                ...punto,
                marcadoFavoritoMapa: !punto.marcadoFavoritoMapa
            };
            this.repoPuntos.guardar(actualizado);
            return { ok: true, valor: actualizado };
        }

        if (dto.accion === 'MarcarVisitado') {
            if (punto.estadoAcceso === 'CerradoPorMantenimiento') {
                const msg = `No se puede registrar visita en "${punto.nombre}": actualmente está cerrado por mantenimiento.`;
                this.advertencias.push(msg);
                return { ok: false, errores: [msg] };
            }
            const actualizado: PuntoTuristicoDominio = {
                ...punto,
                visitadoPorUsuario: true
            };
            this.repoPuntos.guardar(actualizado);
            return { ok: true, valor: actualizado };
        }

        // AgregarResena
        const rating = dto.nuevaCalificacionUsuario;
        if (rating === undefined || rating < 1 || rating > 5) {
            const msg = `Calificación de reseña inválida (${rating}) para "${punto.nombre}": debe ser entre 1 y 5.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const nuevoTotalResenas = punto.totalResenas + 1;
        const nuevaMedia = Number(
            (
                (punto.calificacionPromedio * punto.totalResenas + rating) /
                nuevoTotalResenas
            ).toFixed(2)
        );

        const actualizado: PuntoTuristicoDominio = {
            ...punto,
            calificacionPromedio: nuevaMedia,
            totalResenas: nuevoTotalResenas
        };
        this.repoPuntos.guardar(actualizado);
        return { ok: true, valor: actualizado };
    }

    public aplicarFiltroListaYMapa(
        filtro: FiltroListaTuristicaDTO
    ): ResultadoOperacion<readonly PuntoTuristicoDominio[]> {
        const validacionFiltro = validarFiltroTurismoDTO(filtro);
        if (!validacionFiltro.ok) {
            this.advertencias.push(...validacionFiltro.errores);
            return validacionFiltro;
        }

        this.filtroActivo = filtro;
        const resultados = filtrarYOrdenarPuntosTuristicos(
            this.repoPuntos.obtenerTodos(),
            filtro
        );

        if (resultados.length === 0) {
            this.advertencias.push(
                'Ningún destino turístico coincide con los filtros activos seleccionados en el mapa.'
            );
        }

        return { ok: true, valor: resultados };
    }

    public obtenerReporteFinal(): ReporteTurismoInteractivo {
        const catalogo = this.repoPuntos.obtenerTodos();
        const listaFiltrada = filtrarYOrdenarPuntosTuristicos(
            catalogo,
            this.filtroActivo
        );

        return generarReporteTurismo(
            this.nombreGuiaInteractiva,
            catalogo,
            listaFiltrada,
            this.advertencias
        );
    }
}

// 6. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarReporteTurismo(
    reporte: ReporteTurismoInteractivo,
    tituloCaso: string
): void {
    console.log(`\n======================================================================`);
    console.log(` LISTA TURÍSTICA INTERACTIVA - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Guía Interactiva    : ${reporte.nombreGuiaInteractiva}`);
    console.log(`Reporte ID          : ${reporte.reporteId}`);
    console.log(`Destinos en Mapa    : ${reporte.totalPuntosCatalogo} (${reporte.puntosAbiertosCount} abiertos)`);
    console.log(`Ruta Favoritos      : ${reporte.favoritosSeleccionadosCount} seleccionados | Costo: $${reporte.costoTotalRutaFavoritosUSD.toFixed(2)} USD | Tiempo: ${reporte.tiempoTotalRutaFavoritosHoras} h`);
    console.log(`Visitados / Rating  : ${reporte.puntosVisitadosCount} visitados | Rating Global: ${reporte.calificacionGlobalPromedio}/5.00`);
    console.log(`Mejor Calificado    : ${reporte.puntoMejorCalificado ? `"${reporte.puntoMejorCalificado.nombre}" (${reporte.puntoMejorCalificado.calificacionPromedio}/5)` : 'N/A'}`);
    console.log(`Más Cercano         : ${reporte.puntoMasCercano ? `"${reporte.puntoMasCercano.nombre}" (${reporte.puntoMasCercano.distanciaCentroKm} km)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (reporte.advertencias.length > 0) {
        console.log(`ADVERTENCIAS Y ALERTAS TURÍSTICAS (${reporte.advertencias.length}):`);
        reporte.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`RESUMEN POR CATEGORÍA TURÍSTICA:`);
    Object.entries(reporte.desglosePorCategoria).forEach(([cat, info]) => {
        console.log(
            `   - ${cat.padEnd(20)}: ${info.totalPuntos} lugares | Abiertos: ${info.abiertosCount} | Entrada Prom: $${info.costoPromedioUSD.toFixed(2)}`
        );
    });
    console.log(`----------------------------------------------------------------------`);

    console.log(`DESTINOS VISIBLES EN LISTA Y MAPA INTERACTIVO:`);
    console.table(
        reporte.resultadosListaFiltrada.map((p, idx) => ({
            Código: p.codigoPunto,
            Atracción: p.nombre,
            Región: `${p.region}, ${p.pais}`,
            Categoría: p.categoria,
            Entrada: reporte.marcadoresMapaActivos[idx]?.badgePrecio ?? `$${p.costoEntradaUSD}`,
            Rating: `${p.calificacionPromedio}/5 (${p.totalResenas})`,
            Distancia: `${p.distanciaCentroKm} km`,
            Favorito: p.marcadoFavoritoMapa ? 'Sí' : 'No',
            Estado: p.estadoAcceso
        }))
    );
}

// 7. CASOS DE PRUEBA (Caso Normal y Caso Límite)

async function ejecutarPruebas(): Promise<void> {
    // Simulación de sincronización inicial de pines geográficos
    await new Promise((resolve) => setTimeout(resolve, 10));

    // --- CASO 1: Guía Turística de Guatemala con Interacciones en Mapa y Filtros (Caso Normal) ---
    const guiaNormal = new ServicioListaTuristicaInteractiva('Explora Guatemala - Mapa & Guía Digital');

    guiaNormal.registrarPuntoTuristico({
        codigoPunto: 'GT-TIK-001',
        nombre: 'Parque Nacional Tikal',
        region: 'Petén',
        pais: 'Guatemala',
        categoria: 'ArqueologiaHistoria',
        latitud: 17.222,
        longitud: -89.6237,
        distanciaCentroKm: 64.5,
        costoEntradaUSD: 20.0,
        calificacionPromedio: 4.9,
        totalResenas: 14820,
        duracionVisitaMin: 240,
        estadoAcceso: 'AbiertoAlPublico'
    });

    guiaNormal.registrarPuntoTuristico({
        codigoPunto: 'GT-ANT-002',
        nombre: 'Mirador Cerro de la Cruz',
        region: 'Sacatepéquez',
        pais: 'Guatemala',
        categoria: 'MiradorPanoramico',
        latitud: 14.5645,
        longitud: -90.7318,
        distanciaCentroKm: 1.8,
        costoEntradaUSD: 0,
        calificacionPromedio: 4.7,
        totalResenas: 9350,
        duracionVisitaMin: 60,
        estadoAcceso: 'AbiertoAlPublico'
    });

    guiaNormal.registrarPuntoTuristico({
        codigoPunto: 'GT-ATI-003',
        nombre: 'Reserva Natural Atitlán',
        region: 'Sololá',
        pais: 'Guatemala',
        categoria: 'NaturalezaAventura',
        latitud: 14.7483,
        longitud: -91.1642,
        distanciaCentroKm: 2.5,
        costoEntradaUSD: 14.0,
        calificacionPromedio: 4.8,
        totalResenas: 5120,
        duracionVisitaMin: 150,
        estadoAcceso: 'AbiertoAlPublico'
    });

    guiaNormal.registrarPuntoTuristico({
        codigoPunto: 'GT-SEM-004',
        nombre: 'Monumento Natural Semuc Champey',
        region: 'Alta Verapaz',
        pais: 'Guatemala',
        categoria: 'NaturalezaAventura',
        latitud: 15.5333,
        longitud: -89.9589,
        distanciaCentroKm: 11.2,
        costoEntradaUSD: 12.0,
        calificacionPromedio: 4.9,
        totalResenas: 8410,
        duracionVisitaMin: 210,
        estadoAcceso: 'CupoLimitado'
    });

    // Interacciones del turista en el mapa y tarjetas
    guiaNormal.interactuarConMarcador({ codigoPunto: 'GT-TIK-001', accion: 'AlternarFavorito' });
    guiaNormal.interactuarConMarcador({ codigoPunto: 'GT-ANT-002', accion: 'AlternarFavorito' });
    guiaNormal.interactuarConMarcador({ codigoPunto: 'GT-ANT-002', accion: 'MarcarVisitado' });
    guiaNormal.interactuarConMarcador({
        codigoPunto: 'GT-ATI-003',
        accion: 'AgregarResena',
        nuevaCalificacionUsuario: 5.0
    });

    // Filtrar destinos abiertos con calificación >= 4.7 y entrada <= $20, ordenados por calificación
    guiaNormal.aplicarFiltroListaYMapa({
        calificacionMinima: 4.7,
        precioMaximoUSD: 20,
        soloAbiertos: true,
        ordenarPor: 'MejorCalificacion'
    });

    const reporteNormal = guiaNormal.obtenerReporteFinal();
    mostrarReporteTurismo(reporteNormal, 'Caso Normal - Destinos Destacados y Ruta de Favoritos');

    // --- CASO 2: Coordenadas GPS Inválidas, Destino Cerrado, Duplicados y Filtro Sin Resultados (Caso Límite) ---
    const guiaLimite = new ServicioListaTuristicaInteractiva('Auditoría Geográfica Turística');

    guiaLimite.registrarPuntoTuristico({
        codigoPunto: 'GT-PAC-010',
        nombre: 'Volcán de Pacaya (Sendero Cráter)',
        region: 'Escuintla',
        pais: 'Guatemala',
        categoria: 'NaturalezaAventura',
        latitud: 14.3822,
        longitud: -90.6014,
        distanciaCentroKm: 38.0,
        costoEntradaUSD: 15.0,
        calificacionPromedio: 4.6,
        totalResenas: 6200,
        duracionVisitaMin: 180,
        estadoAcceso: 'CerradoPorMantenimiento'
    });

    // Intento de marcar visita en un destino cerrado por mantenimiento
    guiaLimite.interactuarConMarcador({ codigoPunto: 'GT-PAC-010', accion: 'MarcarVisitado' });

    // Intento de enviar calificación fuera de rango (1-5)
    guiaLimite.interactuarConMarcador({
        codigoPunto: 'GT-PAC-010',
        accion: 'AgregarResena',
        nuevaCalificacionUsuario: 7.5
    });

    // Intento de registrar código duplicado
    guiaLimite.registrarPuntoTuristico({
        codigoPunto: 'GT-PAC-010',
        nombre: 'Volcán de Pacaya Duplicado',
        region: 'Escuintla',
        pais: 'Guatemala',
        categoria: 'NaturalezaAventura',
        latitud: 14.3822,
        longitud: -90.6014,
        distanciaCentroKm: 38.0,
        costoEntradaUSD: 15.0,
        calificacionPromedio: 4.6,
        totalResenas: 6200,
        duracionVisitaMin: 180
    });

    // Intento de registrar punto turístico con coordenadas GPS y datos corruptos
    guiaLimite.registrarPuntoTuristico({
        codigoPunto: 'XX',
        nombre: 'A',
        region: '',
        pais: '',
        categoria: 'MuseoArte',
        latitud: 145.0, // > 90 -> Inválido
        longitud: -250.0, // < -180 -> Inválido
        distanciaCentroKm: -10,
        costoEntradaUSD: -5,
        calificacionPromedio: 0,
        totalResenas: -3,
        duracionVisitaMin: 0
    });

    // Filtro válido que no arroja resultados porque el único punto está cerrado
    guiaLimite.aplicarFiltroListaYMapa({
        soloAbiertos: true,
        ordenarPor: 'MenorCostoEntrada'
    });

    const reporteLimite = guiaLimite.obtenerReporteFinal();
    mostrarReporteTurismo(reporteLimite, 'Caso Límite - Coordenadas GPS Inválidas, Cierre y Duplicados');
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecución:', err));