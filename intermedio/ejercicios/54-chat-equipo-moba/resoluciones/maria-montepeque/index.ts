export {};

type TipoMensaje = "texto" | "ping" | "alerta";

interface Mensaje {
  readonly id: number;
  readonly autor: string;
  readonly tipo: TipoMensaje;
  readonly contenido: string;
}

interface EventosChat {
  mensaje: Mensaje;
  bloqueado: { autor: string; motivo: string };
  silenciado: { autor: string };
}

class Emisor<E> {
  private readonly oyentes: { [K in keyof E]?: ((datos: E[K]) => void)[] } = {};

  on<K extends keyof E>(evento: K, oyente: (datos: E[K]) => void): void {
    this.oyentes[evento] = [...(this.oyentes[evento] ?? []), oyente];
  }

  protected emitir<K extends keyof E>(evento: K, datos: E[K]): void {
    this.oyentes[evento]?.forEach((oyente) => oyente(datos));
  }
}

const esperar = (ms: number): Promise<void> => new Promise((resolver) => setTimeout(resolver, ms));

class ChatEquipo extends Emisor<EventosChat> {
  private readonly silenciados = new Set<string>();
  private readonly historial: Mensaje[] = [];
  private siguienteId = 1;

  constructor(
    private readonly equipo: readonly string[],
    private readonly maxHistorial: number,
    private readonly palabrasProhibidas: readonly string[],
  ) {
    super();
  }

  silenciar(autor: string): void {
    this.silenciados.add(autor);
    this.emitir("silenciado", { autor });
  }

  async enviar(autor: string, tipo: TipoMensaje, contenido: string): Promise<boolean> {
    await esperar(5);
    if (!this.equipo.includes(autor)) return this.rechazar(autor, "no pertenece al equipo");
    if (this.silenciados.has(autor)) return this.rechazar(autor, "esta silenciado");
    if (contenido.trim().length === 0 || contenido.length > 80) return this.rechazar(autor, "mensaje vacio o demasiado largo");
    if (this.palabrasProhibidas.some((p) => contenido.toLowerCase().includes(p))) return this.rechazar(autor, "lenguaje no permitido");

    const mensaje: Mensaje = { id: this.siguienteId++, autor, tipo, contenido };
    this.historial.push(mensaje);
    if (this.historial.length > this.maxHistorial) this.historial.shift();
    this.emitir("mensaje", mensaje);
    return true;
  }

  private rechazar(autor: string, motivo: string): false {
    this.emitir("bloqueado", { autor, motivo });
    return false;
  }

  ultimos(): readonly Mensaje[] {
    return this.historial;
  }
}

const chat = new ChatEquipo(["Zed", "Lux", "Jax", "Ahri", "Brand"], 4, ["noob", "basura"]);
chat.on("mensaje", (m) => console.log(`  [${m.tipo}] ${m.autor}: ${m.contenido}`));
chat.on("bloqueado", ({ autor, motivo }) => console.log(`  [bloqueado] ${autor} - ${motivo}`));
chat.on("silenciado", ({ autor }) => console.log(`  [sistema] ${autor} fue silenciado`));

const main = async (): Promise<void> => {
  console.log("Ejercicio 54: Chat de equipo MOBA");
  await chat.enviar("Zed", "texto", "Vamos por el dragon");
  await chat.enviar("Lux", "ping", "Enemigo en rio");
  await chat.enviar("Jax", "texto", "eres un noob");
  await chat.enviar("Intruso", "texto", "hola");
  await chat.enviar("Ahri", "alerta", "Falta 30s para Baron");
  chat.silenciar("Brand");
  await chat.enviar("Brand", "texto", "ok");
  await chat.enviar("Zed", "texto", "");
  await chat.enviar("Lux", "texto", "Retirada");
  await chat.enviar("Ahri", "texto", "Vuelvo base");
  const ultimos = chat.ultimos();
  console.log(`Historial (maximo 4): ${ultimos.map((m) => `#${m.id}`).join(", ")}`);
};

void main();
