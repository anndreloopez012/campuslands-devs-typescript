export {};

// tipos
type ValidezFormula = 'valida' | 'invalida' | 'desconocida';

interface FormulaQuimica {
  readonly expresion: string;
  validez: ValidezFormula;
  motivo: string | null;
}

// datos
const elementosValidos = new Set(['H', 'He', 'C', 'N', 'O', 'Na', 'Mg', 'Al', 'Cl', 'Ca', 'Fe', 'Zn']);

const formulas: FormulaQuimica[] = [
  { expresion: 'H2O', validez: 'desconocida', motivo: null },
  { expresion: 'NaCl', validez: 'desconocida', motivo: null },
  { expresion: 'Xx2O', validez: 'desconocida', motivo: null },
  { expresion: 'Fe2(SO4)3', validez: 'desconocida', motivo: null },
  { expresion: '', validez: 'desconocida', motivo: null },
];

// reglas
const regexFormula = /^([A-Z][a-z]?\d*)+$/;

// validacion
function simbolosEncontrados(expresion: string): string[] {
  return expresion.match(/[A-Z][a-z]?/g) ?? [];
}

function validarFormula(expresion: string): Omit<FormulaQuimica, 'expresion'> {
  if (expresion.length === 0) return { validez: 'invalida', motivo: 'formula vacia' };
  if (!regexFormula.test(expresion)) return { validez: 'invalida', motivo: 'formato invalido' };

  const desconocidos = simbolosEncontrados(expresion).filter((simbolo) => !elementosValidos.has(simbolo));
  if (desconocidos.length > 0) return { validez: 'invalida', motivo: `elemento desconocido: ${desconocidos.join(', ')}` };

  return { validez: 'valida', motivo: null };
}

// calculos
function contarAtomos(expresion: string): Map<string, number> {
  const conteo = new Map<string, number>();
  const segmentos = expresion.match(/[A-Z][a-z]?\d*/g) ?? [];

  segmentos.forEach((segmento) => {
    const simbolo = segmento.match(/[A-Z][a-z]?/)![0];
    const cantidad = Number(segmento.match(/\d+/)?.[0] ?? 1);
    conteo.set(simbolo, (conteo.get(simbolo) ?? 0) + cantidad);
  });

  return conteo;
}

function clasificarFormulas(formulas: FormulaQuimica[]): Record<ValidezFormula, number> {
  return formulas.reduce<Record<ValidezFormula, number>>((conteo, formula) => {
    conteo[formula.validez] += 1;
    return conteo;
  }, { valida: 0, invalida: 0, desconocida: 0 });
}

// salida
function mostrarResumen(formulas: FormulaQuimica[]): void {
  console.log('=== Validador de formulas quimicas ===');

  formulas.forEach((formula) => {
    const resultado = validarFormula(formula.expresion);
    formula.validez = resultado.validez;
    formula.motivo = resultado.motivo;

    const atomos = contarAtomos(formula.expresion);
    const detalle = [...atomos.entries()].map(([simbolo, cantidad]) => `${simbolo}x${cantidad}`).join(' + ');
    console.log(`${formula.expresion || '(vacia)'} | ${formula.validez}${formula.motivo ? ` (${formula.motivo})` : ''}${atomos.size > 0 ? ` | Atomos: ${detalle}` : ''}`);
  });

  console.log('Resumen:', clasificarFormulas(formulas));
  console.log(`Elementos soportados: ${[...elementosValidos].sort().join(', ')}`);
}

mostrarResumen(formulas);
