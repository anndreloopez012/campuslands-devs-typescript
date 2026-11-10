export {};

// tipos
interface AccionPitStop {
  readonly nombre: string;
  segundos: number;
  obligatoria: boolean;
}

// clases
class PitStop {
  private readonly acciones: AccionPitStop[];

  constructor(acciones: AccionPitStop[]) {
    this.acciones = [...acciones];
  }

  duracionTotal(): number {
    return Number(this.acciones.reduce((total, accion) => total + accion.segundos, 0).toFixed(2));
  }

  obligatoriasFaltantes(): AccionPitStop[] {
    return this.acciones.filter((accion) => accion.obligatoria && accion.segundos === 0);
  }

  agregarAccion(accion: AccionPitStop): void {
    this.acciones.push(accion);
  }

  esValido(): boolean {
    return this.obligatoriasFaltantes().length === 0 && this.duracionTotal() > 0;
  }
}

// generics
class CajaSeguros<T> {
  private contenido: T | null = null;

  guardar(valor: T): void {
    this.contenido = valor;
  }

  extraer(): T | null {
    const valor = this.contenido;
    this.contenido = null;
    return valor;
  }
}

// datos
const accionesBase: AccionPitStop[] = [
  { nombre: 'cambio de llantas', segundos: 2.8, obligatoria: true },
  { nombre: 'ajuste de alerón', segundos: 1.2, obligatoria: false },
  { nombre: 'carga de combustible', segundos: 0, obligatoria: true },
];

// calculos
function compararPitStops(a: PitStop, b: PitStop): PitStop {
  return a.duracionTotal() <= b.duracionTotal() ? a : b;
}

// salida
function mostrarResumen(): void {
  console.log('=== Estrategia de pit stop ===');

  const planA = new PitStop(accionesBase);
  const planB = new PitStop(accionesBase.map((accion) => ({ ...accion, segundos: accion.nombre === 'carga de combustible' ? 4.5 : accion.segundos })));

  [planA, planB].forEach((plan, indice) => {
    console.log(`Plan ${String.fromCharCode(65 + indice)} | Duracion: ${plan.duracionTotal()}s | Valido: ${plan.esValido() ? 'si' : 'no'}`);
  });

  planA.agregarAccion({ nombre: 'carga de combustible', segundos: 6.5, obligatoria: true });
  console.log(`Plan A corregido | Duracion: ${planA.duracionTotal()}s | Valido: ${planA.esValido() ? 'si' : 'no'}`);

  const ganador = compararPitStops(planA, planB);
  console.log(`Pit stop mas rapido valido: ${ganador.duracionTotal()}s`);

  const seguro = new CajaSeguros<number>();
  seguro.guardar(planA.duracionTotal());
  console.log(`Tiempo en seguro extraido: ${seguro.extraer()}`);
}

mostrarResumen();
