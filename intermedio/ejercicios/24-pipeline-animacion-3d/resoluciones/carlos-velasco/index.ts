export {};

// tipos
type EtapaPipeline = 'modelado' | 'rigging' | 'animacion' | 'render';
type EstadoEtapa = 'pendiente' | 'en_progreso' | 'aprobada' | 'rechazada';

interface Etapa {
  readonly escena: string;
  readonly etapa: EtapaPipeline;
  estado: EstadoEtapa;
  horasEstimadas: number;
}

interface Escena {
  readonly nombre: string;
  etapas: Etapa[];
}

// datos
const pipeline: Escena[] = [
  { nombre: 'Calle nocturna', etapas: [
    { escena: 'Calle nocturna', etapa: 'modelado', estado: 'aprobada', horasEstimadas: 12 },
    { escena: 'Calle nocturna', etapa: 'rigging', estado: 'aprobada', horasEstimadas: 8 },
    { escena: 'Calle nocturna', etapa: 'animacion', estado: 'en_progreso', horasEstimadas: 16 },
    { escena: 'Calle nocturna', etapa: 'render', estado: 'pendiente', horasEstimadas: 6 },
  ] },
  { nombre: 'Nave de ataque', etapas: [
    { escena: 'Nave de ataque', etapa: 'modelado', estado: 'aprobada', horasEstimadas: 10 },
    { escena: 'Nave de ataque', etapa: 'rigging', estado: 'rechazada', horasEstimadas: 9 },
  ] },
];

// reglas
const ordenPipeline: EtapaPipeline[] = ['modelado', 'rigging', 'animacion', 'render'];

// validacion
function validarPipeline(escenas: Escena[]): string[] {
  const errores: string[] = [];

  escenas.forEach((escena) => {
    if (escena.etapas.length === 0) errores.push(`${escena.nombre}: sin etapas`);
    if (escena.etapas.some((etapa) => etapa.horasEstimadas <= 0)) errores.push(`${escena.nombre}: horas invalidas`);
  });

  return errores;
}

// calculos
function etapaActual(escena: Escena): EtapaPipeline | null {
  const enProgreso = escena.etapas.find((etapa) => etapa.estado === 'en_progreso');
  if (enProgreso) return enProgreso.etapa;

  const primeraPendiente = escena.etapas
    .filter((etapa) => etapa.estado === 'pendiente')
    .sort((a, b) => ordenPipeline.indexOf(a.etapa) - ordenPipeline.indexOf(b.etapa))[0];

  return primeraPendiente ? primeraPendiente.etapa : null;
}

function horasRestantes(escena: Escena): number {
  return escena.etapas
    .filter((etapa) => etapa.estado !== 'aprobada')
    .reduce((total, etapa) => total + etapa.horasEstimadas, 0);
}

function estadosPorEtapa(escenas: Escena[]): Record<EstadoEtapa, number> {
  const conteo: Record<EstadoEtapa, number> = { pendiente: 0, en_progreso: 0, aprobada: 0, rechazada: 0 };
  escenas.forEach((escena) => {
    escena.etapas.forEach((etapa) => {
      conteo[etapa.estado] += 1;
    });
  });
  return conteo;
}

function etapasConProblemas(escenas: Escena[]): Set<EtapaPipeline> {
  const problematicas = new Set<EtapaPipeline>();
  escenas.forEach((escena) => {
    escena.etapas
      .filter((etapa) => etapa.estado === 'rechazada')
      .forEach((etapa) => problematicas.add(etapa.etapa));
  });
  return problematicas;
}

// salida
function mostrarResumen(escenas: Escena[]): void {
  console.log('=== Pipeline de animacion 3D ===');
  console.log('Estados del pipeline:', estadosPorEtapa(escenas));
  console.log(`Etapas con rechazos: ${[...etapasConProblemas(escenas)].join(', ') || 'ninguna'}`);

  pipeline.forEach((escena) => {
    console.log(`${escena.nombre} | Etapa actual: ${etapaActual(escena) ?? 'completada'} | Horas restantes: ${horasRestantes(escena)}`);
  });

  validarPipeline(escenas).forEach((error) => console.log(`Alerta: ${error}`));
}

mostrarResumen(pipeline);
