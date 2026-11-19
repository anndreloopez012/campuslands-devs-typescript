export {};

// Intermedio 68: Playlist interactiva
// Tematica: musica
// Resolucion: Dulce Morales
//
// Problema: un reproductor de musica con su cola de canciones. El estado del reproductor es una
// maquina de estados (detenido, reproduciendo, pausado) y cada boton es un evento que entra a un
// reducer puro: play, pausa, siguiente, anterior, adelantar, modo repetir (no / todo / una),
// aleatorio, agregar y quitar canciones. El paso del tiempo (TICK) hace avanzar la cancion y,
// al terminar, pasa a la siguiente segun el modo de repeticion.

// ===================== TIPOS =====================

interface Cancion {
  readonly id: string;
  readonly titulo: string;
  readonly artista: string;
  readonly duracion: number; // segundos
}

type Repetir = "no" | "todo" | "una";

type Reproduccion =
  | { readonly fase: "detenido" }
  | { readonly fase: "reproduciendo"; readonly indice: number; readonly segundo: number }
  | { readonly fase: "pausado"; readonly indice: number; readonly segundo: number };

interface Estado {
  readonly cola: readonly Cancion[];
  readonly orden: readonly number[]; // orden de reproduccion (indices de la cola); cambia con aleatorio
  readonly repro: Reproduccion;
  readonly repetir: Repetir;
  readonly aleatorio: boolean;
  readonly aviso: string | null;
}

type Evento =
  | { readonly tipo: "PLAY" }
  | { readonly tipo: "PAUSA" }
  | { readonly tipo: "SIGUIENTE" }
  | { readonly tipo: "ANTERIOR" }
  | { readonly tipo: "ADELANTAR"; readonly segundo: number }
  | { readonly tipo: "TICK"; readonly segundos: number }
  | { readonly tipo: "CAMBIAR_REPETIR" }
  | { readonly tipo: "ALEATORIO" }
  | { readonly tipo: "AGREGAR"; readonly cancion: Cancion }
  | { readonly tipo: "QUITAR"; readonly id: string };

// ===================== AYUDAS PURAS =====================

const SIGUIENTE_MODO: Readonly<Record<Repetir, Repetir>> = { no: "todo", todo: "una", una: "no" };
const REINICIA_DESDE_SEG: number = 3; // "anterior" despues de 3 s reinicia la cancion actual

// Mezcla fija (con semilla) para que el resultado sea repetible
function mezclar(n: number, semilla: number): number[] {
  const orden: number[] = Array.from({ length: n }, (_, i) => i);
  let s: number = semilla;
  for (let i = n - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const j: number = s % (i + 1);
    [orden[i], orden[j]] = [orden[j] ?? 0, orden[i] ?? 0];
  }
  return orden;
}

function posicionEnOrden(s: Estado, indice: number): number {
  return s.orden.indexOf(indice);
}

// Siguiente indice segun el orden; null si se acabo la lista (y no se repite)
function siguienteIndice(s: Estado, indice: number, porFinDeCancion: boolean): number | null {
  if (porFinDeCancion && s.repetir === "una") return indice;
  const pos: number = posicionEnOrden(s, indice);
  const sig: number | undefined = s.orden[pos + 1];
  if (sig !== undefined) return sig;
  return s.repetir === "todo" ? (s.orden[0] ?? null) : null;
}

// ===================== REDUCER PURO =====================

function reducer(s: Estado, e: Evento): Estado {
  const r: Reproduccion = s.repro;
  const conAviso = (aviso: string): Estado => ({ ...s, aviso });
  const limpio: Estado = { ...s, aviso: null };

  switch (e.tipo) {
    case "PLAY":
      if (s.cola.length === 0) return conAviso("la cola esta vacia");
      if (r.fase === "reproduciendo") return conAviso("ya esta sonando");
      if (r.fase === "pausado") return { ...limpio, repro: { ...r, fase: "reproduciendo" } };
      return { ...limpio, repro: { fase: "reproduciendo", indice: s.orden[0] ?? 0, segundo: 0 } };

    case "PAUSA":
      if (r.fase !== "reproduciendo") return conAviso("no hay nada sonando");
      return { ...limpio, repro: { ...r, fase: "pausado" } };

    case "SIGUIENTE": {
      if (r.fase === "detenido") return conAviso("el reproductor esta detenido");
      const sig: number | null = siguienteIndice(s, r.indice, false);
      if (sig === null) return { ...limpio, repro: { fase: "detenido" }, aviso: "fin de la lista" };
      return { ...limpio, repro: { ...r, indice: sig, segundo: 0 } };
    }

    case "ANTERIOR": {
      if (r.fase === "detenido") return conAviso("el reproductor esta detenido");
      if (r.segundo > REINICIA_DESDE_SEG) return { ...limpio, repro: { ...r, segundo: 0 }, aviso: "reinicia la cancion actual" };
      const pos: number = posicionEnOrden(s, r.indice);
      const ant: number | undefined = s.orden[pos - 1];
      return { ...limpio, repro: { ...r, indice: ant ?? r.indice, segundo: 0 }, aviso: ant === undefined ? "ya es la primera" : null };
    }

    case "ADELANTAR": {
      if (r.fase === "detenido") return conAviso("el reproductor esta detenido");
      const dur: number = s.cola[r.indice]?.duracion ?? 0;
      if (e.segundo < 0 || e.segundo >= dur) return conAviso(`posicion ${e.segundo}s fuera de la cancion (dura ${dur}s)`);
      return { ...limpio, repro: { ...r, segundo: e.segundo } };
    }

    case "TICK": {
      if (r.fase !== "reproduciendo") return s; // pausado o detenido: el tiempo no corre
      let indice: number = r.indice;
      let segundo: number = r.segundo + e.segundos;
      // Puede terminar mas de una cancion en el mismo tick
      while (segundo >= (s.cola[indice]?.duracion ?? Infinity)) {
        segundo -= s.cola[indice]?.duracion ?? 0;
        const sig: number | null = siguienteIndice(s, indice, true);
        if (sig === null) return { ...limpio, repro: { fase: "detenido" }, aviso: "fin de la lista" };
        indice = sig;
      }
      return { ...limpio, repro: { fase: "reproduciendo", indice, segundo } };
    }

    case "CAMBIAR_REPETIR":
      return { ...limpio, repetir: SIGUIENTE_MODO[s.repetir] };

    case "ALEATORIO": {
      const aleatorio: boolean = !s.aleatorio;
      const base: number[] = aleatorio ? mezclar(s.cola.length, 68) : s.cola.map((_, i) => i);
      // La cancion que suena se mueve al principio para no cortar la musica
      const actual: number | null = r.fase === "detenido" ? null : r.indice;
      const orden: number[] = actual === null ? base : [actual, ...base.filter((i) => i !== actual)];
      return { ...limpio, aleatorio, orden };
    }

    case "AGREGAR": {
      if (s.cola.some((c) => c.id === e.cancion.id)) return conAviso(`"${e.cancion.titulo}" ya esta en la cola`);
      return { ...limpio, cola: [...s.cola, e.cancion], orden: [...s.orden, s.cola.length] };
    }

    case "QUITAR": {
      const i: number = s.cola.findIndex((c) => c.id === e.id);
      if (i === -1) return conAviso(`no existe la cancion ${e.id}`);
      if (r.fase !== "detenido" && r.indice === i) return conAviso("no se puede quitar la cancion que esta sonando");
      const cola: Cancion[] = s.cola.filter((_, k) => k !== i);
      // Reajusta los indices que estaban despues de la quitada
      const ajustar = (k: number): number => (k > i ? k - 1 : k);
      const orden: number[] = s.orden.filter((k) => k !== i).map(ajustar);
      const repro: Reproduccion = r.fase === "detenido" ? r : { ...r, indice: ajustar(r.indice) };
      return { ...limpio, cola, orden, repro };
    }
  }
}

// ===================== PANTALLA =====================

function mmss(seg: number): string {
  return `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, "0")}`;
}

function pantalla(s: Estado): string {
  const r: Reproduccion = s.repro;
  const modo: string = `[repetir: ${s.repetir}${s.aleatorio ? ", aleatorio" : ""}]`;
  if (r.fase === "detenido") return `[] detenido ${modo}`;
  const c: Cancion | undefined = s.cola[r.indice];
  const icono: string = r.fase === "reproduciendo" ? ">" : "||";
  return `${icono} ${c?.titulo ?? "?"} - ${c?.artista ?? "?"} ${mmss(r.segundo)}/${mmss(c?.duracion ?? 0)} ${modo}`;
}

// ===================== SESION =====================

const cola: readonly Cancion[] = [
  { id: "c1", titulo: "Luz de Neon", artista: "Kroma", duracion: 200 },
  { id: "c2", titulo: "Marea Alta", artista: "Sol Lund", duracion: 185 },
  { id: "c3", titulo: "Ruta 66", artista: "Los Faros", duracion: 240 },
  { id: "c4", titulo: "Eco", artista: "Nadia", duracion: 150 },
];

function main(): void {
  let s: Estado = { cola, orden: cola.map((_, i) => i), repro: { fase: "detenido" }, repetir: "no", aleatorio: false, aviso: null };
  const pasos: readonly [string, Evento][] = [
    ["PAUSA", { tipo: "PAUSA" }],
    ["PLAY", { tipo: "PLAY" }],
    ["TICK 60s", { tipo: "TICK", segundos: 60 }],
    ["PAUSA", { tipo: "PAUSA" }],
    ["TICK 30s (pausado)", { tipo: "TICK", segundos: 30 }],
    ["PLAY (reanuda)", { tipo: "PLAY" }],
    ["ANTERIOR (a los 60s)", { tipo: "ANTERIOR" }],
    ["ANTERIOR (a los 0s)", { tipo: "ANTERIOR" }],
    ["TICK 200s (limite: termina justo)", { tipo: "TICK", segundos: 200 }],
    ["ADELANTAR a 999s", { tipo: "ADELANTAR", segundo: 999 }],
    ["ADELANTAR a 180s", { tipo: "ADELANTAR", segundo: 180 }],
    ["TICK 10s (pasa a la 3)", { tipo: "TICK", segundos: 10 }],
    ["QUITAR c3 (suena)", { tipo: "QUITAR", id: "c3" }],
    ["QUITAR c2", { tipo: "QUITAR", id: "c2" }],
    ["AGREGAR Eco (repetida)", { tipo: "AGREGAR", cancion: { id: "c4", titulo: "Eco", artista: "Nadia", duracion: 150 } }],
    ["AGREGAR Orbita", { tipo: "AGREGAR", cancion: { id: "c5", titulo: "Orbita", artista: "Vela", duracion: 210 } }],
    ["REPETIR -> todo", { tipo: "CAMBIAR_REPETIR" }],
    ["ALEATORIO", { tipo: "ALEATORIO" }],
    ["TICK 1000s (varias canciones)", { tipo: "TICK", segundos: 1000 }],
    ["REPETIR -> una", { tipo: "CAMBIAR_REPETIR" }],
    ["TICK 500s (se repite la misma)", { tipo: "TICK", segundos: 500 }],
    ["REPETIR -> no", { tipo: "CAMBIAR_REPETIR" }],
    ["SIGUIENTE x4", { tipo: "SIGUIENTE" }],
  ];

  for (const [nombre, ev] of pasos) {
    const veces: number = nombre.endsWith("x4") ? 4 : 1;
    for (let i = 0; i < veces; i++) s = reducer(s, ev);
    const orden: string = ev.tipo === "ALEATORIO" ? ` orden: ${s.orden.map((i) => s.cola[i]?.titulo).join(", ")}` : "";
    console.log(`${nombre.padEnd(34)} ${pantalla(s)}${s.aviso ? `  (${s.aviso})` : ""}${orden}`);
  }
  console.log(`\nCola final: ${s.cola.map((c) => c.titulo).join(", ")}`);
}

main();
