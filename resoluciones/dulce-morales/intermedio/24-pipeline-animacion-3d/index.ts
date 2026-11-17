export {};

// Intermedio 24: Pipeline de animacion 3D
// Tematica: animacion 3D
// Resolucion: Dulce Morales
//
// Problema: un estudio de animacion sigue el avance de cada toma (shot) por las etapas del
// pipeline: layout -> animacion -> iluminacion -> render -> composicion. Una etapa no puede
// avanzar si la anterior no esta aprobada. Hay que detectar tomas con estados imposibles,
// ver en que etapa esta bloqueada cada toma, calcular el avance por secuencia y estimar
// si la granja de render alcanza para lo que falta renderizar.

// ===================== MODELO =====================

type Etapa = "layout" | "animacion" | "iluminacion" | "render" | "composicion";
type EstadoEtapa = "pendiente" | "en progreso" | "en revision" | "aprobado";
type Calidad = "preview" | "final";

interface Toma {
  readonly codigo: string; // ej. SQ010_SH020
  readonly secuencia: string;
  readonly frames: number;
  readonly calidadRender: Calidad;
  readonly complejidad: 1 | 2 | 3; // multiplica el tiempo de render por frame
  readonly etapas: Readonly<Record<Etapa, EstadoEtapa>>;
  readonly responsable: Readonly<Partial<Record<Etapa, string>>>;
}

interface Analisis {
  readonly toma: Toma;
  readonly etapaActual: Etapa | null; // null = toma terminada
  readonly avance: number; // 0 a 100
  readonly errores: readonly string[];
  readonly horasRender: number; // horas de granja que faltan para esta toma
}

// ===================== REGLAS (Record) =====================

const ETAPAS: readonly Etapa[] = ["layout", "animacion", "iluminacion", "render", "composicion"];

// Puntos de avance que aporta cada estado de una etapa
const PESO_ESTADO: Readonly<Record<EstadoEtapa, number>> = { pendiente: 0, "en progreso": 0.4, "en revision": 0.8, aprobado: 1 };

// Minutos de render por frame segun la calidad (se multiplica por la complejidad)
const MINUTOS_POR_FRAME: Readonly<Record<Calidad, number>> = { preview: 0.5, final: 6 };

const NODOS_GRANJA: number = 3; // computadoras de la granja de render
const HORAS_DISPONIBLES: number = 48; // horas hasta la entrega

// ===================== VALIDACION =====================

// Una etapa solo puede estar empezada si la anterior esta aprobada
function erroresDeOrden(t: Toma): string[] {
  return ETAPAS.slice(1).flatMap((etapa: Etapa, i: number): string[] => {
    const anterior: Etapa | undefined = ETAPAS[i];
    if (anterior === undefined) return [];
    const empezada: boolean = t.etapas[etapa] !== "pendiente";
    const anteriorAprobada: boolean = t.etapas[anterior] === "aprobado";
    return empezada && !anteriorAprobada ? [`${etapa} esta "${t.etapas[etapa]}" pero ${anterior} esta "${t.etapas[anterior]}"`] : [];
  });
}

function validarToma(t: Toma): string[] {
  const errores: string[] = [];
  if (!Number.isInteger(t.frames) || t.frames <= 0) errores.push(`frames invalidos (${t.frames})`);
  errores.push(...erroresDeOrden(t));
  // Etapa en curso sin responsable asignado
  ETAPAS.filter((e: Etapa): boolean => t.etapas[e] === "en progreso" && t.responsable[e] === undefined).forEach((e: Etapa): void => {
    errores.push(`${e} en progreso sin responsable`);
  });
  return errores;
}

// ===================== CALCULOS (funciones puras) =====================

function etapaActual(t: Toma): Etapa | null {
  return ETAPAS.find((e: Etapa): boolean => t.etapas[e] !== "aprobado") ?? null;
}

function calcularAvance(t: Toma): number {
  const puntos: number = ETAPAS.reduce((s: number, e: Etapa): number => s + PESO_ESTADO[t.etapas[e]], 0);
  return Math.round((puntos / ETAPAS.length) * 100);
}

function horasRenderPendientes(t: Toma): number {
  if (t.etapas.render === "aprobado") return 0;
  const minutos: number = t.frames * MINUTOS_POR_FRAME[t.calidadRender] * t.complejidad;
  return Math.round((minutos / 60) * 10) / 10;
}

function analizar(t: Toma): Analisis {
  return { toma: t, etapaActual: etapaActual(t), avance: calcularAvance(t), errores: validarToma(t), horasRender: horasRenderPendientes(t) };
}

// Agrupa por secuencia con un Map
function porSecuencia(lista: readonly Analisis[]): Map<string, Analisis[]> {
  return lista.reduce(
    (m: Map<string, Analisis[]>, a: Analisis): Map<string, Analisis[]> => m.set(a.toma.secuencia, [...(m.get(a.toma.secuencia) ?? []), a]),
    new Map<string, Analisis[]>(),
  );
}

// Carga de trabajo: cuantas etapas activas tiene cada artista
function cargaPorArtista(lista: readonly Analisis[]): Map<string, string[]> {
  const carga: Map<string, string[]> = new Map<string, string[]>();
  for (const a of lista) {
    for (const e of ETAPAS) {
      const persona: string | undefined = a.toma.responsable[e];
      const estado: EstadoEtapa = a.toma.etapas[e];
      if (persona !== undefined && (estado === "en progreso" || estado === "en revision")) {
        carga.set(persona, [...(carga.get(persona) ?? []), `${a.toma.codigo}/${e}`]);
      }
    }
  }
  return carga;
}

// ===================== DATOS DE PRUEBA =====================

function etapas(layout: EstadoEtapa, animacion: EstadoEtapa, iluminacion: EstadoEtapa, render: EstadoEtapa, composicion: EstadoEtapa): Record<Etapa, EstadoEtapa> {
  return { layout, animacion, iluminacion, render, composicion };
}

const tomas: readonly Toma[] = [
  // Toma terminada: 100%
  { codigo: "SQ010_SH010", secuencia: "SQ010", frames: 96, calidadRender: "final", complejidad: 1, etapas: etapas("aprobado", "aprobado", "aprobado", "aprobado", "aprobado"), responsable: { composicion: "Iris" } },
  { codigo: "SQ010_SH020", secuencia: "SQ010", frames: 144, calidadRender: "final", complejidad: 2, etapas: etapas("aprobado", "aprobado", "aprobado", "en progreso", "pendiente"), responsable: { render: "Ops" } },
  { codigo: "SQ010_SH030", secuencia: "SQ010", frames: 120, calidadRender: "final", complejidad: 1, etapas: etapas("aprobado", "aprobado", "en revision", "pendiente", "pendiente"), responsable: { iluminacion: "Teo" } },
  { codigo: "SQ020_SH010", secuencia: "SQ020", frames: 200, calidadRender: "final", complejidad: 3, etapas: etapas("aprobado", "en progreso", "pendiente", "pendiente", "pendiente"), responsable: { animacion: "Mara" } },
  { codigo: "SQ020_SH020", secuencia: "SQ020", frames: 80, calidadRender: "preview", complejidad: 1, etapas: etapas("aprobado", "en revision", "pendiente", "pendiente", "pendiente"), responsable: { animacion: "Mara" } },
  { codigo: "SQ020_SH030", secuencia: "SQ020", frames: 160, calidadRender: "final", complejidad: 2, etapas: etapas("en progreso", "pendiente", "pendiente", "pendiente", "pendiente"), responsable: { layout: "Leo" } },
  // Estado imposible: ilumina antes de que se apruebe la animacion
  { codigo: "SQ030_SH010", secuencia: "SQ030", frames: 110, calidadRender: "final", complejidad: 2, etapas: etapas("aprobado", "en revision", "en progreso", "pendiente", "pendiente"), responsable: { animacion: "Mara", iluminacion: "Teo" } },
  // Errores de datos: frames 0 y etapa en progreso sin responsable
  { codigo: "SQ030_SH020", secuencia: "SQ030", frames: 0, calidadRender: "final", complejidad: 1, etapas: etapas("aprobado", "en progreso", "pendiente", "pendiente", "pendiente"), responsable: {} },
];

// ===================== SALIDA POR CONSOLA =====================

function barra(porcentaje: number): string {
  const llenos: number = Math.round(porcentaje / 10);
  return `[${"#".repeat(llenos)}${".".repeat(10 - llenos)}] ${String(porcentaje).padStart(3)}%`;
}

function main(): void {
  const analisis: Analisis[] = tomas.map(analizar);

  console.log("====================== PIPELINE DE ANIMACION ======================");
  for (const [secuencia, lista] of porSecuencia(analisis)) {
    const promedio: number = Math.round(lista.reduce((s: number, a: Analisis): number => s + a.avance, 0) / lista.length);
    console.log(`\n${secuencia}  ${barra(promedio)}`);
    lista.forEach((a: Analisis): void => {
      const etapa: string = a.etapaActual === null ? "TERMINADA" : `${a.etapaActual} (${a.toma.etapas[a.etapaActual]})`;
      console.log(`  ${a.toma.codigo} ${barra(a.avance)}  ${etapa}`);
      a.errores.forEach((e: string): void => console.log(`      X ${e}`));
    });
  }

  console.log("\n====================== CUELLOS DE BOTELLA ======================");
  const porEtapa: Record<Etapa, number> = { layout: 0, animacion: 0, iluminacion: 0, render: 0, composicion: 0 };
  analisis.forEach((a: Analisis): void => {
    if (a.etapaActual !== null) porEtapa[a.etapaActual] += 1;
  });
  ETAPAS.forEach((e: Etapa): void => console.log(`${e.padEnd(12)} ${"*".repeat(porEtapa[e])} ${porEtapa[e]} toma(s)`));

  console.log("\n====================== CARGA DE ARTISTAS ======================");
  [...cargaPorArtista(analisis).entries()]
    .sort((a, b): number => b[1].length - a[1].length || a[0].localeCompare(b[0]))
    .forEach(([persona, tareas]): void => console.log(`${persona.padEnd(5)} ${tareas.length} tarea(s): ${tareas.join(", ")}`));

  console.log("\n====================== GRANJA DE RENDER ======================");
  const validas: Analisis[] = analisis.filter((a: Analisis): boolean => a.errores.length === 0);
  const horas: number = Math.round(validas.reduce((s: number, a: Analisis): number => s + a.horasRender, 0) * 10) / 10;
  const capacidad: number = NODOS_GRANJA * HORAS_DISPONIBLES;
  validas
    .filter((a: Analisis): boolean => a.horasRender > 0)
    .sort((a, b): number => b.horasRender - a.horasRender)
    .forEach((a: Analisis): void => console.log(`${a.toma.codigo} ${a.toma.frames} frames x ${MINUTOS_POR_FRAME[a.toma.calidadRender]} min x complejidad ${a.toma.complejidad} = ${a.horasRender} h`));
  console.log(`Total pendiente: ${horas} h de nodo | capacidad: ${NODOS_GRANJA} nodos x ${HORAS_DISPONIBLES} h = ${capacidad} h`);
  console.log(horas <= capacidad ? `Alcanza: sobran ${Math.round((capacidad - horas) * 10) / 10} h` : `NO alcanza: faltan ${Math.round((horas - capacidad) * 10) / 10} h`);
  console.log(`(Se excluyen ${analisis.length - validas.length} toma(s) con errores hasta que se corrijan)`);
}

main();
