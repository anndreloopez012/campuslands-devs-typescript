export {};

type ModalidadSalto = "Tandem" | "AFF" | "Freefly" | "Wingsuit";

interface RegistroSalto {
  readonly id: string;
  readonly paracaidista: string;
  readonly modalidad: ModalidadSalto;
  readonly altitudMetros: number;
  readonly segundosCaidaLibre: number;
  readonly aterrizajeExitoso: boolean;
}

interface EstadisticasBitacora {
  readonly totalSaltos: number;
  readonly minutosTotalesCaidaLibre: number;
  readonly altitudPromedioMetros: number;
  readonly saltosPorModalidad: Record<ModalidadSalto, number>;
  readonly elegibleLicenciaB: boolean;
}

function procesarBitacora(saltos: readonly RegistroSalto[]): EstadisticasBitacora {
  const saltosPorModalidad: Record<ModalidadSalto, number> = {
    Tandem: 0,
    AFF: 0,
    Freefly: 0,
    Wingsuit: 0,
  };

  const totalSegundos = saltos.reduce((acc, s) => acc + s.segundosCaidaLibre, 0);
  const totalAltitud = saltos.reduce((acc, s) => acc + s.altitudMetros, 0);

  for (const s of saltos) {
    saltosPorModalidad[s.modalidad] += 1;
  }

  const cantidad = saltos.length === 0 ? 1 : saltos.length;
  const minutosCaidaLibre = Number((totalSegundos / 60).toFixed(1));
  const altitudPromedio = Math.round(totalAltitud / cantidad);

  return {
    totalSaltos: saltos.length,
    minutosTotalesCaidaLibre: minutosCaidaLibre,
    altitudPromedioMetros: altitudPromedio,
    saltosPorModalidad,
    elegibleLicenciaB: saltos.length >= 50,
  };
}

const saltosClub: RegistroSalto[] = [
  { id: "sk-01", paracaidista: "Evelyn Barrios", modalidad: "AFF", altitudMetros: 4000, segundosCaidaLibre: 55, aterrizajeExitoso: true },
  { id: "sk-02", paracaidista: "Evelyn Barrios", modalidad: "Freefly", altitudMetros: 4200, segundosCaidaLibre: 60, aterrizajeExitoso: true },
  { id: "sk-03", paracaidista: "Evelyn Barrios", modalidad: "Wingsuit", altitudMetros: 4500, segundosCaidaLibre: 85, aterrizajeExitoso: true },
];

console.log("=== BITACORA DE PARACAIDISMO ===");
const metricasSalto = procesarBitacora(saltosClub);
console.log(`Saltos registrados: ${metricasSalto.totalSaltos} | Tiempo en caida libre: ${metricasSalto.minutosTotalesCaidaLibre} minutos`);
console.log(`Altitud media: ${metricasSalto.altitudPromedioMetros} m | Califica Licencia B: ${metricasSalto.elegibleLicenciaB ? "Aprobado" : "Pendiente acumulacion"}`);