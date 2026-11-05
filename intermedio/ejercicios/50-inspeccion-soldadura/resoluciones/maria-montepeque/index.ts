export {};

type TipoDefecto = "porosidad" | "grieta" | "socavado" | "salpicadura";
type Dictamen = "aprobado" | "retrabajo" | "rechazado";

interface Defecto {
  readonly tipo: TipoDefecto;
  readonly longitudMm: number;
}

interface Inspeccion {
  readonly id: number;
  readonly cordon: string;
  readonly fecha: string;
  readonly inspector: string;
  readonly defectos: readonly Defecto[];
}

const LIMITE_POROSIDAD_MM = 6;
const LIMITE_SOCAVADO_MM = 10;

const inspecciones: readonly Inspeccion[] = [
  { id: 1, cordon: "C-101", fecha: "2026-04-03", inspector: "Elsa", defectos: [] },
  { id: 2, cordon: "C-102", fecha: "2026-04-03", inspector: "Elsa", defectos: [{ tipo: "porosidad", longitudMm: 2 }, { tipo: "porosidad", longitudMm: 3 }] },
  { id: 3, cordon: "C-103", fecha: "2026-04-10", inspector: "Fabio", defectos: [{ tipo: "grieta", longitudMm: 4 }] },
  { id: 4, cordon: "C-104", fecha: "2026-04-10", inspector: "Fabio", defectos: [{ tipo: "porosidad", longitudMm: 5 }, { tipo: "porosidad", longitudMm: 4 }] },
  { id: 5, cordon: "C-105", fecha: "2026-05-02", inspector: "Elsa", defectos: [{ tipo: "socavado", longitudMm: 12 }] },
  { id: 6, cordon: "C-106", fecha: "2026-05-02", inspector: "Fabio", defectos: [{ tipo: "salpicadura", longitudMm: 1 }] },
  { id: 7, cordon: "C-107", fecha: "2026-05-30", inspector: "", defectos: [] },
  { id: 8, cordon: "C-108", fecha: "2026-05-31", inspector: "Elsa", defectos: [{ tipo: "porosidad", longitudMm: -2 }] },
];

const esInspeccionValida = (i: Inspeccion): boolean =>
  i.inspector.trim().length > 0 &&
  i.cordon.trim().length > 0 &&
  !Number.isNaN(new Date(`${i.fecha}T00:00:00Z`).getTime()) &&
  i.defectos.every((d) => d.longitudMm > 0);

const sumarLongitud = (i: Inspeccion, tipo: TipoDefecto): number =>
  i.defectos.filter((d) => d.tipo === tipo).reduce((acc, d) => acc + d.longitudMm, 0);

const dictaminar = (i: Inspeccion): Dictamen => {
  if (i.defectos.some((d) => d.tipo === "grieta")) return "rechazado";
  if (sumarLongitud(i, "porosidad") > LIMITE_POROSIDAD_MM || sumarLongitud(i, "socavado") > LIMITE_SOCAVADO_MM) {
    return "retrabajo";
  }
  return "aprobado";
};

const validas = inspecciones.filter(esInspeccionValida);
const invalidas = inspecciones.filter((i) => !esInspeccionValida(i));
const dictamenes = validas.map((i) => ({ inspeccion: i, dictamen: dictaminar(i) }));
const porDictamen = dictamenes.reduce((m, d) => m.set(d.dictamen, (m.get(d.dictamen) ?? 0) + 1), new Map<Dictamen, number>());
const defectosPorTipo = validas.flatMap((i) => i.defectos).reduce((m, d) => m.set(d.tipo, (m.get(d.tipo) ?? 0) + 1), new Map<TipoDefecto, number>());
const porMes = dictamenes.reduce((m, d) => m.set(d.inspeccion.fecha.slice(0, 7), (m.get(d.inspeccion.fecha.slice(0, 7)) ?? 0) + 1), new Map<string, number>());

console.log("Ejercicio 50: Inspeccion visual de soldadura");
console.log(`Inspecciones validas: ${validas.length} | invalidas: ${invalidas.length}`);
invalidas.forEach((i) => console.log(`  - #${i.id} ${i.cordon} tiene datos invalidos`));
dictamenes.forEach((d) => console.log(`  ${d.inspeccion.cordon} (${d.inspeccion.fecha}): ${d.dictamen}`));
porDictamen.forEach((n, d) => console.log(`  ${d}: ${n}`));
console.log(`Defectos por tipo: ${[...defectosPorTipo].map(([t, n]) => `${t}=${n}`).join(", ")}`);
console.log(`Inspecciones por mes: ${[...porMes].map(([m, n]) => `${m}=${n}`).join(", ")}`);
