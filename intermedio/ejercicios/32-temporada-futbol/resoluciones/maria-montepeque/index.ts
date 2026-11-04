export {};

class Equipo {
  jugados = 0;
  ganados = 0;
  empatados = 0;
  perdidos = 0;
  golesFavor = 0;
  golesContra = 0;

  constructor(readonly nombre: string) {}

  get puntos(): number {
    return this.ganados * 3 + this.empatados;
  }

  get diferencia(): number {
    return this.golesFavor - this.golesContra;
  }

  registrar(golesPropios: number, golesRival: number): void {
    this.jugados++;
    this.golesFavor += golesPropios;
    this.golesContra += golesRival;
    if (golesPropios > golesRival) this.ganados++;
    else if (golesPropios === golesRival) this.empatados++;
    else this.perdidos++;
  }
}

class Temporada<T extends Equipo> {
  private readonly equipos = new Map<string, T>();

  constructor(equipos: readonly T[]) {
    equipos.forEach((equipo) => this.equipos.set(equipo.nombre, equipo));
  }

  jugar(local: string, golesLocal: number, visitante: string, golesVisitante: number): void {
    const a = this.equipos.get(local);
    const b = this.equipos.get(visitante);
    if (!a || !b || a === b) throw new Error(`Partido invalido: ${local} vs ${visitante}`);
    if (golesLocal < 0 || golesVisitante < 0) throw new Error("Los goles no pueden ser negativos");
    a.registrar(golesLocal, golesVisitante);
    b.registrar(golesVisitante, golesLocal);
  }

  tabla(): T[] {
    return [...this.equipos.values()].sort(
      (a, b) => b.puntos - a.puntos || b.diferencia - a.diferencia || b.golesFavor - a.golesFavor,
    );
  }
}

const temporada = new Temporada([
  new Equipo("Cometas"),
  new Equipo("Jaguares"),
  new Equipo("Halcones"),
  new Equipo("Tormenta"),
]);

const calendario: readonly [string, number, string, number][] = [
  ["Cometas", 2, "Jaguares", 1],
  ["Halcones", 0, "Tormenta", 0],
  ["Cometas", 1, "Halcones", 3],
  ["Jaguares", 2, "Tormenta", 2],
  ["Tormenta", 1, "Cometas", 4],
  ["Jaguares", 0, "Halcones", 1],
  ["Cometas", 1, "Cometas", 1],
  ["Rayos", 1, "Cometas", 0],
];

console.log("Ejercicio 32: Temporada modo carrera");
calendario.forEach(([local, gl, visitante, gv]) => {
  try {
    temporada.jugar(local, gl, visitante, gv);
  } catch (error) {
    console.log(`  ! ${error instanceof Error ? error.message : "Error desconocido"}`);
  }
});
temporada.tabla().forEach((e, i) =>
  console.log(`${i + 1}. ${e.nombre} - ${e.puntos} pts (PJ ${e.jugados}, DG ${e.diferencia})`),
);
console.log(`Campeon: ${temporada.tabla()[0].nombre}`);
