export {};

// Intermedio 72: Menu interactivo comida
// Tematica: comida
// Resolucion: Dulce Morales
//
// Problema: la app de menu de un restaurante. La persona filtra el menu (categoria, alergenos,
// horario), arma un carrito con tamanos y extras, y confirma el pedido. La app esta en capas:
// repositorio en memoria del menu -> servicio de carrito (con DTO de entrada y de salida)
// -> repositorio de pedidos -> reporte de ventas del dia.

// ===================== MODELO =====================

type Categoria = "desayuno" | "plato" | "bebida" | "postre";
type Alergeno = "gluten" | "lacteos" | "huevo" | "nueces" | "mariscos";
type Tamano = "chico" | "normal" | "grande";

interface Extra {
  readonly id: string;
  readonly nombre: string;
  readonly precio: number;
  readonly alergenos: readonly Alergeno[];
}

interface Platillo {
  readonly id: string;
  readonly nombre: string;
  readonly categoria: Categoria;
  readonly precio: number;
  readonly alergenos: readonly Alergeno[];
  readonly extrasPermitidos: readonly string[];
  readonly tieneTamanos: boolean;
  readonly agotado: boolean;
}

// DTO de entrada: lo que manda la pantalla al tocar "Agregar"
interface AgregarDTO {
  readonly platilloId: string;
  readonly cantidad: number;
  readonly tamano?: Tamano;
  readonly extras?: readonly string[];
  readonly nota?: string;
}

interface LineaCarrito {
  readonly platillo: Platillo;
  readonly cantidad: number;
  readonly tamano: Tamano;
  readonly extras: readonly Extra[];
  readonly nota: string;
}

// DTO de salida: lo que la pantalla necesita para dibujar el ticket
interface TicketDTO {
  readonly folio: number;
  readonly lineas: readonly { readonly texto: string; readonly importe: number }[];
  readonly subtotal: number;
  readonly descuento: number;
  readonly propina: number;
  readonly total: number;
  readonly alergenos: readonly Alergeno[];
}

interface Pedido {
  readonly folio: number;
  readonly hora: number;
  readonly lineas: readonly LineaCarrito[];
  readonly total: number;
}

type Resultado<T> = { readonly ok: true; readonly valor: T } | { readonly ok: false; readonly error: string };

// ===================== REPOSITORIO GENERICO EN MEMORIA =====================

class RepoMemoria<T extends { readonly id: string }> {
  private readonly items: Map<string, T>;
  constructor(iniciales: readonly T[]) { this.items = new Map(iniciales.map((i) => [i.id, i])); }
  buscar(id: string): T | undefined { return this.items.get(id); }
  todos(): readonly T[] { return [...this.items.values()]; }
  filtrar(pred: (t: T) => boolean): readonly T[] { return this.todos().filter(pred); }
}

// ===================== DATOS =====================

const extras = new RepoMemoria<Extra>([
  { id: "queso", nombre: "queso extra", precio: 15, alergenos: ["lacteos"] },
  { id: "tocino", nombre: "tocino", precio: 20, alergenos: [] },
  { id: "aguacate", nombre: "aguacate", precio: 18, alergenos: [] },
  { id: "crema", nombre: "crema batida", precio: 10, alergenos: ["lacteos"] },
  { id: "nuez", nombre: "nuez", precio: 12, alergenos: ["nueces"] },
]);

const menu = new RepoMemoria<Platillo>([
  { id: "chilaq", nombre: "Chilaquiles", categoria: "desayuno", precio: 95, alergenos: ["lacteos"], extrasPermitidos: ["queso", "aguacate", "tocino"], tieneTamanos: false, agotado: false },
  { id: "hotcak", nombre: "Hot cakes", categoria: "desayuno", precio: 80, alergenos: ["gluten", "huevo", "lacteos"], extrasPermitidos: ["crema", "nuez", "tocino"], tieneTamanos: false, agotado: false },
  { id: "burger", nombre: "Hamburguesa", categoria: "plato", precio: 140, alergenos: ["gluten"], extrasPermitidos: ["queso", "tocino", "aguacate"], tieneTamanos: false, agotado: false },
  { id: "ensal", nombre: "Ensalada cesar", categoria: "plato", precio: 110, alergenos: ["lacteos", "huevo"], extrasPermitidos: ["aguacate"], tieneTamanos: false, agotado: false },
  { id: "aguach", nombre: "Aguachile", categoria: "plato", precio: 165, alergenos: ["mariscos"], extrasPermitidos: ["aguacate"], tieneTamanos: false, agotado: true },
  { id: "limon", nombre: "Limonada", categoria: "bebida", precio: 35, alergenos: [], extrasPermitidos: [], tieneTamanos: true, agotado: false },
  { id: "cafe", nombre: "Cafe latte", categoria: "bebida", precio: 45, alergenos: ["lacteos"], extrasPermitidos: ["crema"], tieneTamanos: true, agotado: false },
  { id: "brown", nombre: "Brownie", categoria: "postre", precio: 60, alergenos: ["gluten", "huevo", "nueces"], extrasPermitidos: ["crema"], tieneTamanos: false, agotado: false },
]);

// ===================== REGLAS =====================

const FACTOR_TAMANO: Readonly<Record<Tamano, number>> = { chico: 0.8, normal: 1, grande: 1.3 };
const FIN_DESAYUNO: number = 12;
const MAX_POR_LINEA: number = 10;
const PROPINA: number = 0.1;
// Combo: cada plato fuerte + una bebida = 10 % de descuento sobre esa bebida
const DESCUENTO_COMBO: number = 0.1;

function disponibleA(p: Platillo, hora: number): boolean {
  return !p.agotado && (p.categoria !== "desayuno" || hora < FIN_DESAYUNO);
}

interface FiltroMenu {
  readonly categoria?: Categoria;
  readonly sinAlergenos?: readonly Alergeno[];
  readonly hora: number;
}

function filtrarMenu(f: FiltroMenu): readonly Platillo[] {
  return menu.filtrar((p) =>
    disponibleA(p, f.hora)
    && (f.categoria === undefined || p.categoria === f.categoria)
    && !(f.sinAlergenos ?? []).some((a) => p.alergenos.includes(a)));
}

function precioLinea(l: LineaCarrito): number {
  const unitario: number = l.platillo.precio * FACTOR_TAMANO[l.tamano] + l.extras.reduce((a, e) => a + e.precio, 0);
  return Math.round(unitario * l.cantidad * 100) / 100;
}

// ===================== SERVICIO DE CARRITO =====================

class Carrito {
  private lineas: readonly LineaCarrito[] = [];
  constructor(private readonly hora: number) {}

  agregar(dto: AgregarDTO): Resultado<LineaCarrito> {
    const p: Platillo | undefined = menu.buscar(dto.platilloId);
    if (p === undefined) return { ok: false, error: `platillo "${dto.platilloId}" no existe` };
    if (p.agotado) return { ok: false, error: `${p.nombre} esta agotado` };
    if (!disponibleA(p, this.hora)) return { ok: false, error: `${p.nombre} solo se sirve antes de las ${FIN_DESAYUNO}:00` };
    if (!Number.isInteger(dto.cantidad) || dto.cantidad < 1 || dto.cantidad > MAX_POR_LINEA) return { ok: false, error: `cantidad debe ser de 1 a ${MAX_POR_LINEA}` };
    if (dto.tamano !== undefined && !p.tieneTamanos) return { ok: false, error: `${p.nombre} no tiene tamanos` };
    const elegidos: Extra[] = [];
    for (const id of dto.extras ?? []) {
      const e: Extra | undefined = extras.buscar(id);
      if (e === undefined || !p.extrasPermitidos.includes(id)) return { ok: false, error: `extra "${id}" no disponible para ${p.nombre}` };
      if (elegidos.includes(e)) return { ok: false, error: `extra "${id}" repetido` };
      elegidos.push(e);
    }
    const linea: LineaCarrito = { platillo: p, cantidad: dto.cantidad, tamano: dto.tamano ?? "normal", extras: elegidos, nota: (dto.nota ?? "").trim().slice(0, 40) };
    this.lineas = [...this.lineas, linea];
    return { ok: true, valor: linea };
  }

  quitar(indice: number): boolean {
    if (indice < 0 || indice >= this.lineas.length) return false;
    this.lineas = this.lineas.filter((_, i) => i !== indice);
    return true;
  }

  get contenido(): readonly LineaCarrito[] { return this.lineas; }

  ticket(folio: number): TicketDTO {
    const lineas = this.lineas.map((l) => {
      const tam: string = l.platillo.tieneTamanos ? ` (${l.tamano})` : "";
      const ext: string = l.extras.length > 0 ? ` + ${l.extras.map((e) => e.nombre).join(", ")}` : "";
      const nota: string = l.nota !== "" ? ` [${l.nota}]` : "";
      return { texto: `${l.cantidad}x ${l.platillo.nombre}${tam}${ext}${nota}`, importe: precioLinea(l) };
    });
    const subtotal: number = lineas.reduce((a, l) => a + l.importe, 0);
    // Combos: cada plato se empareja con una bebida (las mas caras primero para favorecer al cliente)
    const unidades = (cat: Categoria): number[] => this.lineas
      .filter((l) => l.platillo.categoria === cat)
      .flatMap((l) => Array<number>(l.cantidad).fill(precioLinea(l) / l.cantidad))
      .sort((a, b) => b - a);
    const platos: number[] = unidades("plato");
    const bebidas: number[] = unidades("bebida");
    const combos: number = Math.min(platos.length, bebidas.length);
    const descuento: number = Math.round(bebidas.slice(0, combos).reduce((a, b) => a + b * DESCUENTO_COMBO, 0) * 100) / 100;
    const propina: number = Math.round((subtotal - descuento) * PROPINA * 100) / 100;
    const alergenos: Alergeno[] = [...new Set(this.lineas.flatMap((l) => [...l.platillo.alergenos, ...l.extras.flatMap((e) => e.alergenos)]))].sort();
    return { folio, lineas, subtotal, descuento, propina, total: Math.round((subtotal - descuento + propina) * 100) / 100, alergenos };
  }
}

// ===================== REPOSITORIO DE PEDIDOS + REPORTE =====================

class Pedidos {
  private readonly lista: Pedido[] = [];
  confirmar(carrito: Carrito, hora: number): Resultado<TicketDTO> {
    if (carrito.contenido.length === 0) return { ok: false, error: "el carrito esta vacio" };
    const t: TicketDTO = carrito.ticket(this.lista.length + 1);
    this.lista.push({ folio: t.folio, hora, lineas: carrito.contenido, total: t.total });
    return { ok: true, valor: t };
  }
  reporte(): { readonly pedidos: number; readonly ventas: number; readonly ticketPromedio: number; readonly porCategoria: Readonly<Record<Categoria, number>>; readonly top: string } {
    const porCategoria: Record<Categoria, number> = { desayuno: 0, plato: 0, bebida: 0, postre: 0 };
    const unidades: Map<string, number> = new Map();
    for (const p of this.lista) for (const l of p.lineas) {
      porCategoria[l.platillo.categoria] += l.cantidad;
      unidades.set(l.platillo.nombre, (unidades.get(l.platillo.nombre) ?? 0) + l.cantidad);
    }
    const ventas: number = this.lista.reduce((a, p) => a + p.total, 0);
    const top: [string, number] | undefined = [...unidades.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
    return { pedidos: this.lista.length, ventas, ticketPromedio: this.lista.length > 0 ? ventas / this.lista.length : 0, porCategoria, top: top ? `${top[0]} (${top[1]})` : "-" };
  }
}

// ===================== PANTALLA =====================

const $ = (n: number): string => `$${n.toFixed(2)}`;

function imprimirTicket(t: TicketDTO): void {
  console.log(`  --- Ticket #${t.folio} ---`);
  for (const l of t.lineas) console.log(`  ${l.texto.padEnd(52)} ${$(l.importe).padStart(9)}`);
  console.log(`  ${"Subtotal".padEnd(52)} ${$(t.subtotal).padStart(9)}`);
  if (t.descuento > 0) console.log(`  ${"Descuento combo".padEnd(52)} ${("-" + $(t.descuento)).padStart(9)}`);
  console.log(`  ${"Propina 10%".padEnd(52)} ${$(t.propina).padStart(9)}`);
  console.log(`  ${"TOTAL".padEnd(52)} ${$(t.total).padStart(9)}`);
  console.log(`  Contiene: ${t.alergenos.join(", ") || "sin alergenos"}`);
}

function intentar(c: Carrito, dto: AgregarDTO): void {
  const r: Resultado<LineaCarrito> = c.agregar(dto);
  console.log(r.ok ? `  + ${r.valor.cantidad}x ${r.valor.platillo.nombre}` : `  x ${r.error}`);
}

function main(): void {
  console.log("=== Filtros del menu ===");
  const nombres = (ps: readonly Platillo[]): string => ps.map((p) => p.nombre).join(", ") || "(nada)";
  console.log("  11:00 todo:            ", nombres(filtrarMenu({ hora: 11 })));
  console.log("  12:00 todo (limite):   ", nombres(filtrarMenu({ hora: 12 })));
  console.log("  14:00 sin gluten:      ", nombres(filtrarMenu({ hora: 14, sinAlergenos: ["gluten"] })));
  console.log("  14:00 bebidas sin lact:", nombres(filtrarMenu({ hora: 14, categoria: "bebida", sinAlergenos: ["lacteos"] })));

  const pedidos: Pedidos = new Pedidos();

  console.log("\n=== Pedido 1 (10:30) ===");
  const c1: Carrito = new Carrito(10.5);
  intentar(c1, { platilloId: "chilaq", cantidad: 2, extras: ["aguacate", "tocino"], nota: "salsa verde" });
  intentar(c1, { platilloId: "hotcak", cantidad: 1, extras: ["queso"] });
  intentar(c1, { platilloId: "cafe", cantidad: 2, tamano: "grande" });
  intentar(c1, { platilloId: "hotcak", cantidad: 1, extras: ["nuez", "nuez"] });
  intentar(c1, { platilloId: "hotcak", cantidad: 1, extras: ["crema"] });
  const t1 = pedidos.confirmar(c1, 10.5);
  if (t1.ok) imprimirTicket(t1.valor);

  console.log("\n=== Pedido 2 (14:00) ===");
  const c2: Carrito = new Carrito(14);
  intentar(c2, { platilloId: "chilaq", cantidad: 1 });
  intentar(c2, { platilloId: "aguach", cantidad: 1 });
  intentar(c2, { platilloId: "pizza", cantidad: 1 });
  intentar(c2, { platilloId: "burger", cantidad: 0 });
  intentar(c2, { platilloId: "burger", cantidad: 11 });
  intentar(c2, { platilloId: "burger", cantidad: 3, extras: ["queso"] });
  intentar(c2, { platilloId: "ensal", cantidad: 1, tamano: "grande" });
  intentar(c2, { platilloId: "ensal", cantidad: 1 });
  intentar(c2, { platilloId: "limon", cantidad: 2, tamano: "chico" });
  intentar(c2, { platilloId: "cafe", cantidad: 1 });
  intentar(c2, { platilloId: "brown", cantidad: 2, extras: ["crema"] });
  console.log(`  quitar linea 9: ${c2.quitar(9)}, quitar linea 1: ${c2.quitar(1)}`);
  const t2 = pedidos.confirmar(c2, 14);
  if (t2.ok) imprimirTicket(t2.valor);

  console.log("\n=== Pedido 3 (vacio) ===");
  const t3 = pedidos.confirmar(new Carrito(15), 15);
  console.log(t3.ok ? "  confirmado" : `  x ${t3.error}`);

  const rep = pedidos.reporte();
  console.log("\n=== Reporte del dia ===");
  console.log(`  Pedidos: ${rep.pedidos} | Ventas: ${$(rep.ventas)} | Ticket promedio: ${$(rep.ticketPromedio)}`);
  console.log(`  Unidades por categoria: ${Object.entries(rep.porCategoria).map(([k, v]) => `${k}=${v}`).join(", ")}`);
  console.log(`  Mas vendido: ${rep.top}`);
}

main();
