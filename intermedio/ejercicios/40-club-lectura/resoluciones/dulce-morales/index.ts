export {};

// Intermedio 40: Club de lectura
// Tematica: libros
// Resolucion: Dulce Morales
//
// Problema: un club de lectura elige el libro del mes por votacion con preferencias: cada miembro
// ordena los libros del que mas quiere al que menos. Se usa "segunda vuelta instantanea": si
// ningun libro tiene mas de la mitad de los primeros lugares, se elimina el que tiene menos votos
// y esos votos pasan a la siguiente preferencia de cada papeleta. Despues, con el ritmo de lectura
// de cada miembro, se estima quien termina el libro antes de la reunion.

// ===================== TIPOS =====================

type Formato = "papel" | "ebook" | "audiolibro";

interface Libro {
  readonly codigo: string;
  readonly titulo: string;
  readonly paginas: number;
}

interface Miembro {
  readonly nombre: string;
  readonly formato: Formato;
  readonly paginasPorDia: number; // para audiolibro se convierte desde minutos
}

interface Papeleta {
  readonly votante: string;
  readonly orden: readonly string[]; // codigos de libro, de mas a menos preferido
}

type Revision = { readonly valida: true; readonly papeleta: Papeleta } | { readonly valida: false; readonly votante: string; readonly motivo: string };

function esValida(r: Revision): r is Extract<Revision, { valida: true }> {
  return r.valida;
}

interface Ronda {
  readonly numero: number;
  readonly conteo: ReadonlyMap<string, number>;
  readonly eliminado: string | null;
}

// ===================== CLASE =====================

class ClubLectura {
  constructor(
    public readonly nombre: string,
    private readonly libros: readonly Libro[],
    private readonly miembros: readonly Miembro[],
  ) {}

  libro(codigo: string): Libro | undefined {
    return this.libros.find((l: Libro): boolean => l.codigo === codigo);
  }

  revisar(p: Papeleta): Revision {
    if (!this.miembros.some((m: Miembro): boolean => m.nombre === p.votante)) return { valida: false, votante: p.votante, motivo: "no es miembro del club" };
    if (p.orden.length === 0) return { valida: false, votante: p.votante, motivo: "papeleta vacia" };
    if (new Set(p.orden).size !== p.orden.length) return { valida: false, votante: p.votante, motivo: "repite un libro" };
    const desconocido: string | undefined = p.orden.find((c: string): boolean => this.libro(c) === undefined);
    if (desconocido !== undefined) return { valida: false, votante: p.votante, motivo: `el libro ${desconocido} no esta en la lista` };
    return { valida: true, papeleta: p };
  }

  // Segunda vuelta instantanea
  votar(papeletas: readonly Papeleta[]): { ganador: string | null; rondas: Ronda[]; invalidas: Revision[] } {
    const revisiones: Revision[] = papeletas.map((p: Papeleta): Revision => this.revisar(p));
    const validas: Papeleta[] = revisiones.filter(esValida).map((r) => r.papeleta);
    // Un miembro solo puede votar una vez: vale la primera papeleta
    const vistos: Set<string> = new Set<string>();
    const unicas: Papeleta[] = validas.filter((p: Papeleta): boolean => (vistos.has(p.votante) ? false : (vistos.add(p.votante), true)));
    const invalidas: Revision[] = [
      ...revisiones.filter((r: Revision): boolean => !esValida(r)),
      ...validas.filter((p: Papeleta): boolean => !unicas.includes(p)).map((p): Revision => ({ valida: false, votante: p.votante, motivo: "ya habia votado" })),
    ];

    const enCarrera: Set<string> = new Set(this.libros.map((l: Libro): string => l.codigo));
    const rondas: Ronda[] = [];
    while (enCarrera.size > 0) {
      const conteo: Map<string, number> = new Map([...enCarrera].map((c: string): [string, number] => [c, 0]));
      let votosActivos: number = 0;
      for (const p of unicas) {
        const preferido: string | undefined = p.orden.find((c: string): boolean => enCarrera.has(c));
        if (preferido !== undefined) {
          conteo.set(preferido, (conteo.get(preferido) ?? 0) + 1);
          votosActivos += 1;
        }
      }
      const ordenado: [string, number][] = [...conteo.entries()].sort((a, b): number => b[1] - a[1] || a[0].localeCompare(b[0]));
      const lider: [string, number] | undefined = ordenado[0];
      // Gana con MAS de la mitad (la mitad exacta no alcanza)
      if (lider !== undefined && (lider[1] > votosActivos / 2 || enCarrera.size === 1)) {
        rondas.push({ numero: rondas.length + 1, conteo, eliminado: null });
        return { ganador: lider[0], rondas, invalidas };
      }
      // Se elimina el de menos votos; en empate, el de codigo mayor (regla fija y conocida)
      const ultimo: [string, number] | undefined = ordenado[ordenado.length - 1];
      if (ultimo === undefined) break;
      enCarrera.delete(ultimo[0]);
      rondas.push({ numero: rondas.length + 1, conteo, eliminado: ultimo[0] });
    }
    return { ganador: null, rondas, invalidas };
  }

  // Dias que tarda cada miembro en leer el libro
  planDeLectura(codigo: string, diasHastaReunion: number): { miembro: Miembro; dias: number; aTiempo: boolean }[] {
    const l: Libro | undefined = this.libro(codigo);
    if (l === undefined) return [];
    return this.miembros
      .map((m: Miembro) => {
        const dias: number = Math.ceil(l.paginas / m.paginasPorDia);
        return { miembro: m, dias, aTiempo: dias <= diasHastaReunion };
      })
      .sort((a, b): number => a.dias - b.dias);
  }
}

// ===================== DATOS =====================

const libros: readonly Libro[] = [
  { codigo: "L1", titulo: "Cien Mananas", paginas: 420 },
  { codigo: "L2", titulo: "El Faro del Sur", paginas: 280 },
  { codigo: "L3", titulo: "Codigo Estelar", paginas: 350 },
  { codigo: "L4", titulo: "Cuentos de Lluvia", paginas: 190 },
];

const miembros: readonly Miembro[] = [
  { nombre: "Ana", formato: "papel", paginasPorDia: 25 },
  { nombre: "Beto", formato: "ebook", paginasPorDia: 40 },
  { nombre: "Carla", formato: "audiolibro", paginasPorDia: 30 },
  { nombre: "Dani", formato: "papel", paginasPorDia: 14 },
  { nombre: "Eli", formato: "ebook", paginasPorDia: 20 },
  { nombre: "Fer", formato: "papel", paginasPorDia: 10 },
  { nombre: "Gabi", formato: "audiolibro", paginasPorDia: 35 },
];

const papeletas: readonly Papeleta[] = [
  { votante: "Ana", orden: ["L1", "L3", "L2"] },
  { votante: "Beto", orden: ["L3", "L1"] },
  { votante: "Carla", orden: ["L2", "L3", "L1"] },
  { votante: "Dani", orden: ["L4", "L2", "L3"] },
  { votante: "Eli", orden: ["L1", "L2"] },
  { votante: "Fer", orden: ["L4", "L3"] },
  { votante: "Gabi", orden: ["L3", "L2", "L1", "L4"] },
  // Invalidas
  { votante: "Ana", orden: ["L4"] }, // ya habia votado
  { votante: "Hugo", orden: ["L1"] }, // no es miembro
  { votante: "Dani", orden: ["L2", "L2"] }, // repite (y ademas ya voto)
];

// ===================== SALIDA =====================

function main(): void {
  const club: ClubLectura = new ClubLectura("Club Pagina 42", libros, miembros);
  const nombre = (c: string): string => club.libro(c)?.titulo ?? c;
  const { ganador, rondas, invalidas } = club.votar(papeletas);

  console.log(`=========== ${club.nombre}: votacion del libro del mes ===========`);
  invalidas.forEach((r: Revision): void => {
    if (!esValida(r)) console.log(`X Papeleta de ${r.votante}: ${r.motivo}`);
  });

  rondas.forEach((r: Ronda): void => {
    const total: number = [...r.conteo.values()].reduce((a, b): number => a + b, 0);
    const texto: string = [...r.conteo.entries()].sort((a, b) => b[1] - a[1]).map(([c, v]) => `${nombre(c)} ${v}`).join(" | ");
    console.log(`\nRonda ${r.numero} (${total} votos, se necesitan mas de ${total / 2}): ${texto}`);
    if (r.eliminado !== null) console.log(`  Nadie tiene mayoria. Se elimina "${nombre(r.eliminado)}" y sus votos pasan a la siguiente preferencia.`);
  });

  if (ganador === null) {
    console.log("\nNo hubo ganador.");
    return;
  }
  const libro: Libro | undefined = club.libro(ganador);
  console.log(`\nLIBRO DEL MES: ${libro?.titulo ?? ganador} (${libro?.paginas ?? 0} paginas)`);

  const dias: number = 14;
  console.log(`\n=========== Plan de lectura (reunion en ${dias} dias) ===========`);
  const plan = club.planDeLectura(ganador, dias);
  plan.forEach(({ miembro, dias: d, aTiempo }): void => {
    console.log(`${miembro.nombre.padEnd(6)} ${miembro.formato.padEnd(11)} ${String(miembro.paginasPorDia).padStart(2)} pag/dia -> ${String(d).padStart(2)} dias ${aTiempo ? "a tiempo" : `NO llega (le faltan ${d - dias} dias)`}`);
  });
  const llegan: number = plan.filter((p) => p.aTiempo).length;
  const quorum: number = Math.ceil(miembros.length / 2);
  console.log(`\nLo terminan a tiempo ${llegan} de ${miembros.length}. Quorum para la reunion: ${quorum} -> ${llegan >= quorum ? "hay quorum" : "posponer la reunion"}`);
}

main();
