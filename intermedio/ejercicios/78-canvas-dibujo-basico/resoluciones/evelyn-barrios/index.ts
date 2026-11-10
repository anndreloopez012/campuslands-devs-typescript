export {};

type HerramientaTrazo = "Pincel" | "Pluma" | "Borrador";

interface TrazoDibujoDTO {
  readonly idTrazo: string;
  readonly herramienta: HerramientaTrazo;
  readonly colorHex: string;
  readonly grosorPx: number;
  readonly puntosCoordenadas: readonly { readonly x: number; readonly y: number }[];
}

interface LienzoDibujoDTO {
  readonly anchoPx: number;
  readonly altoPx: number;
  readonly trazos: readonly TrazoDibujoDTO[];
}

class MotorCanvasDibujo {
  private historialTrazos: TrazoDibujoDTO[] = [];

  constructor(private readonly ancho: number, private readonly alto: number) {}

  agregarTrazo(trazo: TrazoDibujoDTO): void {
    this.historialTrazos.push(trazo);
  }

  deshacerUltimoTrazo(): TrazoDibujoDTO | undefined {
    return this.historialTrazos.pop();
  }

  obtenerEstadoLienzo(): LienzoDibujoDTO {
    return {
      anchoPx: this.ancho,
      altoPx: this.alto,
      trazos: [...this.historialTrazos],
    };
  }
}

function main() {
  console.log("=== CANVAS DE DIBUJO BASICO (DTO & MOTOR) ===");
  const lienzo = new MotorCanvasDibujo(1920, 1080);

  lienzo.agregarTrazo({
    idTrazo: "trk-1",
    herramienta: "Pincel",
    colorHex: "#FF0055",
    grosorPx: 8,
    puntosCoordenadas: [{ x: 10, y: 15 }, { x: 25, y: 30 }, { x: 40, y: 45 }],
  });

  lienzo.agregarTrazo({
    idTrazo: "trk-2",
    herramienta: "Pluma",
    colorHex: "#000000",
    grosorPx: 2,
    puntosCoordenadas: [{ x: 100, y: 120 }, { x: 130, y: 150 }],
  });

  const estado = lienzo.obtenerEstadoLienzo();
  console.log(`Lienzo (${estado.anchoPx}x${estado.altoPx}) con ${estado.trazos.length} trazos renderizados.`);
  estado.trazos.forEach((t) => {
    console.log(`- Trazo ${t.idTrazo}: ${t.herramienta} [${t.colorHex}] - ${t.puntosCoordenadas.length} vertices`);
  });
}

main();
