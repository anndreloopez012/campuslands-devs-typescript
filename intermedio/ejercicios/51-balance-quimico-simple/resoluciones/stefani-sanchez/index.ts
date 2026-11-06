// Solución Ejercicio Intermedio 51 - Stefani Sánchez
export {};

class FormulaError extends Error {
  constructor(
    readonly formula: string,
    mensaje: string,
  ) {
    super(`${mensaje}: "${formula}"`);
    this.name = "FormulaError";
  }
}

type Atomos = Record<string, number>;

interface Especie {
  readonly formula: string;
  readonly atomos: Atomos;
}

interface Reaccion {
  readonly id: number;
  readonly texto: string;
}

const esperar = (ms: number): Promise<void> => new Promise((resolver) => setTimeout(resolver, ms));

const reaccionesRemotas: readonly Reaccion[] = [
  { id: 1, texto: "H2 + O2 -> H2O" },
  { id: 2, texto: "N2 + H2 -> NH3" },
  { id: 3, texto: "CH4 + O2 -> CO2 + H2O" },
  { id: 4, texto: "Na + Cl2 -> NaCl" },
  { id: 5, texto: "H2 + O2 H2O" },
  { id: 6, texto: "H2 + ?? -> H2O" },
];

const cargarReacciones = async (): Promise<readonly Reaccion[]> => {
  await esperar(20);
  return reaccionesRemotas;
};

const parsearEspecie = (formula: string): Especie => {
  if (!/^([A-Z][a-z]?\d*)+$/.test(formula)) throw new FormulaError(formula, "Formula invalida");
  const atomos: Atomos = {};
  for (const [, simbolo, cantidad] of formula.matchAll(/([A-Z][a-z]?)(\d*)/g)) {
    atomos[simbolo] = (atomos[simbolo] ?? 0) + (cantidad === "" ? 1 : Number(cantidad));
  }
  return { formula, atomos };
};

const parsearLado = (lado: string): Especie[] => lado.split("+").map((f) => parsearEspecie(f.trim()));

const parsearReaccion = (texto: string): { reactivos: Especie[]; productos: Especie[] } => {
  const lados = texto.split("->");
  if (lados.length !== 2) throw new FormulaError(texto, "La reaccion necesita una flecha ->");
  return { reactivos: parsearLado(lados[0]), productos: parsearLado(lados[1]) };
};

const contarAtomos = (especies: readonly Especie[], coeficientes: readonly number[]): Atomos =>
  especies.reduce<Atomos>((acc, especie, i) => {
    Object.entries(especie.atomos).forEach(([simbolo, n]) => {
      acc[simbolo] = (acc[simbolo] ?? 0) + n * coeficientes[i];
    });
    return acc;
  }, {});

const iguales = (a: Atomos, b: Atomos): boolean => {
  const claves = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...claves].every((k) => (a[k] ?? 0) === (b[k] ?? 0));
};

const MAX_COEFICIENTE = 6;

const balancear = (texto: string): string => {
  const { reactivos, productos } = parsearReaccion(texto);
  const todas = [...reactivos, ...productos];
  const coef: number[] = Array(todas.length).fill(1);

  const buscar = (indice: number): boolean => {
    if (indice === todas.length) {
      return iguales(contarAtomos(reactivos, coef.slice(0, reactivos.length)), contarAtomos(productos, coef.slice(reactivos.length)));
    }
    for (let c = 1; c <= MAX_COEFICIENTE; c++) {
      coef[indice] = c;
      if (buscar(indice + 1)) return true;
    }
    return false;
  };

  if (!buscar(0)) throw new FormulaError(texto, "No se pudo balancear con coeficientes de hasta 6");
  const formatear = (lista: readonly Especie[], desde: number): string =>
    lista.map((e, i) => `${coef[desde + i] === 1 ? "" : coef[desde + i]}${e.formula}`).join(" + ");
  return `${formatear(reactivos, 0)} -> ${formatear(productos, reactivos.length)}`;
};

const main = async (): Promise<void> => {
  console.log("Ejercicio 51: Balance quimico simple");
  const reacciones = await cargarReacciones();
  let balanceadas = 0;

  for (const reaccion of reacciones) {
    try {
      console.log(`  #${reaccion.id} ${reaccion.texto}  =>  ${balancear(reaccion.texto)}`);
      balanceadas++;
    } catch (error) {
      console.log(`  #${reaccion.id} ERROR ${error instanceof FormulaError ? error.message : "desconocido"}`);
    }
  }
  console.log(`Balanceadas: ${balanceadas}/${reacciones.length}`);
};

void main();
