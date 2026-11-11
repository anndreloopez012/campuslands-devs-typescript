export {};

// tipos
interface LecturaTelemetria {
  readonly moto: string;
  readonly vuelta: number;
  velocidadMaximaKmh: number;
  rpmMaximas: number;
  temperaturaMotorC: number;
}

interface AlertaTelemetria {
  readonly moto: string;
  readonly vuelta: number;
  readonly motivo: string;
}

// datos
const lecturas: LecturaTelemetria[] = [
  { moto: 'RSV Turbo', vuelta: 1, velocidadMaximaKmh: 289, rpmMaximas: 13500, temperaturaMotorC: 96 },
  { moto: 'RSV Turbo', vuelta: 2, velocidadMaximaKmh: 302, rpmMaximas: 14200, temperaturaMotorC: 112 },
  { moto: 'Nova 600', vuelta: 1, velocidadMaximaKmh: 265, rpmMaximas: 12800, temperaturaMotorC: 88 },
  { moto: 'Nova 600', vuelta: 2, velocidadMaximaKmh: 180, rpmMaximas: 9000, temperaturaMotorC: 85 },
];

// reglas
const limiteVelocidadKmh = 300;
const limiteRpm = 14000;
const limiteTemperaturaC = 110;

// validacion
function validarLectura(lectura: LecturaTelemetria): boolean {
  return lectura.velocidadMaximaKmh > 0 && lectura.rpmMaximas > 0 && lectura.temperaturaMotorC > 0 && lectura.vuelta > 0;
}

// calculos
function generarAlertas(lecturas: LecturaTelemetria[]): AlertaTelemetria[] {
  const alertas: AlertaTelemetria[] = [];

  lecturas.forEach((lectura) => {
    if (lectura.velocidadMaximaKmh > limiteVelocidadKmh) {
      alertas.push({ moto: lectura.moto, vuelta: lectura.vuelta, motivo: 'velocidad excedida' });
    }
    if (lectura.rpmMaximas > limiteRpm) {
      alertas.push({ moto: lectura.moto, vuelta: lectura.vuelta, motivo: 'rpm excedidas' });
    }
    if (lectura.temperaturaMotorC > limiteTemperaturaC) {
      alertas.push({ moto: lectura.moto, vuelta: lectura.vuelta, motivo: 'temperatura del motor alta' });
    }
  });

  return alertas;
}

function promedioPorMoto(lecturas: LecturaTelemetria[]): Record<string, number> {
  const grupos = lecturas.reduce<Record<string, LecturaTelemetria[]>>((acumulador, lectura) => {
    (acumulador[lectura.moto] ??= []).push(lectura);
    return acumulador;
  }, {});

  const resultado: Record<string, number> = {};
  Object.entries(grupos).forEach(([moto, grupo]) => {
    const suma = grupo.reduce((total, lectura) => total + lectura.velocidadMaximaKmh, 0);
    resultado[moto] = Number((suma / grupo.length).toFixed(1));
  });

  return resultado;
}

// salida
function mostrarResumen(lecturas: LecturaTelemetria[]): void {
  console.log('=== Telemetria de motos deportivas ===');
  console.log('Velocidad maxima promedio por moto:', promedioPorMoto(lecturas));

  const alertas = generarAlertas(lecturas);
  console.log(`Alertas generadas: ${alertas.length}`);
  alertas.forEach((alerta) => {
    console.log(`- ${alerta.moto} (vuelta ${alerta.vuelta}): ${alerta.motivo}`);
  });
}

mostrarResumen(lecturas);
