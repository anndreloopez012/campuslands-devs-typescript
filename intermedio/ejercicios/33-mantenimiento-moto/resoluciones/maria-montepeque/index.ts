export {};

interface TareaMantenimiento {
  readonly nombre: string;
  readonly cadaKm: number;
  readonly costo: number;
}

interface RegistroServicio<T> {
  readonly tarea: T;
  readonly kmUltimoServicio: number;
}

type EstadoTarea = "al-dia" | "proxima" | "vencida";

class PlanMantenimiento<T extends TareaMantenimiento> {
  private readonly registros: RegistroServicio<T>[] = [];

  constructor(
    readonly moto: string,
    private kmActual: number,
  ) {}

  agregar(tarea: T, kmUltimoServicio: number): void {
    if (tarea.cadaKm <= 0) throw new Error(`Intervalo invalido en "${tarea.nombre}"`);
    if (kmUltimoServicio > this.kmActual) throw new Error(`Servicio futuro en "${tarea.nombre}"`);
    this.registros.push({ tarea, kmUltimoServicio });
  }

  actualizarKm(km: number): void {
    if (km < this.kmActual) throw new Error("El kilometraje no puede bajar");
    this.kmActual = km;
  }

  estado(registro: RegistroServicio<T>): EstadoTarea {
    const recorrido = this.kmActual - registro.kmUltimoServicio;
    if (recorrido >= registro.tarea.cadaKm) return "vencida";
    return registro.tarea.cadaKm - recorrido <= 500 ? "proxima" : "al-dia";
  }

  pendientes(): RegistroServicio<T>[] {
    return this.registros.filter((r) => this.estado(r) !== "al-dia");
  }

  costoPendiente(): number {
    return this.pendientes().reduce((acc, r) => acc + r.tarea.costo, 0);
  }

  resumen(): string[] {
    return this.registros.map((r) => `${r.tarea.nombre}: ${this.estado(r)}`);
  }
}

const plan = new PlanMantenimiento<TareaMantenimiento>("Yamaha MT-07", 12400);
const intentos: [TareaMantenimiento, number][] = [
  [{ nombre: "Cambio de aceite", cadaKm: 5000, costo: 45 }, 8000],
  [{ nombre: "Kit de arrastre", cadaKm: 20000, costo: 180 }, 0],
  [{ nombre: "Pastillas de freno", cadaKm: 8000, costo: 70 }, 4800],
  [{ nombre: "Filtro de aire", cadaKm: 0, costo: 20 }, 0],
  [{ nombre: "Bujias", cadaKm: 10000, costo: 60 }, 15000],
];

console.log("Ejercicio 33: Plan de mantenimiento de moto");
intentos.forEach(([tarea, km]) => {
  try {
    plan.agregar(tarea, km);
  } catch (error) {
    console.log(`  ! ${error instanceof Error ? error.message : "Error desconocido"}`);
  }
});
console.log(`Moto: ${plan.moto}`);
plan.resumen().forEach((linea) => console.log(`  ${linea}`));
console.log(`Tareas pendientes: ${plan.pendientes().length} | costo estimado: $${plan.costoPendiente()}`);
