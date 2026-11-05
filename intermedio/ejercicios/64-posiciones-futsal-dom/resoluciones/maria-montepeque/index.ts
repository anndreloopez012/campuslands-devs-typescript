export {};

interface Fila {
  readonly equipo: string;
  readonly pj: number;
  readonly pg: number;
  readonly pe: number;
  readonly pp: number;
  readonly gf: number;
  readonly gc: number;
}

interface Partido {
  readonly local: string;
  readonly visita: string;
  readonly golesLocal: number;
  readonly golesVisita: number;
}

// Historial de partidos: "deshacer" simplemente quita el ultimo y la tabla se recalcula.
interface Estado {
  readonly equipos: readonly string[];
  readonly partidos: readonly Partido[];
}

type Accion =
  | { readonly tipo: "registrar"; readonly partido: Partido }
  | { readonly tipo: "deshacer" }
  | { readonly tipo: "reiniciar" };

const equipos = ["Lobos", "Aguilas", "Tigres", "Panteras"] as const;
const inicial: Estado = { equipos, partidos: [] };

const reducer = (estado: Estado, accion: Accion): Estado => {
  switch (accion.tipo) {
    case "registrar": {
      const { local, visita, golesLocal, golesVisita } = accion.partido;
      const valido =
        local !== visita &&
        estado.equipos.includes(local) &&
        estado.equipos.includes(visita) &&
        Number.isInteger(golesLocal) && golesLocal >= 0 &&
        Number.isInteger(golesVisita) && golesVisita >= 0;
      return valido ? { ...estado, partidos: [...estado.partidos, accion.partido] } : estado;
    }
    case "deshacer":
      return { ...estado, partidos: estado.partidos.slice(0, -1) };
    case "reiniciar":
      return inicial;
  }
};

const calcularTabla = (estado: Estado): Fila[] =>
  estado.equipos
    .map((equipo): Fila => {
      const suyos = estado.partidos.filter((p) => p.local === equipo || p.visita === equipo);
      return suyos.reduce<Fila>(
        (fila, p) => {
          const propios = p.local === equipo ? p.golesLocal : p.golesVisita;
          const contra = p.local === equipo ? p.golesVisita : p.golesLocal;
          return {
            ...fila,
            pj: fila.pj + 1,
            pg: fila.pg + (propios > contra ? 1 : 0),
            pe: fila.pe + (propios === contra ? 1 : 0),
            pp: fila.pp + (propios < contra ? 1 : 0),
            gf: fila.gf + propios,
            gc: fila.gc + contra,
          };
        },
        { equipo, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0 },
      );
    })
    .sort((a, b) => b.pg * 3 + b.pe - (a.pg * 3 + a.pe) || b.gf - b.gc - (a.gf - a.gc));

const mostrar = (titulo: string, estado: Estado): void => {
  console.log(titulo);
  calcularTabla(estado).forEach((f, i) =>
    console.log(`  ${i + 1}. ${f.equipo.padEnd(9)} PJ ${f.pj} | ${f.pg * 3 + f.pe} pts | GF ${f.gf} GC ${f.gc}`),
  );
};

console.log("Ejercicio 64: Tabla futsal interactiva");
const pasos: readonly [string, Accion][] = [
  ["Lobos 3-1 Aguilas", { tipo: "registrar", partido: { local: "Lobos", visita: "Aguilas", golesLocal: 3, golesVisita: 1 } }],
  ["Tigres 2-2 Panteras", { tipo: "registrar", partido: { local: "Tigres", visita: "Panteras", golesLocal: 2, golesVisita: 2 } }],
  ["Lobos 0-4 Tigres", { tipo: "registrar", partido: { local: "Lobos", visita: "Tigres", golesLocal: 0, golesVisita: 4 } }],
  ["Partido invalido (equipo inexistente)", { tipo: "registrar", partido: { local: "Lobos", visita: "Osos", golesLocal: 1, golesVisita: 0 } }],
  ["Deshacer", { tipo: "deshacer" }],
  ["Aguilas 1-0 Panteras", { tipo: "registrar", partido: { local: "Aguilas", visita: "Panteras", golesLocal: 1, golesVisita: 0 } }],
];

let estado = inicial;
pasos.forEach(([nombre, accion]) => {
  const antes = estado.partidos.length;
  estado = reducer(estado, accion);
  console.log(`> ${nombre} (partidos: ${antes} -> ${estado.partidos.length})`);
});
mostrar("Tabla actual:", estado);
mostrar("Tras reiniciar:", reducer(estado, { tipo: "reiniciar" }));
