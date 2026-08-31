export {};

type EstadoPartido = "programado" | "jugado" | "aplazado" | "cancelado";

interface PartidoFutsal {
  readonly id: number;
  readonly fecha: string;
  readonly grupo: string;
  readonly local: string;
  readonly visitante: string;
  readonly estado: EstadoPartido;
  readonly golesLocal: number | null;
  readonly golesVisitante: number | null;
}

interface TablaPosiciones {
  readonly equipo: string;
  readonly grupo: string;
  readonly puntos: number;
  readonly partidosJugados: number;
  readonly diferenciaGoles: number;
}

interface ResumenTorneo {
  readonly validos: readonly PartidoFutsal[];
  readonly invalidos: readonly PartidoFutsal[];
  readonly jugadosCount: number;
  readonly programadosCount: number;
  readonly tabla: readonly TablaPosiciones[];
}

const calendario: readonly PartidoFutsal[] = [
  {
    id: 1,
    fecha: "2026-09-01",
    grupo: "A",
    local: "Halcones FS",
    visitante: "Titanes FS",
    estado: "jugado",
    golesLocal: 4,
    golesVisitante: 2,
  },
  {
    id: 2,
    fecha: "2026-09-01",
    grupo: "A",
    local: "Rayos FS",
    visitante: "Cobras FS",
    estado: "jugado",
    golesLocal: 1,
    golesVisitante: 1,
  },
  {
    id: 3,
    fecha: "2026-09-05",
    grupo: "A",
    local: "Halcones FS",
    visitante: "Cobras FS",
    estado: "jugado",
    golesLocal: 3,
    golesVisitante: 3,
  },
  {
    id: 4,
    fecha: "2026-09-05",
    grupo: "A",
    local: "Titanes FS",
    visitante: "Rayos FS",
    estado: "aplazado",
    golesLocal: null,
    golesVisitante: null,
  },
  {
    id: 5,
    fecha: "2026-09-08",
    grupo: "B",
    local: "Panteras FS",
    visitante: "Lobos FS",
    estado: "jugado",
    golesLocal: 5,
    golesVisitante: 0,
  },
  {
    id: 6,
    fecha: "2026-09-08",
    grupo: "B",
    local: "Aguilas FS",
    visitante: "Toros FS",
    estado: "programado",
    golesLocal: null,
    golesVisitante: null,
  },
  {
    id: 7,
    fecha: "2026-09-12",
    grupo: "B",
    local: "Panteras FS",
    visitante: "Toros FS",
    estado: "cancelado",
    golesLocal: null,
    golesVisitante: null,
  },
  {
    id: 8,
    fecha: "2026-09-12",
    grupo: "A",
    local: "Rayos FS",
    visitante: "Rayos FS",
    estado: "jugado",
    golesLocal: 2,
    golesVisitante: 1,
  },
  {
    id: 9,
    fecha: "2026-09-15",
    grupo: "B",
    local: "Lobos FS",
    visitante: "Aguilas FS",
    estado: "jugado",
    golesLocal: 2,
    golesVisitante: null,
  },
];

const esPartidoValido = (partido: PartidoFutsal): boolean => {
  if (partido.local === partido.visitante) {
    return false;
  }

  if (partido.estado !== "jugado") {
    return true;
  }

  return (
    partido.golesLocal !== null &&
    partido.golesVisitante !== null &&
    partido.golesLocal >= 0 &&
    partido.golesVisitante >= 0
  );
};

const calcularTabla = (
  partidosJugados: readonly PartidoFutsal[],
): TablaPosiciones[] => {
  const acumulado = new Map<
    string,
    { grupo: string; puntos: number; jugados: number; diferencia: number }
  >();

  const registrar = (equipo: string, grupo: string, puntos: number, diferencia: number): void => {
    const previo = acumulado.get(equipo) ?? {
      grupo,
      puntos: 0,
      jugados: 0,
      diferencia: 0,
    };

    acumulado.set(equipo, {
      grupo,
      puntos: previo.puntos + puntos,
      jugados: previo.jugados + 1,
      diferencia: previo.diferencia + diferencia,
    });
  };

  partidosJugados.forEach((partido) => {
    const golesLocal = partido.golesLocal ?? 0;
    const golesVisitante = partido.golesVisitante ?? 0;

    if (golesLocal > golesVisitante) {
      registrar(partido.local, partido.grupo, 3, golesLocal - golesVisitante);
      registrar(partido.visitante, partido.grupo, 0, golesVisitante - golesLocal);
    } else if (golesLocal < golesVisitante) {
      registrar(partido.local, partido.grupo, 0, golesLocal - golesVisitante);
      registrar(partido.visitante, partido.grupo, 3, golesVisitante - golesLocal);
    } else {
      registrar(partido.local, partido.grupo, 1, 0);
      registrar(partido.visitante, partido.grupo, 1, 0);
    }
  });

  return Array.from(acumulado, ([equipo, datos]) => ({
    equipo,
    grupo: datos.grupo,
    puntos: datos.puntos,
    partidosJugados: datos.jugados,
    diferenciaGoles: datos.diferencia,
  })).sort((a, b) => b.puntos - a.puntos || b.diferenciaGoles - a.diferenciaGoles);
};

const procesarCalendario = (lista: readonly PartidoFutsal[]): ResumenTorneo => {
  const validos = lista.filter(esPartidoValido);
  const invalidos = lista.filter((partido) => !esPartidoValido(partido));
  const jugados = validos.filter((partido) => partido.estado === "jugado");
  const programados = validos.filter((partido) => partido.estado === "programado");

  return {
    validos,
    invalidos,
    jugadosCount: jugados.length,
    programadosCount: programados.length,
    tabla: calcularTabla(jugados),
  };
};

// --- Render del Sistema ---
const resumen = procesarCalendario(calendario);

console.log(
  `Ejercicio 9: Calendario de torneo futsal\nPartidos totales: ${calendario.length}\nPartidos validos: ${resumen.validos.length}\nPartidos invalidos: ${resumen.invalidos.length}\nJugados: ${resumen.jugadosCount}\nProgramados: ${resumen.programadosCount}`,
);

resumen.invalidos.forEach((partido) =>
  console.log(`  - Partido #${partido.id} (${partido.local} vs ${partido.visitante}) tiene datos invalidos`),
);

console.log("Tabla de posiciones:");
resumen.tabla.forEach((fila, index) =>
  console.log(
    `${index + 1}. [Grupo ${fila.grupo}] ${fila.equipo} - ${fila.puntos} pts (PJ ${fila.partidosJugados}, DG ${fila.diferenciaGoles})`,
  ),
);
