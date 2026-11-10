export {};

// tipos
type EstadoRender = 'borrador' | 'en_revision' | 'aprobado' | 'rechazado';
type MotivoRechazo = 'iluminacion' | 'texturas' | 'escala' | 'perspectiva';

interface Render {
  readonly id: number;
  readonly plano: string;
  estado: EstadoRender;
  resolucion: number;
  motivoRechazo: MotivoRechazo | null;
  revisor: string | null;
}

// datos
const renders: Render[] = [
  { id: 1, plano: 'Planta baja', estado: 'aprobado', resolucion: 4096, motivoRechazo: null, revisor: 'Arq. Lima' },
  { id: 2, plano: 'Fachada norte', estado: 'rechazado', resolucion: 1024, motivoRechazo: 'iluminacion', revisor: 'Arq. Solis' },
  { id: 3, plano: 'Vista aerea', estado: 'en_revision', resolucion: 2048, motivoRechazo: null, revisor: 'Arq. Lima' },
  { id: 4, plano: 'Fachada sur', estado: 'borrador', resolucion: 0, motivoRechazo: 'texturas', revisor: null },
];

// reglas
const resolucionMinima = 2048;

// validacion
function validarRender(render: Render): string[] {
  const errores: string[] = [];

  if (render.resolucion < resolucionMinima) errores.push(`Render ${render.id}: resolucion insuficiente`);
  if (render.estado === 'rechazado' && render.motivoRechazo === null) errores.push(`Render ${render.id}: rechazado sin motivo`);
  if (render.estado === 'rechazado' && render.motivoRechazo !== null && render.resolucion >= resolucionMinima) {
    errores.push(`Render ${render.id}: revision inconsistente`);
  }

  return errores;
}

// calculos
function contarPorEstado(renders: Render[]): Record<EstadoRender, number> {
  return renders.reduce<Record<EstadoRender, number>>((acumulador, render) => {
    acumulador[render.estado] = (acumulador[render.estado] ?? 0) + 1;
    return acumulador;
  }, { borrador: 0, en_revision: 0, aprobado: 0, rechazado: 0 });
}

function rechazosPorMotivo(renders: Render[]): Map<MotivoRechazo, number> {
  return renders
    .filter((render) => render.motivoRechazo !== null)
    .reduce<Map<MotivoRechazo, number>>((mapa, render) => {
      const motivo = render.motivoRechazo as MotivoRechazo;
      mapa.set(motivo, (mapa.get(motivo) ?? 0) + 1);
      return mapa;
    }, new Map());
}

function revisoresActivos(renders: Render[]): Set<string> {
  return new Set(renders.map((render) => render.revisor).filter((revisor): revisor is string => revisor !== null));
}

function aprobarRender(render: Render): boolean {
  if (render.estado !== 'en_revision' || render.resolucion < resolucionMinima) return false;
  render.estado = 'aprobado';
  return true;
}

// salida
function mostrarResumen(renders: Render[]): void {
  console.log('=== Revision de renders de arquitectura ===');
  console.log('Por estado:', contarPorEstado(renders));
  rechazosPorMotivo(renders).forEach((cantidad, motivo) => {
    console.log(`Rechazos por ${motivo}: ${cantidad}`);
  });
  console.log(`Revisores activos: ${[...revisoresActivos(renders)].join(', ')}`);

  const aprobado = aprobarRender(renders[2]);
  console.log(`Aprobacion de "Vista aerea": ${aprobado ? 'aprobado' : 'denegada'}`);

  renders.forEach((render) => {
    const errores = validarRender(render);
    if (errores.length > 0) console.log(`Alerta: ${errores.join('; ')}`);
  });
}

mostrarResumen(renders);
