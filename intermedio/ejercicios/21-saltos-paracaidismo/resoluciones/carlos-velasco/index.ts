export {};

// tipos
type ModoSalto = 'tandem' | 'solo' | 'formacion';
type ResultadoSalto = 'completado' | 'abortado' | 'con_incidente';

interface Salto {
  readonly id: number;
  modo: ModoSalto;
  alturaMetros: number;
  resultado: ResultadoSalto;
}

// datos
const saltos: Salto[] = [
  { id: 1, modo: 'tandem', alturaMetros: 4000, resultado: 'completado' },
  { id: 2, modo: 'solo', alturaMetros: 3200, resultado: 'completado' },
  { id: 3, modo: 'formacion', alturaMetros: 4500, resultado: 'con_incidente' },
  { id: 4, modo: 'tandem', alturaMetros: 4000, resultado: 'abortado' },
  { id: 5, modo: 'solo', alturaMetros: 0, resultado: 'abortado' },
];

// reglas
const alturaMinimaMetros = 1000;

// validacion
function validarSalto(salto: Salto): string[] {
  const errores: string[] = [];

  if (salto.alturaMetros < alturaMinimaMetros) errores.push(`Salto ${salto.id}: altura por debajo del minimo`);

  return errores;
}

// calculos
function resumenPorResultado(saltos: Salto[]): Record<ResultadoSalto, number> {
  return saltos.reduce<Record<ResultadoSalto, number>>((acumulador, salto) => {
    acumulador[salto.resultado] = (acumulador[salto.resultado] ?? 0) + 1;
    return acumulador;
  }, { completado: 0, abortado: 0, con_incidente: 0 });
}

function alturasPorModo(saltos: Salto[]): Map<ModoSalto, number[]> {
  const mapa = new Map<ModoSalto, number[]>();
  saltos.forEach((salto) => {
    const alturas = mapa.get(salto.modo) ?? [];
    alturas.push(salto.alturaMetros);
    mapa.set(salto.modo, alturas);
  });
  return mapa;
}

function modosUtilizados(saltos: Salto[]): Set<ModoSalto> {
  return new Set(saltos.map((salto) => salto.modo));
}

function alturaPromedio(saltos: Salto[]): number {
  if (saltos.length === 0) return 0;
  const suma = saltos.reduce((total, salto) => total + salto.alturaMetros, 0);
  return Number((suma / saltos.length).toFixed(0));
}

// salida
function mostrarResumen(saltos: Salto[]): void {
  console.log('=== Bitacora de paracaidismo ===');
  console.log(`Saltos registrados: ${saltos.length} | Modos: ${[...modosUtilizados(saltos)].join(', ')}`);
  console.log('Por resultado:', resumenPorResultado(saltos));
  console.log(`Altura promedio: ${alturaPromedio(saltos)} m`);

  alturasPorModo(saltos).forEach((alturas, modo) => {
    console.log(`${modo}: ${alturas.join(', ')}`);
  });

  saltos.forEach((salto) => {
    const errores = validarSalto(salto);
    if (errores.length > 0) console.log(`Alerta: ${errores.join('; ')}`);
  });
}

mostrarResumen(saltos);
