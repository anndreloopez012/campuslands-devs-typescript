export {};

// tipos
type PrioridadRender = 'baja' | 'normal' | 'alta';
type EstadoTrabajo = 'en_cola' | 'renderizando' | 'terminado' | 'fallido';

interface TrabajoRender {
  readonly id: number;
  readonly escena: string;
  prioridad: PrioridadRender;
  frames: number;
  estado: EstadoTrabajo;
}

// clases
class RenderFarm {
  private readonly trabajos: TrabajoRender[] = [];

  encolar(trabajo: TrabajoRender): void {
    this.trabajos.push(trabajo);
  }

  siguiente(): TrabajoRender | null {
    const enCola = this.trabajos
      .filter((trabajo) => trabajo.estado === 'en_cola')
      .sort((a, b) => ordenPrioridad(a.prioridad) - ordenPrioridad(b.prioridad) || a.frames - b.frames);

    const siguiente = enCola[0] ?? null;
    if (siguiente) siguiente.estado = 'renderizando';
    return siguiente;
  }

  terminar(id: number, exito: boolean): boolean {
    const trabajo = this.trabajos.find((item) => item.id === id);
    if (!trabajo || trabajo.estado !== 'renderizando') return false;
    trabajo.estado = exito ? 'terminado' : 'fallido';
    return true;
  }

  reporte(): Record<EstadoTrabajo, number> {
    return this.trabajos.reduce<Record<EstadoTrabajo, number>>((conteo, trabajo) => {
      conteo[trabajo.estado] += 1;
      return conteo;
    }, { en_cola: 0, renderizando: 0, terminado: 0, fallido: 0 });
  }

  framesEnCola(): number {
    return this.trabajos.filter((trabajo) => trabajo.estado === 'en_cola').reduce((total, trabajo) => total + trabajo.frames, 0);
  }
}

// validacion
function ordenPrioridad(prioridad: PrioridadRender): number {
  const orden: Record<PrioridadRender, number> = { alta: 0, normal: 1, baja: 2 };
  return orden[prioridad];
}

// datos
const trabajos: TrabajoRender[] = [
  { id: 1, escena: 'Calle nocturna', prioridad: 'normal', frames: 240, estado: 'en_cola' },
  { id: 2, escena: 'Explosion protagonista', prioridad: 'alta', frames: 90, estado: 'en_cola' },
  { id: 3, escena: 'Cielo de fondo', prioridad: 'baja', frames: 120, estado: 'en_cola' },
  { id: 4, escena: 'Titulos finales', prioridad: 'normal', frames: 0, estado: 'en_cola' },
];

// salida
function mostrarResumen(): void {
  console.log('=== Render farm 3D ===');
  const farm = new RenderFarm();
  trabajos.forEach((trabajo) => farm.encolar(trabajo));

  for (let turno = 1; turno <= 3; turno += 1) {
    const trabajo = farm.siguiente();
    if (trabajo) {
      console.log(`Turno ${turno}: ${trabajo.escena} (${trabajo.prioridad})`);
      farm.terminar(trabajo.id, trabajo.frames > 0);
    }
  }

  console.log('Estado de la granja:', JSON.stringify(farm.reporte()));
  console.log(`Frames en cola: ${farm.framesEnCola()}`);

  trabajos.forEach((trabajo) => {
    if (trabajo.frames <= 0) console.log(`Alerta: ${trabajo.escena} sin frames definidos`);
  });
}

mostrarResumen();
