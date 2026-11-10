export {};

type NivelDesgaste = "Optimo" | "Requiere Atencion" | "Critico Reemplazo";

interface TareaMantenimiento {
  readonly codigo: string;
  readonly componente: string;
  readonly intervaloKm: number;
  readonly ultimoCambioKm: number;
}

interface MotoUsuario {
  readonly placa: string;
  readonly modelo: string;
  readonly kilometrajeActual: number;
  readonly planMantenimiento: readonly TareaMantenimiento[];
}

interface DiagnosticoComponente {
  readonly componente: string;
  readonly kmRestantes: number;
  readonly estado: NivelDesgaste;
}

function generarDiagnostico(moto: MotoUsuario): DiagnosticoComponente[] {
  return moto.planMantenimiento.map((tarea) => {
    const kmDesdeUltimo = moto.kilometrajeActual - tarea.ultimoCambioKm;
    const kmRestantes = tarea.intervaloKm - kmDesdeUltimo;

    let estado: NivelDesgaste = "Optimo";
    if (kmRestantes <= 0) {
      estado = "Critico Reemplazo";
    } else if (kmRestantes <= tarea.intervaloKm * 0.2) {
      estado = "Requiere Atencion";
    }

    return {
      componente: tarea.componente,
      kmRestantes,
      estado,
    };
  });
}

const miYamaha: MotoUsuario = {
  placa: "MT07-COL",
  modelo: "Yamaha MT-07",
  kilometrajeActual: 18500,
  planMantenimiento: [
    { codigo: "OIL", componente: "Aceite 10W40 sintetico y filtro", intervaloKm: 5000, ultimoCambioKm: 14000 },
    { codigo: "CHN", componente: "Kit de arrastre (Cadena y piniones)", intervaloKm: 15000, ultimoCambioKm: 0 },
    { codigo: "BRK", componente: "Pastillas de freno sintetizadas", intervaloKm: 10000, ultimoCambioKm: 12000 },
  ],
};

console.log("=== PLAN DE MANTENIMIENTO PREVENTIVO MOTO ===");
console.log(`Vehiculo: ${miYamaha.modelo} (${miYamaha.placa}) | Odometro: ${miYamaha.kilometrajeActual} km`);
const checklist = generarDiagnostico(miYamaha);
checklist.forEach((diag) => {
  console.log(`- ${diag.componente}: ${diag.estado} (${diag.kmRestantes} km de margen)`);
});