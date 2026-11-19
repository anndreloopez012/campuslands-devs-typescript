export {};

// Intermedio 17: Pedidos de food truck
// Tematica: comida
// Resolucion: Dulce Morales
//
// Problema: un food truck recibe pedidos en fila. Cada platillo usa ingredientes de un
// inventario limitado. Hay que validar cada pedido (que exista el platillo, que alcancen
// los ingredientes y que no tenga alergenos del cliente), calcular el total con
// descuento de combo y propina, estimar el tiempo de espera y cerrar el dia con un resumen.

// ===================== MODELO (objetos anidados) =====================

type Alergeno = "gluten" | "lacteos" | "mani" | "mariscos" | "huevo";
type Ingrediente = "tortilla" | "pan" | "carne" | "pollo" | "camaron" | "queso" | "papas" | "salsa";
type Categoria = "principal" | "acompanante" | "bebida";

interface Platillo {
  readonly id: string;
  readonly nombre: string;
  readonly categoria: Categoria;
  readonly precio: number;
  readonly minutosPreparacion: number;
  readonly receta: Readonly<Partial<Record<Ingrediente, number>>>; // unidades por platillo
  readonly alergenos: readonly Alergeno[];
}

interface LineaPedido {
  readonly platilloId: string;
  readonly cantidad: number;
}

interface Pedido {
  readonly numero: number;
  readonly cliente: { readonly nombre: string; readonly alergias: readonly Alergeno[] };
  readonly lineas: readonly LineaPedido[];
  readonly propinaPorcentaje: number;
}

type Inventario = Readonly<Record<Ingrediente, number>>;

interface Ticket {
  readonly pedido: Pedido;
  readonly subtotal: number;
  readonly descuento: number;
  readonly propina: number;
  readonly total: number;
  readonly minutos: number;
  readonly listoEnMin: number; // tiempo desde que abrio la fila
}

type Resultado = { readonly ok: true; readonly ticket: Ticket; readonly inventario: Inventario } | { readonly ok: false; readonly error: string };

// ===================== REGLAS =====================

const DESCUENTO_COMBO: number = 0.1; // 10% si el pedido tiene principal + acompanante + bebida
const STOCK_BAJO: number = 3;
const PROPINA_MAXIMA: number = 30;

// ===================== DATOS DE PRUEBA =====================

const menu: readonly Platillo[] = [
  { id: "TAC", nombre: "Tacos al pastor", categoria: "principal", precio: 6.5, minutosPreparacion: 5, receta: { tortilla: 3, carne: 1, salsa: 1 }, alergenos: [] },
  { id: "HAM", nombre: "Hamburguesa", categoria: "principal", precio: 8.0, minutosPreparacion: 8, receta: { pan: 1, carne: 1, queso: 1 }, alergenos: ["gluten", "lacteos"] },
  { id: "QUE", nombre: "Quesadilla de pollo", categoria: "principal", precio: 5.5, minutosPreparacion: 6, receta: { tortilla: 2, pollo: 1, queso: 1 }, alergenos: ["lacteos"] },
  { id: "CAM", nombre: "Tacos de camaron", categoria: "principal", precio: 9.0, minutosPreparacion: 7, receta: { tortilla: 3, camaron: 1, salsa: 1 }, alergenos: ["mariscos"] },
  { id: "PAP", nombre: "Papas fritas", categoria: "acompanante", precio: 3.0, minutosPreparacion: 4, receta: { papas: 1 }, alergenos: [] },
  { id: "LIM", nombre: "Limonada", categoria: "bebida", precio: 2.5, minutosPreparacion: 1, receta: {}, alergenos: [] },
];

const inventarioInicial: Inventario = { tortilla: 20, pan: 3, carne: 6, pollo: 4, camaron: 2, queso: 5, papas: 6, salsa: 8 };

const fila: readonly Pedido[] = [
  // Combo completo: principal + acompanante + bebida -> 10% de descuento
  { numero: 1, cliente: { nombre: "Ana", alergias: [] }, lineas: [{ platilloId: "TAC", cantidad: 2 }, { platilloId: "PAP", cantidad: 1 }, { platilloId: "LIM", cantidad: 2 }], propinaPorcentaje: 10 },
  { numero: 2, cliente: { nombre: "Luis", alergias: [] }, lineas: [{ platilloId: "HAM", cantidad: 2 }, { platilloId: "LIM", cantidad: 1 }], propinaPorcentaje: 15 },
  // Rechazado: la hamburguesa tiene gluten
  { numero: 3, cliente: { nombre: "Marta", alergias: ["gluten"] }, lineas: [{ platilloId: "HAM", cantidad: 1 }], propinaPorcentaje: 0 },
  // Limite: usa exactamente los 2 camarones que quedan
  { numero: 4, cliente: { nombre: "Jorge", alergias: ["lacteos"] }, lineas: [{ platilloId: "CAM", cantidad: 2 }, { platilloId: "PAP", cantidad: 1 }], propinaPorcentaje: 5 },
  // Rechazado: ya no hay camaron
  { numero: 5, cliente: { nombre: "Rosa", alergias: [] }, lineas: [{ platilloId: "CAM", cantidad: 1 }], propinaPorcentaje: 10 },
  // Rechazado: solo queda 1 pan y pide 2 hamburguesas
  { numero: 6, cliente: { nombre: "Pablo", alergias: [] }, lineas: [{ platilloId: "HAM", cantidad: 2 }], propinaPorcentaje: 10 },
  { numero: 7, cliente: { nombre: "Elena", alergias: ["mariscos"] }, lineas: [{ platilloId: "QUE", cantidad: 2 }, { platilloId: "PAP", cantidad: 2 }, { platilloId: "LIM", cantidad: 1 }], propinaPorcentaje: 20 },
  // Invalidos
  { numero: 8, cliente: { nombre: "Error", alergias: [] }, lineas: [{ platilloId: "PIZ", cantidad: 1 }], propinaPorcentaje: 10 },
  { numero: 9, cliente: { nombre: "Error", alergias: [] }, lineas: [{ platilloId: "TAC", cantidad: 0 }], propinaPorcentaje: 50 },
];

// ===================== VALIDACION =====================

function buscarPlatillo(id: string): Platillo | undefined {
  return menu.find((p: Platillo): boolean => p.id === id);
}

function validarFormato(pedido: Pedido): string | null {
  if (pedido.lineas.length === 0) return "pedido vacio";
  const desconocido: LineaPedido | undefined = pedido.lineas.find((l: LineaPedido): boolean => buscarPlatillo(l.platilloId) === undefined);
  if (desconocido !== undefined) return `el platillo ${desconocido.platilloId} no esta en el menu`;
  if (pedido.lineas.some((l: LineaPedido): boolean => !Number.isInteger(l.cantidad) || l.cantidad <= 0)) return "hay cantidades invalidas";
  if (pedido.propinaPorcentaje < 0 || pedido.propinaPorcentaje > PROPINA_MAXIMA) return `propina de ${pedido.propinaPorcentaje}% fuera de 0-${PROPINA_MAXIMA}%`;
  return null;
}

function alergenosEnConflicto(pedido: Pedido): string[] {
  return pedido.lineas.flatMap((l: LineaPedido): string[] => {
    const platillo: Platillo | undefined = buscarPlatillo(l.platilloId);
    if (platillo === undefined) return [];
    return platillo.alergenos.filter((a: Alergeno): boolean => pedido.cliente.alergias.includes(a)).map((a: Alergeno): string => `${platillo.nombre} (${a})`);
  });
}

// ===================== CALCULOS (funciones puras) =====================

const INGREDIENTES: readonly Ingrediente[] = ["tortilla", "pan", "carne", "pollo", "camaron", "queso", "papas", "salsa"];

// Total de cada ingrediente que necesita el pedido completo
function ingredientesNecesarios(pedido: Pedido): Record<Ingrediente, number> {
  const necesarios: Record<Ingrediente, number> = { tortilla: 0, pan: 0, carne: 0, pollo: 0, camaron: 0, queso: 0, papas: 0, salsa: 0 };
  for (const l of pedido.lineas) {
    const receta = buscarPlatillo(l.platilloId)?.receta ?? {};
    for (const ing of INGREDIENTES) necesarios[ing] += (receta[ing] ?? 0) * l.cantidad;
  }
  return necesarios;
}

function faltantes(necesarios: Readonly<Record<Ingrediente, number>>, inventario: Inventario): string[] {
  return INGREDIENTES.filter((ing: Ingrediente): boolean => necesarios[ing] > inventario[ing]).map(
    (ing: Ingrediente): string => `${ing} (necesita ${necesarios[ing]}, hay ${inventario[ing]})`,
  );
}

function descontar(inventario: Inventario, necesarios: Readonly<Record<Ingrediente, number>>): Inventario {
  return { tortilla: inventario.tortilla - necesarios.tortilla, pan: inventario.pan - necesarios.pan, carne: inventario.carne - necesarios.carne, pollo: inventario.pollo - necesarios.pollo, camaron: inventario.camaron - necesarios.camaron, queso: inventario.queso - necesarios.queso, papas: inventario.papas - necesarios.papas, salsa: inventario.salsa - necesarios.salsa };
}

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}

function esCombo(pedido: Pedido): boolean {
  const categorias: Set<Categoria> = new Set(pedido.lineas.map((l: LineaPedido): Categoria => buscarPlatillo(l.platilloId)?.categoria ?? "bebida"));
  return categorias.has("principal") && categorias.has("acompanante") && categorias.has("bebida");
}

// La cocina prepara un pedido a la vez; dentro del pedido el tiempo es el del platillo mas lento
// mas 1 minuto por cada unidad extra
function minutosDePedido(pedido: Pedido): number {
  const tiempos: number[] = pedido.lineas.map((l: LineaPedido): number => buscarPlatillo(l.platilloId)?.minutosPreparacion ?? 0);
  const unidades: number = pedido.lineas.reduce((t: number, l: LineaPedido): number => t + l.cantidad, 0);
  return Math.max(...tiempos) + (unidades - 1);
}

function cobrar(pedido: Pedido, inicioMin: number): Ticket {
  const subtotal: number = pedido.lineas.reduce((t: number, l: LineaPedido): number => t + (buscarPlatillo(l.platilloId)?.precio ?? 0) * l.cantidad, 0);
  const descuento: number = esCombo(pedido) ? subtotal * DESCUENTO_COMBO : 0;
  const propina: number = (subtotal - descuento) * (pedido.propinaPorcentaje / 100);
  const minutos: number = minutosDePedido(pedido);
  return {
    pedido,
    subtotal: redondear(subtotal),
    descuento: redondear(descuento),
    propina: redondear(propina),
    total: redondear(subtotal - descuento + propina),
    minutos,
    listoEnMin: inicioMin + minutos,
  };
}

function atender(pedido: Pedido, inventario: Inventario, inicioMin: number): Resultado {
  const formato: string | null = validarFormato(pedido);
  if (formato !== null) return { ok: false, error: formato };
  const alergenos: string[] = alergenosEnConflicto(pedido);
  if (alergenos.length > 0) return { ok: false, error: `alergia: ${alergenos.join(", ")}` };
  const necesarios: Record<Ingrediente, number> = ingredientesNecesarios(pedido);
  const falta: string[] = faltantes(necesarios, inventario);
  if (falta.length > 0) return { ok: false, error: `no alcanza: ${falta.join(", ")}` };
  return { ok: true, ticket: cobrar(pedido, inicioMin), inventario: descontar(inventario, necesarios) };
}

// ===================== SALIDA POR CONSOLA =====================

function dinero(v: number): string {
  return `$${v.toFixed(2)}`;
}

function main(): void {
  let inventario: Inventario = inventarioInicial;
  let reloj: number = 0;
  const tickets: Ticket[] = [];

  console.log("==================== FOOD TRUCK - SERVICIO ====================");
  for (const pedido of fila) {
    const r: Resultado = atender(pedido, inventario, reloj);
    const quien: string = `#${pedido.numero} ${pedido.cliente.nombre.padEnd(6)}`;
    if (!r.ok) {
      console.log(`${quien} X  ${r.error}`);
      continue;
    }
    inventario = r.inventario;
    reloj = r.ticket.listoEnMin;
    tickets.push(r.ticket);
    const t: Ticket = r.ticket;
    const combo: string = t.descuento > 0 ? ` - combo ${dinero(t.descuento)}` : "";
    console.log(`${quien} OK subtotal ${dinero(t.subtotal)}${combo} + propina ${dinero(t.propina)} = ${dinero(t.total)} | ${t.minutos} min, listo en el minuto ${t.listoEnMin}`);
  }

  console.log("\n==================== CIERRE DEL DIA ====================");
  const ventas: number = tickets.reduce((s: number, t: Ticket): number => s + t.total - t.propina, 0);
  const propinas: number = tickets.reduce((s: number, t: Ticket): number => s + t.propina, 0);
  console.log(`Pedidos atendidos: ${tickets.length} de ${fila.length}`);
  console.log(`Ventas: ${dinero(ventas)} | Propinas: ${dinero(propinas)} | Ticket promedio: ${dinero(tickets.length > 0 ? ventas / tickets.length : 0)}`);

  // Platillos mas vendidos
  const unidades: Map<string, number> = new Map<string, number>();
  for (const t of tickets) for (const l of t.pedido.lineas) unidades.set(l.platilloId, (unidades.get(l.platilloId) ?? 0) + l.cantidad);
  console.log("Mas vendidos:");
  const nombre = (id: string): string => buscarPlatillo(id)?.nombre ?? id;
  [...unidades.entries()]
    .sort((a, b): number => b[1] - a[1] || nombre(a[0]).localeCompare(nombre(b[0])))
    .forEach(([id, n]): void => console.log(`  ${nombre(id).padEnd(20)} ${n}`));

  console.log("Inventario al cierre:");
  INGREDIENTES.forEach((ing: Ingrediente): void => {
    const quedan: number = inventario[ing];
    const aviso: string = quedan === 0 ? "  AGOTADO" : quedan <= STOCK_BAJO ? "  stock bajo" : "";
    console.log(`  ${ing.padEnd(9)} ${String(inventarioInicial[ing]).padStart(2)} -> ${String(quedan).padStart(2)}${aviso}`);
  });
}

main();
