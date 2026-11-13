export {};

// tipos
type EstadoTerminal =
  | { tipo: 'apagada' }
  | { tipo: 'iniciando'; progreso: number }
  | { tipo: 'lista'; usuario: string | null }
  | { tipo: 'autenticando'; usuario: string };

type ComandoTerminal =
  | { tipo: 'encender' }
  | { tipo: 'cargar' }
  | { tipo: 'login'; usuario: string }
  | { tipo: 'logout' }
  | { tipo: 'ejecutar'; comando: string }
  | { tipo: 'apagar' };

// state machine
function reducirTerminal(estado: EstadoTerminal, evento: ComandoTerminal): EstadoTerminal {
  switch (evento.tipo) {
    case 'encender':
      return estado.tipo === 'apagada' ? { tipo: 'iniciando', progreso: 0 } : estado;

    case 'cargar': {
      if (estado.tipo !== 'iniciando') return estado;
      const progreso = Math.min(100, estado.progreso + 25);
      return progreso === 100 ? { tipo: 'lista', usuario: null } : { ...estado, progreso };
    }

    case 'login':
      if (estado.tipo !== 'lista' || estado.usuario !== null) return estado;
      return { tipo: 'autenticando', usuario: evento.usuario };

    case 'logout':
      return estado.tipo === 'autenticando' ? { tipo: 'lista', usuario: null } : estado;

    case 'ejecutar':
      if (estado.tipo !== 'autenticando') return estado;
      return estado;

    case 'apagar':
      return { tipo: 'apagada' };
  }
}

// comandos simulados
function ejecutarComando(comando: string, usuario: string): string {
  const comandos: Record<string, string> = {
    'escanear sector': `sector 7G despejado, reportado por ${usuario}`,
    'estado nave': 'casco 98%, oxigeno 100%, escudos 76%',
    'ayuda': 'comandos: escanear sector | estado nave | ayuda',
  };

  return comandos[comando] ?? `comando "${comando}" no reconocido`;
}

// datos
const secuencia: ComandoTerminal[] = [
  { tipo: 'encender' },
  { tipo: 'cargar' },
  { tipo: 'cargar' },
  { tipo: 'cargar' },
  { tipo: 'cargar' },
  { tipo: 'login', usuario: 'nav. velas' },
  { tipo: 'ejecutar', comando: 'escanear sector' },
  { tipo: 'ejecutar', comando: 'estado nave' },
  { tipo: 'ejecutar', comando: 'desbloquear escudos' },
  { tipo: 'logout' },
  { tipo: 'apagar' },
];

// dom
function renderizarTerminal(lineas: string[], elementoId: string): void {
  if (typeof document === 'undefined') return;

  const pantalla = document.getElementById(elementoId);
  if (!pantalla) return;
  pantalla.textContent = lineas.join('\n');
}

// salida
function mostrarResumen(): void {
  console.log('=== Terminal sci-fi ===');
  let estado: EstadoTerminal = { tipo: 'apagada' };
  const salida: string[] = [];

  secuencia.forEach((evento) => {
    estado = reducirTerminal(estado, evento);

    if (evento.tipo === 'cargar' && estado.tipo === 'iniciando') salida.push(`cargando... ${estado.progreso}%`);
    if (evento.tipo === 'login') salida.push(`autenticando a ${evento.usuario}`);
    if (evento.tipo === 'ejecutar' && estado.tipo === 'autenticando') salida.push(`> ${ejecutarComando(evento.comando, estado.usuario)}`);
  });

  salida.forEach((linea) => console.log(linea));
  console.log(`Estado final: ${estado.tipo}`);
  renderizarTerminal(salida, 'terminal-scifi');
}

mostrarResumen();
