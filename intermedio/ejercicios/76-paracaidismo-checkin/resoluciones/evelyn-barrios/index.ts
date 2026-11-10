export {};

type ModalidadSalto = "Tandem" | "AFF Estudiante" | "Deportivo Licenciado";

interface SaltoParacaidismoDTO {
  readonly idCheckIn: string;
  readonly nombreSaltador: string;
  readonly modalidad: ModalidadSalto;
  readonly saltosPrevios: number;
  readonly pesoKg: number;
  readonly seguroAlDia: boolean;
  readonly altitudPies: number;
}

interface ManifiestoVueloDTO {
  readonly idVuelo: string;
  readonly saltadores: readonly SaltoParacaidismoDTO[];
  readonly altitudSaltoPies: number;
  readonly cupoMaximo: number;
}

class ManifiestoParacaidismoServicio {
  private saltadoresRegistrados: SaltoParacaidismoDTO[] = [];

  realizarCheckIn(registro: SaltoParacaidismoDTO): { exito: boolean; motivo?: string } {
    if (!registro.seguroAlDia) {
      return { exito: false, motivo: "Seguro de vida/accidentes no vigente." };
    }
    if (registro.pesoKg > 105) {
      return { exito: false, motivo: "Peso superior al limite seguro del equipo (105 kg)." };
    }
    this.saltadoresRegistrados.push(registro);
    return { exito: true };
  }

  generarManifiesto(idVuelo: string, altitudPies: number, cupo: number): ManifiestoVueloDTO {
    const listos = this.saltadoresRegistrados.slice(0, cupo);
    return {
      idVuelo,
      saltadores: listos,
      altitudSaltoPies: altitudPies,
      cupoMaximo: cupo,
    };
  }
}

function main() {
  console.log("=== CHECK-IN DE SALTO EN PARACAIDISMO (DTO & SERVICIO) ===");
  const servicio = new ManifiestoParacaidismoServicio();

  const saltador1: SaltoParacaidismoDTO = {
    idCheckIn: "chk-01",
    nombreSaltador: "Laura Gomez",
    modalidad: "Tandem",
    saltosPrevios: 0,
    pesoKg: 62,
    seguroAlDia: true,
    altitudPies: 14000,
  };

  const saltador2: SaltoParacaidismoDTO = {
    idCheckIn: "chk-02",
    nombreSaltador: "Mateo Silva",
    modalidad: "Deportivo Licenciado",
    saltosPrevios: 140,
    pesoKg: 78,
    seguroAlDia: true,
    altitudPies: 14000,
  };

  servicio.realizarCheckIn(saltador1);
  servicio.realizarCheckIn(saltador2);

  const manifiesto = servicio.generarManifiesto("CARAVAN-FL-08", 14000, 8);
  console.log(`Manifiesto emitido para vuelo ${manifiesto.idVuelo} a ${manifiesto.altitudSaltoPies} pies:`);
  manifiesto.saltadores.forEach((s, idx) => {
    console.log(`${idx + 1}. ${s.nombreSaltador} [${s.modalidad}] - Saltos: ${s.saltosPrevios} | Peso: ${s.pesoKg}kg`);
  });
}

main();
