export {};

// Intermedio 75: Lista turistica interactiva
// Tematica: turismo
// Resolucion: Dulce Morales
//
// Problema: una app turistica con dos vistas sincronizadas, un mapa y una lista de lugares. La persona
// filtra (categoria, radio, abiertos ahora), ordena (distancia o calificacion), marca favoritos
// (que se guardan en un storage simulado) y pide una ruta a pie que pase por sus favoritos.
// Como no hay navegador, el mapa se dibuja como una cuadricula de texto.

// ===================== MODELO =====================

type Categoria = "museo" | "mirador" | "mercado" | "parque" | "iglesia";

interface Coordenada {
  readonly lat: number;
  readonly lon: number;
}

interface Lugar {
  readonly id: string;
  readonly nombre: string;
  readonly categoria: Categoria;
  readonly pos: Coordenada;
  readonly calificacion: number; // 1..5
  readonly abre: number;         // hora
  readonly cierra: number;
  readonly precio: number;       // entrada en MXN
}

// DTO de consulta (lo que la vista manda al servicio)
interface ConsultaDTO {
  readonly desde: Coordenada;
  readonly hora: number;
  readonly radioKm?: number;
  readonly categorias?: readonly Categoria[];
  readonly soloAbiertos?: boolean;
  readonly orden: "distancia" | "calificacion";
}

// DTO de salida: una fila de la lista, ya con la distancia calculada
interface FilaDTO {
  readonly id: string;
  readonly nombre: string;
  readonly categoria: Categoria;
  readonly distanciaKm: number;
  readonly calificacion: number;
  readonly abierto: boolean;
  readonly favorito: boolean;
}

// ===================== STORAGE SIMULADO =====================

interface AlmacenTexto {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}

class StorageMemoria implements AlmacenTexto {
  private readonly m: Map<string, string> = new Map();
  getItem(k: string): string | null { return this.m.get(k) ?? null; }
  setItem(k: string, v: string): void { this.m.set(k, v); }
}

class Favoritos {
  private ids: Set<string>;
  constructor(private readonly almacen: AlmacenTexto, private readonly clave: string) {
    const texto: string | null = almacen.getItem(clave);
    let leidos: unknown = [];
    try { leidos = texto === null ? [] : JSON.parse(texto); } catch { leidos = []; }
    this.ids = new Set(Array.isArray(leidos) ? leidos.filter((x): x is string => typeof x === "string") : []);
  }
  alternar(id: string): boolean {
    const ahora: boolean = !this.ids.has(id);
    if (ahora) this.ids.add(id); else this.ids.delete(id);
    this.almacen.setItem(this.clave, JSON.stringify([...this.ids]));
    return ahora;
  }
  tiene(id: string): boolean { return this.ids.has(id); }
  lista(): readonly string[] { return [...this.ids]; }
}

// ===================== REPOSITORIO =====================

class RepoLugares {
  private readonly porId: Map<string, Lugar>;
  constructor(lugares: readonly Lugar[]) { this.porId = new Map(lugares.map((l) => [l.id, l])); }
  buscar(id: string): Lugar | undefined { return this.porId.get(id); }
  todos(): readonly Lugar[] { return [...this.porId.values()]; }
}

// Centro historico de Guanajuato (coordenadas aproximadas)
const repo: RepoLugares = new RepoLugares([
  { id: "alhondiga", nombre: "Alhondiga de Granaditas", categoria: "museo", pos: { lat: 21.0186, lon: -101.2591 }, calificacion: 4.7, abre: 10, cierra: 18, precio: 90 },
  { id: "pipila", nombre: "Monumento al Pipila", categoria: "mirador", pos: { lat: 21.0153, lon: -101.2532 }, calificacion: 4.8, abre: 8, cierra: 21, precio: 0 },
  { id: "hidalgo", nombre: "Mercado Hidalgo", categoria: "mercado", pos: { lat: 21.0177, lon: -101.2580 }, calificacion: 4.4, abre: 8, cierra: 20, precio: 0 },
  { id: "union", nombre: "Jardin de la Union", categoria: "parque", pos: { lat: 21.0163, lon: -101.2516 }, calificacion: 4.8, abre: 0, cierra: 24, precio: 0 },
  { id: "basilica", nombre: "Basilica Colegiata", categoria: "iglesia", pos: { lat: 21.0171, lon: -101.2545 }, calificacion: 4.7, abre: 7, cierra: 20, precio: 0 },
  { id: "momias", nombre: "Museo de las Momias", categoria: "museo", pos: { lat: 21.0145, lon: -101.2650 }, calificacion: 4.2, abre: 9, cierra: 18, precio: 100 },
  { id: "callejon", nombre: "Callejon del Beso", categoria: "mirador", pos: { lat: 21.0170, lon: -101.2565 }, calificacion: 4.3, abre: 0, cierra: 24, precio: 0 },
  { id: "presa", nombre: "Presa de la Olla", categoria: "parque", pos: { lat: 21.0100, lon: -101.2440 }, calificacion: 4.5, abre: 7, cierra: 19, precio: 0 },
]);

// ===================== CALCULOS PUROS =====================

const RADIO_TIERRA_KM: number = 6371;
const VELOCIDAD_PIE_KMH: number = 4.5;

function distanciaKm(a: Coordenada, b: Coordenada): number {
  const rad = (g: number): number => (g * Math.PI) / 180;
  const dLat: number = rad(b.lat - a.lat);
  const dLon: number = rad(b.lon - a.lon);
  const h: number = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * RADIO_TIERRA_KM * Math.asin(Math.sqrt(h));
}

// Abierto si abre <= hora < cierra (a la hora exacta de cierre ya esta cerrado)
const abiertoA = (l: Lugar, hora: number): boolean => hora >= l.abre && hora < l.cierra;

// ===================== SERVICIO =====================

class AppTurismo {
  constructor(private readonly favs: Favoritos) {}

  listar(q: ConsultaDTO): readonly FilaDTO[] {
    const filas: FilaDTO[] = repo.todos()
      .map((l): FilaDTO => ({
        id: l.id, nombre: l.nombre, categoria: l.categoria,
        distanciaKm: distanciaKm(q.desde, l.pos), calificacion: l.calificacion,
        abierto: abiertoA(l, q.hora), favorito: this.favs.tiene(l.id),
      }))
      .filter((f) => (q.radioKm === undefined || f.distanciaKm <= q.radioKm)
        && (q.categorias === undefined || q.categorias.length === 0 || q.categorias.includes(f.categoria))
        && (!q.soloAbiertos || f.abierto));
    return q.orden === "distancia"
      ? filas.sort((a, b) => a.distanciaKm - b.distanciaKm)
      : filas.sort((a, b) => b.calificacion - a.calificacion || a.distanciaKm - b.distanciaKm);
  }

  alternarFavorito(id: string): string {
    const l: Lugar | undefined = repo.buscar(id);
    if (l === undefined) return `no existe el lugar "${id}"`;
    return `${l.nombre}: ${this.favs.alternar(id) ? "agregado a" : "quitado de"} favoritos`;
  }

  // Ruta a pie por favoritos: vecino mas cercano, saltando los que estaran cerrados al llegar
  ruta(desde: Coordenada, horaSalida: number, minutosPorLugar: number): { readonly pasos: readonly string[]; readonly omitidos: readonly string[]; readonly km: number } {
    let pendientes: Lugar[] = this.favs.lista().map((id) => repo.buscar(id)).filter((l): l is Lugar => l !== undefined);
    const pasos: string[] = [];
    const omitidos: string[] = [];
    let pos: Coordenada = desde;
    let hora: number = horaSalida;
    let km: number = 0;
    while (pendientes.length > 0) {
      const orden: Lugar[] = [...pendientes].sort((a, b) => distanciaKm(pos, a.pos) - distanciaKm(pos, b.pos));
      const prox: Lugar | undefined = orden.find((l) => abiertoA(l, hora + distanciaKm(pos, l.pos) / VELOCIDAD_PIE_KMH));
      if (prox === undefined) {
        omitidos.push(...pendientes.map((l) => `${l.nombre} (cerrado a las ${aHora(hora)})`));
        break;
      }
      const tramo: number = distanciaKm(pos, prox.pos);
      hora += tramo / VELOCIDAD_PIE_KMH;
      pasos.push(`${aHora(hora)} llegar a ${prox.nombre} (+${(tramo * 1000).toFixed(0)} m)`);
      hora += minutosPorLugar / 60;
      km += tramo;
      pos = prox.pos;
      pendientes = pendientes.filter((l) => l.id !== prox.id);
    }
    return { pasos, omitidos, km };
  }
}

function aHora(h: number): string {
  const total: number = Math.round(h * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

// ===================== "MAPA" =====================

const INICIAL: Readonly<Record<Categoria, string>> = { museo: "M", mirador: "V", mercado: "$", parque: "P", iglesia: "+" };

function dibujarMapa(filas: readonly FilaDTO[], yo: Coordenada, ancho: number, alto: number): string[] {
  const lugares: Lugar[] = repo.todos().slice();
  const lats: number[] = [...lugares.map((l) => l.pos.lat), yo.lat];
  const lons: number[] = [...lugares.map((l) => l.pos.lon), yo.lon];
  const [minLat, maxLat, minLon, maxLon] = [Math.min(...lats), Math.max(...lats), Math.min(...lons), Math.max(...lons)];
  const celda = (c: Coordenada): [number, number] => [
    Math.round(((maxLat - c.lat) / (maxLat - minLat)) * (alto - 1)),
    Math.round(((c.lon - minLon) / (maxLon - minLon)) * (ancho - 1)),
  ];
  const grid: string[][] = Array.from({ length: alto }, () => Array<string>(ancho).fill("."));
  const visibles: Set<string> = new Set(filas.map((f) => f.id));
  for (const l of lugares) {
    const [r, c] = celda(l.pos);
    const fila: string[] | undefined = grid[r];
    // En el mapa, los lugares que no pasan el filtro se ven atenuados (con "o")
    if (fila !== undefined) fila[c] = visibles.has(l.id) ? INICIAL[l.categoria] : "o";
  }
  const [ry, cy] = celda(yo);
  const filaYo: string[] | undefined = grid[ry];
  if (filaYo !== undefined) filaYo[cy] = "@";
  return grid.map((f) => f.join(""));
}

// ===================== DEMO =====================

function imprimirLista(titulo: string, filas: readonly FilaDTO[]): void {
  console.log(`\n--- ${titulo}: ${filas.length} lugar(es) ---`);
  for (const f of filas) {
    console.log(`  ${f.favorito ? "*" : " "} ${f.nombre.padEnd(24)} ${f.categoria.padEnd(8)} ${(f.distanciaKm * 1000).toFixed(0).padStart(5)} m  ${f.calificacion.toFixed(1)}  ${f.abierto ? "abierto" : "cerrado"}`);
  }
}

function main(): void {
  const storage: StorageMemoria = new StorageMemoria();
  const app: AppTurismo = new AppTurismo(new Favoritos(storage, "turismo.favs"));
  const hotel: Coordenada = { lat: 21.0165, lon: -101.2560 };

  imprimirLista("Todo, por distancia, 9:00", app.listar({ desde: hotel, hora: 9, orden: "distancia" }));
  imprimirLista("Radio 400 m, por calificacion", app.listar({ desde: hotel, hora: 9, radioKm: 0.4, orden: "calificacion" }));
  imprimirLista("Museos y miradores abiertos a las 9:00", app.listar({ desde: hotel, hora: 9, categorias: ["museo", "mirador"], soloAbiertos: true, orden: "distancia" }));
  imprimirLista("Museos abiertos a las 17:00", app.listar({ desde: hotel, hora: 17, soloAbiertos: true, categorias: ["museo"], orden: "distancia" }));
  imprimirLista("Museos abiertos a las 18:00 (limite: cierran a las 18)", app.listar({ desde: hotel, hora: 18, soloAbiertos: true, categorias: ["museo"], orden: "distancia" }));

  console.log("\n--- Mapa (filtro: radio 400 m) ---  @ hotel, M museo, V mirador, $ mercado, P parque, + iglesia, o fuera del filtro");
  for (const linea of dibujarMapa(app.listar({ desde: hotel, hora: 9, radioKm: 0.4, orden: "distancia" }), hotel, 40, 9)) console.log("  " + linea);

  console.log("\n--- Favoritos ---");
  for (const id of ["pipila", "alhondiga", "momias", "presa", "teatro", "union", "union", "union"]) console.log("  " + app.alternarFavorito(id));
  console.log(`  storage: ${storage.getItem("turismo.favs")}`);

  // Simula recargar la pagina: otra instancia lee los mismos favoritos
  const recargada: AppTurismo = new AppTurismo(new Favoritos(storage, "turismo.favs"));
  imprimirLista("Lista tras recargar (favoritos con *)", recargada.listar({ desde: hotel, hora: 9, orden: "calificacion" }).slice(0, 4));

  for (const salida of [10, 16.5]) {
    const r = recargada.ruta(hotel, salida, 75);
    console.log(`\n--- Ruta a pie saliendo a las ${aHora(salida)} (75 min por lugar) ---`);
    for (const p of r.pasos) console.log("  " + p);
    for (const o of r.omitidos) console.log("  omitido: " + o);
    console.log(`  recorrido: ${r.km.toFixed(2)} km`);
  }
}

main();
