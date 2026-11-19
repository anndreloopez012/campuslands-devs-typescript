export {};

// Intermedio 23: Comisiones de dibujo
// Tematica: dibujo e ilustracion
// Resolucion: Dulce Morales
//
// Problema: una ilustradora recibe pedidos de dibujos por encargo (comisiones).
// Hay que cotizar cada pedido (tipo de dibujo, personajes extra, fondo, revisiones extra),
// rechazar lo que no acepta, organizar la cola de trabajo respetando cuantos dias tarda
// cada dibujo, avisar cuales no llegan a la fecha que pidio el cliente y resumir ganancias.

// ===================== MODELO =====================

type TipoDibujo = "boceto" | "lineart" | "color plano" | "full render";
type Fondo = "ninguno" | "simple" | "detallado";
type Estado = "cotizada" | "anticipo pagado" | "rechazada";

interface Comision {
  readonly id: string;
  readonly cliente: string;
  readonly tipo: TipoDibujo;
  readonly personajes: number;
  readonly fondo: Fondo;
  readonly revisionesPedidas: number;
  readonly tema: string;
  readonly diasLimite: number; // dias desde hoy en que el cliente lo necesita
  readonly anticipoPagado: boolean;
  readonly usoComercial: boolean;
}

interface Cotizacion {
  readonly base: number;
  readonly extras: number;
  readonly revisionesExtra: number;
  readonly comercial: number;
  readonly total: number;
  readonly anticipo: number;
  readonly diasTrabajo: number;
}

interface Planificada {
  readonly comision: Comision;
  readonly cotizacion: Cotizacion;
  readonly estado: Estado;
  readonly inicioDia: number | null; // null = aun no entra a la cola (falta anticipo)
  readonly entregaDia: number | null;
}

// ===================== REGLAS (Record y Set) =====================

const PRECIO_BASE: Readonly<Record<TipoDibujo, number>> = { boceto: 25, lineart: 45, "color plano": 80, "full render": 150 };
const DIAS_BASE: Readonly<Record<TipoDibujo, number>> = { boceto: 1, lineart: 2, "color plano": 3, "full render": 5 };
const REVISIONES_INCLUIDAS: Readonly<Record<TipoDibujo, number>> = { boceto: 1, lineart: 2, "color plano": 2, "full render": 3 };
const PRECIO_FONDO: Readonly<Record<Fondo, number>> = { ninguno: 0, simple: 20, detallado: 60 };
const DIAS_FONDO: Readonly<Record<Fondo, number>> = { ninguno: 0, simple: 0.5, detallado: 2 };

const PERSONAJE_EXTRA: number = 0.6; // cada personaje extra cuesta 60% del precio base
const DIAS_PERSONAJE_EXTRA: number = 1;
const PRECIO_REVISION_EXTRA: number = 15;
const RECARGO_COMERCIAL: number = 1.0; // uso comercial: +100% del precio base
const PORCENTAJE_ANTICIPO: number = 0.5;
const MAX_PERSONAJES: number = 5;

// Temas que la ilustradora no acepta
const TEMAS_RECHAZADOS: ReadonlySet<string> = new Set(["gore", "fan art de marca registrada", "contenido politico"]);

// ===================== VALIDACION =====================

function validar(c: Comision): string[] {
  const errores: string[] = [];
  if (!Number.isInteger(c.personajes) || c.personajes < 1 || c.personajes > MAX_PERSONAJES) errores.push(`personajes: ${c.personajes} (1-${MAX_PERSONAJES})`);
  if (!Number.isInteger(c.revisionesPedidas) || c.revisionesPedidas < 0) errores.push("revisiones invalidas");
  if (c.diasLimite <= 0) errores.push("fecha limite invalida");
  if (TEMAS_RECHAZADOS.has(c.tema)) errores.push(`no acepta el tema "${c.tema}"`);
  return errores;
}

// ===================== CALCULOS (funciones puras) =====================

function cotizar(c: Comision): Cotizacion {
  const base: number = PRECIO_BASE[c.tipo];
  const extras: number = base * PERSONAJE_EXTRA * (c.personajes - 1) + PRECIO_FONDO[c.fondo];
  const revisionesExtra: number = Math.max(0, c.revisionesPedidas - REVISIONES_INCLUIDAS[c.tipo]) * PRECIO_REVISION_EXTRA;
  const comercial: number = c.usoComercial ? base * RECARGO_COMERCIAL : 0;
  const total: number = base + extras + revisionesExtra + comercial;
  const diasTrabajo: number = DIAS_BASE[c.tipo] + DIAS_PERSONAJE_EXTRA * (c.personajes - 1) + DIAS_FONDO[c.fondo];
  return { base, extras, revisionesExtra, comercial, total, anticipo: total * PORCENTAJE_ANTICIPO, diasTrabajo };
}

// Cola de trabajo: solo entran las que pagaron anticipo. Se ordenan por fecha limite
// (la mas urgente primero) y se trabajan una tras otra.
function planificar(lista: readonly Comision[]): { plan: Planificada[]; rechazadas: { c: Comision; errores: string[] }[] } {
  const rechazadas: { c: Comision; errores: string[] }[] = [];
  const validas: Comision[] = lista.filter((c: Comision): boolean => {
    const errores: string[] = validar(c);
    if (errores.length > 0) rechazadas.push({ c, errores });
    return errores.length === 0;
  });

  const enCola: Comision[] = validas
    .filter((c: Comision): boolean => c.anticipoPagado)
    .sort((a: Comision, b: Comision): number => a.diasLimite - b.diasLimite || a.id.localeCompare(b.id));

  let dia: number = 0;
  const plan: Planificada[] = enCola.map((c: Comision): Planificada => {
    const cotizacion: Cotizacion = cotizar(c);
    const inicio: number = dia;
    dia += cotizacion.diasTrabajo;
    return { comision: c, cotizacion, estado: "anticipo pagado", inicioDia: inicio, entregaDia: dia };
  });

  const sinAnticipo: Planificada[] = validas
    .filter((c: Comision): boolean => !c.anticipoPagado)
    .map((c: Comision): Planificada => ({ comision: c, cotizacion: cotizar(c), estado: "cotizada", inicioDia: null, entregaDia: null }));

  return { plan: [...plan, ...sinAnticipo], rechazadas };
}

// ===================== DATOS DE PRUEBA =====================

const pedidos: readonly Comision[] = [
  { id: "C01", cliente: "Andrea", tipo: "color plano", personajes: 1, fondo: "simple", revisionesPedidas: 2, tema: "retrato de mascota", diasLimite: 7, anticipoPagado: true, usoComercial: false },
  { id: "C02", cliente: "Estudio Nube", tipo: "full render", personajes: 2, fondo: "detallado", revisionesPedidas: 4, tema: "portada de libro", diasLimite: 30, anticipoPagado: true, usoComercial: true },
  { id: "C03", cliente: "Bruno", tipo: "boceto", personajes: 3, fondo: "ninguno", revisionesPedidas: 1, tema: "personajes de rol", diasLimite: 4, anticipoPagado: true, usoComercial: false },
  // Limite: la fecha limite es justo el dia en que se entregaria
  { id: "C04", cliente: "Andrea", tipo: "lineart", personajes: 1, fondo: "ninguno", revisionesPedidas: 0, tema: "tatuaje", diasLimite: 8.5, anticipoPagado: true, usoComercial: false },
  // Sin anticipo: queda cotizada, fuera de la cola
  { id: "C05", cliente: "Carla", tipo: "full render", personajes: 1, fondo: "simple", revisionesPedidas: 3, tema: "avatar", diasLimite: 15, anticipoPagado: false, usoComercial: false },
  // No llega a tiempo: pide algo grande con poco plazo
  { id: "C06", cliente: "Diego", tipo: "full render", personajes: 4, fondo: "detallado", revisionesPedidas: 3, tema: "poster de banda", diasLimite: 12, anticipoPagado: true, usoComercial: true },
  // Rechazadas
  { id: "C07", cliente: "Eva", tipo: "color plano", personajes: 1, fondo: "ninguno", revisionesPedidas: 1, tema: "gore", diasLimite: 10, anticipoPagado: true, usoComercial: false },
  { id: "C08", cliente: "Fede", tipo: "lineart", personajes: 8, fondo: "simple", revisionesPedidas: -1, tema: "grupo de amigos", diasLimite: 10, anticipoPagado: true, usoComercial: false },
];

// ===================== SALIDA POR CONSOLA =====================

function dinero(v: number): string {
  return `$${v.toFixed(2)}`;
}

function main(): void {
  const { plan, rechazadas } = planificar(pedidos);

  console.log("====================== COLA DE COMISIONES ======================");
  plan
    .filter((p: Planificada): boolean => p.inicioDia !== null)
    .forEach((p: Planificada, i: number): void => {
      const c: Comision = p.comision;
      const q: Cotizacion = p.cotizacion;
      const entrega: number = p.entregaDia ?? 0;
      const aTiempo: string = entrega <= c.diasLimite ? "a tiempo" : `ATRASADA ${entrega - c.diasLimite} dia(s)`;
      console.log(`${i + 1}. ${c.id} ${c.cliente.padEnd(12)} ${c.tipo.padEnd(11)} ${c.personajes} pj, fondo ${c.fondo.padEnd(9)} | dias ${String(p.inicioDia).padStart(4)} -> ${String(entrega).padStart(4)} (limite ${c.diasLimite}) ${aTiempo}`);
      const partes: string[] = [`base ${dinero(q.base)}`];
      if (q.extras > 0) partes.push(`extras ${dinero(q.extras)}`);
      if (q.revisionesExtra > 0) partes.push(`revisiones ${dinero(q.revisionesExtra)}`);
      if (q.comercial > 0) partes.push(`comercial ${dinero(q.comercial)}`);
      console.log(`     ${partes.join(" + ")} = ${dinero(q.total)} (anticipo ${dinero(q.anticipo)} pagado)`);
    });

  console.log("\n--- Cotizadas sin anticipo (no entran a la cola) ---");
  plan
    .filter((p: Planificada): boolean => p.estado === "cotizada")
    .forEach((p: Planificada): void => console.log(`${p.comision.id} ${p.comision.cliente}: ${dinero(p.cotizacion.total)}, necesita anticipo de ${dinero(p.cotizacion.anticipo)}`));

  console.log("\n--- Rechazadas ---");
  rechazadas.forEach(({ c, errores }): void => console.log(`${c.id} ${c.cliente}: ${errores.join("; ")}`));

  // Agrupacion con Map (por cliente) y Record (por tipo)
  const confirmadas: Planificada[] = plan.filter((p: Planificada): boolean => p.estado === "anticipo pagado");
  const porCliente: Map<string, number> = confirmadas.reduce(
    (m: Map<string, number>, p: Planificada): Map<string, number> => m.set(p.comision.cliente, (m.get(p.comision.cliente) ?? 0) + p.cotizacion.total),
    new Map<string, number>(),
  );
  const porTipo: Record<TipoDibujo, number> = { boceto: 0, lineart: 0, "color plano": 0, "full render": 0 };
  confirmadas.forEach((p: Planificada): void => {
    porTipo[p.comision.tipo] += p.cotizacion.total;
  });

  console.log("\n--- Ganancias confirmadas ---");
  [...porCliente.entries()].sort((a, b): number => b[1] - a[1]).forEach(([cliente, total]): void => console.log(`${cliente.padEnd(13)} ${dinero(total)}`));
  const tipos: readonly TipoDibujo[] = ["boceto", "lineart", "color plano", "full render"];
  console.log(`Por tipo: ${tipos.filter((t) => porTipo[t] > 0).map((t) => `${t} ${dinero(porTipo[t])}`).join(" | ")}`);
  const total: number = confirmadas.reduce((t: number, p: Planificada): number => t + p.cotizacion.total, 0);
  const atrasadas: number = confirmadas.filter((p) => (p.entregaDia ?? 0) > p.comision.diasLimite).length;
  console.log(`Total ${dinero(total)} | anticipos cobrados ${dinero(total * PORCENTAJE_ANTICIPO)} | ${atrasadas} comision(es) no llegan a la fecha`);
}

main();
