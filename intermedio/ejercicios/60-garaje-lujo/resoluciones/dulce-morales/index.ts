export {};

// Intermedio 60: Garaje de lujo
// Tematica: autos de lujo
// Resolucion: Dulce Morales
//
// Problema: un coleccionista quiere actualizar el valor de su garaje. Un servicio de tasacion
// remoto (simulado) valua cada auto, pero solo acepta 2 consultas a la vez. Si no tiene datos de un
// auto, se usa el ultimo valor conocido. Tambien se revisan los seguros: el aseguradora responde de
// forma asincrona y avisa si una poliza vence pronto o si el valor asegurado quedo por debajo del
// valor real. Todo se informa con eventos tipados.

// ===================== TIPOS =====================

interface AutoColeccion {
  readonly id: string;
  readonly marca: string;
  readonly modelo: string;
  readonly anio: number;
  readonly ultimoValor: number; // USD, de la tasacion anterior
  readonly valorAsegurado: number;
  readonly polizaVence: Date;
}

interface Tasacion {
  readonly auto: AutoColeccion;
  readonly valor: number;
  readonly fuente: "mercado" | "ultimo valor conocido";
}

// ===================== ERRORES Y EVENTOS TIPADOS =====================

class ErrorTasacion extends Error {
  constructor(public readonly autoId: string, motivo: string) {
    super(`${autoId}: ${motivo}`);
    this.name = "ErrorTasacion";
  }
}

interface EventosGaraje {
  "tasacion iniciada": { readonly autoId: string; readonly enCurso: number };
  "alerta seguro": { readonly autoId: string; readonly motivo: string };
}

class Emisor<E> {
  private readonly oyentes: { [K in keyof E]?: ((d: E[K]) => void)[] } = {};
  on<K extends keyof E>(e: K, fn: (d: E[K]) => void): void {
    (this.oyentes[e] ??= []).push(fn);
  }
  emit<K extends keyof E>(e: K, d: E[K]): void {
    this.oyentes[e]?.forEach((fn) => fn(d));
  }
}

// ===================== LIMITE DE CONCURRENCIA (generico) =====================

// Procesa los elementos con "limite" tareas a la vez como maximo; respeta el orden del resultado
async function conLimite<T, R>(items: readonly T[], limite: number, tarea: (item: T) => Promise<R>): Promise<PromiseSettledResult<R>[]> {
  const resultados: PromiseSettledResult<R>[] = new Array(items.length);
  let siguiente: number = 0;
  async function trabajador(): Promise<void> {
    while (siguiente < items.length) {
      const i: number = siguiente++;
      const item: T | undefined = items[i];
      if (item === undefined) continue;
      try {
        resultados[i] = { status: "fulfilled", value: await tarea(item) };
      } catch (e: unknown) {
        resultados[i] = { status: "rejected", reason: e };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limite, items.length) }, () => trabajador()));
  return resultados;
}

// ===================== SERVICIOS SIMULADOS =====================

const esperar = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

// Cambio de valor en el mercado desde la ultima tasacion (null = sin datos de mercado)
const MERCADO: ReadonlyMap<string, number | null> = new Map([
  ["G1", 0.12], ["G2", -0.05], ["G3", 0.3], ["G4", null], ["G5", 0.02], ["G6", 0.08],
]);

class ServicioTasacion {
  private enCurso: number = 0;
  public maximoSimultaneo: number = 0;

  constructor(private readonly eventos: Emisor<EventosGaraje>) {}

  async tasar(a: AutoColeccion): Promise<number> {
    this.enCurso += 1;
    this.maximoSimultaneo = Math.max(this.maximoSimultaneo, this.enCurso);
    this.eventos.emit("tasacion iniciada", { autoId: a.id, enCurso: this.enCurso });
    try {
      await esperar(20);
      const cambio: number | null | undefined = MERCADO.get(a.id);
      if (cambio === null || cambio === undefined) throw new ErrorTasacion(a.id, "sin ventas recientes en el mercado");
      return Math.round(a.ultimoValor * (1 + cambio));
    } finally {
      this.enCurso -= 1;
    }
  }
}

async function revisarSeguro(a: AutoColeccion, valorReal: number, hoy: Date, eventos: Emisor<EventosGaraje>): Promise<void> {
  await esperar(5);
  const dias: number = Math.round((a.polizaVence.getTime() - hoy.getTime()) / 86_400_000);
  if (dias < 0) eventos.emit("alerta seguro", { autoId: a.id, motivo: `poliza VENCIDA hace ${-dias} dia(s)` });
  else if (dias <= 30) eventos.emit("alerta seguro", { autoId: a.id, motivo: `poliza vence en ${dias} dia(s)` });
  // Infraseguro: asegurado por menos del 90% del valor real
  if (a.valorAsegurado < valorReal * 0.9) {
    eventos.emit("alerta seguro", { autoId: a.id, motivo: `asegurado por $${a.valorAsegurado.toLocaleString("en-US")} y vale $${valorReal.toLocaleString("en-US")} (infraseguro)` });
  }
}

// ===================== DATOS Y SALIDA =====================

function f(mes: number, dia: number, anio: number = 2026): Date {
  return new Date(anio, mes - 1, dia);
}

const garaje: readonly AutoColeccion[] = [
  { id: "G1", marca: "Ferrari", modelo: "250 GTO", anio: 1962, ultimoValor: 48_000_000, valorAsegurado: 50_000_000, polizaVence: f(6, 1, 2027) },
  { id: "G2", marca: "Porsche", modelo: "911 Carrera RS", anio: 1973, ultimoValor: 1_200_000, valorAsegurado: 1_150_000, polizaVence: f(12, 16) }, // limite: vence en 30 dias EXACTOS
  { id: "G3", marca: "Lamborghini", modelo: "Miura P400", anio: 1967, ultimoValor: 2_500_000, valorAsegurado: 2_500_000, polizaVence: f(3, 10, 2027) }, // subio 30% -> infraseguro
  { id: "G4", marca: "Bugatti", modelo: "EB110", anio: 1993, ultimoValor: 3_000_000, valorAsegurado: 3_100_000, polizaVence: f(11, 10) }, // sin datos de mercado y poliza vencida
  { id: "G5", marca: "Mercedes", modelo: "300 SL Gullwing", anio: 1955, ultimoValor: 1_600_000, valorAsegurado: 1_700_000, polizaVence: f(1, 20, 2027) },
  { id: "G6", marca: "Aston Martin", modelo: "DB5", anio: 1964, ultimoValor: 1_100_000, valorAsegurado: 1_100_000, polizaVence: f(9, 1, 2027) }, // limite: 1,188,000 x 0.9 = 1,069,200 < 1,100,000 -> no es infraseguro
];

async function main(): Promise<void> {
  const eventos: Emisor<EventosGaraje> = new Emisor<EventosGaraje>();
  const servicio: ServicioTasacion = new ServicioTasacion(eventos);
  const hoy: Date = f(11, 16);

  console.log("================ TASACION (maximo 2 consultas a la vez) ================");
  eventos.on("tasacion iniciada", ({ autoId, enCurso }) => console.log(`  > tasando ${autoId} (${enCurso} en curso)`));
  const resultados = await conLimite(garaje, 2, (a) => servicio.tasar(a));

  const tasaciones: Tasacion[] = garaje.map((auto: AutoColeccion, i: number): Tasacion => {
    const r: PromiseSettledResult<number> | undefined = resultados[i];
    if (r?.status === "fulfilled") return { auto, valor: r.value, fuente: "mercado" };
    if (r?.reason instanceof ErrorTasacion) console.log(`  ! [${r.reason.name}] ${r.reason.message}: se usa el ultimo valor conocido`);
    return { auto, valor: auto.ultimoValor, fuente: "ultimo valor conocido" };
  });
  console.log(`  Maximo de consultas simultaneas: ${servicio.maximoSimultaneo}`);

  console.log("\n================ VALOR DE LA COLECCION ================");
  let total: number = 0;
  let antes: number = 0;
  for (const t of [...tasaciones].sort((a, b) => b.valor - a.valor)) {
    const a: AutoColeccion = t.auto;
    const cambio: number = Math.round(((t.valor - a.ultimoValor) / a.ultimoValor) * 1000) / 10;
    total += t.valor;
    antes += a.ultimoValor;
    console.log(`${`${a.marca} ${a.modelo}`.padEnd(24)} ${a.anio}  $${t.valor.toLocaleString("en-US").padStart(10)}  ${cambio >= 0 ? "+" : ""}${cambio}%${t.fuente === "mercado" ? "" : "  (ultimo valor conocido)"}`);
  }
  console.log(`Total: $${total.toLocaleString("en-US")} (antes $${antes.toLocaleString("en-US")}, ${total >= antes ? "+" : ""}${Math.round(((total - antes) / antes) * 1000) / 10}%)`);

  console.log("\n================ REVISION DE SEGUROS ================");
  const alertas: string[] = [];
  eventos.on("alerta seguro", ({ autoId, motivo }) => alertas.push(`${autoId}: ${motivo}`));
  await Promise.all(tasaciones.map((t) => revisarSeguro(t.auto, t.valor, hoy, eventos)));
  alertas.sort().forEach((a) => console.log(`! ${a}`));
}

main();
