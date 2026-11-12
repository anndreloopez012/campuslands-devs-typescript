export {};

type RolMOBA = 'Tanque' | 'Asesino' | 'Mago' | 'Soporte' | 'Tirador';
type EstadoRotacion = 'Disponible' | 'BloqueadoProvisional' | 'ExclusivoTorneo';

interface HeroeMOBA {
  readonly idHeroe: string;
  readonly nombre: string;
  readonly rol: RolMOBA;
  readonly tasaVictoria: number; 
  readonly partidasJugadas: number;
  estadoRotacion: EstadoRotacion;
  readonly nivelDificultad: number; 
}

interface ReporteRotacion {
  readonly nombreHeroe: string;
  readonly rol: RolMOBA;
  readonly indiceImpacto: number;
  readonly calificacionRendimiento: string;
  readonly estadoActual: EstadoRotacion;
}

const rosterNexusArena: readonly HeroeMOBA[] = [
  {
    idHeroe: "MOB-881",
    nombre: "Valkyrie_X",
    rol: "Asesino",
    tasaVictoria: 56.8,
    partidasJugadas: 1420,
    estadoRotacion: "Disponible",
    nivelDificultad: 9,
  },
  {
    idHeroe: "MOB-882",
    nombre: "Zarek_Vane",
    rol: "Tanque",
    tasaVictoria: 52.4,
    partidasJugadas: 980,
    estadoRotacion: "Disponible",
    nivelDificultad: 4,
  },
  {
    idHeroe: "MOB-883",
    nombre: "Nox_Voidwalker",
    rol: "Mago",
    tasaVictoria: 48.2,
    partidasJugadas: 1150,
    estadoRotacion: "ExclusivoTorneo",
    nivelDificultad: 8,
  },
  {
    idHeroe: "MOB-884",
    nombre: "Aeloria_Sun",
    rol: "Soporte",
    tasaVictoria: 55.1,
    partidasJugadas: 890,
    estadoRotacion: "Disponible",
    nivelDificultad: 5,
  },
  {
    idHeroe: "MOB-885",
    nombre: "Kurogane_K",
    rol: "Tirador",
    tasaVictoria: 50.9,
    partidasJugadas: 1300,
    estadoRotacion: "BloqueadoProvisional",
    nivelDificultad: 7,
  }
];

function calcularIndiceImpacto(tasaVictoria: number, partidas: number): number {
  const factorExperiencia = Math.min(partidas / 1000, 1.5);
  return Number((tasaVictoria * factorExperiencia).toFixed(2));
}

function evaluarRendimiento(indice: number): string {
  if (indice >= 75) return "S-Tier: Meta Dominante";
  if (indice >= 60) return "A-Tier: Alta Viabilidad";
  if (indice >= 45) return "B-Tier: Balanceado";
  return "C-Tier: Requiere Ajustes";
}

function procesarRotacionHeroes(heroes: readonly HeroeMOBA[]): readonly ReporteRotacion[] {
  return heroes
    .filter(heroe => heroe.estadoRotacion === "Disponible")
    .map(heroe => {
      const impacto = calcularIndiceImpacto(heroe.tasaVictoria, heroe.partidasJugadas);
      return {
        nombreHeroe: heroe.nombre,
        rol: heroe.rol,
        indiceImpacto: impacto,
        calificacionRendimiento: evaluarRendimiento(impacto),
        estadoActual: heroe.estadoRotacion
      };
    })
    .sort((a, b) => b.indiceImpacto - a.indiceImpacto);
}

function generarReporteMOBA(titulo: string, reporte: readonly ReporteRotacion[]): void {
  console.log(`=== [ROTACIÓN DE HÉROES MOBA] ${titulo} ===`);
  reporte.forEach((item, index) => {
    console.log(
      `${index + 1}. Héroe: ${item.nombreHeroe} [${item.rol}] | Impacto: ${item.indiceImpacto} | Rango: ${item.calificacionRendimiento}`
    );
  });
  console.log("=========================================================\n");
}

const resultadoNormal = procesarRotacionHeroes(rosterNexusArena);
generarReporteMOBA("Héroes Libres en Rotación Semanal", resultadoNormal);

// Caso Límite: Héroe con bajo volumen de partidas pero altísima tasa de victoria inicial
const heroeCasoLimite: readonly HeroeMOBA[] = [
  {
    idHeroe: "MOB-999",
    nombre: "Phantom_Zero",
    rol: "Asesino",
    tasaVictoria: 70.0,
    partidasJugadas: 15,
    estadoRotacion: "Disponible",
    nivelDificultad: 10,
  }
];

const resultadoLimite = procesarRotacionHeroes(heroeCasoLimite);
generarReporteMOBA("Caso Límite (Buestra Baja de Partidas)", resultadoLimite);