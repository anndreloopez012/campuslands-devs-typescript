export {};

type ZonaRestaurante = 'Salon Principal' | 'Terraza Panoramica' | 'Cava Privada' | 'Barra Degustacion';
type EstadoReserva = 'Confirmada' | 'Pendiente' | 'EnCurso' | 'Completada' | 'Cancelada';

interface FichaReservaRestaurante {
  readonly reservaId: string;
  readonly titularReserva: string;
  readonly fechaHoraIso: string;
  readonly zona: ZonaRestaurante;
  readonly cantidadComensales: number;
  readonly consumoEstimadoUSD: number;
  readonly requerimientosEspeciales: string;
  estado: EstadoReserva;
}

interface ResumenReservaProcesada {
  readonly identificador: string;
  readonly comensalTitular: string;
  readonly zonaAsignada: ZonaRestaurante;
  readonly fechaProgramada: string;
  readonly totalComensales: number;
  readonly tarifaServicioIncluidaUSD: number;
  readonly clasificacionMesa: string;
}

class GestorReservasGenerico<T extends { readonly reservaId: string }> {
  private readonly registros: readonly T[];

  constructor(datosIniciales: readonly T[]) {
    this.registros = [...datosIniciales];
  }

  public filtrarPorRegla(predicado: (item: T) => boolean): readonly T[] {
    return this.registros.filter(predicado);
  }

  public obtenerTodos(): readonly T[] {
    return [...this.registros];
  }
}

const agendaReservasBistroGlobal: readonly FichaReservaRestaurante[] = [
  {
    reservaId: "RES-4101",
    titularReserva: "Tazio Moretti",
    fechaHoraIso: "2026-11-14T20:00:00",
    zona: "Terraza Panoramica",
    cantidadComensales: 4,
    consumoEstimadoUSD: 320.0,
    requerimientosEspeciales: "Menú degustación sin mariscos",
    estado: "Confirmada",
  },
  {
    reservaId: "RES-4102",
    titularReserva: "Kaelen Vestergaard",
    fechaHoraIso: "2026-11-14T21:30:00",
    zona: "Cava Privada",
    cantidadComensales: 8,
    consumoEstimadoUSD: 1150.0,
    requerimientosEspeciales: "Maridaje sommelier privado",
    estado: "Confirmada",
  },
  {
    reservaId: "RES-4103",
    titularReserva: "Marisol Hincapié",
    fechaHoraIso: "2026-11-14T19:30:00",
    zona: "Salon Principal",
    cantidadComensales: 2,
    consumoEstimadoUSD: 145.0,
    requerimientosEspeciales: "Ninguno",
    estado: "EnCurso",
  },
  {
    reservaId: "RES-4104",
    titularReserva: "Soren Lindqvist",
    fechaHoraIso: "2026-11-14T20:15:00",
    zona: "Barra Degustacion",
    cantidadComensales: 2,
    consumoEstimadoUSD: 190.0,
    requerimientosEspeciales: "Opción vegetariana estricta",
    estado: "Pendiente",
  },
  {
    reservaId: "RES-4105",
    titularReserva: "Gaelen Thorne",
    fechaHoraIso: "2026-11-14T18:00:00",
    zona: "Salon Principal",
    cantidadComensales: 6,
    consumoEstimadoUSD: 410.0,
    requerimientosEspeciales: "Silla infantil requerida",
    estado: "Cancelada",
  }
];

function validarReservaVigente(reserva: FichaReservaRestaurante): boolean {
  return (
    reserva.estado !== "Cancelada" &&
    reserva.cantidadComensales > 0 &&
    reserva.consumoEstimadoUSD >= 0
  );
}

function calcularTotalConServicio(consumoBase: number, comensales: number): number {
  const porcentajePropina = comensales >= 6 ? 0.15 : 0.10;
  return Number((consumoBase * (1 + porcentajePropina)).toFixed(2));
}

function clasificarTipoMesa(comensales: number, zona: ZonaRestaurante): string {
  if (zona === "Cava Privada" || comensales >= 8) return "Banquete VIP Privado";
  if (comensales >= 4) return "Mesa Familiar / Grupal";
  return "Mesa Íntima Estándar";
}

function procesarAgendaRestaurante(reservas: readonly FichaReservaRestaurante[]): readonly ResumenReservaProcesada[] {
  const gestor = new GestorReservasGenerico<FichaReservaRestaurante>(reservas);
  const reservasActivas = gestor.filtrarPorRegla(validarReservaVigente);

  return reservasActivas
    .map(reserva => ({
      identificador: reserva.reservaId,
      comensalTitular: `${reserva.titularReserva} (${reserva.estado})`,
      zonaAsignada: reserva.zona,
      fechaProgramada: reserva.fechaHoraIso.replace("T", " "),
      totalComensales: reserva.cantidadComensales,
      tarifaServicioIncluidaUSD: calcularTotalConServicio(reserva.consumoEstimadoUSD, reserva.cantidadComensales),
      clasificacionMesa: clasificarTipoMesa(reserva.cantidadComensales, reserva.zona),
    }))
    .sort((a, b) => b.tarifaServicioIncluidaUSD - a.tarifaServicioIncluidaUSD);
}

function imprimirReporteReservas(titulo: string, resumen: readonly ResumenReservaProcesada[]): void {
  console.log(`=== [RESERVAS DE RESTAURANTE] ${titulo} ===`);
  resumen.forEach((item, indice) => {
    console.log(
      `${indice + 1}. [${item.identificador}] ${item.comensalTitular} | Zona: ${item.zonaAsignada} | Fecha: ${item.fechaProgramada} | Comensales: ${item.totalComensales} | Total c/Servicio: $${item.tarifaServicioIncluidaUSD.toFixed(2)} | Tipo: ${item.clasificacionMesa}`
    );
  });
  console.log("=================================================================================\n");
}

const reporteRestauranteOficial = procesarAgendaRestaurante(agendaReservasBistroGlobal);
imprimirReporteReservas("Control de Ocupación y Facturación Estimada Nocturna", reporteRestauranteOficial);

// Caso: Evento corporativo privado de gala en cava exclusiva para 16 comensales con menú degustación
const reservaCasoLimite: readonly FichaReservaRestaurante[] = [
  {
    reservaId: "RES-9999",
    titularReserva: "Aether Vance (Gala Corporativa)",
    fechaHoraIso: "2026-12-20T21:00:00",
    zona: "Cava Privada",
    cantidadComensales: 16,
    consumoEstimadoUSD: 3800.0,
    requerimientosEspeciales: "Cierre completo de cava y menú de 9 tiempos",
    estado: "Confirmada",
  }
];

const resultadoLimite = procesarAgendaRestaurante(reservaCasoLimite);
imprimirReporteReservas("Caso: Evento Privado de Gala de Alta Capacidad", resultadoLimite);