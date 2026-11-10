export {};

type ClasePersonaje = 'Guerrero' | 'Mago Arcano' | 'Asesino Sombrío' | 'Paladín';
type ElementoAfinidad = 'Fuego' | 'Hielo' | 'Rayo' | 'Neutro';

interface AtributosBase {
  readonly fuerza: number;
  readonly inteligencia: number;
  readonly agilidad: number;
  readonly constitucion: number;
}

interface PerfilPersonajeRPG {
  readonly idRegistro: string;
  readonly nombreHeroe: string;
  readonly clase: ClasePersonaje;
  readonly nivel: number;
  readonly afinidad: ElementoAfinidad;
  readonly atributos: AtributosBase;
  readonly habilidadesDesbloqueadas: readonly string[];
  readonly esVeterano: boolean;
}

interface EstadisticasCalculadas {
  readonly nombreHeroe: string;
  readonly clase: ClasePersonaje;
  readonly poderCombateTotal: number;
  readonly puntosVidaEstimados: number;
  readonly categoriaPoder: string;
}

const rosterHeroesPrueba: readonly PerfilPersonajeRPG[] = [
  {
    idRegistro: "RPG-901",
    nombreHeroe: "Valen_Voss",
    clase: "Guerrero",
    nivel: 15,
    afinidad: "Neutro",
    atributos: { fuerza: 85, inteligencia: 20, agilidad: 45, constitucion: 90 },
    habilidadesDesbloqueadas: ["Golpe Titánico", "Escudo de Acero", "Carga Berserker"],
    esVeterano: true,
  },
  {
    idRegistro: "RPG-902",
    nombreHeroe: "Nightshade",
    clase: "Asesino Sombrío",
    nivel: 18,
    afinidad: "Rayo",
    atributos: { fuerza: 40, inteligencia: 35, agilidad: 95, constitucion: 50 },
    habilidadesDesbloqueadas: ["Paso Sombrío", "Daga Venenosa", "Corte Crítico"],
    esVeterano: true,
  },
  {
    idRegistro: "RPG-903",
    nombreHeroe: "Ignis",
    clase: "Mago Arcano",
    nivel: 20,
    afinidad: "Fuego",
    atributos: { fuerza: 15, inteligencia: 110, agilidad: 50, constitucion: 40 },
    habilidadesDesbloqueadas: ["Meteorito Arcano", "Nova de Fuego", "Barrera de Maná"],
    esVeterano: true,
  },
  {
    idRegistro: "RPG-904",
    nombreHeroe: "Kaelen",
    clase: "Paladín",
    nivel: 5,
    afinidad: "Hielo",
    atributos: { fuerza: 50, inteligencia: 40, agilidad: 30, constitucion: 60 },
    habilidadesDesbloqueadas: ["Luz Sagrada"],
    esVeterano: false,
  }
];

function calcularPoderCombate(atributos: AtributosBase, nivel: number): number {
  const sumaAtributos = atributos.fuerza + atributos.inteligencia + atributos.agilidad + atributos.constitucion;
  return Math.round(sumaAtributos * (1 + nivel * 0.1));
}

function clasificarNivelPoder(pc: number): string {
  if (pc >= 1500) return "S-Tier: Leyenda Viviente";
  if (pc >= 900) return "A-Tier: Veterano de Guerra";
  if (pc >= 400) return "B-Tier: Aventurero Prometedor";
  return "C-Tier: Novato en Pruebas";
}

function procesadorBuilderPersonajes(heroes: readonly PerfilPersonajeRPG[]): readonly EstadisticasCalculadas[] {
  return heroes
    .map(heroe => {
      const pcTotal = calcularPoderCombate(heroe.atributos, heroe.nivel);
      const hpEstimado = heroe.atributos.constitucion * 12 + heroe.nivel * 25;
      
      return {
        nombreHeroe: heroe.nombreHeroe,
        clase: heroe.clase,
        poderCombateTotal: pcTotal,
        puntosVidaEstimados: hpEstimado,
        categoriaPoder: clasificarNivelPoder(pcTotal)
      };
    })
    .sort((a, b) => b.poderCombateTotal - a.poderCombateTotal);
}

function generarReporteRPG(titulo: string, reporte: readonly EstadisticasCalculadas[]): void {
  console.log(`=== [BUILDER DE PERSONAJE RPG] ${titulo} ===`);
  reporte.forEach((heroe, index) => {
    console.log(
      `${index + 1}. Héroe: ${heroe.nombreHeroe} [${heroe.clase}] | PC: ${heroe.poderCombateTotal} | HP: ${heroe.puntosVidaEstimados} | Rango: ${heroe.categoriaPoder}`
    );
  });
  console.log("=========================================================\n");
}

const resultadoNormal = procesadorBuilderPersonajes(rosterHeroesPrueba);
generarReporteRPG("Roster Principal de Héroes", resultadoNormal);

// Caso: Personaje con estadísticas en cero o desbalanceadas extremo
const heroeCasoLimite: readonly PerfilPersonajeRPG[] = [
  {
    idRegistro: "RPG-999",
    nombreHeroe: "Zero",
    clase: "Guerrero",
    nivel: 1,
    afinidad: "Neutro",
    atributos: { fuerza: 1, inteligencia: 1, agilidad: 1, constitucion: 5 },
    habilidadesDesbloqueadas: [],
    esVeterano: false,
  }
];

const resultadoLimite = procesadorBuilderPersonajes(heroeCasoLimite);
generarReporteRPG("Caso (Atributos Mínimos Iniciales)", resultadoLimite);