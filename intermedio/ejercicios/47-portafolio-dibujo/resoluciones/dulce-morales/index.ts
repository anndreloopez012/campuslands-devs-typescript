export {};

// Intermedio 47: Portafolio de dibujo
// Tematica: dibujo e ilustracion
// Resolucion: Dulce Morales
//
// Problema: una ilustradora administra su portafolio en linea. Cada obra pasa por estados
// (borrador -> en revision -> publicada -> archivada) y solo se publica si cumple requisitos
// (titulo, etiquetas, resolucion minima). Las obras publicadas hace mas de un ano y con poco
// interes se archivan solas. Al final se arma un reporte: obras por mes, tecnicas que mas usa
// y las obras con mejor interaccion (me gusta por dia publicadas).

// ===================== TIPOS =====================

type Tecnica = "lapiz" | "acuarela" | "digital" | "tinta" | "oleo";
type Estado = "borrador" | "en revision" | "publicada" | "archivada";

interface Obra {
  readonly id: string;
  titulo: string;
  readonly tecnica: Tecnica;
  readonly creada: Date;
  readonly etiquetas: Set<string>;
  readonly resolucion: readonly [ancho: number, alto: number];
  estado: Estado;
  publicada: Date | null;
  meGusta: number;
}

type Resultado = { readonly ok: true; readonly mensaje: string } | { readonly ok: false; readonly mensaje: string };

// ===================== REGLAS =====================

const RESOLUCION_MIN: number = 1500; // lado mas corto en pixeles
const DIAS_PARA_ARCHIVAR: number = 365;
const ME_GUSTA_MINIMOS: number = 50;
const DIA_MS: number = 86_400_000;

// Transiciones permitidas
const SIGUIENTE: Readonly<Record<Estado, readonly Estado[]>> = {
  borrador: ["en revision"],
  "en revision": ["publicada", "borrador"],
  publicada: ["archivada"],
  archivada: ["publicada"],
};

// ===================== COLECCION GENERICA =====================

class Coleccion<T extends { readonly id: string }> {
  private readonly items: T[] = [];

  agregar(item: T): void {
    this.items.push(item);
  }

  buscar(id: string): T | undefined {
    return this.items.find((i: T): boolean => i.id === id);
  }

  donde(pred: (item: T) => boolean): T[] {
    return this.items.filter(pred);
  }

  agruparPor<K>(clave: (item: T) => K): Map<K, T[]> {
    return this.items.reduce((m: Map<K, T[]>, i: T): Map<K, T[]> => m.set(clave(i), [...(m.get(clave(i)) ?? []), i]), new Map<K, T[]>());
  }
}

// ===================== SERVICIO =====================

function f(anio: number, mes: number, dia: number): Date {
  return new Date(anio, mes - 1, dia);
}

function dias(desde: Date, hasta: Date): number {
  return Math.round((hasta.getTime() - desde.getTime()) / DIA_MS);
}

class PortafolioService {
  constructor(private readonly obras: Coleccion<Obra>) {}

  private requisitosPublicacion(o: Obra): string[] {
    const faltan: string[] = [];
    if (o.titulo.trim().length < 3) faltan.push("titulo muy corto");
    if (o.etiquetas.size === 0) faltan.push("sin etiquetas");
    if (Math.min(...o.resolucion) < RESOLUCION_MIN) faltan.push(`resolucion ${o.resolucion[0]}x${o.resolucion[1]} (lado minimo ${RESOLUCION_MIN})`);
    return faltan;
  }

  cambiarEstado(id: string, nuevo: Estado, hoy: Date): Resultado {
    const o: Obra | undefined = this.obras.buscar(id);
    if (o === undefined) return { ok: false, mensaje: `${id} no existe` };
    if (!SIGUIENTE[o.estado].includes(nuevo)) return { ok: false, mensaje: `"${o.titulo}": no se puede pasar de ${o.estado} a ${nuevo}` };
    if (nuevo === "publicada") {
      const faltan: string[] = this.requisitosPublicacion(o);
      if (faltan.length > 0) return { ok: false, mensaje: `"${o.titulo}" no se publica: ${faltan.join(", ")}` };
      o.publicada = hoy;
    }
    o.estado = nuevo;
    return { ok: true, mensaje: `"${o.titulo}" -> ${nuevo}` };
  }

  // Archiva las publicadas hace MAS de 365 dias y con menos de 50 me gusta
  archivarAntiguas(hoy: Date): string[] {
    return this.obras
      .donde((o: Obra): boolean => o.estado === "publicada" && o.publicada !== null && dias(o.publicada, hoy) > DIAS_PARA_ARCHIVAR && o.meGusta < ME_GUSTA_MINIMOS)
      .map((o: Obra): string => {
        o.estado = "archivada";
        return `"${o.titulo}" archivada automaticamente (${o.meGusta} me gusta)`;
      });
  }

  // Me gusta por dia desde que se publico
  interaccion(o: Obra, hoy: Date): number {
    if (o.publicada === null) return 0;
    return Math.round((o.meGusta / Math.max(1, dias(o.publicada, hoy))) * 100) / 100;
  }
}

// ===================== DATOS Y SALIDA =====================

function obra(id: string, titulo: string, tecnica: Tecnica, creada: Date, etiquetas: string[], resolucion: [number, number], meGusta: number, estado: Estado = "borrador", publicada: Date | null = null): Obra {
  return { id, titulo, tecnica, creada, etiquetas: new Set(etiquetas), resolucion, estado, publicada, meGusta };
}

function main(): void {
  const coleccion: Coleccion<Obra> = new Coleccion<Obra>();
  const hoy: Date = f(2026, 11, 16);
  [
    obra("O1", "Ciudad bajo la lluvia", "acuarela", f(2025, 9, 2), ["paisaje", "lluvia"], [3000, 2000], 410, "publicada", f(2025, 9, 10)),
    obra("O2", "Retrato de Ana", "lapiz", f(2025, 10, 1), ["retrato"], [2400, 3000], 35, "publicada", f(2025, 11, 15)), // limite: publicada hace 366 dias
    obra("O3", "Gato astronauta", "digital", f(2025, 11, 5), ["gatos", "espacio"], [4000, 4000], 20, "publicada", f(2025, 11, 16)), // limite: hace 365 dias EXACTOS
    obra("O4", "Bosque de tinta", "tinta", f(2026, 3, 12), ["bosque"], [2000, 2800], 95, "publicada", f(2026, 3, 20)),
    obra("O5", "Dragon de jade", "digital", f(2026, 9, 1), ["fantasia", "dragon"], [3500, 2500], 230, "publicada", f(2026, 9, 5)),
    obra("O6", "Bodegon azul", "oleo", f(2026, 10, 14), ["bodegon"], [1800, 1600], 0, "en revision"),
    obra("O7", "Boceto rapido", "lapiz", f(2026, 11, 2), [], [1200, 900], 0, "en revision"),
    obra("O8", "Ok", "digital", f(2026, 11, 10), ["prueba"], [2000, 2000], 0, "borrador"),
  ].forEach((o: Obra): void => coleccion.agregar(o));

  const servicio: PortafolioService = new PortafolioService(coleccion);

  console.log(`==================== MOVIMIENTOS (${hoy.toLocaleDateString("es")}) ====================`);
  [
    servicio.cambiarEstado("O6", "publicada", hoy),
    servicio.cambiarEstado("O7", "publicada", hoy), // sin etiquetas y baja resolucion
    servicio.cambiarEstado("O8", "publicada", hoy), // borrador: no puede saltar a publicada
    servicio.cambiarEstado("O8", "en revision", hoy),
    servicio.cambiarEstado("O8", "publicada", hoy), // titulo muy corto
  ].forEach((r: Resultado): void => console.log(`${r.ok ? "OK" : "X "} ${r.mensaje}`));
  servicio.archivarAntiguas(hoy).forEach((m: string): void => console.log(`!  ${m}`));

  console.log("\n==================== ESTADO DEL PORTAFOLIO ====================");
  coleccion.agruparPor((o: Obra): Estado => o.estado).forEach((lista: Obra[], estado: Estado): void => {
    console.log(`${estado} (${lista.length}): ${lista.map((o) => o.titulo).join(", ")}`);
  });

  console.log("\n==================== TOP POR INTERACCION (me gusta por dia) ====================");
  coleccion
    .donde((o: Obra): boolean => o.estado === "publicada")
    .sort((a, b): number => servicio.interaccion(b, hoy) - servicio.interaccion(a, hoy))
    .forEach((o: Obra, i: number): void => {
      const d: number = o.publicada === null ? 0 : dias(o.publicada, hoy);
      console.log(`${i + 1}. ${o.titulo.padEnd(22)} ${String(o.meGusta).padStart(3)} me gusta en ${String(d).padStart(3)} dias -> ${servicio.interaccion(o, hoy)}/dia`);
    });

  console.log("\n==================== OBRAS CREADAS POR MES Y TECNICA ====================");
  const porMes: Map<string, Obra[]> = coleccion.agruparPor((o: Obra): string => `${o.creada.getFullYear()}-${String(o.creada.getMonth() + 1).padStart(2, "0")}`);
  [...porMes.entries()].sort((a, b) => a[0].localeCompare(b[0])).forEach(([mes, lista]): void => console.log(`${mes}: ${lista.map((o) => `${o.titulo} (${o.tecnica})`).join(", ")}`));
  const tecnicas: Map<Tecnica, Obra[]> = coleccion.agruparPor((o: Obra): Tecnica => o.tecnica);
  console.log(`Tecnicas: ${[...tecnicas.entries()].sort((a, b) => b[1].length - a[1].length).map(([t, l]) => `${t} ${l.length}`).join(", ")}`);
  const etiquetas: Set<string> = new Set(coleccion.donde(() => true).flatMap((o) => [...o.etiquetas]));
  console.log(`Etiquetas usadas (${etiquetas.size}): ${[...etiquetas].sort().join(", ")}`);
}

main();
