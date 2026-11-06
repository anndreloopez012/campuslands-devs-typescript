// Solución Ejercicio Intermedio 72 - Stefani Sánchez
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

type Categoria = "entrada" | "principal" | "bebida" | "postre";

interface Plato {
  readonly id: number;
  readonly nombre: string;
  readonly categoria: Categoria;
  readonly precio: number;
}

interface Carrito {
  readonly cantidades: Readonly<Record<number, number>>;
  readonly cupon: string | null;
}

type Accion =
  | { readonly tipo: "agregar"; readonly id: number }
  | { readonly tipo: "quitar"; readonly id: number }
  | { readonly tipo: "cupon"; readonly codigo: string }
  | { readonly tipo: "vaciar" };

const menu: readonly Plato[] = [
  { id: 1, nombre: "Nachos con queso", categoria: "entrada", precio: 6 },
  { id: 2, nombre: "Hamburguesa clasica", categoria: "principal", precio: 11 },
  { id: 3, nombre: "Tacos al pastor", categoria: "principal", precio: 9 },
  { id: 4, nombre: "Limonada", categoria: "bebida", precio: 3 },
  { id: 5, nombre: "Flan", categoria: "postre", precio: 4 },
];

const cupones: Record<string, number> = { BIENVENIDO: 0.1, COMBO20: 0.2 };
const CLAVE = "carrito-menu";

const reducer = (c: Carrito, accion: Accion): Carrito => {
  switch (accion.tipo) {
    case "agregar":
      return menu.some((p) => p.id === accion.id) ? { ...c, cantidades: { ...c.cantidades, [accion.id]: (c.cantidades[accion.id] ?? 0) + 1 } } : c;
    case "quitar": {
      const actual = c.cantidades[accion.id] ?? 0;
      if (actual === 0) return c;
      const { [accion.id]: _, ...resto } = c.cantidades;
      return { ...c, cantidades: actual === 1 ? resto : { ...c.cantidades, [accion.id]: actual - 1 } };
    }
    case "cupon":
      return accion.codigo in cupones ? { ...c, cupon: accion.codigo } : c;
    case "vaciar":
      return { cantidades: {}, cupon: null };
  }
};

const totales = (c: Carrito) => {
  const subtotal = menu.reduce((acc, p) => acc + p.precio * (c.cantidades[p.id] ?? 0), 0);
  const descuento = c.cupon ? Math.round(subtotal * cupones[c.cupon] * 100) / 100 : 0;
  return { subtotal, descuento, total: Math.round((subtotal - descuento) * 100) / 100 };
};

const cargar = (almacen: Almacen): Carrito => {
  const crudo = almacen.getItem(CLAVE);
  if (!crudo) return { cantidades: {}, cupon: null };
  try {
    return JSON.parse(crudo) as Carrito;
  } catch {
    return { cantidades: {}, cupon: null };
  }
};

const mostrar = (c: Carrito): void => {
  menu
    .filter((p) => (c.cantidades[p.id] ?? 0) > 0)
    .forEach((p) => console.log(`    ${c.cantidades[p.id]} x ${p.nombre} = $${p.precio * (c.cantidades[p.id] ?? 0)}`));
  const t = totales(c);
  console.log(`    Subtotal $${t.subtotal} | descuento $${t.descuento}${c.cupon ? ` (${c.cupon})` : ""} | TOTAL $${t.total}`);
};

console.log("Ejercicio 72: Menu interactivo de comida");
const almacen = new AlmacenMemoria();
let carrito = cargar(almacen);
const guion: readonly Accion[] = [
  { tipo: "agregar", id: 2 }, { tipo: "agregar", id: 2 }, { tipo: "agregar", id: 4 }, { tipo: "agregar", id: 99 },
  { tipo: "quitar", id: 2 }, { tipo: "quitar", id: 5 }, { tipo: "cupon", codigo: "FALSO" }, { tipo: "cupon", codigo: "COMBO20" },
];
guion.forEach((accion) => {
  carrito = reducer(carrito, accion);
  almacen.setItem(CLAVE, JSON.stringify(carrito));
});
console.log("Carrito despues de la sesion:");
mostrar(carrito);
console.log("Carrito recuperado al reabrir la app:");
mostrar(cargar(almacen));
