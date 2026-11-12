
// 1. MODELADO DEL DOMINIO CON UNIONES DISCRIMINADAS (Discriminated Unions)

export type FormatoProyeccion =
    | '2D_Digital'
    | '3D_RealD'
    | 'IMAX_Laser'
    | '4DX_Motion';

export type ClasificacionPelicula =
    | 'A_TodoPublico'
    | 'B_Mayores12'
    | 'B15_Mayores15'
    | 'C_Adultos18';

export type TipoAsientoSala =
    | 'Estandar'
    | 'VIP_Reclinable'
    | 'Preferencial_Accesible';

export type EstadoAsiento =
    | 'Disponible'
    | 'SeleccionadoDOM'
    | 'ReservadoConfirmado'
    | 'BloqueadoMantenimiento';

export interface PeliculaCartelera {
    readonly id: string;
    readonly codigoPelicula: string;
    readonly titulo: string;
    readonly director: string;
    readonly duracionMinutos: number;
    readonly clasificacion: ClasificacionPelicula;
    readonly formato: FormatoProyeccion;
}

export interface AsientoSalaDOM {
    readonly codigoAsiento: string;
    readonly fila: string;
    readonly columna: number;
    readonly tipo: TipoAsientoSala;
    readonly precioBaseUSD: number;
    readonly estado: EstadoAsiento;
}

export interface ConfiguracionFuncionCine {
    readonly id: string;
    readonly codigoFuncion: string;
    readonly pelicula: PeliculaCartelera;
    readonly numeroSala: number;
    readonly horarioISO: string;
    readonly limiteAsientosPorReserva: number;
    readonly asientosIniciales: readonly AsientoSalaDOM[];
}

// Discriminated Unions para el Estado de la Reserva DOM (State Machine)
export type EstadoReservaCineDOM =
    | {
        readonly fase: 'SeleccionandoAsientos';
        readonly asientosSala: readonly AsientoSalaDOM[];
        readonly asientosSeleccionadosCodigos: readonly string[];
        readonly subtotalUSD: number;
        readonly cargoServicioUSD: number;
        readonly totalPagarUSD: number;
        readonly ultimoMensajeDOM: string;
    }
    | {
        readonly fase: 'ConfirmandoPago';
        readonly asientosSala: readonly AsientoSalaDOM[];
        readonly asientosSeleccionadosCodigos: readonly string[];
        readonly clienteNombre: string;
        readonly clienteEdad: number;
        readonly subtotalUSD: number;
        readonly cargoServicioUSD: number;
        readonly totalPagarUSD: number;
        readonly ultimoMensajeDOM: string;
    }
    | {
        readonly fase: 'ReservaConfirmada';
        readonly codigoBoletoQR: string;
        readonly asientosSala: readonly AsientoSalaDOM[];
        readonly asientosConfirmadosCodigos: readonly string[];
        readonly clienteNombre: string;
        readonly totalPagadoUSD: number;
        readonly ultimoMensajeDOM: string;
    }
    | {
        readonly fase: 'ReservaCancelada';
        readonly asientosSala: readonly AsientoSalaDOM[];
        readonly motivoCancelacion: string;
        readonly ultimoMensajeDOM: string;
    };

// Discriminated Unions para los Eventos DOM / Acciones del Reducer
export type AccionReservaCineDOM =
    | { readonly tipo: 'DOM_CLICK_ALTERNAR_ASIENTO'; readonly codigoAsiento: string }
    | { readonly tipo: 'DOM_CLICK_LIMPIAR_SELECCION' }
    | {
        readonly tipo: 'DOM_SUBMIT_INICIAR_CHECKOUT';
        readonly clienteNombre: string;
        readonly clienteEdad: number;
    }
    | { readonly tipo: 'DOM_CLICK_CONFIRMAR_PAGO'; readonly metodoPago: 'Tarjeta' | 'WalletDigital' }
    | { readonly tipo: 'DOM_CLICK_CANCELAR_RESERVA'; readonly motivo: string };

// Snapshot tipado del estado visual renderizable en el DOM
export interface VistaSalaCineDOM {
    readonly contenedorSelector: string;
    readonly tituloFuncionDOM: string;
    readonly mapaAsientosTexto: string;
    readonly contadorSeleccionadosTexto: string;
    readonly totalFormateadoDOM: string;
    readonly alertaBannerDOM: string;
    readonly botonConfirmarHabilitado: boolean;
}

export interface ResultadoFuncionCine {
    readonly id: string;
    readonly configuracion: ConfiguracionFuncionCine;
    readonly totalAsientosSala: number;
    readonly asientosConfirmadosCount: number;
    readonly porcentajeOcupacion: number;
    readonly ingresosGeneradosUSD: number;
    readonly vistaFinalDOM: VistaSalaCineDOM;
    readonly estadoFinal: EstadoReservaCineDOM;
}

export interface MetricasCarteleraCine {
    readonly totalFuncionesProcesadas: number;
    readonly reservasConfirmadasCount: number;
    readonly reservasCanceladasOIncompletasCount: number;
    readonly totalBoletosVendidos: number;
    readonly ingresosTotalesUSD: number;
    readonly ocupacionPromedioPct: number;
    readonly funcionMayorRecaudacion: ResultadoFuncionCine | null;
    readonly desglosePorFormato: Readonly<Record<FormatoProyeccion, number>>;
}

export interface ResumenReservasCineDOM {
    readonly ejecucionId: string;
    readonly totalFuncionesValidas: number;
    readonly metricas: MetricasCarteleraCine;
    readonly funcionesProcesadas: readonly ResultadoFuncionCine[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO DE FUNCIONES (Generics & Encapsulamiento)

export class ContenedorFuncionesCine<T extends { readonly id: string }> {
    private readonly elementos: Map<string, T> = new Map();

    public agregar(item: T): boolean {
        if (this.elementos.has(item.id)) {
            return false;
        }
        this.elementos.set(item.id, item);
        return true;
    }

    public obtenerPorId(id: string): T | undefined {
        return this.elementos.get(id);
    }

    public obtenerTodos(): readonly T[] {
        return Array.from(this.elementos.values());
    }

    public existe(id: string): boolean {
        return this.elementos.has(id);
    }

    public obtenerTamano(): number {
        return this.elementos.size;
    }
}

// 3. VALIDACIONES Y REGLAS DE NEGOCIO DE CINE

export function validarConfiguracionFuncion(
    config: ConfiguracionFuncionCine
): ResultadoValidacion<ConfiguracionFuncionCine> {
    const errores: string[] = [];

    if (config.pelicula.titulo.trim().length === 0) {
        errores.push(`La función "${config.codigoFuncion}" debe especificar un título de película válido.`);
    }

    if (config.pelicula.duracionMinutos <= 0 || config.pelicula.duracionMinutos > 300) {
        errores.push(
            `Duración de película fuera de rango (${config.pelicula.duracionMinutos} min) en "${config.pelicula.titulo}".`
        );
    }

    if (config.numeroSala <= 0 || config.numeroSala > 30) {
        errores.push(`Número de sala inválido (${config.numeroSala}) en "${config.codigoFuncion}".`);
    }

    if (config.limiteAsientosPorReserva <= 0 || config.limiteAsientosPorReserva > 10) {
        errores.push(
            `Límite de asientos por reserva fuera de política (${config.limiteAsientosPorReserva}) en "${config.codigoFuncion}".`
        );
    }

    if (config.asientosIniciales.length === 0) {
        errores.push(`La sala ${config.numeroSala} de "${config.codigoFuncion}" no tiene mapa de asientos cargado.`);
    }

    const codigosAsientos = new Set<string>();
    for (const asiento of config.asientosIniciales) {
        if (asiento.precioBaseUSD <= 0) {
            errores.push(`Precio negativo o cero ($${asiento.precioBaseUSD}) en asiento ${asiento.codigoAsiento}.`);
        }
        if (codigosAsientos.has(asiento.codigoAsiento)) {
            errores.push(`Asiento duplicado "${asiento.codigoAsiento}" en la sala ${config.numeroSala}.`);
        }
        codigosAsientos.add(asiento.codigoAsiento);
    }

    return errores.length === 0
        ? { esValido: true, datos: config }
        : { esValido: false, errores };
}

export function validarEdadParaClasificacion(
    edad: number,
    clasificacion: ClasificacionPelicula
): boolean {
    switch (clasificacion) {
        case 'A_TodoPublico':
            return edad >= 0;
        case 'B_Mayores12':
            return edad >= 12;
        case 'B15_Mayores15':
            return edad >= 15;
        case 'C_Adultos18':
            return edad >= 18;
    }
}

// 4. CÁLCULO DE TARIFAS Y REDUCER DE INTERACCIÓN DOM

const RECARGO_FORMATO_USD: Readonly<Record<FormatoProyeccion, number>> = {
    '2D_Digital': 0,
    '3D_RealD': 2.5,
    'IMAX_Laser': 5.0,
    '4DX_Motion': 7.5
};

function recalcularTotalesSeleccion(
    asientos: readonly AsientoSalaDOM[],
    codigosSeleccionados: readonly string[],
    formato: FormatoProyeccion
): { readonly subtotalUSD: number; readonly cargoServicioUSD: number; readonly totalPagarUSD: number } {
    const recargoFormato = RECARGO_FORMATO_USD[formato];
    const subtotalUSD = Number(
        codigosSeleccionados
            .reduce((acc, codigo) => {
                const asiento = asientos.find((a) => a.codigoAsiento === codigo);
                return asiento ? acc + asiento.precioBaseUSD + recargoFormato : acc;
            }, 0)
            .toFixed(2)
    );

    const cargoServicioUSD = Number((subtotalUSD * 0.08).toFixed(2));
    const totalPagarUSD = Number((subtotalUSD + cargoServicioUSD).toFixed(2));

    return { subtotalUSD, cargoServicioUSD, totalPagarUSD };
}

export function reducerReservaCineDOM(
    estadoActual: EstadoReservaCineDOM,
    accion: AccionReservaCineDOM,
    config: ConfiguracionFuncionCine
): EstadoReservaCineDOM {
    switch (accion.tipo) {
        case 'DOM_CLICK_ALTERNAR_ASIENTO': {
            if (estadoActual.fase !== 'SeleccionandoAsientos') {
                return estadoActual;
            }

            const asientoObjetivo = estadoActual.asientosSala.find(
                (a) => a.codigoAsiento === accion.codigoAsiento
            );

            if (!asientoObjetivo) {
                return {
                    ...estadoActual,
                    ultimoMensajeDOM: `Error DOM: El asiento ${accion.codigoAsiento} no existe en el mapa.`
                };
            }

            if (
                asientoObjetivo.estado === 'ReservadoConfirmado' ||
                asientoObjetivo.estado === 'BloqueadoMantenimiento'
            ) {
                return {
                    ...estadoActual,
                    ultimoMensajeDOM: `Asiento ${accion.codigoAsiento} no disponible (${asientoObjetivo.estado}).`
                };
            }

            const yaEstabaSeleccionado = estadoActual.asientosSeleccionadosCodigos.includes(
                accion.codigoAsiento
            );

            if (!yaEstabaSeleccionado && estadoActual.asientosSeleccionadosCodigos.length >= config.limiteAsientosPorReserva) {
                return {
                    ...estadoActual,
                    ultimoMensajeDOM: `Límite máximo de ${config.limiteAsientosPorReserva} asientos por transacción alcanzado.`
                };
            }

            const nuevosCodigos = yaEstabaSeleccionado
                ? estadoActual.asientosSeleccionadosCodigos.filter((c) => c !== accion.codigoAsiento)
                : [...estadoActual.asientosSeleccionadosCodigos, accion.codigoAsiento];

            const nuevosAsientos: readonly AsientoSalaDOM[] = estadoActual.asientosSala.map((a) =>
                a.codigoAsiento === accion.codigoAsiento
                    ? { ...a, estado: yaEstabaSeleccionado ? 'Disponible' : 'SeleccionadoDOM' }
                    : a
            );

            const totales = recalcularTotalesSeleccion(
                nuevosAsientos,
                nuevosCodigos,
                config.pelicula.formato
            );

            return {
                fase: 'SeleccionandoAsientos',
                asientosSala: nuevosAsientos,
                asientosSeleccionadosCodigos: nuevosCodigos,
                subtotalUSD: totales.subtotalUSD,
                cargoServicioUSD: totales.cargoServicioUSD,
                totalPagarUSD: totales.totalPagarUSD,
                ultimoMensajeDOM: yaEstabaSeleccionado
                    ? `Asiento ${accion.codigoAsiento} desmarcado.`
                    : `Asiento ${accion.codigoAsiento} seleccionado (${asientoObjetivo.tipo}).`
            };
        }

        case 'DOM_CLICK_LIMPIAR_SELECCION': {
            if (estadoActual.fase !== 'SeleccionandoAsientos') {
                return estadoActual;
            }

            const asientosRestaurados: readonly AsientoSalaDOM[] = estadoActual.asientosSala.map((a) =>
                a.estado === 'SeleccionadoDOM' ? { ...a, estado: 'Disponible' } : a
            );

            return {
                fase: 'SeleccionandoAsientos',
                asientosSala: asientosRestaurados,
                asientosSeleccionadosCodigos: [],
                subtotalUSD: 0,
                cargoServicioUSD: 0,
                totalPagarUSD: 0,
                ultimoMensajeDOM: 'Selección de asientos reiniciada.'
            };
        }

        case 'DOM_SUBMIT_INICIAR_CHECKOUT': {
            if (estadoActual.fase !== 'SeleccionandoAsientos') {
                return estadoActual;
            }

            if (estadoActual.asientosSeleccionadosCodigos.length === 0) {
                return {
                    ...estadoActual,
                    ultimoMensajeDOM: 'Debe seleccionar al menos 1 asiento antes de continuar al pago.'
                };
            }

            if (!validarEdadParaClasificacion(accion.clienteEdad, config.pelicula.clasificacion)) {
                return {
                    ...estadoActual,
                    ultimoMensajeDOM: `Restricción de edad: "${config.pelicula.titulo}" requiere clasificación ${config.pelicula.clasificacion}.`
                };
            }

            return {
                fase: 'ConfirmandoPago',
                asientosSala: estadoActual.asientosSala,
                asientosSeleccionadosCodigos: estadoActual.asientosSeleccionadosCodigos,
                clienteNombre: accion.clienteNombre,
                clienteEdad: accion.clienteEdad,
                subtotalUSD: estadoActual.subtotalUSD,
                cargoServicioUSD: estadoActual.cargoServicioUSD,
                totalPagarUSD: estadoActual.totalPagarUSD,
                ultimoMensajeDOM: `Checkout iniciado para ${accion.clienteNombre} ($${estadoActual.totalPagarUSD} USD).`
            };
        }

        case 'DOM_CLICK_CONFIRMAR_PAGO': {
            if (estadoActual.fase !== 'ConfirmandoPago') {
                return estadoActual;
            }

            const asientosConfirmados: readonly AsientoSalaDOM[] = estadoActual.asientosSala.map((a) =>
                estadoActual.asientosSeleccionadosCodigos.includes(a.codigoAsiento)
                    ? { ...a, estado: 'ReservadoConfirmado' }
                    : a
            );

            const codigoBoletoQR = `QR-${config.codigoFuncion}-${estadoActual.asientosSeleccionadosCodigos.join('')}`;

            return {
                fase: 'ReservaConfirmada',
                codigoBoletoQR,
                asientosSala: asientosConfirmados,
                asientosConfirmadosCodigos: estadoActual.asientosSeleccionadosCodigos,
                clienteNombre: estadoActual.clienteNombre,
                totalPagadoUSD: estadoActual.totalPagarUSD,
                ultimoMensajeDOM: `Pago aprobado vía ${accion.metodoPago}. Boleto generado: ${codigoBoletoQR}`
            };
        }

        case 'DOM_CLICK_CANCELAR_RESERVA': {
            const asientosLiberados: readonly AsientoSalaDOM[] = estadoActual.asientosSala.map((a) =>
                a.estado === 'SeleccionadoDOM' ? { ...a, estado: 'Disponible' } : a
            );

            return {
                fase: 'ReservaCancelada',
                asientosSala: asientosLiberados,
                motivoCancelacion: accion.motivo,
                ultimoMensajeDOM: `Reserva cancelada: ${accion.motivo}`
            };
        }

        default:
            return estadoActual;
    }
}

// 5. PROYECCIÓN A VISTA DOM Y SIMULADOR DE SESIÓN DE TAQUILLA

export function proyectarVistaSalaDOM(
    estado: EstadoReservaCineDOM,
    config: ConfiguracionFuncionCine
): VistaSalaCineDOM {
    const contenedorSelector = `#cine-sala-${config.numeroSala}-${config.codigoFuncion.toLowerCase()}`;
    const tituloFuncionDOM = `${config.pelicula.titulo} [${config.pelicula.formato}] - Sala ${config.numeroSala}`;

    const mapaAsientosTexto = estado.asientosSala
        .map((a) => {
            const simbolo =
                a.estado === 'Disponible'
                    ? '[ ]'
                    : a.estado === 'SeleccionadoDOM'
                        ? '[*]'
                        : a.estado === 'ReservadoConfirmado'
                            ? '[X]'
                            : '[!]';
            return `${a.codigoAsiento}${simbolo}`;
        })
        .join(' ');

    switch (estado.fase) {
        case 'SeleccionandoAsientos':
            return {
                contenedorSelector,
                tituloFuncionDOM,
                mapaAsientosTexto,
                contadorSeleccionadosTexto: `${estado.asientosSeleccionadosCodigos.length} / ${config.limiteAsientosPorReserva} asientos`,
                totalFormateadoDOM: `$${estado.totalPagarUSD.toFixed(2)} USD`,
                alertaBannerDOM: estado.ultimoMensajeDOM,
                botonConfirmarHabilitado: estado.asientosSeleccionadosCodigos.length > 0
            };

        case 'ConfirmandoPago':
            return {
                contenedorSelector,
                tituloFuncionDOM,
                mapaAsientosTexto,
                contadorSeleccionadosTexto: `${estado.asientosSeleccionadosCodigos.length} asientos (Checkout)`,
                totalFormateadoDOM: `$${estado.totalPagarUSD.toFixed(2)} USD`,
                alertaBannerDOM: estado.ultimoMensajeDOM,
                botonConfirmarHabilitado: true
            };

        case 'ReservaConfirmada':
            return {
                contenedorSelector,
                tituloFuncionDOM,
                mapaAsientosTexto,
                contadorSeleccionadosTexto: `${estado.asientosConfirmadosCodigos.length} confirmados (${estado.asientosConfirmadosCodigos.join(', ')})`,
                totalFormateadoDOM: `$${estado.totalPagadoUSD.toFixed(2)} USD (PAGADO)`,
                alertaBannerDOM: estado.ultimoMensajeDOM,
                botonConfirmarHabilitado: false
            };

        case 'ReservaCancelada':
            return {
                contenedorSelector,
                tituloFuncionDOM,
                mapaAsientosTexto,
                contadorSeleccionadosTexto: '0 asientos',
                totalFormateadoDOM: '$0.00 USD',
                alertaBannerDOM: estado.ultimoMensajeDOM,
                botonConfirmarHabilitado: false
            };
    }
}

export function ejecutarSimulacionReservaDOM(
    config: ConfiguracionFuncionCine,
    eventosDOM: readonly AccionReservaCineDOM[]
): ResultadoFuncionCine {
    let estado: EstadoReservaCineDOM = {
        fase: 'SeleccionandoAsientos',
        asientosSala: config.asientosIniciales,
        asientosSeleccionadosCodigos: [],
        subtotalUSD: 0,
        cargoServicioUSD: 0,
        totalPagarUSD: 0,
        ultimoMensajeDOM: 'Seleccione sus butacas en el mapa interactivo.'
    };

    for (const accion of eventosDOM) {
        estado = reducerReservaCineDOM(estado, accion, config);
        if (estado.fase === 'ReservaConfirmada' || estado.fase === 'ReservaCancelada') {
            break;
        }
    }

    const totalAsientosSala = estado.asientosSala.length;
    const asientosConfirmadosCount = estado.asientosSala.filter(
        (a) => a.estado === 'ReservadoConfirmado'
    ).length;

    const porcentajeOcupacion = totalAsientosSala > 0
        ? Number(((asientosConfirmadosCount / totalAsientosSala) * 100).toFixed(1))
        : 0;

    const ingresosGeneradosUSD =
        estado.fase === 'ReservaConfirmada' ? estado.totalPagadoUSD : 0;

    return {
        id: `cine-res-${config.codigoFuncion}-${Date.now()}`,
        configuracion: config,
        totalAsientosSala,
        asientosConfirmadosCount,
        porcentajeOcupacion,
        ingresosGeneradosUSD,
        vistaFinalDOM: proyectarVistaSalaDOM(estado, config),
        estadoFinal: estado
    };
}

// 6. CÁLCULO DE MÉTRICAS GENERALES DE CARTELERA (reduce & Record)

const FORMATOS_PROYECCION: readonly FormatoProyeccion[] = [
    '2D_Digital',
    '3D_RealD',
    'IMAX_Laser',
    '4DX_Motion'
];

export function calcularMetricasCartelera(
    resultados: readonly ResultadoFuncionCine[]
): MetricasCarteleraCine {
    if (resultados.length === 0) {
        const desgloseVacio = FORMATOS_PROYECCION.reduce(
            (acc, f) => ({ ...acc, [f]: 0 }),
            {} as Record<FormatoProyeccion, number>
        );

        return {
            totalFuncionesProcesadas: 0,
            reservasConfirmadasCount: 0,
            reservasCanceladasOIncompletasCount: 0,
            totalBoletosVendidos: 0,
            ingresosTotalesUSD: 0,
            ocupacionPromedioPct: 0,
            funcionMayorRecaudacion: null,
            desglosePorFormato: desgloseVacio
        };
    }

    const reservasConfirmadasCount = resultados.filter(
        (r) => r.estadoFinal.fase === 'ReservaConfirmada'
    ).length;

    const reservasCanceladasOIncompletasCount = resultados.length - reservasConfirmadasCount;

    const totalBoletosVendidos = resultados.reduce(
        (acc, r) =>
            r.estadoFinal.fase === 'ReservaConfirmada'
                ? acc + r.estadoFinal.asientosConfirmadosCodigos.length
                : acc,
        0
    );

    const ingresosTotalesUSD = Number(
        resultados.reduce((acc, r) => acc + r.ingresosGeneradosUSD, 0).toFixed(2)
    );

    const ocupacionPromedioPct = Number(
        (
            resultados.reduce((acc, r) => acc + r.porcentajeOcupacion, 0) / resultados.length
        ).toFixed(1)
    );

    const funcionMayorRecaudacion = [...resultados].sort(
        (a, b) => b.ingresosGeneradosUSD - a.ingresosGeneradosUSD
    )[0] ?? null;

    const desglosePorFormato = resultados.reduce((acc, r) => {
        acc[r.configuracion.pelicula.formato] = (acc[r.configuracion.pelicula.formato] ?? 0) + 1;
        return acc;
    }, FORMATOS_PROYECCION.reduce((acc, f) => ({ ...acc, [f]: 0 }), {} as Record<FormatoProyeccion, number>));

    return {
        totalFuncionesProcesadas: resultados.length,
        reservasConfirmadasCount,
        reservasCanceladasOIncompletasCount,
        totalBoletosVendidos,
        ingresosTotalesUSD,
        ocupacionPromedioPct,
        funcionMayorRecaudacion,
        desglosePorFormato
    };
}

export class ServicioReservasCineDOM {
    private readonly contenedor = new ContenedorFuncionesCine<ResultadoFuncionCine>();

    public async procesarFuncionesAsync(
        entradas: readonly {
            readonly config: ConfiguracionFuncionCine;
            readonly eventosDOM: readonly AccionReservaCineDOM[];
        }[]
    ): Promise<ResumenReservasCineDOM> {
        const advertencias: string[] = [];

        // Simulación asíncrona de bloqueo distribuido de asientos en taquilla
        await new Promise((resolve) => setTimeout(resolve, 15));

        if (entradas.length === 0) {
            advertencias.push('No se recibieron funciones de cine para procesar.');
        }

        const idsVistos = new Set<string>();
        const codigosVistos = new Set<string>();

        for (const entrada of entradas) {
            const valRes = validarConfiguracionFuncion(entrada.config);
            if (!valRes.esValido) {
                advertencias.push(...valRes.errores);
            } else if (idsVistos.has(entrada.config.id)) {
                advertencias.push(`Función duplicada detectada por ID: ${entrada.config.id}.`);
            } else if (codigosVistos.has(entrada.config.codigoFuncion)) {
                advertencias.push(`Código de función duplicado: ${entrada.config.codigoFuncion}.`);
            } else {
                idsVistos.add(entrada.config.id);
                codigosVistos.add(entrada.config.codigoFuncion);

                const resultado = ejecutarSimulacionReservaDOM(entrada.config, entrada.eventosDOM);
                this.contenedor.agregar(resultado);

                if (resultado.estadoFinal.fase !== 'ReservaConfirmada') {
                    advertencias.push(
                        `Transacción no completada en "${entrada.config.codigoFuncion}": ${resultado.estadoFinal.ultimoMensajeDOM}`
                    );
                }
            }
        }

        const funcionesValidas = this.contenedor.obtenerTodos();
        const metricas = calcularMetricasCartelera(funcionesValidas);

        return {
            ejecucionId: `CINE-DOM-EXEC-${Date.now()}`,
            totalFuncionesValidas: funcionesValidas.length,
            metricas,
            funcionesProcesadas: funcionesValidas,
            advertencias
        };
    }
}

// 7. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenCineDOM(resumen: ResumenReservasCineDOM, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` RESERVAS DE CINE DOM - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Ejecución ID        : ${resumen.ejecucionId}`);
    console.log(`Funciones Validadas : ${resumen.totalFuncionesValidas}`);
    console.log(`Reservas Exitosas   : ${resumen.metricas.reservasConfirmadasCount} | No Completadas: ${resumen.metricas.reservasCanceladasOIncompletasCount}`);
    console.log(`Boletos Vendidos    : ${resumen.metricas.totalBoletosVendidos}`);
    console.log(`Ingresos Totales    : $${resumen.metricas.ingresosTotalesUSD.toFixed(2)} USD`);
    console.log(`Ocupación Promedio  : ${resumen.metricas.ocupacionPromedioPct}%`);
    console.log(`Mayor Recaudación   : ${resumen.metricas.funcionMayorRecaudacion ? `"${resumen.metricas.funcionMayorRecaudacion.configuracion.pelicula.titulo}" ($${resumen.metricas.funcionMayorRecaudacion.ingresosGeneradosUSD.toFixed(2)} USD)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS Y ALERTAS DE TAQUILLA DOM (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR FORMATO DE PROYECCIÓN:`);
    Object.entries(resumen.metricas.desglosePorFormato).forEach(([formato, cantidad]) => {
        console.log(`   - ${formato.padEnd(16)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.funcionesProcesadas.map((f) => ({
            Código: f.configuracion.codigoFuncion,
            Película: `${f.configuracion.pelicula.titulo} (${f.configuracion.pelicula.formato})`,
            Sala: `Sala ${f.configuracion.numeroSala}`,
            'Mapa DOM': f.vistaFinalDOM.mapaAsientosTexto,
            Selección: f.vistaFinalDOM.contadorSeleccionadosTexto,
            'Total USD': f.vistaFinalDOM.totalFormateadoDOM,
            EstadoFinal: f.estadoFinal.fase
        }))
    );
}

// 8. CASOS DE PRUEBA (Caso Normal y Caso Límite Async/Await)

const salaBaseAsientos: readonly AsientoSalaDOM[] = [
    { codigoAsiento: 'A1', fila: 'A', columna: 1, tipo: 'Estandar', precioBaseUSD: 10, estado: 'ReservadoConfirmado' },
    { codigoAsiento: 'A2', fila: 'A', columna: 2, tipo: 'Estandar', precioBaseUSD: 10, estado: 'Disponible' },
    { codigoAsiento: 'A3', fila: 'A', columna: 3, tipo: 'Estandar', precioBaseUSD: 10, estado: 'Disponible' },
    { codigoAsiento: 'B1', fila: 'B', columna: 1, tipo: 'VIP_Reclinable', precioBaseUSD: 16, estado: 'Disponible' },
    { codigoAsiento: 'B2', fila: 'B', columna: 2, tipo: 'VIP_Reclinable', precioBaseUSD: 16, estado: 'Disponible' },
    { codigoAsiento: 'B3', fila: 'B', columna: 3, tipo: 'Preferencial_Accesible', precioBaseUSD: 12, estado: 'BloqueadoMantenimiento' }
];

const funcionNormal1: ConfiguracionFuncionCine = {
    id: 'fun-01',
    codigoFuncion: 'IMAX-DUNE2-2000',
    pelicula: {
        id: 'mov-01',
        codigoPelicula: 'DUNE-PART-TWO',
        titulo: 'Dune: Part Two',
        director: 'Denis Villeneuve',
        duracionMinutos: 166,
        clasificacion: 'B15_Mayores15',
        formato: 'IMAX_Laser'
    },
    numeroSala: 1,
    horarioISO: '2026-11-12T20:00:00Z',
    limiteAsientosPorReserva: 4,
    asientosIniciales: salaBaseAsientos
};

const eventosNormal1: readonly AccionReservaCineDOM[] = [
    { tipo: 'DOM_CLICK_ALTERNAR_ASIENTO', codigoAsiento: 'B1' },
    { tipo: 'DOM_CLICK_ALTERNAR_ASIENTO', codigoAsiento: 'B2' },
    { tipo: 'DOM_SUBMIT_INICIAR_CHECKOUT', clienteNombre: 'José Rodríguez', clienteEdad: 29 },
    { tipo: 'DOM_CLICK_CONFIRMAR_PAGO', metodoPago: 'Tarjeta' }
];

const funcionNormal2: ConfiguracionFuncionCine = {
    id: 'fun-02',
    codigoFuncion: '3D-INTERSTELLAR-2215',
    pelicula: {
        id: 'mov-02',
        codigoPelicula: 'INTERSTELLAR-RE',
        titulo: 'Interstellar (Reestreno IMAX/3D)',
        director: 'Christopher Nolan',
        duracionMinutos: 169,
        clasificacion: 'B_Mayores12',
        formato: '3D_RealD'
    },
    numeroSala: 4,
    horarioISO: '2026-11-12T22:15:00Z',
    limiteAsientosPorReserva: 4,
    asientosIniciales: salaBaseAsientos
};

const eventosNormal2: readonly AccionReservaCineDOM[] = [
    { tipo: 'DOM_CLICK_ALTERNAR_ASIENTO', codigoAsiento: 'A2' },
    { tipo: 'DOM_CLICK_ALTERNAR_ASIENTO', codigoAsiento: 'A3' },
    { tipo: 'DOM_CLICK_ALTERNAR_ASIENTO', codigoAsiento: 'A2' }, // Desmarca A2
    { tipo: 'DOM_CLICK_ALTERNAR_ASIENTO', codigoAsiento: 'B1' },
    { tipo: 'DOM_SUBMIT_INICIAR_CHECKOUT', clienteNombre: 'María Fernanda López', clienteEdad: 26 },
    { tipo: 'DOM_CLICK_CONFIRMAR_PAGO', metodoPago: 'WalletDigital' }
];

// --- CASO LÍMITE: Restricción de edad Clasificación C, Asiento Ocupado y Datos Corruptos ---
const funcionAdultos: ConfiguracionFuncionCine = {
    id: 'fun-03',
    codigoFuncion: '4DX-TERRIFIER-2330',
    pelicula: {
        id: 'mov-03',
        codigoPelicula: 'HORROR-18',
        titulo: 'Nosferatu: Edición Extendida',
        director: 'Robert Eggers',
        duracionMinutos: 132,
        clasificacion: 'C_Adultos18',
        formato: '4DX_Motion'
    },
    numeroSala: 7,
    horarioISO: '2026-11-12T23:30:00Z',
    limiteAsientosPorReserva: 2,
    asientosIniciales: salaBaseAsientos
};

const eventosMenorEdadYAsientoOcupado: readonly AccionReservaCineDOM[] = [
    { tipo: 'DOM_CLICK_ALTERNAR_ASIENTO', codigoAsiento: 'A1' }, // Ya ocupado -> DOM bloquea
    { tipo: 'DOM_CLICK_ALTERNAR_ASIENTO', codigoAsiento: 'B3' }, // Mantenimiento -> DOM bloquea
    { tipo: 'DOM_CLICK_ALTERNAR_ASIENTO', codigoAsiento: 'B1' },
    { tipo: 'DOM_SUBMIT_INICIAR_CHECKOUT', clienteNombre: 'Usuario Menor', clienteEdad: 16 } // Bloqueado por Clasificación C
];

const funcionCorrupta: ConfiguracionFuncionCine = {
    id: 'fun-99',
    codigoFuncion: 'ERR-CINE-999',
    pelicula: {
        id: 'mov-99',
        codigoPelicula: 'ERR-MOV',
        titulo: '',
        director: 'Desconocido',
        duracionMinutos: -20, // Duración negativa -> Inválida
        clasificacion: 'A_TodoPublico',
        formato: '2D_Digital'
    },
    numeroSala: 0, // Sala inválida
    horarioISO: '2026-11-12T00:00:00Z',
    limiteAsientosPorReserva: 25, // Límite > 10 -> Inválido
    asientosIniciales: []
};

async function ejecutarPruebas(): Promise<void> {
    // Ejecución Caso 1 (Normal)
    const servicioNormal = new ServicioReservasCineDOM();
    const resumenNormal = await servicioNormal.procesarFuncionesAsync([
        { config: funcionNormal1, eventosDOM: eventosNormal1 },
        { config: funcionNormal2, eventosDOM: eventosNormal2 }
    ]);
    mostrarResumenCineDOM(resumenNormal, 'Caso Normal - Cartelera Nocturna IMAX y 3D');

    // Ejecución Caso 2 (Límite)
    const servicioLimite = new ServicioReservasCineDOM();
    const resumenLimite = await servicioLimite.procesarFuncionesAsync([
        { config: funcionAdultos, eventosDOM: eventosMenorEdadYAsientoOcupado },
        { config: funcionCorrupta, eventosDOM: [] },
        { config: funcionAdultos, eventosDOM: eventosMenorEdadYAsientoOcupado } // Duplicada
    ]);
    mostrarResumenCineDOM(resumenLimite, 'Caso Límite - Bloqueo por Edad, Asientos Ocupados y Función Corrupta');
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecución:', err));