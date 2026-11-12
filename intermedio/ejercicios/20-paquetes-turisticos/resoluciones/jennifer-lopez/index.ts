export {};

type RegionDestino = 'Europa Mediterranea' | 'Sudeste Asiatico' | 'Patagonia Austral' | 'Caribe Insular' | 'Altiplano Andino';
type EstadoPaquete = 'Disponible' | 'CuposLimitados' | 'Agotado' | 'TemporadaBaja';

interface ServicioIncluido {
  readonly codigoServicio: string;
  readonly descripcion: string;
  readonly valorEstimadoUSD: number;
}

interface PaqueteTuristico {
  readonly paqueteId: string;
  readonly nombrePaquete: string;
  readonly agenciaOperadora: string;
  readonly region: RegionDestino;
  readonly duracionDias: number;
  readonly precioBaseUSD: number;
  readonly impuestosTasasUSD: number;
  readonly calificacionViajeros: number;
  readonly serviciosIncluidos: readonly ServicioIncluido[];
  estado: EstadoPaquete;
}

interface EvaluacionComparadorTurismo {
  readonly paquete: string;
  readonly region: RegionDestino;
  readonly precioFinalUSD: number;
  readonly costoPorDiaUSD: number;
  readonly indiceCalidadPrecio: number;
  readonly recomendacionAgencia: string;
}

const catalogoAgenciasGlobales: readonly PaqueteTuristico[] = [
  {
    paqueteId: "TUR-201",
    nombrePaquete: "Ruta de los Fiordos y Glaciares",
    agenciaOperadora: "Australis Expeditions",
    region: "Patagonia Austral",
    duracionDias: 7,
    precioBaseUSD: 1450.0,
    impuestosTasasUSD: 185.0,
    calificacionViajeros: 9.4,
    serviciosIncluidos: [
      { codigoServicio: "SRV-01", descripcion: "Navegación glaciar Perito Moreno", valorEstimadoUSD: 220.0 },
      { codigoServicio: "SRV-02", descripcion: "Alojamiento refugio de montaña", valorEstimadoUSD: 680.0 },
      { codigoServicio: "SRV-03", descripcion: "Traslados terrestres privados", valorEstimadoUSD: 190.0 }
    ],
    estado: "Disponible",
  },
  {
    paqueteId: "TUR-202",
    nombrePaquete: "Travesía Islas Cícladas y Atenas",
    agenciaOperadora: "Helios Travel Group",
    region: "Europa Mediterranea",
    duracionDias: 8,
    precioBaseUSD: 1890.0,
    impuestosTasasUSD: 240.0,
    calificacionViajeros: 9.1,
    serviciosIncluidos: [
      { codigoServicio: "SRV-04", descripcion: "Ferry rápido entre Santorini y Mykonos", valorEstimadoUSD: 160.0 },
      { codigoServicio: "SRV-05", descripcion: "Tour arqueológico Acrópolis", valorEstimadoUSD: 95.0 }
    ],
    estado: "CuposLimitados",
  },
  {
    paqueteId: "TUR-203",
    nombrePaquete: "Templos de Angkor y Bahía Halong",
    agenciaOperadora: "Indochina Heritage",
    region: "Sudeste Asiatico",
    duracionDias: 10,
    precioBaseUSD: 1320.0,
    impuestosTasasUSD: 150.0,
    calificacionViajeros: 9.6,
    serviciosIncluidos: [
      { codigoServicio: "SRV-06", descripcion: "Crucero nocturno en junco tradicional", valorEstimadoUSD: 340.0 },
      { codigoServicio: "SRV-07", descripcion: "Pases completos complejo Angkor", valorEstimadoUSD: 110.0 },
      { codigoServicio: "SRV-08", descripcion: "Vuelos internos regionales", valorEstimadoUSD: 280.0 }
    ],
    estado: "Disponible",
  },
  {
    paqueteId: "TUR-204",
    nombrePaquete: "Salar de Uyuni y Lagunas Altiplánicas",
    agenciaOperadora: "Andes Nomad",
    region: "Altiplano Andino",
    duracionDias: 5,
    precioBaseUSD: 780.0,
    impuestosTasasUSD: 90.0,
    calificacionViajeros: 8.9,
    serviciosIncluidos: [
      { codigoServicio: "SRV-09", descripcion: "Expedición 4x4 con conductor guía", valorEstimadoUSD: 310.0 },
      { codigoServicio: "SRV-10", descripcion: "Hotel de sal primera noche", valorEstimadoUSD: 180.0 }
    ],
    estado: "TemporadaBaja",
  },
  {
    paqueteId: "TUR-205",
    nombrePaquete: "Arrecifes y Cayos Privados",
    agenciaOperadora: "Coral Blue Resorts",
    region: "Caribe Insular",
    duracionDias: 6,
    precioBaseUSD: 1650.0,
    impuestosTasasUSD: 210.0,
    calificacionViajeros: 8.7,
    serviciosIncluidos: [
      { codigoServicio: "SRV-11", descripcion: "Inmersión guiada de buceo", valorEstimadoUSD: 190.0 }
    ],
    estado: "Agotado",
  }
];

function validarPaqueteDisponible(paquete: PaqueteTuristico): boolean {
  return paquete.estado !== "Agotado" && paquete.duracionDias > 0 && paquete.precioBaseUSD > 0;
}

function calcularPrecioTotalPaquete(paquete: PaqueteTuristico): number {
  return Number((paquete.precioBaseUSD + paquete.impuestosTasasUSD).toFixed(2));
}

function calcularValorServiciosIncluidos(servicios: readonly ServicioIncluido[]): number {
  return servicios.reduce(
    (acumulado, servicio) => acumulado + servicio.valorEstimadoUSD,
    0
  );
}

function calcularIndiceCalidadPrecio(paquete: PaqueteTuristico, precioFinal: number): number {
  const valorAgregado = calcularValorServiciosIncluidos(paquete.serviciosIncluidos);
  const proporcionBeneficio = (valorAgregado / precioFinal) * 100;
  const factorReputacion = paquete.calificacionViajeros * 8;
  const indice = proporcionBeneficio + factorReputacion;
  return Number(indice.toFixed(2));
}

function clasificarRecomendacionTuristica(indice: number, costoDiario: number): string {
  if (indice >= 115 && costoDiario <= 220) return "Mejor Relación Calidad-Precio (Top Elección)";
  if (indice >= 95) return "Paquete Altamente Recomendado";
  if (indice >= 80) return "Opción Equilibrada de Temporada";
  return "Tarifa Estándar de Mercado";
}

function compararPaquetesTuristicos(paquetes: readonly PaqueteTuristico[]): readonly EvaluacionComparadorTurismo[] {
  return paquetes
    .filter(validarPaqueteDisponible)
    .map(paquete => {
      const precioFinal = calcularPrecioTotalPaquete(paquete);
      const costoDiario = Number((precioFinal / paquete.duracionDias).toFixed(2));
      const indice = calcularIndiceCalidadPrecio(paquete, precioFinal);

      return {
        paquete: `${paquete.nombrePaquete} - ${paquete.agenciaOperadora} [${paquete.paqueteId}]`,
        region: paquete.region,
        precioFinalUSD: precioFinal,
        costoPorDiaUSD: costoDiario,
        indiceCalidadPrecio: indice,
        recomendacionAgencia: clasificarRecomendacionTuristica(indice, costoDiario),
      };
    })
    .sort((a, b) => b.indiceCalidadPrecio - a.indiceCalidadPrecio);
}

function imprimirComparativaTurismo(titulo: string, comparativa: readonly EvaluacionComparadorTurismo[]): void {
  console.log(`=== [COMPARADOR DE TURISMO] ${titulo} ===`);
  comparativa.forEach((item, indice) => {
    console.log(
      `${indice + 1}. ${item.paquete} (${item.region}) | Total: $${item.precioFinalUSD.toFixed(2)} ($${item.costoPorDiaUSD.toFixed(2)}/día) | Índice: ${item.indiceCalidadPrecio} | Veredicto: ${item.recomendacionAgencia}`
    );
  });
  console.log("=================================================================================\n");
}

const comparativaOficial = compararPaquetesTuristicos(catalogoAgenciasGlobales);
imprimirComparativaTurismo("Ranking de Paquetes Turísticos Disponibles", comparativaOficial);

// Caso: Expedición de ultra lujo de larga duración con alto porcentaje de servicios incluidos
const paquetesCasoExpedicionLujo: readonly PaqueteTuristico[] = [
  {
    paqueteId: "TUR-999",
    nombrePaquete: "Gran Vuelta Mediterránea en Velero Privado",
    agenciaOperadora: "Poseidon Yachting",
    region: "Europa Mediterranea",
    duracionDias: 14,
    precioBaseUSD: 4200.0,
    impuestosTasasUSD: 480.0,
    calificacionViajeros: 9.8,
    serviciosIncluidos: [
      { codigoServicio: "SRV-91", descripcion: "Tripulación completa y chef a bordo", valorEstimadoUSD: 1800.0 },
      { codigoServicio: "SRV-92", descripcion: "Amarre en puertos exclusivos", valorEstimadoUSD: 950.0 },
      { codigoServicio: "SRV-93", descripcion: "Excursiones privadas en tierra", valorEstimadoUSD: 620.0 }
    ],
    estado: "CuposLimitados",
  }
];

const resultadoExpedicionLujo = compararPaquetesTuristicos(paquetesCasoExpedicionLujo);
imprimirComparativaTurismo("Caso: Travesía de Larga Duración con Servicios Integrales", resultadoExpedicionLujo);