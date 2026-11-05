export {};

interface Almacen {
  getItem(clave: string): string | null;
  setItem(clave: string, valor: string): void;
}

class AlmacenMemoria implements Almacen {
  private readonly datos = new Map<string, string>();
  getItem(clave: string): string | null {
    return this.datos.get(clave) ?? null;
  }
  setItem(clave: string, valor: string): void {
    this.datos.set(clave, valor);
  }
}

type Formato = "glb" | "fbx" | "obj";

interface Asset3D {
  readonly id: number;
  readonly nombre: string;
  readonly formato: Formato;
  readonly vertices: number;
  readonly triangulos: number;
  readonly tamanoMb: number;
}

interface Camara {
  readonly rotX: number;
  readonly rotY: number;
  readonly zoom: number;
}

interface Visor {
  readonly seleccionado: number | null;
  readonly camara: Camara;
}

type Accion =
  | { readonly tipo: "seleccionar"; readonly id: number }
  | { readonly tipo: "rotar"; readonly dx: number; readonly dy: number }
  | { readonly tipo: "zoom"; readonly factor: number }
  | { readonly tipo: "reiniciar-camara" };

const assets: readonly Asset3D[] = [
  { id: 1, nombre: "Moto deportiva", formato: "glb", vertices: 48_200, triangulos: 92_000, tamanoMb: 14.2 },
  { id: 2, nombre: "Casa moderna", formato: "fbx", vertices: 120_500, triangulos: 230_000, tamanoMb: 38.5 },
  { id: 3, nombre: "Personaje base", formato: "obj", vertices: 9_800, triangulos: 18_000, tamanoMb: 2.1 },
];

const CAMARA_INICIAL: Camara = { rotX: 20, rotY: 0, zoom: 1 };
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 4;
const CLAVE = "visor-3d";

const limitar = (n: number, min: number, max: number): number => Math.min(Math.max(n, min), max);
const redondear = (n: number): number => Math.round(n * 100) / 100;

const reducer = (v: Visor, accion: Accion): Visor => {
  switch (accion.tipo) {
    case "seleccionar":
      return assets.some((a) => a.id === accion.id) ? { seleccionado: accion.id, camara: CAMARA_INICIAL } : v;
    case "rotar":
      // El giro vertical se limita a +-90 grados; el horizontal da la vuelta completa.
      return { ...v, camara: { ...v.camara, rotX: limitar(v.camara.rotX + accion.dy, -90, 90), rotY: ((v.camara.rotY + accion.dx) % 360 + 360) % 360 } };
    case "zoom":
      return accion.factor > 0 ? { ...v, camara: { ...v.camara, zoom: redondear(limitar(v.camara.zoom * accion.factor, ZOOM_MIN, ZOOM_MAX)) } } : v;
    case "reiniciar-camara":
      return { ...v, camara: CAMARA_INICIAL };
  }
};

const advertencias = (a: Asset3D): string[] => [
  ...(a.triangulos > 150_000 ? ["modelo pesado (mas de 150k triangulos)"] : []),
  ...(a.tamanoMb > 30 ? ["archivo grande (mas de 30 MB)"] : []),
  ...(a.formato === "obj" ? ["formato sin animaciones"] : []),
];

const describir = (v: Visor): string => {
  const a = assets.find((x) => x.id === v.seleccionado);
  if (!a) return "Nada seleccionado";
  const w = advertencias(a);
  return `${a.nombre} [${a.formato}] ${a.triangulos.toLocaleString("en-US")} tris | camara rotX ${v.camara.rotX} rotY ${v.camara.rotY} zoom ${v.camara.zoom}${w.length ? ` | ! ${w.join("; ")}` : ""}`;
};

console.log("Ejercicio 79: Visor de assets 3D");
const almacen = new AlmacenMemoria();
const guardado = almacen.getItem(CLAVE);
let visor: Visor = guardado ? (JSON.parse(guardado) as Visor) : { seleccionado: null, camara: CAMARA_INICIAL };

const guion: readonly Accion[] = [
  { tipo: "rotar", dx: 10, dy: 5 },
  { tipo: "seleccionar", id: 2 },
  { tipo: "rotar", dx: 400, dy: 120 },
  { tipo: "rotar", dx: -50, dy: -300 },
  { tipo: "zoom", factor: 3 },
  { tipo: "zoom", factor: 3 },
  { tipo: "zoom", factor: -1 },
  { tipo: "reiniciar-camara" },
  { tipo: "seleccionar", id: 99 },
  { tipo: "seleccionar", id: 3 },
];
guion.forEach((accion) => {
  visor = reducer(visor, accion);
  almacen.setItem(CLAVE, JSON.stringify(visor));
  console.log(`  ${accion.tipo} -> ${describir(visor)}`);
});
const total = assets.reduce((acc, a) => acc + a.tamanoMb, 0);
console.log(`Biblioteca: ${assets.length} assets, ${redondear(total)} MB`);
console.log(`Ultima vista guardada: ${describir(JSON.parse(almacen.getItem(CLAVE) ?? "{}") as Visor)}`);
