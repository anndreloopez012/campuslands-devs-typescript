export {};

// tipos
interface AutoLujo {
  readonly id: number;
  readonly modelo: string;
  precioReservaUsd: number;
}

interface Puja {
  readonly autoId: number;
  readonly postor: string;
  montoUsd: number;
}

// clases
class Subasta {
  private readonly autos: Map<number, AutoLujo>;
  private pujas = new Map<number, Puja>();

  constructor(autos: AutoLujo[]) {
    this.autos = new Map(autos.map((auto) => [auto.id, auto]));
  }

  ofertar(autoId: number, postor: string, montoUsd: number): boolean {
    const auto = this.autos.get(autoId);
    if (!auto) return false;

    const pujaActual = this.pujas.get(autoId);
    const montoMinimo = pujaActual ? pujaActual.montoUsd + 1000 : auto.precioReservaUsd;

    if (montoUsd < montoMinimo) return false;

    this.pujas.set(autoId, { autoId, postor, montoUsd });
    return true;
  }

  pujaMasAlta(autoId: number): Puja | null {
    return this.pujas.get(autoId) ?? null;
  }

  cerrar(): string[] {
    const resultados: string[] = [];
    this.autos.forEach((auto, id) => {
      const puja = this.pujas.get(id);
      resultados.push(puja ? `${auto.modelo} vendido a ${puja.postor} por $${puja.montoUsd}` : `${auto.modelo} desierta`);
    });
    return resultados;
  }
}

// generics
function contarUnicos<T>(items: T[]): number {
  return new Set(items).size;
}

// datos
const autos: AutoLujo[] = [
  { id: 1, modelo: 'Solaris GT', precioReservaUsd: 2_000_000 },
  { id: 2, modelo: 'Vendetta R', precioReservaUsd: 1_200_000 },
  { id: 3, modelo: 'Nube Evo', precioReservaUsd: 1_800_000 },
];

const intentos: Puja[] = [
  { autoId: 1, postor: 'Velas', montoUsd: 2_100_000 },
  { autoId: 1, postor: 'Nux', montoUsd: 2_150_000 },
  { autoId: 2, postor: 'Rios', montoUsd: 1_000_000 },
  { autoId: 2, postor: 'Rios', montoUsd: 1_250_000 },
  { autoId: 3, postor: 'Mena', montoUsd: 1_850_000 },
];

// salida
function mostrarResumen(autos: AutoLujo[], intentos: Puja[]): void {
  console.log('=== Subasta de autos de lujo ===');
  const subasta = new Subasta(autos);

  intentos.forEach((intento) => {
    const aceptada = subasta.ofertar(intento.autoId, intento.postor, intento.montoUsd);
    console.log(`Puja de ${intento.postor} por $${intento.montoUsd}: ${aceptada ? 'aceptada' : 'rechazada'}`);
  });

  console.log('Cierre de la subasta:');
  subasta.cerrar().forEach((resultado) => console.log(`- ${resultado}`));
  console.log(`Postores unicos: ${contarUnicos(intentos.map((intento) => intento.postor))}`);
}

mostrarResumen(autos, intentos);
