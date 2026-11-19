export {};

// Intermedio 73: Tienda de ropa con filtros
// Tematica: ropa
// Resolucion: Dulce Morales
//
// Problema: el catalogo de una tienda en linea. Los filtros llegan en la URL
// (?categoria=playera&talla=M&color=negro&min=200&max=600&orden=precio-asc&pagina=1) como texto;
// se validan y se convierten en un DTO tipado. El servicio filtra el repositorio en memoria,
// ordena, pagina y calcula "facetas" (cuantos productos hay por talla, color y categoria con los
// demas filtros aplicados), como los contadores que aparecen junto a cada casilla en una tienda real.

// ===================== MODELO =====================

type Categoria = "playera" | "pantalon" | "chamarra" | "vestido";
type Talla = "XS" | "S" | "M" | "L" | "XL";
type Color = "negro" | "blanco" | "azul" | "rojo" | "verde";
type Orden = "precio-asc" | "precio-desc" | "nombre" | "nuevo" | "descuento";

const CATEGORIAS: readonly Categoria[] = ["playera", "pantalon", "chamarra", "vestido"];
const TALLAS: readonly Talla[] = ["XS", "S", "M", "L", "XL"];
const COLORES: readonly Color[] = ["negro", "blanco", "azul", "rojo", "verde"];
const ORDENES: readonly Orden[] = ["precio-asc", "precio-desc", "nombre", "nuevo", "descuento"];

interface Variante {
  readonly talla: Talla;
  readonly color: Color;
  readonly stock: number;
}

interface Producto {
  readonly sku: string;
  readonly nombre: string;
  readonly categoria: Categoria;
  readonly precio: number;
  readonly descuento: number; // 0..1
  readonly altaDia: number;   // para ordenar por "nuevo"
  readonly variantes: readonly Variante[];
}

// DTO de filtros ya validado
interface FiltroDTO {
  readonly categoria: Categoria | null;
  readonly tallas: readonly Talla[];
  readonly colores: readonly Color[];
  readonly min: number | null;
  readonly max: number | null;
  readonly soloDisponibles: boolean;
  readonly orden: Orden;
  readonly pagina: number;
}

// DTO de salida: una tarjeta del listado
interface TarjetaDTO {
  readonly sku: string;
  readonly nombre: string;
  readonly precioFinal: number;
  readonly precioAntes: number | null;
  readonly tallas: string;
  readonly colores: string;
}

// Cada faceta es una lista de [opcion, cantidad] en el mismo orden que las casillas de la pantalla
type Conteo<K extends string> = readonly (readonly [K, number])[];
interface Facetas {
  readonly talla: Conteo<Talla>;
  readonly color: Conteo<Color>;
  readonly categoria: Conteo<Categoria>;
}

interface PaginaDTO {
  readonly total: number;
  readonly pagina: number;
  readonly paginas: number;
  readonly tarjetas: readonly TarjetaDTO[];
  readonly facetas: Facetas;
  readonly avisos: readonly string[];
}

// ===================== PARSEO DE LA URL =====================

const POR_PAGINA: number = 3;

function enLista<T extends string>(lista: readonly T[], x: string): x is T {
  return lista.some((v) => v === x);
}

function parsearQuery(query: string): FiltroDTO & { readonly avisos: readonly string[] } {
  const params: URLSearchParams = new URLSearchParams(query);
  const avisos: string[] = [];

  // Valores de lista: se aceptan separados por coma y se ignoran los desconocidos
  function lista<T extends string>(nombre: string, validos: readonly T[], normalizar: (s: string) => string): T[] {
    const crudos: string[] = (params.get(nombre) ?? "").split(",").map((s) => normalizar(s.trim())).filter((s) => s !== "");
    const buenos: T[] = [];
    for (const c of crudos) {
      if (enLista(validos, c)) { if (!buenos.includes(c)) buenos.push(c); } else avisos.push(`${nombre} "${c}" ignorado`);
    }
    return buenos;
  }

  function numero(nombre: string): number | null {
    const crudo: string | null = params.get(nombre);
    if (crudo === null || crudo === "") return null;
    const n: number = Number(crudo);
    if (!Number.isFinite(n) || n < 0) { avisos.push(`${nombre} "${crudo}" ignorado`); return null; }
    return n;
  }

  const catTexto: string = (params.get("categoria") ?? "").toLowerCase();
  let categoria: Categoria | null = null;
  if (enLista(CATEGORIAS, catTexto)) categoria = catTexto;
  else if (catTexto !== "") avisos.push(`categoria "${catTexto}" ignorada`);

  let min: number | null = numero("min");
  let max: number | null = numero("max");
  if (min !== null && max !== null && min > max) {
    avisos.push(`min ${min} > max ${max}: se intercambian`);
    [min, max] = [max, min];
  }

  const ordenTexto: string = params.get("orden") ?? "precio-asc";
  const orden: Orden = enLista(ORDENES, ordenTexto) ? ordenTexto : "precio-asc";
  if (orden !== ordenTexto) avisos.push(`orden "${ordenTexto}" no valido, se usa precio-asc`);

  const paginaNum: number = Number(params.get("pagina") ?? "1");
  const pagina: number = Number.isInteger(paginaNum) && paginaNum >= 1 ? paginaNum : 1;

  return {
    categoria,
    tallas: lista("talla", TALLAS, (s) => s.toUpperCase()),
    colores: lista("color", COLORES, (s) => s.toLowerCase()),
    min, max,
    soloDisponibles: params.get("disponible") === "1",
    orden, pagina, avisos,
  };
}

// ===================== REPOSITORIO =====================

class RepoProductos {
  constructor(private readonly items: readonly Producto[]) {}
  todos(): readonly Producto[] { return this.items; }
}

const repo: RepoProductos = new RepoProductos([
  { sku: "PL-01", nombre: "Playera basica", categoria: "playera", precio: 199, descuento: 0, altaDia: 10,
    variantes: [{ talla: "S", color: "negro", stock: 5 }, { talla: "M", color: "negro", stock: 0 }, { talla: "M", color: "blanco", stock: 8 }, { talla: "L", color: "blanco", stock: 2 }] },
  { sku: "PL-02", nombre: "Playera estampada", categoria: "playera", precio: 299, descuento: 0.2, altaDia: 40,
    variantes: [{ talla: "M", color: "azul", stock: 3 }, { talla: "L", color: "rojo", stock: 1 }] },
  { sku: "PL-03", nombre: "Polo clasica", categoria: "playera", precio: 450, descuento: 0, altaDia: 25,
    variantes: [{ talla: "M", color: "verde", stock: 0 }, { talla: "XL", color: "negro", stock: 4 }] },
  { sku: "PA-01", nombre: "Jeans rectos", categoria: "pantalon", precio: 699, descuento: 0.3, altaDia: 5,
    variantes: [{ talla: "S", color: "azul", stock: 2 }, { talla: "M", color: "azul", stock: 6 }, { talla: "L", color: "negro", stock: 0 }] },
  { sku: "PA-02", nombre: "Jogger", categoria: "pantalon", precio: 499, descuento: 0, altaDia: 50,
    variantes: [{ talla: "M", color: "negro", stock: 7 }, { talla: "L", color: "verde", stock: 3 }] },
  { sku: "CH-01", nombre: "Chamarra de mezclilla", categoria: "chamarra", precio: 1199, descuento: 0.15, altaDia: 30,
    variantes: [{ talla: "M", color: "azul", stock: 1 }, { talla: "L", color: "azul", stock: 0 }] },
  { sku: "CH-02", nombre: "Rompevientos", categoria: "chamarra", precio: 899, descuento: 0, altaDia: 45,
    variantes: [{ talla: "S", color: "rojo", stock: 0 }, { talla: "M", color: "negro", stock: 0 }] },
  { sku: "VE-01", nombre: "Vestido midi", categoria: "vestido", precio: 799, descuento: 0.25, altaDia: 35,
    variantes: [{ talla: "XS", color: "rojo", stock: 2 }, { talla: "S", color: "negro", stock: 4 }, { talla: "M", color: "verde", stock: 1 }] },
]);

// ===================== SERVICIO =====================

const precioFinal = (p: Producto): number => Math.round(p.precio * (1 - p.descuento));

// Una variante cumple si su talla y color estan en el filtro (o el filtro esta vacio) y, si se pide, tiene stock
function variantesQueCumplen(p: Producto, f: FiltroDTO, ignorar: "talla" | "color" | null): readonly Variante[] {
  return p.variantes.filter((v) =>
    (ignorar === "talla" || f.tallas.length === 0 || f.tallas.includes(v.talla))
    && (ignorar === "color" || f.colores.length === 0 || f.colores.includes(v.color))
    && (!f.soloDisponibles || v.stock > 0));
}

function cumple(p: Producto, f: FiltroDTO, ignorar: "talla" | "color" | "categoria" | null = null): boolean {
  const precio: number = precioFinal(p);
  return (ignorar === "categoria" || f.categoria === null || p.categoria === f.categoria)
    && (f.min === null || precio >= f.min)
    && (f.max === null || precio <= f.max)
    && variantesQueCumplen(p, f, ignorar === "categoria" ? null : ignorar).length > 0;
}

const COMPARADOR: Readonly<Record<Orden, (a: Producto, b: Producto) => number>> = {
  "precio-asc": (a, b) => precioFinal(a) - precioFinal(b),
  "precio-desc": (a, b) => precioFinal(b) - precioFinal(a),
  nombre: (a, b) => a.nombre.localeCompare(b.nombre),
  nuevo: (a, b) => b.altaDia - a.altaDia,
  descuento: (a, b) => b.descuento - a.descuento || precioFinal(a) - precioFinal(b),
};

function contar<K extends string>(claves: readonly K[], productos: readonly Producto[], tiene: (p: Producto, k: K) => boolean): Conteo<K> {
  return claves.map((k) => [k, productos.filter((p) => tiene(p, k)).length] as const);
}

function facetas(f: FiltroDTO): Facetas {
  const todos: readonly Producto[] = repo.todos();
  // Cada faceta se calcula ignorando su propio filtro (asi se ve cuantos habria al marcar otra casilla)
  const sinTalla: Producto[] = todos.filter((p) => cumple(p, f, "talla"));
  const sinColor: Producto[] = todos.filter((p) => cumple(p, f, "color"));
  const sinCat: Producto[] = todos.filter((p) => cumple(p, f, "categoria"));
  return {
    talla: contar(TALLAS, sinTalla, (p, t) => variantesQueCumplen(p, { ...f, tallas: [t] }, null).length > 0),
    color: contar(COLORES, sinColor, (p, c) => variantesQueCumplen(p, { ...f, colores: [c] }, null).length > 0),
    categoria: contar(CATEGORIAS, sinCat, (p, c) => p.categoria === c),
  };
}

function aTarjeta(p: Producto, f: FiltroDTO): TarjetaDTO {
  const vs: readonly Variante[] = variantesQueCumplen(p, f, null);
  const unicos = <T,>(xs: readonly T[]): T[] => [...new Set(xs)];
  return {
    sku: p.sku,
    nombre: p.nombre,
    precioFinal: precioFinal(p),
    precioAntes: p.descuento > 0 ? p.precio : null,
    tallas: unicos(vs.map((v) => v.talla)).sort((a, b) => TALLAS.indexOf(a) - TALLAS.indexOf(b)).join("/"),
    colores: unicos(vs.map((v) => v.color)).join("/"),
  };
}

function buscar(query: string): PaginaDTO {
  const f = parsearQuery(query);
  const avisos: string[] = [...f.avisos];
  const resultado: Producto[] = repo.todos().filter((p) => cumple(p, f)).sort(COMPARADOR[f.orden]);
  const paginas: number = Math.max(1, Math.ceil(resultado.length / POR_PAGINA));
  let pagina: number = f.pagina;
  if (pagina > paginas) { avisos.push(`pagina ${pagina} no existe, se muestra la ${paginas}`); pagina = paginas; }
  const tarjetas: TarjetaDTO[] = resultado.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA).map((p) => aTarjeta(p, f));
  return { total: resultado.length, pagina, paginas, tarjetas, facetas: facetas(f), avisos };
}

// ===================== REPORTE DE INVENTARIO =====================

function reporteInventario(): string[] {
  const lineas: string[] = [];
  for (const c of CATEGORIAS) {
    const ps: Producto[] = repo.todos().filter((p) => p.categoria === c);
    const unidades: number = ps.reduce((a, p) => a + p.variantes.reduce((b, v) => b + v.stock, 0), 0);
    const valor: number = ps.reduce((a, p) => a + p.variantes.reduce((b, v) => b + v.stock * precioFinal(p), 0), 0);
    const agotadas: number = ps.reduce((a, p) => a + p.variantes.filter((v) => v.stock === 0).length, 0);
    lineas.push(`${c.padEnd(9)} productos ${ps.length} | unidades ${String(unidades).padStart(3)} | valor $${String(valor).padStart(6)} | variantes agotadas ${agotadas}`);
  }
  const sinStock: string[] = repo.todos().filter((p) => p.variantes.every((v) => v.stock === 0)).map((p) => p.nombre);
  lineas.push(`Productos completamente agotados: ${sinStock.join(", ") || "ninguno"}`);
  return lineas;
}

// ===================== PANTALLA =====================

function mostrar(query: string): void {
  const r: PaginaDTO = buscar(query);
  console.log(`\nGET /tienda${query}`);
  for (const a of r.avisos) console.log(`  aviso: ${a}`);
  console.log(`  ${r.total} resultado(s), pagina ${r.pagina}/${r.paginas}`);
  for (const t of r.tarjetas) {
    const antes: string = t.precioAntes !== null ? ` (antes $${t.precioAntes})` : "";
    console.log(`   - [${t.sku}] ${t.nombre.padEnd(22)} $${String(t.precioFinal).padStart(4)}${antes.padEnd(13)} tallas ${t.tallas.padEnd(9)} colores ${t.colores}`);
  }
  const fmt = (c: Conteo<string>): string => c.map(([k, v]) => `${k}(${v})`).join(" ");
  console.log(`  facetas talla: ${fmt(r.facetas.talla)}`);
  console.log(`  facetas color: ${fmt(r.facetas.color)}`);
  console.log(`  facetas categoria: ${fmt(r.facetas.categoria)}`);
}

function main(): void {
  mostrar("");
  mostrar("?pagina=3");
  mostrar("?categoria=playera&talla=m&orden=precio-desc");
  mostrar("?talla=M&color=negro&disponible=1");
  mostrar("?min=600&max=200&orden=descuento");
  mostrar("?min=599&max=599&orden=nombre");
  mostrar("?min=1000&max=1000");
  mostrar("?orden=nuevo&disponible=1&color=azul,verde");
  mostrar("?categoria=zapatos&talla=M,XXL,M&color=morado&orden=barato&pagina=9");

  console.log("\n=== Reporte de inventario ===");
  for (const l of reporteInventario()) console.log("  " + l);
}

main();
