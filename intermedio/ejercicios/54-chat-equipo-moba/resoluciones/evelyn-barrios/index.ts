export {};

type CanalChat = "Equipo Aliado" | "Todos" | "Pings Tacticos";

interface MensajeChat {
  readonly id: string;
  readonly emisor: string;
  readonly canal: CanalChat;
  readonly contenido: string;
  readonly timestamp: number;
}

class HubChatMoba {
  private historial: MensajeChat[] = [];

  async enviarMensaje(emisor: string, canal: CanalChat, contenido: string): Promise<MensajeChat> {
    await new Promise((resolve) => setTimeout(resolve, 10));

    const nuevo: MensajeChat = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      emisor,
      canal,
      contenido,
      timestamp: Date.now(),
    };

    this.historial.push(nuevo);
    return nuevo;
  }

  obtenerMensajesPorCanal(canal: CanalChat): MensajeChat[] {
    return this.historial.filter((m) => m.canal === canal);
  }
}

async function simularPartida() {
  const chat = new HubChatMoba();

  console.log("=== CHAT DE EQUIPO MOBA ASINCRONO ===");
  await chat.enviarMensaje("Faker (Mid)", "Pings Tacticos", "[PELIGRO] Enemigo desaparecido en mid");
  await chat.enviarMensaje("Keria (Support)", "Equipo Aliado", "Controlando vision en fosa de Dragon");
  await chat.enviarMensaje("Zeus (Top)", "Todos", "GG WP buen juego");

  const pings = chat.obtenerMensajesPorCanal("Pings Tacticos");
  console.log(`Pings tacticos registrados: ${pings.length}`);
  pings.forEach((p) => console.log(`[TACTICO] ${p.emisor}: ${p.contenido}`));
}

simularPartida();
