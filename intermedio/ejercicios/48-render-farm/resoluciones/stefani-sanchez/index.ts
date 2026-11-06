// Solución Ejercicio Intermedio 48 - Stefani Sánchez
export {};

type EstadoTrabajo = "en-cola" | "renderizando" | "terminado" | "fallido";

interface Trabajo {
  readonly id: number;
  readonly escena: string;
  readonly frames: number;
  readonly segundosPorFrame: number;
  readonly nodo: string;
  readonly estado: EstadoTrabajo;
}

const trabajos: readonly Trabajo[] = [
  { id: 1, escena: "Intro Logo", frames: 240, segundosPorFrame: 12, nodo: "nodo-a", estado: "terminado" },
  { id: 2, escena: "Persecucion", frames: 1440, segundosPorFrame: 45, nodo: "nodo-b", estado: "renderizando" },
  { id: 3, escena: "Humo Volumetrico", frames: 600, segundosPorFrame: 90, nodo: "nodo-a", estado: "en-cola" },
  { id: 4, escena: "Ciudad Noche", frames: 480, segundosPorFrame: 30, nodo: "nodo-c", estado: "fallido" },
  { id: 5, escena: "Creditos", frames: 120, segundosPorFrame: 5, nodo: "nodo-b", estado: "en-cola" },
  { id: 6, escena: "Sin Frames", frames: 0, segundosPorFrame: 10, nodo: "nodo-a", estado: "en-cola" },
  { id: 7, escena: "Sin Nodo", frames: 100, segundosPorFrame: 10, nodo: "", estado: "en-cola" },
];

const esTrabajoValido = (t: Trabajo): boolean =>
  t.frames > 0 && t.segundosPorFrame > 0 && t.nodo.trim().length > 0 && t.escena.trim().length > 0;

const segundosTotales = (t: Trabajo): number => t.frames * t.segundosPorFrame;

const formatearDuracion = (segundos: number): string => {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  return `${h} h ${m} min`;
};

const cargaPorNodo = (items: readonly Trabajo[]): Map<string, number> =>
  items
    .filter((t) => t.estado === "en-cola" || t.estado === "renderizando")
    .reduce((m, t) => m.set(t.nodo, (m.get(t.nodo) ?? 0) + segundosTotales(t)), new Map<string, number>());

const validos = trabajos.filter(esTrabajoValido);
const invalidos = trabajos.filter((t) => !esTrabajoValido(t));
const conteoEstados = validos.reduce((m, t) => m.set(t.estado, (m.get(t.estado) ?? 0) + 1), new Map<EstadoTrabajo, number>());
const carga = cargaPorNodo(validos);
const nodoMasCargado = [...carga].sort((a, b) => b[1] - a[1])[0];
const reintentar = validos.filter((t) => t.estado === "fallido");

console.log("Ejercicio 48: Render farm 3D");
console.log(`Trabajos validos: ${validos.length} | invalidos: ${invalidos.length}`);
invalidos.forEach((t) => console.log(`  - #${t.id} "${t.escena}" tiene datos invalidos`));
conteoEstados.forEach((n, estado) => console.log(`  ${estado}: ${n}`));
carga.forEach((s, nodo) => console.log(`  ${nodo}: ${formatearDuracion(s)} pendientes`));
console.log(`Nodo mas cargado: ${nodoMasCargado[0]} (${formatearDuracion(nodoMasCargado[1])})`);
reintentar.forEach((t) => console.log(`  ! Reencolar "${t.escena}" (${formatearDuracion(segundosTotales(t))})`));
