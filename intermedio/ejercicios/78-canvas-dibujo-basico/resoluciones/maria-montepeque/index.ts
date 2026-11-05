export {};

// El "canvas" es una cuadricula de caracteres, asi se puede probar sin navegador.
type Cuadricula = readonly (readonly string[])[];

interface Punto {
  readonly x: number;
  readonly y: number;
}

type Trazo =
  | { readonly tipo: "punto"; readonly p: Punto; readonly color: string }
  | { readonly tipo: "linea"; readonly desde: Punto; readonly hasta: Punto; readonly color: string }
  | { readonly tipo: "rectangulo"; readonly desde: Punto; readonly hasta: Punto; readonly color: string; readonly relleno: boolean };

interface Estado {
  readonly ancho: number;
  readonly alto: number;
  readonly trazos: readonly Trazo[];
  readonly rehacer: readonly Trazo[];
}

type Accion =
  | { readonly tipo: "dibujar"; readonly trazo: Trazo }
  | { readonly tipo: "deshacer" }
  | { readonly tipo: "rehacer" }
  | { readonly tipo: "limpiar" };

const dentro = (e: Estado, p: Punto): boolean => p.x >= 0 && p.x < e.ancho && p.y >= 0 && p.y < e.alto;

const reducer = (e: Estado, accion: Accion): Estado => {
  switch (accion.tipo) {
    case "dibujar":
      return { ...e, trazos: [...e.trazos, accion.trazo], rehacer: [] };
    case "deshacer": {
      const ultimo = e.trazos[e.trazos.length - 1];
      return ultimo ? { ...e, trazos: e.trazos.slice(0, -1), rehacer: [...e.rehacer, ultimo] } : e;
    }
    case "rehacer": {
      const ultimo = e.rehacer[e.rehacer.length - 1];
      return ultimo ? { ...e, trazos: [...e.trazos, ultimo], rehacer: e.rehacer.slice(0, -1) } : e;
    }
    case "limpiar":
      return { ...e, trazos: [], rehacer: [] };
  }
};

// Algoritmo de Bresenham para rasterizar una linea.
const puntosDeLinea = (a: Punto, b: Punto): Punto[] => {
  const puntos: Punto[] = [];
  let { x, y } = a;
  const dx = Math.abs(b.x - a.x);
  const dy = -Math.abs(b.y - a.y);
  const sx = a.x < b.x ? 1 : -1;
  const sy = a.y < b.y ? 1 : -1;
  let error = dx + dy;
  for (;;) {
    puntos.push({ x, y });
    if (x === b.x && y === b.y) break;
    const doble = 2 * error;
    if (doble >= dy) { error += dy; x += sx; }
    if (doble <= dx) { error += dx; y += sy; }
  }
  return puntos;
};

const puntosDe = (t: Trazo): { puntos: Punto[]; color: string } => {
  switch (t.tipo) {
    case "punto": return { puntos: [t.p], color: t.color };
    case "linea": return { puntos: puntosDeLinea(t.desde, t.hasta), color: t.color };
    case "rectangulo": {
      const x0 = Math.min(t.desde.x, t.hasta.x), x1 = Math.max(t.desde.x, t.hasta.x);
      const y0 = Math.min(t.desde.y, t.hasta.y), y1 = Math.max(t.desde.y, t.hasta.y);
      const puntos: Punto[] = [];
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        if (t.relleno || x === x0 || x === x1 || y === y0 || y === y1) puntos.push({ x, y });
      }
      return { puntos, color: t.color };
    }
  }
};

const rasterizar = (e: Estado): Cuadricula => {
  const celdas = Array.from({ length: e.alto }, () => Array<string>(e.ancho).fill("."));
  e.trazos.forEach((t) => {
    const { puntos, color } = puntosDe(t);
    puntos.filter((p) => dentro(e, p)).forEach((p) => { celdas[p.y][p.x] = color; });
  });
  return celdas;
};

const mostrar = (titulo: string, e: Estado): void => {
  console.log(`${titulo} (${e.trazos.length} trazo(s), ${e.rehacer.length} para rehacer)`);
  rasterizar(e).forEach((fila) => console.log(`  ${fila.join("")}`));
};

console.log("Ejercicio 78: Canvas de dibujo basico");
let estado: Estado = { ancho: 16, alto: 8, trazos: [], rehacer: [] };
const guion: readonly [string, Accion][] = [
  ["marco", { tipo: "dibujar", trazo: { tipo: "rectangulo", desde: { x: 1, y: 1 }, hasta: { x: 14, y: 6 }, color: "#", relleno: false } }],
  ["diagonal", { tipo: "dibujar", trazo: { tipo: "linea", desde: { x: 2, y: 2 }, hasta: { x: 13, y: 5 }, color: "*" } }],
  ["sol", { tipo: "dibujar", trazo: { tipo: "punto", p: { x: 12, y: 2 }, color: "o" } }],
  ["fuera del lienzo (se recorta)", { tipo: "dibujar", trazo: { tipo: "linea", desde: { x: 10, y: 6 }, hasta: { x: 30, y: 6 }, color: "~" } }],
];
guion.forEach(([nombre, accion]) => { estado = reducer(estado, accion); console.log(`> ${nombre}`); });
mostrar("Lienzo", estado);
estado = reducer(reducer(estado, { tipo: "deshacer" }), { tipo: "deshacer" });
mostrar("Tras deshacer 2 veces", estado);
estado = reducer(estado, { tipo: "rehacer" });
mostrar("Tras rehacer 1 vez", estado);
mostrar("Tras limpiar", reducer(estado, { tipo: "limpiar" }));
