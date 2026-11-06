// Solución Ejercicio Intermedio 67 - Stefani Sánchez
export {};

type Jugador = "A" | "B";
type Marcador = Readonly<Record<Jugador, number>>;

interface Estado {
  readonly puntos: Marcador;
  readonly sets: Marcador;
  readonly primerSaque: Jugador;
  readonly ganador: Jugador | null;
}

type Accion =
  | { readonly tipo: "punto"; readonly jugador: Jugador }
  | { readonly tipo: "reiniciar-set" };

const PUNTOS_SET = 11;
const SETS_PARA_GANAR = 2;

const inicial: Estado = { puntos: { A: 0, B: 0 }, sets: { A: 0, B: 0 }, primerSaque: "A", ganador: null };

const rival = (j: Jugador): Jugador => (j === "A" ? "B" : "A");

// El saque cambia cada 2 puntos; desde el 10-10 cambia en cada punto.
const saqueActual = ({ puntos, primerSaque }: Estado): Jugador => {
  const total = puntos.A + puntos.B;
  const cambios = puntos.A >= 10 && puntos.B >= 10 ? 10 + (total - 20) : Math.floor(total / 2);
  return cambios % 2 === 0 ? primerSaque : rival(primerSaque);
};

const ganaSet = (puntos: Marcador, j: Jugador): boolean =>
  puntos[j] >= PUNTOS_SET && puntos[j] - puntos[rival(j)] >= 2;

const reducer = (estado: Estado, accion: Accion): Estado => {
  if (estado.ganador) return estado;

  switch (accion.tipo) {
    case "reiniciar-set":
      return { ...estado, puntos: { A: 0, B: 0 } };
    case "punto": {
      const puntos: Marcador = { ...estado.puntos, [accion.jugador]: estado.puntos[accion.jugador] + 1 };
      if (!ganaSet(puntos, accion.jugador)) return { ...estado, puntos };

      const sets: Marcador = { ...estado.sets, [accion.jugador]: estado.sets[accion.jugador] + 1 };
      return {
        puntos: { A: 0, B: 0 },
        sets,
        primerSaque: rival(estado.primerSaque),
        ganador: sets[accion.jugador] >= SETS_PARA_GANAR ? accion.jugador : null,
      };
    }
  }
};

const linea = (e: Estado): string =>
  `Sets A ${e.sets.A}-${e.sets.B} B | Puntos ${e.puntos.A}-${e.puntos.B} | Saca ${saqueActual(e)}${e.ganador ? ` | GANA ${e.ganador}` : ""}`;

const jugar = (estado: Estado, secuencia: string): Estado =>
  [...secuencia].reduce<Estado>((e, c) => reducer(e, { tipo: "punto", jugador: c === "A" ? "A" : "B" }), estado);

console.log("Ejercicio 67: Marcador pingpong");
let estado = inicial;
estado = jugar(estado, "AABB");
console.log(`  Tras AABB:             ${linea(estado)}`);
estado = jugar(estado, "AAAAAAAAA");
console.log(`  A llega a 11:          ${linea(estado)}`);
estado = jugar(estado, "ABABABABABABABABABAB");
console.log(`  Set 2 en 10-10:        ${linea(estado)}`);
estado = jugar(estado, "BB");
console.log(`  B gana por 2:          ${linea(estado)}`);
estado = jugar(estado, "BBBBBBBBBBB");
console.log(`  Set 3:                 ${linea(estado)}`);
estado = jugar(estado, "AAAA");
console.log(`  Punto tras el final:   ${linea(estado)}`);
