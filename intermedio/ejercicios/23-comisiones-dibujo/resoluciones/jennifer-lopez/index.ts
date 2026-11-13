export {};

type ClasePersonajeRPG = 'Mago Oscuro' | 'Paladin' | 'Picaro' | 'Guerrero Berserker' | 'Cazador Elfico';
type EstadoComision = 'BocetoAprobado' | 'EnEntintado' | 'ColorFinalizado' | 'Entregada' | 'Cancelada';

interface ComisionArteRPG {
  readonly comisionId: string;
  readonly comisionadoPor: string;
  readonly artistaIllustrador: string;
  readonly clasePersonaje: ClasePersonajeRPG;
  readonly horasTrabajo: number;
  readonly tarifaHoraUSD: number;
  readonly extrasComercialesUSD: number;
  readonly estado: EstadoComision;
}

interface ResumenAgrupadoClaseRPG {
  readonly clasePersonaje: ClasePersonajeRPG;
  readonly totalComisiones: number;
  readonly horasTotalesInvertidas: number;
  readonly ingresosTotalesUSD: number;
  readonly clientesUnicos: readonly string[];
}

const estudioArteValhalla: readonly ComisionArteRPG[] = [
  {
    comisionId: "RPG-501",
    comisionadoPor: "Valeria Sotomayor",
    artistaIllustrador: "Aether Vance",
    clasePersonaje: "Mago Oscuro",
    horasTrabajo: 12,
    tarifaHoraUSD: 35,
    extrasComercialesUSD: 50,
    estado: "Entregada",
  },
  {
    comisionId: "RPG-502",
    comisionadoPor: "Bastian Lindqvist",
    artistaIllustrador: "Soren Vestergaard",
    clasePersonaje: "Paladin",
    horasTrabajo: 15,
    tarifaHoraUSD: 40,
    extrasComercialesUSD: 80,
    estado: "ColorFinalizado",
  },
  {
    comisionId: "RPG-503",
    comisionadoPor: "Tazio Moretti",
    artistaIllustrador: "Aether Vance",
    clasePersonaje: "Picaro",
    horasTrabajo: 10,
    tarifaHoraUSD: 35,
    extrasComercialesUSD: 30,
    estado: "EnEntintado",
  },
  {
    comisionId: "RPG-504",
    comisionadoPor: "Marisol Hincapie",
    artistaIllustrador: "Kenshin Takahashi",
    clasePersonaje: "Guerrero Berserker",
    horasTrabajo: 18,
    tarifaHoraUSD: 45,
    extrasComercialesUSD: 100,
    estado: "Entregada",
  },
  {
    comisionId: "RPG-505",
    comisionadoPor: "Gael Aramburu",
    artistaIllustrador: "Soren Vestergaard",
    clasePersonaje: "Cazador Elfico",
    horasTrabajo: 14,
    tarifaHoraUSD: 38,
    extrasComercialesUSD: 40,
    estado: "BocetoAprobado",
  },
  {
    comisionId: "RPG-506",
    comisionadoPor: "Cillian Vance",
    artistaIllustrador: "Kenshin Takahashi",
    clasePersonaje: "Mago Oscuro",
    horasTrabajo: 8,
    tarifaHoraUSD: 35,
    extrasComercialesUSD: 0,
    estado: "Cancelada",
  }
];

function validarComisionActiva(comision: ComisionArteRPG): boolean {
  return comision.estado !== "Cancelada" && comision.horasTrabajo > 0 && comision.tarifaHoraUSD > 0;
}

function agruparPorClaseRPG(comisiones: readonly ComisionArteRPG[]): Record<ClasePersonajeRPG, readonly ComisionArteRPG[]> {
  const estadoInicial: Record<ClasePersonajeRPG, readonly ComisionArteRPG[]> = {
    'Mago Oscuro': [],
    'Paladin': [],
    'Picaro': [],
    'Guerrero Berserker': [],
    'Cazador Elfico': [],
  };

  return comisiones.reduce(
    (acumulado, comision) => ({
      ...acumulado,
      [comision.clasePersonaje]: [...acumulado[comision.clasePersonaje], comision],
    }),
    estadoInicial
  );
}

function calcularMetricasClaseRPG(
  clasePersonaje: ClasePersonajeRPG,
  comisiones: readonly ComisionArteRPG[]
): ResumenAgrupadoClaseRPG {
  const horasTotales = comisiones.reduce((acc, c) => acc + c.horasTrabajo, 0);
  const ingresosTotales = comisiones.reduce((acc, c) => acc + (c.horasTrabajo * c.tarifaHoraUSD) + c.extrasComercialesUSD, 0);
  const clientesUnicos = Array.from(new Set(comisiones.map(c => c.comisionadoPor)));

  return {
    clasePersonaje,
    totalComisiones: comisiones.length,
    horasTotalesInvertidas: horasTotales,
    ingresosTotalesUSD: Number(ingresosTotales.toFixed(2)),
    clientesUnicos,
  };
}

function procesarComisionesDibujo(comisiones: readonly ComisionArteRPG[]): readonly ResumenAgrupadoClaseRPG[] {
  const comisionesValidas = comisiones.filter(validarComisionActiva);
  const agrupadas = agruparPorClaseRPG(comisionesValidas);
  const clases = Object.keys(agrupadas) as ClasePersonajeRPG[];

  return clases
    .filter(clase => agrupadas[clase].length > 0)
    .map(clase => calcularMetricasClaseRPG(clase, agrupadas[clase]))
    .sort((a, b) => b.ingresosTotalesUSD - a.ingresosTotalesUSD);
}

function imprimirReporteComisiones(titulo: string, resumen: readonly ResumenAgrupadoClaseRPG[]): void {
  console.log(`=== [COMISIONES DE DIBUJO RPG] ${titulo} ===`);
  resumen.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Clase: ${item.clasePersonaje} | Comisiones: ${item.totalComisiones} | Horas: ${item.horasTotalesInvertidas}h | Ingresos: $${item.ingresosTotalesUSD.toFixed(2)} | Clientes: ${item.clientesUnicos.join(', ')}`
    );
  });
  console.log("=================================================================================\n");
}

const reporteComisionesOficial = procesarComisionesDibujo(estudioArteValhalla);
imprimirReporteComisiones("Resumen Agrupado por Clase de Personaje RPG", reporteComisionesOficial);

// Caso: Comisión épica de ilustración completa de grupo con alta complejidad de diseño y múltiples extras
const comisionCasoEpico: readonly ComisionArteRPG[] = [
  {
    comisionId: "RPG-999",
    comisionadoPor: "Soren Vestergaard",
    artistaIllustrador: "Aether Vance",
    clasePersonaje: "Paladin",
    horasTrabajo: 30,
    tarifaHoraUSD: 50,
    extrasComercialesUSD: 250,
    estado: "Entregada",
  }
];

const resultadoEpico = procesarComisionesDibujo(comisionCasoEpico);
imprimirReporteComisiones("Caso: Ilustración Épica de Gran Escala", resultadoEpico);