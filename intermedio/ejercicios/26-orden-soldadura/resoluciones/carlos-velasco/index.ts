export {};

// tipos
type TipoJunta = 'plano' | 'esquina' | 'traslape';
type CalidadSoldadura = 'aprobada' | 'defectuosa';

interface Soldadura {
  readonly id: number;
  readonly operador: string;
  tipoJunta: TipoJunta;
  calidad: CalidadSoldadura;
  defectos: string[];
  horasTrabajo: number;
}

// datos
const soldaduras: Soldadura[] = [
  { id: 1, operador: 'Velas', tipoJunta: 'plano', calidad: 'aprobada', defectos: [], horasTrabajo: 2.5 },
  { id: 2, operador: 'Velas', tipoJunta: 'esquina', calidad: 'defectuosa', defectos: ['porosidad', 'mordida'], horasTrabajo: 3 },
  { id: 3, operador: 'Rios', tipoJunta: 'traslape', calidad: 'aprobada', defectos: [], horasTrabajo: 1.5 },
  { id: 4, operador: 'Rios', tipoJunta: 'esquina', calidad: 'defectuosa', defectos: ['grieta'], horasTrabajo: 2 },
];

// reglas
const calidadRequerida = 0.85;

// validacion
function validarSoldadura(soldadura: Soldadura): string[] {
  const errores: string[] = [];

  if (soldadura.horasTrabajo <= 0) errores.push(`Soldadura ${soldadura.id}: horas invalidas`);
  if (soldadura.calidad === 'aprobada' && soldadura.defectos.length > 0) errores.push(`Soldadura ${soldadura.id}: aprobada con defectos`);

  return errores;
}

// calculos
function tasaAprobacion(soldaduras: Soldadura[]): number {
  if (soldaduras.length === 0) return 0;
  const aprobadas = soldaduras.filter((soldadura) => soldadura.calidad === 'aprobada').length;
  return Number((aprobadas / soldaduras.length).toFixed(2));
}

function rendimientoPorOperador(soldaduras: Soldadura[]): Map<string, number> {
  const grupos = new Map<string, Soldadura[]>();
  soldaduras.forEach((soldadura) => {
    const grupo = grupos.get(soldadura.operador) ?? [];
    grupo.push(soldadura);
    grupos.set(soldadura.operador, grupo);
  });

  const rendimiento = new Map<string, number>();
  grupos.forEach((grupo, operador) => {
    const horas = grupo.reduce((total, soldadura) => total + soldadura.horasTrabajo, 0);
    rendimiento.set(operador, Number((tasaAprobacion(grupo) * horas).toFixed(2)));
  });

  return rendimiento;
}

function defectosUnicos(soldaduras: Soldadura[]): Set<string> {
  return new Set(soldaduras.flatMap((soldadura) => soldadura.defectos));
}

function cumpleEstandar(soldaduras: Soldadura[]): boolean {
  return tasaAprobacion(soldaduras) >= calidadRequerida;
}

// salida
function mostrarResumen(soldaduras: Soldadura[]): void {
  console.log('=== Control de soldadura ===');
  console.log(`Tasa de aprobacion global: ${tasaAprobacion(soldaduras)} (estandar: ${calidadRequerida})`);
  console.log(`Cumple estandar: ${cumpleEstandar(soldaduras) ? 'si' : 'no'}`);
  console.log(`Defectos detectados: ${[...defectosUnicos(soldaduras)].join(', ') || 'ninguno'}`);

  rendimientoPorOperador(soldaduras).forEach((puntaje, operador) => {
    console.log(`${operador} | Rendimiento: ${puntaje}`);
  });

  soldaduras.forEach((soldadura) => {
    const errores = validarSoldadura(soldadura);
    if (errores.length > 0) console.log(`Alerta: ${errores.join('; ')}`);
  });
}

mostrarResumen(soldaduras);
