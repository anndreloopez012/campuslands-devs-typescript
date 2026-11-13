export {};

type TipoServicio = 'Mantenimiento Mayor' | 'Sincronizacion' | 'Suspension' | 'Frenos' | 'Overhaul Motor';
type EstadoOrden = 'Pendiente' | 'EnProceso' | 'Finalizada' | 'Cancelada';

interface RepuestoRequerido {
  readonly codigoParte: string;
  readonly descripcion: string;
  readonly costoUnitario: number;
  readonly cantidad: number;
}

interface OrdenTaller {
  readonly ordenId: string;
  readonly cliente: string;
  readonly modeloMotocicleta: string;
  readonly servicio: TipoServicio;
  readonly horasEstimadas: number;
  readonly costoManoObra: number;
  readonly repuestos: readonly RepuestoRequerido[];
  estado: EstadoOrden;
}

interface FacturacionTaller {
  readonly cliente: string;
  readonly motocicleta: string;
  readonly servicioPrincipal: TipoServicio;
  readonly costoTotalFinal: number;
  readonly clasificacionOrden: string;
}

const registroTallerApex: readonly OrdenTaller[] = [
  {
    ordenId: "ORD-701",
    cliente: "Dante Valenzuela",
    modeloMotocicleta: "KTM 390 Duke",
    servicio: "Mantenimiento Mayor",
    horasEstimadas: 6,
    costoManoObra: 150,
    repuestos: [
      { codigoParte: "REP-01", descripcion: "Kit de arrastre reforzado", costoUnitario: 120, cantidad: 1 },
      { codigoParte: "REP-02", descripcion: "Aceite sintético 10W50", costoUnitario: 25, cantidad: 2 }
    ],
    estado: "Finalizada",
  },
  {
    ordenId: "ORD-702",
    cliente: "Valeria Sotomayor",
    modeloMotocicleta: "Yamaha MT-09",
    servicio: "Suspension",
    horasEstimadas: 4,
    costoManoObra: 180,
    repuestos: [
      { codigoParte: "REP-05", descripcion: "Retenes de horquilla invertida", costoUnitario: 45, cantidad: 2 },
      { codigoParte: "REP-06", descripcion: "Aceite de suspensión SAE 10W", costoUnitario: 30, cantidad: 1 }
    ],
    estado: "EnProceso",
  },
  {
    ordenId: "ORD-703",
    cliente: "Eros Morejón",
    modeloMotocicleta: "Kawasaki Z900",
    servicio: "Sincronizacion",
    horasEstimadas: 5,
    costoManoObra: 200,
    repuestos: [
      { codigoParte: "REP-10", descripcion: "Bujías de Iridio", costoUnitario: 22, cantidad: 4 },
      { codigoParte: "REP-11", descripcion: "Filtro de aire alto flujo", costoUnitario: 65, cantidad: 1 }
    ],
    estado: "Finalizada",
  },
  {
    ordenId: "ORD-704",
    cliente: "Marisol Hincapié",
    modeloMotocicleta: "Honda CB650R",
    servicio: "Frenos",
    horasEstimadas: 2,
    costoManoObra: 80,
    repuestos: [
      { codigoParte: "REP-15", descripcion: "Pastillas de freno sinterizadas", costoUnitario: 55, cantidad: 2 }
    ],
    estado: "Pendiente",
  },
  {
    ordenId: "ORD-705",
    cliente: "Gaelen Thorne",
    modeloMotocicleta: "Suzuki GSX-S750",
    servicio: "Overhaul Motor",
    horasEstimadas: 18,
    costoManoObra: 650,
    repuestos: [
      { codigoParte: "REP-20", descripcion: "Juego de juntas completas", costoUnitario: 140, cantidad: 1 },
      { codigoParte: "REP-21", descripcion: "Kit de pistones sobremedida", costoUnitario: 320, cantidad: 1 }
    ],
    estado: "EnProceso",
  }
];

function validarOrdenValida(orden: OrdenTaller): boolean {
  return orden.estado !== "Cancelada" && orden.horasEstimadas > 0;
}

function calcularCostoTotalOrden(orden: OrdenTaller): number {
  const costoRepuestos = orden.repuestos.reduce(
    (acumulado, repuesto) => acumulado + repuesto.costoUnitario * repuesto.cantidad,
    0
  );
  return orden.costoManoObra + costoRepuestos;
}

function clasificarCostoServicio(costoTotal: number): string {
  if (costoTotal >= 800) return "Intervención Mayor de Alta Complejidad";
  if (costoTotal >= 300) return "Mantenimiento Estándar Completo";
  return "Servicio Rápido Menor";
}

function procesarOrdenesTaller(ordenes: readonly OrdenTaller[]): readonly FacturacionTaller[] {
  return ordenes
    .filter(validarOrdenValida)
    .map(orden => {
      const costoFinal = calcularCostoTotalOrden(orden);
      return {
        cliente: orden.cliente,
        motocicleta: `${orden.modeloMotocicleta} [${orden.ordenId}]`,
        servicioPrincipal: orden.servicio,
        costoTotalFinal: costoFinal,
        clasificacionOrden: clasificarCostoServicio(costoFinal),
      };
    })
    .sort((a, b) => b.costoTotalFinal - a.costoTotalFinal);
}

function imprimirReporteTaller(titulo: string, reporte: readonly FacturacionTaller[]): void {
  console.log(`=== [GESTIÓN DE TALLER] ${titulo} ===`);
  reporte.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Cliente: ${item.cliente} | Moto: ${item.motocicleta} | Servicio: ${item.servicioPrincipal} | Total: $${item.costoTotalFinal} | Tipo: ${item.clasificacionOrden}`
    );
  });
  console.log("===============================================================\n");
}

const resultadoProcesamiento = procesarOrdenesTaller(registroTallerApex);
imprimirReporteTaller("Facturación y Costos de Órdenes Activas", resultadoProcesamiento);

// Caso Límite: Órdenes con montos excesivos o repuestos sin stock / valor cero
const ordenesCasoLimite: readonly OrdenTaller[] = [
  {
    ordenId: "ORD-999",
    cliente: "Lysander Stark",
    modeloMotocicleta: "Ducati Streetfighter V4",
    servicio: "Overhaul Motor",
    horasEstimadas: 25,
    costoManoObra: 1200,
    repuestos: [
      { codigoParte: "REP-99", descripcion: "Bloque de motor especial de titanio", costoUnitario: 3500, cantidad: 1 }
    ],
    estado: "Pendiente",
  }
];

const resultadoLimite = procesarOrdenesTaller(ordenesCasoLimite);
imprimirReporteTaller("Caso Overhaul de Alta Gama Extrema", resultadoLimite);