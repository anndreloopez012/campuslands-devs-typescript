export {};

type Neumatico = "blando" | "medio" | "duro";

interface Stint {
  readonly neumatico: Neumatico;
  readonly vueltas: number;
}

interface Estrategia {
  readonly nombre: string;
  readonly stints: readonly Stint[];
}

const ritmoBase: Record<Neumatico, number> = { blando: 88.0, medio: 88.8, duro: 89.6 };
const degradacionPorVuelta: Record<Neumatico, number> = { blando: 0.09, medio: 0.05, duro: 0.03 };
const vidaMaxima: Record<Neumatico, number> = { blando: 18, medio: 28, duro: 40 };

const TIEMPO_PIT = 22;
const VUELTAS_CARRERA = 50;

class Simulador {
  tiempoStint(stint: Stint): number {
    let total = 0;
    for (let vuelta = 0; vuelta < stint.vueltas; vuelta++) {
      total += ritmoBase[stint.neumatico] + degradacionPorVuelta[stint.neumatico] * vuelta;
    }
    return total;
  }

  validar(estrategia: Estrategia): string[] {
    const problemas: string[] = [];
    const vueltas = estrategia.stints.reduce((acc, s) => acc + s.vueltas, 0);
    if (vueltas !== VUELTAS_CARRERA) problemas.push(`suma ${vueltas} vueltas en vez de ${VUELTAS_CARRERA}`);
    if (new Set(estrategia.stints.map((s) => s.neumatico)).size < 2) problemas.push("debe usar 2 compuestos distintos");
    estrategia.stints
      .filter((s) => s.vueltas > vidaMaxima[s.neumatico])
      .forEach((s) => problemas.push(`${s.neumatico} excede su vida util (${s.vueltas}/${vidaMaxima[s.neumatico]})`));
    return problemas;
  }

  tiempoTotal(estrategia: Estrategia): number {
    const pits = estrategia.stints.length - 1;
    const carrera = estrategia.stints.reduce((acc, s) => acc + this.tiempoStint(s), 0);
    return Math.round((carrera + pits * TIEMPO_PIT) * 100) / 100;
  }
}

const estrategias: readonly Estrategia[] = [
  { nombre: "Agresiva (2 paradas)", stints: [{ neumatico: "blando", vueltas: 15 }, { neumatico: "medio", vueltas: 20 }, { neumatico: "blando", vueltas: 15 }] },
  { nombre: "Conservadora (1 parada)", stints: [{ neumatico: "medio", vueltas: 25 }, { neumatico: "duro", vueltas: 25 }] },
  { nombre: "Equilibrada (2 paradas)", stints: [{ neumatico: "medio", vueltas: 18 }, { neumatico: "duro", vueltas: 17 }, { neumatico: "medio", vueltas: 15 }] },
  { nombre: "Imposible", stints: [{ neumatico: "blando", vueltas: 50 }] },
  { nombre: "Incompleta", stints: [{ neumatico: "medio", vueltas: 20 }, { neumatico: "duro", vueltas: 20 }] },
];

const simulador = new Simulador();
const evaluadas = estrategias.map((e) => ({ estrategia: e, problemas: simulador.validar(e) }));
const viables = evaluadas
  .filter((e) => e.problemas.length === 0)
  .map((e) => ({ nombre: e.estrategia.nombre, tiempo: simulador.tiempoTotal(e.estrategia) }))
  .sort((a, b) => a.tiempo - b.tiempo);

console.log("Ejercicio 35: Estrategia de pit stop");
evaluadas
  .filter((e) => e.problemas.length > 0)
  .forEach((e) => console.log(`  - ${e.estrategia.nombre} descartada: ${e.problemas.join("; ")}`));
viables.forEach((v, i) => console.log(`${i + 1}. ${v.nombre}: ${v.tiempo} s`));
console.log(`Mejor estrategia: ${viables[0].nombre} (+${Math.round((viables[viables.length - 1].tiempo - viables[0].tiempo) * 100) / 100} s de ventaja sobre la peor viable)`);
