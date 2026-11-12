export {};

// tipos
type EventoMarcador =
  | { tipo: 'punto'; lado: 'local' | 'visitante' }
  | { tipo: 'deshacer' }
  | { tipo: 'nuevo_set' };

interface EstadoMarcador {
  local: number;
  visitante: number;
  setsLocal: number;
  setsVisitante: number;
  historial: ('local' | 'visitante')[];
}

// reglas
const puntosPorSet = 11;

// state machine
function reducirMarcador(estado: EstadoMarcador, evento: EventoMarcador): EstadoMarcador {
  switch (evento.tipo) {
    case 'punto': {
      const siguiente: EstadoMarcador = {
        ...estado,
        local: evento.lado === 'local' ? estado.local + 1 : estado.local,
        visitante: evento.lado === 'visitante' ? estado.visitante + 1 : estado.visitante,
        historial: [...estado.historial, evento.lado],
      };
      return cerrarSetSiCorresponde(siguiente);
    }

    case 'deshacer': {
      if (estado.historial.length === 0) return estado;
      const historial = estado.historial.slice(0, -1);
      const ultimo = estado.historial[estado.historial.length - 1];
      return {
        ...estado,
        local: ultimo === 'local' ? estado.local - 1 : estado.local,
        visitante: ultimo === 'visitante' ? estado.visitante - 1 : estado.visitante,
        historial,
      };
    }

    case 'nuevo_set':
      return { ...estado, local: 0, visitante: 0, historial: [] };
  }
}

// reglas
function cerrarSetSiCorresponde(estado: EstadoMarcador): EstadoMarcador {
  if (estado.local >= puntosPorSet && estado.local - estado.visitante >= 2) {
    return { ...estado, setsLocal: estado.setsLocal + 1, local: 0, visitante: 0, historial: [] };
  }
  if (estado.visitante >= puntosPorSet && estado.visitante - estado.local >= 2) {
    return { ...estado, setsVisitante: estado.setsVisitante + 1, local: 0, visitante: 0, historial: [] };
  }
  return estado;
}

// dom
function renderizarMarcador(estado: EstadoMarcador, elementoId: string): void {
  if (typeof document === 'undefined') return;

  const pantalla = document.getElementById(elementoId);
  if (!pantalla) return;
  pantalla.textContent = `${estado.local} - ${estado.visitante} | Sets: ${estado.setsLocal}-${estado.setsVisitante}`;
}

// datos
const eventos: EventoMarcador[] = [
  ...Array.from({ length: 12 }, (): EventoMarcador => ({ tipo: 'punto', lado: 'local' })),
  ...Array.from({ length: 9 }, (): EventoMarcador => ({ tipo: 'punto', lado: 'visitante' })),
  { tipo: 'deshacer' },
];

// salida
function mostrarResumen(): void {
  console.log('=== Marcador pingpong DOM ===');
  let estado: EstadoMarcador = { local: 0, visitante: 0, setsLocal: 0, setsVisitante: 0, historial: [] };

  eventos.forEach((evento) => {
    estado = reducirMarcador(estado, evento);
  });

  console.log(`Marcador: ${estado.local} - ${estado.visitante} | Sets: ${estado.setsLocal} - ${estado.setsVisitante}`);
  console.log(`Eventos aplicados: ${eventos.length} | Historial activo: ${estado.historial.length}`);

  renderizarMarcador(estado, 'marcador-pingpong');
}

mostrarResumen();
