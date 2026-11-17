export {};

// Intermedio 51: Balance quimico simple
// Tematica: quimica
// Resolucion: Dulce Morales
//
// Problema: una app de quimica balancea ecuaciones sencillas (ej. H2 + O2 -> H2O). Las masas atomicas
// vienen de una "API" remota simulada que tarda en responder y a veces falla (se reintenta).
// El balanceo prueba coeficientes del 1 al 8 hasta que los atomos coinciden de ambos lados.
// Los errores son tipados (red, formula invalida, sin solucion) y el proceso avisa su avance
// con eventos tipados.

// ===================== ERRORES TIPADOS =====================

class ErrorRed extends Error {
  constructor(public readonly intentos: number) {
    super(`la API de elementos no respondio despues de ${intentos} intentos`);
    this.name = "ErrorRed";
  }
}

class ErrorFormula extends Error {
  constructor(public readonly formula: string, detalle: string) {
    super(`formula "${formula}" invalida: ${detalle}`);
    this.name = "ErrorFormula";
  }
}

class ErrorSinSolucion extends Error {
  constructor(public readonly ecuacion: string, public readonly maximo: number) {
    super(`no se encontraron coeficientes del 1 al ${maximo} para "${ecuacion}"`);
    this.name = "ErrorSinSolucion";
  }
}

type ErrorBalance = ErrorRed | ErrorFormula | ErrorSinSolucion;

function esErrorBalance(e: unknown): e is ErrorBalance {
  return e instanceof ErrorRed || e instanceof ErrorFormula || e instanceof ErrorSinSolucion;
}

// ===================== EVENTOS TIPADOS =====================

interface Eventos {
  "pidiendo-datos": { readonly intento: number };
  "datos-listos": { readonly elementos: number };
  "probando": { readonly combinaciones: number };
  "balanceada": { readonly ecuacion: string };
}

class Emisor<E> {
  private readonly oyentes: { [K in keyof E]?: ((dato: E[K]) => void)[] } = {};

  on<K extends keyof E>(evento: K, fn: (dato: E[K]) => void): void {
    (this.oyentes[evento] ??= []).push(fn);
  }

  emit<K extends keyof E>(evento: K, dato: E[K]): void {
    this.oyentes[evento]?.forEach((fn) => fn(dato));
  }
}

// ===================== API REMOTA SIMULADA =====================

const MASAS: Readonly<Record<string, number>> = { H: 1.008, O: 15.999, C: 12.011, N: 14.007, Na: 22.99, Cl: 35.45, Fe: 55.845, Al: 26.982, S: 32.06 };

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Falla en los primeros "fallasIniciales" intentos y despues responde
function crearApi(fallasIniciales: number): () => Promise<Readonly<Record<string, number>>> {
  let llamadas: number = 0;
  return async (): Promise<Readonly<Record<string, number>>> => {
    llamadas += 1;
    await esperar(20);
    if (llamadas <= fallasIniciales) throw new Error("timeout");
    return MASAS;
  };
}

async function conReintentos<T>(fn: () => Promise<T>, intentos: number, emisor: Emisor<Eventos>): Promise<T> {
  for (let i = 1; i <= intentos; i++) {
    emisor.emit("pidiendo-datos", { intento: i });
    try {
      return await fn();
    } catch {
      await esperar(10 * i); // espera un poco mas en cada reintento
    }
  }
  throw new ErrorRed(intentos);
}

// ===================== BALANCEO =====================

type Conteo = Map<string, number>;

function leer(formula: string, masas: Readonly<Record<string, number>>): Conteo {
  if (!/^([A-Z][a-z]?\d*)+$/.test(formula)) throw new ErrorFormula(formula, "solo se aceptan elementos y numeros, sin parentesis");
  const conteo: Conteo = new Map();
  for (const [, simbolo = "", num] of formula.matchAll(/([A-Z][a-z]?)(\d*)/g)) {
    if (masas[simbolo] === undefined) throw new ErrorFormula(formula, `el elemento ${simbolo} no esta en la tabla`);
    conteo.set(simbolo, (conteo.get(simbolo) ?? 0) + (num ? Number(num) : 1));
  }
  return conteo;
}

function sumar(formulas: Conteo[], coeficientes: number[]): Conteo {
  const total: Conteo = new Map();
  formulas.forEach((c: Conteo, i: number): void => {
    for (const [s, n] of c) total.set(s, (total.get(s) ?? 0) + n * (coeficientes[i] ?? 1));
  });
  return total;
}

function iguales(a: Conteo, b: Conteo): boolean {
  return a.size === b.size && [...a.entries()].every(([s, n]) => b.get(s) === n);
}

// Todas las combinaciones de coeficientes del 1 al maximo (de menor a mayor)
function* combinaciones(cantidad: number, maximo: number): Generator<number[]> {
  const actual: number[] = Array.from({ length: cantidad }, () => 1);
  while (true) {
    yield [...actual];
    let i: number = cantidad - 1;
    while (i >= 0 && actual[i] === maximo) {
      actual[i] = 1;
      i--;
    }
    if (i < 0) return;
    actual[i] = (actual[i] ?? 0) + 1;
  }
}

async function balancear(ecuacion: string, obtenerMasas: () => Promise<Readonly<Record<string, number>>>, emisor: Emisor<Eventos>, maximo: number = 8): Promise<{ texto: string; masaReactivos: number }> {
  const masas: Readonly<Record<string, number>> = await conReintentos(obtenerMasas, 3, emisor);
  emisor.emit("datos-listos", { elementos: Object.keys(masas).length });

  const [izq = "", der = ""] = ecuacion.split("->").map((s) => s.trim());
  const reactivos: string[] = izq.split("+").map((s) => s.trim());
  const productos: string[] = der.split("+").map((s) => s.trim());
  const cr: Conteo[] = reactivos.map((r) => leer(r, masas));
  const cp: Conteo[] = productos.map((p) => leer(p, masas));

  let probadas: number = 0;
  // Se prueban las combinaciones con la suma de coeficientes mas chica primero (la respuesta mas simple)
  const todas: number[][] = [...combinaciones(reactivos.length + productos.length, maximo)].sort((a, b) => a.reduce((s, x) => s + x, 0) - b.reduce((s, x) => s + x, 0));
  for (const coef of todas) {
    probadas += 1;
    const izqC: Conteo = sumar(cr, coef.slice(0, reactivos.length));
    const derC: Conteo = sumar(cp, coef.slice(reactivos.length));
    if (iguales(izqC, derC)) {
      emisor.emit("probando", { combinaciones: probadas });
      const lado = (lista: string[], c: number[]): string => lista.map((f, i) => `${c[i] === 1 ? "" : c[i]}${f}`).join(" + ");
      const texto: string = `${lado(reactivos, coef)} -> ${lado(productos, coef.slice(reactivos.length))}`;
      emisor.emit("balanceada", { ecuacion: texto });
      const masaReactivos: number = [...izqC.entries()].reduce((s, [el, n]) => s + (masas[el] ?? 0) * n, 0);
      return { texto, masaReactivos: Math.round(masaReactivos * 1000) / 1000 };
    }
  }
  emisor.emit("probando", { combinaciones: probadas });
  throw new ErrorSinSolucion(ecuacion, maximo);
}

// ===================== SALIDA =====================

async function main(): Promise<void> {
  const emisor: Emisor<Eventos> = new Emisor<Eventos>();
  emisor.on("pidiendo-datos", ({ intento }) => {
    if (intento > 1) console.log(`   ... reintento ${intento} de la API`);
  });
  emisor.on("probando", ({ combinaciones }) => console.log(`   ... ${combinaciones} combinaciones probadas`));

  const casos: [string, number][] = [
    ["H2 + O2 -> H2O", 0],
    ["CH4 + O2 -> CO2 + H2O", 2], // la API falla 2 veces y al 3er intento responde (limite)
    ["Fe + O2 -> Fe2O3", 0],
    ["Al + O2 -> Al2O3", 0],
    ["C3H8 + O2 -> CO2 + H2O", 0],
    ["Na + Cl2 -> NaCl", 3], // la API falla 3 veces: se agotan los reintentos
    ["Ca(OH)2 + HCl -> CaCl2 + H2O", 0], // parentesis no soportados
    ["Xx + O2 -> XxO", 0],
    ["H2O -> H2O2", 0], // no tiene solucion
  ];

  for (const [ecuacion, fallas] of casos) {
    console.log(`\n${ecuacion}`);
    try {
      const r = await balancear(ecuacion, crearApi(fallas), emisor);
      console.log(`   OK ${r.texto}   (masa de reactivos ${r.masaReactivos} g)`);
    } catch (e: unknown) {
      if (esErrorBalance(e)) console.log(`   X [${e.name}] ${e.message}`);
      else throw e;
    }
  }
}

main();
