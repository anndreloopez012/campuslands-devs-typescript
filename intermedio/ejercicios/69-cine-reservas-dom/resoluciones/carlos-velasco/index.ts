export {};

// tipos
type EstadoButaca = 'libre' | 'reservada' | 'ocupada';

interface Butaca {
  readonly fila: number;
  readonly columna: number;
  estado: EstadoButaca;
}

interface EstadoSala {
  butacas: Butaca[][];
  seleccionadas: string[];
}

type EventoSala =
  | { tipo: 'seleccionar'; fila: number; columna: number }
  | { tipo: 'confirmar' }
  | { tipo: 'cancelar' };

// reglas
const filasSala = 4;
const columnasSala = 6;

// state machine
function reducirSala(estado: EstadoSala, evento: EventoSala): EstadoSala {
  switch (evento.tipo) {
    case 'seleccionar': {
      const butaca = estado.butacas[evento.fila]?.[evento.columna];
      if (!butaca || butaca.estado !== 'libre') return estado;

      const clave = `${evento.fila}-${evento.columna}`;
      if (estado.seleccionadas.includes(clave)) return estado;

      const butacas = estado.butacas.map((filaButacas) => filaButacas.map((item) => ({ ...item })));
      butacas[evento.fila][evento.columna].estado = 'reservada';

      return { ...estado, butacas, seleccionadas: [...estado.seleccionadas, clave] };
    }

    case 'confirmar': {
      const butacas = estado.butacas.map((filaButacas) => filaButacas.map((item) => ({ ...item })));
      estado.seleccionadas.forEach((clave) => {
        const [fila, columna] = clave.split('-').map(Number);
        butacas[fila][columna].estado = 'ocupada';
      });

      return { butacas, seleccionadas: [] };
    }

    case 'cancelar': {
      const butacas = estado.butacas.map((filaButacas) => filaButacas.map((item) => ({ ...item })));
      estado.seleccionadas.forEach((clave) => {
        const [fila, columna] = clave.split('-').map(Number);
        butacas[fila][columna].estado = 'libre';
      });

      return { butacas, seleccionadas: [] };
    }
  }
}

// datos
function crearSala(): EstadoSala {
  const butacas: Butaca[][] = Array.from({ length: filasSala }, (_, fila) =>
    Array.from({ length: columnasSala }, (_, columna) => ({ fila, columna, estado: 'libre' as const })),
  );
  butacas[0][2].estado = 'ocupada';
  butacas[3][4].estado = 'ocupada';

  return { butacas, seleccionadas: [] };
}

// dom
function renderizarSala(estado: EstadoSala, contenedorId: string): void {
  if (typeof document === 'undefined') return;

  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  contenedor.innerHTML = '';
  estado.butacas.forEach((filaButacas) => {
    const linea = document.createElement('div');
    linea.textContent = filaButacas.map((butaca) => (butaca.estado === 'libre' ? 'O' : butaca.estado === 'reservada' ? 'R' : 'X')).join(' ');
    contenedor.appendChild(linea);
  });
}

// salida
function mostrarResumen(): void {
  console.log('=== Reservas de cine DOM ===');
  let estado = crearSala();

  estado = reducirSala(estado, { tipo: 'seleccionar', fila: 2, columna: 1 });
  estado = reducirSala(estado, { tipo: 'seleccionar', fila: 0, columna: 2 });
  estado = reducirSala(estado, { tipo: 'seleccionar', fila: 2, columna: 1 });
  estado = reducirSala(estado, { tipo: 'seleccionar', fila: 1, columna: 3 });
  console.log(`Seleccionadas: ${estado.seleccionadas.join(', ')}`);

  estado = reducirSala(estado, { tipo: 'cancelar' });
  console.log(`Tras cancelar: ${estado.seleccionadas.length} seleccionadas`);

  estado = reducirSala(estado, { tipo: 'seleccionar', fila: 2, columna: 1 });
  estado = reducirSala(estado, { tipo: 'confirmar' });
  console.log('Mapa de la sala (O libre, R reservada, X ocupada):');
  estado.butacas.forEach((filaButacas) => {
    console.log(filaButacas.map((butaca) => (butaca.estado === 'libre' ? 'O' : butaca.estado === 'reservada' ? 'R' : 'X')).join(' '));
  });

  renderizarSala(estado, 'sala-cine');
}

mostrarResumen();
