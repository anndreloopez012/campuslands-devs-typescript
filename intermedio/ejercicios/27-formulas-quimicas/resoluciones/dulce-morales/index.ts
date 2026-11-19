export {};

// Intermedio 27: Validador de formulas quimicas
// Tematica: quimica
// Resolucion: Dulce Morales
//
// Problema: un laboratorio escolar captura formulas quimicas como texto ("H2O", "Ca(OH)2").
// Hay que leer cada formula, contar cuantos atomos de cada elemento tiene, validar que los
// elementos existan y que los parentesis esten bien cerrados, calcular la masa molar y,
// para reacciones, revisar si estan balanceadas (mismos atomos de cada lado).

// ===================== MODELO =====================

type Categoria = "no metal" | "metal alcalino" | "metal alcalinoterreo" | "metal de transicion" | "halogeno" | "gas noble";

interface Elemento {
  readonly nombre: string;
  readonly masa: number; // g/mol
  readonly categoria: Categoria;
}

type Conteo = Map<string, number>; // simbolo -> cantidad de atomos

type Lectura = { readonly ok: true; readonly conteo: Conteo } | { readonly ok: false; readonly error: string };

interface Reaccion {
  readonly nombre: string;
  readonly reactivos: readonly [coeficiente: number, formula: string][];
  readonly productos: readonly [coeficiente: number, formula: string][];
}

// ===================== TABLA PERIODICA (subconjunto, Record) =====================

const TABLA: Readonly<Record<string, Elemento>> = {
  H: { nombre: "Hidrogeno", masa: 1.008, categoria: "no metal" },
  C: { nombre: "Carbono", masa: 12.011, categoria: "no metal" },
  N: { nombre: "Nitrogeno", masa: 14.007, categoria: "no metal" },
  O: { nombre: "Oxigeno", masa: 15.999, categoria: "no metal" },
  Na: { nombre: "Sodio", masa: 22.99, categoria: "metal alcalino" },
  Mg: { nombre: "Magnesio", masa: 24.305, categoria: "metal alcalinoterreo" },
  S: { nombre: "Azufre", masa: 32.06, categoria: "no metal" },
  Cl: { nombre: "Cloro", masa: 35.45, categoria: "halogeno" },
  K: { nombre: "Potasio", masa: 39.098, categoria: "metal alcalino" },
  Ca: { nombre: "Calcio", masa: 40.078, categoria: "metal alcalinoterreo" },
  Fe: { nombre: "Hierro", masa: 55.845, categoria: "metal de transicion" },
  Cu: { nombre: "Cobre", masa: 63.546, categoria: "metal de transicion" },
  He: { nombre: "Helio", masa: 4.0026, categoria: "gas noble" },
};

// ===================== LECTURA DE FORMULAS =====================

function sumarConteos(destino: Conteo, origen: Conteo, factor: number): void {
  for (const [simbolo, cantidad] of origen) {
    destino.set(simbolo, (destino.get(simbolo) ?? 0) + cantidad * factor);
  }
}

// Lee la formula de izquierda a derecha. Usa una pila de conteos para los parentesis:
// al abrir "(" se empieza un conteo nuevo; al cerrar ")" se multiplica por el numero que sigue.
function leerFormula(formula: string): Lectura {
  if (formula.trim() === "") return { ok: false, error: "formula vacia" };
  const pila: Conteo[] = [new Map<string, number>()];
  const tokens: RegExpMatchArray | null = formula.match(/[A-Z][a-z]?|\d+|\(|\)|./g);
  if (tokens === null) return { ok: false, error: "formula vacia" };

  let i: number = 0;
  const leerNumero = (): number => {
    const siguiente: string | undefined = tokens[i + 1];
    if (siguiente !== undefined && /^\d+$/.test(siguiente)) {
      i++;
      return Number(siguiente);
    }
    return 1;
  };

  for (; i < tokens.length; i++) {
    const t: string = tokens[i] ?? "";
    const actual: Conteo | undefined = pila[pila.length - 1];
    if (actual === undefined) return { ok: false, error: "error interno" };

    if (t === "(") {
      pila.push(new Map<string, number>());
    } else if (t === ")") {
      if (pila.length === 1) return { ok: false, error: "hay un ')' sin '(' que lo abra" };
      const cerrado: Conteo = pila.pop() ?? new Map<string, number>();
      const destino: Conteo | undefined = pila[pila.length - 1];
      if (destino === undefined) return { ok: false, error: "error interno" };
      sumarConteos(destino, cerrado, leerNumero());
    } else if (/^[A-Z][a-z]?$/.test(t)) {
      if (TABLA[t] === undefined) return { ok: false, error: `"${t}" no es un elemento conocido` };
      actual.set(t, (actual.get(t) ?? 0) + leerNumero());
    } else if (/^\d+$/.test(t)) {
      return { ok: false, error: `numero "${t}" sin elemento antes` };
    } else {
      return { ok: false, error: `caracter invalido "${t}"` };
    }
  }
  if (pila.length !== 1) return { ok: false, error: "falta cerrar un '('" };
  return { ok: true, conteo: pila[0] ?? new Map<string, number>() };
}

// ===================== CALCULOS (reduce, Record) =====================

function masaMolar(conteo: Conteo): number {
  const total: number = [...conteo.entries()].reduce((s: number, [sim, n]): number => s + (TABLA[sim]?.masa ?? 0) * n, 0);
  return Math.round(total * 1000) / 1000;
}

function textoConteo(conteo: Conteo): string {
  return [...conteo.entries()].map(([s, n]): string => `${s}:${n}`).join(" ");
}

function atomosPorCategoria(conteo: Conteo): Partial<Record<Categoria, number>> {
  return [...conteo.entries()].reduce((acc: Partial<Record<Categoria, number>>, [sim, n]) => {
    const cat: Categoria | undefined = TABLA[sim]?.categoria;
    return cat === undefined ? acc : { ...acc, [cat]: (acc[cat] ?? 0) + n };
  }, {});
}

// Suma los atomos de un lado de la reaccion (coeficiente x formula)
function ladoDeReaccion(lado: readonly [number, string][]): Lectura {
  const total: Conteo = new Map<string, number>();
  for (const [coef, formula] of lado) {
    const l: Lectura = leerFormula(formula);
    if (!l.ok) return { ok: false, error: `${formula}: ${l.error}` };
    sumarConteos(total, l.conteo, coef);
  }
  return { ok: true, conteo: total };
}

function revisarBalance(r: Reaccion): string[] {
  const izq: Lectura = ladoDeReaccion(r.reactivos);
  const der: Lectura = ladoDeReaccion(r.productos);
  if (!izq.ok) return [izq.error];
  if (!der.ok) return [der.error];
  const elementos: Set<string> = new Set([...izq.conteo.keys(), ...der.conteo.keys()]);
  return [...elementos]
    .filter((e: string): boolean => (izq.conteo.get(e) ?? 0) !== (der.conteo.get(e) ?? 0))
    .map((e: string): string => `${e}: ${izq.conteo.get(e) ?? 0} a la izquierda y ${der.conteo.get(e) ?? 0} a la derecha`);
}

function escribirReaccion(r: Reaccion): string {
  const lado = (l: readonly [number, string][]): string => l.map(([c, f]): string => `${c === 1 ? "" : c}${f}`).join(" + ");
  return `${lado(r.reactivos)} -> ${lado(r.productos)}`;
}

// ===================== DATOS DE PRUEBA =====================

const formulas: readonly string[] = [
  "H2O",
  "C6H12O6", // glucosa
  "NaCl",
  "Ca(OH)2", // parentesis con multiplicador
  "Fe2(SO4)3", // parentesis con 3 elementos
  "Mg(NO3)2",
  "He", // limite: un solo atomo
  "Xy2O", // elemento inexistente
  "Ca(OH2", // parentesis sin cerrar
  "H2O)", // parentesis sin abrir
  "2H2O", // numero al inicio
];

const reacciones: readonly Reaccion[] = [
  { nombre: "Formacion de agua", reactivos: [[2, "H2"], [1, "O2"]], productos: [[2, "H2O"]] },
  { nombre: "Combustion del metano", reactivos: [[1, "CH4"], [2, "O2"]], productos: [[1, "CO2"], [2, "H2O"]] },
  { nombre: "Neutralizacion", reactivos: [[1, "Ca(OH)2"], [2, "HCl"]], productos: [[1, "CaCl2"], [2, "H2O"]] },
  { nombre: "Combustion mal balanceada", reactivos: [[1, "C3H8"], [3, "O2"]], productos: [[3, "CO2"], [4, "H2O"]] },
  { nombre: "Con formula invalida", reactivos: [[1, "Zz"]], productos: [[1, "O2"]] },
];

// ===================== SALIDA POR CONSOLA =====================

function main(): void {
  console.log("====================== FORMULAS ======================");
  const validas: { formula: string; masa: number }[] = [];
  for (const f of formulas) {
    const l: Lectura = leerFormula(f);
    if (l.ok) {
      const masa: number = masaMolar(l.conteo);
      validas.push({ formula: f, masa });
      const cats: string = Object.entries(atomosPorCategoria(l.conteo)).map(([c, n]) => `${c} ${n}`).join(", ");
      console.log(`OK ${f.padEnd(10)} ${textoConteo(l.conteo).padEnd(18)} ${masa.toFixed(3).padStart(8)} g/mol | ${cats}`);
    } else {
      console.log(`X  ${f.padEnd(10)} ${l.error}`);
    }
  }

  const ordenadas = [...validas].sort((a, b): number => b.masa - a.masa);
  console.log(`\nMas pesada: ${ordenadas[0]?.formula ?? "-"} | mas ligera: ${ordenadas[ordenadas.length - 1]?.formula ?? "-"}`);

  console.log("\n====================== REACCIONES ======================");
  for (const r of reacciones) {
    const problemas: string[] = revisarBalance(r);
    const estado: string = problemas.length === 0 ? "BALANCEADA" : "NO balanceada";
    console.log(`${r.nombre}: ${escribirReaccion(r)}  -> ${estado}`);
    problemas.forEach((p: string): void => console.log(`   - ${p}`));
  }
}

main();
