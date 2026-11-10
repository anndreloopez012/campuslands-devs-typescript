export {};

type ClimaPista = "Seco" | "Lluvia Ligera" | "Tormenta";

interface RegistroVuelta {
  readonly vuelta: number;
  readonly tiempoSegundos: number;
  readonly combustibleConsumidoLitros: number;
  readonly desgasteNeumaticoPorcentaje: number;
}

interface AutoCarrera {
  readonly id: string;
  readonly piloto: string;
  readonly escuderia: string;
  readonly historialVueltas: readonly RegistroVuelta[];
}

interface BalanceCarrera {
  readonly piloto: string;
  readonly escuderia: string;
  readonly tiempoTotalSegundos: number;
  readonly promedioPorVuelta: number;
  readonly combustibleRestante: number;
  readonly paradasRecomendadas: number;
}

function simularRendimiento(auto: AutoCarrera, combustibleInicialLitros: number): BalanceCarrera {
  const totalTiempo = auto.historialVueltas.reduce((acc, v) => acc + v.tiempoSegundos, 0);
  const totalCombustible = auto.historialVueltas.reduce((acc, v) => acc + v.combustibleConsumidoLitros, 0);
  const vueltasTotal = auto.historialVueltas.length === 0 ? 1 : auto.historialVueltas.length;
  
  const promedioVuelta = Number((totalTiempo / vueltasTotal).toFixed(2));
  const combustibleRestante = Number((combustibleInicialLitros - totalCombustible).toFixed(1));
  
  const desgasteAcumulado = auto.historialVueltas.reduce((acc, v) => acc + v.desgasteNeumaticoPorcentaje, 0);
  const paradasRecomendadas = Math.floor(desgasteAcumulado / 70);

  return {
    piloto: auto.piloto,
    escuderia: auto.escuderia,
    tiempoTotalSegundos: Number(totalTiempo.toFixed(2)),
    promedioPorVuelta: promedioVuelta,
    combustibleRestante,
    paradasRecomendadas,
  };
}

const competidor: AutoCarrera = {
  id: "car-44",
  piloto: "Lewis Hamilton",
  escuderia: "Mercedes AMG",
  historialVueltas: [
    { vuelta: 1, tiempoSegundos: 88.5, combustibleConsumidoLitros: 2.4, desgasteNeumaticoPorcentaje: 4.5 },
    { vuelta: 2, tiempoSegundos: 87.9, combustibleConsumidoLitros: 2.3, desgasteNeumaticoPorcentaje: 4.8 },
    { vuelta: 3, tiempoSegundos: 88.1, combustibleConsumidoLitros: 2.3, desgasteNeumaticoPorcentaje: 5.0 },
  ],
};

console.log("=== SIMULADOR DE CARRERA POR VUELTAS ===");
const reporte = simularRendimiento(competidor, 100);
console.log(`${reporte.piloto} (${reporte.escuderia}) - T.Total: ${reporte.tiempoTotalSegundos}s | Promedio: ${reporte.promedioPorVuelta}s`);
console.log(`Combustible Restante: ${reporte.combustibleRestante} L | Paradas a pits sugeridas: ${reporte.paradasRecomendadas}`);