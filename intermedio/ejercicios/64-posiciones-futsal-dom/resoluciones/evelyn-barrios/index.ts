export {};

interface EstadisticasEquipoFutsal {
  readonly equipo: string;
  readonly pj: number;
  readonly pg: number;
  readonly pe: number;
  readonly pp: number;
  readonly gf: number;
  readonly gc: number;
  readonly puntos: number;
}

type AccionFutsal =
  | { readonly tipo: "REGISTRAR_PARTIDO"; readonly local: string; readonly visitante: string; readonly golesL: number; readonly golesV: number }
  | { readonly tipo: "APLICAR_SANCION_PUNTOS"; readonly equipo: string; readonly puntosDescontados: number };

function reductorFutsal(
  tabla: readonly EstadisticasEquipoFutsal[],
  accion: AccionFutsal
): readonly EstadisticasEquipoFutsal[] {
  switch (accion.tipo) {
    case "REGISTRAR_PARTIDO": {
      const { local, visitante, golesL, golesV } = accion;
      return tabla.map((eq) => {
        if (eq.equipo === local) {
          const pg = golesL > golesV ? eq.pg + 1 : eq.pg;
          const pe = golesL === golesV ? eq.pe + 1 : eq.pe;
          const pp = golesL < golesV ? eq.pp + 1 : eq.pp;
          const puntos = eq.puntos + (golesL > golesV ? 3 : golesL === golesV ? 1 : 0);
          return { ...eq, pj: eq.pj + 1, pg, pe, pp, gf: eq.gf + golesL, gc: eq.gc + golesV, puntos };
        }
        if (eq.equipo === visitante) {
          const pg = golesV > golesL ? eq.pg + 1 : eq.pg;
          const pe = golesL === golesV ? eq.pe + 1 : eq.pe;
          const pp = golesV < golesL ? eq.pp + 1 : eq.pp;
          const puntos = eq.puntos + (golesV > golesL ? 3 : golesL === golesV ? 1 : 0);
          return { ...eq, pj: eq.pj + 1, pg, pe, pp, gf: eq.gf + golesV, gc: eq.gc + golesL, puntos };
        }
        return eq;
      });
    }
    case "APLICAR_SANCION_PUNTOS":
      return tabla.map((eq) => (eq.equipo === accion.equipo ? { ...eq, puntos: Math.max(0, eq.puntos - accion.puntosDescontados) } : eq));
  }
}

function main() {
  console.log("=== TABLA FUTSAL INTERACTIVA (REDUCER CLASIFICATORIO) ===");
  let tabla: readonly EstadisticasEquipoFutsal[] = [
    { equipo: "Boca Futsal", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, puntos: 0 },
    { equipo: "San Lorenzo", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, puntos: 0 },
    { equipo: "Palma Futsal", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, puntos: 0 },
  ];

  tabla = reductorFutsal(tabla, { tipo: "REGISTRAR_PARTIDO", local: "Boca Futsal", visitante: "San Lorenzo", golesL: 4, golesV: 2 });
  tabla = reductorFutsal(tabla, { tipo: "REGISTRAR_PARTIDO", local: "Palma Futsal", visitante: "Boca Futsal", golesL: 3, golesV: 3 });

  const ordenados = [...tabla].sort((a, b) => b.puntos - a.puntos || (b.gf - b.gc) - (a.gf - a.gc));
  console.log("Posiciones finales:");
  ordenados.forEach((eq, i) => {
    console.log(`${i + 1}. ${eq.equipo} - Pts: ${eq.puntos} | PJ: ${eq.pj} | GF: ${eq.gf} | GC: ${eq.gc}`);
  });
}

main();
