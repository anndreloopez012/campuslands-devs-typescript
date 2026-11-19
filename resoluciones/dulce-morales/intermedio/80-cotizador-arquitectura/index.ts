export {};

// Intermedio 80: Cotizador arquitectura 3D
// Tematica: diseno 3D arquitectura
// Resolucion: Dulce Morales
//
// Problema: el cotizador de un despacho de arquitectura que hace diseno y visualizacion 3D.
// La persona llena una solicitud (DTO): tipo de proyecto, metros cuadrados, niveles y entregables
// (planos, modelo 3D, renders, recorrido virtual). El sistema la valida, calcula el precio por
// partidas, aplica factores (complejidad, urgencia), arma el calendario de pagos por fases y guarda
// cada cotizacion con versiones en un repositorio en memoria. Al final compara versiones y genera
// un reporte del despacho.

// ===================== MODELO =====================

type TipoProyecto = "casa" | "departamentos" | "local" | "oficinas";
type Estilo = "minimalista" | "contemporaneo" | "industrial" | "colonial";

// DTO de entrada (formulario web)
interface SolicitudDTO {
  readonly cliente: string;
  readonly tipo: TipoProyecto;
  readonly estilo: Estilo;
  readonly m2: number;
  readonly niveles: number;
  readonly entregables: {
    readonly planos: boolean;
    readonly modelo3d: boolean;
    readonly rendersExterior: number;
    readonly rendersInterior: number;
    readonly recorridoSeg: number; // video de recorrido virtual
  };
  readonly semanas: number; // plazo que pide el cliente
}

interface Partida {
  readonly concepto: string;
  readonly cantidad: number;
  readonly unidad: string;
  readonly precioUnitario: number;
  readonly importe: number;
}

interface Pago {
  readonly fase: string;
  readonly porcentaje: number;
  readonly monto: number;
  readonly semana: number;
}

// DTO de salida: la cotizacion lista para mostrar o exportar a PDF
interface CotizacionDTO {
  readonly folio: string;
  readonly version: number;
  readonly cliente: string;
  readonly partidas: readonly Partida[];
  readonly subtotal: number;
  readonly factores: readonly string[];
  readonly totalSinIva: number;
  readonly iva: number;
  readonly total: number;
  readonly semanasMinimas: number;
  readonly pagos: readonly Pago[];
}

type Resultado<T> = { readonly ok: true; readonly valor: T } | { readonly ok: false; readonly errores: readonly string[] };

// ===================== TARIFAS Y REGLAS =====================

const PRECIO_M2_PLANOS: Readonly<Record<TipoProyecto, number>> = { casa: 180, departamentos: 140, local: 160, oficinas: 150 };
const PRECIO_M2_MODELO: number = 60;
const PRECIO_RENDER: Readonly<{ exterior: number; interior: number }> = { exterior: 4500, interior: 3500 };
const PRECIO_SEG_RECORRIDO: number = 350;
const FACTOR_ESTILO: Readonly<Record<Estilo, number>> = { minimalista: 1, contemporaneo: 1.05, industrial: 1.1, colonial: 1.25 };
const FACTOR_NIVEL_EXTRA: number = 0.08;   // +8 % por cada nivel arriba del primero
const DESCUENTO_VOLUMEN_M2: number = 1000;  // desde 1000 m2: -10 % en planos
const IVA: number = 0.16;
const MINIMO: number = 25000;

// Plazos: semanas de trabajo por entregable
const SEMANAS = {
  planosPor500m2: 2,
  modelo: 2,
  rendersPorSemana: 4,
  recorridoPor60s: 1,
} as const;

const LIMITES = { m2Min: 40, m2Max: 20000, nivelesMax: 30, rendersMax: 40, recorridoMax: 600 } as const;

// ===================== VALIDACION =====================

function validar(s: SolicitudDTO): readonly string[] {
  const e: string[] = [];
  const ent = s.entregables;
  if (s.cliente.trim() === "") e.push("cliente vacio");
  if (!Number.isFinite(s.m2) || s.m2 < LIMITES.m2Min || s.m2 > LIMITES.m2Max) e.push(`m2 debe estar entre ${LIMITES.m2Min} y ${LIMITES.m2Max}`);
  if (!Number.isInteger(s.niveles) || s.niveles < 1 || s.niveles > LIMITES.nivelesMax) e.push(`niveles debe ser de 1 a ${LIMITES.nivelesMax}`);
  if (s.tipo === "casa" && s.niveles > 4) e.push("una casa no puede tener mas de 4 niveles");
  const renders: number = ent.rendersExterior + ent.rendersInterior;
  if ([ent.rendersExterior, ent.rendersInterior, ent.recorridoSeg].some((n) => !Number.isInteger(n) || n < 0)) e.push("cantidades de renders/recorrido invalidas");
  if (renders > LIMITES.rendersMax) e.push(`maximo ${LIMITES.rendersMax} renders`);
  if (ent.recorridoSeg > LIMITES.recorridoMax) e.push(`recorrido maximo ${LIMITES.recorridoMax} s`);
  if (!ent.planos && !ent.modelo3d && renders === 0 && ent.recorridoSeg === 0) e.push("no se pidio ningun entregable");
  // Sin modelo 3D no se pueden hacer renders ni recorrido
  if (!ent.modelo3d && (renders > 0 || ent.recorridoSeg > 0)) e.push("renders y recorrido requieren el modelo 3D");
  if (!Number.isInteger(s.semanas) || s.semanas < 1) e.push("plazo invalido");
  return e;
}

// ===================== CALCULO (PURO) =====================

const redondear = (n: number): number => Math.round(n * 100) / 100;

function partida(concepto: string, cantidad: number, unidad: string, precioUnitario: number): Partida {
  return { concepto, cantidad, unidad, precioUnitario, importe: redondear(cantidad * precioUnitario) };
}

function semanasMinimas(s: SolicitudDTO): number {
  const ent = s.entregables;
  const renders: number = ent.rendersExterior + ent.rendersInterior;
  return (ent.planos ? Math.ceil(s.m2 / 500) * SEMANAS.planosPor500m2 : 0)
    + (ent.modelo3d ? SEMANAS.modelo : 0)
    + Math.ceil(renders / SEMANAS.rendersPorSemana)
    + Math.ceil(ent.recorridoSeg / 60) * SEMANAS.recorridoPor60s;
}

function cotizar(s: SolicitudDTO, folio: string, version: number): Resultado<CotizacionDTO> {
  const errores: readonly string[] = validar(s);
  if (errores.length > 0) return { ok: false, errores };
  const ent = s.entregables;

  const partidas: Partida[] = [];
  if (ent.planos) partidas.push(partida(`Planos arquitectonicos (${s.tipo})`, s.m2, "m2", PRECIO_M2_PLANOS[s.tipo]));
  if (ent.modelo3d) partidas.push(partida("Modelo 3D", s.m2, "m2", PRECIO_M2_MODELO));
  if (ent.rendersExterior > 0) partidas.push(partida("Render exterior", ent.rendersExterior, "pza", PRECIO_RENDER.exterior));
  if (ent.rendersInterior > 0) partidas.push(partida("Render interior", ent.rendersInterior, "pza", PRECIO_RENDER.interior));
  if (ent.recorridoSeg > 0) partidas.push(partida("Recorrido virtual", ent.recorridoSeg, "seg", PRECIO_SEG_RECORRIDO));
  const subtotal: number = redondear(partidas.reduce((a, p) => a + p.importe, 0));

  const factores: string[] = [];
  let total: number = subtotal;
  const aplicar = (texto: string, nuevo: number): void => {
    factores.push(`${texto}: ${nuevo >= total ? "+" : "-"}${$(Math.abs(redondear(nuevo - total)))}`);
    total = redondear(nuevo);
  };

  if (ent.planos && s.m2 >= DESCUENTO_VOLUMEN_M2) {
    const planos: number = partidas[0]?.importe ?? 0;
    aplicar(`descuento por volumen (${s.m2} m2 >= ${DESCUENTO_VOLUMEN_M2}) -10% planos`, total - planos * 0.1);
  }
  if (FACTOR_ESTILO[s.estilo] !== 1) aplicar(`estilo ${s.estilo} x${FACTOR_ESTILO[s.estilo]}`, total * FACTOR_ESTILO[s.estilo]);
  if (s.niveles > 1) aplicar(`${s.niveles} niveles (+${FACTOR_NIVEL_EXTRA * 100}% por nivel extra)`, total * (1 + FACTOR_NIVEL_EXTRA * (s.niveles - 1)));

  const minimas: number = semanasMinimas(s);
  if (s.semanas < minimas) {
    // Urgencia: +5 % por cada semana que se recorta, maximo comprimir a la mitad
    if (s.semanas < Math.ceil(minimas / 2)) return { ok: false, errores: [`plazo imposible: ${s.semanas} sem (minimo ${Math.ceil(minimas / 2)} con urgencia, normal ${minimas})`] };
    const recorte: number = minimas - s.semanas;
    aplicar(`urgencia (${recorte} sem menos) +${recorte * 5}%`, total * (1 + 0.05 * recorte));
  }
  if (total < MINIMO) aplicar(`ajuste a minimo de $${MINIMO}`, MINIMO);

  const plazo: number = Math.min(s.semanas, minimas);
  const fases: readonly [string, number, number][] = [
    ["Anticipo", 0.3, 0],
    ["Entrega de anteproyecto", 0.3, Math.ceil(plazo / 2)],
    ["Entrega final", 0.4, plazo],
  ];
  const iva: number = redondear(total * IVA);
  const totalConIva: number = redondear(total + iva);
  const pagos: Pago[] = fases.map(([fase, porcentaje, semana]) => ({ fase, porcentaje, semana, monto: redondear(totalConIva * porcentaje) }));
  // El redondeo puede dejar centavos sueltos: se ajustan en el ultimo pago para que sume exacto
  const diferencia: number = redondear(totalConIva - pagos.reduce((a, p) => a + p.monto, 0));
  const ultimo: Pago | undefined = pagos[pagos.length - 1];
  if (ultimo !== undefined && diferencia !== 0) pagos[pagos.length - 1] = { ...ultimo, monto: redondear(ultimo.monto + diferencia) };

  return { ok: true, valor: { folio, version, cliente: s.cliente, partidas, subtotal, factores, totalSinIva: total, iva, total: totalConIva, semanasMinimas: minimas, pagos } };
}

// ===================== REPOSITORIO CON VERSIONES =====================

class RepoCotizaciones {
  private readonly porFolio: Map<string, CotizacionDTO[]> = new Map();
  private consecutivo: number = 0;

  nueva(s: SolicitudDTO): Resultado<CotizacionDTO> {
    const folio: string = `ARQ-${String(this.consecutivo + 1).padStart(3, "0")}`;
    const r: Resultado<CotizacionDTO> = cotizar(s, folio, 1);
    if (r.ok) { this.consecutivo++; this.porFolio.set(folio, [r.valor]); }
    return r;
  }

  revisar(folio: string, s: SolicitudDTO): Resultado<CotizacionDTO> {
    const versiones: CotizacionDTO[] | undefined = this.porFolio.get(folio);
    if (versiones === undefined) return { ok: false, errores: [`folio ${folio} no existe`] };
    const r: Resultado<CotizacionDTO> = cotizar(s, folio, versiones.length + 1);
    if (r.ok) versiones.push(r.valor);
    return r;
  }

  versiones(folio: string): readonly CotizacionDTO[] { return this.porFolio.get(folio) ?? []; }
  ultimas(): readonly CotizacionDTO[] { return [...this.porFolio.values()].flatMap((v) => v.slice(-1)); }
}

// ===================== PANTALLA =====================

const $ = (n: number): string => `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function imprimir(c: CotizacionDTO): void {
  console.log(`  ${c.folio} v${c.version} - ${c.cliente}`);
  for (const p of c.partidas) console.log(`    ${p.concepto.padEnd(40)} ${String(p.cantidad).padStart(5)} ${p.unidad.padEnd(4)} x ${$(p.precioUnitario).padStart(10)} = ${$(p.importe).padStart(13)}`);
  console.log(`    ${"Subtotal".padEnd(72)} ${$(c.subtotal).padStart(13)}`);
  for (const f of c.factores) console.log(`      ${f}`);
  console.log(`    ${"Total antes de IVA".padEnd(72)} ${$(c.totalSinIva).padStart(13)}`);
  console.log(`    ${"IVA 16%".padEnd(72)} ${$(c.iva).padStart(13)}`);
  console.log(`    ${"TOTAL".padEnd(72)} ${$(c.total).padStart(13)}`);
  console.log(`    Plazo normal: ${c.semanasMinimas} semanas | Pagos: ${c.pagos.map((p) => `${p.fase} (sem ${p.semana}) ${$(p.monto)}`).join(" | ")}`);
}

function mostrar(r: Resultado<CotizacionDTO>, titulo: string): void {
  console.log(`\n--- ${titulo} ---`);
  if (r.ok) imprimir(r.valor);
  else console.log(`  RECHAZADA: ${r.errores.join("; ")}`);
}

// ===================== DEMO =====================

function main(): void {
  const repo: RepoCotizaciones = new RepoCotizaciones();
  const casa: SolicitudDTO = {
    cliente: "Familia Ortega", tipo: "casa", estilo: "contemporaneo", m2: 220, niveles: 2, semanas: 8,
    entregables: { planos: true, modelo3d: true, rendersExterior: 2, rendersInterior: 4, recorridoSeg: 45 },
  };
  mostrar(repo.nueva(casa), "Casa contemporanea");

  // El cliente pide menos plazo (urgencia) y quita el recorrido
  mostrar(repo.revisar("ARQ-001", { ...casa, semanas: 5, entregables: { ...casa.entregables, recorridoSeg: 0 } }), "Casa v2: urgente y sin recorrido");
  mostrar(repo.revisar("ARQ-001", { ...casa, semanas: 2 }), "Casa v3: plazo imposible");

  mostrar(repo.nueva({
    cliente: "Inmobiliaria Norte", tipo: "departamentos", estilo: "industrial", m2: 1000, niveles: 6, semanas: 12,
    entregables: { planos: true, modelo3d: true, rendersExterior: 6, rendersInterior: 6, recorridoSeg: 120 },
  }), "Torre de departamentos (limite: 1000 m2 justos)");

  mostrar(repo.nueva({
    cliente: "Cafe Lupita", tipo: "local", estilo: "minimalista", m2: 45, niveles: 1, semanas: 4,
    entregables: { planos: false, modelo3d: true, rendersExterior: 0, rendersInterior: 2, recorridoSeg: 0 },
  }), "Cafe pequeno (sube al minimo)");

  mostrar(repo.nueva({
    cliente: "", tipo: "casa", estilo: "colonial", m2: 30, niveles: 5, semanas: 0,
    entregables: { planos: false, modelo3d: false, rendersExterior: 3, rendersInterior: 0, recorridoSeg: 700 },
  }), "Solicitud con errores");
  mostrar(repo.revisar("ARQ-999", casa), "Folio inexistente");

  console.log("\n=== Historial de ARQ-001 ===");
  const vs: readonly CotizacionDTO[] = repo.versiones("ARQ-001");
  vs.forEach((v, i) => {
    const anterior: CotizacionDTO | undefined = vs[i - 1];
    const cambio: string = anterior === undefined ? "" : ` (${v.total >= anterior.total ? "+" : "-"}${$(Math.abs(v.total - anterior.total))} vs v${anterior.version})`;
    console.log(`  v${v.version}: ${$(v.total)} en ${v.pagos[v.pagos.length - 1]?.semana ?? 0} semanas${cambio}`);
  });

  const ultimas: readonly CotizacionDTO[] = repo.ultimas();
  const cartera: number = ultimas.reduce((a, c) => a + c.total, 0);
  const anticipos: number = ultimas.reduce((a, c) => a + (c.pagos[0]?.monto ?? 0), 0);
  console.log("\n=== Reporte del despacho ===");
  console.log(`  Cotizaciones vigentes: ${ultimas.length} | cartera: ${$(cartera)} | anticipos esperados: ${$(anticipos)}`);
  const mayor: CotizacionDTO | undefined = [...ultimas].sort((a, b) => b.total - a.total)[0];
  if (mayor !== undefined) console.log(`  Proyecto mas grande: ${mayor.folio} ${mayor.cliente} (${$(mayor.total)})`);
}

main();
