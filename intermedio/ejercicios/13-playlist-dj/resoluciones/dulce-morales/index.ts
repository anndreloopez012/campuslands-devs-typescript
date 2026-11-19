export {};

// Intermedio 13: Curador de playlist
// Tematica: musica
// Resolucion: Dulce Morales
//
// Problema: armar el set de un DJ a partir de una biblioteca de canciones.
// El set debe durar cerca de un tiempo objetivo, seguir una curva de energia
// (calentamiento -> pico -> cierre) y cada transicion debe ser "mezclable":
// tonos compatibles (rueda Camelot), poco salto de BPM y sin repetir artista seguido.

// ===================== MODELO (objetos anidados) =====================

type Letra = "A" | "B"; // A = tono menor, B = tono mayor
type Fase = "calentamiento" | "pico" | "cierre";

interface Tono {
  readonly numero: number; // 1 a 12 en la rueda Camelot
  readonly letra: Letra;
}

interface Cancion {
  readonly id: string;
  readonly titulo: string;
  readonly artista: { readonly nombre: string; readonly pais: string };
  readonly bpm: number;
  readonly tono: Tono;
  readonly energia: number; // 1 a 10
  readonly duracionSeg: number;
}

interface Transicion {
  readonly desde: Cancion;
  readonly hacia: Cancion;
  readonly saltoBpm: number;
  readonly tipoTono: string;
}

interface SetDj {
  readonly canciones: readonly Cancion[];
  readonly transiciones: readonly Transicion[];
  readonly duracionSeg: number;
  readonly motivoFin: string;
}

// ===================== REGLAS =====================

const MAX_SALTO_BPM: number = 6;
const ENERGIA_OBJETIVO: Readonly<Record<Fase, number>> = { calentamiento: 5, pico: 9, cierre: 6 };

// ===================== VALIDACION =====================

function validarCancion(c: Cancion): string[] {
  const errores: string[] = [];
  if (!Number.isInteger(c.tono.numero) || c.tono.numero < 1 || c.tono.numero > 12) errores.push(`tono ${c.tono.numero}${c.tono.letra} no existe en la rueda Camelot`);
  if (c.bpm < 60 || c.bpm > 200) errores.push(`BPM ${c.bpm} fuera de rango (60-200)`);
  if (!Number.isInteger(c.energia) || c.energia < 1 || c.energia > 10) errores.push(`energia ${c.energia} fuera de 1-10`);
  if (c.duracionSeg <= 0) errores.push("duracion invalida");
  return errores;
}

// ===================== CALCULOS (funciones puras) =====================

// En la rueda Camelot, despues del 12 viene el 1
function vecinosEnRueda(a: number, b: number): boolean {
  const diferencia: number = Math.abs(a - b);
  return diferencia === 1 || diferencia === 11;
}

// Devuelve el tipo de mezcla armonica o null si los tonos chocan
function compatibilidadTono(a: Tono, b: Tono): string | null {
  if (a.numero === b.numero && a.letra === b.letra) return "mismo tono";
  if (a.numero === b.numero) return "relativo mayor/menor";
  if (a.letra === b.letra && vecinosEnRueda(a.numero, b.numero)) return "tono vecino";
  return null;
}

function motivoIncompatible(actual: Cancion, candidata: Cancion): string | null {
  if (compatibilidadTono(actual.tono, candidata.tono) === null) return "tono incompatible";
  if (Math.abs(actual.bpm - candidata.bpm) > MAX_SALTO_BPM) return `salto de ${Math.abs(actual.bpm - candidata.bpm)} BPM`;
  if (actual.artista.nombre === candidata.artista.nombre) return "mismo artista seguido";
  return null;
}

function faseSegunAvance(avance: number): Fase {
  if (avance < 0.3) return "calentamiento";
  if (avance < 0.8) return "pico";
  return "cierre";
}

// Menor puntaje = mejor candidata: cerca de la energia buscada y con poco salto de BPM
function puntaje(actual: Cancion, candidata: Cancion, fase: Fase): number {
  return Math.abs(candidata.energia - ENERGIA_OBJETIVO[fase]) + Math.abs(candidata.bpm - actual.bpm) / 10;
}

function armarSet(biblioteca: readonly Cancion[], duracionObjetivoSeg: number): SetDj {
  // Empieza con la cancion mas tranquila (menor energia, luego menor BPM)
  const inicio: Cancion | undefined = [...biblioteca].sort((a, b): number => a.energia - b.energia || a.bpm - b.bpm)[0];
  if (inicio === undefined) return { canciones: [], transiciones: [], duracionSeg: 0, motivoFin: "biblioteca vacia" };

  const canciones: Cancion[] = [inicio];
  const transiciones: Transicion[] = [];
  let duracion: number = inicio.duracionSeg;
  let motivoFin: string = "se alcanzo la duracion objetivo";

  while (duracion < duracionObjetivoSeg) {
    const actual: Cancion = canciones[canciones.length - 1] ?? inicio;
    const fase: Fase = faseSegunAvance(duracion / duracionObjetivoSeg);
    const siguiente: Cancion | undefined = biblioteca
      .filter((c: Cancion): boolean => !canciones.includes(c) && motivoIncompatible(actual, c) === null)
      .sort((a: Cancion, b: Cancion): number => puntaje(actual, a, fase) - puntaje(actual, b, fase) || a.id.localeCompare(b.id))[0];

    if (siguiente === undefined) {
      motivoFin = `no hay canciones compatibles despues de "${actual.titulo}"`;
      break;
    }
    transiciones.push({
      desde: actual,
      hacia: siguiente,
      saltoBpm: siguiente.bpm - actual.bpm,
      tipoTono: compatibilidadTono(actual.tono, siguiente.tono) ?? "",
    });
    canciones.push(siguiente);
    duracion += siguiente.duracionSeg;
  }
  return { canciones, transiciones, duracionSeg: duracion, motivoFin };
}

// ===================== DATOS DE PRUEBA =====================

function cancion(id: string, titulo: string, artista: string, pais: string, bpm: number, tono: string, energia: number, duracion: string): Cancion {
  const numero: number = Number.parseInt(tono, 10);
  const letra: Letra = tono.endsWith("A") ? "A" : "B";
  const [min, seg] = duracion.split(":").map(Number);
  return { id, titulo, artista: { nombre: artista, pais }, bpm, tono: { numero, letra }, energia, duracionSeg: (min ?? 0) * 60 + (seg ?? 0) };
}

const biblioteca: readonly Cancion[] = [
  cancion("T01", "Amanecer Digital", "Luna Verde", "MX", 120, "8A", 4, "5:10"),
  cancion("T02", "Corriente Alterna", "Kael", "CO", 122, "8A", 5, "5:40"),
  cancion("T03", "Ritmo Solar", "Nova Beats", "AR", 124, "9A", 6, "6:05"),
  cancion("T04", "Pulso Urbano", "Luna Verde", "MX", 126, "9A", 7, "5:30"),
  cancion("T05", "Electricidad", "Dex Rivera", "CL", 128, "10A", 9, "6:20"),
  cancion("T06", "Tormenta de Neon", "Kael", "CO", 128, "10B", 10, "5:55"),
  cancion("T07", "Gravedad Cero", "Nova Beats", "AR", 127, "10A", 8, "6:00"),
  cancion("T08", "Ultimo Tren", "Mia Sol", "PE", 124, "11A", 6, "5:45"),
  cancion("T09", "Luces Bajas", "Dex Rivera", "CL", 122, "11A", 5, "6:30"),
  // Nunca entra: tono que choca con todo lo demas y BPM muy alto
  cancion("T10", "Hardstyle Fuera de Lugar", "Bass Brothers", "US", 150, "3B", 10, "4:00"),
  // Invalidas
  cancion("T11", "Tono Inventado", "Error", "--", 125, "14A", 7, "5:00"),
  cancion("T12", "Energia Rota", "Error", "--", 125, "9A", 15, "5:00"),
];

// ===================== SALIDA POR CONSOLA =====================

function mmss(segundos: number): string {
  return `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, "0")}`;
}

function etiquetaTono(t: Tono): string {
  return `${t.numero}${t.letra}`;
}

function imprimirSet(titulo: string, set: SetDj, objetivoSeg: number, validas: readonly Cancion[]): void {
  console.log(`\n================ ${titulo} (objetivo ${mmss(objetivoSeg)}) ================`);
  let acumulado: number = 0;
  set.canciones.forEach((c: Cancion, i: number): void => {
    const fase: Fase = faseSegunAvance(acumulado / objetivoSeg);
    console.log(
      `${String(i + 1).padStart(2)}. [${mmss(acumulado).padStart(5)}] ${c.titulo.padEnd(18)} ${c.artista.nombre.padEnd(11)} ${c.bpm} BPM ${etiquetaTono(c.tono).padEnd(3)} energia ${String(c.energia).padStart(2)} (${fase})`,
    );
    acumulado += c.duracionSeg;
  });

  console.log("Transiciones:");
  set.transiciones.forEach((t: Transicion): void => {
    const salto: string = t.saltoBpm >= 0 ? `+${t.saltoBpm}` : String(t.saltoBpm);
    console.log(`  ${etiquetaTono(t.desde.tono).padStart(3)} -> ${etiquetaTono(t.hacia.tono).padEnd(3)}  ${t.tipoTono.padEnd(21)} ${salto.padStart(3)} BPM`);
  });

  const curva: string = set.canciones.map((c: Cancion): number => c.energia).join(" > ");
  console.log(`Curva de energia: ${curva}`);
  console.log(`Duracion total: ${mmss(set.duracionSeg)} | ${set.motivoFin}`);

  const fuera: Cancion[] = validas.filter((c: Cancion): boolean => !set.canciones.includes(c));
  if (fuera.length > 0) console.log(`No entraron: ${fuera.map((c: Cancion): string => c.titulo).join(", ")}`);
}

function main(): void {
  const validas: Cancion[] = biblioteca.filter((c: Cancion): boolean => validarCancion(c).length === 0);
  const invalidas: Cancion[] = biblioteca.filter((c: Cancion): boolean => validarCancion(c).length > 0);

  console.log("================ BIBLIOTECA ================");
  console.log(`Canciones validas: ${validas.length} | invalidas: ${invalidas.length}`);
  invalidas.forEach((c: Cancion): void => console.log(`  X ${c.titulo}: ${validarCancion(c).join(", ")}`));

  // Caso normal: set de 40 minutos
  imprimirSet("SET PRINCIPAL", armarSet(validas, 40 * 60), 40 * 60, validas);

  // Caso limite: se pide mas tiempo del que se puede mezclar
  imprimirSet("SET LARGO", armarSet(validas, 90 * 60), 90 * 60, validas);
}

main();
