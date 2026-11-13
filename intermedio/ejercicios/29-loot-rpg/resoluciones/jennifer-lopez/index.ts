export {};

type RarezaLoot = 'Mitico' | 'Legendario' | 'Epico' | 'Raro' | 'Comun';
type CategoriaObjetoBR = 'ArmaPrincipal' | 'EscudoEnergetico' | 'ConsumibleTactico' | 'AccesorioOptico';
type EstadoBotin = 'DisponibleMapa' | 'EquipadoJugador' | 'DropAereo' | 'Desintegrado';

interface FichaObjetoLoot {
  readonly itemId: string;
  readonly nombreObjeto: string;
  readonly categoria: CategoriaObjetoBR;
  readonly rareza: RarezaLoot;
  readonly puntuacionPoder: number;
  readonly pesoMochilaKg: number;
  readonly portadorActual: string;
  estado: EstadoBotin;
}

interface ResumenAgrupadoRarezaLoot {
  readonly rareza: RarezaLoot;
  readonly cantidadObjetos: number;
  readonly poderTotalAcumulado: number;
  readonly pesoPromedioKg: number;
  readonly portadoresUnicos: readonly string[];
}

const inventarioZonaAterrizaje: readonly FichaObjetoLoot[] = [
  {
    itemId: "LOT-901",
    nombreObjeto: "Rifle de Plasma Nemesis",
    categoria: "ArmaPrincipal",
    rareza: "Mitico",
    puntuacionPoder: 980,
    pesoMochilaKg: 4.5,
    portadorActual: "Kaelen Vance",
    estado: "DropAereo",
  },
  {
    itemId: "LOT-902",
    nombreObjeto: "Coraza Evolutiva Nivel 5",
    categoria: "EscudoEnergetico",
    rareza: "Legendario",
    puntuacionPoder: 850,
    pesoMochilaKg: 3.2,
    portadorActual: "Lyra Vestergaard",
    estado: "EquipadoJugador",
  },
  {
    itemId: "LOT-903",
    nombreObjeto: "Subfusil Voltio Vector",
    categoria: "ArmaPrincipal",
    rareza: "Epico",
    puntuacionPoder: 640,
    pesoMochilaKg: 2.8,
    portadorActual: "Tazio Moretti",
    estado: "EquipadoJugador",
  },
  {
    itemId: "LOT-904",
    nombreObjeto: "Batería de Escudo Fénix",
    categoria: "ConsumibleTactico",
    rareza: "Legendario",
    puntuacionPoder: 500,
    pesoMochilaKg: 1.5,
    portadorActual: "Kaelen Vance",
    estado: "DisponibleMapa",
  },
  {
    itemId: "LOT-905",
    nombreObjeto: "Mira Digital Térmica 4x",
    categoria: "AccesorioOptico",
    rareza: "Raro",
    puntuacionPoder: 320,
    pesoMochilaKg: 0.6,
    portadorActual: "Lyra Vestergaard",
    estado: "EquipadoJugador",
  },
  {
    itemId: "LOT-906",
    nombreObjeto: "Pistola Táctica P2020",
    categoria: "ArmaPrincipal",
    rareza: "Comun",
    puntuacionPoder: 110,
    pesoMochilaKg: 1.1,
    portadorActual: "Ninguno",
    estado: "Desintegrado",
  }
];

function validarObjetoLootActivo(objeto: FichaObjetoLoot): boolean {
  return objeto.estado !== "Desintegrado" && objeto.puntuacionPoder > 0 && objeto.pesoMochilaKg > 0;
}

function agruparPorRarezaLoot(objetos: readonly FichaObjetoLoot[]): Record<RarezaLoot, readonly FichaObjetoLoot[]> {
  const estadoInicial: Record<RarezaLoot, readonly FichaObjetoLoot[]> = {
    'Mitico': [],
    'Legendario': [],
    'Epico': [],
    'Raro': [],
    'Comun': [],
  };

  return objetos.reduce(
    (acumulado, objeto) => ({
      ...acumulado,
      [objeto.rareza]: [...acumulado[objeto.rareza], objeto],
    }),
    estadoInicial
  );
}

function calcularEstadisticasRarezaLoot(
  rareza: RarezaLoot,
  objetos: readonly FichaObjetoLoot[]
): ResumenAgrupadoRarezaLoot {
  const poderTotal = objetos.reduce((acc, item) => acc + item.puntuacionPoder, 0);
  const pesoTotal = objetos.reduce((acc, item) => acc + item.pesoMochilaKg, 0);
  const portadoresUnicos = Array.from(
    new Set(objetos.map(item => item.portadorActual).filter(nombre => nombre !== "Ninguno"))
  );

  return {
    rareza,
    cantidadObjetos: objetos.length,
    poderTotalAcumulado: poderTotal,
    pesoPromedioKg: Number((pesoTotal / objetos.length).toFixed(2)),
    portadoresUnicos,
  };
}

function procesarSistemaLootRPG(objetos: readonly FichaObjetoLoot[]): readonly ResumenAgrupadoRarezaLoot[] {
  const objetosValidos = objetos.filter(validarObjetoLootActivo);
  const agrupados = agruparPorRarezaLoot(objetosValidos);
  const rarezas = Object.keys(agrupados) as RarezaLoot[];

  return rarezas
    .filter(rareza => agrupados[rareza].length > 0)
    .map(rareza => calcularEstadisticasRarezaLoot(rareza, agrupados[rareza]))
    .sort((a, b) => b.poderTotalAcumulado - a.poderTotalAcumulado);
}

function imprimirReporteLoot(titulo: string, resumen: readonly ResumenAgrupadoRarezaLoot[]): void {
  console.log(`=== [SISTEMA DE LOOT RPG BATTLE ROYALE] ${titulo} ===`);
  resumen.forEach((item, indice) => {
    const listaPortadores = item.portadoresUnicos.length > 0 ? item.portadoresUnicos.join(', ') : 'Sin asignar';
    console.log(
      `${indice + 1}. Rareza: ${item.rareza} | Objetos: ${item.cantidadObjetos} | Poder Total: ${item.poderTotalAcumulado} pts | Peso Promedio: ${item.pesoPromedioKg} kg | Portadores: ${listaPortadores}`
    );
  });
  console.log("=================================================================================\n");
}

const reporteLootOficial = procesarSistemaLootRPG(inventarioZonaAterrizaje);
imprimirReporteLoot("Resumen Agrupado por Nivel de Rareza", reporteLootOficial);

// Caso: Suministro aéreo de bóveda final con múltiples reliquias míticas de altísimo poder
const lootCasoBovedaFinal: readonly FichaObjetoLoot[] = [
  {
    itemId: "LOT-998",
    nombreObjeto: "Cañón Orbital Portátil",
    categoria: "ArmaPrincipal",
    rareza: "Mitico",
    puntuacionPoder: 1500,
    pesoMochilaKg: 8.5,
    portadorActual: "Kaelen Vance",
    estado: "DropAereo",
  },
  {
    itemId: "LOT-999",
    nombreObjeto: "Módulo de Regeneración Cuántica",
    categoria: "ConsumibleTactico",
    rareza: "Mitico",
    puntuacionPoder: 1200,
    pesoMochilaKg: 1.0,
    portadorActual: "Soren Vestergaard",
    estado: "EquipadoJugador",
  }
];

const resultadoBovedaFinal = procesarSistemaLootRPG(lootCasoBovedaFinal);
imprimirReporteLoot("Caso: Botín de Bóveda Final de Alta Potencia", resultadoBovedaFinal);