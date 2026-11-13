export {};

// tipos
type EventoTabla =
  | { tipo: 'resultado'; local: string; visitante: string; golesLocal: number; golesVisitante: number }
  | { tipo: 'orden'; criterio: 'puntos' | 'goles' }
  | { tipo: 'reiniciar' };

interface FilaTabla {
  readonly equipo: string;
  puntos: number;
  golesFavor: number;
  golesContra: number;
}

interface EstadoTabla {
  filas: FilaTabla[];
  criterio: 'puntos' | 'goles';
}

// reducer
function reducirTabla(estado: EstadoTabla, evento: EventoTabla): EstadoTabla {
  switch (evento.tipo) {
    case 'resultado': {
      const filas = estado.filas.map((fila) => ({ ...fila }));
      const local = filas.find((fila) => fila.equipo === evento.local);
      const visitante = filas.find((fila) => fila.equipo === evento.visitante);
      if (!local || !visitante) return estado;

      local.golesFavor += evento.golesLocal;
      local.golesContra += evento.golesVisitante;
      visitante.golesFavor += evento.golesVisitante;
      visitante.golesContra += evento.golesLocal;

      if (evento.golesLocal > evento.golesVisitante) local.puntos += 3;
      else if (evento.golesLocal < evento.golesVisitante) visitante.puntos += 3;
      else {
        local.puntos += 1;
        visitante.puntos += 1;
      }

      return { ...estado, filas: ordenar(filas, estado.criterio) };
    }

    case 'orden':
      return { ...estado, criterio: evento.criterio, filas: ordenar(estado.filas, evento.criterio) };

    case 'reiniciar':
      return { ...estado, filas: estado.filas.map((fila) => ({ ...fila, puntos: 0, golesFavor: 0, golesContra: 0 })) };
  }
}

function ordenar(filas: FilaTabla[], criterio: 'puntos' | 'goles'): FilaTabla[] {
  return [...filas].sort((a, b) => {
    if (criterio === 'puntos') return b.puntos - a.puntos;
    return (b.golesFavor - b.golesContra) - (a.golesFavor - a.golesContra);
  });
}

// dom
function renderizarTabla(filas: FilaTabla[], contenedorId: string): void {
  if (typeof document === 'undefined') return;

  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  contenedor.innerHTML = '';
  filas.forEach((fila, indice) => {
    const linea = document.createElement('div');
    linea.textContent = `${indice + 1}. ${fila.equipo} | Pts: ${fila.puntos} | GF: ${fila.golesFavor} | GC: ${fila.golesContra}`;
    contenedor.appendChild(linea);
  });
}

// datos
const estadoInicial: EstadoTabla = {
  criterio: 'puntos',
  filas: [
    { equipo: 'Lobos Sala', puntos: 0, golesFavor: 0, golesContra: 0 },
    { equipo: 'Rayo Futsal', puntos: 0, golesFavor: 0, golesContra: 0 },
    { equipo: 'Arena FC', puntos: 0, golesFavor: 0, golesContra: 0 },
  ],
};

const eventos: EventoTabla[] = [
  { tipo: 'resultado', local: 'Lobos Sala', visitante: 'Rayo Futsal', golesLocal: 4, golesVisitante: 2 },
  { tipo: 'resultado', local: 'Rayo Futsal', visitante: 'Arena FC', golesLocal: 3, golesVisitante: 3 },
  { tipo: 'orden', criterio: 'goles' },
  { tipo: 'reiniciar' },
];

// salida
function mostrarResumen(): void {
  console.log('=== Tabla futsal interactiva ===');
  let estado = estadoInicial;

  eventos.forEach((evento) => {
    estado = reducirTabla(estado, evento);
    console.log(`${evento.tipo} -> ${estado.filas.map((fila) => `${fila.equipo}:${fila.puntos}`).join(', ')}`);
  });

  renderizarTabla(estado.filas, 'tabla-futsal');
}

mostrarResumen();
