export {};

// Intermedio 78: Canvas de dibujo basico
// Tematica: dibujo
// Resolucion: Dulce Morales
//
// Problema: una app de dibujo sencilla sobre <canvas>. Como aqui no hay navegador, el canvas se
// simula con una matriz de caracteres (cada caracter es un "pixel" de un color). El dibujo se guarda
// como una lista de figuras (no como pixeles), lo que permite deshacer/rehacer, guardar el dibujo
// como JSON (DTO) en un storage simulado, volver a cargarlo y generar un reporte de lo pintado.

// ===================== MODELO =====================

type Color = "negro" | "rojo" | "azul" | "verde" | "amarillo";
const COLORES: readonly Color[] = ["negro", "rojo", "azul", "verde", "amarillo"];
const PIXEL: Readonly<Record<Color, string>> = { negro: "#", rojo: "R", azul: "A", verde: "V", amarillo: "Y" };
const FONDO: string = ".";

interface Punto {
  readonly x: number;
  readonly y: number;
}

type Figura =
  | { readonly tipo: "linea"; readonly desde: Punto; readonly hasta: Punto; readonly color: Color }
  | { readonly tipo: "rect"; readonly esquina: Punto; readonly ancho: number; readonly alto: number; readonly color: Color; readonly relleno: boolean }
  | { readonly tipo: "circulo"; readonly centro: Punto; readonly radio: number; readonly color: Color }
  | { readonly tipo: "cubeta"; readonly en: Punto; readonly color: Color }; // relleno por inundacion

// DTO de guardado: version + tamano + figuras (lo que iria a localStorage)
interface DibujoDTO {
  readonly version: 1;
  readonly ancho: number;
  readonly alto: number;
  readonly figuras: readonly Figura[];
}

// ===================== RASTERIZADO (PURO) =====================

type Lienzo = string[][];

function lienzoVacio(ancho: number, alto: number): Lienzo {
  return Array.from({ length: alto }, () => Array<string>(ancho).fill(FONDO));
}

function pintar(l: Lienzo, x: number, y: number, c: string): void {
  const fila: string[] | undefined = l[y];
  if (fila !== undefined && x >= 0 && x < fila.length) fila[x] = c; // lo que sale del lienzo se recorta
}

// Algoritmo de Bresenham: linea con solo enteros
function linea(l: Lienzo, a: Punto, b: Punto, c: string): void {
  let x: number = a.x;
  let y: number = a.y;
  const dx: number = Math.abs(b.x - a.x);
  const dy: number = -Math.abs(b.y - a.y);
  const sx: number = a.x < b.x ? 1 : -1;
  const sy: number = a.y < b.y ? 1 : -1;
  let err: number = dx + dy;
  for (;;) {
    pintar(l, x, y, c);
    if (x === b.x && y === b.y) break;
    const e2: number = 2 * err;
    if (e2 >= dy) { err += dy; x += sx; }
    if (e2 <= dx) { err += dx; y += sy; }
  }
}

// Circulo por punto medio (8 octantes simetricos)
function circulo(l: Lienzo, cen: Punto, r: number, c: string): void {
  let x: number = r;
  let y: number = 0;
  let err: number = 1 - r;
  while (x >= y) {
    for (const [px, py] of [[x, y], [y, x], [-y, x], [-x, y], [-x, -y], [-y, -x], [y, -x], [x, -y]] as const) pintar(l, cen.x + px, cen.y + py, c);
    y++;
    if (err < 0) err += 2 * y + 1;
    else { x--; err += 2 * (y - x) + 1; }
  }
}

// Cubeta: rellena la region conectada (4 vecinos) del mismo color que el punto inicial
function cubeta(l: Lienzo, p: Punto, c: string): void {
  const objetivo: string | undefined = l[p.y]?.[p.x];
  if (objetivo === undefined || objetivo === c) return;
  const pila: Punto[] = [p];
  while (pila.length > 0) {
    const q: Punto | undefined = pila.pop();
    if (q === undefined || l[q.y]?.[q.x] !== objetivo) continue;
    pintar(l, q.x, q.y, c);
    pila.push({ x: q.x + 1, y: q.y }, { x: q.x - 1, y: q.y }, { x: q.x, y: q.y + 1 }, { x: q.x, y: q.y - 1 });
  }
}

function dibujar(l: Lienzo, f: Figura): void {
  const c: string = PIXEL[f.color];
  switch (f.tipo) {
    case "linea": linea(l, f.desde, f.hasta, c); break;
    case "rect": {
      const { x, y } = f.esquina;
      const x2: number = x + f.ancho - 1;
      const y2: number = y + f.alto - 1;
      if (f.relleno) for (let j = y; j <= y2; j++) linea(l, { x, y: j }, { x: x2, y: j }, c);
      else for (const [a, b] of [[{ x, y }, { x: x2, y }], [{ x: x2, y }, { x: x2, y: y2 }], [{ x: x2, y: y2 }, { x, y: y2 }], [{ x, y: y2 }, { x, y }]] as const) linea(l, a, b, c);
      break;
    }
    case "circulo": circulo(l, f.centro, f.radio, c); break;
    case "cubeta": cubeta(l, f.en, c); break;
  }
}

function renderizar(d: DibujoDTO): Lienzo {
  const l: Lienzo = lienzoVacio(d.ancho, d.alto);
  for (const f of d.figuras) dibujar(l, f);
  return l;
}

// ===================== VALIDACION =====================

function validarFigura(f: Figura, ancho: number, alto: number): string | null {
  const dentro = (p: Punto): boolean => p.x >= 0 && p.y >= 0 && p.x < ancho && p.y < alto;
  switch (f.tipo) {
    case "linea": return dentro(f.desde) || dentro(f.hasta) ? null : "la linea esta completamente fuera del lienzo";
    case "rect": return f.ancho < 1 || f.alto < 1 ? "el rectangulo necesita ancho y alto >= 1" : null;
    case "circulo": return f.radio < 1 ? "el radio debe ser >= 1" : null;
    case "cubeta": return dentro(f.en) ? null : "la cubeta debe usarse dentro del lienzo";
  }
}

// Lo que se lee del storage es unknown: se revisa forma y tipos antes de usarlo
function esRegistro(x: unknown): x is Record<string, unknown> { return typeof x === "object" && x !== null && !Array.isArray(x); }
function esPunto(x: unknown): x is Punto { return esRegistro(x) && typeof x["x"] === "number" && typeof x["y"] === "number"; }
function esColor(x: unknown): x is Color { return typeof x === "string" && COLORES.some((c) => c === x); }
function esFigura(x: unknown): x is Figura {
  if (!esRegistro(x) || !esColor(x["color"])) return false;
  switch (x["tipo"]) {
    case "linea": return esPunto(x["desde"]) && esPunto(x["hasta"]);
    case "rect": return esPunto(x["esquina"]) && typeof x["ancho"] === "number" && typeof x["alto"] === "number" && typeof x["relleno"] === "boolean";
    case "circulo": return esPunto(x["centro"]) && typeof x["radio"] === "number";
    case "cubeta": return esPunto(x["en"]);
    default: return false;
  }
}

function leerDibujo(texto: string | null): { readonly ok: true; readonly dibujo: DibujoDTO } | { readonly ok: false; readonly error: string } {
  if (texto === null) return { ok: false, error: "no hay dibujo guardado" };
  let datos: unknown;
  try { datos = JSON.parse(texto); } catch { return { ok: false, error: "JSON invalido" }; }
  if (!esRegistro(datos) || datos["version"] !== 1) return { ok: false, error: "version no soportada" };
  const ancho: unknown = datos["ancho"];
  const alto: unknown = datos["alto"];
  const figuras: unknown = datos["figuras"];
  if (typeof ancho !== "number" || typeof alto !== "number" || !Array.isArray(figuras)) return { ok: false, error: "estructura incompleta" };
  const buenas: Figura[] = figuras.filter(esFigura);
  if (buenas.length !== figuras.length) return { ok: false, error: `${figuras.length - buenas.length} figura(s) invalida(s)` };
  return { ok: true, dibujo: { version: 1, ancho, alto, figuras: buenas } };
}

// ===================== EDITOR (HISTORIAL) =====================

class Editor {
  private hechas: Figura[] = [];
  private deshechas: Figura[] = [];
  constructor(readonly ancho: number, readonly alto: number) {}

  agregar(f: Figura): string {
    const error: string | null = validarFigura(f, this.ancho, this.alto);
    if (error !== null) return `x ${f.tipo}: ${error}`;
    this.hechas.push(f);
    this.deshechas = []; // una accion nueva borra lo que se podia rehacer
    return `+ ${f.tipo} ${f.color}`;
  }
  deshacer(): string {
    const f: Figura | undefined = this.hechas.pop();
    if (f === undefined) return "nada que deshacer";
    this.deshechas.push(f);
    return `deshacer ${f.tipo}`;
  }
  rehacer(): string {
    const f: Figura | undefined = this.deshechas.pop();
    if (f === undefined) return "nada que rehacer";
    this.hechas.push(f);
    return `rehacer ${f.tipo}`;
  }
  dto(): DibujoDTO { return { version: 1, ancho: this.ancho, alto: this.alto, figuras: [...this.hechas] }; }
  static desde(d: DibujoDTO): Editor {
    const e: Editor = new Editor(d.ancho, d.alto);
    e.hechas = [...d.figuras];
    return e;
  }
}

// ===================== STORAGE SIMULADO Y REPORTE =====================

class StorageMemoria {
  private readonly m: Map<string, string> = new Map();
  getItem(k: string): string | null { return this.m.get(k) ?? null; }
  setItem(k: string, v: string): void { this.m.set(k, v); }
}

function reporte(d: DibujoDTO): string[] {
  const l: Lienzo = renderizar(d);
  const total: number = d.ancho * d.alto;
  const porColor: string[] = COLORES.map((c) => {
    const n: number = l.reduce((s, fila) => s + fila.filter((p) => p === PIXEL[c]).length, 0);
    return n > 0 ? `${c} ${n} px (${((n / total) * 100).toFixed(1)}%)` : "";
  }).filter((s) => s !== "");
  const tipos: Map<string, number> = new Map();
  for (const f of d.figuras) tipos.set(f.tipo, (tipos.get(f.tipo) ?? 0) + 1);
  const vacios: number = l.reduce((s, fila) => s + fila.filter((p) => p === FONDO).length, 0);
  return [
    `Figuras: ${d.figuras.length} (${[...tipos.entries()].map(([k, v]) => `${k} x${v}`).join(", ")})`,
    `Pixeles por color: ${porColor.join(", ")}`,
    `Fondo sin pintar: ${vacios} de ${total} px`,
  ];
}

// ===================== DEMO =====================

function mostrar(l: Lienzo): void {
  for (const fila of l) console.log("    " + fila.join(""));
}

function main(): void {
  const ed: Editor = new Editor(32, 14);
  console.log("=== Dibujando una casa ===");
  const acciones: readonly (() => string)[] = [
    () => ed.agregar({ tipo: "rect", esquina: { x: 4, y: 6 }, ancho: 12, alto: 7, color: "negro", relleno: false }),
    () => ed.agregar({ tipo: "linea", desde: { x: 4, y: 6 }, hasta: { x: 9, y: 1 }, color: "rojo" }),
    () => ed.agregar({ tipo: "linea", desde: { x: 10, y: 1 }, hasta: { x: 15, y: 6 }, color: "rojo" }),
    () => ed.agregar({ tipo: "linea", desde: { x: 9, y: 1 }, hasta: { x: 10, y: 1 }, color: "rojo" }),
    () => ed.agregar({ tipo: "rect", esquina: { x: 8, y: 9 }, ancho: 3, alto: 4, color: "azul", relleno: true }),
    () => ed.agregar({ tipo: "circulo", centro: { x: 25, y: 3 }, radio: 2, color: "amarillo" }),
    () => ed.agregar({ tipo: "cubeta", en: { x: 25, y: 3 }, color: "amarillo" }),
    () => ed.agregar({ tipo: "linea", desde: { x: 0, y: 13 }, hasta: { x: 31, y: 13 }, color: "verde" }),
    () => ed.agregar({ tipo: "circulo", centro: { x: 30, y: 10 }, radio: 4, color: "verde" }),     // se recorta en el borde
    () => ed.agregar({ tipo: "rect", esquina: { x: 1, y: 1 }, ancho: 0, alto: 3, color: "negro", relleno: false }),
    () => ed.agregar({ tipo: "circulo", centro: { x: 5, y: 5 }, radio: 0, color: "rojo" }),
    () => ed.agregar({ tipo: "linea", desde: { x: 40, y: 40 }, hasta: { x: 50, y: 41 }, color: "negro" }),
    () => ed.agregar({ tipo: "cubeta", en: { x: 32, y: 0 }, color: "azul" }),                     // limite: x = ancho
  ];
  for (const a of acciones) console.log("  " + a());
  mostrar(renderizar(ed.dto()));

  console.log("\n=== Historial ===");
  console.log("  " + ed.deshacer());   // quita el circulo verde
  console.log("  " + ed.deshacer());   // quita el pasto
  console.log("  " + ed.rehacer());    // vuelve el pasto
  console.log("  " + ed.agregar({ tipo: "cubeta", en: { x: 6, y: 8 }, color: "amarillo" })); // pinta la pared
  console.log("  " + ed.rehacer());    // ya no se puede: hubo accion nueva
  mostrar(renderizar(ed.dto()));

  console.log("\n=== Guardar y cargar ===");
  const storage: StorageMemoria = new StorageMemoria();
  storage.setItem("dibujo.casa", JSON.stringify(ed.dto()));
  console.log(`  guardado: ${ed.dto().figuras.length} figuras en ${storage.getItem("dibujo.casa")?.length ?? 0} caracteres de JSON`);
  const leido = leerDibujo(storage.getItem("dibujo.casa"));
  if (leido.ok) {
    const copia: Editor = Editor.desde(leido.dibujo);
    const igual: boolean = renderizar(copia.dto()).map((f) => f.join("")).join("\n") === renderizar(ed.dto()).map((f) => f.join("")).join("\n");
    console.log(`  cargado: ${leido.dibujo.figuras.length} figuras, identico al original: ${igual}`);
  }
  for (const [nombre, texto] of [
    ["inexistente", null],
    ["corrupto", "{figuras: ["],
    ["version 2", JSON.stringify({ version: 2, ancho: 5, alto: 5, figuras: [] })],
    ["figura rara", JSON.stringify({ version: 1, ancho: 5, alto: 5, figuras: [{ tipo: "estrella", color: "rojo" }] })],
  ] as const) {
    const r = leerDibujo(texto);
    console.log(`  cargar ${nombre}: ${r.ok ? "ok" : r.error}`);
  }

  console.log("\n=== Reporte ===");
  for (const l of reporte(ed.dto())) console.log("  " + l);
}

main();
