
// 1. CAPA DE DOMINIO Y DTOs (Data Transfer Objects)

export type ModalidadSalto =
    | 'Tandem'
    | 'AFF_Estudiante'
    | 'SoloDeportivo'
    | 'FormacionWingsuit';

export type NivelLicenciaParacaidismo =
    | 'SinLicencia'
    | 'LicenciaA'
    | 'LicenciaB'
    | 'LicenciaC'
    | 'LicenciaD';

export type EstadoCheckInSalto =
    | 'PendienteRevision'
    | 'AprobadoParaAbordaje'
    | 'RechazadoSeguridad'
    | 'AbordadoEnAeronave';

export type CondicionVientoDropzone =
    | 'CalmaOptima'
    | 'VientoModerado'
    | 'RafagasFuertes';

export interface ConfiguracionTandaVuelo {
    readonly codigoTanda: string;
    readonly aeronave: string;
    readonly altitudLanzamientoPies: number;
    readonly capacidadMaxSaltadores: number;
    readonly cargaUtilMaxKg: number;
    readonly condicionVientoActual: CondicionVientoDropzone;
}

export interface RegistroCheckInDominio {
    readonly id: string;
    readonly codigoPase: string;
    readonly nombreSaltador: string;
    readonly modalidad: ModalidadSalto;
    readonly licencia: NivelLicenciaParacaidismo;
    readonly saltosTotalesRegistrados: number;
    readonly pesoConEquipoKg: number;
    readonly diasDesdeReempaqueReserva: number;
    readonly aadEncendidoVerificado: boolean;
    readonly altimetroCalibrado: boolean;
    readonly exencionMedicaFirmada: boolean;
    readonly instructorAsignado: string | null;
    readonly estadoCheckIn: EstadoCheckInSalto;
    readonly observacionesSeguridad: readonly string[];
}

// DTO de entrada para registrar el check-in de un paracaidista
export interface CrearCheckInSaltoDTO {
    readonly codigoPase: string;
    readonly nombreSaltador: string;
    readonly modalidad: ModalidadSalto;
    readonly licencia: NivelLicenciaParacaidismo;
    readonly saltosTotalesRegistrados: number;
    readonly pesoCorporalkg: number;
    readonly pesoEquipoKg: number;
    readonly diasDesdeReempaqueReserva: number;
    readonly aadEncendidoVerificado: boolean;
    readonly altimetroCalibrado: boolean;
    readonly exencionMedicaFirmada: boolean;
    readonly instructorAsignado?: string;
}

// DTO de entrada para inspección física en línea de abordaje (Gear Check)
export interface InspeccionEquipoLineaDTO {
    readonly codigoPase: string;
    readonly aadEncendidoVerificado: boolean;
    readonly altimetroCalibrado: boolean;
    readonly diasDesdeReempaqueReserva?: number;
}

export type ResultadoOperacion<T> =
    | { readonly ok: true; readonly valor: T }
    | { readonly ok: false; readonly errores: readonly string[] };

export interface ResumenModalidadSalto {
    readonly totalRegistrados: number;
    readonly aprobadosCount: number;
    readonly rechazadosCount: number;
    readonly pesoPromedioKg: number;
}

export interface ReporteCheckInParacaidismo {
    readonly reporteId: string;
    readonly configuracionTanda: ConfiguracionTandaVuelo;
    readonly totalCheckInsProcesados: number;
    readonly aprobadosParaAbordajeCount: number;
    readonly rechazadosSeguridadCount: number;
    readonly ocupacionAeronavePct: number;
    readonly pesoTotalAbordajeKg: number;
    readonly margenCargaDisponibleKg: number;
    readonly saltadorMayorExperiencia: RegistroCheckInDominio | null;
    readonly desglosePorModalidad: Readonly<Record<ModalidadSalto, ResumenModalidadSalto>>;
    readonly manifiestoSaltadores: readonly RegistroCheckInDominio[];
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

// 3. VALIDACIONES Y REGLAS DE SEGURIDAD AERONÁUTICA

const MODALIDADES_SALTO: readonly ModalidadSalto[] = [
    'Tandem',
    'AFF_Estudiante',
    'SoloDeportivo',
    'FormacionWingsuit'
];

const RANGO_LICENCIA: Readonly<Record<NivelLicenciaParacaidismo, number>> = {
    SinLicencia: 0,
    LicenciaA: 1,
    LicenciaB: 2,
    LicenciaC: 3,
    LicenciaD: 4
};

const MAX_DIAS_REEMPAQUE_RESERVA = 180;
const PESO_MAX_TANDEM_KG = 112;
const PESO_MAX_GENERAL_KG = 128;

export function validarDatosBasicosDTO(
    dto: CrearCheckInSaltoDTO
): ResultadoOperacion<CrearCheckInSaltoDTO> {
    const errores: string[] = [];

    if (dto.codigoPase.trim().length < 4) {
        errores.push(`Código de pase inválido ("${dto.codigoPase}"): mínimo 4 caracteres.`);
    }

    if (dto.nombreSaltador.trim().length < 3) {
        errores.push(`El nombre del saltador ("${dto.nombreSaltador}") es obligatorio.`);
    }

    if (dto.saltosTotalesRegistrados < 0 || !Number.isInteger(dto.saltosTotalesRegistrados)) {
        errores.push(
            `Número de saltos inválido (${dto.saltosTotalesRegistrados}) para "${dto.nombreSaltador}".`
        );
    }

    if (dto.pesoCorporalkg <= 35 || dto.pesoCorporalkg > 160) {
        errores.push(
            `Peso corporal fuera de rango operativo (${dto.pesoCorporalkg} kg) para "${dto.nombreSaltador}".`
        );
    }

    if (dto.pesoEquipoKg <= 0 || dto.pesoEquipoKg > 35) {
        errores.push(
            `Peso de equipo paracaídas inválido (${dto.pesoEquipoKg} kg) para "${dto.nombreSaltador}".`
        );
    }

    if (dto.diasDesdeReempaqueReserva < 0) {
        errores.push(
            `Días desde reempaque de reserva negativos (${dto.diasDesdeReempaqueReserva}) en "${dto.nombreSaltador}".`
        );
    }

    return errores.length === 0
        ? { ok: true, valor: dto }
        : { ok: false, errores };
}

export function evaluarSeguridadCheckIn(
    dto: CrearCheckInSaltoDTO,
    tanda: ConfiguracionTandaVuelo
): { readonly aprobado: boolean; readonly observaciones: readonly string[] } {
    const observaciones: string[] = [];
    const pesoTotalKg = Number((dto.pesoCorporalkg + dto.pesoEquipoKg).toFixed(1));

    if (!dto.exencionMedicaFirmada) {
        observaciones.push('Falta firma de exención de responsabilidad y aptitud médica.');
    }

    if (dto.diasDesdeReempaqueReserva > MAX_DIAS_REEMPAQUE_RESERVA) {
        observaciones.push(
            `Paracaídas de reserva vencido (${dto.diasDesdeReempaqueReserva} días > máximo ${MAX_DIAS_REEMPAQUE_RESERVA} días).`
        );
    }

    if (!dto.aadEncendidoVerificado) {
        observaciones.push('Dispositivo de Activación Automática (AAD) apagado o sin verificar.');
    }

    if (!dto.altimetroCalibrado) {
        observaciones.push('Altímetro principal no calibrado a cero en dropzone.');
    }

    // Validaciones por modalidad y licencia
    if (dto.modalidad === 'Tandem') {
        if (pesoTotalKg > PESO_MAX_TANDEM_KG) {
            observaciones.push(
                `Peso total (${pesoTotalKg} kg) excede el límite estructural del arnés Tandem (${PESO_MAX_TANDEM_KG} kg).`
            );
        }
        if (!dto.instructorAsignado || dto.instructorAsignado.trim().length < 3) {
            observaciones.push('Salto Tandem requiere un instructor certificado asignado.');
        }
    } else if (dto.modalidad === 'AFF_Estudiante') {
        if (!dto.instructorAsignado || dto.instructorAsignado.trim().length < 3) {
            observaciones.push('Estudiante AFF requiere instructor supervisor asignado.');
        }
        if (tanda.condicionVientoActual !== 'CalmaOptima') {
            observaciones.push(
                `Condición de viento (${tanda.condicionVientoActual}) no permitida para estudiantes AFF.`
            );
        }
    } else if (dto.modalidad === 'SoloDeportivo') {
        if (RANGO_LICENCIA[dto.licencia] < RANGO_LICENCIA.LicenciaA) {
            observaciones.push(
                `Modalidad SoloDeportivo requiere mínimo Licencia A (actual: ${dto.licencia}).`
            );
        }
    } else if (dto.modalidad === 'FormacionWingsuit') {
        if (
            RANGO_LICENCIA[dto.licencia] < RANGO_LICENCIA.LicenciaC ||
            dto.saltosTotalesRegistrados < 200
        ) {
            observaciones.push(
                `Formación Wingsuit exige Licencia C y 200+ saltos (actual: ${dto.licencia}, ${dto.saltosTotalesRegistrados} saltos).`
            );
        }
    }

    if (pesoTotalKg > PESO_MAX_GENERAL_KG) {
        observaciones.push(`Peso total (${pesoTotalKg} kg) supera límite general de arnés (${PESO_MAX_GENERAL_KG} kg).`);
    }

    if (tanda.condicionVientoActual === 'RafagasFuertes' && RANGO_LICENCIA[dto.licencia] < RANGO_LICENCIA.LicenciaD) {
        observaciones.push('Ráfagas fuertes en tierra: solo saltadores con Licencia D autorizados.');
    }

    return {
        aprobado: observaciones.length === 0,
        observaciones
    };
}

export function mapearCheckInDTOADominio(
    dto: CrearCheckInSaltoDTO,
    tanda: ConfiguracionTandaVuelo,
    secuencia: number
): RegistroCheckInDominio {
    const codigoLimpio = dto.codigoPase.trim().toUpperCase();
    const evaluacion = evaluarSeguridadCheckIn(dto, tanda);
    const pesoConEquipoKg = Number((dto.pesoCorporalkg + dto.pesoEquipoKg).toFixed(1));

    return {
        id: `chk-${codigoLimpio}-${secuencia}`,
        codigoPase: codigoLimpio,
        nombreSaltador: dto.nombreSaltador.trim(),
        modalidad: dto.modalidad,
        licencia: dto.licencia,
        saltosTotalesRegistrados: dto.saltosTotalesRegistrados,
        pesoConEquipoKg,
        diasDesdeReempaqueReserva: dto.diasDesdeReempaqueReserva,
        aadEncendidoVerificado: dto.aadEncendidoVerificado,
        altimetroCalibrado: dto.altimetroCalibrado,
        exencionMedicaFirmada: dto.exencionMedicaFirmada,
        instructorAsignado: dto.instructorAsignado?.trim() ?? null,
        estadoCheckIn: evaluacion.aprobado ? 'AprobadoParaAbordaje' : 'RechazadoSeguridad',
        observacionesSeguridad: evaluacion.observaciones
    };
}

// 4. GENERACIÓN DE REPORTES Y SERVICIO DE CHECK-IN DE PARACAIDISMO

export function generarReporteCheckInSalto(
    tanda: ConfiguracionTandaVuelo,
    registros: readonly RegistroCheckInDominio[],
    advertencias: readonly string[]
): ReporteCheckInParacaidismo {
    const aprobados = registros.filter(
        (r) =>
            r.estadoCheckIn === 'AprobadoParaAbordaje' ||
            r.estadoCheckIn === 'AbordadoEnAeronave'
    );
    const rechazados = registros.filter(
        (r) => r.estadoCheckIn === 'RechazadoSeguridad'
    );

    const ocupacionAeronavePct =
        tanda.capacidadMaxSaltadores > 0
            ? Number(
                ((aprobados.length / tanda.capacidadMaxSaltadores) * 100).toFixed(1)
            )
            : 0;

    const pesoTotalAbordajeKg = Number(
        aprobados.reduce((acc, r) => acc + r.pesoConEquipoKg, 0).toFixed(1)
    );

    const margenCargaDisponibleKg = Number(
        (tanda.cargaUtilMaxKg - pesoTotalAbordajeKg).toFixed(1)
    );

    const saltadorMayorExperiencia =
        [...aprobados].sort(
            (a, b) => b.saltosTotalesRegistrados - a.saltosTotalesRegistrados
        )[0] ?? null;

    const desglosePorModalidad = MODALIDADES_SALTO.reduce((acc, mod) => {
        const delGrupo = registros.filter((r) => r.modalidad === mod);
        const aprobadosCount = delGrupo.filter(
            (r) =>
                r.estadoCheckIn === 'AprobadoParaAbordaje' ||
                r.estadoCheckIn === 'AbordadoEnAeronave'
        ).length;
        const rechazadosCount = delGrupo.filter(
            (r) => r.estadoCheckIn === 'RechazadoSeguridad'
        ).length;
        const pesoPromedioKg =
            delGrupo.length > 0
                ? Number(
                    (
                        delGrupo.reduce((s, r) => s + r.pesoConEquipoKg, 0) /
                        delGrupo.length
                    ).toFixed(1)
                )
                : 0;

        acc[mod] = {
            totalRegistrados: delGrupo.length,
            aprobadosCount,
            rechazadosCount,
            pesoPromedioKg
        };
        return acc;
    }, {} as Record<ModalidadSalto, ResumenModalidadSalto>);

    return {
        reporteId: `REP-SKY-${Date.now()}`,
        configuracionTanda: tanda,
        totalCheckInsProcesados: registros.length,
        aprobadosParaAbordajeCount: aprobados.length,
        rechazadosSeguridadCount: rechazados.length,
        ocupacionAeronavePct,
        pesoTotalAbordajeKg,
        margenCargaDisponibleKg,
        saltadorMayorExperiencia,
        desglosePorModalidad,
        manifiestoSaltadores: registros,
        advertencias
    };
}

export class ServicioCheckInParacaidismo {
    private readonly repoCheckIns = new RepositorioEnMemoria<RegistroCheckInDominio>();
    private readonly advertencias: string[] = [];
    private secuenciaCheckIn = 1;

    constructor(private readonly tandaVuelo: ConfiguracionTandaVuelo) { }

    public registrarCheckInSaltador(
        dto: CrearCheckInSaltoDTO
    ): ResultadoOperacion<RegistroCheckInDominio> {
        const validacion = validarDatosBasicosDTO(dto);
        if (!validacion.ok) {
            this.advertencias.push(...validacion.errores);
            return validacion;
        }

        const codigoNormalizado = dto.codigoPase.trim().toUpperCase();
        const duplicado = this.repoCheckIns.buscarUno(
            (r) => r.codigoPase === codigoNormalizado
        );
        if (duplicado) {
            const msg = `Pase de abordaje duplicado: "${codigoNormalizado}" ("${dto.nombreSaltador}") ya está en el manifiesto.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const registro = mapearCheckInDTOADominio(
            dto,
            this.tandaVuelo,
            this.secuenciaCheckIn++
        );

        if (registro.estadoCheckIn === 'AprobadoParaAbordaje') {
            const aprobadosActuales = this.repoCheckIns
                .obtenerTodos()
                .filter((r) => r.estadoCheckIn === 'AprobadoParaAbordaje');

            if (aprobadosActuales.length >= this.tandaVuelo.capacidadMaxSaltadores) {
                const msg = `Aeronave llena (${this.tandaVuelo.capacidadMaxSaltadores} plazas): "${registro.nombreSaltador}" movido a RechazadoSeguridad por cupo.`;
                this.advertencias.push(msg);
                const rechazadoPorCupo: RegistroCheckInDominio = {
                    ...registro,
                    estadoCheckIn: 'RechazadoSeguridad',
                    observacionesSeguridad: [...registro.observacionesSeguridad, msg]
                };
                this.repoCheckIns.guardar(rechazadoPorCupo);
                return { ok: true, valor: rechazadoPorCupo };
            }

            const pesoAcumulado = aprobadosActuales.reduce(
                (acc, r) => acc + r.pesoConEquipoKg,
                0
            );
            if (pesoAcumulado + registro.pesoConEquipoKg > this.tandaVuelo.cargaUtilMaxKg) {
                const msg = `Exceso de carga útil en ${this.tandaVuelo.aeronave} (Max: ${this.tandaVuelo.cargaUtilMaxKg} kg): "${registro.nombreSaltador}" no puede abordar esta tanda.`;
                this.advertencias.push(msg);
                const rechazadoPorPeso: RegistroCheckInDominio = {
                    ...registro,
                    estadoCheckIn: 'RechazadoSeguridad',
                    observacionesSeguridad: [...registro.observacionesSeguridad, msg]
                };
                this.repoCheckIns.guardar(rechazadoPorPeso);
                return { ok: true, valor: rechazadoPorPeso };
            }
        } else {
            this.advertencias.push(
                `Check-in rechazado para "${registro.nombreSaltador}" (${registro.codigoPase}): ${registro.observacionesSeguridad.join(' | ')}`
            );
        }

        this.repoCheckIns.guardar(registro);
        return { ok: true, valor: registro };
    }

    public ejecutarGearCheckPreAbordaje(
        dto: InspeccionEquipoLineaDTO
    ): ResultadoOperacion<RegistroCheckInDominio> {
        const codigoNormalizado = dto.codigoPase.trim().toUpperCase();
        const registro = this.repoCheckIns.buscarUno(
            (r) => r.codigoPase === codigoNormalizado
        );

        if (!registro) {
            const msg = `No se encontró pase "${codigoNormalizado}" durante el Gear Check en pista.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const diasReserva =
            dto.diasDesdeReempaqueReserva ?? registro.diasDesdeReempaqueReserva;
        const fallosLinea: string[] = [];

        if (!dto.aadEncendidoVerificado) {
            fallosLinea.push('AAD apagado detectado en revisión física de pista.');
        }
        if (!dto.altimetroCalibrado) {
            fallosLinea.push('Altímetro descalibrado detectado antes de abordar.');
        }
        if (diasReserva > MAX_DIAS_REEMPAQUE_RESERVA) {
            fallosLinea.push(`Tarjeta de reserva vencida (${diasReserva} días).`);
        }

        if (fallosLinea.length > 0) {
            this.advertencias.push(
                `ALERTA GEAR CHECK "${registro.nombreSaltador}": ${fallosLinea.join(' | ')}`
            );
            const actualizado: RegistroCheckInDominio = {
                ...registro,
                aadEncendidoVerificado: dto.aadEncendidoVerificado,
                altimetroCalibrado: dto.altimetroCalibrado,
                diasDesdeReempaqueReserva: diasReserva,
                estadoCheckIn: 'RechazadoSeguridad',
                observacionesSeguridad: [...registro.observacionesSeguridad, ...fallosLinea]
            };
            this.repoCheckIns.guardar(actualizado);
            return { ok: true, valor: actualizado };
        }

        const abordado: RegistroCheckInDominio = {
            ...registro,
            aadEncendidoVerificado: true,
            altimetroCalibrado: true,
            diasDesdeReempaqueReserva: diasReserva,
            estadoCheckIn: 'AbordadoEnAeronave'
        };
        this.repoCheckIns.guardar(abordado);
        return { ok: true, valor: abordado };
    }

    public obtenerReporteFinal(): ReporteCheckInParacaidismo {
        return generarReporteCheckInSalto(
            this.tandaVuelo,
            this.repoCheckIns.obtenerTodos(),
            this.advertencias
        );
    }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarReporteParacaidismo(
    reporte: ReporteCheckInParacaidismo,
    tituloCaso: string
): void {
    const { configuracionTanda: tanda } = reporte;
    console.log(`\n======================================================================`);
    console.log(` CHECK-IN DE SALTO EN PARACAIDISMO - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Tanda / Aeronave    : ${tanda.codigoTanda} | ${tanda.aeronave} (${tanda.altitudLanzamientoPies} ft)`);
    console.log(`Meteorología        : ${tanda.condicionVientoActual}`);
    console.log(`Manifiesto          : ${reporte.aprobadosParaAbordajeCount} aprobados / ${reporte.rechazadosSeguridadCount} rechazados (${reporte.ocupacionAeronavePct}% ocupación)`);
    console.log(`Balance de Peso     : ${reporte.pesoTotalAbordajeKg} kg / ${tanda.cargaUtilMaxKg} kg (Margen: ${reporte.margenCargaDisponibleKg} kg)`);
    console.log(`Mayor Experiencia   : ${reporte.saltadorMayorExperiencia ? `${reporte.saltadorMayorExperiencia.nombreSaltador} (${reporte.saltadorMayorExperiencia.saltosTotalesRegistrados} saltos - ${reporte.saltadorMayorExperiencia.licencia})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (reporte.advertencias.length > 0) {
        console.log(`ALERTAS DE SEGURIDAD Y CONTROL DE MANIFIESTO (${reporte.advertencias.length}):`);
        reporte.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR MODALIDAD DE SALTO:`);
    Object.entries(reporte.desglosePorModalidad).forEach(([mod, info]) => {
        console.log(
            `   - ${mod.padEnd(20)}: ${info.totalRegistrados} reg. | Aprob: ${info.aprobadosCount} | Rech: ${info.rechazadosCount} | Peso Prom: ${info.pesoPromedioKg} kg`
        );
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        reporte.manifiestoSaltadores.map((s) => ({
            Pase: s.codigoPase,
            Saltador: s.nombreSaltador,
            Modalidad: s.modalidad,
            Licencia: `${s.licencia} (${s.saltosTotalesRegistrados})`,
            'Peso Total': `${s.pesoConEquipoKg} kg`,
            'Reserva (días)': `${s.diasDesdeReempaqueReserva} d`,
            Estado: s.estadoCheckIn,
            Observaciones: s.observacionesSeguridad[0] ?? 'OK - Apto para salto'
        }))
    );
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite)

async function ejecutarPruebas(): Promise<void> {
    // Simulación de consulta asíncrona a estación meteorológica del aeródromo
    await new Promise((resolve) => setTimeout(resolve, 10));

    // --- CASO 1: Manifiesto Operativo Completo en Cessna Caravan (Caso Normal) ---
    const tandaNormal: ConfiguracionTandaVuelo = {
        codigoTanda: 'LOAD-04-IZTAPA',
        aeronave: 'Cessna 208B Grand Caravan',
        altitudLanzamientoPies: 13500,
        capacidadMaxSaltadores: 14,
        cargaUtilMaxKg: 1350,
        condicionVientoActual: 'CalmaOptima'
    };

    const servicioNormal = new ServicioCheckInParacaidismo(tandaNormal);

    servicioNormal.registrarCheckInSaltador({
        codigoPase: 'SKY-101',
        nombreSaltador: 'José Rodríguez',
        modalidad: 'SoloDeportivo',
        licencia: 'LicenciaB',
        saltosTotalesRegistrados: 115,
        pesoCorporalkg: 78,
        pesoEquipoKg: 11.5,
        diasDesdeReempaqueReserva: 45,
        aadEncendidoVerificado: true,
        altimetroCalibrado: true,
        exencionMedicaFirmada: true
    });

    servicioNormal.registrarCheckInSaltador({
        codigoPase: 'SKY-102',
        nombreSaltador: 'Camila Mendoza',
        modalidad: 'FormacionWingsuit',
        licencia: 'LicenciaD',
        saltosTotalesRegistrados: 640,
        pesoCorporalkg: 62,
        pesoEquipoKg: 12.0,
        diasDesdeReempaqueReserva: 90,
        aadEncendidoVerificado: true,
        altimetroCalibrado: true,
        exencionMedicaFirmada: true
    });

    servicioNormal.registrarCheckInSaltador({
        codigoPase: 'SKY-103',
        nombreSaltador: 'Andrés Morales',
        modalidad: 'AFF_Estudiante',
        licencia: 'SinLicencia',
        saltosTotalesRegistrados: 4,
        pesoCorporalkg: 74,
        pesoEquipoKg: 13.5,
        diasDesdeReempaqueReserva: 30,
        aadEncendidoVerificado: true,
        altimetroCalibrado: true,
        exencionMedicaFirmada: true,
        instructorAsignado: 'Capt. Roberto Silva'
    });

    servicioNormal.registrarCheckInSaltador({
        codigoPase: 'SKY-104',
        nombreSaltador: 'Valeria Castillo',
        modalidad: 'Tandem',
        licencia: 'SinLicencia',
        saltosTotalesRegistrados: 0,
        pesoCorporalkg: 58,
        pesoEquipoKg: 18.0,
        diasDesdeReempaqueReserva: 60,
        aadEncendidoVerificado: true,
        altimetroCalibrado: true,
        exencionMedicaFirmada: true,
        instructorAsignado: 'T.I. Diego Morales'
    });

    // Verificación física final antes de subir al avión (Gear Check)
    servicioNormal.ejecutarGearCheckPreAbordaje({
        codigoPase: 'SKY-101',
        aadEncendidoVerificado: true,
        altimetroCalibrado: true
    });
    servicioNormal.ejecutarGearCheckPreAbordaje({
        codigoPase: 'SKY-102',
        aadEncendidoVerificado: true,
        altimetroCalibrado: true
    });

    const reporteNormal = servicioNormal.obtenerReporteFinal();
    mostrarReporteParacaidismo(reporteNormal, 'Caso Normal - Tanda Matutina 13,500 ft');

    // --- CASO 2: Reserva Vencida, Licencia Insuficiente, Exceso de Carga y DTO Inválido (Caso Límite) ---
    const tandaLimite: ConfiguracionTandaVuelo = {
        codigoTanda: 'LOAD-09-TARDE',
        aeronave: 'Cessna 182 Skylane',
        altitudLanzamientoPies: 10500,
        capacidadMaxSaltadores: 2,
        cargaUtilMaxKg: 190,
        condicionVientoActual: 'VientoModerado'
    };

    const servicioLimite = new ServicioCheckInParacaidismo(tandaLimite);

    // Saltador válido que ocupa 95 kg de los 190 kg máximos
    servicioLimite.registrarCheckInSaltador({
        codigoPase: 'SKY-201',
        nombreSaltador: 'Fernando Gómez',
        modalidad: 'SoloDeportivo',
        licencia: 'LicenciaC',
        saltosTotalesRegistrados: 310,
        pesoCorporalkg: 83,
        pesoEquipoKg: 12.0,
        diasDesdeReempaqueReserva: 110,
        aadEncendidoVerificado: true,
        altimetroCalibrado: true,
        exencionMedicaFirmada: true
    });

    // Segundo saltador válido pero excede la carga útil restante (95 + 104 = 199 kg > 190 kg)
    servicioLimite.registrarCheckInSaltador({
        codigoPase: 'SKY-202',
        nombreSaltador: 'Héctor Navarro',
        modalidad: 'SoloDeportivo',
        licencia: 'LicenciaB',
        saltosTotalesRegistrados: 150,
        pesoCorporalkg: 91,
        pesoEquipoKg: 13.0,
        diasDesdeReempaqueReserva: 50,
        aadEncendidoVerificado: true,
        altimetroCalibrado: true,
        exencionMedicaFirmada: true
    });

    // Rechazo de seguridad: Reserva vencida (210 días), AAD apagado y Licencia insuficiente para Wingsuit
    servicioLimite.registrarCheckInSaltador({
        codigoPase: 'SKY-203',
        nombreSaltador: 'Lucas Pérez',
        modalidad: 'FormacionWingsuit',
        licencia: 'LicenciaA',
        saltosTotalesRegistrados: 45,
        pesoCorporalkg: 76,
        pesoEquipoKg: 12.5,
        diasDesdeReempaqueReserva: 210,
        aadEncendidoVerificado: false,
        altimetroCalibrado: false,
        exencionMedicaFirmada: false
    });

    // Intento de registrar pase duplicado
    servicioLimite.registrarCheckInSaltador({
        codigoPase: 'SKY-201',
        nombreSaltador: 'Fernando Gómez Duplicado',
        modalidad: 'SoloDeportivo',
        licencia: 'LicenciaC',
        saltosTotalesRegistrados: 310,
        pesoCorporalkg: 83,
        pesoEquipoKg: 12.0,
        diasDesdeReempaqueReserva: 110,
        aadEncendidoVerificado: true,
        altimetroCalibrado: true,
        exencionMedicaFirmada: true
    });

    // Intento de registrar DTO corrupto
    servicioLimite.registrarCheckInSaltador({
        codigoPase: 'X',
        nombreSaltador: '',
        modalidad: 'Tandem',
        licencia: 'SinLicencia',
        saltosTotalesRegistrados: -5,
        pesoCorporalkg: 250,
        pesoEquipoKg: -2,
        diasDesdeReempaqueReserva: -10,
        aadEncendidoVerificado: true,
        altimetroCalibrado: true,
        exencionMedicaFirmada: true
    });

    const reporteLimite = servicioLimite.obtenerReporteFinal();
    mostrarReporteParacaidismo(reporteLimite, 'Caso Límite - Reserva Vencida, Exceso de Carga y DTO Corrupto');
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecución:', err));