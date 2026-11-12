export {};

// tipos
type EstadoReproductor =
  | { tipo: 'detenido' }
  | { tipo: 'reproduciendo'; cancion: string; posicion: number }
  | { tipo: 'pausado'; cancion: string; posicion: number };

type EventoReproductor =
  | { tipo: 'play'; indice: number }
  | { tipo: 'pausar' }
  | { tipo: 'continuar' }
  | { tipo: 'siguiente' }
  | { tipo: 'anterior' }
  | { tipo: 'stop' };

interface CancionPlaylist {
  readonly titulo: string;
  readonly artista: string;
  duracionSegundos: number;
}

// state machine
function reducirReproductor(playlist: CancionPlaylist[], estado: EstadoReproductor, evento: EventoReproductor): EstadoReproductor {
  const enRango = (indice: number) => indice >= 0 && indice < playlist.length;

  switch (evento.tipo) {
    case 'play':
      if (!enRango(evento.indice)) return estado;
      return { tipo: 'reproduciendo', cancion: playlist[evento.indice].titulo, posicion: evento.indice };

    case 'pausar':
      return estado.tipo === 'reproduciendo' ? { tipo: 'pausado', cancion: estado.cancion, posicion: estado.posicion } : estado;

    case 'continuar':
      return estado.tipo === 'pausado' ? { tipo: 'reproduciendo', cancion: estado.cancion, posicion: estado.posicion } : estado;

    case 'siguiente': {
      if (estado.tipo === 'detenido') return estado;
      const siguiente = estado.posicion + 1;
      return enRango(siguiente) ? { tipo: 'reproduciendo', cancion: playlist[siguiente].titulo, posicion: siguiente } : { tipo: 'detenido' };
    }

    case 'anterior': {
      if (estado.tipo === 'detenido') return estado;
      const anterior = estado.posicion - 1;
      return enRango(anterior) ? { tipo: 'reproduciendo', cancion: playlist[anterior].titulo, posicion: anterior } : estado;
    }

    case 'stop':
      return { tipo: 'detenido' };
  }
}

// datos
const playlist: CancionPlaylist[] = [
  { titulo: 'Encendido', artista: 'Kai Steel', duracionSegundos: 210 },
  { titulo: 'Fiebre Neon', artista: 'Kai Steel', duracionSegundos: 240 },
  { titulo: 'Susurro', artista: 'Vega Nix', duracionSegundos: 190 },
  { titulo: 'Ultima Senal', artista: 'Vega Nix', duracionSegundos: 260 },
];

// dom
function renderizarReproductor(estado: EstadoReproductor, elementoId: string): void {
  if (typeof document === 'undefined') return;

  const pantalla = document.getElementById(elementoId);
  if (!pantalla) return;
  pantalla.textContent = estado.tipo === 'detenido' ? 'sin reproduccion' : `${estado.tipo}: ${estado.cancion}`;
}

// salida
function mostrarResumen(): void {
  console.log('=== Playlist interactiva ===');
  let estado: EstadoReproductor = { tipo: 'detenido' };

  const pasos: EventoReproductor[] = [
    { tipo: 'play', indice: 0 },
    { tipo: 'siguiente' },
    { tipo: 'pausar' },
    { tipo: 'siguiente' },
    { tipo: 'continuar' },
    { tipo: 'anterior' },
    { tipo: 'stop' },
    { tipo: 'siguiente' },
    { tipo: 'play', indice: 99 },
    { tipo: 'play', indice: 3 },
    { tipo: 'siguiente' },
  ];

  pasos.forEach((evento) => {
    estado = reducirReproductor(playlist, estado, evento);
    console.log(`${evento.tipo}: ${estado.tipo}${estado.tipo !== 'detenido' ? ` (${estado.cancion})` : ''}`);
  });

  renderizarReproductor(estado, 'reproductor-playlist');
}

mostrarResumen();
