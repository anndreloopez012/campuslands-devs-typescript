export {};

type RolCompetitivo = "Top" | "Jungla" | "Mid" | "ADC" | "Support";
type BandoMapa = "Lado Azul" | "Lado Rojo";

interface CampeonDraft {
  readonly idCampeon: string;
  readonly nombre: string;
  readonly rolesAptos: readonly RolCompetitivo[];
  readonly poderMetaTier: "S+" | "S" | "A" | "B";
}

interface SeleccionDraft {
  readonly bando: BandoMapa;
  readonly campeon: CampeonDraft;
  readonly rolAsignado: RolCompetitivo;
}

interface EstadoDraft {
  readonly bansAzul: readonly string[];
  readonly bansRojo: readonly string[];
  readonly picksAzul: readonly SeleccionDraft[];
  readonly picksRojo: readonly SeleccionDraft[];
}

interface BalanceComposicion {
  readonly bando: BandoMapa;
  readonly rolesCompletos: boolean;
  readonly campeonesTierS: number;
}

function auditarComposicion(picks: readonly SeleccionDraft[], bando: BandoMapa): BalanceComposicion {
  const rolesCubiertos = new Set<RolCompetitivo>();
  let campeonesTierS = 0;

  for (const pick of picks) {
    rolesCubiertos.add(pick.rolAsignado);
    if (pick.campeon.poderMetaTier === "S+" || pick.campeon.poderMetaTier === "S") {
      campeonesTierS += 1;
    }
  }

  return {
    bando,
    rolesCompletos: rolesCubiertos.size === 5,
    campeonesTierS,
  };
}

const picksEquipoAzul: SeleccionDraft[] = [
  { bando: "Lado Azul", campeon: { idCampeon: "c-01", nombre: "Aatrox", rolesAptos: ["Top"], poderMetaTier: "S" }, rolAsignado: "Top" },
  { bando: "Lado Azul", campeon: { idCampeon: "c-02", nombre: "Sejuani", rolesAptos: ["Jungla"], poderMetaTier: "A" }, rolAsignado: "Jungla" },
  { bando: "Lado Azul", campeon: { idCampeon: "c-03", nombre: "Azir", rolesAptos: ["Mid"], poderMetaTier: "S+" }, rolAsignado: "Mid" },
  { bando: "Lado Azul", campeon: { idCampeon: "c-04", nombre: "Varus", rolesAptos: ["ADC"], poderMetaTier: "S" }, rolAsignado: "ADC" },
  { bando: "Lado Azul", campeon: { idCampeon: "c-05", nombre: "Nautilus", rolesAptos: ["Support"], poderMetaTier: "A" }, rolAsignado: "Support" },
];

console.log("=== DRAFT INTELIGENTE MOBA ===");
const reporteAzul = auditarComposicion(picksEquipoAzul, "Lado Azul");
console.log(`Evaluacion: ${reporteAzul.bando}`);
console.log(`Sinergia de 5 roles completos: ${reporteAzul.rolesCompletos ? "Estructura Correcta" : "Composicion Incompleta"}`);
console.log(`Presencia de campeones Tier S/S+: ${reporteAzul.campeonesTierS} selecciones meta`);