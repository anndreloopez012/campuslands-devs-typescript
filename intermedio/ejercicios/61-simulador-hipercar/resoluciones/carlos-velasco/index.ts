export {};

// tipos
type EstadoMotor =
  | { tipo: 'apagado' }
  | { tipo: 'en_reposo'; rpm: number }
  | { tipo: 'acelerando'; rpm: number; velocidadKmh: number }
  | { tipo: 'frenando'; rpm: number; velocidadKmh: number };

type EventoMotor =
  | { tipo: 'encender' }
  | { tipo: 'acelerar'; fuerza: number }
  | { tipo: 'frenar'; fuerza: number }
  | { tipo: 'apagar' };

interface Hypercar {
  readonly nombre: string;
  rpmMaximas: number;
  velocidadMaximaKmh: number;
}

// state machine
function reducirMotor(estado: EstadoMotor, evento: EventoMotor, auto: Hypercar): EstadoMotor {
  switch (evento.tipo) {
    case 'encender':
      if (estado.tipo !== 'apagado') return estado;
      return { tipo: 'en_reposo', rpm: 900 };

    case 'acelerar':
      if (estado.tipo === 'apagado') return estado;
      if (estado.tipo === 'frenando') return estado;

      const rpmSubida = estado.tipo === 'en_reposo' ? estado.rpm + evento.fuerza * 1200 : estado.rpm + evento.fuerza * 1200;
      const velocidadNueva = estado.tipo === 'en_reposo' ? evento.fuerza * 12 : estado.velocidadKmh + evento.fuerza * 12;

      return {
        tipo: 'acelerando',
        rpm: Math.min(auto.rpmMaximas, rpmSubida),
        velocidadKmh: Math.min(auto.velocidadMaximaKmh, Number(velocidadNueva.toFixed(0))),
      };

    case 'frenar':
      if (estado.tipo !== 'acelerando') return estado;
      const velocidad = Math.max(0, estado.velocidadKmh - evento.fuerza * 25);
      if (velocidad === 0) return { tipo: 'en_reposo', rpm: 900 };
      return { tipo: 'frenando', rpm: estado.rpm, velocidadKmh: velocidad };

    case 'apagar':
      if (estado.tipo === 'acelerando' || estado.tipo === 'en_reposo') return { tipo: 'apagado' };
      return estado;
  }
}

// datos
const auto: Hypercar = { nombre: 'Solaris GT', rpmMaximas: 9500, velocidadMaximaKmh: 412 };

const eventos: EventoMotor[] = [
  { tipo: 'acelerar', fuerza: 3 },
  { tipo: 'encender' },
  { tipo: 'acelerar', fuerza: 10 },
  { tipo: 'acelerar', fuerza: 20 },
  { tipo: 'frenar', fuerza: 5 },
  { tipo: 'frenar', fuerza: 20 },
  { tipo: 'apagar' },
];

// salida
function mostrarResumen(): void {
  console.log('=== Simulador de aceleracion hypercar ===');
  let estado: EstadoMotor = { tipo: 'apagado' };

  eventos.forEach((evento) => {
    estado = reducirMotor(estado, evento, auto);
    console.log(`Evento ${evento.tipo}: ${estado.tipo} | RPM: ${estado.tipo !== 'apagado' ? estado.rpm : '-'} | Velocidad: ${estado.tipo === 'acelerando' || estado.tipo === 'frenando' ? `${estado.velocidadKmh} km/h` : '-'}`);
  });

  const invalido = reducirMotor({ tipo: 'apagado' }, { tipo: 'acelerar', fuerza: 5 }, auto);
  console.log(`Acelerar apagado queda como: ${invalido.tipo}`);
}

mostrarResumen();
