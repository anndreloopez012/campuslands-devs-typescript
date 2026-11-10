export {};

type DificultadMision = "Caza Facil" | "Mazmorra Mediana" | "Asalto de Banda";

interface RecompensaMision {
  readonly oro: number;
  readonly experiencia: number;
  readonly objetoRaro?: string;
}

interface MisionRPG {
  readonly id: string;
  readonly nombre: string;
  readonly dificultad: DificultadMision;
  readonly duracionSimuladaMs: number;
  readonly recompensa: RecompensaMision;
}

async function despacharMision(mision: MisionRPG): Promise<string> {
  console.log(`Iniciando expedicion: ${mision.nombre} [${mision.dificultad}]...`);
  await new Promise((resolve) => setTimeout(resolve, 15));
  return `Mision completada: ${mision.nombre}. Ganaste +${mision.recompensa.oro} oro y +${mision.recompensa.experiencia} EXP.`;
}

async function main() {
  const misiones: MisionRPG[] = [
    { id: "m-01", nombre: "Caza de Goblins en las Minas", dificultad: "Caza Facil", duracionSimuladaMs: 15, recompensa: { oro: 50, experiencia: 120 } },
    { id: "m-02", nombre: "Purga de Nigromantes en Cripta", dificultad: "Mazmorra Mediana", duracionSimuladaMs: 20, recompensa: { oro: 180, experiencia: 450, objetoRaro: "Amuleto Oscuro" } },
  ];

  console.log("=== GESTOR DE MISIONES RPG ASINCRONO ===");
  for (const m of misiones) {
    const res = await despacharMision(m);
    console.log(res);
  }
}

main();
