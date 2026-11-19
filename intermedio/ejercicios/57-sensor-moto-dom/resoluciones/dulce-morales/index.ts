export {};

// Intermedio 57: Panel DOM de sensores moto
// Tematica: motos y mecanica de motos
// Resolucion: Dulce Morales
//
// Problema: un panel muestra en vivo los sensores de una moto (rpm, temperatura, velocidad, bateria).
// Las lecturas llegan de forma asincrona (un generador async que simula el bus de datos de la moto).
// En cada lectura se actualizan los "widgets" del panel y, si un valor cruza un limite, se dispara
// una alarma (evento tipado). Si el sensor se desconecta a mitad de camino, el panel lo detecta
// con un error tipado, reconecta y sigue.
//
// Nota: estos ejercicios se ejecutan con Node (npm run dev), donde no existe el navegador.
// Por eso el DOM se simula con una clase ElementoVirtual que funciona igual que createElement /
// textContent / classList, y al final se muestra el HTML que se generaria.

// ===================== DOM SIMULADO =====================

class ElementoVirtual {
  public textContent: string = "";
  private readonly clases: Set<string> = new Set();
  private readonly hijos: ElementoVirtual[] = [];

  constructor(public readonly tag: string, public readonly id: string = "") {}

  get classList(): { add: (c: string) => void; remove: (c: string) => void; toggle: (c: string, activo: boolean) => void; contains: (c: string) => boolean } {
    return {
      add: (c) => this.clases.add(c),
      remove: (c) => this.clases.delete(c),
      toggle: (c, activo) => (activo ? this.clases.add(c) : this.clases.delete(c)),
      contains: (c) => this.clases.has(c),
    };
  }

  appendChild(hijo: ElementoVirtual): ElementoVirtual {
    this.hijos.push(hijo);
    return hijo;
  }

  querySelector(id: string): ElementoVirtual | null {
    if (`#${this.id}` === id) return this;
    for (const h of this.hijos) {
      const encontrado: ElementoVirtual | null = h.querySelector(id);
      if (encontrado !== null) return encontrado;
    }
    return null;
  }

  get outerHTML(): string {
    const id: string = this.id ? ` id="${this.id}"` : "";
    const clases: string = this.clases.size > 0 ? ` class="${[...this.clases].join(" ")}"` : "";
    return `<${this.tag}${id}${clases}>${this.textContent}${this.hijos.map((h) => h.outerHTML).join("")}</${this.tag}>`;
  }
}

// ===================== SENSORES =====================

type Sensor = "rpm" | "temperatura" | "velocidad" | "bateria";

interface Lectura {
  readonly segundo: number;
  readonly valores: Readonly<Record<Sensor, number>>;
}

interface Limite {
  readonly unidad: string;
  readonly alerta: number;
  readonly peligro: number;
  readonly invertido: boolean; // bateria: lo peligroso es que BAJE
}

const LIMITES: Readonly<Record<Sensor, Limite>> = {
  rpm: { unidad: "rpm", alerta: 11000, peligro: 13000, invertido: false },
  temperatura: { unidad: "C", alerta: 105, peligro: 115, invertido: false },
  velocidad: { unidad: "km/h", alerta: 160, peligro: 200, invertido: false },
  bateria: { unidad: "V", alerta: 12.0, peligro: 11.5, invertido: true },
};

const SENSORES: readonly Sensor[] = ["rpm", "temperatura", "velocidad", "bateria"];

type Nivel = "normal" | "alerta" | "peligro";

function nivelDe(s: Sensor, v: number): Nivel {
  const l: Limite = LIMITES[s];
  if (l.invertido) return v <= l.peligro ? "peligro" : v <= l.alerta ? "alerta" : "normal";
  return v >= l.peligro ? "peligro" : v >= l.alerta ? "alerta" : "normal";
}

// ===================== ERRORES Y EVENTOS TIPADOS =====================

class ErrorSensorDesconectado extends Error {
  constructor(public readonly segundo: number) {
    super(`se perdio la conexion con el bus de sensores en el segundo ${segundo}`);
    this.name = "ErrorSensorDesconectado";
  }
}

interface EventosPanel {
  alarma: { readonly sensor: Sensor; readonly nivel: Exclude<Nivel, "normal">; readonly valor: number; readonly segundo: number };
  reconexion: { readonly segundo: number };
}

class Emisor<E> {
  private readonly oyentes: { [K in keyof E]?: ((d: E[K]) => void)[] } = {};
  on<K extends keyof E>(e: K, fn: (d: E[K]) => void): void {
    (this.oyentes[e] ??= []).push(fn);
  }
  emit<K extends keyof E>(e: K, d: E[K]): void {
    this.oyentes[e]?.forEach((fn) => fn(d));
  }
}

// ===================== FUENTE DE DATOS ASINCRONA =====================

const esperar = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const GRABACION: readonly Lectura[] = [
  { segundo: 1, valores: { rpm: 4200, temperatura: 88, velocidad: 45, bateria: 13.8 } },
  { segundo: 2, valores: { rpm: 7800, temperatura: 93, velocidad: 98, bateria: 13.7 } },
  { segundo: 3, valores: { rpm: 11000, temperatura: 99, velocidad: 152, bateria: 13.6 } }, // limite: rpm EXACTO en alerta
  { segundo: 4, valores: { rpm: 12400, temperatura: 106, velocidad: 181, bateria: 13.5 } },
  { segundo: 5, valores: { rpm: 13300, temperatura: 112, velocidad: 204, bateria: 13.4 } },
  // segundo 6: se cae la conexion
  { segundo: 7, valores: { rpm: 9000, temperatura: 116, velocidad: 140, bateria: 12.0 } }, // limite: bateria EXACTA en alerta
  { segundo: 8, valores: { rpm: 6000, temperatura: 109, velocidad: 90, bateria: 11.4 } },
];

// Generador async: entrega una lectura por "tick"; la conexion se cae una vez en el segundo indicado
async function* busDeSensores(desde: number, caidaEn: number | null): AsyncGenerator<Lectura> {
  for (const l of GRABACION.filter((x) => x.segundo >= desde)) {
    await esperar(5);
    if (caidaEn !== null && l.segundo > caidaEn) throw new ErrorSensorDesconectado(caidaEn + 1);
    yield l;
  }
}

// ===================== PANEL =====================

class PanelMoto {
  public readonly raiz: ElementoVirtual = new ElementoVirtual("section", "panel");
  public readonly eventos: Emisor<EventosPanel> = new Emisor<EventosPanel>();
  private readonly ultimoNivel: Map<Sensor, Nivel> = new Map();

  constructor() {
    for (const s of SENSORES) {
      const caja: ElementoVirtual = this.raiz.appendChild(new ElementoVirtual("div", `widget-${s}`));
      caja.classList.add("widget");
      caja.appendChild(new ElementoVirtual("span", `valor-${s}`));
    }
  }

  // Actualiza el texto y la clase de cada widget; avisa solo cuando el nivel CAMBIA
  actualizar(l: Lectura): void {
    for (const s of SENSORES) {
      const v: number = l.valores[s];
      const nivel: Nivel = nivelDe(s, v);
      const caja: ElementoVirtual | null = this.raiz.querySelector(`#widget-${s}`);
      const valor: ElementoVirtual | null = this.raiz.querySelector(`#valor-${s}`);
      if (caja === null || valor === null) continue;
      valor.textContent = `${v} ${LIMITES[s].unidad}`;
      caja.classList.toggle("alerta", nivel === "alerta");
      caja.classList.toggle("peligro", nivel === "peligro");
      if (nivel !== "normal" && this.ultimoNivel.get(s) !== nivel) this.eventos.emit("alarma", { sensor: s, nivel, valor: v, segundo: l.segundo });
      this.ultimoNivel.set(s, nivel);
    }
  }

  // Vista de texto del panel (lo que el usuario veria en pantalla)
  vista(segundo: number): string {
    const partes: string[] = SENSORES.map((s) => {
      const caja: ElementoVirtual | null = this.raiz.querySelector(`#widget-${s}`);
      const marca: string = caja?.classList.contains("peligro") ? "!!" : caja?.classList.contains("alerta") ? "! " : "  ";
      return `${marca}${s} ${this.raiz.querySelector(`#valor-${s}`)?.textContent ?? "-"}`.padEnd(22);
    });
    return `s${segundo} | ${partes.join("| ")}`.trimEnd();
  }

  async escuchar(): Promise<void> {
    let desde: number = 1;
    let caidaEn: number | null = 5; // la primera conexion se cae despues del segundo 5
    while (true) {
      try {
        for await (const lectura of busDeSensores(desde, caidaEn)) {
          this.actualizar(lectura);
          console.log(this.vista(lectura.segundo));
          desde = lectura.segundo + 1;
        }
        return;
      } catch (e: unknown) {
        if (!(e instanceof ErrorSensorDesconectado)) throw e;
        console.log(`   X [${e.name}] ${e.message}`);
        await esperar(10);
        this.eventos.emit("reconexion", { segundo: e.segundo });
        desde = e.segundo + 1;
        caidaEn = null; // ya no se vuelve a caer
      }
    }
  }
}

// ===================== SALIDA =====================

async function main(): Promise<void> {
  const panel: PanelMoto = new PanelMoto();
  const alarmas: string[] = [];
  panel.eventos.on("alarma", ({ sensor, nivel, valor, segundo }) => alarmas.push(`s${segundo} ${nivel.toUpperCase()} en ${sensor}: ${valor} ${LIMITES[sensor].unidad}`));
  panel.eventos.on("reconexion", ({ segundo }) => console.log(`   ... reconectado; se perdio la lectura del segundo ${segundo}`));

  console.log("========================= PANEL EN VIVO =========================");
  await panel.escuchar();

  console.log("\n========================= ALARMAS =========================");
  alarmas.forEach((a) => console.log(a));

  console.log("\n========================= HTML FINAL DEL PANEL =========================");
  console.log(panel.raiz.outerHTML.replace(/<div/g, "\n  <div").replace(/<\/section>/, "\n</section>"));
}

main();
