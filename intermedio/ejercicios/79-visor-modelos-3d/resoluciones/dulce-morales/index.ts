export {};

// Intermedio 79: Visor de assets 3D
// Tematica: pingpong
// Resolucion: Dulce Morales
//
// Problema: el visor de modelos 3D de un videojuego de ping pong. Los assets (mesa, red, raqueta,
// pelota...) llegan en un manifiesto JSON (DTO). El sistema los valida, los guarda en un
// repositorio en memoria y hace lo que haria un visor antes de mostrarlos:
//  - revisa la escala comparando con las medidas reales del objeto (detecta exportes en cm o mm),
//  - revisa el presupuesto de la plataforma (triangulos, texturas potencia de 2, peso del archivo),
//  - calcula a que distancia poner la camara para encuadrar el modelo,
//  - elige el nivel de detalle (LOD) segun la distancia.
// Al final genera un reporte por plataforma.

// ===================== MODELO =====================

type Formato = "glb" | "gltf" | "obj" | "fbx";
type Plataforma = "movil" | "web" | "escritorio";
type Vec3 = readonly [number, number, number];

// DTO tal como viene del manifiesto (todavia sin confiar en el)
interface AssetDTO {
  readonly id: string;
  readonly archivo: string;
  readonly referencia: string;   // que objeto real representa (para revisar la escala)
  readonly lods: readonly { readonly triangulos: number; readonly distanciaMax: number }[];
  readonly texturas: readonly { readonly nombre: string; readonly ancho: number; readonly alto: number }[];
  readonly bbox: { readonly min: Vec3; readonly max: Vec3 }; // caja envolvente en unidades del archivo
  readonly pesoMB: number;
}

interface Asset {
  readonly id: string;
  readonly formato: Formato;
  readonly referencia: Referencia;
  readonly lods: readonly { readonly triangulos: number; readonly distanciaMax: number }[];
  readonly texturas: readonly { readonly nombre: string; readonly ancho: number; readonly alto: number }[];
  readonly tamano: Vec3; // en metros, ya corregido
  readonly escalaAplicada: number;
  readonly pesoMB: number;
}

type Referencia = "mesa" | "red" | "raqueta" | "pelota" | "marcador";

type Diagnostico = { readonly nivel: "error" | "aviso"; readonly texto: string };

// ===================== DATOS DE REFERENCIA =====================

// Medida real mas larga de cada objeto (metros, reglamento ITTF aproximado)
const MEDIDA_REAL_M: Readonly<Record<Referencia, number>> = {
  mesa: 2.74, red: 1.83, raqueta: 0.26, pelota: 0.04, marcador: 0.5,
};
const TOLERANCIA_ESCALA: number = 0.15; // 15 %
const UNIDADES: readonly { readonly nombre: string; readonly factor: number }[] = [
  { nombre: "m", factor: 1 }, { nombre: "cm", factor: 0.01 }, { nombre: "mm", factor: 0.001 }, { nombre: "pulgadas", factor: 0.0254 },
];

interface Presupuesto {
  readonly triangulosLod0: number;
  readonly texturaMax: number;
  readonly pesoMB: number;
}
const PRESUPUESTO: Readonly<Record<Plataforma, Presupuesto>> = {
  movil: { triangulosLod0: 15000, texturaMax: 1024, pesoMB: 3 },
  web: { triangulosLod0: 40000, texturaMax: 2048, pesoMB: 8 },
  escritorio: { triangulosLod0: 150000, texturaMax: 4096, pesoMB: 40 },
};
const FORMATOS_VISOR: readonly Formato[] = ["glb", "gltf"]; // el visor web solo carga glTF

const esReferencia = (x: string): x is Referencia => x in MEDIDA_REAL_M;
const esFormato = (x: string): x is Formato => ["glb", "gltf", "obj", "fbx"].some((f) => f === x);

// ===================== FUNCIONES PURAS =====================

const resta = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const escalar = (v: Vec3, k: number): Vec3 => [v[0] * k, v[1] * k, v[2] * k];
const mayor = (v: Vec3): number => Math.max(...v);
const esPotenciaDe2 = (n: number): boolean => n > 0 && (n & (n - 1)) === 0;

// Busca la unidad con la que la medida del archivo se acerca a la real
function detectarEscala(medidaArchivo: number, real: number): { readonly unidad: string; readonly factor: number } | null {
  for (const u of UNIDADES) {
    const enMetros: number = medidaArchivo * u.factor;
    if (Math.abs(enMetros - real) / real <= TOLERANCIA_ESCALA) return { unidad: u.nombre, factor: u.factor };
  }
  return null;
}

// Distancia de camara para que la esfera que envuelve al modelo quepa en el campo de vision
function distanciaEncuadre(tamano: Vec3, fovGrados: number, margen: number): number {
  const radio: number = Math.hypot(...tamano) / 2;
  return (radio / Math.sin(((fovGrados * Math.PI) / 180) / 2)) * margen;
}

function elegirLod(a: Asset, distancia: number): number {
  const i: number = a.lods.findIndex((l) => distancia <= l.distanciaMax);
  return i === -1 ? a.lods.length - 1 : i;
}

// ===================== VALIDACION DEL DTO =====================

function importar(dto: AssetDTO): { readonly asset: Asset | null; readonly diag: readonly Diagnostico[] } {
  const diag: Diagnostico[] = [];
  const err = (t: string): void => { diag.push({ nivel: "error", texto: t }); };
  const aviso = (t: string): void => { diag.push({ nivel: "aviso", texto: t }); };

  const ext: string = dto.archivo.split(".").pop()?.toLowerCase() ?? "";
  if (!esFormato(ext)) err(`formato ".${ext}" no soportado`);
  else if (!FORMATOS_VISOR.includes(ext)) aviso(`.${ext} se debe convertir a glb para el visor`);
  if (!esReferencia(dto.referencia)) err(`referencia "${dto.referencia}" desconocida`);
  if (dto.lods.length === 0) err("sin niveles de detalle");
  for (let i = 1; i < dto.lods.length; i++) {
    const a = dto.lods[i - 1];
    const b = dto.lods[i];
    if (a !== undefined && b !== undefined && b.triangulos >= a.triangulos) err(`LOD${i} no reduce triangulos (${a.triangulos} -> ${b.triangulos})`);
    if (a !== undefined && b !== undefined && b.distanciaMax <= a.distanciaMax) err(`LOD${i} debe usarse a mayor distancia que LOD${i - 1}`);
  }
  for (const t of dto.texturas) {
    if (!esPotenciaDe2(t.ancho) || !esPotenciaDe2(t.alto)) aviso(`textura ${t.nombre} ${t.ancho}x${t.alto} no es potencia de 2`);
  }
  const tamArchivo: Vec3 = resta(dto.bbox.max, dto.bbox.min);
  if (tamArchivo.some((d) => d <= 0)) err("caja envolvente invalida");

  let escala: number = 1;
  if (esReferencia(dto.referencia) && tamArchivo.every((d) => d > 0)) {
    const real: number = MEDIDA_REAL_M[dto.referencia];
    const det = detectarEscala(mayor(tamArchivo), real);
    if (det === null) err(`escala irreconocible: mide ${mayor(tamArchivo)} y deberia ser ~${real} m`);
    else if (det.factor !== 1) { escala = det.factor; aviso(`exportado en ${det.unidad}: se aplica escala x${det.factor}`); }
  }

  if (diag.some((d) => d.nivel === "error") || !esFormato(ext) || !esReferencia(dto.referencia)) return { asset: null, diag };
  return {
    asset: { id: dto.id, formato: ext, referencia: dto.referencia, lods: dto.lods, texturas: dto.texturas, tamano: escalar(tamArchivo, escala), escalaAplicada: escala, pesoMB: dto.pesoMB },
    diag,
  };
}

function cabeEn(a: Asset, p: Plataforma): readonly string[] {
  const b: Presupuesto = PRESUPUESTO[p];
  const fallas: string[] = [];
  const lod0: number = a.lods[0]?.triangulos ?? 0;
  if (lod0 > b.triangulosLod0) fallas.push(`${lod0} tris > ${b.triangulosLod0}`);
  const texMax: number = Math.max(0, ...a.texturas.map((t) => Math.max(t.ancho, t.alto)));
  if (texMax > b.texturaMax) fallas.push(`textura ${texMax} > ${b.texturaMax}`);
  if (a.pesoMB > b.pesoMB) fallas.push(`${a.pesoMB} MB > ${b.pesoMB}`);
  return fallas;
}

// ===================== REPOSITORIO =====================

class RepoAssets {
  private readonly items: Map<string, Asset> = new Map();
  guardar(a: Asset): boolean {
    if (this.items.has(a.id)) return false;
    this.items.set(a.id, a);
    return true;
  }
  todos(): readonly Asset[] { return [...this.items.values()]; }
  buscar(id: string): Asset | undefined { return this.items.get(id); }
}

// ===================== DEMO =====================

const manifiesto: readonly AssetDTO[] = [
  { id: "mesa_pro", archivo: "mesa_pro.glb", referencia: "mesa", pesoMB: 6.2,
    lods: [{ triangulos: 32000, distanciaMax: 4 }, { triangulos: 9000, distanciaMax: 12 }, { triangulos: 1500, distanciaMax: 60 }],
    texturas: [{ nombre: "madera_albedo", ancho: 2048, alto: 2048 }, { nombre: "madera_normal", ancho: 2048, alto: 2048 }],
    bbox: { min: [-1.37, 0, -0.7625], max: [1.37, 0.76, 0.7625] } },
  { id: "raqueta_roja", archivo: "raqueta_roja.FBX", referencia: "raqueta", pesoMB: 2.4,
    lods: [{ triangulos: 12000, distanciaMax: 1.5 }, { triangulos: 3000, distanciaMax: 8 }],
    texturas: [{ nombre: "goma_roja", ancho: 1024, alto: 1024 }],
    bbox: { min: [-7.5, -0.7, 0], max: [7.5, 0.7, 26] } },                         // exportada en cm
  { id: "pelota", archivo: "pelota.gltf", referencia: "pelota", pesoMB: 0.1,
    lods: [{ triangulos: 960, distanciaMax: 2 }, { triangulos: 240, distanciaMax: 20 }],
    texturas: [{ nombre: "pelota_logo", ancho: 300, alto: 300 }],
    bbox: { min: [-20, -20, -20], max: [20, 20, 20] } },                            // exportada en mm
  { id: "red_basica", archivo: "red.glb", referencia: "red", pesoMB: 0.8,
    lods: [{ triangulos: 4000, distanciaMax: 5 }, { triangulos: 4000, distanciaMax: 30 }],
    texturas: [],
    bbox: { min: [-0.915, 0, 0], max: [0.915, 0.1525, 0.02] } },                   // LOD que no reduce
  { id: "marcador", archivo: "marcador.glb", referencia: "marcador", pesoMB: 1.1,
    lods: [{ triangulos: 2500, distanciaMax: 10 }],
    texturas: [{ nombre: "digitos", ancho: 512, alto: 256 }],
    bbox: { min: [0, 0, 0], max: [0.575, 0.3, 0.1] } },                            // limite: +15 % exacto
  { id: "gigante", archivo: "mesa_vieja.obj", referencia: "mesa", pesoMB: 3,
    lods: [{ triangulos: 8000, distanciaMax: 50 }],
    texturas: [],
    bbox: { min: [0, 0, 0], max: [900, 250, 500] } },                              // escala que no cuadra
  { id: "trofeo", archivo: "trofeo.blend", referencia: "trofeo", pesoMB: 4,
    lods: [], texturas: [], bbox: { min: [0, 0, 0], max: [0, 0, 0] } },
  { id: "pelota", archivo: "pelota_v2.glb", referencia: "pelota", pesoMB: 0.1,
    lods: [{ triangulos: 500, distanciaMax: 20 }], texturas: [], bbox: { min: [0, 0, 0], max: [0.04, 0.04, 0.04] } }, // id repetido
];

function main(): void {
  const repo: RepoAssets = new RepoAssets();
  console.log("=== Importacion del manifiesto ===");
  for (const dto of manifiesto) {
    const { asset, diag } = importar(dto);
    const guardado: boolean = asset !== null && repo.guardar(asset);
    const estado: string = asset === null ? "RECHAZADO" : guardado ? "OK" : "DUPLICADO";
    console.log(`  ${estado.padEnd(9)} ${dto.id.padEnd(13)} ${dto.archivo}`);
    for (const d of diag) console.log(`             ${d.nivel === "error" ? "ERROR" : "aviso"}: ${d.texto}`);
  }

  console.log("\n=== Visor: encuadre (FOV 50, margen 1.2) y LOD por distancia ===");
  for (const a of repo.todos()) {
    const dist: number = distanciaEncuadre(a.tamano, 50, 1.2);
    const tam: string = a.tamano.map((d) => d.toFixed(3)).join(" x ");
    const lods: string = [0.5, 3, 10, 40].map((d) => `${d}m->LOD${elegirLod(a, d)}`).join(" ");
    console.log(`  ${a.id.padEnd(13)} ${tam.padEnd(22)} m  camara a ${dist.toFixed(2).padStart(5)} m   ${lods}`);
  }

  console.log("\n=== Presupuesto por plataforma ===");
  const plataformas: readonly Plataforma[] = ["movil", "web", "escritorio"];
  for (const p of plataformas) {
    const filas = repo.todos().map((a) => ({ a, fallas: cabeEn(a, p) }));
    const ok: number = filas.filter((f) => f.fallas.length === 0).length;
    console.log(`  ${p.padEnd(10)} ${ok}/${filas.length} assets dentro del presupuesto`);
    for (const f of filas.filter((x) => x.fallas.length > 0)) console.log(`     - ${f.a.id}: ${f.fallas.join(", ")}`);
  }

  const total = repo.todos().reduce((s, a) => ({ tris: s.tris + (a.lods[0]?.triangulos ?? 0), mb: s.mb + a.pesoMB }), { tris: 0, mb: 0 });
  console.log(`\n=== Reporte ===`);
  console.log(`  Assets validos: ${repo.todos().length} de ${manifiesto.length} | triangulos LOD0 en escena: ${total.tris} | peso total: ${total.mb.toFixed(1)} MB`);
  console.log(`  Reescalados: ${repo.todos().filter((a) => a.escalaAplicada !== 1).map((a) => `${a.id} x${a.escalaAplicada}`).join(", ")}`);
  console.log(`  Por convertir a glb: ${repo.todos().filter((a) => !FORMATOS_VISOR.includes(a.formato)).map((a) => a.id).join(", ") || "ninguno"}`);
}

main();
