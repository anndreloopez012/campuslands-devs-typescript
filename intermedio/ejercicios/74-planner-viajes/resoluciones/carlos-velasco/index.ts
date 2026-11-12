export {};

// tipos
interface ActividadPlan {
  readonly id: number;
  readonly nombre: string;
  readonly dia: string;
  costoUsd: number;
  completada: boolean;
}

// persistencia simulada
interface AlmacenPlan {
  guardar(actividades: ActividadPlan[]): void;
  leer(): ActividadPlan[] | null;
}

class AlmacenPlanMemoria implements AlmacenPlan {
  private actividades: ActividadPlan[] | null = null;

  guardar(actividades: ActividadPlan[]): void {
    this.actividades = actividades.map((actividad) => ({ ...actividad }));
  }

  leer(): ActividadPlan[] | null {
    return this.actividades ? this.actividades.map((actividad) => ({ ...actividad })) : null;
  }
}

// clases
class PlannerViajes {
  private actividades: ActividadPlan[] = [];

  constructor(private readonly almacen: AlmacenPlan) {}

  cargar(actividades: ActividadPlan[]): void {
    this.actividades = [...actividades];
  }

  agregar(actividad: ActividadPlan): boolean {
    if (actividad.costoUsd < 0 || this.actividades.some((item) => item.id === actividad.id)) return false;
    this.actividades.push(actividad);
    this.almacen.guardar(this.actividades);
    return true;
  }

  completar(id: number): boolean {
    const actividad = this.actividades.find((item) => item.id === id);
    if (!actividad || actividad.completada) return false;
    actividad.completada = true;
    this.almacen.guardar(this.actividades);
    return true;
  }

  restaurar(): void {
    const actividades = this.almacen.leer();
    if (actividades) this.actividades = actividades;
  }

  reporte(): { total: number; completadas: number; pendientes: number } {
    return {
      total: this.actividades.length,
      completadas: this.actividades.filter((actividad) => actividad.completada).length,
      pendientes: this.actividades.filter((actividad) => !actividad.completada).length,
    };
  }
}

// dom
function renderizarPlan(actividades: ActividadPlan[], contenedorId: string): void {
  if (typeof document === 'undefined') return;

  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  contenedor.innerHTML = '';
  actividades.forEach((actividad) => {
    const linea = document.createElement('div');
    linea.textContent = `${actividad.completada ? '[x]' : '[ ]'} ${actividad.nombre} (${actividad.dia}) - $${actividad.costoUsd}`;
    contenedor.appendChild(linea);
  });
}

// datos
const actividades: ActividadPlan[] = [
  { id: 1, nombre: 'Tour centro historico', dia: 'lunes', costoUsd: 15, completada: false },
  { id: 2, nombre: 'Museo del oro', dia: 'martes', costoUsd: 8, completada: false },
  { id: 3, nombre: 'Cena tipica', dia: 'martes', costoUsd: 22, completada: false },
];

// salida
function mostrarResumen(): void {
  console.log('=== Planner de viajes DOM ===');
  const planner = new PlannerViajes(new AlmacenPlanMemoria());
  planner.cargar(actividades);

  planner.agregar({ id: 4, nombre: 'Mirador nocturno', dia: 'miercoles', costoUsd: 0, completada: false });
  console.log(`Duplicado: ${planner.agregar({ id: 1, nombre: 'Tour centro historico', dia: 'lunes', costoUsd: 15, completada: false }) ? 'aceptado' : 'rechazado'}`);

  planner.completar(1);
  planner.completar(1);
  planner.restaurar();

  const reporte = planner.reporte();
  console.log(`Total: ${reporte.total} | Completadas: ${reporte.completadas} | Pendientes: ${reporte.pendientes}`);

  renderizarPlan(actividades, 'planner-viajes');
}

mostrarResumen();
