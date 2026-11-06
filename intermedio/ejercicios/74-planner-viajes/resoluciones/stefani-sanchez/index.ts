// Solución Ejercicio Intermedio 74 - Stefani Sánchez
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

interface Etapa {
  readonly id: number;
  readonly ciudad: string;
  readonly desde: string;
  readonly hasta: string;
  readonly presupuesto: number;
}

type Resultado = { readonly ok: true } | { readonly ok: false; readonly motivo: string };

const CLAVE = "planner-viajes";
const MS_DIA = 86_400_000;

const fecha = (iso: string): number => Date.parse(`${iso}T00:00:00Z`);
const dias = (e: Etapa): number => (fecha(e.hasta) - fecha(e.desde)) / MS_DIA + 1;

class Planner {
  private etapas: Etapa[] = [];
  private siguienteId = 1;

  constructor(private readonly almacen: Almacen) {
    const crudo = almacen.getItem(CLAVE);
    if (crudo) {
      this.etapas = JSON.parse(crudo) as Etapa[];
      this.siguienteId = this.etapas.reduce((max, e) => Math.max(max, e.id), 0) + 1;
    }
  }

  agregar(ciudad: string, desde: string, hasta: string, presupuesto: number): Resultado {
    if (ciudad.trim() === "") return { ok: false, motivo: "La ciudad es obligatoria" };
    if (Number.isNaN(fecha(desde)) || Number.isNaN(fecha(hasta))) return { ok: false, motivo: `Fechas invalidas para ${ciudad}` };
    if (fecha(hasta) < fecha(desde)) return { ok: false, motivo: `${ciudad}: la salida es anterior a la llegada` };
    if (presupuesto < 0) return { ok: false, motivo: `${ciudad}: presupuesto negativo` };

    const choque = this.etapas.find((e) => fecha(desde) <= fecha(e.hasta) && fecha(hasta) >= fecha(e.desde));
    if (choque) return { ok: false, motivo: `${ciudad} se cruza con ${choque.ciudad} (${choque.desde} a ${choque.hasta})` };

    this.etapas = [...this.etapas, { id: this.siguienteId++, ciudad, desde, hasta, presupuesto }].sort((a, b) => fecha(a.desde) - fecha(b.desde));
    this.guardar();
    return { ok: true };
  }

  quitar(id: number): boolean {
    const antes = this.etapas.length;
    this.etapas = this.etapas.filter((e) => e.id !== id);
    this.guardar();
    return this.etapas.length < antes;
  }

  private guardar(): void {
    this.almacen.setItem(CLAVE, JSON.stringify(this.etapas));
  }

  resumen(): string[] {
    const total = this.etapas.reduce((acc, e) => acc + e.presupuesto, 0);
    const diasTotales = this.etapas.reduce((acc, e) => acc + dias(e), 0);
    return [
      ...this.etapas.map((e) => `#${e.id} ${e.desde} -> ${e.hasta} ${e.ciudad} (${dias(e)} dia(s), $${e.presupuesto})`),
      `Total: ${this.etapas.length} etapa(s), ${diasTotales} dia(s), $${total}`,
    ];
  }
}

console.log("Ejercicio 74: Planner de viajes");
const almacen = new AlmacenMemoria();
const planner = new Planner(almacen);
const intentos: [string, string, string, number][] = [
  ["Ciudad de Guatemala", "2026-09-01", "2026-09-03", 150],
  ["Cusco", "2026-09-10", "2026-09-14", 420],
  ["Lima", "2026-09-04", "2026-09-09", 300],
  ["Arequipa", "2026-09-12", "2026-09-16", 200],
  ["Valparaiso", "2026-09-30", "2026-09-20", 100],
  ["", "2026-10-01", "2026-10-02", 50],
  ["Santiago", "2026-09-17", "2026-09-xx", 80],
];
intentos.forEach(([ciudad, desde, hasta, presupuesto]) => {
  const r = planner.agregar(ciudad, desde, hasta, presupuesto);
  console.log(`  ${r.ok ? "+" : "x"} ${ciudad || "(sin ciudad)"}${r.ok ? "" : ` - ${r.motivo}`}`);
});
console.log(`  quitar #2: ${planner.quitar(2)} | quitar #99: ${planner.quitar(99)}`);
console.log("Itinerario recuperado de otra sesion:");
new Planner(almacen).resumen().forEach((l) => console.log(`  ${l}`));
