export {};

// Intermedio 52: Cliente API fake shooter
// Tematica: videojuegos shooter
// Resolucion: Dulce Morales
//
// Problema: una app de estadisticas consume la API de un shooter (aqui simulada en memoria).
// La API tarda en responder, a veces devuelve error 500, limita la cantidad de pedidos (429) y
// responde 404 si el jugador no existe. El cliente tipado reintenta cuando tiene sentido, guarda
// en cache lo ya consultado, pide datos en paralelo con Promise.all y nunca se cae: cada error
// llega como un tipo claro.

// ===================== TIPOS DE LA API =====================

interface PerfilDto {
  readonly id: string;
  readonly gamertag: string;
  readonly nivel: number;
  readonly region: "NA" | "EU" | "LATAM";
}

interface PartidaDto {
  readonly jugadorId: string;
  readonly kills: number;
  readonly muertes: number;
  readonly victoria: boolean;
}

type ErrorApi =
  | { readonly tipo: "no encontrado"; readonly recurso: string }
  | { readonly tipo: "limite de pedidos"; readonly reintentarEnMs: number }
  | { readonly tipo: "error del servidor"; readonly codigo: 500 | 503 }
  | { readonly tipo: "datos invalidos"; readonly detalle: string };

type Respuesta<T> = { readonly ok: true; readonly datos: T; readonly desdeCache: boolean } | { readonly ok: false; readonly error: ErrorApi };

// ===================== SERVIDOR FALSO =====================

class ServidorFalso {
  private pedidosEnVentana: number = 0;
  private llamadas: number = 0;
  private readonly fallaEnLlamada: ReadonlySet<number>;

  constructor(
    private readonly perfiles: Map<string, PerfilDto>,
    private readonly partidas: readonly PartidaDto[],
    fallas: readonly number[], // numeros de llamada que devuelven 500
  ) {
    this.fallaEnLlamada = new Set(fallas);
  }

  private esperar(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  // Responde como una API real: un "status" y un cuerpo sin tipo seguro (unknown)
  async get(ruta: string): Promise<{ status: number; cuerpo: unknown }> {
    this.llamadas += 1;
    await this.esperar(15);
    this.pedidosEnVentana += 1;
    setTimeout(() => (this.pedidosEnVentana -= 1), 60); // la ventana del limite dura 60 ms
    if (this.pedidosEnVentana > 4) return { status: 429, cuerpo: { reintentarEnMs: 70 } };
    if (this.fallaEnLlamada.has(this.llamadas)) return { status: 500, cuerpo: null };

    const perfil = ruta.match(/^\/jugadores\/(\w+)$/);
    if (perfil) {
      const p: PerfilDto | undefined = this.perfiles.get(perfil[1] ?? "");
      return p ? { status: 200, cuerpo: p } : { status: 404, cuerpo: null };
    }
    const partidas = ruta.match(/^\/jugadores\/(\w+)\/partidas$/);
    if (partidas) {
      if (!this.perfiles.has(partidas[1] ?? "")) return { status: 404, cuerpo: null };
      return { status: 200, cuerpo: this.partidas.filter((x) => x.jugadorId === partidas[1]) };
    }
    return { status: 404, cuerpo: null };
  }

  get totalLlamadas(): number {
    return this.llamadas;
  }
}

// ===================== VALIDACION DE LO QUE LLEGA (type guards) =====================

// Con el operador "in" TypeScript sabe que la propiedad existe, sin necesidad de casteos
function esPerfil(x: unknown): x is PerfilDto {
  return (
    typeof x === "object" && x !== null &&
    "id" in x && typeof x.id === "string" &&
    "gamertag" in x && typeof x.gamertag === "string" &&
    "nivel" in x && typeof x.nivel === "number" &&
    "region" in x && (x.region === "NA" || x.region === "EU" || x.region === "LATAM")
  );
}

function esPartida(p: unknown): p is PartidaDto {
  return (
    typeof p === "object" && p !== null &&
    "jugadorId" in p && typeof p.jugadorId === "string" &&
    "kills" in p && typeof p.kills === "number" &&
    "muertes" in p && typeof p.muertes === "number" &&
    "victoria" in p && typeof p.victoria === "boolean"
  );
}

function esListaPartidas(x: unknown): x is PartidaDto[] {
  return Array.isArray(x) && x.every(esPartida);
}

// ===================== CLIENTE =====================

class ClienteShooter {
  private readonly cache: Map<string, unknown> = new Map();
  public readonly reintentos: string[] = [];

  constructor(private readonly servidor: ServidorFalso, private readonly maxReintentos: number = 3) {}

  private async pedir<T>(ruta: string, validar: (x: unknown) => x is T): Promise<Respuesta<T>> {
    const enCache: unknown = this.cache.get(ruta);
    if (enCache !== undefined && validar(enCache)) return { ok: true, datos: enCache, desdeCache: true };

    for (let intento = 0; intento <= this.maxReintentos; intento++) {
      const { status, cuerpo } = await this.servidor.get(ruta);
      if (status === 200) {
        if (!validar(cuerpo)) return { ok: false, error: { tipo: "datos invalidos", detalle: `la respuesta de ${ruta} no tiene el formato esperado` } };
        this.cache.set(ruta, cuerpo);
        return { ok: true, datos: cuerpo, desdeCache: false };
      }
      if (status === 404) return { ok: false, error: { tipo: "no encontrado", recurso: ruta } }; // no tiene sentido reintentar
      if (intento === this.maxReintentos) {
        return status === 429 ? { ok: false, error: { tipo: "limite de pedidos", reintentarEnMs: 70 } } : { ok: false, error: { tipo: "error del servidor", codigo: 500 } };
      }
      this.reintentos.push(`${ruta}: recibio ${status}, reintento ${intento + 1}`);
      await new Promise((r) => setTimeout(r, status === 429 ? 70 : 20 * (intento + 1))); // espera antes de reintentar
    }
    return { ok: false, error: { tipo: "error del servidor", codigo: 503 } };
  }

  perfil(id: string): Promise<Respuesta<PerfilDto>> {
    return this.pedir(`/jugadores/${id}`, esPerfil);
  }

  partidas(id: string): Promise<Respuesta<PartidaDto[]>> {
    return this.pedir(`/jugadores/${id}/partidas`, esListaPartidas);
  }
}

function describirError(e: ErrorApi): string {
  switch (e.tipo) {
    case "no encontrado":
      return `404: ${e.recurso} no existe`;
    case "limite de pedidos":
      return `429: demasiados pedidos, reintentar en ${e.reintentarEnMs} ms`;
    case "error del servidor":
      return `${e.codigo}: el servidor fallo`;
    case "datos invalidos":
      return e.detalle;
  }
}

// ===================== DATOS Y SALIDA =====================

async function main(): Promise<void> {
  const perfiles: Map<string, PerfilDto> = new Map([
    ["p1", { id: "p1", gamertag: "NovaStrike", nivel: 87, region: "LATAM" }],
    ["p2", { id: "p2", gamertag: "SilentOwl", nivel: 120, region: "EU" }],
    ["p3", { id: "p3", gamertag: "Ghost404", nivel: 45, region: "NA" }],
  ]);
  const partidas: PartidaDto[] = [
    { jugadorId: "p1", kills: 21, muertes: 9, victoria: true }, { jugadorId: "p1", kills: 14, muertes: 12, victoria: false },
    { jugadorId: "p1", kills: 30, muertes: 8, victoria: true }, { jugadorId: "p2", kills: 18, muertes: 4, victoria: true },
    { jugadorId: "p2", kills: 9, muertes: 10, victoria: false }, { jugadorId: "p3", kills: 5, muertes: 15, victoria: false },
  ];
  // Las llamadas 2 y 3 al servidor fallan con 500
  const cliente: ClienteShooter = new ClienteShooter(new ServidorFalso(perfiles, partidas, [2, 3]));

  console.log("============ PERFIL + PARTIDAS EN PARALELO (Promise.all) ============");
  for (const id of ["p1", "p2", "p404"]) {
    const [perfil, lista] = await Promise.all([cliente.perfil(id), cliente.partidas(id)]);
    if (!perfil.ok) {
      console.log(`${id}: X ${describirError(perfil.error)}`);
      continue;
    }
    if (!lista.ok) {
      console.log(`${perfil.datos.gamertag}: X ${describirError(lista.error)}`);
      continue;
    }
    const k: number = lista.datos.reduce((s, p) => s + p.kills, 0);
    const m: number = lista.datos.reduce((s, p) => s + p.muertes, 0);
    const v: number = lista.datos.filter((p) => p.victoria).length;
    console.log(`${perfil.datos.gamertag.padEnd(10)} nv ${perfil.datos.nivel} ${perfil.datos.region.padEnd(5)} | ${lista.datos.length} partidas, K/D ${(k / Math.max(1, m)).toFixed(2)}, ${v} victoria(s)`);
  }

  console.log("\n============ CACHE ============");
  const segunda = await cliente.perfil("p1");
  console.log(`p1 otra vez: ${segunda.ok ? `${segunda.datos.gamertag} (desde cache: ${segunda.desdeCache})` : "error"}`);

  console.log("\n============ RAFAGA DE PEDIDOS (limite de 4 a la vez) ============");
  const rafaga = await Promise.all(["p3", "p3", "p2", "p1", "p3"].map((id, i) => (i % 2 === 0 ? cliente.partidas(id) : cliente.perfil(id))));
  rafaga.forEach((r, i) => console.log(`pedido ${i + 1}: ${r.ok ? (r.desdeCache ? "OK (cache)" : "OK") : describirError(r.error)}`));

  console.log(`\n============ REINTENTOS DEL CLIENTE (${cliente.reintentos.length}) ============`);
  cliente.reintentos.forEach((r: string): void => console.log(`- ${r}`));
}

main();
