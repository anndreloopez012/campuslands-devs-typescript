export {};

// tipos
type NivelInspeccion = 'visual' | 'detallada' | 'radiografia';
type Veredicto = 'aprobada' | 'reprobar' | 'requiere_revision';

interface Inspeccion {
  readonly id: number;
  readonly juntaId: number;
  nivel: NivelInspeccion;
  fecha: Date;
  porosidad: number;
  grietas: number;
  veredicto: Veredicto;
}

// clases
class InspectorSoldadura {
  private readonly inspecciones: Inspeccion[] = [];

  registrar(inspeccion: Inspeccion): Inspeccion {
    inspeccion.veredicto = evaluar(inspeccion);
    this.inspecciones.push(inspeccion);
    return inspeccion;
  }

  pendientesDeRevision(): Inspeccion[] {
    return this.inspecciones.filter((inspeccion) => inspeccion.veredicto === 'requiere_revision');
  }

  reporteMensual(mes: number): number {
    const delMes = this.inspecciones.filter((inspeccion) => inspeccion.fecha.getMonth() === mes);
    if (delMes.length === 0) return 0;
    const aprobadas = delMes.filter((inspeccion) => inspeccion.veredicto === 'aprobada').length;
    return Number(((aprobadas / delMes.length) * 100).toFixed(1));
  }

  defectosPorJunta(): Map<number, number> {
    return this.inspecciones.reduce<Map<number, number>>((mapa, inspeccion) => {
      mapa.set(inspeccion.juntaId, (mapa.get(inspeccion.juntaId) ?? 0) + inspeccion.porosidad + inspeccion.grietas);
      return mapa;
    }, new Map());
  }
}

// reglas
const porosidadMaxima = 3;

// validacion
function evaluar(inspeccion: Inspeccion): Veredicto {
  if (inspeccion.grietas > 0) return 'reprobar';
  if (inspeccion.porosidad > porosidadMaxima) return 'reprobar';
  if (inspeccion.nivel === 'visual' && inspeccion.porosidad > 1) return 'requiere_revision';
  return 'aprobada';
}

// datos
const inspecciones: Inspeccion[] = [
  { id: 1, juntaId: 10, nivel: 'visual', fecha: new Date('2026-10-20'), porosidad: 1, grietas: 0, veredicto: 'aprobada' },
  { id: 2, juntaId: 11, nivel: 'detallada', fecha: new Date('2026-11-03'), porosidad: 4, grietas: 0, veredicto: 'aprobada' },
  { id: 3, juntaId: 12, nivel: 'radiografia', fecha: new Date('2026-11-08'), porosidad: 2, grietas: 1, veredicto: 'aprobada' },
  { id: 4, juntaId: 11, nivel: 'detallada', fecha: new Date('2026-11-10'), porosidad: 2, grietas: 0, veredicto: 'aprobada' },
];

// salida
function mostrarResumen(): void {
  console.log('=== Inspeccion visual soldadura ===');
  const inspector = new InspectorSoldadura();

  inspecciones.forEach((inspeccion) => {
    const evaluada = inspector.registrar(inspeccion);
    console.log(`Inspeccion ${inspeccion.id} (junta ${inspeccion.juntaId}): ${evaluada.veredicto}`);
  });

  console.log(`Aprobacion de noviembre: ${inspector.reporteMensual(10)}%`);
  console.log('Defectos por junta:', JSON.stringify([...inspector.defectosPorJunta().entries()]));
  console.log(`En revision: ${inspector.pendientesDeRevision().length}`);
}

mostrarResumen();
