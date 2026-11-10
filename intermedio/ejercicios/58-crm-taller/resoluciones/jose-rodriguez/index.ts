
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions, Generics y Promises)

export type TipoServicio =
  | 'MantenimientoPreventivo'
  | 'ReparacionMotor'
  | 'SistemaElectrico'
  | 'FrenosYSuspension'
  | 'DiagnosticoECU'
  | 'CambioLlantas';

export type EstadoOrden =
  | 'Recepcionado'
  | 'EnDiagnostico'
  | 'EnReparacion'
  | 'EsperandoRepuestos'
  | 'ListoEntrega'
  | 'Entregado'
  | 'Cancelado';

export type NivelPrioridad = 'Baja' | 'Media' | 'Alta' | 'Urgente';

export interface ClienteMoto {
  readonly id: string;
  readonly nombreCompleto: string;
  readonly telefono: string;
  readonly email: string;
}

export interface VehiculoMoto {
  readonly id: string;
  readonly placa: string;
  readonly marca: string;
  readonly modelo: string;
  readonly cilindrajeCC: number;
  readonly kilometrajeKM: number;
}

export interface ItemServicio {
  readonly id: string;
  readonly descripcion: string;
  readonly costoRepuestoUSD: number;
  readonly manoObraUSD: number;
}

export interface OrdenTrabajoTaller {
  readonly id: string;
  readonly codigoOrden: string;
  readonly cliente: ClienteMoto;
  readonly vehiculo: VehiculoMoto;
  readonly tipoServicio: TipoServicio;
  readonly prioridad: NivelPrioridad;
  readonly estado: EstadoOrden;
  readonly items: readonly ItemServicio[];
  readonly observaciones: string;
  readonly fechaIngreso: string;
}

export interface CRMRegistroTallerRaw {
  readonly id: string;
  readonly nombreTaller: string;
  readonly direccion: string;
  readonly ordenes: readonly OrdenTrabajoTaller[];
}

export interface MetricasCRMTaller {
  readonly totalOrdenes: number;
  readonly ordenesEntregadasCount: number;
  readonly porcentajeFinalizacion: number;
  readonly facturacionTotalUSD: number;
  readonly ingresoPromedioPorOrdenUSD: number;
  readonly ordenMasCostosa: OrdenTrabajoTaller | null;
  readonly desglosePorTipoServicio: Readonly<Record<TipoServicio, number>>;
  readonly desglosePorEstado: Readonly<Record<EstadoOrden, number>>;
}

export interface ResumenCRMTaller {
  readonly tallerId: string;
  readonly nombreTaller: string;
  readonly totalOrdenesValidas: number;
  readonly metricas: MetricasCRMTaller;
  readonly ordenesProcesadas: readonly OrdenTrabajoTaller[];
  readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
  | { readonly esValido: true; readonly datos: T }
  | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO Y GESTIÓN DE TALLER (Generics & Encapsulamiento)

export class ContenedorCRMTaller<T extends { readonly id: string; readonly codigoOrden: string }> {
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

// 3. VALIDACIONES Y REGLAS DE NEGOCIO (Async/Promise support)

export function calcularCostoTotalOrden(orden: OrdenTrabajoTaller): number {
  const total = orden.items.reduce(
    (acc, item) => acc + item.costoRepuestoUSD + item.manoObraUSD,
    0
  );
  return Number(total.toFixed(2));
}

export function validarVehiculoMoto(vehiculo: VehiculoMoto): ResultadoValidacion<VehiculoMoto> {
  const errores: string[] = [];

  if (vehiculo.cilindrajeCC <= 0 || vehiculo.cilindrajeCC > 3000) {
    errores.push(`Cilindraje invalido (${vehiculo.cilindrajeCC} cc) para la motocicleta de placa "${vehiculo.placa}".`);
  }

  if (vehiculo.kilometrajeKM < 0) {
    errores.push(`Kilometraje negativo (${vehiculo.kilometrajeKM} km) en motocicleta "${vehiculo.placa}".`);
  }

  if (vehiculo.placa.trim().length === 0) {
    errores.push('La motocicleta debe registrar una placa o identificador valido.');
  }

  return errores.length === 0
    ? { esValido: true, datos: vehiculo }
    : { esValido: false, errores };
}

export function validarOrdenTrabajo(orden: OrdenTrabajoTaller): ResultadoValidacion<OrdenTrabajoTaller> {
  const errores: string[] = [];

  const resVehiculo = validarVehiculoMoto(orden.vehiculo);
  if (!resVehiculo.esValido) {
    errores.push(...resVehiculo.errores);
  }

  if (orden.cliente.nombreCompleto.trim().length === 0) {
    errores.push(`La orden "${orden.codigoOrden}" no tiene un cliente asignado.`);
  }

  if (orden.items.length === 0) {
    errores.push(`La orden "${orden.codigoOrden}" debe tener al menos un item de servicio registrado.`);
  }

  for (const item of orden.items) {
    if (item.costoRepuestoUSD < 0 || item.manoObraUSD < 0) {
      errores.push(`Costos negativos detectados en el item "${item.descripcion}" de la orden "${orden.codigoOrden}".`);
    }
  }

  return errores.length === 0
    ? { esValido: true, datos: orden }
    : { esValido: false, errores };
}

export async function validarCRMRegistroAsync(
  registroRaw: CRMRegistroTallerRaw
): Promise<ResultadoValidacion<CRMRegistroTallerRaw>> {
  // Simulacion de consulta asincrona a la base de datos de clientes e historial de taller
  await new Promise((resolve) => setTimeout(resolve, 15));

  const errores: string[] = [];

  if (registroRaw.ordenes.length === 0) {
    errores.push(`El registro de CRM para el taller "${registroRaw.nombreTaller}" no contiene ordenes de trabajo.`);
  }

  for (const orden of registroRaw.ordenes) {
    const resVal = validarOrdenTrabajo(orden);
    if (!resVal.esValido) {
      errores.push(...resVal.errores);
    }
  }

  return errores.length === 0
    ? { esValido: true, datos: registroRaw }
    : { esValido: false, errores };
}

// 4. TRANSFORMACIÓN Y CÁLCULOS MÉTRICOS (reduce & Record)

const TIPOS_SERVICIO: readonly TipoServicio[] = [
  'MantenimientoPreventivo',
  'ReparacionMotor',
  'SistemaElectrico',
  'FrenosYSuspension',
  'DiagnosticoECU',
  'CambioLlantas'
];

const ESTADOS_ORDEN: readonly EstadoOrden[] = [
  'Recepcionado',
  'EnDiagnostico',
  'EnReparacion',
  'EsperandoRepuestos',
  'ListoEntrega',
  'Entregado',
  'Cancelado'
];

export function calcularMetricasCRM(ordenes: readonly OrdenTrabajoTaller[]): MetricasCRMTaller {
  if (ordenes.length === 0) {
    const desgloseServicioVacio = TIPOS_SERVICIO.reduce((acc, s) => {
      acc[s] = 0;
      return acc;
    }, {} as Record<TipoServicio, number>);

    const desgloseEstadoVacio = ESTADOS_ORDEN.reduce((acc, e) => {
      acc[e] = 0;
      return acc;
    }, {} as Record<EstadoOrden, number>);

    return {
      totalOrdenes: 0,
      ordenesEntregadasCount: 0,
      porcentajeFinalizacion: 0,
      facturacionTotalUSD: 0,
      ingresoPromedioPorOrdenUSD: 0,
      ordenMasCostosa: null,
      desglosePorTipoServicio: desgloseServicioVacio,
      desglosePorEstado: desgloseEstadoVacio
    };
  }

  const entregadas = ordenes.filter((o) => o.estado === 'Entregado');
  const ordenesEntregadasCount = entregadas.length;
  const porcentajeFinalizacion = Number(((ordenesEntregadasCount / ordenes.length) * 100).toFixed(1));

  const facturacionTotalUSD = Number(
    ordenes
      .filter((o) => o.estado !== 'Cancelado')
      .reduce((acc, o) => acc + calcularCostoTotalOrden(o), 0)
      .toFixed(2)
  );

  const ordenesValidasParaCobro = ordenes.filter((o) => o.estado !== 'Cancelado');
  const ingresoPromedioPorOrdenUSD = ordenesValidasParaCobro.length > 0
    ? Number((facturacionTotalUSD / ordenesValidasParaCobro.length).toFixed(2))
    : 0;

  const ordenMasCostosa = [...ordenes].sort(
    (a, b) => calcularCostoTotalOrden(b) - calcularCostoTotalOrden(a)
  )[0] ?? null;

  // Agrupaciones mediante reduce y Record
  const desglosePorTipoServicio = ordenes.reduce((acc, o) => {
    acc[o.tipoServicio] = (acc[o.tipoServicio] ?? 0) + 1;
    return acc;
  }, TIPOS_SERVICIO.reduce((acc, s) => ({ ...acc, [s]: 0 }), {} as Record<TipoServicio, number>));

  const desglosePorEstado = ordenes.reduce((acc, o) => {
    acc[o.estado] = (acc[o.estado] ?? 0) + 1;
    return acc;
  }, ESTADOS_ORDEN.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EstadoOrden, number>));

  return {
    totalOrdenes: ordenes.length,
    ordenesEntregadasCount,
    porcentajeFinalizacion,
    facturacionTotalUSD,
    ingresoPromedioPorOrdenUSD,
    ordenMasCostosa,
    desglosePorTipoServicio,
    desglosePorEstado
  };
}

export class ServicioCRMTallerMotos {
  private readonly contenedor = new ContenedorCRMTaller<OrdenTrabajoTaller>();

  public async procesarCRMAsync(
    registroRaw: CRMRegistroTallerRaw
  ): Promise<ResumenCRMTaller> {
    const advertencias: string[] = [];
    const valRes = await validarCRMRegistroAsync(registroRaw);

    if (!valRes.esValido) {
      advertencias.push(...valRes.errores);
    }

    const idsVistos = new Set<string>();
    const codigosVistos = new Set<string>();

    for (const rawOrden of registroRaw.ordenes) {
      if (idsVistos.has(rawOrden.id)) {
        advertencias.push(`Orden duplicada detectada por ID: ${rawOrden.id}.`);
      } else if (codigosVistos.has(rawOrden.codigoOrden)) {
        advertencias.push(`Codigo de orden duplicado: ${rawOrden.codigoOrden}.`);
      } else {
        idsVistos.add(rawOrden.id);
        codigosVistos.add(rawOrden.codigoOrden);
        this.contenedor.agregar(rawOrden);
      }
    }

    const ordenesValidas = this.contenedor.obtenerTodos();
    const metricas = calcularMetricasCRM(ordenesValidas);

    const deteniendose = ordenesValidas.filter((o) => o.estado === 'EsperandoRepuestos');
    if (deteniendose.length > 0) {
      advertencias.push(
        `Alerta de inventario: Se detectaron ${deteniendose.length} orden(es) detenidas esperando repuestos.`
      );
    }

    return {
      tallerId: registroRaw.id,
      nombreTaller: registroRaw.nombreTaller,
      totalOrdenesValidas: ordenesValidas.length,
      metricas,
      ordenesProcesadas: ordenesValidas,
      advertencias
    };
  }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenCRM(resumen: ResumenCRMTaller, tituloCaso: string): void {
  console.log(`\n======================================================================`);
  console.log(` MINI CRM DE TALLER DE MOTOS - ${tituloCaso.toUpperCase()}`);
  console.log(`======================================================================`);
  console.log(`Nombre Taller       : ${resumen.nombreTaller}`);
  console.log(`ID Taller           : ${resumen.tallerId}`);
  console.log(`Ordenes Validadas   : ${resumen.totalOrdenesValidas}`);
  console.log(`Facturacion Total   : $${resumen.metricas.facturacionTotalUSD.toLocaleString()} USD`);
  console.log(`Promedio / Orden    : $${resumen.metricas.ingresoPromedioPorOrdenUSD.toLocaleString()} USD`);
  console.log(`Tasa de Entrega     : ${resumen.metricas.ordenesEntregadasCount} de ${resumen.metricas.totalOrdenes} (${resumen.metricas.porcentajeFinalizacion}%)`);
  console.log(`Orden Mas Costosa   : ${resumen.metricas.ordenMasCostosa ? `"${resumen.metricas.ordenMasCostosa.codigoOrden}" ($${calcularCostoTotalOrden(resumen.metricas.ordenMasCostosa)} USD - ${resumen.metricas.ordenMasCostosa.vehiculo.marca} ${resumen.metricas.ordenMasCostosa.vehiculo.modelo})` : 'N/A'}`);
  console.log(`----------------------------------------------------------------------`);

  if (resumen.advertencias.length > 0) {
    console.log(`ADVERTENCIAS DE TALLER (${resumen.advertencias.length}):`);
    resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
    console.log(`----------------------------------------------------------------------`);
  }

  console.log(`DESGLOSE POR TIPO DE SERVICIO:`);
  Object.entries(resumen.metricas.desglosePorTipoServicio).forEach(([servicio, cantidad]) => {
    console.log(`   - ${servicio.padEnd(24)}: ${cantidad}`);
  });
  console.log(`----------------------------------------------------------------------`);

  console.table(
    resumen.ordenesProcesadas.map((o) => ({
      Codigo: o.codigoOrden,
      Cliente: o.cliente.nombreCompleto,
      Motocicleta: `${o.vehiculo.marca} ${o.vehiculo.modelo} (${o.vehiculo.cilindrajeCC}cc)`,
      Placa: o.vehiculo.placa,
      Servicio: o.tipoServicio,
      Prioridad: o.prioridad,
      'Costo Total': `$${calcularCostoTotalOrden(o)} USD`,
      Estado: o.estado
    }))
  );
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite Async/Await)

const c1: ClienteMoto = { id: 'cli-01', nombreCompleto: 'José Rodríguez', telefono: '+502 5555-0101', email: 'jose.rodriguez@example.com' };
const c2: ClienteMoto = { id: 'cli-02', nombreCompleto: 'Carlos Mendoza', telefono: '+502 5555-0202', email: 'carlos.mendoza@example.com' };

const v1: VehiculoMoto = { id: 'veh-01', placa: 'M-101ABC', marca: 'Yamaha', modelo: 'MT-09', cilindrajeCC: 890, kilometrajeKM: 15400 };
const v2: VehiculoMoto = { id: 'veh-02', placa: 'M-202DEF', marca: 'Kawasaki', modelo: 'Z900', cilindrajeCC: 948, kilometrajeKM: 8200 };

const i1: ItemSello = { id: 'item-01', descripcion: 'Cambio de Aceite Sintetico 10W40 y Filtro', costoRepuestoUSD: 45.0, manoObraUSD: 25.0 };
const i2: ItemServicio = { id: 'item-02', descripcion: 'Limpieza e Inyeccion Diagnostico ECU', costoRepuestoUSD: 15.0, manoObraUSD: 50.0 };
const i3: ItemServicio = { id: 'item-03', descripcion: 'Kit de Arrastre y Cadena Reforzada', costoRepuestoUSD: 120.0, manoObraUSD: 40.0 };

type ItemSello = ItemServicio;

const o1: OrdenTrabajoTaller = {
  id: 'ord-01',
  codigoOrden: 'ORD-2026-001',
  cliente: c1,
  vehiculo: v1,
  tipoServicio: 'MantenimientoPreventivo',
  prioridad: 'Media',
  estado: 'Entregado',
  items: [i1, i2],
  observaciones: 'Mantenimiento de los 15,000 km completado con exito.',
  fechaIngreso: '2026-11-01'
};

const o2: OrdenTrabajoTaller = {
  id: 'ord-02',
  codigoOrden: 'ORD-2026-002',
  cliente: c2,
  vehiculo: v2,
  tipoServicio: 'FrenosYSuspension',
  prioridad: 'Alta',
  estado: 'EsperandoRepuestos',
  items: [i3],
  observaciones: 'Esperando importacion de sprocket trasero.',
  fechaIngreso: '2026-11-05'
};

// --- CASO 1: Operaciones Normales de Taller de Motos (Caso Normal) ---
const crmNormal: CRMRegistroTallerRaw = {
  id: 'TALLER-MADNESS-01',
  nombreTaller: 'Madness Moto Service & Performance',
  direccion: 'Calzada Roosevelt 12-45, Ciudad de Guatemala',
  ordenes: [o1, o2]
};

// --- CASO 2: Cilindraje Inválido, Costo Negativo y Orden Duplicada (Caso Límite) ---
const vehiculoCorrupto: VehiculoMoto = {
  id: 'veh-99',
  placa: 'M-ERR999',
  marca: 'Genérica',
  modelo: 'ErrorModel',
  cilindrajeCC: -250, // Cilindraje negativo -> Invalido
  kilometrajeKM: -100 // Kilometraje negativo -> Invalido
};

const ordenCorrupta: OrdenTrabajoTaller = {
  id: 'ord-99',
  codigoOrden: 'ORD-ERR-999',
  cliente: { id: 'cli-99', nombreCompleto: '', telefono: '', email: '' }, // Nombre vacio -> Invalido
  vehiculo: vehiculoCorrupto,
  tipoServicio: 'ReparacionMotor',
  prioridad: 'Urgente',
  estado: 'EnDiagnostico',
  items: [
    { id: 'item-99', descripcion: 'Repuesto Error', costoRepuestoUSD: -50.0, manoObraUSD: -20.0 } // Costo negativo -> Invalido
  ],
  observaciones: 'Orden con datos invalidos de prueba',
  fechaIngreso: '2026-11-08'
};

const crmLimiteCorrupto: CRMRegistroTallerRaw = {
  id: 'TALLER-FAIL-02',
  nombreTaller: 'Taller Con Datos Inconsistentes',
  direccion: 'Zona Industrial Desconocida',
  ordenes: [
    o1,
    ordenCorrupta,
    o1 // Orden duplicada
  ]
};

async function ejecutarPruebas(): Promise<void> {
  const servicio = new ServicioCRMTallerMotos();

  // Ejecución Caso 1
  const resumenNormal = await servicio.procesarCRMAsync(crmNormal);
  mostrarResumenCRM(resumenNormal, 'Caso Normal - Madness Moto Service');

  // Ejecución Caso 2
  const resumenLimite = await servicio.procesarCRMAsync(crmLimiteCorrupto);
  mostrarResumenCRM(resumenLimite, 'Caso Limite - Cilindraje Invalido y Costos Negativos');
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecucion:', err));