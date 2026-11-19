export {};

// Intermedio 46: Catalogo de estilos tattoo
// Tematica: tatuajes
// Resolucion: Dulce Morales
//
// Problema: un estudio publica un catalogo de disenos "flash" (dibujos listos para tatuar).
// Algunos son unicos (solo se tatuan una vez) y otros se pueden repetir. Un cliente puede
// reservar un diseno pagando un anticipo; si no se tatua en 7 dias, la reserva vence y el
// diseno vuelve a estar disponible. El servicio maneja esos estados, permite filtrar el catalogo
// y arma reportes por estilo y por artista.

// ===================== TIPOS =====================

type Estilo = "tradicional" | "fine line" | "blackwork" | "neotradicional" | "acuarela";
type Estado = "disponible" | "reservado" | "tatuado";

interface Diseno {
  readonly id: string;
  readonly nombre: string;
  readonly estilo: Estilo;
  readonly artista: string;
  readonly tamanoCm: number;
  readonly precio: number;
  readonly unico: boolean;
  readonly publicado: Date;
  estado: Estado;
  reservadoHasta: Date | null;
  reservadoPor: string | null;
  vecesTatuado: number;
}

interface Venta {
  readonly disenoId: string;
  readonly fecha: Date;
  readonly monto: number;
}

interface Filtro {
  readonly estilos?: readonly Estilo[];
  readonly precioMax?: number;
  readonly soloDisponibles?: boolean;
}

// ===================== REPOSITORIO GENERICO =====================

class Repositorio<T extends { readonly id: string }> {
  private readonly datos: Map<string, T> = new Map();

  agregar(item: T): void {
    if (this.datos.has(item.id)) throw new Error(`id repetido: ${item.id}`);
    this.datos.set(item.id, item);
  }

  obtener(id: string): T | undefined {
    return this.datos.get(id);
  }

  listar(filtro: (item: T) => boolean = (): boolean => true): T[] {
    return [...this.datos.values()].filter(filtro);
  }
}

// ===================== UTILIDADES =====================

const DIAS_RESERVA: number = 7;
const ANTICIPO: number = 0.3;
const DIA_MS: number = 86_400_000;

function f(mes: number, dia: number): Date {
  return new Date(2026, mes - 1, dia);
}

function sumarDias(d: Date, dias: number): Date {
  return new Date(d.getTime() + dias * DIA_MS);
}

function txt(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ===================== SERVICIO =====================

class CatalogoService {
  private readonly ventas: Venta[] = [];

  constructor(private readonly repo: Repositorio<Diseno>) {}

  // Libera las reservas vencidas: la reserva vale hasta el dia "reservadoHasta" INCLUSIVE
  actualizarVencidas(hoy: Date): string[] {
    const liberados: string[] = [];
    for (const d of this.repo.listar((x) => x.estado === "reservado")) {
      if (d.reservadoHasta !== null && hoy.getTime() > d.reservadoHasta.getTime()) {
        liberados.push(`"${d.nombre}": la reserva de ${d.reservadoPor} vencio el ${txt(d.reservadoHasta)}, vuelve a estar disponible`);
        d.estado = "disponible";
        d.reservadoHasta = null;
        d.reservadoPor = null;
      }
    }
    return liberados;
  }

  reservar(id: string, cliente: string, hoy: Date): string {
    this.actualizarVencidas(hoy);
    const d: Diseno | undefined = this.repo.obtener(id);
    if (d === undefined) return `X ${id} no existe`;
    if (d.estado !== "disponible") return `X "${d.nombre}" esta ${d.estado}${d.reservadoPor ? ` por ${d.reservadoPor}` : ""}`;
    d.estado = "reservado";
    d.reservadoPor = cliente;
    d.reservadoHasta = sumarDias(hoy, DIAS_RESERVA);
    return `OK ${cliente} reserva "${d.nombre}" hasta el ${txt(d.reservadoHasta)} (anticipo $${(d.precio * ANTICIPO).toFixed(2)})`;
  }

  tatuar(id: string, cliente: string, hoy: Date): string {
    this.actualizarVencidas(hoy);
    const d: Diseno | undefined = this.repo.obtener(id);
    if (d === undefined) return `X ${id} no existe`;
    if (d.estado === "tatuado") return `X "${d.nombre}" es unico y ya se tatuo`;
    if (d.estado === "reservado" && d.reservadoPor !== cliente) return `X "${d.nombre}" esta reservado por ${d.reservadoPor}`;
    d.vecesTatuado += 1;
    this.ventas.push({ disenoId: d.id, fecha: hoy, monto: d.precio });
    d.estado = d.unico ? "tatuado" : "disponible";
    d.reservadoPor = null;
    d.reservadoHasta = null;
    return `OK "${d.nombre}" tatuado a ${cliente} por ${d.artista} ($${d.precio})${d.unico ? " - diseno unico, sale del catalogo" : ""}`;
  }

  buscar(filtro: Filtro): Diseno[] {
    return this.repo
      .listar((d: Diseno): boolean =>
        (filtro.estilos === undefined || filtro.estilos.includes(d.estilo)) &&
        (filtro.precioMax === undefined || d.precio <= filtro.precioMax) &&
        (filtro.soloDisponibles !== true || d.estado === "disponible"),
      )
      .sort((a, b): number => a.precio - b.precio);
  }

  ingresosPorArtista(): Map<string, number> {
    return this.ventas.reduce((m: Map<string, number>, v: Venta): Map<string, number> => {
      const artista: string = this.repo.obtener(v.disenoId)?.artista ?? "?";
      return m.set(artista, (m.get(artista) ?? 0) + v.monto);
    }, new Map<string, number>());
  }

  tatuadosPorEstilo(): Map<Estilo, number> {
    const m: Map<Estilo, number> = new Map();
    this.repo.listar().forEach((d: Diseno): void => {
      if (d.vecesTatuado > 0) m.set(d.estilo, (m.get(d.estilo) ?? 0) + d.vecesTatuado);
    });
    return m;
  }
}

// ===================== DATOS Y SALIDA =====================

function diseno(id: string, nombre: string, estilo: Estilo, artista: string, tamanoCm: number, precio: number, unico: boolean, publicado: Date): Diseno {
  return { id, nombre, estilo, artista, tamanoCm, precio, unico, publicado, estado: "disponible", reservadoHasta: null, reservadoPor: null, vecesTatuado: 0 };
}

function main(): void {
  const repo: Repositorio<Diseno> = new Repositorio<Diseno>();
  [
    diseno("F1", "Golondrina clasica", "tradicional", "Rex", 8, 90, false, f(9, 1)),
    diseno("F2", "Rama de olivo", "fine line", "Luna", 12, 120, false, f(9, 10)),
    diseno("F3", "Serpiente geometrica", "blackwork", "Rex", 20, 260, true, f(10, 2)),
    diseno("F4", "Zorro en flores", "neotradicional", "Mia", 15, 210, true, f(10, 15)),
    diseno("F5", "Ballena acuarela", "acuarela", "Luna", 14, 180, true, f(10, 20)),
    diseno("F6", "Daga y rosa", "tradicional", "Rex", 10, 110, false, f(11, 1)),
  ].forEach((d: Diseno): void => repo.agregar(d));

  try {
    repo.agregar(diseno("F1", "Duplicado", "tradicional", "X", 5, 50, false, f(11, 1)));
  } catch (e: unknown) {
    console.log(`Validacion: ${e instanceof Error ? e.message : "error"}\n`);
  }

  const servicio: CatalogoService = new CatalogoService(repo);
  console.log("==================== MOVIMIENTOS ====================");
  const movimientos: [Date, () => string][] = [
    [f(11, 2), () => servicio.reservar("F3", "Valeria", f(11, 2))],
    [f(11, 3), () => servicio.reservar("F4", "Tomas", f(11, 3))],
    [f(11, 4), () => servicio.reservar("F3", "Diego", f(11, 4))],
    [f(11, 5), () => servicio.tatuar("F1", "Ana", f(11, 5))],
    [f(11, 6), () => servicio.tatuar("F1", "Luis", f(11, 6))], // no es unico: se puede repetir
    [f(11, 9), () => servicio.tatuar("F3", "Valeria", f(11, 9))],
    [f(11, 9), () => servicio.tatuar("F3", "Pedro", f(11, 9))], // unico y ya tatuado
    [f(11, 10), () => servicio.tatuar("F4", "Sara", f(11, 10))], // reservado por Tomas (vigente hasta el 10, inclusive)
    [f(11, 11), () => servicio.reservar("F4", "Sara", f(11, 11))], // la reserva de Tomas ya vencio
    [f(11, 12), () => servicio.tatuar("F5", "Eva", f(11, 12))],
    [f(11, 13), () => servicio.tatuar("F2", "Nico", f(11, 13))],
  ];
  for (const [fecha, accion] of movimientos) {
    const vencidas: string[] = servicio.actualizarVencidas(fecha);
    vencidas.forEach((v: string): void => console.log(`${txt(fecha)} ! ${v}`));
    console.log(`${txt(fecha)} ${accion()}`);
  }

  console.log("\n==================== BUSQUEDA: disponibles hasta $150 ====================");
  servicio.buscar({ precioMax: 150, soloDisponibles: true }).forEach((d: Diseno): void => console.log(`${d.id} ${d.nombre.padEnd(20)} ${d.estilo.padEnd(15)} ${d.tamanoCm} cm  $${d.precio}  (${d.artista})`));

  console.log("\n==================== ESTADO DEL CATALOGO ====================");
  repo.listar().forEach((d: Diseno): void => {
    const extra: string = d.estado === "reservado" ? ` por ${d.reservadoPor} hasta ${d.reservadoHasta ? txt(d.reservadoHasta) : "?"}` : "";
    console.log(`${d.id} ${d.nombre.padEnd(20)} ${d.unico ? "unico " : "repite"} ${d.estado}${extra} | tatuado ${d.vecesTatuado} vez/veces`);
  });

  console.log("\n==================== REPORTES ====================");
  console.log(`Ingresos por artista: ${[...servicio.ingresosPorArtista().entries()].sort((a, b) => b[1] - a[1]).map(([a, m]) => `${a} $${m}`).join(", ")}`);
  console.log(`Tatuajes por estilo: ${[...servicio.tatuadosPorEstilo().entries()].map(([e, n]) => `${e} ${n}`).join(", ")}`);
}

main();
