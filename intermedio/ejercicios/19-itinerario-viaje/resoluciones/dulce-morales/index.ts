export {};

// Intermedio 19: Itinerario de viaje
// Tematica: viajes
// Resolucion: Dulce Morales
//
// Problema: revisar un itinerario de varios dias antes del viaje. Cada actividad tiene hora,
// duracion, lugar y costo. Hay que detectar choques de horario, falta de tiempo para moverse
// entre lugares distintos, actividades fuera del horario del lugar y dias que se pasan del
// presupuesto. Al final, un resumen del gasto por dia y por categoria.

// ===================== MODELO (objetos anidados) =====================

type Categoria = "transporte" | "comida" | "cultura" | "aventura" | "descanso";
type Severidad = "error" | "aviso";

interface Lugar {
  readonly nombre: string;
  readonly zona: string; // actividades en la misma zona no necesitan traslado
  readonly abre: string; // "HH:MM"
  readonly cierra: string;
}

interface Actividad {
  readonly nombre: string;
  readonly inicio: string; // "HH:MM"
  readonly duracionMin: number;
  readonly lugar: Lugar;
  readonly costoUsd: number;
  readonly categoria: Categoria;
}

interface Dia {
  readonly numero: number;
  readonly ciudad: { readonly nombre: string; readonly pais: string };
  readonly presupuestoUsd: number;
  readonly actividades: readonly Actividad[];
}

interface Problema {
  readonly dia: number;
  readonly severidad: Severidad;
  readonly mensaje: string;
}

interface ResumenDia {
  readonly dia: Dia;
  readonly gasto: number;
  readonly minutosOcupados: number;
  readonly problemas: readonly Problema[];
}

// ===================== REGLAS =====================

const TRASLADO_MIN: number = 30; // minutos necesarios para cambiar de zona
const MINUTOS_DIA_MAXIMO: number = 12 * 60; // mas de 12 h ocupadas es un dia agotador

// ===================== UTILIDADES DE HORA =====================

function aMinutos(hora: string): number | null {
  const partes: RegExpMatchArray | null = hora.match(/^(\d{2}):(\d{2})$/);
  if (partes === null) return null;
  const h: number = Number(partes[1]);
  const m: number = Number(partes[2]);
  return h < 24 && m < 60 ? h * 60 + m : null;
}

function aHora(minutos: number): string {
  return `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
}

function finDe(a: Actividad): number {
  return (aMinutos(a.inicio) ?? 0) + a.duracionMin;
}

// ===================== VALIDACION =====================

function validarActividad(a: Actividad, dia: number): Problema[] {
  const problemas: Problema[] = [];
  const inicio: number | null = aMinutos(a.inicio);
  const abre: number | null = aMinutos(a.lugar.abre);
  const cierra: number | null = aMinutos(a.lugar.cierra);
  if (inicio === null || abre === null || cierra === null) {
    return [{ dia, severidad: "error", mensaje: `${a.nombre}: hora con formato invalido` }];
  }
  if (a.duracionMin <= 0) problemas.push({ dia, severidad: "error", mensaje: `${a.nombre}: duracion invalida` });
  if (a.costoUsd < 0) problemas.push({ dia, severidad: "error", mensaje: `${a.nombre}: costo negativo` });
  if (inicio < abre || inicio + a.duracionMin > cierra) {
    problemas.push({
      dia,
      severidad: "error",
      mensaje: `${a.nombre} (${a.inicio}-${aHora(inicio + a.duracionMin)}) esta fuera del horario de ${a.lugar.nombre} (${a.lugar.abre}-${a.lugar.cierra})`,
    });
  }
  return problemas;
}

// Revisa cada actividad contra la siguiente (ordenadas por hora de inicio)
function validarSecuencia(actividades: readonly Actividad[], dia: number): Problema[] {
  const ordenadas: Actividad[] = [...actividades].sort((a, b): number => (aMinutos(a.inicio) ?? 0) - (aMinutos(b.inicio) ?? 0));
  return ordenadas.slice(1).flatMap((siguiente: Actividad, i: number): Problema[] => {
    const anterior: Actividad | undefined = ordenadas[i];
    if (anterior === undefined) return [];
    const hueco: number = (aMinutos(siguiente.inicio) ?? 0) - finDe(anterior);
    if (hueco < 0) {
      return [{ dia, severidad: "error", mensaje: `${anterior.nombre} y ${siguiente.nombre} se cruzan ${-hueco} min` }];
    }
    const cambiaZona: boolean = anterior.lugar.zona !== siguiente.lugar.zona;
    if (cambiaZona && hueco < TRASLADO_MIN) {
      return [{ dia, severidad: "error", mensaje: `de ${anterior.lugar.zona} a ${siguiente.lugar.zona} solo hay ${hueco} min (se necesitan ${TRASLADO_MIN})` }];
    }
    return [];
  });
}

// ===================== CALCULOS (funciones puras) =====================

function resumirDia(dia: Dia): ResumenDia {
  const gasto: number = dia.actividades.reduce((t: number, a: Actividad): number => t + a.costoUsd, 0);
  const minutos: number = dia.actividades.reduce((t: number, a: Actividad): number => t + a.duracionMin, 0);
  const problemas: Problema[] = [
    ...dia.actividades.flatMap((a: Actividad): Problema[] => validarActividad(a, dia.numero)),
    ...validarSecuencia(dia.actividades, dia.numero),
  ];
  if (gasto > dia.presupuestoUsd) {
    problemas.push({ dia: dia.numero, severidad: "error", mensaje: `gasto $${gasto} supera el presupuesto del dia ($${dia.presupuestoUsd})` });
  }
  if (minutos > MINUTOS_DIA_MAXIMO) {
    problemas.push({ dia: dia.numero, severidad: "aviso", mensaje: `${(minutos / 60).toFixed(1)} h de actividades: dia muy cargado` });
  }
  return { dia, gasto, minutosOcupados: minutos, problemas };
}

function gastoPorCategoria(dias: readonly Dia[]): [Categoria, number][] {
  const total: Record<Categoria, number> = { transporte: 0, comida: 0, cultura: 0, aventura: 0, descanso: 0 };
  dias.flatMap((d: Dia): readonly Actividad[] => d.actividades).forEach((a: Actividad): void => {
    total[a.categoria] += a.costoUsd;
  });
  const categorias: readonly Categoria[] = ["transporte", "comida", "cultura", "aventura", "descanso"];
  return categorias
    .map((c: Categoria): [Categoria, number] => [c, total[c]])
    .filter(([, v]): boolean => v > 0)
    .sort((a, b): number => b[1] - a[1]);
}

// ===================== DATOS DE PRUEBA =====================

const centroHistorico: Lugar = { nombre: "Centro Historico", zona: "Centro", abre: "06:00", cierra: "22:00" };
const museoOro: Lugar = { nombre: "Museo del Oro", zona: "Centro", abre: "09:00", cierra: "18:00" };
const cerro: Lugar = { nombre: "Cerro Monserrate", zona: "Cerros", abre: "05:30", cierra: "17:00" };
const restaurante: Lugar = { nombre: "Restaurante La Puerta", zona: "Centro", abre: "12:00", cierra: "23:00" };
const aeropuerto: Lugar = { nombre: "Aeropuerto", zona: "Aeropuerto", abre: "00:00", cierra: "23:59" };
const playa: Lugar = { nombre: "Playa Blanca", zona: "Baru", abre: "07:00", cierra: "18:00" };
const murallas: Lugar = { nombre: "Ciudad Amurallada", zona: "Centro CTG", abre: "00:00", cierra: "23:59" };
const castillo: Lugar = { nombre: "Castillo San Felipe", zona: "San Felipe", abre: "08:00", cierra: "18:00" };

const itinerario: readonly Dia[] = [
  {
    // Dia normal: todo cuadra. Limite: Museo termina 12:00 y almuerzo empieza 12:00 en la misma zona -> OK
    numero: 1,
    ciudad: { nombre: "Bogota", pais: "Colombia" },
    presupuestoUsd: 80,
    actividades: [
      { nombre: "Tour a pie", inicio: "08:00", duracionMin: 90, lugar: centroHistorico, costoUsd: 15, categoria: "cultura" },
      { nombre: "Museo del Oro", inicio: "10:00", duracionMin: 120, lugar: museoOro, costoUsd: 5, categoria: "cultura" },
      { nombre: "Almuerzo", inicio: "12:00", duracionMin: 75, lugar: restaurante, costoUsd: 25, categoria: "comida" },
      // Limite: termina 13:15, la subida empieza 13:45 en otra zona: justo los 30 min de traslado -> OK
      { nombre: "Subida al cerro", inicio: "13:45", duracionMin: 150, lugar: cerro, costoUsd: 20, categoria: "aventura" },
    ],
  },
  {
    // Dia con problemas: traslado corto, choque de horario y fuera de horario
    numero: 2,
    ciudad: { nombre: "Bogota", pais: "Colombia" },
    presupuestoUsd: 60,
    actividades: [
      { nombre: "Caminata al amanecer", inicio: "05:00", duracionMin: 120, lugar: cerro, costoUsd: 0, categoria: "aventura" },
      { nombre: "Desayuno tipico", inicio: "07:20", duracionMin: 60, lugar: centroHistorico, costoUsd: 12, categoria: "comida" },
      { nombre: "Cafe de especialidad", inicio: "08:00", duracionMin: 45, lugar: centroHistorico, costoUsd: 8, categoria: "comida" },
      { nombre: "Vuelo a Cartagena", inicio: "15:00", duracionMin: 90, lugar: aeropuerto, costoUsd: 95, categoria: "transporte" },
    ],
  },
  {
    // Dia largo y caro: supera el presupuesto y pasa de 12 h ocupadas
    numero: 3,
    ciudad: { nombre: "Cartagena", pais: "Colombia" },
    presupuestoUsd: 120,
    actividades: [
      { nombre: "Lancha a Baru", inicio: "07:00", duracionMin: 60, lugar: playa, costoUsd: 45, categoria: "transporte" },
      { nombre: "Snorkel", inicio: "08:00", duracionMin: 180, lugar: playa, costoUsd: 60, categoria: "aventura" },
      { nombre: "Descanso en la playa", inicio: "11:00", duracionMin: 300, lugar: playa, costoUsd: 10, categoria: "descanso" },
      { nombre: "Castillo San Felipe", inicio: "16:30", duracionMin: 75, lugar: castillo, costoUsd: 25, categoria: "cultura" },
      { nombre: "Cena en la muralla", inicio: "18:15", duracionMin: 120, lugar: murallas, costoUsd: 40, categoria: "comida" },
    ],
  },
];

// ===================== SALIDA POR CONSOLA =====================

function main(): void {
  const resumenes: ResumenDia[] = itinerario.map(resumirDia);

  console.log("====================== REVISION DEL ITINERARIO ======================");
  for (const r of resumenes) {
    const d: Dia = r.dia;
    const estado: string = r.problemas.some((p: Problema): boolean => p.severidad === "error") ? "CON ERRORES" : r.problemas.length > 0 ? "CON AVISOS" : "OK";
    console.log(`\nDia ${d.numero} - ${d.ciudad.nombre}, ${d.ciudad.pais} [${estado}]`);
    [...d.actividades]
      .sort((a, b): number => (aMinutos(a.inicio) ?? 0) - (aMinutos(b.inicio) ?? 0))
      .forEach((a: Actividad): void => {
        console.log(`  ${a.inicio}-${aHora(finDe(a))} ${a.nombre.padEnd(22)} ${a.lugar.zona.padEnd(11)} $${String(a.costoUsd).padStart(3)}  ${a.categoria}`);
      });
    console.log(`  Gasto $${r.gasto} de $${d.presupuestoUsd} | ${(r.minutosOcupados / 60).toFixed(1)} h ocupadas`);
    r.problemas.forEach((p: Problema): void => console.log(`  ${p.severidad === "error" ? "X" : "!"} ${p.mensaje}`));
  }

  console.log("\n====================== RESUMEN DEL VIAJE ======================");
  const total: number = resumenes.reduce((t: number, r: ResumenDia): number => t + r.gasto, 0);
  const presupuesto: number = itinerario.reduce((t: number, d: Dia): number => t + d.presupuestoUsd, 0);
  console.log(`Gasto total: $${total} de $${presupuesto} (${total <= presupuesto ? `sobran $${presupuesto - total}` : `faltan $${total - presupuesto}`})`);
  console.log("Por categoria:");
  gastoPorCategoria(itinerario).forEach(([c, v]): void => console.log(`  ${c.padEnd(11)} $${String(v).padStart(3)} (${Math.round((v / total) * 100)}%)`));

  const errores: number = resumenes.reduce((t: number, r: ResumenDia): number => t + r.problemas.filter((p) => p.severidad === "error").length, 0);
  const avisos: number = resumenes.reduce((t: number, r: ResumenDia): number => t + r.problemas.filter((p) => p.severidad === "aviso").length, 0);
  console.log(`\nPor corregir: ${errores} error(es) y ${avisos} aviso(s)`);
}

main();
