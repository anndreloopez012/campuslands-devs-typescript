export {};

type NivelAcceso = 1 | 2 | 3;
type ModoTerminal = 'Desconectada' | 'Autenticada' | 'MisionActiva' | 'Emergencia';

interface Tripulante {
  readonly id: string;
  readonly nombre: string;
  readonly nivelAcceso: NivelAcceso;
}

interface Mision {
  readonly id: string;
  readonly nombre: string;
  readonly nivelRequerido: NivelAcceso;
  readonly destino: string;
}

interface DatosTerminal {
  readonly historial: readonly string[];
  readonly alertas: number;
  readonly misionesCompletadas: number;
  readonly registrosBitacora: number;
}

type EstadoTerminal = DatosTerminal & (
  | { readonly modo: 'Desconectada'; readonly tripulante: null; readonly mision: null }
  | { readonly modo: 'Autenticada'; readonly tripulante: Tripulante; readonly mision: null }
  | { readonly modo: 'MisionActiva'; readonly tripulante: Tripulante; readonly mision: Mision }
  | {
      readonly modo: 'Emergencia';
      readonly tripulante: Tripulante | null;
      readonly mision: Mision | null;
    }
);

type EventoTerminal =
  | { readonly tipo: 'AUTENTICAR'; readonly tripulanteId: string }
  | { readonly tipo: 'INICIAR_MISION'; readonly misionId: string }
  | { readonly tipo: 'REGISTRAR_BITACORA'; readonly descripcion: string }
  | { readonly tipo: 'COMPLETAR_MISION' }
  | { readonly tipo: 'ACTIVAR_ALERTA'; readonly motivo: string }
  | { readonly tipo: 'REINICIAR_TERMINAL' }
  | { readonly tipo: 'CERRAR_SESION' };

const tripulantes: readonly Tripulante[] = [
  { id: 'TR-001', nombre: 'Juan Pérez', nivelAcceso: 1 },
  { id: 'TR-002', nombre: 'María Gómez', nivelAcceso: 2 },
  { id: 'TR-003', nombre: 'Carlos Ruiz', nivelAcceso: 3 },
];

const misiones: readonly Mision[] = [
  { id: 'MS-0701', nombre: 'Reparar antena de comunicaciones', nivelRequerido: 2, destino: 'Estación Aurora' },
  { id: 'MS-0702', nombre: 'Inspeccionar reactor principal', nivelRequerido: 3, destino: 'Nave Andrómeda' },
];

const estadoInicial: EstadoTerminal = {
  modo: 'Desconectada',
  tripulante: null,
  mision: null,
  historial: [],
  alertas: 0,
  misionesCompletadas: 0,
  registrosBitacora: 0,
};

function registrar(estado: EstadoTerminal, mensaje: string): EstadoTerminal {
  return { ...estado, historial: [...estado.historial, mensaje] };
}

function rechazar(estado: EstadoTerminal, motivo: string): EstadoTerminal {
  return registrar(estado, `RECHAZADO: ${motivo}`);
}

function validarMision(mision: Mision): boolean {
  return Boolean(mision.id.trim() && mision.nombre.trim() && mision.destino.trim())
    && mision.nivelRequerido >= 1 && mision.nivelRequerido <= 3;
}

function reducirTerminal(estado: EstadoTerminal, evento: EventoTerminal): EstadoTerminal {
  switch (evento.tipo) {
    case 'AUTENTICAR': {
      if (estado.modo !== 'Desconectada') return rechazar(estado, 'la terminal no está desconectada.');
      const tripulante = tripulantes.find(item => item.id === evento.tripulanteId);
      if (!tripulante) return rechazar(estado, `no existe el tripulante ${evento.tripulanteId}.`);
      return { ...estado, modo: 'Autenticada', tripulante, historial: [...estado.historial, `Sesión: ${tripulante.nombre}.`] };
    }

    case 'INICIAR_MISION': {
      if (estado.modo !== 'Autenticada') return rechazar(estado, 'inicia sesión antes de solicitar una misión.');
      const mision = misiones.find(item => item.id === evento.misionId);
      if (!mision || !validarMision(mision)) return rechazar(estado, 'la misión no existe o no es válida.');
      if (estado.tripulante.nivelAcceso < mision.nivelRequerido) {
        return rechazar(estado, `${estado.tripulante.nombre} no tiene acceso a «${mision.nombre}».`);
      }
      return { ...estado, modo: 'MisionActiva', mision, historial: [...estado.historial, `Misión iniciada: ${mision.nombre}.`] };
    }

    case 'REGISTRAR_BITACORA': {
      if (estado.modo !== 'MisionActiva') return rechazar(estado, 'no hay una misión activa.');
      const descripcion = evento.descripcion.trim();
      if (!descripcion) return rechazar(estado, 'la bitácora no puede estar vacía.');
      return {
        ...estado,
        registrosBitacora: estado.registrosBitacora + 1,
        historial: [...estado.historial, `Bitácora: ${descripcion}`],
      };
    }

    case 'COMPLETAR_MISION':
      if (estado.modo !== 'MisionActiva') return rechazar(estado, 'no hay una misión activa.');
      return {
        ...estado,
        modo: 'Autenticada',
        mision: null,
        misionesCompletadas: estado.misionesCompletadas + 1,
        historial: [...estado.historial, `Misión completada: ${estado.mision.nombre}.`],
      };

    case 'ACTIVAR_ALERTA': {
      if (estado.modo === 'Emergencia') return rechazar(estado, 'la terminal ya está en emergencia.');
      const motivo = evento.motivo.trim();
      if (!motivo) return rechazar(estado, 'la alerta debe indicar un motivo.');
      return {
        ...estado,
        modo: 'Emergencia',
        tripulante: estado.tripulante,
        mision: estado.modo === 'MisionActiva' ? estado.mision : null,
        alertas: estado.alertas + 1,
        historial: [...estado.historial, `EMERGENCIA: ${motivo}`],
      };
    }

    case 'REINICIAR_TERMINAL':
      if (estado.modo !== 'Emergencia') return rechazar(estado, 'solo se reinicia desde emergencia.');
      return estado.tripulante
        ? { ...estado, modo: 'Autenticada', tripulante: estado.tripulante, mision: null, historial: [...estado.historial, 'Terminal reiniciada.'] }
        : { ...estado, modo: 'Desconectada', tripulante: null, mision: null, historial: [...estado.historial, 'Terminal reiniciada.'] };

    case 'CERRAR_SESION':
      if (estado.modo !== 'Autenticada') return rechazar(estado, 'no se puede cerrar la sesión en este estado.');
      return {
        ...estado,
        modo: 'Desconectada',
        tripulante: null,
        historial: [...estado.historial, 'Sesión cerrada.'],
      };
  }
}

function comandosDisponibles(estado: EstadoTerminal): readonly EventoTerminal['tipo'][] {
  switch (estado.modo) {
    case 'Desconectada': return ['AUTENTICAR', 'ACTIVAR_ALERTA'];
    case 'Autenticada': return [
      'CERRAR_SESION',
      'ACTIVAR_ALERTA',
      ...(misiones.some(mision => mision.nivelRequerido <= estado.tripulante.nivelAcceso) ? ['INICIAR_MISION' as const] : []),
    ];
    case 'MisionActiva': return ['REGISTRAR_BITACORA', 'COMPLETAR_MISION', 'ACTIVAR_ALERTA'];
    case 'Emergencia': return ['REINICIAR_TERMINAL'];
  }
}

function contarRechazos(historial: readonly string[]): number {
  return historial.reduce((total, registro) => total + Number(registro.startsWith('RECHAZADO:')), 0);
}

function procesarEventos(eventos: readonly EventoTerminal[]): EstadoTerminal {
  return eventos.reduce(reducirTerminal, estadoInicial);
}

function imprimirResumen(titulo: string, estado: EstadoTerminal): void {
  console.log(`=== [TERMINAL SCI-FI] ${titulo} ===`);
  console.log(`Estado: ${estado.modo} | Tripulante: ${estado.tripulante?.nombre ?? 'Sin sesión'}`);
  console.log(`Misión activa: ${estado.modo === 'MisionActiva' ? estado.mision.nombre : 'Ninguna'}`);
  console.log(
    `Completadas: ${estado.misionesCompletadas} | Bitácora: ${estado.registrosBitacora} | Alertas: ${estado.alertas} | Rechazos: ${contarRechazos(estado.historial)}`,
  );
  console.log(`Comandos: ${comandosDisponibles(estado).join(', ')}`);
  estado.historial.forEach(registro => console.log(`- ${registro}`));
}

const casoNormal = procesarEventos([
  { tipo: 'AUTENTICAR', tripulanteId: 'TR-002' },
  { tipo: 'INICIAR_MISION', misionId: 'MS-0701' },
  { tipo: 'REGISTRAR_BITACORA', descripcion: 'Antena exterior asegurada.' },
  { tipo: 'REGISTRAR_BITACORA', descripcion: 'Comunicaciones restablecidas.' },
  { tipo: 'COMPLETAR_MISION' },
]);

const casoLimite = procesarEventos([
  { tipo: 'AUTENTICAR', tripulanteId: 'TR-001' },
  { tipo: 'INICIAR_MISION', misionId: 'MS-0701' },
]);

imprimirResumen('Caso normal: misión de comunicaciones', casoNormal);
imprimirResumen('Caso límite: Juan Pérez sin nivel de acceso suficiente', casoLimite);
console.log(`Caso normal: ${casoNormal.misionesCompletadas === 1 && casoNormal.registrosBitacora === 2 ? 'Correcto' : 'Falló'}`);
console.log(`Caso límite: ${contarRechazos(casoLimite.historial) === 1 ? 'Correcto' : 'Falló'}`);
