export {};

// Intermedio 69: Reservas de cine DOM
// Tematica: peliculas
// Resolucion: Dulce Morales
//
// Problema: la pantalla de reserva de asientos de un cine. La sala es una cuadricula de botones
// (simulada en consola, sin navegador) y cada clic es un evento que entra a un reducer puro.
// La compra es una maquina de estados: eligiendo -> pagando -> confirmada, con un temporizador
// que libera los asientos si el pago no llega a tiempo.

// ===================== TIPOS =====================

type Fila = "A" | "B" | "C" | "D" | "E";
type TipoBoleto = "adulto" | "nino" | "estudiante";
type IdAsiento = `${Fila}${number}`;

interface Funcion {
  readonly pelicula: string;
  readonly sala: number;
  readonly hora: string;
  readonly precioBase: number;
  readonly filasVip: readonly Fila[];
}

// Lo que ya estaba vendido antes de que la persona abriera la pantalla
interface Sala {
  readonly filas: readonly Fila[];
  readonly columnas: number;
  readonly vendidos: ReadonlySet<IdAsiento>;
}

type Compra =
  | { readonly fase: "eligiendo"; readonly elegidos: readonly IdAsiento[] }
  | { readonly fase: "pagando"; readonly elegidos: readonly IdAsiento[]; readonly boletos: Readonly<Record<TipoBoleto, number>>; readonly expiraEn: number }
  | { readonly fase: "confirmada"; readonly elegidos: readonly IdAsiento[]; readonly total: number; readonly codigo: string }
  | { readonly fase: "expirada" };

interface Estado {
  readonly compra: Compra;
  readonly segundos: number; // reloj simulado
  readonly aviso: string | null;
}

type Evento =
  | { readonly tipo: "CLIC_ASIENTO"; readonly id: IdAsiento }
  | { readonly tipo: "CONTINUAR"; readonly boletos: Readonly<Record<TipoBoleto, number>> }
  | { readonly tipo: "PAGAR" }
  | { readonly tipo: "VOLVER" }
  | { readonly tipo: "TICK"; readonly segundos: number };

// ===================== REGLAS =====================

const MAX_ASIENTOS: number = 6;
const TIEMPO_PAGO_SEG: number = 300; // 5 minutos para pagar
const RECARGO_VIP: number = 1.5;
const DESCUENTO: Readonly<Record<TipoBoleto, number>> = { adulto: 0, nino: 0.4, estudiante: 0.25 };

const funcion: Funcion = { pelicula: "Nebulosa Roja", sala: 3, hora: "19:30", precioBase: 80, filasVip: ["E"] };

const sala: Sala = {
  filas: ["A", "B", "C", "D", "E"],
  columnas: 8,
  vendidos: new Set<IdAsiento>(["C4", "C5", "D1", "D2", "D3", "E7", "E8", "B6"]),
};

// ===================== AYUDAS PURAS =====================

function partes(id: IdAsiento): { fila: Fila; col: number } | null {
  const fila: string = id.charAt(0);
  const col: number = Number(id.slice(1));
  const f: Fila | undefined = sala.filas.find((x) => x === fila);
  if (f === undefined || !Number.isInteger(col) || col < 1 || col > sala.columnas) return null;
  return { fila: f, col };
}

function ocupado(id: IdAsiento, elegidos: readonly IdAsiento[]): boolean {
  return sala.vendidos.has(id) || elegidos.includes(id);
}

// Regla de cine: no dejar un asiento libre suelto entre dos ocupados (o entre ocupado y pared)
function dejaHuecoSuelto(fila: Fila, elegidos: readonly IdAsiento[]): boolean {
  const lleno = (c: number): boolean => c < 1 || c > sala.columnas || ocupado(`${fila}${c}`, elegidos);
  const hayElegidosEnFila: boolean = elegidos.some((e) => e.startsWith(fila));
  if (!hayElegidosEnFila) return false;
  for (let c = 1; c <= sala.columnas; c++) {
    if (!lleno(c) && lleno(c - 1) && lleno(c + 1)) {
      // Solo cuenta si el hueco esta junto a un asiento elegido ahora (no culpa de ventas anteriores)
      const vecinoElegido: boolean = elegidos.includes(`${fila}${c - 1}`) || elegidos.includes(`${fila}${c + 1}`);
      if (vecinoElegido) return true;
    }
  }
  return false;
}

function precioAsiento(id: IdAsiento): number {
  const p = partes(id);
  return p !== null && funcion.filasVip.includes(p.fila) ? funcion.precioBase * RECARGO_VIP : funcion.precioBase;
}

// Para no regalar VIP con descuento, se ordenan los asientos de menor a mayor precio y los boletos con descuento toman los mas baratos.
function calcularTotal(elegidos: readonly IdAsiento[], boletos: Readonly<Record<TipoBoleto, number>>): number {
  const precios: number[] = elegidos.map(precioAsiento).sort((a, b) => a - b);
  const tipos: TipoBoleto[] = [
    ...Array<TipoBoleto>(boletos.nino).fill("nino"),
    ...Array<TipoBoleto>(boletos.estudiante).fill("estudiante"),
    ...Array<TipoBoleto>(boletos.adulto).fill("adulto"),
  ];
  return precios.reduce((acc, p, i) => acc + p * (1 - DESCUENTO[tipos[i] ?? "adulto"]), 0);
}

function codigoReserva(elegidos: readonly IdAsiento[], t: number): string {
  const base: number = elegidos.join("").split("").reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 99991, t);
  return `NR-${funcion.sala}-${String(base).padStart(5, "0")}`;
}

// ===================== REDUCER PURO =====================

function reducer(s: Estado, e: Evento): Estado {
  const c: Compra = s.compra;
  const aviso = (texto: string): Estado => ({ ...s, aviso: texto });
  const con = (compra: Compra): Estado => ({ ...s, compra, aviso: null });

  switch (e.tipo) {
    case "CLIC_ASIENTO": {
      if (c.fase !== "eligiendo") return aviso(`no se pueden cambiar asientos en la fase "${c.fase}"`);
      const p = partes(e.id);
      if (p === null) return aviso(`el asiento ${e.id} no existe`);
      if (sala.vendidos.has(e.id)) return aviso(`${e.id} ya esta vendido`);
      const yaElegido: boolean = c.elegidos.includes(e.id);
      const elegidos: IdAsiento[] = yaElegido ? c.elegidos.filter((x) => x !== e.id) : [...c.elegidos, e.id];
      if (!yaElegido && elegidos.length > MAX_ASIENTOS) return aviso(`maximo ${MAX_ASIENTOS} asientos por compra`);
      return con({ fase: "eligiendo", elegidos });
    }

    case "CONTINUAR": {
      if (c.fase !== "eligiendo") return aviso("solo se continua desde la eleccion de asientos");
      if (c.elegidos.length === 0) return aviso("elige al menos un asiento");
      const filas: Set<Fila> = new Set(c.elegidos.map((id) => partes(id)?.fila).filter((f): f is Fila => f !== undefined));
      const conHueco: Fila | undefined = [...filas].find((f) => dejaHuecoSuelto(f, c.elegidos));
      if (conHueco !== undefined) return aviso(`la fila ${conHueco} quedaria con un asiento suelto`);
      const cantidad: number = e.boletos.adulto + e.boletos.nino + e.boletos.estudiante;
      if (cantidad !== c.elegidos.length) return aviso(`hay ${c.elegidos.length} asientos pero ${cantidad} boletos`);
      if (e.boletos.nino > 0 && e.boletos.adulto === 0) return aviso("los ninos deben ir con al menos un adulto");
      return con({ fase: "pagando", elegidos: c.elegidos, boletos: e.boletos, expiraEn: s.segundos + TIEMPO_PAGO_SEG });
    }

    case "VOLVER":
      if (c.fase !== "pagando") return aviso("no hay pago que cancelar");
      return con({ fase: "eligiendo", elegidos: c.elegidos });

    case "PAGAR":
      if (c.fase !== "pagando") return aviso("no hay nada que pagar");
      return con({ fase: "confirmada", elegidos: c.elegidos, total: calcularTotal(c.elegidos, c.boletos), codigo: codigoReserva(c.elegidos, s.segundos) });

    case "TICK": {
      const segundos: number = s.segundos + e.segundos;
      if (c.fase === "pagando" && segundos >= c.expiraEn) {
        return { compra: { fase: "expirada" }, segundos, aviso: "se acabo el tiempo, los asientos se liberaron" };
      }
      return { ...s, segundos, aviso: null };
    }
  }
}

// ===================== "DOM" SIMULADO =====================

// Lo que en el navegador serian los botones con su clase CSS; aqui una letra por asiento
function claseAsiento(id: IdAsiento, c: Compra): "vendido" | "elegido" | "vip" | "libre" {
  if (sala.vendidos.has(id)) return "vendido";
  if (c.fase !== "expirada" && c.elegidos.includes(id)) return "elegido";
  const p = partes(id);
  return p !== null && funcion.filasVip.includes(p.fila) ? "vip" : "libre";
}

const SIMBOLO: Readonly<Record<ReturnType<typeof claseAsiento>, string>> = { vendido: "X", elegido: "#", vip: "V", libre: "." };

function renderSala(c: Compra): string {
  const encabezado: string = "    " + Array.from({ length: sala.columnas }, (_, i) => String(i + 1)).join(" ");
  const filas: string[] = sala.filas.map((f) => {
    const celdas: string[] = Array.from({ length: sala.columnas }, (_, i) => SIMBOLO[claseAsiento(`${f}${i + 1}`, c)]);
    return `  ${f} ${celdas.join(" ")}`;
  });
  return [`  ======= PANTALLA =======`, encabezado, ...filas, `  (. libre  V vip  # elegido  X vendido)`].join("\n");
}

function renderEstado(s: Estado): string {
  const c: Compra = s.compra;
  switch (c.fase) {
    case "eligiendo": return `eligiendo: [${c.elegidos.join(", ")}]`;
    case "pagando": return `pagando: [${c.elegidos.join(", ")}] quedan ${c.expiraEn - s.segundos}s`;
    case "confirmada": return `CONFIRMADA ${c.codigo}: [${c.elegidos.join(", ")}] total $${c.total.toFixed(2)}`;
    case "expirada": return "expirada";
  }
}

// ===================== SESIONES =====================

function correr(titulo: string, eventos: readonly [string, Evento][]): Estado {
  console.log(`\n--- ${titulo} ---`);
  let s: Estado = { compra: { fase: "eligiendo", elegidos: [] }, segundos: 0, aviso: null };
  for (const [nombre, ev] of eventos) {
    s = reducer(s, ev);
    console.log(`${nombre.padEnd(38)} ${renderEstado(s)}${s.aviso ? `  (${s.aviso})` : ""}`);
  }
  return s;
}

const clic = (id: IdAsiento): Evento => ({ tipo: "CLIC_ASIENTO", id });
const boletos = (adulto: number, nino: number, estudiante: number): Evento => ({ tipo: "CONTINUAR", boletos: { adulto, nino, estudiante } });

function main(): void {
  console.log(`${funcion.pelicula} | Sala ${funcion.sala} | ${funcion.hora} | base $${funcion.precioBase} (VIP x${RECARGO_VIP})`);
  console.log(renderSala({ fase: "eligiendo", elegidos: [] }));

  const familia: Estado = correr("Compra familiar", [
    ["clic C4 (vendido)", clic("C4")],
    ["clic A9 (no existe)", clic("A9")],
    ["CONTINUAR sin asientos", boletos(1, 0, 0)],
    ["clic C6", clic("C6")],
    ["clic C7", clic("C7")],
    ["CONTINUAR (C8 queda suelto)", boletos(2, 0, 0)],
    ["clic C8", clic("C8")],
    ["CONTINUAR 3 asientos con 2 boletos", boletos(2, 0, 0)],
    ["CONTINUAR solo ninos", boletos(0, 3, 0)],
    ["CONTINUAR 1 adulto + 2 ninos", boletos(1, 2, 0)],
    ["clic D5 (ya pagando)", clic("D5")],
    ["TICK 120s", { tipo: "TICK", segundos: 120 }],
    ["PAGAR", { tipo: "PAGAR" }],
  ]);
  console.log(renderSala(familia.compra));

  correr("Pago que se vence", [
    ["clic E3 (VIP)", clic("E3")],
    ["clic E4 (VIP)", clic("E4")],
    ["CONTINUAR 1 adulto + 1 estudiante", boletos(1, 0, 1)],
    ["TICK 299s (limite: falta 1s)", { tipo: "TICK", segundos: 299 }],
    ["VOLVER", { tipo: "VOLVER" }],
    ["CONTINUAR otra vez (reloj nuevo)", boletos(1, 0, 1)],
    ["TICK 300s (limite: justo 5 min)", { tipo: "TICK", segundos: 300 }],
    ["PAGAR tarde", { tipo: "PAGAR" }],
  ]);

  correr("Grupo grande", [
    ...(["A1", "A2", "A3", "A4", "A5", "A6"] as const).map((id): [string, Evento] => [`clic ${id}`, clic(id)]),
    ["clic A7 (septimo)", clic("A7")],
    ["clic A6 (lo quita)", clic("A6")],
    ["clic A7", clic("A7")],
    ["CONTINUAR (A6 queda suelto)", boletos(6, 0, 0)],
  ]);
}

main();
