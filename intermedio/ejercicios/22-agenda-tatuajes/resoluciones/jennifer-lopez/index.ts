export {};

type EstiloTatuaje = 'Blackwork' | 'Realismo' | 'Neotradicional' | 'Fine Line' | 'Japones Irezumi';
type EstadoCitaTatuaje = 'Confirmada' | 'AnticipoPendiente' | 'Completada' | 'Cancelada';

interface SesionTatuaje {
  readonly citaId: string;
  readonly cliente: string;
  readonly tatuador: string;
  readonly estilo: EstiloTatuaje;
  readonly zonaCuerpo: string;
  readonly horasEstimadas: number;
  readonly tarifaPorHoraUSD: number;
  readonly anticipoPagadoUSD: number;
  readonly estado: EstadoCitaTatuaje;
}

interface ResumenAgrupadoEstilo {
  readonly estilo: EstiloTatuaje;
  readonly totalSesiones: number;
  readonly horasTotalesAgendadas: number;
  readonly ingresosProyectadosUSD: number;
  readonly saldoPendienteCobroUSD: number;
  readonly tatuadoresAsignados: readonly string[];
}

const agendaEstudioObsidiana: readonly SesionTatuaje[] = [
  {
    citaId: "TAT-201",
    cliente: "Valeria Sotomayor",
    tatuador: "Kenji Sato",
    estilo: "Japones Irezumi",
    zonaCuerpo: "Espalda completa",
    horasEstimadas: 6,
    tarifaPorHoraUSD: 140,
    anticipoPagadoUSD: 250,
    estado: "Confirmada",
  },
  {
    citaId: "TAT-202",
    cliente: "Bastian Lindqvist",
    tatuador: "Elena Rostova",
    estilo: "Blackwork",
    zonaCuerpo: "Antebrazo izquierdo",
    horasEstimadas: 4,
    tarifaPorHoraUSD: 120,
    anticipoPagadoUSD: 150,
    estado: "Completada",
  },
  {
    citaId: "TAT-203",
    cliente: "Tazio Moretti",
    tatuador: "Dante Alighieri",
    estilo: "Realismo",
    zonaCuerpo: "Hombro y bíceps",
    horasEstimadas: 5,
    tarifaPorHoraUSD: 150,
    anticipoPagadoUSD: 300,
    estado: "Confirmada",
  },
  {
    citaId: "TAT-204",
    cliente: "Marisol Hincapie",
    tatuador: "Elena Rostova",
    estilo: "Blackwork",
    zonaCuerpo: "Costillas",
    horasEstimadas: 3,
    tarifaPorHoraUSD: 120,
    anticipoPagadoUSD: 100,
    estado: "Confirmada",
  },
  {
    citaId: "TAT-205",
    cliente: "Gael Aramburu",
    tatuador: "Sora Takahashi",
    estilo: "Fine Line",
    zonaCuerpo: "Clavícula",
    horasEstimadas: 2,
    tarifaPorHoraUSD: 110,
    anticipoPagadoUSD: 60,
    estado: "Completada",
  },
  {
    citaId: "TAT-206",
    cliente: "Cillian Vance",
    tatuador: "Dante Alighieri",
    estilo: "Neotradicional",
    zonaCuerpo: "Gemelo derecho",
    horasEstimadas: 4,
    tarifaPorHoraUSD: 130,
    anticipoPagadoUSD: 0,
    estado: "Cancelada",
  }
];

function validarCitaActiva(cita: SesionTatuaje): boolean {
  return cita.estado !== "Cancelada" && cita.horasEstimadas > 0 && cita.tarifaPorHoraUSD > 0;
}

function agruparPorEstiloTatuaje(citas: readonly SesionTatuaje[]): Record<EstiloTatuaje, readonly SesionTatuaje[]> {
  const estadoInicial: Record<EstiloTatuaje, readonly SesionTatuaje[]> = {
    'Blackwork': [],
    'Realismo': [],
    'Neotradicional': [],
    'Fine Line': [],
    'Japones Irezumi': [],
  };

  return citas.reduce(
    (acumulado, cita) => ({
      ...acumulado,
      [cita.estilo]: [...acumulado[cita.estilo], cita],
    }),
    estadoInicial
  );
}

function calcularMetricasEstilo(
  estilo: EstiloTatuaje,
  citas: readonly SesionTatuaje[]
): ResumenAgrupadoEstilo {
  const horasTotales = citas.reduce((acc, c) => acc + c.horasEstimadas, 0);
  const ingresosTotales = citas.reduce((acc, c) => acc + c.horasEstimadas * c.tarifaPorHoraUSD, 0);
  const anticiposTotales = citas.reduce((acc, c) => acc + c.anticipoPagadoUSD, 0);
  const artistasUnicos = Array.from(new Set(citas.map(c => c.tatuador)));

  return {
    estilo,
    totalSesiones: citas.length,
    horasTotalesAgendadas: horasTotales,
    ingresosProyectadosUSD: Number(ingresosTotales.toFixed(2)),
    saldoPendienteCobroUSD: Number((ingresosTotales - anticiposTotales).toFixed(2)),
    tatuadoresAsignados: artistasUnicos,
  };
}

function procesarAgendaTatuajes(citas: readonly SesionTatuaje[]): readonly ResumenAgrupadoEstilo[] {
  const citasValidas = citas.filter(validarCitaActiva);
  const agrupadas = agruparPorEstiloTatuaje(citasValidas);
  const estilos = Object.keys(agrupadas) as EstiloTatuaje[];

  return estilos
    .filter(estilo => agrupadas[estilo].length > 0)
    .map(estilo => calcularMetricasEstilo(estilo, agrupadas[estilo]))
    .sort((a, b) => b.ingresosProyectadosUSD - a.ingresosProyectadosUSD);
}

function imprimirReporteAgenda(titulo: string, resumen: readonly ResumenAgrupadoEstilo[]): void {
  console.log(`=== [AGENDA DE TATUAJES] ${titulo} ===`);
  resumen.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Estilo: ${item.estilo} | Sesiones: ${item.totalSesiones} | Horas: ${item.horasTotalesAgendadas}h | Total Proyectado: $${item.ingresosProyectadosUSD.toFixed(2)} | Saldo Pendiente: $${item.saldoPendienteCobroUSD.toFixed(2)} | Artistas: ${item.tatuadoresAsignados.join(', ')}`
    );
  });
  console.log("=================================================================================\n");
}

const reporteAgendaOficial = procesarAgendaTatuajes(agendaEstudioObsidiana);
imprimirReporteAgenda("Resumen Agrupado por Estilo Artístico", reporteAgendaOficial);

// Caso: Proyecto de cuerpo completo de múltiples sesiones con anticipo cubriendo la totalidad del servicio
const citasCasoProyectoCompleto: readonly SesionTatuaje[] = [
  {
    citaId: "TAT-999",
    cliente: "Soren Vestergaard",
    tatuador: "Kenji Sato",
    estilo: "Japones Irezumi",
    zonaCuerpo: "Traje corporal tradicional (Horimono)",
    horasEstimadas: 12,
    tarifaPorHoraUSD: 160,
    anticipoPagadoUSD: 1920,
    estado: "Confirmada",
  }
];

const resultadoProyectoCompleto = procesarAgendaTatuajes(citasCasoProyectoCompleto);
imprimirReporteAgenda("Caso: Proyecto Integral Liquidado por Adelantado", resultadoProyectoCompleto);