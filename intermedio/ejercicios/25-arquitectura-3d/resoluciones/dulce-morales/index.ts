export {};

// Intermedio 25: Revision de renders arquitectura
// Tematica: diseno 3D arquitectura
// Resolucion: Dulce Morales
//
// Problema: un estudio de visualizacion arquitectonica entrega renders a sus clientes.
// Antes de enviarlos, cada render pasa una revision: resolucion minima segun su uso,
// observaciones de calidad (criticas o menores) y limite de rondas de cambios.
// Ademas, cada proyecto exige ciertas vistas (fachada, sala, cocina...) y hay que
// avisar cuales faltan. Al final, un tablero por proyecto.

// ===================== MODELO =====================

type Uso = "web" | "redes" | "impresion";
type Vista = "fachada" | "aerea" | "sala" | "cocina" | "recamara" | "bano" | "terraza";
type Luz = "dia" | "atardecer" | "noche";
type Observacion =
  | "ruido" // critica: el render tiene granulado
  | "horizonte torcido" // critica
  | "materiales sin textura" // critica
  | "sin escala humana" // menor: no hay personas para dar escala
  | "exposicion alta" // menor
  | "vegetacion repetida"; // menor
type Veredicto = "aprobado" | "cambios menores" | "rechazado";

interface Render {
  readonly archivo: string;
  readonly proyecto: string;
  readonly vista: Vista;
  readonly luz: Luz;
  readonly uso: Uso;
  readonly resolucion: readonly [ancho: number, alto: number];
  readonly observaciones: ReadonlySet<Observacion>;
  readonly ronda: number; // ronda de cambios en la que va este render
}

interface Proyecto {
  readonly codigo: string;
  readonly nombre: string;
  readonly cliente: string;
  readonly vistasRequeridas: ReadonlySet<Vista>;
  readonly rondasIncluidas: number;
}

interface Revision {
  readonly render: Render;
  readonly veredicto: Veredicto;
  readonly motivos: readonly string[];
  readonly rondaExtra: boolean;
}

// ===================== REGLAS (Record y Set) =====================

const RESOLUCION_MINIMA: Readonly<Record<Uso, readonly [number, number]>> = {
  web: [1920, 1080],
  redes: [1080, 1080],
  impresion: [6000, 4000],
};

const CRITICAS: ReadonlySet<Observacion> = new Set<Observacion>(["ruido", "horizonte torcido", "materiales sin textura"]);
const COSTO_RONDA_EXTRA: number = 120;

// ===================== REVISION (funciones puras) =====================

function revisarResolucion(r: Render): string | null {
  const [ancho, alto] = r.resolucion;
  const [minAncho, minAlto] = RESOLUCION_MINIMA[r.uso];
  if (ancho < minAncho || alto < minAlto) return `${ancho}x${alto} es menor que el minimo para ${r.uso} (${minAncho}x${minAlto})`;
  return null;
}

function revisar(r: Render, proyecto: Proyecto | undefined): Revision {
  const motivos: string[] = [];
  if (proyecto === undefined) {
    return { render: r, veredicto: "rechazado", motivos: [`proyecto ${r.proyecto} no existe`], rondaExtra: false };
  }
  const resolucion: string | null = revisarResolucion(r);
  if (resolucion !== null) motivos.push(resolucion);

  const criticas: Observacion[] = [...r.observaciones].filter((o: Observacion): boolean => CRITICAS.has(o));
  const menores: Observacion[] = [...r.observaciones].filter((o: Observacion): boolean => !CRITICAS.has(o));
  criticas.forEach((o: Observacion): void => {
    motivos.push(`critico: ${o}`);
  });
  menores.forEach((o: Observacion): void => {
    motivos.push(`menor: ${o}`);
  });

  const veredicto: Veredicto = resolucion !== null || criticas.length > 0 ? "rechazado" : menores.length > 0 ? "cambios menores" : "aprobado";
  return { render: r, veredicto, motivos, rondaExtra: r.ronda > proyecto.rondasIncluidas };
}

// Vistas requeridas que todavia no tienen un render aprobado
function vistasFaltantes(p: Proyecto, revisiones: readonly Revision[]): Vista[] {
  const aprobadas: Set<Vista> = new Set(
    revisiones.filter((rv: Revision): boolean => rv.render.proyecto === p.codigo && rv.veredicto === "aprobado").map((rv: Revision): Vista => rv.render.vista),
  );
  return [...p.vistasRequeridas].filter((v: Vista): boolean => !aprobadas.has(v));
}

function agruparPorProyecto(revisiones: readonly Revision[]): Map<string, Revision[]> {
  return revisiones.reduce(
    (m: Map<string, Revision[]>, rv: Revision): Map<string, Revision[]> => m.set(rv.render.proyecto, [...(m.get(rv.render.proyecto) ?? []), rv]),
    new Map<string, Revision[]>(),
  );
}

// ===================== DATOS DE PRUEBA =====================

const proyectos: readonly Proyecto[] = [
  { codigo: "CASA-LAGO", nombre: "Casa del Lago", cliente: "Familia Rojas", vistasRequeridas: new Set<Vista>(["fachada", "aerea", "sala", "cocina"]), rondasIncluidas: 2 },
  { codigo: "TORRE-NORTE", nombre: "Torre Norte", cliente: "Constructora Andina", vistasRequeridas: new Set<Vista>(["fachada", "aerea", "terraza"]), rondasIncluidas: 3 },
  { codigo: "LOFT-CENTRO", nombre: "Loft Centro", cliente: "Ana Prieto", vistasRequeridas: new Set<Vista>(["sala", "recamara"]), rondasIncluidas: 2 },
];

function obs(...lista: Observacion[]): ReadonlySet<Observacion> {
  return new Set<Observacion>(lista);
}

const renders: readonly Render[] = [
  { archivo: "lago_fachada_v2.png", proyecto: "CASA-LAGO", vista: "fachada", luz: "atardecer", uso: "web", resolucion: [3840, 2160], observaciones: obs(), ronda: 2 },
  { archivo: "lago_aerea_v1.png", proyecto: "CASA-LAGO", vista: "aerea", luz: "dia", uso: "web", resolucion: [1920, 1080], observaciones: obs(), ronda: 1 }, // limite: resolucion EXACTA al minimo
  { archivo: "lago_sala_v3.png", proyecto: "CASA-LAGO", vista: "sala", luz: "dia", uso: "impresion", resolucion: [6000, 4000], observaciones: obs("sin escala humana"), ronda: 3 }, // ronda extra
  { archivo: "lago_cocina_v1.png", proyecto: "CASA-LAGO", vista: "cocina", luz: "noche", uso: "web", resolucion: [2560, 1440], observaciones: obs("ruido", "exposicion alta"), ronda: 1 },
  { archivo: "torre_fachada_v1.png", proyecto: "TORRE-NORTE", vista: "fachada", luz: "noche", uso: "impresion", resolucion: [5000, 3500], observaciones: obs(), ronda: 1 }, // resolucion baja
  { archivo: "torre_aerea_v2.png", proyecto: "TORRE-NORTE", vista: "aerea", luz: "dia", uso: "web", resolucion: [3840, 2160], observaciones: obs("vegetacion repetida", "sin escala humana"), ronda: 2 },
  { archivo: "torre_terraza_v1.png", proyecto: "TORRE-NORTE", vista: "terraza", luz: "atardecer", uso: "redes", resolucion: [1080, 1350], observaciones: obs(), ronda: 1 },
  { archivo: "torre_lobby_v4.png", proyecto: "TORRE-NORTE", vista: "sala", luz: "dia", uso: "web", resolucion: [2560, 1440], observaciones: obs("horizonte torcido", "materiales sin textura"), ronda: 4 }, // ronda extra y critico
  // Proyecto completo: todas sus vistas aprobadas -> listo para entregar
  { archivo: "loft_sala_v2.png", proyecto: "LOFT-CENTRO", vista: "sala", luz: "dia", uso: "redes", resolucion: [1080, 1080], observaciones: obs(), ronda: 2 }, // limite: ronda 2 de 2 incluidas, no es extra
  { archivo: "loft_recamara_v1.png", proyecto: "LOFT-CENTRO", vista: "recamara", luz: "noche", uso: "web", resolucion: [2560, 1440], observaciones: obs(), ronda: 1 },
  { archivo: "oficina_v1.png", proyecto: "OFI-SUR", vista: "sala", luz: "dia", uso: "web", resolucion: [1920, 1080], observaciones: obs(), ronda: 1 },
];

// ===================== SALIDA POR CONSOLA =====================

const ICONO: Readonly<Record<Veredicto, string>> = { aprobado: "OK ", "cambios menores": "~  ", rechazado: "X  " };

function main(): void {
  const porCodigo: Map<string, Proyecto> = new Map(proyectos.map((p: Proyecto): [string, Proyecto] => [p.codigo, p]));
  const revisiones: Revision[] = renders.map((r: Render): Revision => revisar(r, porCodigo.get(r.proyecto)));

  console.log("====================== REVISION DE RENDERS ======================");
  revisiones.forEach((rv: Revision): void => {
    const r: Render = rv.render;
    const extra: string = rv.rondaExtra ? "  (ronda extra)" : "";
    console.log(`${ICONO[rv.veredicto]}${r.archivo.padEnd(22)} ${r.vista.padEnd(8)} ${r.luz.padEnd(9)} ${r.uso.padEnd(9)} ${r.resolucion[0]}x${r.resolucion[1]} -> ${rv.veredicto}${extra}`);
    rv.motivos.forEach((m: string): void => console.log(`     - ${m}`));
  });

  console.log("\n====================== TABLERO POR PROYECTO ======================");
  const grupos: Map<string, Revision[]> = agruparPorProyecto(revisiones);
  for (const p of proyectos) {
    const lista: Revision[] = grupos.get(p.codigo) ?? [];
    const conteo: Record<Veredicto, number> = { aprobado: 0, "cambios menores": 0, rechazado: 0 };
    lista.forEach((rv: Revision): void => {
      conteo[rv.veredicto] += 1;
    });
    const faltan: Vista[] = vistasFaltantes(p, lista);
    const rondasExtra: number = lista.filter((rv: Revision): boolean => rv.rondaExtra).length;
    const cubiertas: number = p.vistasRequeridas.size - faltan.length;

    console.log(`\n${p.nombre} (${p.cliente})`);
    console.log(`  Renders: ${lista.length} | aprobados ${conteo.aprobado}, cambios menores ${conteo["cambios menores"]}, rechazados ${conteo.rechazado}`);
    console.log(`  Vistas requeridas aprobadas: ${cubiertas}/${p.vistasRequeridas.size}${faltan.length > 0 ? ` | faltan: ${faltan.join(", ")}` : " | completo"}`);
    console.log(`  Rondas extra: ${rondasExtra} (cobro adicional $${rondasExtra * COSTO_RONDA_EXTRA})`);
    console.log(`  Estado: ${faltan.length === 0 ? "LISTO PARA ENTREGAR" : "en revision"}`);
  }

  const huerfanos: Revision[] = revisiones.filter((rv: Revision): boolean => !porCodigo.has(rv.render.proyecto));
  if (huerfanos.length > 0) console.log(`\nRenders sin proyecto: ${huerfanos.map((rv) => rv.render.archivo).join(", ")}`);

  // Que problemas aparecen mas (para mejorar el flujo de trabajo)
  const frecuencia: Map<Observacion, number> = new Map<Observacion, number>();
  renders.forEach((r: Render): void => r.observaciones.forEach((o: Observacion): void => {
    frecuencia.set(o, (frecuencia.get(o) ?? 0) + 1);
  }));
  console.log(`Observaciones encontradas: ${[...frecuencia.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([o, n]) => `${o} (${n})`).join(", ")}`);
}

main();
