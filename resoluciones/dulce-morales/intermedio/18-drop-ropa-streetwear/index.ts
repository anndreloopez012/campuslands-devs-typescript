export {};

// Intermedio 18: Drop de ropa streetwear
// Tematica: ropa
// Resolucion: Dulce Morales
//
// Problema: una marca lanza un "drop": pocas unidades por talla que salen a la venta a una hora exacta.
// Llegan muchas solicitudes de compra. Hay que atenderlas en orden de llegada respetando:
// acceso anticipado solo para miembros, 1 unidad por producto por cliente, deteccion de bots
// (demasiadas solicitudes seguidas) y stock por talla. Al final, un reporte de ventas.

// ===================== MODELO (objetos anidados) =====================

type Talla = "S" | "M" | "L" | "XL";
type Nivel = "miembro" | "general";

interface Producto {
  readonly sku: string;
  readonly nombre: string;
  readonly colaboracion: { readonly artista: string; readonly edicion: string } | null;
  readonly precio: number;
  readonly stock: Readonly<Record<Talla, number>>;
}

interface Cliente {
  readonly id: string;
  readonly nombre: string;
  readonly nivel: Nivel;
}

interface Solicitud {
  readonly segundo: number; // segundos desde las 10:00:00
  readonly clienteId: string;
  readonly sku: string;
  readonly talla: Talla;
}

type MotivoRechazo = "antes de tiempo" | "ya compro" | "agotado" | "bot" | "datos invalidos";

type Atencion =
  | { readonly estado: "vendido"; readonly solicitud: Solicitud; readonly precio: number }
  | { readonly estado: "rechazado"; readonly solicitud: Solicitud; readonly motivo: MotivoRechazo; readonly detalle: string };

type StockActual = Readonly<Record<string, Readonly<Record<Talla, number>>>>;

// ===================== REGLAS =====================

const INICIO_MIEMBROS: number = -300; // 5 minutos antes (09:55:00)
const INICIO_GENERAL: number = 0; // 10:00:00 en punto
const VENTANA_BOT_SEG: number = 2; // si un cliente manda...
const SOLICITUDES_BOT: number = 3; // ...3 o mas solicitudes en 2 segundos, es un bot
const DESCUENTO_MIEMBRO: number = 0.05;

// ===================== DATOS DE PRUEBA =====================

const productos: readonly Producto[] = [
  { sku: "HD-01", nombre: "Hoodie Neon Static", colaboracion: { artista: "Kroma", edicion: "Verano 26" }, precio: 120, stock: { S: 1, M: 2, L: 2, XL: 1 } },
  { sku: "TS-02", nombre: "Tee Concrete Logo", colaboracion: null, precio: 45, stock: { S: 2, M: 3, L: 3, XL: 2 } },
  { sku: "JK-03", nombre: "Jacket Night Shift", colaboracion: { artista: "Vera Moss", edicion: "Capsula 01" }, precio: 260, stock: { S: 0, M: 1, L: 1, XL: 0 } },
];

const clientes: readonly Cliente[] = [
  { id: "C1", nombre: "Nico", nivel: "miembro" },
  { id: "C2", nombre: "Sara", nivel: "general" },
  { id: "C3", nombre: "Leo", nivel: "miembro" },
  { id: "C4", nombre: "Mia", nivel: "general" },
  { id: "C5", nombre: "Bot_9x", nivel: "general" },
  { id: "C6", nombre: "Ivan", nivel: "general" },
];

const solicitudes: readonly Solicitud[] = [
  { segundo: -120, clienteId: "C1", sku: "JK-03", talla: "M" }, // miembro, acceso anticipado: OK
  { segundo: -60, clienteId: "C2", sku: "HD-01", talla: "S" }, // general antes de tiempo: rechazado
  { segundo: -30, clienteId: "C3", sku: "HD-01", talla: "S" }, // miembro se lleva la unica S
  { segundo: 0, clienteId: "C2", sku: "HD-01", talla: "S" }, // limite: llega justo a las 10:00:00, pero la S ya se agoto
  { segundo: 0, clienteId: "C4", sku: "HD-01", talla: "M" }, // limite: a las 10:00:00 en punto si puede comprar
  { segundo: 1, clienteId: "C5", sku: "TS-02", talla: "M" },
  { segundo: 1, clienteId: "C5", sku: "HD-01", talla: "L" },
  { segundo: 2, clienteId: "C5", sku: "JK-03", talla: "L" }, // 3ra solicitud en 2 s: bot detectado
  { segundo: 3, clienteId: "C1", sku: "JK-03", talla: "L" }, // ya compro esta chaqueta
  { segundo: 5, clienteId: "C6", sku: "JK-03", talla: "L" }, // se lleva la ultima L
  { segundo: 8, clienteId: "C2", sku: "TS-02", talla: "S" },
  { segundo: 9, clienteId: "C4", sku: "JK-03", talla: "XL" }, // XL nunca tuvo stock
  { segundo: 12, clienteId: "C9", sku: "TS-02", talla: "M" }, // cliente no registrado
];

// ===================== VALIDACION Y CALCULOS (funciones puras) =====================

function buscarProducto(sku: string): Producto | undefined {
  return productos.find((p: Producto): boolean => p.sku === sku);
}

function buscarCliente(id: string): Cliente | undefined {
  return clientes.find((c: Cliente): boolean => c.id === id);
}

// Un cliente es bot si en alguna ventana de 2 s mando 3 o mas solicitudes
function detectarBots(lista: readonly Solicitud[]): Set<string> {
  const bots: Set<string> = new Set<string>();
  const porCliente: Map<string, number[]> = new Map<string, number[]>();
  for (const s of lista) porCliente.set(s.clienteId, [...(porCliente.get(s.clienteId) ?? []), s.segundo]);

  for (const [id, tiempos] of porCliente) {
    const ordenados: number[] = [...tiempos].sort((a: number, b: number): number => a - b);
    const sospechoso: boolean = ordenados.some(
      (t: number, i: number): boolean => ordenados.filter((x: number, j: number): boolean => j >= i && x - t <= VENTANA_BOT_SEG).length >= SOLICITUDES_BOT,
    );
    if (sospechoso) bots.add(id);
  }
  return bots;
}

function stockInicial(): StockActual {
  return Object.fromEntries(productos.map((p: Producto): [string, Record<Talla, number>] => [p.sku, { ...p.stock }]));
}

function hora(segundo: number): string {
  const total: number = 10 * 3600 + segundo;
  const h: number = Math.floor(total / 3600);
  const m: number = Math.floor((total % 3600) / 60);
  const s: number = total % 60;
  return [h, m, s].map((n: number): string => String(n).padStart(2, "0")).join(":");
}

function precioPara(producto: Producto, cliente: Cliente): number {
  const descuento: number = cliente.nivel === "miembro" ? DESCUENTO_MIEMBRO : 0;
  return Math.round(producto.precio * (1 - descuento) * 100) / 100;
}

function procesarDrop(lista: readonly Solicitud[]): { atenciones: Atencion[]; stock: StockActual } {
  // Orden de llegada; si llegan en el mismo segundo, se respeta el orden original
  const enOrden: Solicitud[] = [...lista].sort((a: Solicitud, b: Solicitud): number => a.segundo - b.segundo);
  const bots: Set<string> = detectarBots(lista);
  const compras: Set<string> = new Set<string>(); // "cliente|sku"
  let stock: StockActual = stockInicial();
  const atenciones: Atencion[] = [];

  const rechazar = (s: Solicitud, motivo: MotivoRechazo, detalle: string): void => {
    atenciones.push({ estado: "rechazado", solicitud: s, motivo, detalle });
  };

  for (const s of enOrden) {
    const cliente: Cliente | undefined = buscarCliente(s.clienteId);
    const producto: Producto | undefined = buscarProducto(s.sku);
    if (cliente === undefined || producto === undefined) {
      rechazar(s, "datos invalidos", cliente === undefined ? `cliente ${s.clienteId} no registrado` : `producto ${s.sku} no existe`);
      continue;
    }
    if (bots.has(cliente.id)) {
      rechazar(s, "bot", `${SOLICITUDES_BOT}+ solicitudes en ${VENTANA_BOT_SEG} s`);
      continue;
    }
    const apertura: number = cliente.nivel === "miembro" ? INICIO_MIEMBROS : INICIO_GENERAL;
    if (s.segundo < apertura) {
      rechazar(s, "antes de tiempo", `abre a las ${hora(apertura)} para ${cliente.nivel}`);
      continue;
    }
    const clave: string = `${cliente.id}|${producto.sku}`;
    if (compras.has(clave)) {
      rechazar(s, "ya compro", "maximo 1 unidad por producto");
      continue;
    }
    const tallas: Readonly<Record<Talla, number>> = stock[producto.sku] ?? producto.stock;
    if (tallas[s.talla] <= 0) {
      rechazar(s, "agotado", `talla ${s.talla} sin unidades`);
      continue;
    }
    // Stock NUEVO: no se modifica el anterior
    stock = { ...stock, [producto.sku]: { ...tallas, [s.talla]: tallas[s.talla] - 1 } };
    compras.add(clave);
    atenciones.push({ estado: "vendido", solicitud: s, precio: precioPara(producto, cliente) });
  }
  return { atenciones, stock };
}

// ===================== SALIDA POR CONSOLA =====================

const TALLAS: readonly Talla[] = ["S", "M", "L", "XL"];

function totalUnidades(stock: Readonly<Record<Talla, number>>): number {
  return TALLAS.reduce((t: number, talla: Talla): number => t + stock[talla], 0);
}

function main(): void {
  const { atenciones, stock } = procesarDrop(solicitudes);

  console.log("===================== DROP STREETWEAR =====================");
  for (const a of atenciones) {
    const s: Solicitud = a.solicitud;
    const quien: string = (buscarCliente(s.clienteId)?.nombre ?? s.clienteId).padEnd(7);
    const que: string = `${(buscarProducto(s.sku)?.nombre ?? s.sku).padEnd(19)} ${s.talla.padEnd(2)}`;
    if (a.estado === "vendido") {
      console.log(`${hora(s.segundo)} ${quien} ${que} VENDIDO  $${a.precio.toFixed(2)}`);
    } else {
      console.log(`${hora(s.segundo)} ${quien} ${que} X ${a.motivo}: ${a.detalle}`);
    }
  }

  console.log("\n--- Reporte por producto ---");
  for (const p of productos) {
    const inicial: number = totalUnidades(p.stock);
    const quedan: number = totalUnidades(stock[p.sku] ?? p.stock);
    const vendidas: number = inicial - quedan;
    const porTalla: string = TALLAS.map((t: Talla): string => `${t}:${(stock[p.sku] ?? p.stock)[t]}`).join(" ");
    const colab: string = p.colaboracion ? ` x ${p.colaboracion.artista}` : "";
    console.log(`${(p.nombre + colab).padEnd(30)} vendidas ${vendidas}/${inicial} (${Math.round((vendidas / inicial) * 100)}%) | quedan ${porTalla}`);
  }

  const vendidos = atenciones.filter((a: Atencion): a is Extract<Atencion, { estado: "vendido" }> => a.estado === "vendido");
  const ingresos: number = vendidos.reduce((t: number, a): number => t + a.precio, 0);
  console.log(`\nVentas: ${vendidos.length} | Ingresos: $${ingresos.toFixed(2)}`);

  const motivos: Map<MotivoRechazo, number> = new Map<MotivoRechazo, number>();
  atenciones.forEach((a: Atencion): void => {
    if (a.estado === "rechazado") motivos.set(a.motivo, (motivos.get(a.motivo) ?? 0) + 1);
  });
  console.log(`Rechazos: ${[...motivos.entries()].map(([m, n]): string => `${m} (${n})`).join(", ")}`);
}

main();
