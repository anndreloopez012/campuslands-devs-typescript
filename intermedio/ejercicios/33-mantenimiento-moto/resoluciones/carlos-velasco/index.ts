export {};

// tipos
interface TareaMantenimiento {
  readonly nombre: string;
  cadaKm: number;
  ultimoKilometraje: number;
  costo: number;
}

// clases
class PlanMantenimiento {
  private readonly kilometrajeMoto: number;
  private readonly tareas: TareaMantenimiento[];

  constructor(kilometrajeMoto: number, tareas: TareaMantenimiento[]) {
    this.kilometrajeMoto = kilometrajeMoto;
    this.tareas = [...tareas];
  }

  vencidas(): TareaMantenimiento[] {
    return this.tareas.filter((tarea) => this.kilometrajeMoto - tarea.ultimoKilometraje >= tarea.cadaKm);
  }

  proximaTarea(): TareaMantenimiento | null {
    const pendientes = this.tareas
      .filter((tarea) => !this.vencidas().includes(tarea))
      .sort((a, b) => (a.ultimoKilometraje + a.cadaKm) - (b.ultimoKilometraje + b.cadaKm));
    return pendientes[0] ?? null;
  }

  costoTotal(): number {
    return Number(this.tareas.reduce((total, tarea) => total + tarea.costo, 0).toFixed(2));
  }
}

// generics
function resumenLista<T>(items: T[], formatear: (item: T) => string): string {
  return items.map((item) => `- ${formatear(item)}`).join('\n') || '- sin registros';
}

// datos
const tareas: TareaMantenimiento[] = [
  { nombre: 'Cambio de aceite', cadaKm: 3000, ultimoKilometraje: 3000, costo: 35 },
  { nombre: 'Revision de cadena', cadaKm: 1000, ultimoKilometraje: 5500, costo: 12 },
  { nombre: 'Cambio de llantas', cadaKm: 12000, ultimoKilometraje: 2000, costo: 140 },
];

// salida
function mostrarResumen(kilometraje: number): void {
  console.log('=== Plan de mantenimiento de moto ===');
  const plan = new PlanMantenimiento(kilometraje, tareas);

  console.log(`Moto con ${kilometraje} km | Tareas vencidas:`);
  console.log(resumenLista(plan.vencidas(), (tarea) => `${tarea.nombre} ($${tarea.costo})`));

  const proxima = plan.proximaTarea();
  console.log(`Proxima tarea sugerida: ${proxima ? `${proxima.nombre} a los ${proxima.ultimoKilometraje + proxima.cadaKm} km` : 'ninguna'}`);
  console.log(`Costo de tareas vencidas: $${plan.vencidas().reduce((total, tarea) => total + tarea.costo, 0)}`);
}

mostrarResumen(6200);
