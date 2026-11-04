export {};

type EstadoMision = "disponible" | "aceptada" | "completada";

interface Mision {
  readonly id: number;
  readonly titulo: string;
  readonly nivelMinimo: number;
  readonly recompensaXp: number;
  estado: EstadoMision;
}

interface EventosMision {
  aceptada: { mision: Mision };
  completada: { mision: Mision; xpGanada: number };
  rechazada: { mision: Mision; motivo: string };
}

class Emisor<E> {
  private readonly oyentes: { [K in keyof E]?: ((datos: E[K]) => void)[] } = {};

  on<K extends keyof E>(evento: K, oyente: (datos: E[K]) => void): void {
    this.oyentes[evento] = [...(this.oyentes[evento] ?? []), oyente];
  }

  emitir<K extends keyof E>(evento: K, datos: E[K]): void {
    this.oyentes[evento]?.forEach((oyente) => oyente(datos));
  }
}

const esperar = (ms: number): Promise<void> => new Promise((resolver) => setTimeout(resolver, ms));

class GestorMisiones extends Emisor<EventosMision> {
  nivel = 1;
  xp = 0;

  constructor(private readonly misiones: Mision[]) {
    super();
  }

  async aceptar(id: number): Promise<void> {
    await esperar(5);
    const mision = this.misiones.find((m) => m.id === id);
    if (!mision) throw new Error(`La mision ${id} no existe`);
    if (mision.estado !== "disponible") return this.emitir("rechazada", { mision, motivo: `ya esta ${mision.estado}` });
    if (this.nivel < mision.nivelMinimo) {
      return this.emitir("rechazada", { mision, motivo: `requiere nivel ${mision.nivelMinimo}` });
    }
    mision.estado = "aceptada";
    this.emitir("aceptada", { mision });
  }

  async completar(id: number): Promise<void> {
    await esperar(5);
    const mision = this.misiones.find((m) => m.id === id);
    if (!mision || mision.estado !== "aceptada") {
      throw new Error(`No se puede completar la mision ${id}: no esta aceptada`);
    }
    mision.estado = "completada";
    this.xp += mision.recompensaXp;
    this.nivel = 1 + Math.floor(this.xp / 100);
    this.emitir("completada", { mision, xpGanada: mision.recompensaXp });
  }
}

const gestor = new GestorMisiones([
  { id: 1, titulo: "Cazar 5 lobos", nivelMinimo: 1, recompensaXp: 60, estado: "disponible" },
  { id: 2, titulo: "Escoltar caravana", nivelMinimo: 1, recompensaXp: 70, estado: "disponible" },
  { id: 3, titulo: "Derrotar al dragon", nivelMinimo: 3, recompensaXp: 300, estado: "disponible" },
]);

gestor.on("aceptada", ({ mision }) => console.log(`  [evento] aceptada: ${mision.titulo}`));
gestor.on("completada", ({ mision, xpGanada }) => console.log(`  [evento] completada: ${mision.titulo} (+${xpGanada} XP)`));
gestor.on("rechazada", ({ mision, motivo }) => console.log(`  [evento] rechazada: ${mision.titulo} - ${motivo}`));

const main = async (): Promise<void> => {
  console.log("Ejercicio 53: Gestor de misiones RPG");
  const pasos: [string, () => Promise<void>][] = [
    ["aceptar 3 (sin nivel)", () => gestor.aceptar(3)],
    ["aceptar 1", () => gestor.aceptar(1)],
    ["aceptar 2", () => gestor.aceptar(2)],
    ["completar 2", () => gestor.completar(2)],
    ["completar 1", () => gestor.completar(1)],
    ["completar 1 otra vez", () => gestor.completar(1)],
    ["aceptar 3 (ya con nivel)", () => gestor.aceptar(3)],
    ["aceptar 42", () => gestor.aceptar(42)],
  ];

  for (const [nombre, paso] of pasos) {
    console.log(`> ${nombre}`);
    try {
      await paso();
    } catch (error) {
      console.log(`  ! ${error instanceof Error ? error.message : "Error desconocido"}`);
    }
  }
  console.log(`Estado final: nivel ${gestor.nivel}, ${gestor.xp} XP`);
};

void main();
