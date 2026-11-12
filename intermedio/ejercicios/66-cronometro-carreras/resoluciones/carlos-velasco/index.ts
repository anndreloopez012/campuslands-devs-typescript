export {};

// tipos
type EstadoCronometro =
  | { tipo: 'detenido' }
  | { tipo: 'corriendo'; tiempoAcumulado: number }
  | { tipo: 'en_pausa'; tiempoAcumulado: number };

type EventoCronometro =
  | { tipo: 'iniciar' }
  | { tipo: 'tic'; milisegundos: number }
  | { tipo: 'vuelta' }
  | { tipo: 'pausar' }
  | { tipo: 'continuar' }
  | { tipo: 'detener' };

interface RegistroVueltas {
  vueltas: number[];
  mejorVuelta: number | null;
  promedioVuelta: number;
}

// state machine
function reducirCronometro(estado: EstadoCronometro, evento: EventoCronometro): EstadoCronometro {
  switch (evento.tipo) {
    case 'iniciar':
      if (estado.tipo !== 'detenido') return estado;
      return { tipo: 'corriendo', tiempoAcumulado: 0 };

    case 'tic':
      if (estado.tipo !== 'corriendo') return estado;
      return { ...estado, tiempoAcumulado: estado.tiempoAcumulado + evento.milisegundos };

    case 'pausar':
      return estado.tipo === 'corriendo' ? { tipo: 'en_pausa', tiempoAcumulado: estado.tiempoAcumulado } : estado;

    case 'continuar':
      return estado.tipo === 'en_pausa' ? { tipo: 'corriendo', tiempoAcumulado: estado.tiempoAcumulado } : estado;

    case 'vuelta':
      return estado;

    case 'detener':
      return { tipo: 'detenido' };
  }
}

// calculos
function registrarVueltas(estado: EstadoCronometro, vueltas: number[]): RegistroVueltas {
  const limpio = vueltas.filter((milisegundos) => milisegundos > 0);
  return {
    vueltas: limpio,
    mejorVuelta: limpio.length > 0 ? Math.min(...limpio) : null,
    promedioVuelta: limpio.length === 0 ? 0 : Number((limpio.reduce((total, valor) => total + valor, 0) / limpio.length).toFixed(1)),
  };
}

function formatear(milisegundos: number): string {
  const segundos = (milisegundos / 1000).toFixed(3);
  return `${segundos}s`;
}

// datos
const vueltasRegistradas = [82_400, 80_900, 83_150, -50];

// salida
function mostrarResumen(): void {
  console.log('=== Cronometro de vueltas ===');
  let estado: EstadoCronometro = { tipo: 'detenido' };

  estado = reducirCronometro(estado, { tipo: 'iniciar' });
  for (let tic = 0; tic < 10; tic += 1) {
    estado = reducirCronometro(estado, { tipo: 'tic', milisegundos: 1000 });
  }
  console.log(`Tras 10 tics: ${estado.tipo} | ${formatear(estado.tipo === 'corriendo' ? estado.tiempoAcumulado : 0)}`);

  estado = reducirCronometro(estado, { tipo: 'pausar' });
  console.log(`Pausa: ${estado.tipo}`);

  estado = reducirCronometro(estado, { tipo: 'continuar' });
  console.log(`Continuar: ${estado.tipo}`);

  const registro = registrarVueltas(estado, vueltasRegistradas);
  console.log(`Vueltas: ${registro.vueltas.join(', ')}`);
  console.log(`Mejor vuelta: ${registro.mejorVuelta ? formatear(registro.mejorVuelta) : 'n/a'} | Promedio: ${formatear(registro.promedioVuelta)}`);
}

mostrarResumen();
