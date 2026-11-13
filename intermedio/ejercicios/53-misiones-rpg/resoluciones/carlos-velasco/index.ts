export {};

// tipos
type DificultadMision = 'facil' | 'normal' | 'dificil' | 'legendaria';
type EstadoMision = 'bloqueada' | 'disponible' | 'en_curso' | 'completada';

interface Mision {
  readonly id: number;
  readonly titulo: string;
  dificultad: DificultadMision;
  recompensaOro: number;
  minutosEstimados: number;
  estado: EstadoMision;
  dependeDe: number | null;
}

// errores
class ErrorMisionBloqueada extends Error {
  constructor(id: number) {
    super(`mision ${id} tiene dependencias pendientes`);
    this.name = 'ErrorMisionBloqueada';
  }
}

class ErrorEstado extends Error {
  constructor(id: number, estado: string) {
    super(`mision ${id} no puede avanzar desde ${estado}`);
    this.name = 'ErrorEstado';
  }
}

// clases
class GestorMisiones {
  private readonly misiones = new Map<number, Mision>();

  constructor(misiones: Mision[]) {
    misiones.forEach((mision) => this.misiones.set(mision.id, mision));
  }

  private estaDesbloqueada(mision: Mision): boolean {
    if (mision.dependeDe === null) return true;
    const dependencia = this.misiones.get(mision.dependeDe);
    return dependencia ? dependencia.estado === 'completada' : true;
  }

  iniciar(id: number): void {
    const mision = this.misiones.get(id);
    if (!mision) throw new Error(`mision ${id} no existe`);
    if (mision.estado === 'completada' || mision.estado === 'en_curso') throw new ErrorEstado(id, mision.estado);
    if (!this.estaDesbloqueada(mision)) throw new ErrorMisionBloqueada(id);
    mision.estado = 'en_curso';
  }

  completar(id: number): number {
    const mision = this.misiones.get(id);
    if (!mision || mision.estado !== 'en_curso') throw new ErrorEstado(id, mision?.estado ?? 'inexistente');
    mision.estado = 'completada';
    return mision.recompensaOro;
  }

  actualizarEstados(): void {
    this.misiones.forEach((mision) => {
      if (mision.estado === 'bloqueada' && this.estaDesbloqueada(mision)) {
        mision.estado = 'disponible';
      }
    });
  }
}

// datos
const misiones: Mision[] = [
  { id: 1, titulo: 'Caza de lobos', dificultad: 'facil', recompensaOro: 50, minutosEstimados: 15, estado: 'disponible', dependeDe: null },
  { id: 2, titulo: 'Infiltracion al fuerte', dificultad: 'dificil', recompensaOro: 180, minutosEstimados: 40, estado: 'bloqueada', dependeDe: 1 },
  { id: 3, titulo: 'El dragon anciano', dificultad: 'legendaria', recompensaOro: 500, minutosEstimados: 90, estado: 'bloqueada', dependeDe: 2 },
];

// salida
function mostrarResumen(): void {
  console.log('=== Gestor de misiones RPG ===');
  const gestor = new GestorMisiones(misiones);

  try {
    gestor.iniciar(2);
  } catch (error) {
    console.log(`Rechazo: ${error instanceof Error ? error.message : 'desconocido'}`);
  }

  gestor.iniciar(1);
  const oro1 = gestor.completar(1);
  console.log(`Mision 1 completada: +${oro1} oro`);

  gestor.actualizarEstados();
  console.log('Estados:', JSON.stringify(misiones.map((mision) => ({ id: mision.id, estado: mision.estado }))));

  try {
    const oro2 = gestor.completar(2);
    console.log(`Mision 2 completada: +${oro2} oro`);
  } catch (error) {
    console.log(`Rechazo: ${error instanceof Error ? error.message : 'desconocido'}`);
  }

  gestor.iniciar(2);
  const oro2 = gestor.completar(2);
  console.log(`Mision 2 completada tras desbloqueo: +${oro2} oro`);
}

mostrarResumen();
