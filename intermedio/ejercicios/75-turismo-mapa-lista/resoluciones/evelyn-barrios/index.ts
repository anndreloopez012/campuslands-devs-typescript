export {};

type TipoAtraccion = "Monumento" | "Parque Natural" | "Museo" | "Playa";

interface PuntoInteresTuristicoDTO {
  readonly id: string;
  readonly nombreLugar: string;
  readonly tipo: TipoAtraccion;
  readonly ciudad: string;
  readonly valoracionPromedio: number;
  readonly tarifaEntradaEur: number;
}

class CatalogoTuristicoRepositorio {
  private atracciones: PuntoInteresTuristicoDTO[] = [];

  agregarPunto(punto: PuntoInteresTuristicoDTO): void {
    this.atracciones.push(punto);
  }

  buscarPorCiudad(ciudad: string): readonly PuntoInteresTuristicoDTO[] {
    return this.atracciones.filter((a) => a.ciudad.toLowerCase() === ciudad.toLowerCase());
  }

  obtenerTopValoradas(minimoEstrellas: number): readonly PuntoInteresTuristicoDTO[] {
    return this.atracciones
      .filter((a) => a.valoracionPromedio >= minimoEstrellas)
      .sort((a, b) => b.valoracionPromedio - a.valoracionPromedio);
  }
}

function main() {
  console.log("=== LISTA TURISTICA INTERACTIVA (DTO & REPOSITORIO) ===");
  const repo = new CatalogoTuristicoRepositorio();

  repo.agregarPunto({ id: "atr-1", nombreLugar: "Sagrada Familia", tipo: "Monumento", ciudad: "Barcelona", valoracionPromedio: 4.8, tarifaEntradaEur: 26 });
  repo.agregarPunto({ id: "atr-2", nombreLugar: "Parque Guell", tipo: "Parque Natural", ciudad: "Barcelona", valoracionPromedio: 4.6, tarifaEntradaEur: 10 });
  repo.agregarPunto({ id: "atr-3", nombreLugar: "Museo del Prado", tipo: "Museo", ciudad: "Madrid", valoracionPromedio: 4.9, tarifaEntradaEur: 15 });

  const topBcn = repo.buscarPorCiudad("Barcelona");
  console.log(`Atracciones en Barcelona: ${topBcn.length}`);
  topBcn.forEach((a) => {
    console.log(`- ${a.nombreLugar} (${a.tipo}) | Valoracion: ${a.valoracionPromedio}/5 | Entrada: €${a.tarifaEntradaEur}`);
  });

  const destacadas = repo.obtenerTopValoradas(4.7);
  console.log(`Puntos de interes con excelencia (>= 4.7): ${destacadas.length}`);
  destacadas.forEach((a) => console.log(`★ ${a.nombreLugar} (${a.ciudad}) - ${a.valoracionPromedio}`));
}

main();
