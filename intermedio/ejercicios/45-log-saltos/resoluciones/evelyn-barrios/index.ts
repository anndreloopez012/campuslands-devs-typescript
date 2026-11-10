export {};

type TipoAeronave = "Cessna Caravan" | "Pilatus Porter" | "Twin Otter";

interface EntradaSaltoAvanzado {
  readonly idSalto: string;
  readonly fecha: string;
  readonly aeronave: TipoAeronave;
  readonly altitudAperturaMetros: number;
  readonly segundosLibres: number;
  readonly aprobadoInstructor: boolean;
}

class RegistroSaltosAvanzado<T extends EntradaSaltoAvanzado> {
  private saltos: T[] = [];

  registrar(salto: T): void {
    this.saltos.push(salto);
  }

  obtenerTiempoTotalSegundos(): number {
    return this.saltos.reduce((acc, s) => acc + s.segundosLibres, 0);
  }

  obtenerSaltosValidados(): T[] {
    return this.saltos.filter((s) => s.aprobadoInstructor);
  }
}

const registro = new RegistroSaltosAvanzado<EntradaSaltoAvanzado>();
registro.registrar({ idSalto: "SK-901", fecha: "2026-11-10", aeronave: "Twin Otter", altitudAperturaMetros: 1100, segundosLibres: 58, aprobadoInstructor: true });
registro.registrar({ idSalto: "SK-902", fecha: "2026-11-10", aeronave: "Twin Otter", altitudAperturaMetros: 1050, segundosLibres: 62, aprobadoInstructor: true });

console.log("=== LOG AVANZADO DE SALTOS ===");
console.log(`Segundos totales en caida libre: ${registro.obtenerTiempoTotalSegundos()}s`);
console.log(`Saltos firmados por instructor: ${registro.obtenerSaltosValidados().length}`);