// Solución Ejercicio Intermedio 62 - Stefani Sánchez
export {};

type Partido =
  | { readonly deporte: "futbol"; readonly local: string; readonly visita: string; readonly golesLocal: number; readonly golesVisita: number }
  | { readonly deporte: "basquet"; readonly local: string; readonly visita: string; readonly cuartos: readonly (readonly [number, number])[] }
  | { readonly deporte: "tenis"; readonly local: string; readonly visita: string; readonly sets: readonly (readonly [number, number])[] };

type Accion =
  | { readonly tipo: "gol"; readonly indice: number; readonly equipo: "local" | "visita" }
  | { readonly tipo: "cuarto"; readonly indice: number; readonly puntos: readonly [number, number] }
  | { readonly tipo: "set"; readonly indice: number; readonly juegos: readonly [number, number] };

const partidos: readonly Partido[] = [
  { deporte: "futbol", local: "Cometas", visita: "Jaguares", golesLocal: 1, golesVisita: 1 },
  { deporte: "basquet", local: "Pumas", visita: "Toros", cuartos: [[22, 18], [25, 27]] },
  { deporte: "tenis", local: "Mora", visita: "Duarte", sets: [[6, 4]] },
];

const reducer = (estado: readonly Partido[], accion: Accion): readonly Partido[] =>
  estado.map((p, i) => {
    if (i !== accion.indice) return p;
    if (accion.tipo === "gol" && p.deporte === "futbol") {
      return accion.equipo === "local" ? { ...p, golesLocal: p.golesLocal + 1 } : { ...p, golesVisita: p.golesVisita + 1 };
    }
    if (accion.tipo === "cuarto" && p.deporte === "basquet" && p.cuartos.length < 4) {
      return { ...p, cuartos: [...p.cuartos, accion.puntos] };
    }
    if (accion.tipo === "set" && p.deporte === "tenis" && p.sets.length < 3) {
      return { ...p, sets: [...p.sets, accion.juegos] };
    }
    return p; // La accion no corresponde a este deporte: no cambia nada.
  });

const sumar = (pares: readonly (readonly [number, number])[]): [number, number] =>
  pares.reduce<[number, number]>((acc, [a, b]) => [acc[0] + a, acc[1] + b], [0, 0]);

const resumir = (p: Partido): string => {
  switch (p.deporte) {
    case "futbol":
      return `${p.local} ${p.golesLocal} - ${p.golesVisita} ${p.visita}`;
    case "basquet": {
      const [a, b] = sumar(p.cuartos);
      return `${p.local} ${a} - ${b} ${p.visita} (${p.cuartos.length} cuarto(s))`;
    }
    case "tenis": {
      const setsLocal = p.sets.filter(([a, b]) => a > b).length;
      const setsVisita = p.sets.length - setsLocal;
      return `${p.local} ${setsLocal} - ${setsVisita} ${p.visita} (${p.sets.map(([a, b]) => `${a}-${b}`).join(", ")})`;
    }
  }
};

const mostrar = (titulo: string, estado: readonly Partido[]): void => {
  console.log(titulo);
  estado.forEach((p) => console.log(`  [${p.deporte}] ${resumir(p)}`));
};

console.log("Ejercicio 62: Dashboard multi-deporte");
mostrar("Estado inicial:", partidos);

const acciones: readonly Accion[] = [
  { tipo: "gol", indice: 0, equipo: "local" },
  { tipo: "gol", indice: 0, equipo: "visita" },
  { tipo: "cuarto", indice: 1, puntos: [20, 24] },
  { tipo: "cuarto", indice: 1, puntos: [30, 21] },
  { tipo: "cuarto", indice: 1, puntos: [10, 10] },
  { tipo: "set", indice: 2, juegos: [3, 6] },
  { tipo: "set", indice: 2, juegos: [7, 5] },
  { tipo: "set", indice: 2, juegos: [6, 0] },
  { tipo: "gol", indice: 1, equipo: "local" },
];

mostrar("Despues de los eventos:", acciones.reduce(reducer, partidos));
