export {};

// tipos
type Deporte = 'kickboxing' | 'futsal' | 'pingpong';
type EventoPartido =
  | { tipo: 'inicio'; deporte: Deporte }
  | { tipo: 'punto'; equipo: string }
  | { tipo: 'tarjeta'; equipo: string; color: 'amarilla' | 'roja' }
  | { tipo: 'fin' };

interface EstadoPartido {
  deporte: Deporte | null;
  enCurso: boolean;
  marcador: Record<string, number>;
  tarjetasRojas: number;
  historial: string[];
}

// reducer
function estadoInicial(): EstadoPartido {
  return { deporte: null, enCurso: false, marcador: {}, tarjetasRojas: 0, historial: [] };
}

function reducir(estado: EstadoPartido, evento: EventoPartido): EstadoPartido {
  switch (evento.tipo) {
    case 'inicio':
      return { ...estado, deporte: evento.deporte, enCurso: true, marcador: {}, historial: [...estado.historial, `inicio (${evento.deporte})`] };

    case 'punto': {
      if (!estado.enCurso) return estado;
      return {
        ...estado,
        marcador: { ...estado.marcador, [evento.equipo]: (estado.marcador[evento.equipo] ?? 0) + 1 },
        historial: [...estado.historial, `punto ${evento.equipo}`],
      };
    }

    case 'tarjeta': {
      if (!estado.enCurso) return estado;
      const rojas = evento.color === 'roja' ? estado.tarjetasRojas + 1 : estado.tarjetasRojas;
      return { ...estado, tarjetasRojas: rojas, historial: [...estado.historial, `tarjeta ${evento.color} ${evento.equipo}`] };
    }

    case 'fin':
      if (!estado.enCurso) return estado;
      return { ...estado, enCurso: false, historial: [...estado.historial, 'fin'] };
  }
}

// reportes
function ganador(estado: EstadoPartido): string | null {
  const entradas = Object.entries(estado.marcador).sort((a, b) => b[1] - a[1]);
  if (entradas.length === 0) return null;
  if (entradas.length > 1 && entradas[0][1] === entradas[1][1]) return 'empate';
  return entradas[0][0];
}

// datos
const eventos: EventoPartido[] = [
  { tipo: 'inicio', deporte: 'futsal' },
  { tipo: 'punto', equipo: 'Lobos Sala' },
  { tipo: 'punto', equipo: 'Rayo Futsal' },
  { tipo: 'punto', equipo: 'Rayo Futsal' },
  { tipo: 'tarjeta', equipo: 'Lobos Sala', color: 'amarilla' },
  { tipo: 'punto', equipo: 'Lobos Sala' },
  { tipo: 'tarjeta', equipo: 'Rayo Futsal', color: 'roja' },
  { tipo: 'fin' },
  { tipo: 'punto', equipo: 'Lobos Sala' },
];

// salida
function mostrarResumen(): void {
  console.log('=== Dashboard multi-deporte ===');
  let estado = estadoInicial();

  eventos.forEach((evento) => {
    estado = reducir(estado, evento);
    console.log(`${evento.tipo} -> marcador: ${JSON.stringify(estado.marcador)}`);
  });

  console.log(`En curso: ${estado.enCurso ? 'si' : 'no'} | Rojas: ${estado.tarjetasRojas}`);
  console.log(`Ganador: ${ganador(estado) ?? 'n/a'}`);
  console.log('Historial:', estado.historial.join(' | '));
}

mostrarResumen();
