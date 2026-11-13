export {};

type TipoActividad = 'Excursion Cultural' | 'Aventura Extrema' | 'Gastronomia Local' | 'Traslado Aeropuerto' | 'Descanso';
type EstadoReserva = 'Confirmada' | 'PendientePago' | 'Cancelada' | 'Completada';

interface GastoAdicional {
  readonly concepto: string;
  readonly costoUSD: number;
}

interface FichaActividadItinerario {
  readonly actividadId: string;
  readonly tituloActividad: string;
  readonly destino: string;
  readonly tipo: TipoActividad;
  readonly duracionHoras: number;
  readonly costoBaseUSD: number;
  readonly gastosExtra: readonly GastoAdicional[];
  estado: EstadoReserva;
}

interface ResumenItinerarioViaje {
  readonly actividad: string;
  readonly destino: string;
  readonly costoTotalUSD: string;
  readonly duracionTotalFormato: string;
  readonly clasificacionExperiencia: string;
}

const expedienteExpedicionTokio: readonly FichaActividadItinerario[] = [
  {
    actividadId: "TRV-301",
    tituloActividad: "Tour Nocturno por Templos de Kioto",
    destino: "Kioto, Japón",
    tipo: "Excursion Cultural",
    duracionHoras: 4.5,
    costoBaseUSD: 120.0,
    gastosExtra: [
      { concepto: "Guía bilingüe privado", costoUSD: 45.0 },
      { concepto: "Entrada a jardines zen", costoUSD: 25.0 }
    ],
    estado: "Confirmada",
  },
  {
    actividadId: "TRV-302",
    tituloActividad: "Ascenso al Monte Fuji y Trekking Alpino",
    destino: "Yamanashi, Japón",
    tipo: "Aventura Extrema",
    duracionHoras: 8.0,
    costoBaseUSD: 250.0,
    gastosExtra: [
      { concepto: "Alquiler de equipo térmico", costoUSD: 60.0 },
      { concepto: "Seguro de montaña", costoUSD: 35.0 }
    ],
    estado: "Confirmada",
  },
  {
    actividadId: "TRV-303",
    tituloActividad: "Clase Magistral de Ramen Tradicional",
    destino: "Shinjuku, Tokio",
    tipo: "Gastronomia Local",
    duracionHoras: 3.0,
    costoBaseUSD: 95.0,
    gastosExtra: [
      { concepto: "Kit de cuchillos de cocina", costoUSD: 80.0 }
    ],
    estado: "Confirmada",
  },
  {
    actividadId: "TRV-304",
    tituloActividad: "Traslado Shinkansen Estación Central",
    destino: "Tokio - Osaka",
    tipo: "Traslado Aeropuerto",
    duracionHoras: 2.5,
    costoBaseUSD: 140.0,
    gastosExtra: [],
    estado: "Confirmada",
  },
  {
    actividadId: "TRV-305",
    tituloActividad: "Sesión de Spa Termal Onsen Privado",
    destino: "Hakone, Japón",
    tipo: "Descanso",
    duracionHoras: 3.0,
    costoBaseUSD: 180.0,
    gastosExtra: [
      { concepto: "Masaje aromático relajante", costoUSD: 90.0 }
    ],
    estado: "PendientePago",
  }
];

function validarActividadItinerario(actividad: FichaActividadItinerario): boolean {
  return actividad.estado !== "Cancelada" && actividad.costoBaseUSD > 0;
}

function calcularCostoTotalActividad(actividad: FichaActividadItinerario): number {
  const totalExtra = actividad.gastosExtra.reduce(
    (acumulado, gasto) => acumulado + gasto.costoUSD,
    0
  );
  return Number((actividad.costoBaseUSD + totalExtra).toFixed(2));
}

function formatearDuracionHoras(horas: number): string {
  const horasCompletas = Math.floor(horas);
  const minutos = (horas - horasCompletas) * 60;
  if (minutos > 0) {
    return `${horasCompletas}h ${minutos}m`;
  }
  return `${horasCompletas} horas`;
}

function clasificarExperienciaViaje(costoTotal: number, duracion: number): string {
  if (costoTotal >= 350 && duracion >= 6) return "Expedición Premium de Alto Impacto";
  if (costoTotal >= 150) return "Experiencia Turística Destacada";
  return "Actividad Recreativa Estándar";
}

function procesarItinerarioViaje(actividades: readonly FichaActividadItinerario[]): readonly ResumenItinerarioViaje[] {
  return actividades
    .filter(validarActividadItinerario)
    .map(actividad => {
      const costoTotal = calcularCostoTotalActividad(actividad);
      return {
        actividad: `${actividad.tituloActividad} [${actividad.actividadId}]`,
        destino: actividad.destino,
        costoTotalUSD: `$${costoTotal.toFixed(2)}`,
        duracionTotalFormato: formatearDuracionHoras(actividad.duracionHoras),
        clasificacionExperiencia: clasificarExperienciaViaje(costoTotal, actividad.duracionHoras),
      };
    })
    .sort((a, b) => parseFloat(b.costoTotalUSD.replace('$', '')) - parseFloat(a.costoTotalUSD.replace('$', '')));
}

function imprimirReporteItinerario(titulo: string, resumen: readonly ResumenItinerarioViaje[]): void {
  console.log(`=== [ITINERARIO DE VIAJE] ${titulo} ===`);
  resumen.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Actividad: ${item.actividad} (${item.destino}) | Costo Total: ${item.costoTotalUSD} | Duración: ${item.duracionTotalFormato} | Categoría: ${item.clasificacionExperiencia}`
    );
  });
  console.log("=================================================================================\n");
}

const itinerarioOficialAsignado = procesarItinerarioViaje(expedienteExpedicionTokio);
imprimirReporteItinerario("Planificación Oficial de Actividades en Destino", itinerarioOficialAsignado);

// Caso: Excursión VIP exclusiva de larga duración con costos elevados por servicios personalizados
const itinerarioCasoExtremo: readonly FichaActividadItinerario[] = [
  {
    actividadId: "TRV-999",
    tituloActividad: "Tour Privado en Helicóptero sobre el Archipiélago",
    destino: "Tokio Sky View, Japón",
    tipo: "Aventura Extrema",
    duracionHoras: 6.0,
    costoBaseUSD: 1250.0,
    gastosExtra: [
      { concepto: "Copa de champaña de altura", costoUSD: 150.0 },
      { concepto: "Fotografía y video profesional 4K", costoUSD: 200.0 }
    ],
    estado: "Confirmada",
  }
];

const resultadoExtremo = procesarItinerarioViaje(itinerarioCasoExtremo);
imprimirReporteItinerario("Caso: Excursión VIP Exclusiva de Alta Gama", resultadoExtremo);