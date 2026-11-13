export {};

type TipoServicioMoto = 'Cambio de Aceite y Filtro' | 'Kit de Arrastre' | 'Sistema de Frenos' | 'Calibracion de Valvulas' | 'Revision Electrica General';
type EstadoMantenimiento = 'Pendiente' | 'EnProceso' | 'Completado' | 'Urgente';

interface FichaMantenimientoMoto {
  readonly servicioId: string;
  readonly modeloMotocicleta: string;
  readonly kilometrajeActual: number;
  readonly tipoServicio: TipoServicioMoto;
  readonly costoEstimadoUSD: number;
  readonly horasManoObra: number;
  estado: EstadoMantenimiento;
}

interface ResumenPlanMantenimiento {
  readonly identificador: string;
  readonly motocicleta: string;
  readonly kilometraje: string;
  readonly servicio: TipoServicioMoto;
  readonly costoTotalUSD: number;
  readonly prioridadUrgencia: string;
}

const registroTallerMotosGlobal: readonly FichaMantenimientoMoto[] = [
  {
    servicioId: "MOTO-701",
    modeloMotocicleta: "Yamaha MT-09 Tracer",
    kilometrajeActual: 15000,
    tipoServicio: "Cambio de Aceite y Filtro",
    costoEstimadoUSD: 85.0,
    horasManoObra: 1.5,
    estado: "Completado",
  },
  {
    servicioId: "MOTO-702",
    modeloMotocicleta: "Honda CB650R",
    kilometrajeActual: 24000,
    tipoServicio: "Kit de Arrastre",
    costoEstimadoUSD: 220.0,
    horasManoObra: 3.0,
    estado: "Pendiente",
  },
  {
    servicioId: "MOTO-703",
    modeloMotocicleta: "Kawasaki Z900",
    kilometrajeActual: 32000,
    tipoServicio: "Calibracion de Valvulas",
    costoEstimadoUSD: 350.0,
    horasManoObra: 5.5,
    estado: "Urgente",
  },
  {
    servicioId: "MOTO-704",
    modeloMotocicleta: "Suzuki V-Strom 650",
    kilometrajeActual: 18000,
    tipoServicio: "Sistema de Frenos",
    costoEstimadoUSD: 140.0,
    horasManoObra: 2.0,
    estado: "EnProceso",
  },
  {
    servicioId: "MOTO-705",
    modeloMotocicleta: "KTM Duke 390",
    kilometrajeActual: 9500,
    tipoServicio: "Revision Electrica General",
    costoEstimadoUSD: 60.0,
    horasManoObra: 1.0,
    estado: "Completado",
  }
];

function validarServicioActivoMantenimiento(servicio: FichaMantenimientoMoto): boolean {
  return servicio.kilometrajeActual > 0 && servicio.costoEstimadoUSD > 0 && servicio.horasManoObra > 0;
}

function calcularCostoTotalServicio(costoBase: number, horas: number): number {
  const tarifaHoraTaller = 25.0; // USD por hora de mano de obra especializada
  const total = costoBase + (horas * tarifaHoraTaller);
  return Number(total.toFixed(2));
}

function determinarPrioridadUrgencia(kilometraje: number, estado: EstadoMantenimiento): string {
  if (estado === "Urgente" || kilometraje >= 30000) return "Alta Prioridad (Atención Inmediata)";
  if (kilometraje >= 20000) return "Prioridad Media (Mantenimiento Preventivo)";
  return "Mantenimiento Estándar Programado";
}

function procesarPlanMantenimientoMoto(servicios: readonly FichaMantenimientoMoto[]): readonly ResumenPlanMantenimiento[] {
  return servicios
    .filter(validarServicioActivoMantenimiento)
    .map(servicio => {
      const costoTotal = calcularCostoTotalServicio(servicio.costoEstimadoUSD, servicio.horasManoObra);
      return {
        identificador: servicio.servicioId,
        motocicleta: servicio.modeloMotocicleta,
        kilometraje: `${servicio.kilometrajeActual.toLocaleString()} km`,
        servicio: servicio.tipoServicio,
        costoTotalUSD: costoTotal,
        prioridadUrgencia: determinarPrioridadUrgencia(servicio.kilometrajeActual, servicio.estado),
      };
    })
    .sort((a, b) => b.costoTotalUSD - a.costoTotalUSD);
}

function imprimirReporteMantenimiento(titulo: string, resumen: readonly ResumenPlanMantenimiento[]): void {
  console.log(`=== [PLAN DE MANTENIMIENTO MOTO] ${titulo} ===`);
  resumen.forEach((item, indice) => {
    console.log(
      `${indice + 1}. [${item.identificador}] ${item.motocicleta} | Kilometraje: ${item.kilometraje} | Servicio: ${item.servicio} | Costo Total: $${item.costoTotalUSD.toFixed(2)} | Urgencia: ${item.prioridadUrgencia}`
    );
  });
  console.log("=================================================================================\n");
}

const resultadoMantenimientoOficial = procesarPlanMantenimientoMoto(registroTallerMotosGlobal);
imprimirReporteMantenimiento("Planificación General de Servicios en Taller", resultadoMantenimientoOficial);

// Caso: Motocicleta de alto cilindraje con kilometraje crítico y reconstrucción de motor por completo
const servicioCasoLimite: readonly FichaMantenimientoMoto[] = [
  {
    servicioId: "MOTO-9999",
    modeloMotocicleta: "BMW S1000RR Superbike",
    kilometrajeActual: 50000,
    tipoServicio: "Calibracion de Valvulas",
    costoEstimadoUSD: 850.0,
    horasManoObra: 10.0,
    estado: "Urgente",
  }
];

const resultadoLimite = procesarPlanMantenimientoMoto(servicioCasoLimite);
imprimirReporteMantenimiento("Caso: Servicio de Alta Complejidad y Desgaste Crítico", resultadoLimite);