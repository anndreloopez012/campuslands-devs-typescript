export {};

// Intermedio 61: Simulador de aceleracion hypercar
// Tematica: autos hiperdeportivos
// Resolucion: Dulce Morales
//
// Problema: simular una prueba de aceleracion con una maquina de estados. El auto pasa por:
// detenido -> launch control armado -> acelerando -> (cambios de marcha) -> frenando -> detenido.
// Cada accion (armar launch, soltar freno, avanzar el tiempo, frenar...) entra a un reducer puro
// que devuelve el estado nuevo. Las acciones que no tienen sentido en el estado actual se rechazan.
// Se miden los tiempos de 0 a 100 y de 0 a 200 km/h.

// ===================== TIPOS =====================

interface Auto {
  readonly nombre: string;
  readonly relaciones: readonly number[]; // aceleracion maxima (km/h por segundo) en cada marcha
  readonly velocidadCambio: readonly number[]; // km/h a la que se pasa a la siguiente marcha
  readonly tiempoCambioSeg: number;
  readonly velocidadMaxima: number;
}

// Estado: union discriminada por "fase"; cada fase tiene solo los datos que tienen sentido en ella
type Estado =
  | { readonly fase: "detenido"; readonly t: number }
  | { readonly fase: "launch armado"; readonly t: number }
  | { readonly fase: "acelerando"; readonly t: number; readonly kmh: number; readonly marcha: number }
  | { readonly fase: "cambiando"; readonly t: number; readonly kmh: number; readonly marcha: number; readonly faltaSeg: number }
  | { readonly fase: "frenando"; readonly t: number; readonly kmh: number };

type Accion =
  | { readonly tipo: "ARMAR_LAUNCH" }
  | { readonly tipo: "SOLTAR_FRENO" }
  | { readonly tipo: "TICK"; readonly dt: number }
  | { readonly tipo: "FRENAR" };

interface Registro {
  readonly estado: Estado;
  readonly salida: number | null; // momento en que se solto el freno (los tiempos se miden desde ahi)
  readonly hitos: Readonly<Record<"0-100" | "0-200" | "0-300", number | null>>;
  readonly rechazos: readonly string[];
}

// ===================== REDUCER PURO =====================

const DESACELERACION_FRENADO: number = 45; // km/h por segundo

function redondear(v: number, d: number = 2): number {
  const f: number = 10 ** d;
  return Math.round(v * f) / f;
}

function reducer(auto: Auto, r: Registro, a: Accion): Registro {
  const e: Estado = r.estado;
  const rechazar = (motivo: string): Registro => ({ ...r, rechazos: [...r.rechazos, `t=${redondear(e.t, 1)}s ${a.tipo} en "${e.fase}": ${motivo}`] });

  switch (a.tipo) {
    case "ARMAR_LAUNCH":
      if (e.fase !== "detenido") return rechazar("solo se arma con el auto detenido");
      return { ...r, estado: { fase: "launch armado", t: e.t } };

    case "SOLTAR_FRENO":
      if (e.fase !== "launch armado") return rechazar("primero hay que armar el launch control");
      return { ...r, estado: { fase: "acelerando", t: e.t, kmh: 0, marcha: 1 }, salida: e.t };

    case "FRENAR":
      if (e.fase !== "acelerando" && e.fase !== "cambiando") return rechazar("el auto no esta en movimiento");
      return { ...r, estado: { fase: "frenando", t: e.t, kmh: e.kmh } };

    case "TICK": {
      const t: number = e.t + a.dt;
      switch (e.fase) {
        case "detenido":
        case "launch armado":
          return { ...r, estado: { ...e, t } };
        case "cambiando": {
          const falta: number = e.faltaSeg - a.dt;
          // Durante el cambio el auto no acelera
          return { ...r, estado: falta <= 1e-9 ? { fase: "acelerando", t, kmh: e.kmh, marcha: e.marcha + 1 } : { ...e, t, faltaSeg: falta } };
        }
        case "frenando": {
          const kmh: number = Math.max(0, e.kmh - DESACELERACION_FRENADO * a.dt);
          return { ...r, estado: kmh === 0 ? { fase: "detenido", t } : { fase: "frenando", t, kmh } };
        }
        case "acelerando": {
          const acel: number = auto.relaciones[e.marcha - 1] ?? 0;
          // La aceleracion baja a medida que se acerca a la velocidad maxima
          const kmh: number = Math.min(auto.velocidadMaxima, e.kmh + acel * (1 - e.kmh / (auto.velocidadMaxima * 1.05)) * a.dt);
          const hitos = { ...r.hitos };
          for (const [clave, objetivo] of [["0-100", 100], ["0-200", 200], ["0-300", 300]] as const) {
            if (hitos[clave] === null && kmh >= objetivo) hitos[clave] = redondear(t - (r.salida ?? 0), 1);
          }
          const limite: number | undefined = auto.velocidadCambio[e.marcha - 1];
          const cambia: boolean = limite !== undefined && kmh >= limite && e.marcha < auto.relaciones.length;
          // Con caja de cambio instantaneo (0 s) se pasa directo a la siguiente marcha
          const estado: Estado = !cambia
            ? { fase: "acelerando", t, kmh, marcha: e.marcha }
            : auto.tiempoCambioSeg === 0
              ? { fase: "acelerando", t, kmh, marcha: e.marcha + 1 }
              : { fase: "cambiando", t, kmh, marcha: e.marcha, faltaSeg: auto.tiempoCambioSeg };
          return { ...r, estado, hitos };
        }
      }
    }
  }
}

// ===================== SIMULACION =====================

function correr(auto: Auto, guion: readonly Accion[]): { final: Registro; cambios: string[] } {
  let r: Registro = { estado: { fase: "detenido", t: 0 }, salida: null, hitos: { "0-100": null, "0-200": null, "0-300": null }, rechazos: [] };
  const cambios: string[] = [];
  for (const accion of guion) {
    const antes: Estado["fase"] = r.estado.fase;
    const marchaAntes: number | null = "marcha" in r.estado ? r.estado.marcha : null;
    r = reducer(auto, r, accion);
    const marchaAhora: number | null = "marcha" in r.estado ? r.estado.marcha : null;
    if (r.estado.fase !== antes || (marchaAntes !== null && marchaAhora !== null && marchaAhora !== marchaAntes)) {
      const kmh: string = "kmh" in r.estado ? ` a ${Math.round(r.estado.kmh)} km/h` : "";
      const marcha: string = "marcha" in r.estado ? ` (marcha ${r.estado.marcha})` : "";
      cambios.push(`t=${redondear(r.estado.t, 1)}s ${antes} -> ${r.estado.fase}${kmh}${marcha}`);
    }
  }
  return { final: r, cambios };
}

function guion(segundosAcelerando: number): Accion[] {
  const dt: number = 0.1;
  const ticks = (seg: number): Accion[] => Array.from({ length: Math.round(seg / dt) }, () => ({ tipo: "TICK", dt }));
  return [
    { tipo: "SOLTAR_FRENO" }, // error: no se armo el launch
    { tipo: "ARMAR_LAUNCH" },
    ...ticks(0.5),
    { tipo: "ARMAR_LAUNCH" }, // error: ya esta armado
    { tipo: "SOLTAR_FRENO" },
    ...ticks(segundosAcelerando),
    { tipo: "FRENAR" },
    ...ticks(12),
    { tipo: "FRENAR" }, // error: ya esta detenido
  ];
}

const autos: readonly Auto[] = [
  { nombre: "Rimac Nevera", relaciones: [62, 46], velocidadCambio: [180], tiempoCambioSeg: 0, velocidadMaxima: 412 },
  { nombre: "Bugatti Chiron", relaciones: [50, 42, 34, 27, 21, 16, 12], velocidadCambio: [80, 130, 180, 230, 280, 330], tiempoCambioSeg: 0.1, velocidadMaxima: 420 },
  { nombre: "Deportivo comun", relaciones: [22, 15, 10, 7, 5, 3.5], velocidadCambio: [55, 95, 135, 170, 205], tiempoCambioSeg: 0.3, velocidadMaxima: 250 },
];

function main(): void {
  const resultados: { nombre: string; hitos: Registro["hitos"] }[] = [];
  for (const auto of autos) {
    const { final, cambios } = correr(auto, guion(15));
    console.log(`================ ${auto.nombre} ================`);
    cambios.forEach((c) => console.log(`  ${c}`));
    final.rechazos.forEach((x) => console.log(`  X ${x}`));
    const h = final.hitos;
    const tiempo = (v: number | null): string => (v === null ? "no llega en 15 s" : `${v} s`);
    console.log(`  0-100: ${tiempo(h["0-100"])} | 0-200: ${tiempo(h["0-200"])} | 0-300: ${tiempo(h["0-300"])}\n`);
    resultados.push({ nombre: auto.nombre, hitos: h });
  }

  console.log("================ COMPARATIVA 0-200 km/h ================");
  resultados
    .filter((r) => r.hitos["0-200"] !== null)
    .sort((a, b) => (a.hitos["0-200"] ?? 99) - (b.hitos["0-200"] ?? 99))
    .forEach((r, i) => console.log(`${i + 1}. ${r.nombre.padEnd(16)} ${r.hitos["0-200"]} s`));
}

main();
