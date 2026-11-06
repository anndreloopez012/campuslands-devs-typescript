// Solución Ejercicio Intermedio 68 - Stefani Sánchez
export {};

type Repetir = "ninguno" | "uno" | "todos";

interface Cancion {
  readonly id: number;
  readonly titulo: string;
  readonly artista: string;
  readonly duracionSeg: number;
}

interface Estado {
  readonly cola: readonly Cancion[];
  readonly indice: number;
  readonly reproduciendo: boolean;
  readonly repetir: Repetir;
}

type Accion =
  | { readonly tipo: "play" }
  | { readonly tipo: "pausa" }
  | { readonly tipo: "siguiente" }
  | { readonly tipo: "anterior" }
  | { readonly tipo: "ciclar-repeticion" }
  | { readonly tipo: "quitar"; readonly id: number }
  | { readonly tipo: "terminar-cancion" };

const cola: readonly Cancion[] = [
  { id: 1, titulo: "Neon Drive", artista: "Aurora 84", duracionSeg: 214 },
  { id: 2, titulo: "Cielo Roto", artista: "Marea", duracionSeg: 187 },
  { id: 3, titulo: "Ultima Estacion", artista: "Aurora 84", duracionSeg: 242 },
];

const inicial: Estado = { cola, indice: 0, reproduciendo: false, repetir: "ninguno" };

const proximoRepetir: Record<Repetir, Repetir> = { ninguno: "todos", todos: "uno", uno: "ninguno" };

const reducer = (e: Estado, accion: Accion): Estado => {
  const ultimo = e.cola.length - 1;
  switch (accion.tipo) {
    case "play":
      return e.cola.length === 0 ? e : { ...e, reproduciendo: true };
    case "pausa":
      return { ...e, reproduciendo: false };
    case "siguiente":
      if (e.indice < ultimo) return { ...e, indice: e.indice + 1 };
      return e.repetir === "todos" ? { ...e, indice: 0 } : { ...e, reproduciendo: false };
    case "anterior":
      return { ...e, indice: Math.max(e.indice - 1, 0) };
    case "ciclar-repeticion":
      return { ...e, repetir: proximoRepetir[e.repetir] };
    case "quitar": {
      const posicion = e.cola.findIndex((c) => c.id === accion.id);
      if (posicion === -1) return e;
      const nuevaCola = e.cola.filter((c) => c.id !== accion.id);
      const indice = posicion < e.indice ? e.indice - 1 : Math.min(e.indice, Math.max(nuevaCola.length - 1, 0));
      return { ...e, cola: nuevaCola, indice, reproduciendo: nuevaCola.length > 0 && e.reproduciendo };
    }
    case "terminar-cancion":
      return e.repetir === "uno" ? e : reducer(e, { tipo: "siguiente" });
  }
};

const describir = (e: Estado): string => {
  const actual = e.cola[e.indice];
  const titulo = actual ? `${actual.titulo} - ${actual.artista}` : "(cola vacia)";
  return `${e.reproduciendo ? "PLAY " : "PAUSA"} | ${titulo} | repetir: ${e.repetir}`;
};

console.log("Ejercicio 68: Playlist interactiva");
const guion: readonly Accion[] = [
  { tipo: "play" },
  { tipo: "siguiente" },
  { tipo: "terminar-cancion" },
  { tipo: "terminar-cancion" },
  { tipo: "ciclar-repeticion" },
  { tipo: "terminar-cancion" },
  { tipo: "ciclar-repeticion" },
  { tipo: "terminar-cancion" },
  { tipo: "quitar", id: 2 },
  { tipo: "anterior" },
  { tipo: "quitar", id: 99 },
  { tipo: "quitar", id: 1 },
  { tipo: "quitar", id: 3 },
  { tipo: "play" },
];

let estado = inicial;
guion.forEach((accion) => {
  estado = reducer(estado, accion);
  console.log(`  ${accion.tipo}${accion.tipo === "quitar" ? ` #${accion.id}` : ""} -> ${describir(estado)}`);
});
const total = cola.reduce((acc, c) => acc + c.duracionSeg, 0);
console.log(`Duracion de la playlist original: ${Math.floor(total / 60)} min ${total % 60} s`);
