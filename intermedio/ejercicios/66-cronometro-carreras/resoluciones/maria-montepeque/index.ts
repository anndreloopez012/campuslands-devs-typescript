export {};

interface Estado {
  readonly modo: "detenido" | "corriendo" | "pausado";
  readonly totalMs: number;
  readonly inicioVueltaMs: number;
  readonly vueltas: readonly number[];
}

type Accion =
  | { readonly tipo: "iniciar" }
  | { readonly tipo: "pausar" }
  | { readonly tipo: "vuelta" }
  | { readonly tipo: "tick"; readonly ms: number }
  | { readonly tipo: "reiniciar" };

const inicial: Estado = { modo: "detenido", totalMs: 0, inicioVueltaMs: 0, vueltas: [] };

const reducer = (estado: Estado, accion: Accion): Estado => {
  switch (accion.tipo) {
    case "iniciar":
      return estado.modo === "corriendo" ? estado : { ...estado, modo: "corriendo" };
    case "pausar":
      return estado.modo === "corriendo" ? { ...estado, modo: "pausado" } : estado;
    case "tick":
      return estado.modo === "corriendo" && accion.ms > 0 ? { ...estado, totalMs: estado.totalMs + accion.ms } : estado;
    case "vuelta": {
      if (estado.modo !== "corriendo") return estado;
      const duracion = estado.totalMs - estado.inicioVueltaMs;
      return duracion <= 0 ? estado : { ...estado, inicioVueltaMs: estado.totalMs, vueltas: [...estado.vueltas, duracion] };
    }
    case "reiniciar":
      return inicial;
  }
};

const formatear = (ms: number): string => {
  const minutos = Math.floor(ms / 60000);
  const segundos = Math.floor((ms % 60000) / 1000);
  return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}.${String(ms % 1000).padStart(3, "0")}`;
};

const analizar = (vueltas: readonly number[]) => {
  if (vueltas.length === 0) return null;
  const mejor = Math.min(...vueltas);
  const peor = Math.max(...vueltas);
  const promedio = Math.round(vueltas.reduce((a, b) => a + b, 0) / vueltas.length);
  return { mejor, peor, promedio, indiceMejor: vueltas.indexOf(mejor) + 1 };
};

console.log("Ejercicio 66: Cronometro de vueltas");
const guion: readonly Accion[] = [
  { tipo: "vuelta" },
  { tipo: "tick", ms: 500 },
  { tipo: "iniciar" },
  { tipo: "tick", ms: 91_250 },
  { tipo: "vuelta" },
  { tipo: "tick", ms: 89_800 },
  { tipo: "vuelta" },
  { tipo: "pausar" },
  { tipo: "tick", ms: 5_000 },
  { tipo: "iniciar" },
  { tipo: "tick", ms: 92_410 },
  { tipo: "vuelta" },
  { tipo: "tick", ms: 90_100 },
  { tipo: "vuelta" },
];

let estado = inicial;
guion.forEach((accion) => {
  const antes = estado.vueltas.length;
  estado = reducer(estado, accion);
  if (estado.vueltas.length > antes) console.log(`  Vuelta ${estado.vueltas.length}: ${formatear(estado.vueltas[estado.vueltas.length - 1])}`);
});

const resumen = analizar(estado.vueltas);
console.log(`Tiempo total: ${formatear(estado.totalMs)} (${estado.modo})`);
if (resumen) {
  console.log(`Mejor: vuelta ${resumen.indiceMejor} (${formatear(resumen.mejor)}) | peor: ${formatear(resumen.peor)} | promedio: ${formatear(resumen.promedio)}`);
}
