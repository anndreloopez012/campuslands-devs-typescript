export {};

type RarezaLoot = 'Comun' | 'PocoComun' | 'Raro' | 'Epico' | 'Legendario';
type TipoObjetoLoot = 'ArmaAsalto' | 'Francotirador' | 'EscudoCorporal' | 'Botiquin' | 'Granada';
type NivelZonaMapa = 'ZonaCaliente' | 'ZonaTemplada' | 'ZonaSeguraPeriferica';

interface ObjetoLoot {
  readonly lootId: string;
  readonly nombreObjeto: string;
  readonly tipo: TipoObjetoLoot;
  readonly rareza: RarezaLoot;
  readonly valorDanioProteccion: number;
  readonly probabilidadSpawnPct: number;
}

interface SectorMapaBattleRoyale {
  readonly sectorId: string;
  readonly nombreSector: string;
  readonly nivelZona: NivelZonaMapa;
  readonly indicePeligro: number; // 1 a 100
  readonly objetosEncontrados: readonly ObjetoLoot[];
}

interface ReporteMapaLoot {
  readonly sector: string;
  readonly nivelZona: NivelZonaMapa;
  readonly totalObjetosValiosos: number;
  readonly valorPromedioPoder: number;
  readonly indiceRiesgo: number;
  readonly clasificacionZona: 'Recomendado' | 'AltoRiesgo' | 'ZonaMuerta';
}

const registroMapaBunkerLoot: readonly SectorMapaBattleRoyale[] = [
  {
    sectorId: "MAP-5501",
    nombreSector: "Complex Industrial Abandonado",
    nivelZona: "ZonaCaliente",
    indicePeligro: 85,
    objetosEncontrados: [
      { lootId: "L-01", nombreObjeto: "Fusil Tactico MK-12", tipo: "ArmaAsalto", rareza: "Legendario", valorDanioProteccion: 95, probabilidadSpawnPct: 15.0 },
      { lootId: "L-02", nombreObjeto: "Armadura Titan Nivel 3", tipo: "EscudoCorporal", rareza: "Epico", valorDanioProteccion: 90, probabilidadSpawnPct: 25.0 },
      { lootId: "L-03", nombreObjeto: "Botiquin Militar Avanzado", tipo: "Botiquin", rareza: "Raro", valorDanioProteccion: 75, probabilidadSpawnPct: 40.0 }
    ]
  },
  {
    sectorId: "MAP-5502",
    nombreSector: "Estacion de Observacion Estelar",
    nivelZona: "ZonaCaliente",
    indicePeligro: 78,
    objetosEncontrados: [
      { lootId: "L-04", nombreObjeto: "Barrett Calibre 50", tipo: "Francotirador", rareza: "Legendario", valorDanioProteccion: 110, probabilidadSpawnPct: 10.0 },
      { lootId: "L-05", nombreObjeto: "Escudo Energetico Compacto", tipo: "EscudoCorporal", rareza: "Raro", valorDanioProteccion: 60, probabilidadSpawnPct: 50.0 }
    ]
  },
  {
    sectorId: "MAP-5503",
    nombreSector: "Aldea Rural Costera",
    nivelZona: "ZonaTemplada",
    indicePeligro: 40,
    objetosEncontrados: [
      { lootId: "L-06", nombreObjeto: "Subfusil MP-5", tipo: "ArmaAsalto", rareza: "PocoComun", valorDanioProteccion: 45, probabilidadSpawnPct: 70.0 },
      { lootId: "L-07", nombreObjeto: "Venda de Emergencia", tipo: "Botiquin", rareza: "Comun", valorDanioProteccion: 25, probabilidadSpawnPct: 90.0 }
    ]
  },
  {
    sectorId: "MAP-5504",
    nombreSector: "Refugio Subterraneo Periferico",
    nivelZona: "ZonaSeguraPeriferica",
    indicePeligro: 15,
    objetosEncontrados: [
      { lootId: "L-08", nombreObjeto: "Pistola Estandar 9mm", tipo: "ArmaAsalto", rareza: "Comun", valorDanioProteccion: 30, probabilidadSpawnPct: 95.0 }
    ]
  }
];

class AnalizadorMapaLoot<T extends SectorMapaBattleRoyale> {
  private readonly sectores: readonly T[];

  constructor(sectores: readonly T[]) {
    this.sectores = sectores;
  }

  public async validarSectorMapaAsync(sector: T): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!sector.sectorId || sector.indicePeligro < 0) {
          reject(new Error(`Sector del mapa Battle Royale inválido: ${sector.nombreSector}`));
        } else {
          resolve(true);
        }
      }, 15);
    });
  }

  public calcularPoderPromedio(objetos: readonly ObjetoLoot[]): number {
    if (objetos.length === 0) return 0;
    const sumaPoder = objetos.reduce((acc, item) => acc + item.valorDanioProteccion, 0);
    return Number((sumaPoder / objetos.length).toFixed(1));
  }

  public async procesarAnalisisMapaAsync(): Promise<readonly ReporteMapaLoot[]> {
    const reportes: ReporteMapaLoot[] = [];

    for (const sector of this.sectores) {
      try {
        await this.validarSectorMapaAsync(sector);
        const totalValiosos = sector.objetosEncontrados.filter(
          item => item.rareza === "Epico" || item.rareza === "Legendario"
        ).length;
        const promedioPoder = this.calcularPoderPromedio(sector.objetosEncontrados);

        let clasificacion: 'Recomendado' | 'AltoRiesgo' | 'ZonaMuerta' = 'Recomendado';
        if (sector.indicePeligro >= 75 && totalValiosos >= 2) {
          clasificacion = 'AltoRiesgo';
        } else if (sector.objetosEncontrados.length === 0 || promedioPoder < 35) {
          clasificacion = 'ZonaMuerta';
        }

        reportes.push({
          sector: `${sector.nombreSector} [${sector.sectorId}]`,
          nivelZona: sector.nivelZona,
          totalObjetosValiosos: totalValiosos,
          valorPromedioPoder: promedioPoder,
          indiceRiesgo: sector.indicePeligro,
          clasificacionZona: clasificacion,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error(`[Loot Map Error]: ${error.message}`);
        }
      }
    }

    return reportes.sort((a, b) => b.valorPromedioPoder - a.valorPromedioPoder);
  }
}

function imprimirReporteMapaLoot(titulo: string, reportes: readonly ReporteMapaLoot[]): void {
  console.log(`=== [MAPA DE LOOT BATTLE ROYALE - VIDEOJUEGOS BATTLE ROYALE] ${titulo} ===`);
  reportes.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Sector: ${item.sector} | Zona: ${item.nivelZona} | Valiosos: ${item.totalObjetosValiosos} | Poder Prom: ${item.valorPromedioPoder} | Riesgo: ${item.indiceRiesgo}% | Clasificación: ${item.clasificacionZona}`
    );
  });
  console.log("======================================================================================================================\n");
}

async function ejecutarFlujoMapaLoot(): Promise<void> {
  const analizadorOficial = new AnalizadorMapaLoot(registroMapaBunkerLoot);
  const reporteOficial = await analizadorOficial.procesarAnalisisMapaAsync();
  imprimirReporteMapaLoot("Análisis Oficial de Distribución de Loot en Isla", reporteOficial);

  // caso: Sector con indice de peligro extremo y loot vacio catalogado como zona muerta
  const sectorCasoLimite: readonly SectorMapaBattleRoyale[] = [
    {
      sectorId: "MAP-9999",
      nombreSector: "Cerrado Sector Toxico Central",
      nivelZona: "ZonaCaliente",
      indicePeligro: 100,
      objetosEncontrados: []
    }
  ];

  const analizadorLimite = new AnalizadorMapaLoot(sectorCasoLimite);
  const reporteLimite = await analizadorLimite.procesarAnalisisMapaAsync();
  imprimirReporteMapaLoot("caso: Sector con indice de peligro extremo y loot vacio catalogado como zona muerta", reporteLimite);
}

ejecutarFlujoMapaLoot();