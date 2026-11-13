export {};

type ModalidadSalto = 'Freefly' | 'Wingsuit' | 'Formacion Skydiving' | 'Precision Aterrizaje' | 'Tandem';
type EstadoAterrizaje = 'Aterrizaje Limpio' | 'Desviacion Zona' | 'Apertura Reserva' | 'CanceladoClima';

interface RegistroSaltoParacaidismo {
  readonly saltoId: string;
  readonly paracaidista: string;
  readonly licencia: string;
  readonly modalidad: ModalidadSalto;
  readonly altitudSalidaPies: number;
  readonly tiempoCaidaLibreSegundos: number;
  readonly velocidadMaximaKmh: number;
  readonly estadoAterrizaje: EstadoAterrizaje;
}

interface ResumenAgrupadoModalidad {
  readonly modalidad: ModalidadSalto;
  readonly totalSaltos: number;
  readonly tiempoAcumuladoCaidaLibre: number;
  readonly altitudPromedioPies: number;
  readonly paracaidistasUnicos: readonly string[];
}

const bitacoraDropzoneAltiplano: readonly RegistroSaltoParacaidismo[] = [
  {
    saltoId: "SKY-101",
    paracaidista: "Valeria Sotomayor",
    licencia: "FAI-D-4421",
    modalidad: "Wingsuit",
    altitudSalidaPies: 14500,
    tiempoCaidaLibreSegundos: 85,
    velocidadMaximaKmh: 215,
    estadoAterrizaje: "Aterrizaje Limpio",
  },
  {
    saltoId: "SKY-102",
    paracaidista: "Bastian Lindqvist",
    licencia: "FAI-C-3109",
    modalidad: "Freefly",
    altitudSalidaPies: 13500,
    tiempoCaidaLibreSegundos: 62,
    velocidadMaximaKmh: 285,
    estadoAterrizaje: "Aterrizaje Limpio",
  },
  {
    saltoId: "SKY-103",
    paracaidista: "Tazio Moretti",
    licencia: "FAI-D-5190",
    modalidad: "Wingsuit",
    altitudSalidaPies: 15000,
    tiempoCaidaLibreSegundos: 92,
    velocidadMaximaKmh: 224,
    estadoAterrizaje: "Desviacion Zona",
  },
  {
    saltoId: "SKY-104",
    paracaidista: "Kenshin Takahashi",
    licencia: "FAI-B-2088",
    modalidad: "Formacion Skydiving",
    altitudSalidaPies: 13000,
    tiempoCaidaLibreSegundos: 55,
    velocidadMaximaKmh: 198,
    estadoAterrizaje: "Aterrizaje Limpio",
  },
  {
    saltoId: "SKY-105",
    paracaidista: "Gael Aramburu",
    licencia: "FAI-D-6012",
    modalidad: "Freefly",
    altitudSalidaPies: 14000,
    tiempoCaidaLibreSegundos: 66,
    velocidadMaximaKmh: 292,
    estadoAterrizaje: "Aterrizaje Limpio",
  },
  {
    saltoId: "SKY-106",
    paracaidista: "Marisol Hincapie",
    licencia: "FAI-A-1045",
    modalidad: "Precision Aterrizaje",
    altitudSalidaPies: 10000,
    tiempoCaidaLibreSegundos: 38,
    velocidadMaximaKmh: 185,
    estadoAterrizaje: "CanceladoClima",
  }
];

function validarSaltoEjecutado(salto: RegistroSaltoParacaidismo): boolean {
  return salto.estadoAterrizaje !== "CanceladoClima" && salto.altitudSalidaPies >= 3000 && salto.tiempoCaidaLibreSegundos > 0;
}

function agruparPorModalidad(saltos: readonly RegistroSaltoParacaidismo[]): Record<ModalidadSalto, readonly RegistroSaltoParacaidismo[]> {
  const estadoInicial: Record<ModalidadSalto, readonly RegistroSaltoParacaidismo[]> = {
    'Freefly': [],
    'Wingsuit': [],
    'Formacion Skydiving': [],
    'Precision Aterrizaje': [],
    'Tandem': [],
  };

  return saltos.reduce(
    (acumulado, salto) => ({
      ...acumulado,
      [salto.modalidad]: [...acumulado[salto.modalidad], salto],
    }),
    estadoInicial
  );
}

function calcularEstadisticasModalidad(
  modalidad: ModalidadSalto,
  saltos: readonly RegistroSaltoParacaidismo[]
): ResumenAgrupadoModalidad {
  const tiempoTotal = saltos.reduce((acc, s) => acc + s.tiempoCaidaLibreSegundos, 0);
  const altitudTotal = saltos.reduce((acc, s) => acc + s.altitudSalidaPies, 0);
  const nombresUnicos = Array.from(new Set(saltos.map(s => s.paracaidista)));

  return {
    modalidad,
    totalSaltos: saltos.length,
    tiempoAcumuladoCaidaLibre: tiempoTotal,
    altitudPromedioPies: Math.round(altitudTotal / saltos.length),
    paracaidistasUnicos: nombresUnicos,
  };
}

function procesarBitacoraParacaidismo(saltos: readonly RegistroSaltoParacaidismo[]): readonly ResumenAgrupadoModalidad[] {
  const saltosValidos = saltos.filter(validarSaltoEjecutado);
  const agrupados = agruparPorModalidad(saltosValidos);
  const modalidades = Object.keys(agrupados) as ModalidadSalto[];

  return modalidades
    .filter(modalidad => agrupados[modalidad].length > 0)
    .map(modalidad => calcularEstadisticasModalidad(modalidad, agrupados[modalidad]))
    .sort((a, b) => b.tiempoAcumuladoCaidaLibre - a.tiempoAcumuladoCaidaLibre);
}

function imprimirBitacora(titulo: string, resumen: readonly ResumenAgrupadoModalidad[]): void {
  console.log(`=== [BITÁCORA DE PARACAIDISMO] ${titulo} ===`);
  resumen.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Modalidad: ${item.modalidad} | Saltos: ${item.totalSaltos} | Caída Libre: ${item.tiempoAcumuladoCaidaLibre}s | Altitud Promedio: ${item.altitudPromedioPies} ft | Pilotos: ${item.paracaidistasUnicos.join(', ')}`
    );
  });
  console.log("=================================================================================\n");
}

const bitacoraOficial = procesarBitacoraParacaidismo(bitacoraDropzoneAltiplano);
imprimirBitacora("Resumen Agrupado por Modalidad de Vuelo", bitacoraOficial);

// Caso: Salto HALO estratosférico de gran altitud con apertura de paracaídas de reserva
const saltosCasoHalo: readonly RegistroSaltoParacaidismo[] = [
  {
    saltoId: "SKY-999",
    paracaidista: "Soren Vestergaard",
    licencia: "FAI-PRO-9001",
    modalidad: "Wingsuit",
    altitudSalidaPies: 28000,
    tiempoCaidaLibreSegundos: 145,
    velocidadMaximaKmh: 340,
    estadoAterrizaje: "Apertura Reserva",
  }
];

const resultadoHalo = procesarBitacoraParacaidismo(saltosCasoHalo);
imprimirBitacora("Caso: Salto HALO de Alta Altitud con Apertura de Reserva", resultadoHalo);