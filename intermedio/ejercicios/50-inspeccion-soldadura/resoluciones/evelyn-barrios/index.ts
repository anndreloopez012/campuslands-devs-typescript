export {};

type TipoEnsayo = "Visual Directo" | "Liquidos Penetrantes" | "Ultrasonido" | "Radiografia Industrial";

interface RegistroInspeccionSoldadura {
  readonly idInspeccion: string;
  readonly estructura: string;
  readonly tipoEnsayo: TipoEnsayo;
  readonly defectosDetectados: number;
  readonly cumpleNormaAWS: boolean;
}

class AuditoriaEnsayosSoldadura<T extends RegistroInspeccionSoldadura> {
  private inspecciones: T[] = [];

  registrarInspeccion(inspeccion: T): void {
    this.inspecciones.push(inspeccion);
  }

  obtenerTotalDefectos(): number {
    return this.inspecciones.reduce((acc, i) => acc + i.defectosDetectados, 0);
  }

  obtenerTasaAprobacionAWS(): number {
    if (this.inspecciones.length === 0) return 0;
    const conformes = this.inspecciones.filter((i) => i.cumpleNormaAWS).length;
    return Number(((conformes / this.inspecciones.length) * 100).toFixed(1));
  }
}

const controlCalidad = new AuditoriaEnsayosSoldadura<RegistroInspeccionSoldadura>();
controlCalidad.registrarInspeccion({ idInspeccion: "INS-01", estructura: "Viga Principal Puente", tipoEnsayo: "Ultrasonido", defectosDetectados: 0, cumpleNormaAWS: true });
controlCalidad.registrarInspeccion({ idInspeccion: "INS-02", estructura: "Tanque Presurizado", tipoEnsayo: "Radiografia Industrial", defectosDetectados: 1, cumpleNormaAWS: false });
controlCalidad.registrarInspeccion({ idInspeccion: "INS-03", estructura: "Soporte Caldera", tipoEnsayo: "Visual Directo", defectosDetectados: 0, cumpleNormaAWS: true });

console.log("=== INSPECCION VISUAL Y NO DESTRUCTIVA DE SOLDADURA ===");
console.log(`Defectos criticos detectados: ${controlCalidad.obtenerTotalDefectos()}`);
console.log(`Conformidad con Norma AWS: ${controlCalidad.obtenerTasaAprobacionAWS()}%`);