export {};

type Fase =
  | { readonly tipo: "listo" }
  | { readonly tipo: "round"; readonly numero: number; readonly restante: number }
  | { readonly tipo: "descanso"; readonly despuesDe: number; readonly restante: number }
  | { readonly tipo: "terminado" };

interface Estado {
  readonly fase: Fase;
  readonly pausado: boolean;
}

type Accion =
  | { readonly tipo: "iniciar" }
  | { readonly tipo: "pausar" }
  | { readonly tipo: "reanudar" }
  | { readonly tipo: "tick"; readonly segundos: number };

const ROUNDS = 3;
const DURACION_ROUND = 120;
const DURACION_DESCANSO = 45;

const avanzar = (fase: Fase, segundos: number): Fase => {
  switch (fase.tipo) {
    case "round": {
      const restante = fase.restante - segundos;
      if (restante > 0) return { ...fase, restante };
      if (fase.numero === ROUNDS) return { tipo: "terminado" };
      return { tipo: "descanso", despuesDe: fase.numero, restante: DURACION_DESCANSO };
    }
    case "descanso": {
      const restante = fase.restante - segundos;
      return restante > 0 ? { ...fase, restante } : { tipo: "round", numero: fase.despuesDe + 1, restante: DURACION_ROUND };
    }
    default:
      return fase;
  }
};

const reducer = (estado: Estado, accion: Accion): Estado => {
  switch (accion.tipo) {
    case "iniciar":
      return estado.fase.tipo === "listo" || estado.fase.tipo === "terminado"
        ? { fase: { tipo: "round", numero: 1, restante: DURACION_ROUND }, pausado: false }
        : estado;
    case "pausar":
      return estado.fase.tipo === "round" || estado.fase.tipo === "descanso" ? { ...estado, pausado: true } : estado;
    case "reanudar":
      return { ...estado, pausado: false };
    case "tick":
      return estado.pausado || accion.segundos <= 0 ? estado : { ...estado, fase: avanzar(estado.fase, accion.segundos) };
  }
};

const formatear = (segundos: number): string =>
  `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, "0")}`;

const describir = ({ fase, pausado }: Estado): string => {
  const base = (() => {
    switch (fase.tipo) {
      case "listo": return "Listo para empezar";
      case "round": return `ROUND ${fase.numero}/${ROUNDS} - ${formatear(fase.restante)}`;
      case "descanso": return `DESCANSO tras round ${fase.despuesDe} - ${formatear(fase.restante)}`;
      case "terminado": return "COMBATE TERMINADO";
    }
  })();
  return pausado ? `${base} (PAUSADO)` : base;
};

console.log("Ejercicio 65: Timer de rounds kickboxing");
let estado: Estado = { fase: { tipo: "listo" }, pausado: false };
const guion: readonly Accion[] = [
  { tipo: "tick", segundos: 10 },
  { tipo: "iniciar" },
  { tipo: "tick", segundos: 60 },
  { tipo: "pausar" },
  { tipo: "tick", segundos: 30 },
  { tipo: "reanudar" },
  { tipo: "tick", segundos: 60 },
  { tipo: "tick", segundos: 30 },
  { tipo: "tick", segundos: 45 },
  { tipo: "tick", segundos: 120 },
  { tipo: "tick", segundos: 45 },
  { tipo: "tick", segundos: 120 },
  { tipo: "tick", segundos: 5 },
];
guion.forEach((accion) => {
  estado = reducer(estado, accion);
  console.log(`  ${accion.tipo}${accion.tipo === "tick" ? ` +${accion.segundos}s` : ""} -> ${describir(estado)}`);
});
