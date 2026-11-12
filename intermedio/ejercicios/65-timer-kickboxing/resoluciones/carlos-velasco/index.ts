export {};

// tipos
type EstadoTimer =
  | { tipo: 'listo' }
  | { tipo: 'corriendo'; round: number; segundosRestantes: number }
  | { tipo: 'descanso'; round: number; segundosRestantes: number }
  | { tipo: 'terminado' };

type EventoTimer =
  | { tipo: 'iniciar'; rounds: number }
  | { tipo: 'tic' }
  | { tipo: 'pausar' }
  | { tipo: 'reiniciar' };

// reglas
const segundosPorRound = 120;
const segundosDescanso = 60;

// state machine
function reducirTimer(estado: EstadoTimer, evento: EventoTimer): EstadoTimer {
  switch (evento.tipo) {
    case 'iniciar':
      if (estado.tipo !== 'listo' && estado.tipo !== 'terminado') return estado;
      return { tipo: 'corriendo', round: 1, segundosRestantes: segundosPorRound };

    case 'tic': {
      if (estado.tipo === 'corriendo') {
        if (estado.segundosRestantes > 1) return { ...estado, segundosRestantes: estado.segundosRestantes - 1 };
        if (estado.round === totalRounds) return { tipo: 'terminado' };
        return { tipo: 'descanso', round: estado.round, segundosRestantes: segundosDescanso };
      }

      if (estado.tipo === 'descanso') {
        if (estado.segundosRestantes > 1) return { ...estado, segundosRestantes: estado.segundosRestantes - 1 };
        return { tipo: 'corriendo', round: estado.round + 1, segundosRestantes: segundosPorRound };
      }

      return estado;
    }

    case 'pausar':
      return estado;

    case 'reiniciar':
      return { tipo: 'listo' };
  }
}

// datos
let totalRounds = 3;

// dom
function renderizarTimer(estado: EstadoTimer, elementoId: string): void {
  if (typeof document === 'undefined') return;

  const pantalla = document.getElementById(elementoId);
  if (!pantalla) return;

  pantalla.textContent = estado.tipo === 'corriendo' || estado.tipo === 'descanso'
    ? `Round ${estado.round} | ${estado.tipo}: ${estado.segundosRestantes}s`
    : estado.tipo;
}

// salida
function mostrarResumen(): void {
  console.log('=== Timer de rounds kickboxing ===');
  let estado: EstadoTimer = { tipo: 'listo' };

  estado = reducirTimer(estado, { tipo: 'iniciar', rounds: totalRounds });
  console.log(`Inicio: ${estado.tipo}`);

  for (let tic = 1; tic <= 130; tic += 1) {
    estado = reducirTimer(estado, { tipo: 'tic' });
  }
  console.log(`Tras 130 tics: ${estado.tipo} | Round ${estado.tipo === 'corriendo' || estado.tipo === 'descanso' ? estado.round : '-'} | ${estado.tipo === 'corriendo' || estado.tipo === 'descanso' ? `${estado.segundosRestantes}s` : ''}`);

  estado = reducirTimer(estado, { tipo: 'reiniciar' });
  console.log(`Reinicio: ${estado.tipo}`);

  renderizarTimer(estado, 'timer-kickboxing');
}

mostrarResumen();
