export {};

type TecnicaDibujo = "Oleo Digital" | "Grafito Tradicional" | "Acuarela" | "Tinta China";

interface ObraArte {
  readonly id: string;
  readonly titulo: string;
  readonly tecnica: TecnicaDibujo;
  readonly horasInvertidas: number;
  readonly vendida: boolean;
  readonly precioVentaUsd: number;
}

class PortafolioArtista<T extends ObraArte> {
  private obras: T[] = [];

  agregarObra(obra: T): void {
    this.obras.push(obra);
  }

  obtenerHorasTotales(): number {
    return this.obras.reduce((acc, o) => acc + o.horasInvertidas, 0);
  }

  obtenerObrasDisponibles(): T[] {
    return this.obras.filter((o) => !o.vendida);
  }

  obtenerRecaudacionVentas(): number {
    return this.obras
      .filter((o) => o.vendida)
      .reduce((acc, o) => acc + o.precioVentaUsd, 0);
  }
}

const galeria = new PortafolioArtista<ObraArte>();
galeria.agregarObra({ id: "art-1", titulo: "Retrato al Crepusculo", tecnica: "Oleo Digital", horasInvertidas: 14, vendida: true, precioVentaUsd: 220 });
galeria.agregarObra({ id: "art-2", titulo: "Estudio Anatomico", tecnica: "Grafito Tradicional", horasInvertidas: 8, vendida: false, precioVentaUsd: 150 });

console.log("=== PORTAFOLIO DE DIBUJO ARTISTICO ===");
console.log(`Horas acumuladas de pintura: ${galeria.obtenerHorasTotales()} hrs`);
console.log(`Obras disponibles para adquisicion: ${galeria.obtenerObrasDisponibles().length}`);
console.log(`Ingresos consolidados por ventas: $${galeria.obtenerRecaudacionVentas()} USD`);