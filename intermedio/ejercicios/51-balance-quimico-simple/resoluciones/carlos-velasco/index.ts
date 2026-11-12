export {};

// tipos
type Elemento = 'H' | 'O' | 'C' | 'N' | 'Na' | 'Cl';

interface Formula {
  readonly id: number;
  readonly expresion: string;
  conteo: Record<string, number>;
}

interface Balance {
  readonly formulaId: number;
  balanceado: boolean;
  detalle: string;
}

// errores
class ErrorFormulaVacia extends Error {
  constructor() {
    super('la formula esta vacia');
    this.name = 'ErrorFormulaVacia';
  }
}

class ErrorFormato extends Error {
  constructor(expresion: string) {
    super(`formato invalido en "${expresion}"`);
    this.name = 'ErrorFormato';
  }
}

// eventos tipados
class EventBus<TEventos extends Record<string, unknown>> {
  private readonly oyentes = new Map<keyof TEventos, Array<(dato: unknown) => void>>();

  on<K extends keyof TEventos>(evento: K, oyente: (dato: TEventos[K]) => void): void {
    const lista = this.oyentes.get(evento) ?? [];
    lista.push(oyente as (dato: unknown) => void);
    this.oyentes.set(evento, lista);
  }

  emit<K extends keyof TEventos>(evento: K, dato: TEventos[K]): void {
    (this.oyentes.get(evento) ?? []).forEach((oyente) => oyente(dato));
  }
}

// datos remotos simulados
async function obtenerFormula(id: number): Promise<Formula> {
  const base: Record<number, string> = { 1: 'H2O', 2: 'CO2', 3: 'NaCl', 4: '' };
  const expresion = base[id];

  await new Promise((resolver) => setTimeout(resolver, 10));

  if (expresion === undefined) throw new Error(`formula ${id} no encontrada`);
  if (expresion.length === 0) throw new ErrorFormulaVacia();
  if (!/^([A-Z][a-z]?\d*)+$/.test(expresion)) throw new ErrorFormato(expresion);

  const conteo: Record<string, number> = {};
  (expresion.match(/[A-Z][a-z]?\d*/g) ?? []).forEach((segmento) => {
    const simbolo = segmento.match(/[A-Z][a-z]?/)![0];
    conteo[simbolo] = (conteo[simbolo] ?? 0) + Number(segmento.match(/\d+/)?.[0] ?? 1);
  });

  return { id, expresion, conteo };
}

// calculos
function balancear(formula: Formula): Balance {
  const totalAtomos = Object.values(formula.conteo).reduce((total, cantidad) => total + cantidad, 0);
  const pares = Object.keys(formula.conteo).length;

  return {
    formulaId: formula.id,
    balanceado: totalAtomos % 2 === 0,
    detalle: `${pares} elementos | ${totalAtomos} atomos`,
  };
}

// datos
const bus = new EventBus<{ formula: Formula; balance: Balance; error: Error }>();

// salida
function mostrarResumen(): void {
  console.log('=== Balance quimico simple ===');

  bus.on('balance', (balance) => console.log(`Formula ${balance.formulaId}: ${balance.balanceado ? 'balanceada' : 'impar'} (${balance.detalle})`));
  bus.on('error', (error) => console.log(`Error: ${error.message}`));

  const ids = [1, 2, 3, 4, 5];
  void (async () => {
    for (const id of ids) {
      try {
        const formula = await obtenerFormula(id);
        bus.emit('formula', formula);
        bus.emit('balance', balancear(formula));
      } catch (error) {
        if (error instanceof Error) bus.emit('error', error);
      }
    }
  })();
}

mostrarResumen();
