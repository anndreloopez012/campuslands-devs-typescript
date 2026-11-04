export {};

type Etapa = "modelado" | "rigging" | "animacion" | "render" | "composicion";

interface Escena {
  readonly id: number;
  readonly nombre: string;
  readonly historial: readonly Etapa[];
}

const ordenEtapas: Record<Etapa, number> = {
  modelado: 0,
  rigging: 1,
  animacion: 2,
  render: 3,
  composicion: 4,
};

const escenas: readonly Escena[] = [
  { id: 1, nombre: "Intro Robot", historial: ["modelado", "rigging", "animacion", "render", "composicion"] },
  { id: 2, nombre: "Persecucion", historial: ["modelado", "rigging", "animacion"] },
  { id: 3, nombre: "Cielo Dinamico", historial: ["modelado", "render"] },
  { id: 4, nombre: "Final Epico", historial: ["modelado", "rigging", "rigging", "animacion"] },
  { id: 5, nombre: "Personaje Base", historial: ["modelado"] },
  { id: 6, nombre: "", historial: ["modelado", "rigging"] },
  { id: 7, nombre: "Sin Empezar", historial: [] },
];

const esTransicionValida = (desde: Etapa, hacia: Etapa): boolean =>
  ordenEtapas[hacia] === ordenEtapas[desde] + 1;

const historialEsValido = (historial: readonly Etapa[]): boolean =>
  historial.length > 0 &&
  historial[0] === "modelado" &&
  historial.every((etapa, i) => i === 0 || esTransicionValida(historial[i - 1], etapa));

const esEscenaValida = (escena: Escena): boolean =>
  escena.nombre.trim().length > 0 && historialEsValido(escena.historial);

const etapaActual = (escena: Escena): Etapa => escena.historial[escena.historial.length - 1];

const avance = (escena: Escena): number =>
  Math.round(((ordenEtapas[etapaActual(escena)] + 1) / 5) * 100);

const validas = escenas.filter(esEscenaValida);
const invalidas = escenas.filter((escena) => !esEscenaValida(escena));
const porEtapa = validas.reduce(
  (mapa, e) => mapa.set(etapaActual(e), (mapa.get(etapaActual(e)) ?? 0) + 1),
  new Map<Etapa, number>(),
);
const terminadas = validas.filter((escena) => etapaActual(escena) === "composicion");

console.log("Ejercicio 24: Pipeline de animacion 3D");
console.log(`Escenas validas: ${validas.length} | invalidas: ${invalidas.length}`);
invalidas.forEach((e) => console.log(`  - #${e.id} "${e.nombre}" tiene un pipeline invalido`));
validas.forEach((e) => console.log(`  ${e.nombre}: ${etapaActual(e)} (${avance(e)}%)`));
porEtapa.forEach((cantidad, etapa) => console.log(`  En ${etapa}: ${cantidad}`));
console.log(`Escenas terminadas: ${terminadas.length}`);
