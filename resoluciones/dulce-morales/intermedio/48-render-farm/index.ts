export {};

// Intermedio 48: Render farm 3D
// Tematica: animacion y render 3D
// Resolucion: Dulce Morales
//
// Problema: una granja de render tiene varios nodos (GPU y CPU) y recibe trabajos durante la noche.
// Cada trabajo tiene prioridad, frames, minutos por frame y una hora limite. Un planificador asigna
// trabajos a los nodos libres (primero prioridad, luego la hora limite mas cercana). Si un nodo
// falla a mitad de un trabajo, ese trabajo vuelve a la cola. Al final: a que hora termino cada
// trabajo, si cumplio su hora limite y que tan ocupado estuvo cada nodo.

// ===================== TIPOS =====================

type TipoNodo = "GPU" | "CPU";
type Prioridad = "urgente" | "normal" | "baja";
type EstadoTrabajo = "en cola" | "renderizando" | "terminado";

interface Trabajo {
  readonly id: string;
  readonly proyecto: string;
  readonly prioridad: Prioridad;
  readonly frames: number;
  readonly minutosPorFrame: Readonly<Record<TipoNodo, number>>; // en GPU es mas rapido
  readonly llegada: number; // minuto en que se envia
  readonly limite: number; // minuto limite
  estado: EstadoTrabajo;
  inicio: number | null;
  fin: number | null;
  nodo: string | null;
  reintentos: number;
}

interface Nodo {
  readonly id: string;
  readonly tipo: TipoNodo;
  ocupadoHasta: number;
  trabajo: string | null;
  minutosTrabajados: number;
}

interface Falla {
  readonly nodoId: string;
  readonly minuto: number;
  readonly reparadoEn: number;
}

// ===================== COLA DE PRIORIDAD GENERICA =====================

class ColaPrioridad<T> {
  private items: T[] = [];

  constructor(private readonly comparar: (a: T, b: T) => number) {}

  agregar(item: T): void {
    this.items.push(item);
    this.items.sort(this.comparar);
  }

  sacar(): T | undefined {
    return this.items.shift();
  }

  // Saca el primero (en orden de prioridad) que cumpla la condicion
  sacarPrimero(condicion: (item: T) => boolean): T | undefined {
    const i: number = this.items.findIndex(condicion);
    return i === -1 ? undefined : this.items.splice(i, 1)[0];
  }

  get tamano(): number {
    return this.items.length;
  }
}

// ===================== PLANIFICADOR =====================

const PESO: Readonly<Record<Prioridad, number>> = { urgente: 0, normal: 1, baja: 2 };
const INICIO_NOCHE: Date = new Date(2026, 10, 16, 20, 0); // 16/11/2026 20:00

function hora(minuto: number): string {
  const d: Date = new Date(INICIO_NOCHE.getTime() + minuto * 60_000);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

class RenderFarm {
  private readonly cola: ColaPrioridad<Trabajo> = new ColaPrioridad<Trabajo>(
    (a, b): number => PESO[a.prioridad] - PESO[b.prioridad] || a.limite - b.limite || a.llegada - b.llegada,
  );
  private readonly bitacora: string[] = [];

  constructor(
    private readonly nodos: Nodo[],
    private readonly trabajos: Trabajo[],
    private readonly fallas: readonly Falla[],
  ) {}

  private duracion(t: Trabajo, n: Nodo): number {
    return t.frames * t.minutosPorFrame[n.tipo];
  }

  // Se manda aqui si: es el nodo donde terminaria antes (comparado con esperar a otro), o
  // si no es urgente y aqui igual termina antes de su hora limite (asi no queda un nodo ocioso)
  private mejorTerminarAqui(t: Trabajo, aqui: Nodo, minuto: number): boolean {
    const finAqui: number = minuto + this.duracion(t, aqui);
    const esElMasRapido: boolean = this.nodos
      .filter((otro: Nodo): boolean => otro !== aqui)
      .every((otro: Nodo): boolean => Math.max(minuto, otro.ocupadoHasta) + this.duracion(t, otro) >= finAqui);
    return esElMasRapido || (t.prioridad !== "urgente" && finAqui <= t.limite);
  }

  simular(hasta: number): void {
    for (let minuto = 0; minuto <= hasta; minuto++) {
      // 1. Llegan trabajos nuevos
      this.trabajos.filter((t) => t.llegada === minuto).forEach((t) => this.cola.agregar(t));

      // 2. Fallas de nodos: el trabajo vuelve a la cola
      for (const falla of this.fallas.filter((x) => x.minuto === minuto)) {
        const n: Nodo | undefined = this.nodos.find((x) => x.id === falla.nodoId);
        const t: Trabajo | undefined = this.trabajos.find((x) => x.id === n?.trabajo);
        if (n === undefined) continue;
        if (t !== undefined && t.estado === "renderizando") {
          n.minutosTrabajados -= n.ocupadoHasta - minuto; // no cuenta lo que no alcanzo a hacer
          t.estado = "en cola";
          t.reintentos += 1;
          t.nodo = null;
          this.cola.agregar(t);
          this.bitacora.push(`${hora(minuto)} FALLA en ${n.id}: "${t.id}" vuelve a la cola`);
        }
        n.trabajo = null;
        n.ocupadoHasta = falla.reparadoEn;
      }

      // 3. Terminan trabajos
      for (const n of this.nodos) {
        if (n.trabajo !== null && n.ocupadoHasta === minuto) {
          const t: Trabajo | undefined = this.trabajos.find((x) => x.id === n.trabajo);
          if (t !== undefined) {
            t.estado = "terminado";
            t.fin = minuto;
          }
          n.trabajo = null;
        }
      }

      // 4. Se asignan trabajos a nodos libres (los GPU primero, porque son mas rapidos).
      //    Un trabajo solo se manda a este nodo si es donde terminaria antes; si otro nodo que se
      //    libera pronto lo terminaria antes, el trabajo espera y se prueba el siguiente de la cola.
      const libres: Nodo[] = this.nodos.filter((n) => n.trabajo === null && n.ocupadoHasta <= minuto).sort((a, b) => (a.tipo === "GPU" ? 0 : 1) - (b.tipo === "GPU" ? 0 : 1));
      for (const n of libres) {
        const t: Trabajo | undefined = this.cola.sacarPrimero((x: Trabajo): boolean => this.mejorTerminarAqui(x, n, minuto));
        if (t === undefined) continue;
        const dur: number = this.duracion(t, n);
        t.estado = "renderizando";
        t.inicio = t.inicio ?? minuto;
        t.nodo = n.id;
        n.trabajo = t.id;
        n.ocupadoHasta = minuto + dur;
        n.minutosTrabajados += dur;
        this.bitacora.push(`${hora(minuto)} "${t.id}" (${t.prioridad}) empieza en ${n.id} [${n.tipo}], ${dur} min`);
      }
    }
  }

  get registro(): readonly string[] {
    return this.bitacora;
  }
}

// ===================== DATOS Y SALIDA =====================

function trabajo(id: string, proyecto: string, prioridad: Prioridad, frames: number, gpu: number, cpu: number, llegada: number, limite: number): Trabajo {
  return { id, proyecto, prioridad, frames, minutosPorFrame: { GPU: gpu, CPU: cpu }, llegada, limite, estado: "en cola", inicio: null, fin: null, nodo: null, reintentos: 0 };
}

function main(): void {
  const nodos: Nodo[] = [
    { id: "gpu-01", tipo: "GPU", ocupadoHasta: 0, trabajo: null, minutosTrabajados: 0 },
    { id: "gpu-02", tipo: "GPU", ocupadoHasta: 0, trabajo: null, minutosTrabajados: 0 },
    { id: "cpu-01", tipo: "CPU", ocupadoHasta: 0, trabajo: null, minutosTrabajados: 0 },
  ];
  const trabajos: Trabajo[] = [
    trabajo("SH010", "Corto Luna", "normal", 120, 1, 3, 0, 300),
    trabajo("SH020", "Corto Luna", "normal", 90, 1, 3, 0, 360),
    trabajo("CM-05", "Comercial Cafe", "urgente", 60, 2, 5, 30, 180),
    trabajo("SH030", "Corto Luna", "baja", 200, 1, 2, 10, 600),
    trabajo("TEST", "Pruebas", "baja", 30, 1, 2, 5, 120),
    // Limite: termina EXACTO a su hora limite (23:50)
    trabajo("CM-06", "Comercial Cafe", "urgente", 50, 2, 4, 120, 230),
  ];
  const fallas: readonly Falla[] = [{ nodoId: "gpu-02", minuto: 100, reparadoEn: 130 }];

  const granja: RenderFarm = new RenderFarm(nodos, trabajos, fallas);
  granja.simular(720);

  console.log(`================ BITACORA DE LA NOCHE (desde ${hora(0)}) ================`);
  granja.registro.forEach((l: string): void => console.log(l));

  console.log("\n================ TRABAJOS ================");
  for (const t of [...trabajos].sort((a, b) => (a.fin ?? Infinity) - (b.fin ?? Infinity))) {
    const cumple: string = t.fin === null ? "NO termino" : t.fin <= t.limite ? (t.fin === t.limite ? "cumple justo en el limite" : "cumple") : `ATRASADO ${t.fin - t.limite} min`;
    const reint: string = t.reintentos > 0 ? ` | ${t.reintentos} reintento(s)` : "";
    console.log(`${t.id.padEnd(6)} ${t.prioridad.padEnd(8)} ${t.frames} frames | ${t.inicio === null ? "--:--" : hora(t.inicio)} -> ${t.fin === null ? "--:--" : hora(t.fin)} (limite ${hora(t.limite)}) ${cumple}${reint}`);
  }

  console.log("\n================ USO DE NODOS ================");
  const fin: number = Math.max(...trabajos.map((t) => t.fin ?? 0));
  nodos.forEach((n: Nodo): void => console.log(`${n.id} [${n.tipo}] ${n.minutosTrabajados} min de ${fin} -> ${Math.round((n.minutosTrabajados / fin) * 100)}% ocupado`));
}

main();
