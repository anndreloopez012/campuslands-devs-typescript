export {};

// Intermedio 42: Outfit segun clima
// Tematica: ropa y clima
// Resolucion: Dulce Morales
//
// Problema: con el pronostico de la semana y el closet de una persona, un servicio arma el outfit
// de cada dia: capas segun la temperatura, prenda impermeable si va a llover, ropa formal si hay
// un evento, y sin repetir la misma prenda en dias seguidos (necesita lavarse). Al final, un
// reporte de que prendas se usaron mas y cuales nunca.

// ===================== TIPOS =====================

type Capa = "base" | "medio" | "exterior" | "calzado";
type Formalidad = "casual" | "formal";
type EstadoPrenda = "disponible" | "en lavanderia";

interface Prenda {
  readonly id: string;
  readonly nombre: string;
  readonly capa: Capa;
  readonly abrigo: number; // 0 a 3
  readonly impermeable: boolean;
  readonly formalidad: Formalidad;
}

interface Pronostico {
  readonly fecha: Date;
  readonly minC: number;
  readonly maxC: number;
  readonly lluviaPct: number;
  readonly evento: Formalidad;
}

interface Outfit {
  readonly fecha: Date;
  readonly prendas: readonly Prenda[];
  readonly razones: readonly string[];
  readonly faltantes: readonly string[];
}

// ===================== REGLAS =====================

const TEMP_CAPA_MEDIA: number = 18; // si la minima es MENOR a 18, va capa media
const TEMP_ABRIGO: number = 10; // si la minima es MENOR a 10, va abrigo exterior
const LLUVIA_IMPERMEABLE: number = 50; // con 50% o mas de lluvia, exterior impermeable
const DIAS_DESCANSO: number = 1; // una prenda usada no se repite al dia siguiente (se lava)

// ===================== CLASES =====================

class Closet<T extends { readonly id: string }> {
  private readonly prendas: Map<string, T> = new Map();
  private readonly ultimoUso: Map<string, Date> = new Map();
  private readonly usos: Map<string, number> = new Map();

  agregar(p: T): void {
    this.prendas.set(p.id, p);
  }

  estado(id: string, dia: Date): EstadoPrenda {
    const ultimo: Date | undefined = this.ultimoUso.get(id);
    if (ultimo === undefined) return "disponible";
    const dias: number = Math.round((dia.getTime() - ultimo.getTime()) / 86_400_000);
    return dias > DIAS_DESCANSO ? "disponible" : "en lavanderia";
  }

  disponibles(dia: Date): T[] {
    return [...this.prendas.values()].filter((p: T): boolean => this.estado(p.id, dia) === "disponible");
  }

  usar(p: T, dia: Date): void {
    this.ultimoUso.set(p.id, dia);
    this.usos.set(p.id, (this.usos.get(p.id) ?? 0) + 1);
  }

  conteoDeUsos(): [T, number][] {
    return [...this.prendas.values()].map((p: T): [T, number] => [p, this.usos.get(p.id) ?? 0]);
  }
}

class OutfitService {
  constructor(private readonly closet: Closet<Prenda>) {}

  // Elige la mejor prenda de una capa que cumpla los filtros: primero la de la formalidad del dia,
  // luego la de abrigo mas cercano al necesario
  private elegir(dia: Date, capa: Capa, filtro: (p: Prenda) => boolean, abrigoIdeal: number, estilo: Formalidad): Prenda | undefined {
    return this.closet
      .disponibles(dia)
      .filter((p: Prenda): boolean => p.capa === capa && filtro(p))
      .sort(
        (a, b): number =>
          Number(a.formalidad !== estilo) - Number(b.formalidad !== estilo) ||
          Math.abs(a.abrigo - abrigoIdeal) - Math.abs(b.abrigo - abrigoIdeal) ||
          a.id.localeCompare(b.id),
      )[0];
  }

  armar(p: Pronostico): Outfit {
    const prendas: Prenda[] = [];
    const razones: string[] = [];
    const faltantes: string[] = [];
    const formal = (x: Prenda): boolean => p.evento === "casual" || x.formalidad === "formal";
    const llueve: boolean = p.lluviaPct >= LLUVIA_IMPERMEABLE;
    const frio: number = p.minC < TEMP_ABRIGO ? 3 : p.minC < TEMP_CAPA_MEDIA ? 2 : 0;

    const agregar = (capa: Capa, filtro: (x: Prenda) => boolean, ideal: number, razon: string): void => {
      const elegida: Prenda | undefined = this.elegir(p.fecha, capa, filtro, ideal, p.evento);
      if (elegida === undefined) {
        faltantes.push(`${capa} (${razon})`);
        return;
      }
      prendas.push(elegida);
      razones.push(razon);
    };

    agregar("base", formal, 0, p.evento === "formal" ? "base formal por el evento" : "base");
    if (p.minC < TEMP_CAPA_MEDIA) agregar("medio", formal, 1, `minima ${p.minC} C (< ${TEMP_CAPA_MEDIA})`);
    if (llueve || p.minC < TEMP_ABRIGO) {
      agregar("exterior", (x: Prenda): boolean => (!llueve || x.impermeable) && formal(x), frio, llueve ? `lluvia ${p.lluviaPct}%` : `minima ${p.minC} C (< ${TEMP_ABRIGO})`);
    }
    agregar("calzado", (x: Prenda): boolean => (!llueve || x.impermeable) && formal(x), 0, llueve ? "calzado impermeable" : "calzado");

    prendas.forEach((x: Prenda): void => this.closet.usar(x, p.fecha));
    return { fecha: p.fecha, prendas, razones, faltantes };
  }
}

// ===================== DATOS =====================

function dia(n: number): Date {
  return new Date(2026, 10, n); // noviembre 2026 (mes 10 = noviembre)
}

const prendas: readonly Prenda[] = [
  { id: "B1", nombre: "Camiseta blanca", capa: "base", abrigo: 0, impermeable: false, formalidad: "casual" },
  { id: "B2", nombre: "Camiseta negra", capa: "base", abrigo: 0, impermeable: false, formalidad: "casual" },
  { id: "B3", nombre: "Camisa celeste", capa: "base", abrigo: 0, impermeable: false, formalidad: "formal" },
  { id: "B4", nombre: "Polo gris", capa: "base", abrigo: 0, impermeable: false, formalidad: "casual" },
  { id: "B5", nombre: "Camisa blanca", capa: "base", abrigo: 0, impermeable: false, formalidad: "formal" },
  { id: "M1", nombre: "Sueter de lana", capa: "medio", abrigo: 2, impermeable: false, formalidad: "casual" },
  { id: "M2", nombre: "Saco azul", capa: "medio", abrigo: 1, impermeable: false, formalidad: "formal" },
  { id: "M3", nombre: "Hoodie", capa: "medio", abrigo: 2, impermeable: false, formalidad: "casual" },
  { id: "E1", nombre: "Chamarra impermeable", capa: "exterior", abrigo: 1, impermeable: true, formalidad: "casual" },
  { id: "E2", nombre: "Abrigo largo", capa: "exterior", abrigo: 3, impermeable: false, formalidad: "formal" },
  { id: "E3", nombre: "Rompevientos", capa: "exterior", abrigo: 1, impermeable: true, formalidad: "casual" },
  { id: "C1", nombre: "Tenis", capa: "calzado", abrigo: 0, impermeable: false, formalidad: "casual" },
  { id: "C2", nombre: "Botas", capa: "calzado", abrigo: 1, impermeable: true, formalidad: "casual" },
  { id: "C3", nombre: "Zapatos", capa: "calzado", abrigo: 0, impermeable: false, formalidad: "formal" },
  { id: "C4", nombre: "Sandalias", capa: "calzado", abrigo: 0, impermeable: false, formalidad: "casual" },
  { id: "C5", nombre: "Botines", capa: "calzado", abrigo: 1, impermeable: true, formalidad: "formal" },
];

const semana: readonly Pronostico[] = [
  { fecha: dia(16), minC: 18, maxC: 26, lluviaPct: 10, evento: "casual" }, // limite: minima 18 EXACTA -> sin capa media
  { fecha: dia(17), minC: 14, maxC: 21, lluviaPct: 50, evento: "casual" }, // limite: lluvia 50% EXACTO -> impermeable
  { fecha: dia(18), minC: 12, maxC: 19, lluviaPct: 20, evento: "formal" },
  { fecha: dia(19), minC: 7, maxC: 15, lluviaPct: 70, evento: "casual" }, // frio y lluvia
  { fecha: dia(20), minC: 8, maxC: 16, lluviaPct: 0, evento: "formal" },
  { fecha: dia(21), minC: 20, maxC: 29, lluviaPct: 0, evento: "casual" },
  // Boda con lluvia: no hay ningun exterior formal e impermeable -> se avisa que falta
  { fecha: dia(22), minC: 16, maxC: 24, lluviaPct: 60, evento: "formal" },
];

// ===================== SALIDA =====================

function main(): void {
  const closet: Closet<Prenda> = new Closet<Prenda>();
  prendas.forEach((p: Prenda): void => closet.agregar(p));
  const servicio: OutfitService = new OutfitService(closet);
  const nombresDia: readonly string[] = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];

  console.log("===================== OUTFITS DE LA SEMANA =====================");
  for (const p of semana) {
    const o: Outfit = servicio.armar(p);
    const encabezado: string = `${nombresDia[p.fecha.getDay()]} ${p.fecha.getDate()}/11 | ${p.minC}-${p.maxC} C, lluvia ${p.lluviaPct}%, ${p.evento}`;
    console.log(`\n${encabezado}`);
    o.prendas.forEach((x: Prenda, i: number): void => console.log(`  ${x.capa.padEnd(9)} ${x.nombre.padEnd(21)} (${o.razones[i] ?? ""})`));
    o.faltantes.forEach((f: string): void => console.log(`  ! falta ${f}: ninguna prenda disponible cumple (o esta en lavanderia)`));
  }

  console.log("\n===================== REPORTE DE USO =====================");
  const usos: [Prenda, number][] = closet.conteoDeUsos().sort((a, b): number => b[1] - a[1] || a[0].id.localeCompare(b[0].id));
  usos.filter(([, n]) => n > 0).forEach(([p, n]): void => console.log(`${p.nombre.padEnd(21)} ${"*".repeat(n)} ${n}`));
  const sinUso: string[] = usos.filter(([, n]) => n === 0).map(([p]) => p.nombre);
  console.log(`Nunca usadas esta semana: ${sinUso.join(", ") || "ninguna"}`);
}

main();
