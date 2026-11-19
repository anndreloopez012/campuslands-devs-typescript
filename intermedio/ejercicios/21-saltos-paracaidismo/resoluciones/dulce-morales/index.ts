export {};

// Intermedio 21: Bitacora de paracaidismo
// Tematica: paracaidismo
// Resolucion: Dulce Morales
//
// Problema: una escuela de paracaidismo guarda la bitacora de saltos de sus paracaidistas.
// Hay que revisar cada salto contra las reglas de seguridad (viento, altura, licencia para
// el tipo de salto), agrupar los saltos validos por paracaidista y calcular a que licencia
// puede aspirar cada uno segun sus saltos y su tiempo de caida libre.

// ===================== MODELO =====================

type TipoSalto = "tandem" | "solo" | "freefly" | "wingsuit";
type Licencia = "ninguna" | "A" | "B" | "C" | "D";
type MotivoRechazo = "viento" | "altura" | "licencia" | "datos";

interface Paracaidista {
  readonly id: string;
  readonly nombre: string;
  readonly licencia: Licencia;
  readonly saltosPrevios: number; // saltos hechos antes de esta bitacora
  readonly caidaLibrePreviaSeg: number;
}

interface Salto {
  readonly id: number;
  readonly paracaidistaId: string;
  readonly mes: number;
  readonly zonaSalto: string;
  readonly tipo: TipoSalto;
  readonly alturaPies: number;
  readonly vientoKmh: number;
  readonly caidaLibreSeg: number;
}

interface Requisito {
  readonly saltos: number;
  readonly caidaLibreMin: number;
}

interface Resumen {
  readonly paracaidista: Paracaidista;
  readonly saltos: number;
  readonly caidaLibreMin: number;
  readonly porTipo: Record<TipoSalto, number>;
  readonly zonas: ReadonlySet<string>;
  readonly licenciaAlcanzable: Licencia;
  readonly siguiente: { readonly licencia: Licencia; readonly faltanSaltos: number; readonly faltanMin: number } | null;
}

// ===================== REGLAS (Record) =====================

const ORDEN_LICENCIAS: readonly Licencia[] = ["ninguna", "A", "B", "C", "D"];
const TIPOS: readonly TipoSalto[] = ["tandem", "solo", "freefly", "wingsuit"];
const MOTIVOS: readonly MotivoRechazo[] = ["viento", "altura", "licencia", "datos"];

const REQUISITO_LICENCIA: Readonly<Record<Exclude<Licencia, "ninguna">, Requisito>> = {
  A: { saltos: 25, caidaLibreMin: 0 },
  B: { saltos: 50, caidaLibreMin: 30 },
  C: { saltos: 200, caidaLibreMin: 60 },
  D: { saltos: 500, caidaLibreMin: 180 },
};

// Licencia minima para hacer cada tipo de salto
const LICENCIA_PARA: Readonly<Record<TipoSalto, Licencia>> = { tandem: "ninguna", solo: "A", freefly: "B", wingsuit: "C" };
const ALTURA_MINIMA: Readonly<Record<TipoSalto, number>> = { tandem: 9000, solo: 3500, freefly: 10000, wingsuit: 12000 };
const VIENTO_MAXIMO_KMH: number = 25;

// ===================== VALIDACION =====================

function nivel(licencia: Licencia): number {
  return ORDEN_LICENCIAS.indexOf(licencia);
}

function revisarSalto(s: Salto, p: Paracaidista | undefined): MotivoRechazo | null {
  if (p === undefined || s.caidaLibreSeg < 0 || s.mes < 1 || s.mes > 12) return "datos";
  if (s.vientoKmh > VIENTO_MAXIMO_KMH) return "viento";
  if (s.alturaPies < ALTURA_MINIMA[s.tipo]) return "altura";
  if (nivel(p.licencia) < nivel(LICENCIA_PARA[s.tipo])) return "licencia";
  return null;
}

function detalleRechazo(motivo: MotivoRechazo, s: Salto, p: Paracaidista | undefined): string {
  switch (motivo) {
    case "datos":
      return p === undefined ? `paracaidista ${s.paracaidistaId} no registrado` : "datos del salto invalidos";
    case "viento":
      return `viento de ${s.vientoKmh} km/h (maximo ${VIENTO_MAXIMO_KMH})`;
    case "altura":
      return `${s.alturaPies} pies (minimo ${ALTURA_MINIMA[s.tipo]} para ${s.tipo})`;
    case "licencia":
      return `${s.tipo} requiere licencia ${LICENCIA_PARA[s.tipo]} (tiene ${p?.licencia ?? "?"})`;
  }
}

// ===================== CALCULOS (Record, Map, Set, reduce) =====================

function licenciaPara(saltos: number, caidaLibreMin: number): Licencia {
  const alcanzadas: Licencia[] = (["A", "B", "C", "D"] as const).filter(
    (l): boolean => saltos >= REQUISITO_LICENCIA[l].saltos && caidaLibreMin >= REQUISITO_LICENCIA[l].caidaLibreMin,
  );
  return alcanzadas[alcanzadas.length - 1] ?? "ninguna";
}

function siguienteLicencia(actual: Licencia, saltos: number, caidaLibreMin: number): Resumen["siguiente"] {
  const proxima: Licencia | undefined = ORDEN_LICENCIAS[nivel(actual) + 1];
  if (proxima === undefined || proxima === "ninguna") return null;
  const req: Requisito = REQUISITO_LICENCIA[proxima];
  return {
    licencia: proxima,
    faltanSaltos: Math.max(0, req.saltos - saltos),
    faltanMin: Math.max(0, Math.round((req.caidaLibreMin - caidaLibreMin) * 10) / 10),
  };
}

// Agrupa los saltos validos por paracaidista usando un Map
function agrupar(saltos: readonly Salto[]): Map<string, Salto[]> {
  return saltos.reduce((mapa: Map<string, Salto[]>, s: Salto): Map<string, Salto[]> => {
    mapa.set(s.paracaidistaId, [...(mapa.get(s.paracaidistaId) ?? []), s]);
    return mapa;
  }, new Map<string, Salto[]>());
}

function resumir(p: Paracaidista, propios: readonly Salto[]): Resumen {
  const porTipo: Record<TipoSalto, number> = { tandem: 0, solo: 0, freefly: 0, wingsuit: 0 };
  propios.forEach((s: Salto): void => {
    porTipo[s.tipo] += 1;
  });
  const segundos: number = p.caidaLibrePreviaSeg + propios.reduce((t: number, s: Salto): number => t + s.caidaLibreSeg, 0);
  const saltos: number = p.saltosPrevios + propios.length;
  const caidaLibreMin: number = Math.round((segundos / 60) * 10) / 10;
  const alcanzable: Licencia = licenciaPara(saltos, caidaLibreMin);
  return {
    paracaidista: p,
    saltos,
    caidaLibreMin,
    porTipo,
    zonas: new Set(propios.map((s: Salto): string => s.zonaSalto)),
    licenciaAlcanzable: alcanzable,
    siguiente: siguienteLicencia(alcanzable, saltos, caidaLibreMin),
  };
}

// ===================== DATOS DE PRUEBA =====================

const paracaidistas: readonly Paracaidista[] = [
  { id: "P1", nombre: "Andrea", licencia: "ninguna", saltosPrevios: 22, caidaLibrePreviaSeg: 900 },
  { id: "P2", nombre: "Bruno", licencia: "B", saltosPrevios: 196, caidaLibrePreviaSeg: 3500 },
  { id: "P3", nombre: "Carla", licencia: "C", saltosPrevios: 340, caidaLibrePreviaSeg: 9800 },
  { id: "P4", nombre: "Dario", licencia: "A", saltosPrevios: 30, caidaLibrePreviaSeg: 1500 },
];

const bitacora: readonly Salto[] = [
  // Andrea: con 3 saltos validos llega EXACTO a 25 -> licencia A
  { id: 1, paracaidistaId: "P1", mes: 3, zonaSalto: "Girardot", tipo: "tandem", alturaPies: 13000, vientoKmh: 12, caidaLibreSeg: 50 },
  { id: 2, paracaidistaId: "P1", mes: 3, zonaSalto: "Girardot", tipo: "tandem", alturaPies: 13000, vientoKmh: 25, caidaLibreSeg: 50 }, // limite: viento justo en 25 -> OK
  { id: 3, paracaidistaId: "P1", mes: 4, zonaSalto: "Melgar", tipo: "tandem", alturaPies: 12500, vientoKmh: 10, caidaLibreSeg: 48 },
  { id: 4, paracaidistaId: "P1", mes: 4, zonaSalto: "Melgar", tipo: "solo", alturaPies: 4000, vientoKmh: 8, caidaLibreSeg: 10 }, // sin licencia A todavia
  // Bruno
  { id: 5, paracaidistaId: "P2", mes: 3, zonaSalto: "Girardot", tipo: "freefly", alturaPies: 13500, vientoKmh: 15, caidaLibreSeg: 60 },
  { id: 6, paracaidistaId: "P2", mes: 3, zonaSalto: "Girardot", tipo: "freefly", alturaPies: 13500, vientoKmh: 30, caidaLibreSeg: 60 }, // viento alto
  { id: 7, paracaidistaId: "P2", mes: 4, zonaSalto: "Melgar", tipo: "solo", alturaPies: 9000, vientoKmh: 14, caidaLibreSeg: 40 },
  { id: 8, paracaidistaId: "P2", mes: 4, zonaSalto: "Melgar", tipo: "wingsuit", alturaPies: 14000, vientoKmh: 10, caidaLibreSeg: 120 }, // necesita C
  { id: 9, paracaidistaId: "P2", mes: 5, zonaSalto: "Pereira", tipo: "freefly", alturaPies: 13000, vientoKmh: 9, caidaLibreSeg: 58 },
  { id: 10, paracaidistaId: "P2", mes: 5, zonaSalto: "Pereira", tipo: "freefly", alturaPies: 13000, vientoKmh: 11, caidaLibreSeg: 62 },
  // Carla
  { id: 11, paracaidistaId: "P3", mes: 3, zonaSalto: "Girardot", tipo: "wingsuit", alturaPies: 14000, vientoKmh: 12, caidaLibreSeg: 150 },
  { id: 12, paracaidistaId: "P3", mes: 4, zonaSalto: "Pereira", tipo: "wingsuit", alturaPies: 11000, vientoKmh: 10, caidaLibreSeg: 120 }, // altura baja
  { id: 13, paracaidistaId: "P3", mes: 5, zonaSalto: "Melgar", tipo: "freefly", alturaPies: 13000, vientoKmh: 13, caidaLibreSeg: 60 },
  // Dario
  { id: 14, paracaidistaId: "P4", mes: 5, zonaSalto: "Girardot", tipo: "solo", alturaPies: 5500, vientoKmh: 16, caidaLibreSeg: 30 },
  // Datos invalidos
  { id: 15, paracaidistaId: "P9", mes: 5, zonaSalto: "Girardot", tipo: "solo", alturaPies: 5000, vientoKmh: 5, caidaLibreSeg: 30 },
];

// ===================== SALIDA POR CONSOLA =====================

function main(): void {
  const porId: Map<string, Paracaidista> = new Map(paracaidistas.map((p: Paracaidista): [string, Paracaidista] => [p.id, p]));
  const validos: Salto[] = [];
  const rechazos: Record<MotivoRechazo, number> = { viento: 0, altura: 0, licencia: 0, datos: 0 };

  console.log("==================== REVISION DE LA BITACORA ====================");
  for (const s of bitacora) {
    const p: Paracaidista | undefined = porId.get(s.paracaidistaId);
    const motivo: MotivoRechazo | null = revisarSalto(s, p);
    if (motivo === null) {
      validos.push(s);
    } else {
      rechazos[motivo] += 1;
      console.log(`X Salto #${String(s.id).padStart(2)} ${(p?.nombre ?? s.paracaidistaId).padEnd(7)} ${s.tipo.padEnd(9)} -> ${motivo}: ${detalleRechazo(motivo, s, p)}`);
    }
  }
  console.log(`Saltos validos: ${validos.length} de ${bitacora.length}`);

  const grupos: Map<string, Salto[]> = agrupar(validos);
  console.log("\n==================== RESUMEN POR PARACAIDISTA ====================");
  for (const p of paracaidistas) {
    const r: Resumen = resumir(p, grupos.get(p.id) ?? []);
    const tipos: string = TIPOS.filter((t: TipoSalto): boolean => r.porTipo[t] > 0).map((t: TipoSalto): string => `${t} ${r.porTipo[t]}`).join(", ") || "ninguno";
    console.log(`\n${p.nombre} (licencia actual: ${p.licencia})`);
    console.log(`  Saltos totales: ${r.saltos} | caida libre: ${r.caidaLibreMin} min`);
    console.log(`  En esta bitacora: ${tipos} | zonas: ${[...r.zonas].sort().join(", ") || "-"}`);
    const mejora: string = nivel(r.licenciaAlcanzable) > nivel(p.licencia) ? `  << puede tramitar licencia ${r.licenciaAlcanzable}` : "";
    console.log(`  Licencia que le corresponde: ${r.licenciaAlcanzable}${mejora}`);
    if (r.siguiente !== null) {
      console.log(`  Para licencia ${r.siguiente.licencia}: faltan ${r.siguiente.faltanSaltos} saltos y ${r.siguiente.faltanMin} min de caida libre`);
    } else {
      console.log("  Ya tiene la licencia mas alta");
    }
  }

  console.log("\n==================== ESTADISTICAS ====================");
  const porMes: Map<number, number> = validos.reduce(
    (m: Map<number, number>, s: Salto): Map<number, number> => m.set(s.mes, (m.get(s.mes) ?? 0) + 1),
    new Map<number, number>(),
  );
  console.log(`Saltos validos por mes: ${[...porMes.entries()].sort((a, b) => a[0] - b[0]).map(([m, n]) => `mes ${m}: ${n}`).join(" | ")}`);
  const zonas: Set<string> = new Set(validos.map((s: Salto): string => s.zonaSalto));
  console.log(`Zonas de salto usadas: ${zonas.size} (${[...zonas].sort().join(", ")})`);
  console.log(`Rechazos: ${MOTIVOS.map((m: MotivoRechazo): string => `${m} ${rechazos[m]}`).join(", ")}`);
}

main();
