// Solución Ejercicio Intermedio 75 - Stefani Sánchez
export {};

interface Almacen {
  getItem(clave: string): string | null;
  setItem(clave: string, valor: string): void;
}

class AlmacenMemoria implements Almacen {
  private readonly datos = new Map<string, string>();
  getItem(clave: string): string | null {
    return this.datos.get(clave) ?? null;
  }
  setItem(clave: string, valor: string): void {
    this.datos.set(clave, valor);
  }
}

type TipoLugar = "naturaleza" | "historia" | "gastronomia" | "aventura";
type Orden = "calificacion" | "precio" | "nombre";

interface Lugar {
  readonly id: number;
  readonly nombre: string;
  readonly tipo: TipoLugar;
  readonly entrada: number;
  readonly calificacion: number;
}

interface Preferencias {
  readonly favoritos: readonly number[];
  readonly orden: Orden;
  readonly tipo: TipoLugar | null;
}

type Accion =
  | { readonly tipo: "favorito"; readonly id: number }
  | { readonly tipo: "orden"; readonly valor: Orden }
  | { readonly tipo: "filtrar"; readonly valor: TipoLugar | null };

const lugares: readonly Lugar[] = [
  { id: 1, nombre: "Volcan Pacaya", tipo: "aventura", entrada: 8, calificacion: 4.6 },
  { id: 2, nombre: "Tikal", tipo: "historia", entrada: 20, calificacion: 4.9 },
  { id: 3, nombre: "Lago Atitlan", tipo: "naturaleza", entrada: 0, calificacion: 4.8 },
  { id: 4, nombre: "Mercado Chichi", tipo: "gastronomia", entrada: 0, calificacion: 4.2 },
  { id: 5, nombre: "Semuc Champey", tipo: "naturaleza", entrada: 12, calificacion: 4.7 },
  { id: 6, nombre: "Antigua", tipo: "historia", entrada: 0, calificacion: 4.5 },
];

const CLAVE = "turismo-preferencias";
const porDefecto: Preferencias = { favoritos: [], orden: "calificacion", tipo: null };

const reducer = (p: Preferencias, accion: Accion): Preferencias => {
  switch (accion.tipo) {
    case "favorito":
      if (!lugares.some((l) => l.id === accion.id)) return p;
      return { ...p, favoritos: p.favoritos.includes(accion.id) ? p.favoritos.filter((id) => id !== accion.id) : [...p.favoritos, accion.id] };
    case "orden":
      return { ...p, orden: accion.valor };
    case "filtrar":
      return { ...p, tipo: accion.valor };
  }
};

const comparadores: Record<Orden, (a: Lugar, b: Lugar) => number> = {
  calificacion: (a, b) => b.calificacion - a.calificacion,
  precio: (a, b) => a.entrada - b.entrada || b.calificacion - a.calificacion,
  nombre: (a, b) => a.nombre.localeCompare(b.nombre),
};

const lista = (p: Preferencias): string[] =>
  lugares
    .filter((l) => p.tipo === null || l.tipo === p.tipo)
    .sort(comparadores[p.orden])
    .map((l) => `${p.favoritos.includes(l.id) ? "*" : " "} ${l.nombre} (${l.tipo}) $${l.entrada} - ${l.calificacion}`);

const cargar = (almacen: Almacen): Preferencias => {
  const crudo = almacen.getItem(CLAVE);
  return crudo ? { ...porDefecto, ...(JSON.parse(crudo) as Partial<Preferencias>) } : porDefecto;
};

console.log("Ejercicio 75: Lista turistica interactiva");
const almacen = new AlmacenMemoria();
let preferencias = cargar(almacen);
const guion: readonly Accion[] = [
  { tipo: "favorito", id: 2 }, { tipo: "favorito", id: 3 }, { tipo: "favorito", id: 99 },
  { tipo: "favorito", id: 3 }, { tipo: "orden", valor: "precio" }, { tipo: "filtrar", valor: "naturaleza" },
];
guion.forEach((accion) => {
  preferencias = reducer(preferencias, accion);
  almacen.setItem(CLAVE, JSON.stringify(preferencias));
});
console.log(`Preferencias guardadas: ${almacen.getItem(CLAVE)}`);
console.log("Lista al reabrir la app (naturaleza, por precio):");
lista(cargar(almacen)).forEach((l) => console.log(`  ${l}`));
console.log("Lista completa por calificacion:");
lista({ ...preferencias, tipo: null, orden: "calificacion" }).forEach((l) => console.log(`  ${l}`));
