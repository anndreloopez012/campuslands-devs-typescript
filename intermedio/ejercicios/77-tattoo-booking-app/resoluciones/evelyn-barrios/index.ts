export {};

type EstiloTatuaje = "Realismo Sombras" | "Neotradicional" | "Fine Line" | "Blackwork";

interface ReservaTattooDTO {
  readonly idCita: string;
  readonly nombreCliente: string;
  readonly artista: string;
  readonly estilo: EstiloTatuaje;
  readonly horasEstimadas: number;
  readonly tarifaPorHoraUsd: number;
  readonly abonoConfirmadoUsd: number;
}

interface ResumenCitaReporte {
  readonly idCita: string;
  readonly costoTotalEstimadoUsd: number;
  readonly saldoPendienteUsd: number;
}

class GestorReservasTattoo {
  private reservas: ReservaTattooDTO[] = [];

  agendarCita(cita: ReservaTattooDTO): void {
    this.reservas.push(cita);
  }

  liquidarCita(idCita: string): ResumenCitaReporte | undefined {
    const cita = this.reservas.find((r) => r.idCita === idCita);
    if (!cita) return undefined;

    const total = cita.horasEstimadas * cita.tarifaPorHoraUsd;
    const saldo = total - cita.abonoConfirmadoUsd;

    return {
      idCita: cita.idCita,
      costoTotalEstimadoUsd: total,
      saldoPendienteUsd: saldo,
    };
  }

  consultarPorArtista(artista: string): readonly ReservaTattooDTO[] {
    return this.reservas.filter((r) => r.artista.toLowerCase() === artista.toLowerCase());
  }
}

function main() {
  console.log("=== BOOKING TATTOO APP (ARQUITECTURA DTO) ===");
  const booking = new GestorReservasTattoo();

  const cita: ReservaTattooDTO = {
    idCita: "TAT-450",
    nombreCliente: "Mariana Rojas",
    artista: "Daniel Rivera",
    estilo: "Fine Line",
    horasEstimadas: 3,
    tarifaPorHoraUsd: 80,
    abonoConfirmadoUsd: 50,
  };

  booking.agendarCita(cita);
  const liquidacion = booking.liquidarCita(cita.idCita);

  console.log(`Cita agendada: ${cita.idCita} con el artista ${cita.artista} (${cita.estilo})`);
  if (liquidacion) {
    console.log(`Total sesion: $${liquidacion.costoTotalEstimadoUsd} USD | Anticipo: $${cita.abonoConfirmadoUsd} USD | Saldo pendiente en estudio: $${liquidacion.saldoPendienteUsd} USD`);
  }
}

main();
