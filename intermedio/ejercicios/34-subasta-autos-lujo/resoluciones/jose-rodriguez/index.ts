// ============================================================================
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions y Literales)
// ============================================================================

export type CategoriaVehiculo =
  | 'Supercar'
  | 'Hypercar'
  | 'ExoticoClasico'
  | 'GTGranTurismo'
  | 'SUVDeLujo'
  | 'PistaEdicionLimitada';

export type EstadoSubasta =
  | 'Proximamente'
  | 'Activa'
  | 'Adjudicada'
  | 'ReservaNoAlcanzada'
  | 'Cancelada';

export type CondicionVehiculo =
  | 'ConcoursCondition'
  | 'Excelente'
  | 'Bueno'
  | 'ParaRestaurar';

export interface CompradorColeccionista {
  readonly id: string;
  readonly nombre: string;
  readonly limiteCreditoUSD: number;
  readonly reputacionVip: boolean;
}

export interface OfertaSubasta {
  readonly id: string;
  readonly comprador: CompradorColeccionista;
  readonly montoUSD: number;
  readonly timestamp: string;
}

export interface AutoDeLujo {
  readonly id: string;
  readonly vin: string;
  readonly marca: string;
  readonly modelo: string;
  readonly anioFabricacion: number;
  readonly kilometraje: number;
  readonly categoria: CategoriaVehiculo;
  readonly condicion: CondicionVehiculo;
  readonly precioReservaUSD: number;
  readonly precioSalidaUSD: number;
  readonly unidadesProducidas: number;
}

export interface LoteSubasta {
  readonly id: string;
  readonly codigoLote: string;
  readonly auto: AutoDeLujo;
  readonly ofertas: readonly OfertaSubasta[];
  readonly estado: EstadoSubasta;
  readonly comisionCasaSubastaPct: number;
}

export interface SubastaEvento {
  readonly id: string;
  readonly nombreEvento: string;
  readonly ubicacion: string;
  readonly fechaInicio: string;
  readonly lotes: readonly LoteSubasta[];
}

export interface MetricasSubasta {
  readonly totalLotes: number;
  readonly lotesVendidos: number;
  readonly porcentajeVentas: number;
  readonly recaudacionTotalUSD: number;
  readonly comisionesCasaSubastaUSD: number;
  readonly ofertaMasAltaTotal: OfertaSubasta | null;
  readonly autoMasCostoso: AutoDeLujo | null;
  readonly desglosePorCategoria: Readonly<Record<CategoriaVehiculo, number>>;
  readonly desglosePorEstado: Readonly<Record<EstadoSubasta, number>>;
}

export interface ResumenSubastaAutos {
  readonly subastaId: string;
  readonly nombreEvento: string;
  readonly totalLotesValidos: number;
  readonly metricas: MetricasSubasta;
  readonly lotesProcesados: readonly LoteSubasta[];
  readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
  | { readonly esValido: true; readonly datos: T }
  | { readonly esValido: false; readonly errores: readonly string[] };

// ============================================================================
// 2. TYPE GUARDS Y FUNCIONES DE VALIDACIÓN DE DOMINIO
// ============================================================================

export function esHypercar(auto: AutoDeLujo): boolean {
  return auto.categoria === 'Hypercar' || auto.precioReservaUSD >= 1000000;
}

export function obtenerOfertaMasAlta(ofertas: readonly OfertaSubasta[]): OfertaSubasta | null {
  if (ofertas.length === 0) return null;
  return [...ofertas].sort((a, b) => b.montoUSD - a.montoUSD)[0] ?? null;
}

export function validarAutoDeLujo(auto: AutoDeLujo): ResultadoValidacion<AutoDeLujo> {
  const errores: string[] = [];

  if (auto.anioFabricacion < 1886 || auto.anioFabricacion > 2027) {
    errores.push(`Año de fabricacion invalido (${auto.anioFabricacion}) para "${auto.marca} ${auto.modelo}".`);
  }

  if (auto.kilometraje < 0) {
    errores.push(`El kilometraje no puede ser negativo (${auto.kilometraje} km) en "${auto.modelo}".`);
  }

  if (auto.precioSalidaUSD <= 0) {
    errores.push(`El precio de salida debe ser mayor a 0 USD ($${auto.precioSalidaUSD}) en "${auto.modelo}".`);
  }

  if (auto.precioReservaUSD < auto.precioSalidaUSD) {
    errores.push(`El precio de reserva ($${auto.precioReservaUSD}) no puede ser menor al de salida ($${auto.precioSalidaUSD}) en "${auto.modelo}".`);
  }

  if (auto.unidadesProducidas <= 0) {
    errores.push(`Las unidades producidas deben ser mayores a 0 (${auto.unidadesProducidas}) en "${auto.modelo}".`);
  }

  return errores.length === 0
    ? { esValido: true, datos: auto }
    : { esValido: false, errores };
}

export function validarLoteSubasta(lote: LoteSubasta): readonly string[] {
  const advertencias: string[] = [];

  if (lote.comisionCasaSubastaPct < 0 || lote.comisionCasaSubastaPct > 30) {
    advertencias.push(`Porcentaje de comision fuera de rango (${lote.comisionCasaSubastaPct}%) en el lote ${lote.codigoLote}.`);
  }

  const ofertaMasAlta = obtenerOfertaMasAlta(lote.ofertas);

  if (lote.estado === 'Adjudicada') {
    if (!ofertaMasAlta) {
      advertencias.push(`Inconsistencia en lote ${lote.codigoLote}: Estado Adjudicada sin ofertas registradas.`);
    } else if (ofertaMasAlta.montoUSD < lote.auto.precioReservaUSD) {
      advertencias.push(
        `Inconsistencia en lote ${lote.codigoLote}: Oferta ganadora ($${ofertaMasAlta.montoUSD}) es menor al precio de reserva ($${lote.auto.precioReservaUSD}).`
      );
    }
  }

  for (const oferta of lote.ofertas) {
    if (oferta.montoUSD <= 0) {
      advertencias.push(`Oferta invalida ($${oferta.montoUSD}) realizada por ${oferta.comprador.nombre} en lote ${lote.codigoLote}.`);
    }
    if (oferta.montoUSD > oferta.comprador.limiteCreditoUSD) {
      advertencias.push(
        `Oferta de $${oferta.montoUSD} supera el limite de credito ($${oferta.comprador.limiteCreditoUSD}) de ${oferta.comprador.nombre}.`
      );
    }
  }

  return advertencias;
}

export function validarEventoSubastaRaw(evento: SubastaEvento): readonly string[] {
  const advertencias: string[] = [];
  const idsLotes = new Set<string>();
  const codigosLotes = new Set<string>();
  const vinsVistos = new Set<string>();

  if (evento.lotes.length === 0) {
    advertencias.push(`El evento de subasta "${evento.nombreEvento}" no contiene lotes catalogados.`);
  }

  for (const lote of evento.lotes) {
    if (idsLotes.has(lote.id)) {
      advertencias.push(`Lote duplicado detectado por ID: ${lote.id}.`);
    }
    if (codigosLotes.has(lote.codigoLote)) {
      advertencias.push(`Codigo de lote duplicado: ${lote.codigoLote}.`);
    }
    if (vinsVistos.has(lote.auto.vin)) {
      advertencias.push(`VIN vehicular duplicado en catalogo: ${lote.auto.vin} (${lote.auto.modelo}).`);
    }
    idsLotes.add(lote.id);
    codigosLotes.add(lote.codigoLote);
    vinsVistos.add(lote.auto.vin);
  }

  return advertencias;
}

// ============================================================================
// 3. TRANSFORMACIÓN Y CÁLCULOS (Uso de reduce, Record y Union Types)
// ============================================================================

const CATEGORIAS_VEHICULO: readonly CategoriaVehiculo[] = [
  'Supercar',
  'Hypercar',
  'ExoticoClasico',
  'GTGranTurismo',
  'SUVDeLujo',
  'PistaEdicionLimitada'
];

const ESTADOS_SUBASTA: readonly EstadoSubasta[] = [
  'Proximamente',
  'Activa',
  'Adjudicada',
  'ReservaNoAlcanzada',
  'Cancelada'
];

export function calcularMetricasSubasta(lotes: readonly LoteSubasta[]): MetricasSubasta {
  if (lotes.length === 0) {
    const desgloseCategoriaVacio = CATEGORIAS_VEHICULO.reduce((acc, cat) => {
      acc[cat] = 0;
      return acc;
    }, {} as Record<CategoriaVehiculo, number>);

    const desgloseEstadoVacio = ESTADOS_SUBASTA.reduce((acc, est) => {
      acc[est] = 0;
      return acc;
    }, {} as Record<EstadoSubasta, number>);

    return {
      totalLotes: 0,
      lotesVendidos: 0,
      porcentajeVentas: 0,
      recaudacionTotalUSD: 0,
      comisionesCasaSubastaUSD: 0,
      ofertaMasAltaTotal: null,
      autoMasCostoso: null,
      desglosePorCategoria: desgloseCategoriaVacio,
      desglosePorEstado: desgloseEstadoVacio
    };
  }

  const lotesVendidos = lotes.filter((l) => l.estado === 'Adjudicada');
  const cantidadVendidos = lotesVendidos.length;
  const porcentajeVentas = Number(((cantidadVendidos / lotes.length) * 100).toFixed(1));

  const recaudacionTotalUSD = Number(
    lotesVendidos
      .reduce((acc, l) => {
        const mejorOferta = obtenerOfertaMasAlta(l.ofertas);
        return acc + (mejorOferta ? mejorOferta.montoUSD : 0);
      }, 0)
      .toFixed(2)
  );

  const comisionesCasaSubastaUSD = Number(
    lotesVendidos
      .reduce((acc, l) => {
        const mejorOferta = obtenerOfertaMasAlta(l.ofertas);
        const venta = mejorOferta ? mejorOferta.montoUSD : 0;
        return acc + venta * (l.comisionCasaSubastaPct / 100);
      }, 0)
      .toFixed(2)
  );

  const todasLasOfertas = lotes.flatMap((l) => l.ofertas);
  const ofertaMasAltaTotal = obtenerOfertaMasAlta(todasLasOfertas);

  const autoMasCostoso = [...lotes]
    .map((l) => l.auto)
    .sort((a, b) => b.precioReservaUSD - a.precioReservaUSD)[0] ?? null;

  // Agrupaciones mediante reduce y Record
  const desglosePorCategoria = lotes.reduce((acc, l) => {
    acc[l.auto.categoria] = (acc[l.auto.categoria] ?? 0) + 1;
    return acc;
  }, CATEGORIAS_VEHICULO.reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {} as Record<CategoriaVehiculo, number>));

  const desglosePorEstado = lotes.reduce((acc, l) => {
    acc[l.estado] = (acc[l.estado] ?? 0) + 1;
    return acc;
  }, ESTADOS_SUBASTA.reduce((acc, est) => ({ ...acc, [est]: 0 }), {} as Record<EstadoSubasta, number>));

  return {
    totalLotes: lotes.length,
    lotesVendidos: cantidadVendidos,
    porcentajeVentas,
    recaudacionTotalUSD,
    comisionesCasaSubastaUSD,
    ofertaMasAltaTotal,
    autoMasCostoso,
    desglosePorCategoria,
    desglosePorEstado
  };
}

export function procesarEventoSubasta(eventoRaw: SubastaEvento): ResumenSubastaAutos {
  const advertencias: string[] = [...validarEventoSubastaRaw(eventoRaw)];
  const lotesValidos: LoteSubasta[] = [];

  for (const rawLote of eventoRaw.lotes) {
    const resAuto = validarAutoDeLujo(rawLote.auto);
    const advLote = validarLoteSubasta(rawLote);

    if (!resAuto.esValido) {
      advertencias.push(...resAuto.errores.map((err) => `Lote ${rawLote.codigoLote}: ${err}`));
    }
    advertencias.push(...advLote);

    if (resAuto.esValido && advLote.length === 0) {
      lotesValidos.push(rawLote);
    }
  }

  const metricas = calcularMetricasSubasta(lotesValidos);

  return {
    subastaId: eventoRaw.id,
    nombreEvento: eventoRaw.nombreEvento,
    totalLotesValidos: lotesValidos.length,
    metricas,
    lotesProcesados: lotesValidos,
    advertencias
  };
}

// ============================================================================
// 4. PRESENTACIÓN Y SALIDA POR CONSOLA
// ============================================================================

export function mostrarResumenSubasta(resumen: ResumenSubastaAutos, tituloCaso: string): void {
  console.log(`\n======================================================================`);
  console.log(` SUBASTA DE AUTOS DE LUJO - ${tituloCaso.toUpperCase()}`);
  console.log(`======================================================================`);
  console.log(`Evento Subasta      : ${resumen.nombreEvento}`);
  console.log(`Lotes Validados     : ${resumen.totalLotesValidos}`);
  console.log(`Lotes Vendidos      : ${resumen.metricas.lotesVendidos} de ${resumen.metricas.totalLotes} (${resumen.metricas.porcentajeVentas}%)`);
  console.log(`Recaudacion Total   : $${resumen.metricas.recaudacionTotalUSD.toLocaleString()} USD`);
  console.log(`Comisiones Casa     : $${resumen.metricas.comisionesCasaSubastaUSD.toLocaleString()} USD`);
  console.log(`Oferta Mas Alta     : ${resumen.metricas.ofertaMasAltaTotal ? `$${resumen.metricas.ofertaMasAltaTotal.montoUSD.toLocaleString()} USD (por ${resumen.metricas.ofertaMasAltaTotal.comprador.nombre})` : 'N/A'}`);
  console.log(`Auto Mas Valorado   : ${resumen.metricas.autoMasCostoso ? `${resumen.metricas.autoMasCostoso.marca} ${resumen.metricas.autoMasCostoso.modelo} (Reserva: $${resumen.metricas.autoMasCostoso.precioReservaUSD.toLocaleString()} USD)` : 'N/A'}`);
  console.log(`----------------------------------------------------------------------`);

  if (resumen.advertencias.length > 0) {
    console.log(`ADVERTENCIAS DE SUBASTA (${resumen.advertencias.length}):`);
    resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
    console.log(`----------------------------------------------------------------------`);
  }

  console.log(`DESGLOSE DE LOTES POR CATEGORIA DE VEHICULO:`);
  Object.entries(resumen.metricas.desglosePorCategoria).forEach(([cat, cantidad]) => {
    console.log(`   - ${cat.padEnd(22)}: ${cantidad}`);
  });
  console.log(`----------------------------------------------------------------------`);

  console.table(
    resumen.lotesProcesados.map((l) => {
      const mejorOferta = obtenerOfertaMasAlta(l.ofertas);
      return {
        Lote: l.codigoLote,
        Vehiculo: `${l.auto.marca} ${l.auto.modelo}`,
        Categoria: l.auto.categoria,
        'Año': l.auto.anioFabricacion,
        'Reserva (USD)': `$${l.auto.precioReservaUSD.toLocaleString()}`,
        'Oferta Max': mejorOferta ? `$${mejorOferta.montoUSD.toLocaleString()}` : 'Sin Ofertas',
        Comprador: mejorOferta ? mejorOferta.comprador.nombre : 'N/A',
        Estado: l.estado
      };
    })
  );
}

// ============================================================================
// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)
// ============================================================================

const coleccionistaVIP: CompradorColeccionista = { id: 'vip-01', nombre: 'Jose Rodriguez', limiteCreditoUSD: 15000000, reputacionVip: true };
const coleccionista2: CompradorColeccionista = { id: 'vip-02', nombre: 'Lawrence Stroll', limiteCreditoUSD: 25000000, reputacionVip: true };

// Autos de prueba
const bugattiChiron: AutoDeLujo = {
  id: 'car-01',
  vin: 'ZFA37000009876543',
  marca: 'Bugatti',
  modelo: 'Chiron Super Sport',
  anioFabricacion: 2023,
  kilometraje: 450,
  categoria: 'Hypercar',
  condicion: 'ConcoursCondition',
  precioSalidaUSD: 3000000,
  precioReservaUSD: 3800000,
  unidadesProducidas: 30
};

const ferrari250GTO: AutoDeLujo = {
  id: 'car-02',
  vin: 'FER250GTO1962001',
  marca: 'Ferrari',
  modelo: '250 GTO',
  anioFabricacion: 1962,
  kilometraje: 12500,
  categoria: 'ExoticoClasico',
  condicion: 'ConcoursCondition',
  precioSalidaUSD: 10000000,
  precioReservaUSD: 12000000,
  unidadesProducidas: 36
};

const porscheGT3RS: AutoDeLujo = {
  id: 'car-03',
  vin: 'WP0ZZZ99ZTS001122',
  marca: 'Porsche',
  modelo: '911 GT3 RS',
  anioFabricacion: 2024,
  kilometraje: 85,
  categoria: 'PistaEdicionLimitada',
  condicion: 'Excelente',
  precioSalidaUSD: 350000,
  precioReservaUSD: 450000,
  unidadesProducidas: 1500
};

// --- CASO 1: Subasta Monterey Car Week (Caso Normal) ---
const subastaMonterey: SubastaEvento = {
  id: 'AUCTION-MONTEREY-2026',
  nombreEvento: 'Monterey Luxury & Exotic Car Auction 2026',
  ubicacion: 'Pebble Beach, California',
  fechaInicio: '2026-08-20',
  lotes: [
    {
      id: 'LOT-101',
      codigoLote: 'LOT_BUGATTI_01',
      auto: bugattiChiron,
      comisionCasaSubastaPct: 10,
      estado: 'Adjudicada',
      ofertas: [
        { id: 'bid-01', comprador: coleccionistaVIP, montoUSD: 3500000, timestamp: '2026-08-20T18:00:00Z' },
        { id: 'bid-02', comprador: coleccionista2, montoUSD: 4200000, timestamp: '2026-08-20T18:05:00Z' }
      ]
    },
    {
      id: 'LOT-102',
      codigoLote: 'LOT_FERRARI_02',
      auto: ferrari250GTO,
      comisionCasaSubastaPct: 8,
      estado: 'Adjudicada',
      ofertas: [
        { id: 'bid-03', comprador: coleccionistaVIP, montoUSD: 13500000, timestamp: '2026-08-20T18:30:00Z' }
      ]
    },
    {
      id: 'LOT-103',
      codigoLote: 'LOT_PORSCHE_03',
      auto: porscheGT3RS,
      comisionCasaSubastaPct: 12,
      estado: 'ReservaNoAlcanzada',
      ofertas: [
        { id: 'bid-04', comprador: coleccionistaVIP, montoUSD: 400000, timestamp: '2026-08-20T19:00:00Z' }
      ]
    }
  ]
};

// --- CASO 2: Reserva Menor a Salida, Exceso de Crédito y VIN Duplicado (Caso Límite) ---
const autoCorrupto: AutoDeLujo = {
  id: 'car-99',
  vin: 'ZFA37000009876543', // VIN duplicado con Bugatti
  marca: 'Auto Invalido',
  modelo: 'Hyper-Fake',
  anioFabricacion: 1800, // Año invalido (< 1886)
  kilometraje: -100, // Km negativo
  categoria: 'Hypercar',
  condicion: 'Excelente',
  precioSalidaUSD: 500000,
  precioReservaUSD: 200000, // Reserva menor a salida -> Invalido
  unidadesProducidas: 0 // Unidades 0 -> Invalido
};

const subastaLimiteCorrupta: SubastaEvento = {
  id: 'AUCTION-FAIL-02',
  nombreEvento: 'Subasta Con Inconsistencias',
  ubicacion: 'Online',
  fechaInicio: '2026-11-01',
  lotes: [
    {
      id: 'LOT-104',
      codigoLote: 'LOT_ERR_01',
      auto: autoCorrupto,
      comisionCasaSubastaPct: 35, // Comision > 30% -> Invalido
      estado: 'Adjudicada',
      ofertas: [
        { id: 'bid-05', comprador: coleccionistaVIP, montoUSD: 20000000, timestamp: '2026-11-01T10:00:00Z' } // Supera limite de credito -> Invalido
      ]
    },
    {
      id: 'LOT-101', // ID de lote duplicado con LOT-101
      codigoLote: 'LOT_BUGATTI_01', // Codigo de lote duplicado
      auto: bugattiChiron,
      comisionCasaSubastaPct: 10,
      estado: 'Adjudicada', // Estado Adjudicada sin ofertas
      ofertas: []
    }
  ]
};

// Ejecución
const resumenNormal = procesarEventoSubasta(subastaMonterey);
mostrarResumenSubasta(resumenNormal, 'Caso Normal - Monterey Luxury Car Auction 2026');

const resumenLimite = procesarEventoSubasta(subastaLimiteCorrupta);
mostrarResumenSubasta(resumenLimite, 'Caso Limite - VIN Duplicado, Ofertas que Superan Credito y Reservas Invalidas');