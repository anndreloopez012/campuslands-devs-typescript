export {};

// tipos
type TipoMensaje = 'texto' | 'ping' | 'alerta' | 'sistema';

interface MensajeChat {
  readonly id: number;
  readonly autor: string;
  tipo: TipoMensaje;
  contenido: string;
  canal: string;
  momento: number;
}

// clases
class CanalChat {
  private readonly mensajes: MensajeChat[] = [];
  private siguienteId = 1;

  enviar(autor: string, tipo: TipoMensaje, contenido: string, canal = 'general'): MensajeChat {
    const mensaje: MensajeChat = { id: this.siguienteId, autor, tipo, contenido, canal, momento: Date.now() };
    this.siguienteId += 1;
    this.mensajes.push(mensaje);
    return mensaje;
  }

  historial(canal: string): MensajeChat[] {
    return this.mensajes.filter((mensaje) => mensaje.canal === canal);
  }

  ultimos(canal: string, limite: number): MensajeChat[] {
    return [...this.historial(canal)].slice(-limite);
  }

  moderar(): MensajeChat[] {
    return this.mensajes.filter((mensaje) => mensaje.tipo === 'alerta');
  }
}

// eventos tipados
class NotificadorChat<T extends MensajeChat> {
  private readonly oyentes = new Set<(mensaje: T) => void>();

  suscribir(oyente: (mensaje: T) => void): () => void {
    this.oyentes.add(oyente);
    return () => this.oyentes.delete(oyente);
  }

  publicar(mensaje: T): void {
    this.oyentes.forEach((oyente) => oyente(mensaje));
  }
}

// datos
const canal = new CanalChat();
const notificador = new NotificadorChat<MensajeChat>();

const acciones: [string, TipoMensaje, string, string][] = [
  ['Velas', 'texto', 'Focus en el dragon', 'general'],
  ['Nux', 'ping', 'Enemigos en el rio', 'general'],
  ['Rios', 'alerta', 'Mid esta superextendido', 'general'],
  ['Mena', 'texto', 'Recargando en base', 'privado'],
  ['Nux', 'alerta', 'Baron en 40s', 'general'],
];

// salida
function mostrarResumen(): void {
  console.log('=== Chat de equipo MOBA ===');

  const baja = notificador.suscribir((mensaje) => {
    if (mensaje.tipo === 'alerta') console.log(`[NOTIFICACION] ${mensaje.autor}: ${mensaje.contenido}`);
  });

  acciones.forEach(([autor, tipo, contenido, destino]) => {
    const mensaje = canal.enviar(autor, tipo, contenido, destino);
    notificador.publicar(mensaje);
  });

  baja();
  canal.enviar('Velas', 'ping', 'Falta uno', 'general');
  notificador.publicar(canal.historial('general').slice(-1)[0]);

  console.log(`Mensajes en general: ${canal.historial('general').length}`);
  console.log('Ultimos 2:');
  canal.ultimos('general', 2).forEach((mensaje) => {
    console.log(`- [${mensaje.tipo}] ${mensaje.autor}: ${mensaje.contenido}`);
  });
  console.log(`Alertas totales: ${canal.moderar().length}`);
}

mostrarResumen();
