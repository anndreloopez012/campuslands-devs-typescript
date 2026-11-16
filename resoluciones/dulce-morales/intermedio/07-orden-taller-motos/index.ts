export {};

// Intermedio 07: Ordenes de taller de motos
// Tematica: motos y mecanica de motos
// Resolucion: Dulce Morales
//
// Problema: un taller recibe ordenes de trabajo. Cada orden tiene servicios
// (horas de mano de obra) y repuestos (que deben estar en bodega). Hay que
// validar el stock, calcular el total a cobrar, mover las ordenes por sus estados
// sin saltarse pasos y repartir la carga entre los mecanicos.

// ===================== MODELO =====================

type EstadoOrden = "recibida" | "esperando repuesto" | "en reparacion" | "lista" | "entregada";
type TipoCliente = "particular" | "frecuente" | "flota";

interface Repuesto {
  readonly codigo: string;
  readonly nombre: string;
  readonly precio: number;
}

interface LineaRepuesto {
  readonly codigo: string;
  readonly cantidad: number;
}

interface Servicio {
  readonly descripcion: string;
  readonly horas: number;
}

interface Orden {
  readonly folio: string;
  readonly cliente: string;
  readonly tipoCliente: TipoCliente;
  readonly moto: string;
  readonly mecanico: string;
  readonly servicios: readonly Servicio[];
  readonly repuestos: readonly LineaRepuesto[];
  readonly estado: EstadoOrden;
}

interface Cotizacion {
  readonly manoDeObra: number;
  readonly repuestos: number;
  readonly descuento: number;
  readonly impuesto: number;
  readonly total: number;
}

type Resultado<T> = { readonly ok: true; readonly valor: T } | { readonly ok: false; readonly error: string };

// Inventario de la bodega: codigo -> cantidad disponible
type Bodega = ReadonlyMap<string, number>;

// ===================== REGLAS =====================

const TARIFA_HORA: number = 25;
const IMPUESTO: number = 0.12;
const DESCUENTO_CLIENTE: Readonly<Record<TipoCliente, number>> = { particular: 0, frecuente: 0.1, flota: 0.15 };
const HORAS_MAXIMAS_MECANICO: number = 8;

// Transiciones permitidas: no se puede saltar de "recibida" a "entregada"
const TRANSICIONES: Readonly<Record<EstadoOrden, readonly EstadoOrden[]>> = {
  recibida: ["esperando repuesto", "en reparacion"],
  "esperando repuesto": ["en reparacion"],
  "en reparacion": ["lista"],
  lista: ["entregada"],
  entregada: [],
};

// ===================== DATOS DE PRUEBA =====================

const catalogo: readonly Repuesto[] = [
  { codigo: "R-ACE", nombre: "Aceite 10W40 (1 L)", precio: 12 },
  { codigo: "R-FIL", nombre: "Filtro de aceite", precio: 9 },
  { codigo: "R-PAS", nombre: "Pastillas de freno", precio: 38 },
  { codigo: "R-CAD", nombre: "Kit de cadena", precio: 120 },
  { codigo: "R-BUJ", nombre: "Bujia iridio", precio: 15 },
];

const bodegaInicial: Bodega = new Map<string, number>([
  ["R-ACE", 10],
  ["R-FIL", 3],
  ["R-PAS", 2],
  ["R-CAD", 0], // agotado
  ["R-BUJ", 4],
]);

const ordenes: readonly Orden[] = [
  {
    folio: "OT-101", cliente: "Andrea Lopez", tipoCliente: "particular", moto: "Yamaha MT-07", mecanico: "Raul", estado: "recibida",
    servicios: [{ descripcion: "Cambio de aceite", horas: 0.5 }, { descripcion: "Revision general", horas: 1 }],
    repuestos: [{ codigo: "R-ACE", cantidad: 3 }, { codigo: "R-FIL", cantidad: 1 }],
  },
  {
    folio: "OT-102", cliente: "Mensajeria Veloz", tipoCliente: "flota", moto: "Honda CB190R", mecanico: "Raul", estado: "recibida",
    servicios: [{ descripcion: "Cambio de frenos", horas: 1.5 }, { descripcion: "Afinacion", horas: 2 }],
    repuestos: [{ codigo: "R-PAS", cantidad: 2 }, { codigo: "R-BUJ", cantidad: 1 }],
  },
  {
    // Caso limite: el kit de cadena esta agotado
    folio: "OT-103", cliente: "Pablo Ruiz", tipoCliente: "frecuente", moto: "KTM Duke 390", mecanico: "Sofia", estado: "recibida",
    servicios: [{ descripcion: "Cambio de cadena y pinones", horas: 2 }],
    repuestos: [{ codigo: "R-CAD", cantidad: 1 }],
  },
  {
    // Caso limite: pide las ultimas 2 pastillas, pero OT-102 ya las aparto
    folio: "OT-104", cliente: "Marta Gil", tipoCliente: "particular", moto: "Suzuki GSX-S750", mecanico: "Sofia", estado: "recibida",
    servicios: [{ descripcion: "Cambio de frenos", horas: 1.5 }],
    repuestos: [{ codigo: "R-PAS", cantidad: 2 }],
  },
  {
    // Invalida: horas negativas y un repuesto que no existe
    folio: "OT-105", cliente: "Error", tipoCliente: "particular", moto: "?", mecanico: "Raul", estado: "recibida",
    servicios: [{ descripcion: "Servicio mal capturado", horas: -2 }],
    repuestos: [{ codigo: "R-XXX", cantidad: 1 }],
  },
  {
    // Carga alta: Raul ya tiene otras ordenes
    folio: "OT-106", cliente: "Mensajeria Veloz", tipoCliente: "flota", moto: "Bajaj Pulsar NS200", mecanico: "Raul", estado: "recibida",
    servicios: [{ descripcion: "Reparacion de motor", horas: 5 }],
    repuestos: [{ codigo: "R-ACE", cantidad: 3 }, { codigo: "R-BUJ", cantidad: 1 }],
  },
];

// ===================== VALIDACION =====================

function buscarRepuesto(codigo: string): Repuesto | undefined {
  return catalogo.find((r: Repuesto): boolean => r.codigo === codigo);
}

function validarOrden(orden: Orden): string[] {
  const errores: string[] = [];
  if (orden.servicios.length === 0) {
    errores.push("no tiene servicios");
  }
  for (const s of orden.servicios) {
    if (!(s.horas > 0)) errores.push(`"${s.descripcion}" tiene ${s.horas} horas`);
  }
  for (const linea of orden.repuestos) {
    if (buscarRepuesto(linea.codigo) === undefined) errores.push(`repuesto ${linea.codigo} no existe en el catalogo`);
    if (!Number.isInteger(linea.cantidad) || linea.cantidad <= 0) errores.push(`cantidad invalida de ${linea.codigo}`);
  }
  return errores;
}

function faltantes(orden: Orden, bodega: Bodega): string[] {
  return orden.repuestos
    .filter((l: LineaRepuesto): boolean => (bodega.get(l.codigo) ?? 0) < l.cantidad)
    .map((l: LineaRepuesto): string => `${l.codigo} (pide ${l.cantidad}, hay ${bodega.get(l.codigo) ?? 0})`);
}

// ===================== TRANSFORMACIONES (sin mutar) =====================

function cambiarEstado(orden: Orden, nuevo: EstadoOrden): Resultado<Orden> {
  if (!TRANSICIONES[orden.estado].includes(nuevo)) {
    return { ok: false, error: `${orden.folio}: no puede pasar de "${orden.estado}" a "${nuevo}"` };
  }
  return { ok: true, valor: { ...orden, estado: nuevo } };
}

// Aparta los repuestos: devuelve una bodega NUEVA con el stock descontado
function apartarRepuestos(orden: Orden, bodega: Bodega): Bodega {
  const nueva: Map<string, number> = new Map<string, number>(bodega);
  for (const linea of orden.repuestos) {
    nueva.set(linea.codigo, (nueva.get(linea.codigo) ?? 0) - linea.cantidad);
  }
  return nueva;
}

// ===================== CALCULOS (funciones puras) =====================

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}

function horasDeOrden(orden: Orden): number {
  return orden.servicios.reduce((total: number, s: Servicio): number => total + s.horas, 0);
}

function cotizar(orden: Orden): Cotizacion {
  const manoDeObra: number = horasDeOrden(orden) * TARIFA_HORA;
  const repuestos: number = orden.repuestos.reduce(
    (total: number, l: LineaRepuesto): number => total + (buscarRepuesto(l.codigo)?.precio ?? 0) * l.cantidad,
    0,
  );
  // El descuento solo aplica a la mano de obra, no a los repuestos
  const descuento: number = manoDeObra * DESCUENTO_CLIENTE[orden.tipoCliente];
  const subtotal: number = manoDeObra + repuestos - descuento;
  const impuesto: number = subtotal * IMPUESTO;
  return {
    manoDeObra: redondear(manoDeObra),
    repuestos: redondear(repuestos),
    descuento: redondear(descuento),
    impuesto: redondear(impuesto),
    total: redondear(subtotal + impuesto),
  };
}

function cargaPorMecanico(lista: readonly Orden[]): Map<string, number> {
  const carga: Map<string, number> = new Map<string, number>();
  for (const orden of lista) {
    if (!carga.has(orden.mecanico)) carga.set(orden.mecanico, 0); // todos aparecen, aunque tengan 0 h
    if (orden.estado === "en reparacion") {
      carga.set(orden.mecanico, (carga.get(orden.mecanico) ?? 0) + horasDeOrden(orden));
    }
  }
  return carga;
}

// ===================== PROCESO DEL DIA =====================

interface Procesada {
  readonly orden: Orden;
  readonly cotizacion: Cotizacion | null;
  readonly notas: readonly string[];
}

// Procesa cada orden en orden de llegada, apartando stock y respetando las transiciones
function procesarDia(lista: readonly Orden[], bodegaInicio: Bodega): { procesadas: Procesada[]; bodega: Bodega } {
  let bodega: Bodega = bodegaInicio;
  const procesadas: Procesada[] = [];

  for (const orden of lista) {
    const errores: string[] = validarOrden(orden);
    if (errores.length > 0) {
      procesadas.push({ orden, cotizacion: null, notas: errores.map((e: string): string => `rechazada: ${e}`) });
      continue;
    }

    const falta: string[] = faltantes(orden, bodega);
    const destino: EstadoOrden = falta.length > 0 ? "esperando repuesto" : "en reparacion";
    const cambio: Resultado<Orden> = cambiarEstado(orden, destino);
    if (!cambio.ok) {
      procesadas.push({ orden, cotizacion: null, notas: [cambio.error] });
      continue;
    }
    if (falta.length === 0) {
      bodega = apartarRepuestos(orden, bodega);
    }
    procesadas.push({
      orden: cambio.valor,
      cotizacion: cotizar(orden),
      notas: falta.map((f: string): string => `falta ${f}`),
    });
  }
  return { procesadas, bodega };
}

// ===================== SALIDA POR CONSOLA =====================

function dinero(valor: number): string {
  return `$${valor.toFixed(2)}`;
}

function main(): void {
  const { procesadas, bodega } = procesarDia(ordenes, bodegaInicial);

  console.log("================= ORDENES DEL DIA =================");
  for (const p of procesadas) {
    const o: Orden = p.orden;
    console.log(`\n${o.folio} | ${o.cliente} (${o.tipoCliente}) | ${o.moto} | mecanico: ${o.mecanico}`);
    console.log(`  Estado: ${o.estado}`);
    if (p.cotizacion !== null) {
      const c: Cotizacion = p.cotizacion;
      console.log(`  Mano de obra ${dinero(c.manoDeObra)} + repuestos ${dinero(c.repuestos)} - descuento ${dinero(c.descuento)} + impuesto ${dinero(c.impuesto)} = ${dinero(c.total)}`);
    }
    p.notas.forEach((n: string): void => console.log(`  ! ${n}`));
  }

  console.log("\n================= CARGA DE MECANICOS =================");
  const carga: Map<string, number> = cargaPorMecanico(procesadas.map((p: Procesada): Orden => p.orden));
  for (const [mecanico, horas] of carga) {
    const aviso: string = horas > HORAS_MAXIMAS_MECANICO ? `  << sobrecargado (max ${HORAS_MAXIMAS_MECANICO} h)` : "";
    console.log(`${mecanico.padEnd(6)} ${horas} h${aviso}`);
  }

  console.log("\n================= BODEGA AL CIERRE =================");
  for (const [codigo, cantidad] of bodega) {
    const inicial: number = bodegaInicial.get(codigo) ?? 0;
    console.log(`${codigo.padEnd(6)} ${String(inicial).padStart(2)} -> ${String(cantidad).padStart(2)}${cantidad === 0 ? "  (agotado)" : ""}`);
  }

  console.log("\n================= FLUJO DE ESTADOS =================");
  const primera: Procesada | undefined = procesadas[0];
  if (primera !== undefined) {
    const saltoInvalido: Resultado<Orden> = cambiarEstado(primera.orden, "entregada");
    console.log(saltoInvalido.ok ? "salto permitido" : `X ${saltoInvalido.error}`);
    const lista: Resultado<Orden> = cambiarEstado(primera.orden, "lista");
    if (lista.ok) {
      const entregada: Resultado<Orden> = cambiarEstado(lista.valor, "entregada");
      console.log(entregada.ok ? `OK ${entregada.valor.folio}: en reparacion -> lista -> entregada` : entregada.error);
    }
  }

  const totalDia: number = procesadas.reduce(
    (total: number, p: Procesada): number => (p.orden.estado === "en reparacion" && p.cotizacion !== null ? total + p.cotizacion.total : total),
    0,
  );
  console.log(`\nIngreso esperado de ordenes en reparacion: ${dinero(redondear(totalDia))}`);
}

main();
