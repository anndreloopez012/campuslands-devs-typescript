export {};

type Vista = "exterior" | "interior" | "planta";

interface Render {
  readonly id: number;
  readonly proyecto: string;
  readonly vista: Vista;
  readonly ancho: number;
  readonly alto: number;
  readonly muestras: number;
  readonly aprobado: boolean;
}

const muestrasMinimas: Record<Vista, number> = {
  exterior: 512,
  interior: 1024,
  planta: 128,
};

const VISTAS_REQUERIDAS: readonly Vista[] = ["exterior", "interior", "planta"];

const renders: readonly Render[] = [
  { id: 1, proyecto: "Casa Lago", vista: "exterior", ancho: 3840, alto: 2160, muestras: 800, aprobado: true },
  { id: 2, proyecto: "Casa Lago", vista: "interior", ancho: 3840, alto: 2160, muestras: 1200, aprobado: true },
  { id: 3, proyecto: "Casa Lago", vista: "planta", ancho: 1920, alto: 1080, muestras: 200, aprobado: true },
  { id: 4, proyecto: "Torre Norte", vista: "exterior", ancho: 3840, alto: 2160, muestras: 600, aprobado: true },
  { id: 5, proyecto: "Torre Norte", vista: "interior", ancho: 1920, alto: 1080, muestras: 500, aprobado: false },
  { id: 6, proyecto: "Loft Centro", vista: "planta", ancho: 0, alto: 1080, muestras: 300, aprobado: true },
  { id: 7, proyecto: "Loft Centro", vista: "exterior", ancho: 1920, alto: 1080, muestras: 700, aprobado: false },
];

const esRenderValido = (render: Render): boolean =>
  render.ancho > 0 && render.alto > 0 && render.muestras >= muestrasMinimas[render.vista];

const agruparPorProyecto = (items: readonly Render[]): Map<string, Render[]> =>
  items.reduce((mapa, render) => {
    mapa.set(render.proyecto, [...(mapa.get(render.proyecto) ?? []), render]);
    return mapa;
  }, new Map<string, Render[]>());

const vistasAprobadas = (items: readonly Render[]): Set<Vista> =>
  new Set(items.filter((r) => r.aprobado).map((r) => r.vista));

const validos = renders.filter(esRenderValido);
const invalidos = renders.filter((render) => !esRenderValido(render));

console.log("Ejercicio 25: Revision de renders de arquitectura");
console.log(`Renders validos: ${validos.length} | invalidos: ${invalidos.length}`);
invalidos.forEach((r) => console.log(`  - #${r.id} ${r.proyecto} (${r.vista}) no cumple resolucion o muestras`));
agruparPorProyecto(validos).forEach((items, proyecto) => {
  const aprobadas = vistasAprobadas(items);
  const faltantes = VISTAS_REQUERIDAS.filter((vista) => !aprobadas.has(vista));
  const estado = faltantes.length === 0 ? "LISTO PARA ENTREGA" : `faltan: ${faltantes.join(", ")}`;
  console.log(`  ${proyecto}: ${estado}`);
});
