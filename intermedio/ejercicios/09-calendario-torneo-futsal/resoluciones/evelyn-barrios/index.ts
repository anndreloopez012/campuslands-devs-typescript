export {};

type FaseTorneo = "Fase de Grupos" | "Cuartos de Final" | "Semifinal" | "Final";

interface PartidoFutsal {
  readonly id: string;
  readonly equipoLocal: string;
  readonly equipoVisitante: string;
  readonly golesLocal: number;
  readonly golesVisitante: number;
  readonly fase: FaseTorneo;
  readonly jugado: boolean;
}

interface EstadisticaTabla {
  readonly equipo: string;
  partidosJugados: number;
  partidosGanados: number;
  partidosEmpatados: number;
  partidosPerdidos: number;
  golesFavor: number;
  golesContra: number;
  diferenciaGoles: number;
  puntos: number;
}

function calcularTablaPosiciones(partidos: readonly PartidoFutsal[]): EstadisticaTabla[] {
  const tabla: Record<string, EstadisticaTabla> = {};

  const obtenerRegistro = (nombre: string): EstadisticaTabla => {
    if (!tabla[nombre]) {
      tabla[nombre] = {
        equipo: nombre,
        partidosJugados: 0,
        partidosGanados: 0,
        partidosEmpatados: 0,
        partidosPerdidos: 0,
        golesFavor: 0,
        golesContra: 0,
        diferenciaGoles: 0,
        puntos: 0,
      };
    }
    return tabla[nombre];
  };

  for (const partido of partidos) {
    if (!partido.jugado) continue;

    const loc = obtenerRegistro(partido.equipoLocal);
    const vis = obtenerRegistro(partido.equipoVisitante);

    loc.partidosJugados += 1;
    vis.partidosJugados += 1;
    loc.golesFavor += partido.golesLocal;
    loc.golesContra += partido.golesVisitante;
    vis.golesFavor += partido.golesVisitante;
    vis.golesContra += partido.golesLocal;

    if (partido.golesLocal > partido.golesVisitante) {
      loc.partidosGanados += 1;
      loc.puntos += 3;
      vis.partidosPerdidos += 1;
    } else if (partido.golesLocal < partido.golesVisitante) {
      vis.partidosGanados += 1;
      vis.puntos += 3;
      loc.partidosPerdidos += 1;
    } else {
      loc.partidosEmpatados += 1;
      vis.partidosEmpatados += 1;
      loc.puntos += 1;
      vis.puntos += 1;
    }

    loc.diferenciaGoles = loc.golesFavor - loc.golesContra;
    vis.diferenciaGoles = vis.golesFavor - vis.golesContra;
  }

  return Object.values(tabla).sort((a, b) => b.puntos - a.puntos || b.diferenciaGoles - a.diferenciaGoles);
}

const partidosFutsal: PartidoFutsal[] = [
  { id: "pf-01", equipoLocal: "Titanes FC", equipoVisitante: "Halcones", golesLocal: 5, golesVisitante: 3, fase: "Fase de Grupos", jugado: true },
  { id: "pf-02", equipoLocal: "Rapidos del Sur", equipoVisitante: "Titanes FC", golesLocal: 2, golesVisitante: 4, fase: "Fase de Grupos", jugado: true },
  { id: "pf-03", equipoLocal: "Halcones", equipoVisitante: "Rapidos del Sur", golesLocal: 3, golesVisitante: 3, fase: "Fase de Grupos", jugado: true },
];

console.log("=== CALENDARIO Y TABLA DE POSICIONES FUTSAL ===");
const clasificacion = calcularTablaPosiciones(partidosFutsal);
clasificacion.forEach((e, idx) => {
  console.log(`#${idx + 1} ${e.equipo} - Pts: ${e.puntos} | PJ: ${e.partidosJugados} | DG: ${e.diferenciaGoles}`);
});