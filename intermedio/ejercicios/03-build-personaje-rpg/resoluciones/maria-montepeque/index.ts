export {};

type ClasePersonaje = "guerrero" | "mago" | "arquero";
type Rango = "S" | "A" | "B" | "C";

interface Atributos {
  readonly fuerza: number;
  readonly destreza: number;
  readonly inteligencia: number;
  readonly vitalidad: number;
}
interface Equipo {
  readonly arma: string;
  readonly armadura: string;
  readonly bonusPoder: number;
}
interface Personaje {
  readonly id: number;
  readonly nombre: string;
  readonly clase: ClasePersonaje;
  readonly nivel: number;
  readonly atributos: Atributos;
  readonly equipo: Equipo;
}
interface PersonajeEvaluado extends Personaje {
  readonly poderTotal: number;
  readonly rango: Rango;
}

const personajes: readonly Personaje[] = [
  {
    id: 1,
    nombre: "Kargath",
    clase: "guerrero",
    nivel: 12,
    atributos: { fuerza: 28, destreza: 14, inteligencia: 6, vitalidad: 24 },
    equipo: {
      arma: "Hacha de Guerra",
      armadura: "Placas de Hierro",
      bonusPoder: 15,
    },
  },
  {
    id: 2,
    nombre: "Elowen",
    clase: "mago",
    nivel: 15,
    atributos: { fuerza: 6, destreza: 12, inteligencia: 32, vitalidad: 14 },
    equipo: {
      arma: "Baston Arcano",
      armadura: "Tunica Encantada",
      bonusPoder: 20,
    },
  },
  {
    id: 3,
    name: "Rasha",
    clase: "arquero",
    nivel: 10,
    atributos: { fuerza: 12, destreza: 26, inteligencia: 10, vitalidad: 16 },
    equipo: { arma: "Arco Largo", armadura: "Cuero Reforzado", bonusPoder: 10 },
  },
  {
    id: 4,
    nombre: "Doran",
    clase: "guerrero",
    nivel: 0,
    atributos: { fuerza: 18, destreza: 10, inteligencia: 4, vitalidad: 20 },
    equipo: { arma: "Espada Corta", armadura: "Cota de Malla", bonusPoder: 5 },
  },
] as any; 

const pesosPorClase: Record<ClasePersonaje, Atributos> = {
  guerrero: { fuerza: 1.5, destreza: 0.8, inteligencia: 0.3, vitalidad: 1.2 },
  mago: { fuerza: 0.3, destreza: 0.8, inteligencia: 1.6, vitalidad: 0.9 },
  arquero: { fuerza: 0.7, destreza: 1.6, inteligencia: 0.5, vitalidad: 1.0 },
};

const errores: string[] = [];
const ranking: PersonajeEvaluado[] = personajes
  .reduce((acc, p) => {
    const atr = p.atributos;
    if (
      p.nivel <= 0 ||
      p.equipo.bonusPoder < 0 ||
      Math.min(atr.fuerza, atr.destreza, atr.inteligencia, atr.vitalidad) < 0
    ) {
      errores.push(
        `${p.nombre || "Desconocido"}: Datos inválidos (Nivel, atributos o bonus negativos)`,
      );
      return acc;
    }

    const pesos = pesosPorClase[p.clase];
    const base = Object.keys(pesos).reduce(
      (sum, k) => sum + atr[k as keyof Atributos] * pesos[k as keyof Atributos],
      0,
    );
    const poderTotal = Math.round(
      base * (1 + p.nivel * 0.05) + p.equipo.bonusPoder,
    );

    const rango: Rango =
      poderTotal >= 90
        ? "S"
        : poderTotal >= 60
          ? "A"
          : poderTotal >= 40
            ? "B"
            : "C";

    acc.push({ ...p, poderTotal, rango });
    return acc;
  }, [] as PersonajeEvaluado[])
  .sort((a, b) => b.poderTotal - a.poderTotal); 

// --- Impresión de Resultados ---
console.log("--- RANKING DE PERSONAJES ---");
ranking.forEach((p, i) =>
  console.log(
    `${i + 1}. ${p.nombre} [${p.clase.toUpperCase()}] Nivel ${p.nivel} | Poder: ${p.poderTotal} | Rango: ${p.rango}`,
  ),
);

if (errores.length > 0) {
  console.log("\n--- LOG DE ERRORES / PERSONAJES RECHAZADOS ---");
  errores.forEach((err) => console.error(`[Error] ${err}`));
}
