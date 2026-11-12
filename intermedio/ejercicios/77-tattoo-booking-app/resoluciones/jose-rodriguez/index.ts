
// 1. CAPA DE DOMINIO Y DTOs (Data Transfer Objects)

export type EstiloTatuaje =
    | 'Blackwork'
    | 'Realismo'
    | 'Tradicional'
    | 'NeoTradicional'
    | 'FineLine'
    | 'JaponesIrezumi';

export type ZonaCuerpoTatuaje =
    | 'Antebrazo'
    | 'BrazoCompleto'
    | 'Espalda'
    | 'Pierna'
    | 'Costillas'
    | 'CuelloMano';

export type TamanoTatuaje =
    | 'Mini'
    | 'Mediano'
    | 'Grande'
    | 'PiezaCompleta';

export type EstadoCitaTatuaje =
    | 'PendienteDeposito'
    | 'Confirmada'
    | 'Completada'
    | 'Cancelada';

export interface ArtistaTatuadorDominio {
    readonly id: string;
    readonly codigoArtista: string;
    readonly nombreArtistico: string;
    readonly especialidadPrincipal: EstiloTatuaje;
    readonly tarifaHoraUSD: number;
    readonly activoEnEstudio: boolean;
}

export interface CitaTatuajeDominio {
    readonly id: string;
    readonly codigoCita: string;
    readonly clienteNombre: string;
    readonly clienteEdad: number;
    readonly artistaId: string;
    readonly artistaNombre: string;
    readonly estilo: EstiloTatuaje;
    readonly zonaCuerpo: ZonaCuerpoTatuaje;
    readonly tamano: TamanoTatuaje;
    readonly fechaISO: string;
    readonly horaInicio: string;
    readonly duracionHoras: number;
    readonly costoTotalEstimadoUSD: number;
    readonly depositoMinimoRequeridoUSD: number;
    readonly depositoPagadoUSD: number;
    readonly saldoPendienteUSD: number;
    readonly consentimientoFirmado: boolean;
    readonly estadoCita: EstadoCitaTatuaje;
    readonly notasDiseno: string;
}

// DTO de entrada para registrar un tatuador en el estudio
export interface RegistrarArtistaDTO {
    readonly codigoArtista: string;
    readonly nombreArtistico: string;
    readonly especialidadPrincipal: EstiloTatuaje;
    readonly tarifaHoraUSD: number;
    readonly activoEnEstudio?: boolean;
}

// DTO de entrada para agendar una sesión de tatuaje
export interface CrearCitaTatuajeDTO {
    readonly codigoCita: string;
    readonly clienteNombre: string;
    readonly clienteEdad: number;
    readonly codigoArtista: string;
    readonly estilo: EstiloTatuaje;
    readonly zonaCuerpo: ZonaCuerpoTatuaje;
    readonly tamano: TamanoTatuaje;
    readonly fechaISO: string;
    readonly horaInicio: string;
    readonly duracionHoras: number;
    readonly depositoPagadoUSD: number;
    readonly consentimientoFirmado: boolean;
    readonly notasDiseno?: string;
}

// DTO para registrar abono de depósito o finalizar sesión
export interface ActualizarSesionTatuajeDTO {
    readonly codigoCita: string;
    readonly accion: 'RegistrarAbonoDeposito' | 'CompletarSesion' | 'CancelarCita';
    readonly montoAbonoUSD?: number;
}

export type ResultadoOperacion<T> =
    | { readonly ok: true; readonly valor: T }
    | { readonly ok: false; readonly errores: readonly string[] };

export interface ResumenEstiloTatuaje {
    readonly totalCitas: number;
    readonly confirmadasOCompletadasCount: number;
    readonly horasAgendadas: number;
    readonly ingresosProyectadosUSD: number;
}

export interface ReporteBookingTatuajes {
    readonly reporteId: string;
    readonly nombreEstudio: string;
    readonly totalArtistasActivos: number;
    readonly totalCitasRegistradas: number;
    readonly citasConfirmadasCount: number;
    readonly citasPendientesDepositoCount: number;
    readonly citasCompletadasCount: number;
    readonly ingresosTotalesProyectadosUSD: number;
    readonly depositosRecaudadosUSD: number;
    readonly saldoPorCobrarUSD: number;
    readonly horasTotalesAgendadas: number;
    readonly citaMayorValor: CitaTatuajeDominio | null;
    readonly desglosePorEstilo: Readonly<Record<EstiloTatuaje, ResumenEstiloTatuaje>>;
    readonly agendaCitas: readonly CitaTatuajeDominio[];
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

const ESTILOS_TATUAJE: readonly EstiloTatuaje[] = [
    'Blackwork',
    'Realismo',
    'Tradicional',
    'NeoTradicional',
    'FineLine',
    'JaponesIrezumi'
];

const RECARGO_ZONA_COMPLEJA: Readonly<Record<ZonaCuerpoTatuaje, number>> = {
    Antebrazo: 1.0,
    BrazoCompleto: 1.05,
    Espalda: 1.1,
    Pierna: 1.0,
    Costillas: 1.15,
    CuelloMano: 1.2
};

const PATRON_FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;
const PATRON_HORA_24H = /^([01]\d|2[0-3]):([0-5]\d)$/;
const PORCENTAJE_DEPOSITO_MINIMO = 0.3;

export function calcularCostoSesionTatuaje(
    tarifaHoraUSD: number,
    duracionHoras: number,
    zonaCuerpo: ZonaCuerpoTatuaje
): {
    readonly costoTotalEstimadoUSD: number;
    readonly depositoMinimoRequeridoUSD: number;
} {
    const multiplicador = RECARGO_ZONA_COMPLEJA[zonaCuerpo];
    const costoTotalEstimadoUSD = Number(
        (tarifaHoraUSD * duracionHoras * multiplicador).toFixed(2)
    );
    const depositoMinimoRequeridoUSD = Number(
        (costoTotalEstimadoUSD * PORCENTAJE_DEPOSITO_MINIMO).toFixed(2)
    );

    return {
        costoTotalEstimadoUSD,
        depositoMinimoRequeridoUSD
    };
}

export function validarRegistrarArtistaDTO(
    dto: RegistrarArtistaDTO
): ResultadoOperacion<RegistrarArtistaDTO> {
    const errores: string[] = [];

    if (dto.codigoArtista.trim().length < 4) {
        errores.push(`Código de artista inválido ("${dto.codigoArtista}"): mínimo 4 caracteres.`);
    }

    if (dto.nombreArtistico.trim().length < 3) {
        errores.push(`El nombre artístico ("${dto.nombreArtistico}") es obligatorio.`);
    }

    if (dto.tarifaHoraUSD < 40 || dto.tarifaHoraUSD > 1000) {
        errores.push(
            `Tarifa por hora fuera de rango ($${dto.tarifaHoraUSD}/h) para "${dto.nombreArtistico}".`
        );
    }

    return errores.length === 0
        ? { ok: true, valor: dto }
        : { ok: false, errores };
}

export function validarCrearCitaTatuajeDTO(
    dto: CrearCitaTatuajeDTO
): ResultadoOperacion<CrearCitaTatuajeDTO> {
    const errores: string[] = [];

    if (dto.codigoCita.trim().length < 4) {
        errores.push(`Código de cita inválido ("${dto.codigoCita}"): mínimo 4 caracteres.`);
    }

    if (dto.clienteNombre.trim().length < 3) {
        errores.push(`Nombre de cliente inválido ("${dto.clienteNombre}") en cita "${dto.codigoCita}".`);
    }

    if (dto.clienteEdad < 18 || dto.clienteEdad > 100) {
        errores.push(
            `Restricción legal en "${dto.codigoCita}": el cliente "${dto.clienteNombre}" debe ser mayor de 18 años (edad: ${dto.clienteEdad}).`
        );
    }

    if (!dto.consentimientoFirmado) {
        errores.push(
            `Consentimiento informado y ficha médica sin firmar para "${dto.clienteNombre}" (${dto.codigoCita}).`
        );
    }

    if (!PATRON_FECHA_ISO.test(dto.fechaISO.trim())) {
        errores.push(
            `Formato de fecha inválido ("${dto.fechaISO}") en "${dto.codigoCita}": use YYYY-MM-DD.`
        );
    }

    if (!PATRON_HORA_24H.test(dto.horaInicio.trim())) {
        errores.push(
            `Formato de hora inválido ("${dto.horaInicio}") en "${dto.codigoCita}": use HH:MM (24h).`
        );
    }

    if (dto.duracionHoras < 1 || dto.duracionHoras > 10) {
        errores.push(
            `Duración de sesión fuera de rango (${dto.duracionHoras} h) en "${dto.codigoCita}".`
        );
    }

    if (dto.depositoPagadoUSD < 0) {
        errores.push(
            `El depósito pagado ($${dto.depositoPagadoUSD}) no puede ser negativo en "${dto.codigoCita}".`
        );
    }

    return errores.length === 0
        ? { ok: true, valor: dto }
        : { ok: false, errores };
}

export function mapearArtistaDTOADominio(
    dto: RegistrarArtistaDTO,
    secuencia: number
): ArtistaTatuadorDominio {
    const codigoLimpio = dto.codigoArtista.trim().toUpperCase();
    return {
        id: `art-${codigoLimpio}-${secuencia}`,
        codigoArtista: codigoLimpio,
        nombreArtistico: dto.nombreArtistico.trim(),
        especialidadPrincipal: dto.especialidadPrincipal,
        tarifaHoraUSD: Number(dto.tarifaHoraUSD.toFixed(2)),
        activoEnEstudio: dto.activoEnEstudio ?? true
    };
}

export function mapearCitaDTOADominio(
    dto: CrearCitaTatuajeDTO,
    artista: ArtistaTatuadorDominio,
    secuencia: number
): CitaTatuajeDominio {
    const codigoLimpio = dto.codigoCita.trim().toUpperCase();
    const { costoTotalEstimadoUSD, depositoMinimoRequeridoUSD } =
        calcularCostoSesionTatuaje(
            artista.tarifaHoraUSD,
            dto.duracionHoras,
            dto.zonaCuerpo
        );

    const depositoPagadoUSD = Number(
        Math.min(dto.depositoPagadoUSD, costoTotalEstimadoUSD).toFixed(2)
    );
    const saldoPendienteUSD = Number(
        Math.max(0, costoTotalEstimadoUSD - depositoPagadoUSD).toFixed(2)
    );

    const estadoCita: EstadoCitaTatuaje =
        depositoPagadoUSD >= depositoMinimoRequeridoUSD
            ? 'Confirmada'
            : 'PendienteDeposito';

    return {
        id: `tat-${codigoLimpio}-${secuencia}`,
        codigoCita: codigoLimpio,
        clienteNombre: dto.clienteNombre.trim(),
        clienteEdad: dto.clienteEdad,
        artistaId: artista.id,
        artistaNombre: artista.nombreArtistico,
        estilo: dto.estilo,
        zonaCuerpo: dto.zonaCuerpo,
        tamano: dto.tamano,
        fechaISO: dto.fechaISO.trim(),
        horaInicio: dto.horaInicio.trim(),
        duracionHoras: dto.duracionHoras,
        costoTotalEstimadoUSD,
        depositoMinimoRequeridoUSD,
        depositoPagadoUSD,
        saldoPendienteUSD,
        consentimientoFirmado: dto.consentimientoFirmado,
        estadoCita,
        notasDiseno: dto.notasDiseno?.trim() ?? ''
    };
}

function convertirHoraAMinutos(hora24: string): number {
    const [horasStr, minutosStr] = hora24.split(':');
    return Number(horasStr) * 60 + Number(minutosStr);
}

export function existeTraslapeHorarioArtista(
    citasExistentes: readonly CitaTatuajeDominio[],
    artistaId: string,
    fechaISO: string,
    horaInicio: string,
    duracionHoras: number
): boolean {
    const inicioNuevoMin = convertirHoraAMinutos(horaInicio);
    const finNuevoMin = inicioNuevoMin + Math.round(duracionHoras * 60);

    return citasExistentes.some((cita) => {
        if (
            cita.artistaId !== artistaId ||
            cita.fechaISO !== fechaISO ||
            cita.estadoCita === 'Cancelada'
        ) {
            return false;
        }

        const inicioExistenteMin = convertirHoraAMinutos(cita.horaInicio);
        const finExistenteMin = inicioExistenteMin + Math.round(cita.duracionHoras * 60);

        return inicioNuevoMin < finExistenteMin && finNuevoMin > inicioExistenteMin;
    });
}

// 4. GENERACIÓN DE REPORTES Y SERVICIO DE BOOKING DE TATUAJES

export function generarReporteBookingTatuajes(
    nombreEstudio: string,
    artistas: readonly ArtistaTatuadorDominio[],
    citas: readonly CitaTatuajeDominio[],
    advertencias: readonly string[]
): ReporteBookingTatuajes {
    const totalArtistasActivos = artistas.filter((a) => a.activoEnEstudio).length;
    const citasActivas = citas.filter((c) => c.estadoCita !== 'Cancelada');

    const citasConfirmadasCount = citasActivas.filter(
        (c) => c.estadoCita === 'Confirmada'
    ).length;
    const citasPendientesDepositoCount = citasActivas.filter(
        (c) => c.estadoCita === 'PendienteDeposito'
    ).length;
    const citasCompletadasCount = citasActivas.filter(
        (c) => c.estadoCita === 'Completada'
    ).length;

    const ingresosTotalesProyectadosUSD = Number(
        citasActivas.reduce((acc, c) => acc + c.costoTotalEstimadoUSD, 0).toFixed(2)
    );
    const depositosRecaudadosUSD = Number(
        citasActivas.reduce((acc, c) => acc + c.depositoPagadoUSD, 0).toFixed(2)
    );
    const saldoPorCobrarUSD = Number(
        citasActivas.reduce((acc, c) => acc + c.saldoPendienteUSD, 0).toFixed(2)
    );
    const horasTotalesAgendadas = Number(
        citasActivas.reduce((acc, c) => acc + c.duracionHoras, 0).toFixed(1)
    );

    const citaMayorValor =
        [...citasActivas].sort(
            (a, b) => b.costoTotalEstimadoUSD - a.costoTotalEstimadoUSD
        )[0] ?? null;

    const desglosePorEstilo = ESTILOS_TATUAJE.reduce((acc, estilo) => {
        const delGrupo = citasActivas.filter((c) => c.estilo === estilo);
        const confirmadasOCompletadasCount = delGrupo.filter(
            (c) => c.estadoCita === 'Confirmada' || c.estadoCita === 'Completada'
        ).length;
        const horasAgendadas = Number(
            delGrupo.reduce((s, c) => s + c.duracionHoras, 0).toFixed(1)
        );
        const ingresosProyectadosUSD = Number(
            delGrupo.reduce((s, c) => s + c.costoTotalEstimadoUSD, 0).toFixed(2)
        );

        acc[estilo] = {
            totalCitas: delGrupo.length,
            confirmadasOCompletadasCount,
            horasAgendadas,
            ingresosProyectadosUSD
        };
        return acc;
    }, {} as Record<EstiloTatuaje, ResumenEstiloTatuaje>);

    // Ordenar agenda cronológicamente sin mutar arreglo original
    const agendaOrdenada = [...citas].sort((a, b) => {
        const cmpFecha = a.fechaISO.localeCompare(b.fechaISO);
        if (cmpFecha !== 0) return cmpFecha;
        return a.horaInicio.localeCompare(b.horaInicio);
    });

    return {
        reporteId: `REP-TATTOO-${Date.now()}`,
        nombreEstudio,
        totalArtistasActivos,
        totalCitasRegistradas: citas.length,
        citasConfirmadasCount,
        citasPendientesDepositoCount,
        citasCompletadasCount,
        ingresosTotalesProyectadosUSD,
        depositosRecaudadosUSD,
        saldoPorCobrarUSD,
        horasTotalesAgendadas,
        citaMayorValor,
        desglosePorEstilo,
        agendaCitas: agendaOrdenada,
        advertencias
    };
}

export class ServicioBookingTatuajes {
    private readonly repoArtistas = new RepositorioEnMemoria<ArtistaTatuadorDominio>();
    private readonly repoCitas = new RepositorioEnMemoria<CitaTatuajeDominio>();
    private readonly advertencias: string[] = [];
    private secuenciaArtista = 1;
    private secuenciaCita = 1;

    constructor(private readonly nombreEstudio: string) { }

    public registrarArtista(
        dto: RegistrarArtistaDTO
    ): ResultadoOperacion<ArtistaTatuadorDominio> {
        const validacion = validarRegistrarArtistaDTO(dto);
        if (!validacion.ok) {
            this.advertencias.push(...validacion.errores);
            return validacion;
        }

        const codigoNormalizado = dto.codigoArtista.trim().toUpperCase();
        const duplicado = this.repoArtistas.buscarUno(
            (a) => a.codigoArtista === codigoNormalizado
        );
        if (duplicado) {
            const msg = `Artista duplicado: "${codigoNormalizado}" ("${dto.nombreArtistico}") ya existe en el estudio.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const artista = mapearArtistaDTOADominio(dto, this.secuenciaArtista++);
        this.repoArtistas.guardar(artista);
        return { ok: true, valor: artista };
    }

    public agendarCitaTatuaje(
        dto: CrearCitaTatuajeDTO
    ): ResultadoOperacion<CitaTatuajeDominio> {
        const validacion = validarCrearCitaTatuajeDTO(dto);
        if (!validacion.ok) {
            this.advertencias.push(...validacion.errores);
            return validacion;
        }

        const codigoCitaNorm = dto.codigoCita.trim().toUpperCase();
        const citaDuplicada = this.repoCitas.buscarUno(
            (c) => c.codigoCita === codigoCitaNorm
        );
        if (citaDuplicada) {
            const msg = `Código de cita duplicado: "${codigoCitaNorm}" ya está registrado.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const codigoArtistaNorm = dto.codigoArtista.trim().toUpperCase();
        const artista = this.repoArtistas.buscarUno(
            (a) => a.codigoArtista === codigoArtistaNorm
        );
        if (!artista) {
            const msg = `Artista "${codigoArtistaNorm}" no encontrado para agendar cita "${codigoCitaNorm}".`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        if (!artista.activoEnEstudio) {
            const msg = `El tatuador "${artista.nombreArtistico}" (${artista.codigoArtista}) no está disponible para nuevas reservas.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const hayTraslape = existeTraslapeHorarioArtista(
            this.repoCitas.obtenerTodos(),
            artista.id,
            dto.fechaISO.trim(),
            dto.horaInicio.trim(),
            dto.duracionHoras
        );
        if (hayTraslape) {
            const msg = `Conflicto de agenda en "${codigoCitaNorm}": "${artista.nombreArtistico}" ya tiene una sesión traslapada el ${dto.fechaISO} a las ${dto.horaInicio}.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const cita = mapearCitaDTOADominio(dto, artista, this.secuenciaCita++);
        if (cita.estadoCita === 'PendienteDeposito') {
            this.advertencias.push(
                `Cita "${cita.codigoCita}" agendada como PendienteDeposito: abonado $${cita.depositoPagadoUSD.toFixed(2)} de $${cita.depositoMinimoRequeridoUSD.toFixed(2)} USD requeridos.`
            );
        }

        this.repoCitas.guardar(cita);
        return { ok: true, valor: cita };
    }

    public actualizarEstadoSesion(
        dto: ActualizarSesionTatuajeDTO
    ): ResultadoOperacion<CitaTatuajeDominio> {
        const codigoCitaNorm = dto.codigoCita.trim().toUpperCase();
        const cita = this.repoCitas.buscarUno((c) => c.codigoCita === codigoCitaNorm);

        if (!cita) {
            const msg = `No se encontró la cita "${codigoCitaNorm}" para actualizar sesión.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        if (cita.estadoCita === 'Cancelada') {
            const msg = `La cita "${codigoCitaNorm}" ya se encuentra cancelada y no puede modificarse.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        if (dto.accion === 'CancelarCita') {
            const cancelada: CitaTatuajeDominio = {
                ...cita,
                estadoCita: 'Cancelada'
            };
            this.repoCitas.guardar(cancelada);
            return { ok: true, valor: cancelada };
        }

        if (dto.accion === 'RegistrarAbonoDeposito') {
            const monto = dto.montoAbonoUSD ?? 0;
            if (monto <= 0) {
                const msg = `Monto de abono inválido ($${monto}) en cita "${codigoCitaNorm}".`;
                this.advertencias.push(msg);
                return { ok: false, errores: [msg] };
            }

            const nuevoDeposito = Number(
                Math.min(cita.costoTotalEstimadoUSD, cita.depositoPagadoUSD + monto).toFixed(2)
            );
            const nuevoSaldo = Number(
                Math.max(0, cita.costoTotalEstimadoUSD - nuevoDeposito).toFixed(2)
            );
            const nuevoEstado: EstadoCitaTatuaje =
                nuevoDeposito >= cita.depositoMinimoRequeridoUSD
                    ? 'Confirmada'
                    : 'PendienteDeposito';

            const actualizada: CitaTatuajeDominio = {
                ...cita,
                depositoPagadoUSD: nuevoDeposito,
                saldoPendienteUSD: nuevoSaldo,
                estadoCita: nuevoEstado
            };
            this.repoCitas.guardar(actualizada);
            return { ok: true, valor: actualizada };
        }

        // CompletarSesion
        if (cita.estadoCita === 'PendienteDeposito') {
            const msg = `No se puede completar la sesión "${codigoCitaNorm}" sin haber cubierto el depósito mínimo ($${cita.depositoMinimoRequeridoUSD.toFixed(2)} USD).`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const completada: CitaTatuajeDominio = {
            ...cita,
            depositoPagadoUSD: cita.costoTotalEstimadoUSD,
            saldoPendienteUSD: 0,
            estadoCita: 'Completada'
        };
        this.repoCitas.guardar(completada);
        return { ok: true, valor: completada };
    }

    public obtenerReporteFinal(): ReporteBookingTatuajes {
        return generarReporteBookingTatuajes(
            this.nombreEstudio,
            this.repoArtistas.obtenerTodos(),
            this.repoCitas.obtenerTodos(),
            this.advertencias
        );
    }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarReporteBookingTatuajes(
    reporte: ReporteBookingTatuajes,
    tituloCaso: string
): void {
    console.log(`\n======================================================================`);
    console.log(` BOOKING TATTOO APP - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Estudio             : ${reporte.nombreEstudio}`);
    console.log(`Reporte ID          : ${reporte.reporteId}`);
    console.log(`Artistas Activos    : ${reporte.totalArtistasActivos}`);
    console.log(`Sesiones Activas    : Confirmadas: ${reporte.citasConfirmadasCount} | Pend. Depósito: ${reporte.citasPendientesDepositoCount} | Completadas: ${reporte.citasCompletadasCount}`);
    console.log(`Finanzas Estudio    : Proyectado: $${reporte.ingresosTotalesProyectadosUSD.toFixed(2)} | Recaudado: $${reporte.depositosRecaudadosUSD.toFixed(2)} | Por Cobrar: $${reporte.saldoPorCobrarUSD.toFixed(2)}`);
    console.log(`Horas Agendadas     : ${reporte.horasTotalesAgendadas} h`);
    console.log(`Pieza Mayor Valor   : ${reporte.citaMayorValor ? `"${reporte.citaMayorValor.codigoCita}" - ${reporte.citaMayorValor.estilo} ($${reporte.citaMayorValor.costoTotalEstimadoUSD.toFixed(2)} USD)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (reporte.advertencias.length > 0) {
        console.log(`ALERTAS DE AGENDA, DEPÓSITOS Y VALIDACIÓN LEGAL (${reporte.advertencias.length}):`);
        reporte.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR ESTILO DE TATUAJE:`);
    Object.entries(reporte.desglosePorEstilo).forEach(([estilo, info]) => {
        console.log(
            `   - ${estilo.padEnd(16)}: ${info.totalCitas} citas | Horas: ${String(info.horasAgendadas).padStart(4)} h | Proyectado: $${info.ingresosProyectadosUSD.toFixed(2)}`
        );
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        reporte.agendaCitas.map((c) => ({
            Cita: c.codigoCita,
            Cliente: `${c.clienteNombre} (${c.clienteEdad}a)`,
            Tatuador: c.artistaNombre,
            Estilo: c.estilo,
            'Zona/Dur': `${c.zonaCuerpo} (${c.duracionHoras}h)`,
            FechaHora: `${c.fechaISO} ${c.horaInicio}`,
            'Total USD': `$${c.costoTotalEstimadoUSD.toFixed(2)}`,
            'Pagado/Saldo': `$${c.depositoPagadoUSD.toFixed(2)} / $${c.saldoPendienteUSD.toFixed(2)}`,
            Estado: c.estadoCita
        }))
    );
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite)

async function ejecutarPruebas(): Promise<void> {
    // Simulación de consulta inicial de disponibilidad del estudio
    await new Promise((resolve) => setTimeout(resolve, 10));

    // --- CASO 1: Estudio de Tatuajes con Reservas, Abonos y Cierre de Sesión (Caso Normal) ---
    const estudioNormal = new ServicioBookingTatuajes('Obsidian Ink Studio');

    estudioNormal.registrarArtista({
        codigoArtista: 'INK-VAL-01',
        nombreArtistico: 'Valeria Nox',
        especialidadPrincipal: 'Blackwork',
        tarifaHoraUSD: 140
    });

    estudioNormal.registrarArtista({
        codigoArtista: 'INK-KAI-02',
        nombreArtistico: 'Kaito Sato',
        especialidadPrincipal: 'JaponesIrezumi',
        tarifaHoraUSD: 180
    });

    estudioNormal.registrarArtista({
        codigoArtista: 'INK-MIA-03',
        nombreArtistico: 'Mía Delacroix',
        especialidadPrincipal: 'FineLine',
        tarifaHoraUSD: 120
    });

    // Sesión 1: Confirmada desde el inicio (depósito >= 30%)
    estudioNormal.agendarCitaTatuaje({
        codigoCita: 'TAT-2026-001',
        clienteNombre: 'José Rodríguez',
        clienteEdad: 29,
        codigoArtista: 'INK-VAL-01',
        estilo: 'Blackwork',
        zonaCuerpo: 'Antebrazo',
        tamano: 'Mediano',
        fechaISO: '2026-11-21',
        horaInicio: '10:00',
        duracionHoras: 3,
        depositoPagadoUSD: 150,
        consentimientoFirmado: true,
        notasDiseno: 'Geometría sagrada con puntillismo'
    });

    // Sesión 2: Inicia en PendienteDeposito y luego recibe abono para confirmarse
    estudioNormal.agendarCitaTatuaje({
        codigoCita: 'TAT-2026-002',
        clienteNombre: 'Sofía Castellanos',
        clienteEdad: 26,
        codigoArtista: 'INK-KAI-02',
        estilo: 'JaponesIrezumi',
        zonaCuerpo: 'Espalda',
        tamano: 'PiezaCompleta',
        fechaISO: '2026-11-21',
        horaInicio: '11:00',
        duracionHoras: 5,
        depositoPagadoUSD: 200, // Total: 180 * 5 * 1.1 = $990 -> 30% min = $297
        consentimientoFirmado: true,
        notasDiseno: 'Dragón Ryu y olas tradicionales - Sesión 1'
    });

    estudioNormal.actualizarEstadoSesion({
        codigoCita: 'TAT-2026-002',
        accion: 'RegistrarAbonoDeposito',
        montoAbonoUSD: 150
    });

    // Sesión 3: Confirmada y marcada como Completada
    estudioNormal.agendarCitaTatuaje({
        codigoCita: 'TAT-2026-003',
        clienteNombre: 'Daniela Herrera',
        clienteEdad: 31,
        codigoArtista: 'INK-MIA-03',
        estilo: 'FineLine',
        zonaCuerpo: 'Costillas',
        tamano: 'Mini',
        fechaISO: '2026-11-22',
        horaInicio: '15:00',
        duracionHoras: 2,
        depositoPagadoUSD: 100,
        consentimientoFirmado: true,
        notasDiseno: 'Botánica minimalista'
    });

    estudioNormal.actualizarEstadoSesion({
        codigoCita: 'TAT-2026-003',
        accion: 'CompletarSesion'
    });

    const reporteNormal = estudioNormal.obtenerReporteFinal();
    mostrarReporteBookingTatuajes(reporteNormal, 'Caso Normal - Agenda de Sesiones y Control de Depósitos');

    // --- CASO 2: Menor de Edad, Sin Consentimiento, Traslape Horario y Artista Inactivo (Caso Límite) ---
    const estudioLimite = new ServicioBookingTatuajes('Obsidian Ink Auditoría');

    estudioLimite.registrarArtista({
        codigoArtista: 'INK-MAX-10',
        nombreArtistico: 'Max Steel',
        especialidadPrincipal: 'Realismo',
        tarifaHoraUSD: 160,
        activoEnEstudio: true
    });

    estudioLimite.registrarArtista({
        codigoArtista: 'INK-INA-11',
        nombreArtistico: 'Leo Invitado',
        especialidadPrincipal: 'Tradicional',
        tarifaHoraUSD: 130,
        activoEnEstudio: false
    });

    // Cita base válida de 10:00 a 14:00 (4h)
    estudioLimite.agendarCitaTatuaje({
        codigoCita: 'TAT-LIM-01',
        clienteNombre: 'Carlos Méndez',
        clienteEdad: 34,
        codigoArtista: 'INK-MAX-10',
        estilo: 'Realismo',
        zonaCuerpo: 'BrazoCompleto',
        tamano: 'Grande',
        fechaISO: '2026-11-25',
        horaInicio: '10:00',
        duracionHoras: 4,
        depositoPagadoUSD: 250,
        consentimientoFirmado: true
    });

    // Intento de traslape horario con Max Steel el mismo día a las 12:30
    estudioLimite.agendarCitaTatuaje({
        codigoCita: 'TAT-LIM-02',
        clienteNombre: 'Laura Rivas',
        clienteEdad: 27,
        codigoArtista: 'INK-MAX-10',
        estilo: 'Realismo',
        zonaCuerpo: 'Pierna',
        tamano: 'Mediano',
        fechaISO: '2026-11-25',
        horaInicio: '12:30',
        duracionHoras: 3,
        depositoPagadoUSD: 200,
        consentimientoFirmado: true
    });

    // Intento de agendar cliente menor de edad (16 años) y sin consentimiento firmado
    estudioLimite.agendarCitaTatuaje({
        codigoCita: 'TAT-LIM-03',
        clienteNombre: 'Mateo Solís',
        clienteEdad: 16,
        codigoArtista: 'INK-MAX-10',
        estilo: 'Blackwork',
        zonaCuerpo: 'Antebrazo',
        tamano: 'Mini',
        fechaISO: '2026-11-26',
        horaInicio: '11:00',
        duracionHoras: 2,
        depositoPagadoUSD: 100,
        consentimientoFirmado: false
    });

    // Intento de reservar con tatuador inactivo en el estudio
    estudioLimite.agendarCitaTatuaje({
        codigoCita: 'TAT-LIM-04',
        clienteNombre: 'Andrea Paz',
        clienteEdad: 24,
        codigoArtista: 'INK-INA-11',
        estilo: 'Tradicional',
        zonaCuerpo: 'Pierna',
        tamano: 'Mediano',
        fechaISO: '2026-11-27',
        horaInicio: '14:00',
        duracionHoras: 2,
        depositoPagadoUSD: 100,
        consentimientoFirmado: true
    });

    const reporteLimite = estudioLimite.obtenerReporteFinal();
    mostrarReporteBookingTatuajes(reporteLimite, 'Caso Límite - Traslapes Horarios, Edad Legal y Artista Inactivo');
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecución:', err));