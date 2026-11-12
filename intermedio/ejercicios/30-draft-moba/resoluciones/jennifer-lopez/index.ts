export {};

type RolMoba = 'Tank' | 'Assassin' | 'Mage' | 'Marksman' | 'Support';
type EstadoSeleccion = 'Seleccionado' | 'Baneado' | 'Disponible' | 'Bloqueado';

interface FichaHeroeMoba {
  readonly heroeId: string;
  readonly nombreHeroe: string;
  readonly rol: RolMoba;
  readonly tasaVictoriaPct: number; // Ej: 52.4
  readonly indiceDificultad: number; // Escala 1 a 10
  readonly sinergiaClave: string;
  estado: EstadoSeleccion;
}

interface ResumenAgrupadoRolMoba {
  readonly rol: RolMoba;
  readonly totalHeroes: number;
  readonly tasaVictoriaPromedioPct: number;
  readonly dificultadPromedio: number;
  readonly heroesDisponibles: readonly string[];
}

const poolHeroesTorneoGlobal: readonly FichaHeroeMoba[] = [
  {
    heroeId: "MOBA-101",
    nombreHeroe: "Malphite El Coloso de Piedra",
    rol: "Tank",
    tasaVictoriaPct: 53.5,
    indiceDificultad: 3,
    sinergiaClave: "Iniciación en área con control de masas",
    estado: "Seleccionado",
  },
  {
    heroeId: "MOBA-102",
    nombreHeroe: "Zed El Maestro de las Sombras",
    rol: "Assassin",
    tasaVictoriaPct: 49.8,
    indiceDificultad: 9,
    sinergiaClave: "Eliminación de objetivos prioritarios",
    estado: "Baneado",
  },
  {
    heroeId: "MOBA-103",
    nombreHeroe: "Ahri La Zorra de Nueve Colas",
    rol: "Mage",
    tasaVictoriaPct: 51.2,
    indiceDificultad: 6,
    sinergiaClave: "Control de oleadas y movilidad elevada",
    estado: "Seleccionado",
  },
  {
    heroeId: "MOBA-104",
    nombreHeroe: "Jinx La Bala Perdida",
    rol: "Marksman",
    tasaVictoriaPct: 52.7,
    indiceDificultad: 5,
    sinergiaClave: "Daño sostenido a distancia y reseteos",
    estado: "Seleccionado",
  },
  {
    heroeId: "MOBA-105",
    nombreHeroe: "Thresh El Warden Encadenado",
    rol: "Support",
    tasaVictoriaPct: 50.9,
    indiceDificultad: 8,
    sinergiaClave: "Protección de tirador y ganchos de enganche",
    estado: "Seleccionado",
  },
  {
    heroeId: "MOBA-106",
    nombreHeroe: "Yasuo El Espadachín Errante",
    rol: "Assassin",
    tasaVictoriaPct: 48.5,
    indiceDificultad: 10,
    sinergiaClave: "Combos con levantamientos en área",
    estado: "Bloqueado",
  }
];

function validarHeroeDisponibleParaDraft(heroe: FichaHeroeMoba): boolean {
  return heroe.estado !== "Bloqueado" && heroe.tasaVictoriaPct > 0 && heroe.indiceDificultad > 0;
}

function agruparPorRolMoba(heroes: readonly FichaHeroeMoba[]): Record<RolMoba, readonly FichaHeroeMoba[]> {
  const estadoInicial: Record<RolMoba, readonly FichaHeroeMoba[]> = {
    'Tank': [],
    'Assassin': [],
    'Mage': [],
    'Marksman': [],
    'Support': [],
  };

  return heroes.reduce(
    (acumulado, heroe) => ({
      ...acumulado,
      [heroe.rol]: [...acumulado[heroe.rol], heroe],
    }),
    estadoInicial
  );
}

function calcularEstadisticasRolMoba(
  rol: RolMoba,
  heroes: readonly FichaHeroeMoba[]
): ResumenAgrupadoRolMoba {
  const sumaWinRate = heroes.reduce((acc, h) => acc + h.tasaVictoriaPct, 0);
  const sumaDificultad = heroes.reduce((acc, h) => acc + h.indiceDificultad, 0);
  const nombresDisponibles = heroes.map(h => `${h.nombreHeroe} (${h.tasaVictoriaPct}%)`);

  return {
    rol,
    totalHeroes: heroes.length,
    tasaVictoriaPromedioPct: Number((sumaWinRate / heroes.length).toFixed(2)),
    dificultadPromedio: Number((sumaDificultad / heroes.length).toFixed(1)),
    heroesDisponibles: nombresDisponibles,
  };
}

function procesarDraftInteligenteMOBA(heroes: readonly FichaHeroeMoba[]): readonly ResumenAgrupadoRolMoba[] {
  const heroesValidos = heroes.filter(validarHeroeDisponibleParaDraft);
  const agrupados = agruparPorRolMoba(heroesValidos);
  const roles = Object.keys(agrupados) as RolMoba[];

  return roles
    .filter(rol => agrupados[rol].length > 0)
    .map(rol => calcularEstadisticasRolMoba(rol, agrupados[rol]))
    .sort((a, b) => b.tasaVictoriaPromedioPct - a.tasaVictoriaPromedioPct);
}

function imprimirReporteDraft(titulo: string, resumen: readonly ResumenAgrupadoRolMoba[]): void {
  console.log(`=== [DRAFT INTELIGENTE MOBA] ${titulo} ===`);
  resumen.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Rol: ${item.rol} | Héroes: ${item.totalHeroes} | Win Rate Promedio: ${item.tasaVictoriaPromedioPct}% | Dificultad Promedio: ${item.dificultadPromedio}/10 | Selección: ${item.heroesDisponibles.join(', ')}`
    );
  });
  console.log("=================================================================================\n");
}

const reporteDraftOficial = procesarDraftInteligenteMOBA(poolHeroesTorneoGlobal);
imprimirReporteDraft("Resumen Agrupado por Rol del Meta Actual", reporteDraftOficial);

// Caso: Héroe legendario hypercarry con tasa de victoria óptima y alta complejidad mecánica
const heroeCasoHypercarry: readonly FichaHeroeMoba[] = [
  {
    heroeId: "MOBA-999",
    nombreHeroe: "Aphelios El Arma de los Fieles",
    rol: "Marksman",
    tasaVictoriaPct: 56.4,
    indiceDificultad: 10,
    sinergiaClave: "Rotación letal de armas y daño explosivo",
    estado: "Seleccionado",
  }
];

const resultadoHypercarry = procesarDraftInteligenteMOBA(heroeCasoHypercarry);
imprimirReporteDraft("Caso: Héroe Hypercarry Especializado de Alta Complejidad", resultadoHypercarry);