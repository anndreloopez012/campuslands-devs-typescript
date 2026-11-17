export {};

// Intermedio 11: Simulador de carrera por vueltas
// Tematica: carreras
// Resolucion: Dulce Morales
//
// Problema: con los tiempos de cada vuelta de cada piloto, reconstruir la carrera:
// posiciones vuelta a vuelta, tiempo total con penalizaciones, diferencia con el lider,
// vuelta rapida y clasificacion final (los que abandonan van al final, ordenados
// por cuantas vueltas completaron).

// ===================== MODELO (objetos anidados) =====================

type Compuesto = "blando" | "medio" | "duro";

interface Equipo {
  readonly nombre: string;
  readonly motor: string;
}

interface Vuelta {
  readonly numero: number;
  readonly tiempoSeg: number;
  readonly entroAPits: boolean;
  readonly compuesto: Compuesto;
}

interface Piloto {
  readonly dorsal: number;
  readonly nombre: string;
  readonly equipo: Equipo;
  readonly vueltas: readonly Vuelta[];
  readonly penalizacionSeg: number;
}

interface Carrera {
  readonly circuito: string;
  readonly vueltasTotales: number;
  readonly pilotos: readonly Piloto[];
}

type Estado = "termino" | "abandono";

interface Clasificado {
  readonly piloto: Piloto;
  readonly estado: Estado;
  readonly vueltasCompletadas: number;
  readonly tiempoTotal: number; // incluye penalizacion
  readonly mejorVuelta: number;
  readonly paradas: number;
  readonly estrategia: string; // compuestos usados en orden, ej. "medio > duro"
}

interface FilaFinal {
  readonly posicion: number;
  readonly clasificado: Clasificado;
  readonly diferencia: string;
  readonly puntos: number;
}

// ===================== REGLAS =====================

const PUNTOS_POR_POSICION: readonly number[] = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const PUNTO_VUELTA_RAPIDA: number = 1; // solo si termina dentro de los 10 primeros
const TIEMPO_MINIMO_VUELTA: number = 60; // menos de esto es un error de cronometraje
const TIEMPO_MAXIMO_VUELTA: number = 300;

// ===================== VALIDACION =====================

function validarPiloto(piloto: Piloto, vueltasTotales: number): string[] {
  const errores: string[] = [];
  if (piloto.vueltas.length > vueltasTotales) {
    errores.push(`tiene ${piloto.vueltas.length} vueltas registradas y la carrera es de ${vueltasTotales}`);
  }
  piloto.vueltas.forEach((v: Vuelta, i: number): void => {
    if (v.numero !== i + 1) errores.push(`vuelta en la posicion ${i + 1} dice ser la ${v.numero}`);
    if (v.tiempoSeg < TIEMPO_MINIMO_VUELTA || v.tiempoSeg > TIEMPO_MAXIMO_VUELTA) {
      errores.push(`vuelta ${v.numero}: tiempo ${v.tiempoSeg}s fuera de rango`);
    }
  });
  if (piloto.penalizacionSeg < 0) errores.push("penalizacion negativa");
  return errores;
}

// ===================== CALCULOS (map / filter / reduce / sort) =====================

function sumarTiempos(vueltas: readonly Vuelta[]): number {
  return vueltas.reduce((total: number, v: Vuelta): number => total + v.tiempoSeg, 0);
}

function resumirPiloto(piloto: Piloto, vueltasTotales: number): Clasificado {
  const tiempos: number[] = piloto.vueltas.map((v: Vuelta): number => v.tiempoSeg);
  return {
    piloto,
    estado: piloto.vueltas.length === vueltasTotales ? "termino" : "abandono",
    vueltasCompletadas: piloto.vueltas.length,
    tiempoTotal: sumarTiempos(piloto.vueltas) + piloto.penalizacionSeg,
    mejorVuelta: tiempos.length > 0 ? Math.min(...tiempos) : Infinity,
    paradas: piloto.vueltas.filter((v: Vuelta): boolean => v.entroAPits).length,
    estrategia: calcularEstrategia(piloto.vueltas),
  };
}

// Lista de compuestos sin repetir los consecutivos: [medio, medio, duro] -> "medio > duro"
function calcularEstrategia(vueltas: readonly Vuelta[]): string {
  return vueltas
    .map((v: Vuelta): Compuesto => v.compuesto)
    .filter((c: Compuesto, i: number, lista: Compuesto[]): boolean => i === 0 || lista[i - 1] !== c)
    .join(" > ");
}

// Mas vueltas primero; con las mismas vueltas, menos tiempo primero; luego dorsal
function compararClasificados(a: Clasificado, b: Clasificado): number {
  return b.vueltasCompletadas - a.vueltasCompletadas || a.tiempoTotal - b.tiempoTotal || a.piloto.dorsal - b.piloto.dorsal;
}

// Posiciones despues de una vuelta concreta (solo los que la completaron)
function posicionesEnVuelta(pilotos: readonly Piloto[], vuelta: number): Piloto[] {
  return pilotos
    .filter((p: Piloto): boolean => p.vueltas.length >= vuelta)
    .map((p: Piloto): { piloto: Piloto; acumulado: number } => ({ piloto: p, acumulado: sumarTiempos(p.vueltas.slice(0, vuelta)) }))
    .sort((a, b): number => a.acumulado - b.acumulado || a.piloto.dorsal - b.piloto.dorsal)
    .map((x): Piloto => x.piloto);
}

function formatearTiempo(segundos: number): string {
  const min: number = Math.floor(segundos / 60);
  const seg: string = (segundos - min * 60).toFixed(3).padStart(6, "0");
  return `${min}:${seg}`;
}

function calcularDiferencia(c: Clasificado, lider: Clasificado): string {
  if (c === lider) return "Lider";
  if (c.estado === "abandono") return `Abandono (vuelta ${c.vueltasCompletadas + 1})`;
  if (c.vueltasCompletadas < lider.vueltasCompletadas) return `+${lider.vueltasCompletadas - c.vueltasCompletadas} vuelta(s)`;
  return `+${(c.tiempoTotal - lider.tiempoTotal).toFixed(3)}s`;
}

function clasificacionFinal(carrera: Carrera, validos: readonly Piloto[]): FilaFinal[] {
  const ordenados: Clasificado[] = validos.map((p: Piloto): Clasificado => resumirPiloto(p, carrera.vueltasTotales)).sort(compararClasificados);
  const lider: Clasificado | undefined = ordenados[0];
  if (lider === undefined) return [];

  // Vuelta rapida: la mejor de todos los que tienen vueltas
  const rapida: Clasificado | undefined = [...ordenados].sort((a, b): number => a.mejorVuelta - b.mejorVuelta)[0];

  return ordenados.map((c: Clasificado, i: number): FilaFinal => {
    const puntosBase: number = c.estado === "termino" ? (PUNTOS_POR_POSICION[i] ?? 0) : 0;
    const bonus: number = c === rapida && puntosBase > 0 ? PUNTO_VUELTA_RAPIDA : 0;
    return { posicion: i + 1, clasificado: c, diferencia: calcularDiferencia(c, lider), puntos: puntosBase + bonus };
  });
}

function puntosPorEquipo(filas: readonly FilaFinal[]): [string, number][] {
  const total: Record<string, number> = filas.reduce(
    (acc: Record<string, number>, f: FilaFinal): Record<string, number> => {
      const equipo: string = f.clasificado.piloto.equipo.nombre;
      return { ...acc, [equipo]: (acc[equipo] ?? 0) + f.puntos };
    },
    {},
  );
  return Object.entries(total).sort((a, b): number => b[1] - a[1]);
}

// ===================== DATOS DE PRUEBA =====================

const solaris: Equipo = { nombre: "Solaris Racing", motor: "V6 Hibrido" };
const nordic: Equipo = { nombre: "Nordic Speed", motor: "V6 Hibrido" };
const andes: Equipo = { nombre: "Andes Motorsport", motor: "V8" };

// Arma vueltas a partir de una lista de tiempos; marca pits en las vueltas indicadas
function vueltas(tiempos: readonly number[], pits: readonly number[] = [], compuestoInicial: Compuesto = "medio"): Vuelta[] {
  let compuesto: Compuesto = compuestoInicial;
  return tiempos.map((t: number, i: number): Vuelta => {
    const numero: number = i + 1;
    const entroAPits: boolean = pits.includes(numero);
    if (entroAPits) compuesto = compuesto === "duro" ? "medio" : "duro";
    return { numero, tiempoSeg: t, entroAPits, compuesto };
  });
}

const carrera: Carrera = {
  circuito: "Autodromo del Valle",
  vueltasTotales: 6,
  pilotos: [
    { dorsal: 7, nombre: "Lena Vogel", equipo: solaris, penalizacionSeg: 0, vueltas: vueltas([92.4, 91.8, 91.5, 112.9, 91.0, 90.6], [4]) },
    { dorsal: 16, nombre: "Mateo Rossi", equipo: nordic, penalizacionSeg: 0, vueltas: vueltas([91.9, 91.6, 113.4, 91.2, 91.1, 90.9], [3]) },
    // Gana en pista pero recibe 5 s de penalizacion: baja de posicion
    { dorsal: 44, nombre: "Ines Duarte", equipo: solaris, penalizacionSeg: 5, vueltas: vueltas([91.7, 91.4, 91.3, 91.6, 113.0, 90.4], [5], "blando") },
    { dorsal: 21, nombre: "Kai Nakamura", equipo: andes, penalizacionSeg: 0, vueltas: vueltas([93.0, 92.6, 92.4, 114.0, 92.1, 92.0], [4]) },
    // Caso limite: abandona en la vuelta 4 (completo 3)
    { dorsal: 3, nombre: "Pablo Arce", equipo: nordic, penalizacionSeg: 0, vueltas: vueltas([92.1, 91.9, 92.0]) },
    // Caso limite: abandona en la vuelta 2 (completo 1)
    { dorsal: 11, nombre: "Sara Lind", equipo: andes, penalizacionSeg: 0, vueltas: vueltas([94.2]) },
    // Invalido: una vuelta de 12 s (error de cronometraje)
    { dorsal: 99, nombre: "Error Crono", equipo: andes, penalizacionSeg: 0, vueltas: vueltas([92.0, 12.0, 92.0, 92.0, 92.0, 92.0]) },
  ],
};

// ===================== SALIDA POR CONSOLA =====================

function main(): void {
  const rechazados: { piloto: Piloto; errores: string[] }[] = carrera.pilotos
    .map((p: Piloto) => ({ piloto: p, errores: validarPiloto(p, carrera.vueltasTotales) }))
    .filter((x): boolean => x.errores.length > 0);
  const validos: Piloto[] = carrera.pilotos.filter(
    (p: Piloto): boolean => !rechazados.some((r): boolean => r.piloto === p),
  );

  console.log(`=========== GRAN PREMIO - ${carrera.circuito} (${carrera.vueltasTotales} vueltas) ===========`);
  rechazados.forEach((r): void => console.log(`X Excluido #${r.piloto.dorsal} ${r.piloto.nombre}: ${r.errores.join(", ")}`));

  console.log("\n--- Posiciones vuelta a vuelta (dorsales) ---");
  for (let v = 1; v <= carrera.vueltasTotales; v++) {
    const orden: string = posicionesEnVuelta(validos, v)
      .map((p: Piloto): string => `#${p.dorsal}`)
      .join(" ");
    console.log(`V${v}: ${orden}`);
  }

  const filas: FilaFinal[] = clasificacionFinal(carrera, validos);
  console.log("\n--- Clasificacion final ---");
  filas.forEach((f: FilaFinal): void => {
    const c: Clasificado = f.clasificado;
    const penal: string = c.piloto.penalizacionSeg > 0 ? ` (+${c.piloto.penalizacionSeg}s pen.)` : "";
    console.log(
      `${String(f.posicion).padStart(2)}. #${String(c.piloto.dorsal).padEnd(3)}${c.piloto.nombre.padEnd(13)} ${c.piloto.equipo.nombre.padEnd(17)} ${formatearTiempo(c.tiempoTotal)}${penal.padEnd(14)} ${f.diferencia.padEnd(21)} ${c.estrategia.padEnd(15)} ${String(f.puntos).padStart(2)} pts`,
    );
  });

  const rapida: FilaFinal | undefined = [...filas].sort((a, b): number => a.clasificado.mejorVuelta - b.clasificado.mejorVuelta)[0];
  if (rapida !== undefined) {
    console.log(`\nVuelta rapida: ${rapida.clasificado.piloto.nombre} con ${formatearTiempo(rapida.clasificado.mejorVuelta)}`);
  }

  console.log("\n--- Puntos por equipo ---");
  puntosPorEquipo(filas).forEach(([equipo, puntos]): void => console.log(`${equipo.padEnd(17)} ${puntos} pts`));
}

main();
