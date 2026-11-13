export {};

// tipos
type TipoParada = 'museo' | 'naturaleza' | 'comida' | 'mirador';

interface Parada {
  readonly nombre: string;
  tipo: TipoParada;
  costoUsd: number;
  minutosEstancia: number;
}

interface Ruta {
  readonly id: number;
  readonly ciudad: string;
  paradas: Parada[];
}

// clases
class PlanificadorRutas {
  private readonly rutas: Ruta[] = [];

  registrar(ruta: Ruta): void {
    this.rutas.push(ruta);
  }

  duracion(ruta: Ruta): number {
    return ruta.paradas.reduce((total, parada) => total + parada.minutosEstancia, 0);
  }

  costo(ruta: Ruta): number {
    return ruta.paradas.reduce((total, parada) => total + parada.costoUsd, 0);
  }

  mejorRuta(): Ruta | null {
    if (this.rutas.length === 0) return null;
    return [...this.rutas].sort((a, b) => this.costo(a) / this.duracion(a) - this.costo(b) / this.duracion(b))[0];
  }

  filtrarPorTipo(tipo: TipoParada): Ruta[] {
    return this.rutas.filter((ruta) => ruta.paradas.some((parada) => parada.tipo === tipo));
  }

  resumenRuta(ruta: Ruta): string {
    return `${ruta.id} (${ruta.ciudad}) | ${ruta.paradas.length} paradas | ${this.duracion(ruta)} min | $${this.costo(ruta)}`;
  }
}

// validacion
function validarRuta(ruta: Ruta): string[] {
  const errores: string[] = [];

  if (ruta.paradas.length === 0) errores.push(`Ruta ${ruta.id}: sin paradas`);
  if (ruta.paradas.some((parada) => parada.minutosEstancia <= 0)) errores.push(`Ruta ${ruta.id}: estancia invalida`);
  if (ruta.paradas.some((parada) => parada.costoUsd < 0)) errores.push(`Ruta ${ruta.id}: costo negativo`);

  return errores;
}

// datos
const paradasQuito: Parada[] = [
  { nombre: 'Centro historico', tipo: 'museo', costoUsd: 5, minutosEstancia: 120 },
  { nombre: 'Mirador del Panecillo', tipo: 'mirador', costoUsd: 2, minutosEstancia: 60 },
];

const paradasBanos: Parada[] = [
  { nombre: 'Cascada Pailon', tipo: 'naturaleza', costoUsd: 3, minutosEstancia: 90 },
  { nombre: 'Almuerzo local', tipo: 'comida', costoUsd: 8, minutosEstancia: 45 },
];

const paradasVacia: Parada[] = [];

// salida
function mostrarResumen(planificador: PlanificadorRutas): void {
  console.log('=== Rutas turisticas inteligentes ===');

  [paradasQuito, paradasBanos, paradasVacia].forEach((paradas, indice) => {
    const ruta: Ruta = { id: indice + 1, ciudad: indice === 0 ? 'Quito' : indice === 1 ? 'Banos' : 'Sin definir', paradas };
    planificador.registrar(ruta);
    console.log(`Ruta ${planificador.resumenRuta(ruta)}${validarRuta(ruta).length > 0 ? ` | ${validarRuta(ruta).join('; ')}` : ''}`);
  });

  const mejor = planificador.mejorRuta();
  console.log(`Mejor ruta por costo/minuto: ${mejor ? `${mejor.id} (${mejor.ciudad})` : 'ninguna'}`);
  console.log(`Rutas con naturaleza: ${planificador.filtrarPorTipo('naturaleza').map((ruta) => ruta.id).join(', ')}`);
}

mostrarResumen(new PlanificadorRutas());
