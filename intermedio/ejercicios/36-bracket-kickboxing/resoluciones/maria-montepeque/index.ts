export {};

interface Peleador {
  readonly nombre: string;
  readonly rating: number;
}

interface Combate<T extends Peleador> {
  readonly ronda: number;
  readonly a: T;
  readonly b: T;
  readonly ganador: T;
}

class Bracket<T extends Peleador> {
  private readonly combates: Combate<T>[] = [];

  constructor(private readonly participantes: readonly T[]) {
    const n = participantes.length;
    if (n < 2 || (n & (n - 1)) !== 0) {
      throw new Error(`El bracket necesita potencia de 2 participantes (recibio ${n})`);
    }
    if (new Set(participantes.map((p) => p.nombre)).size !== n) {
      throw new Error("Hay peleadores repetidos");
    }
  }

  private resolver(a: T, b: T): T {
    // Gana el de mayor rating; en empate avanza el primero por orden alfabetico.
    if (a.rating !== b.rating) return a.rating > b.rating ? a : b;
    return a.nombre <= b.nombre ? a : b;
  }

  simular(): T {
    let vivos: readonly T[] = [...this.participantes].sort((x, y) => y.rating - x.rating);
    let ronda = 1;

    while (vivos.length > 1) {
      // Cabeza de serie: el mejor contra el peor.
      const siguientes: T[] = [];
      for (let i = 0; i < vivos.length / 2; i++) {
        const a = vivos[i];
        const b = vivos[vivos.length - 1 - i];
        const ganador = this.resolver(a, b);
        this.combates.push({ ronda, a, b, ganador });
        siguientes.push(ganador);
      }
      vivos = siguientes;
      ronda++;
    }
    return vivos[0];
  }

  historial(): readonly Combate<T>[] {
    return this.combates;
  }
}

const torneos: readonly (readonly Peleador[])[] = [
  [
    { nombre: "Kenji", rating: 91 },
    { nombre: "Rocio", rating: 84 },
    { nombre: "Tavo", rating: 77 },
    { nombre: "Ilse", rating: 88 },
    { nombre: "Bruno", rating: 70 },
    { nombre: "Nadia", rating: 88 },
    { nombre: "Omar", rating: 65 },
    { nombre: "Lia", rating: 80 },
  ],
  [
    { nombre: "Uno", rating: 50 },
    { nombre: "Dos", rating: 60 },
    { nombre: "Tres", rating: 70 },
  ],
];

console.log("Ejercicio 36: Bracket de kickboxing");
torneos.forEach((participantes, i) => {
  try {
    const bracket = new Bracket(participantes);
    const campeon = bracket.simular();
    console.log(`Torneo ${i + 1}:`);
    bracket.historial().forEach((c) => console.log(`  R${c.ronda}: ${c.a.nombre} vs ${c.b.nombre} -> ${c.ganador.nombre}`));
    console.log(`  Campeon: ${campeon.nombre}`);
  } catch (error) {
    console.log(`Torneo ${i + 1} invalido: ${error instanceof Error ? error.message : "Error desconocido"}`);
  }
});
