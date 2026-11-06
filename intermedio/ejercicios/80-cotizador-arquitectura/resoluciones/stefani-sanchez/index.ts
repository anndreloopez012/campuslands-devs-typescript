// Solución Ejercicio Intermedio 80 - Stefani Sánchez
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

type Servicio = "modelado" | "render-exterior" | "render-interior" | "recorrido-virtual" | "planos";

interface Linea {
  readonly servicio: Servicio;
  readonly metros2: number;
}

interface Cotizacion {
  readonly cliente: string;
  readonly lineas: readonly Linea[];
  readonly urgente: boolean;
  readonly revisionesExtra: number;
}

type Accion =
  | { readonly tipo: "agregar"; readonly linea: Linea }
  | { readonly tipo: "quitar"; readonly servicio: Servicio }
  | { readonly tipo: "urgente" }
  | { readonly tipo: "revisiones"; readonly cantidad: number };

const tarifaPorM2: Record<Servicio, number> = {
  modelado: 3.5,
  "render-exterior": 2.2,
  "render-interior": 2.8,
  "recorrido-virtual": 4.5,
  planos: 1.5,
};

const MINIMO_POR_LINEA = 80;
const RECARGO_URGENTE = 0.3;
const COSTO_REVISION = 60;
const IVA = 0.12;

const reducer = (c: Cotizacion, accion: Accion): Cotizacion => {
  switch (accion.tipo) {
    case "agregar": {
      if (accion.linea.metros2 <= 0) return c;
      const otras = c.lineas.filter((l) => l.servicio !== accion.linea.servicio);
      return { ...c, lineas: [...otras, accion.linea] };
    }
    case "quitar":
      return { ...c, lineas: c.lineas.filter((l) => l.servicio !== accion.servicio) };
    case "urgente":
      return { ...c, urgente: !c.urgente };
    case "revisiones":
      return { ...c, revisionesExtra: Math.max(0, Math.floor(accion.cantidad)) };
  }
};

const costoLinea = (l: Linea): number => Math.max(l.metros2 * tarifaPorM2[l.servicio], MINIMO_POR_LINEA);

const calcular = (c: Cotizacion) => {
  const subtotal = c.lineas.reduce((acc, l) => acc + costoLinea(l), 0);
  const recargo = c.urgente ? subtotal * RECARGO_URGENTE : 0;
  const revisiones = c.revisionesExtra * COSTO_REVISION;
  const base = subtotal + recargo + revisiones;
  const iva = base * IVA;
  return { subtotal, recargo, revisiones, iva, total: base + iva };
};

const dinero = (n: number): string => `$${(Math.round(n * 100) / 100).toFixed(2)}`;

const imprimir = (c: Cotizacion): void => {
  console.log(`  Cotizacion para ${c.cliente}:`);
  c.lineas.forEach((l) => console.log(`    ${l.servicio}: ${l.metros2} m2 x $${tarifaPorM2[l.servicio]} = ${dinero(costoLinea(l))}${l.metros2 * tarifaPorM2[l.servicio] < MINIMO_POR_LINEA ? " (minimo)" : ""}`));
  const t = calcular(c);
  console.log(`    Subtotal ${dinero(t.subtotal)} | urgente ${dinero(t.recargo)} | revisiones ${dinero(t.revisiones)} | IVA ${dinero(t.iva)}`);
  console.log(`    TOTAL ${dinero(t.total)}`);
};

console.log("Ejercicio 80: Cotizador de arquitectura 3D");
const almacen = new AlmacenMemoria();
const clave = "cotizacion-casa-lago";
let cotizacion: Cotizacion = { cliente: "Casa Lago", lineas: [], urgente: false, revisionesExtra: 0 };

const guion: readonly Accion[] = [
  { tipo: "agregar", linea: { servicio: "modelado", metros2: 180 } },
  { tipo: "agregar", linea: { servicio: "render-exterior", metros2: 180 } },
  { tipo: "agregar", linea: { servicio: "planos", metros2: 20 } },
  { tipo: "agregar", linea: { servicio: "recorrido-virtual", metros2: -5 } },
  { tipo: "agregar", linea: { servicio: "render-interior", metros2: 60 } },
  { tipo: "agregar", linea: { servicio: "modelado", metros2: 200 } },
  { tipo: "quitar", servicio: "render-exterior" },
  { tipo: "revisiones", cantidad: 2.9 },
  { tipo: "urgente" },
];
guion.forEach((accion) => {
  cotizacion = reducer(cotizacion, accion);
  almacen.setItem(clave, JSON.stringify(cotizacion));
});
imprimir(cotizacion);
console.log("Recuperada desde el almacenamiento:");
imprimir(JSON.parse(almacen.getItem(clave) ?? "{}") as Cotizacion);
