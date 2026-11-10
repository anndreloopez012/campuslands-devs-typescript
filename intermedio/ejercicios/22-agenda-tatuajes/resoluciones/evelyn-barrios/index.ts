export {};

type EstiloTatuaje = "Realismo" | "Tradicional" | "Blackwork" | "Fine Line" | "Neo Tradicional";
type EstadoCita = "Reservada" | "Completada" | "Reprogramada" | "Cancelada";

interface CitaTatuaje {
  readonly id: string;
  readonly artista: string;
  readonly cliente: string;
  readonly estilo: EstiloTatuaje;
  readonly horasEstimadas: number;
  readonly tarifaPorHoraUsd: number;
  readonly depositoPagadoUsd: number;
  readonly estado: EstadoCita;
}

interface ResumenEstudioTatuajes {
  readonly totalCitas: number;
  readonly ingresosEstimadosUsd: number;
  readonly depositosEnGarantiaUsd: number;
  readonly horasTotalesAgendadas: number;
}

function liquidarAgenda(citas: readonly CitaTatuaje[]): ResumenEstudioTatuajes {
  const activas = citas.filter((c) => c.estado !== "Cancelada");

  const ingresos = activas.reduce((acc, c) => acc + c.horasEstimadas * c.tarifaPorHoraUsd, 0);
  const depositos = activas.reduce((acc, c) => acc + c.depositoPagadoUsd, 0);
  const horasTotales = activas.reduce((acc, c) => acc + c.horasEstimadas, 0);

  return {
    totalCitas: activas.length,
    ingresosEstimadosUsd: Number(ingresos.toFixed(2)),
    depositosEnGarantiaUsd: Number(depositos.toFixed(2)),
    horasTotalesAgendadas: horasTotales,
  };
}

const agendaSemana: CitaTatuaje[] = [
  { id: "tt-01", artista: "Nico Ink", cliente: "Sofia Lopez", estilo: "Blackwork", horasEstimadas: 4, tarifaPorHoraUsd: 80, depositoPagadoUsd: 100, estado: "Reservada" },
  { id: "tt-02", artista: "Laura Art", cliente: "Martin Cruz", estilo: "Fine Line", horasEstimadas: 2.5, tarifaPorHoraUsd: 90, depositoPagadoUsd: 70, estado: "Reservada" },
  { id: "tt-03", artista: "Nico Ink", cliente: "Julian Velez", estilo: "Realismo", horasEstimadas: 6, tarifaPorHoraUsd: 100, depositoPagadoUsd: 150, estado: "Completada" },
];

console.log("=== AGENDA DE ESTUDIO DE TATUAJES ===");
const balanceTatuajes = liquidarAgenda(agendaSemana);
console.log(`Citas programadas activas: ${balanceTatuajes.totalCitas} | Horas de aguja: ${balanceTatuajes.horasTotalesAgendadas} hrs`);
console.log(`Ingresos brutos proyectados: $${balanceTatuajes.ingresosEstimadosUsd} USD (Depositos cobrados: $${balanceTatuajes.depositosEnGarantiaUsd} USD)`);