export {};

// tipos
type EstadoSensor = 'ok' | 'advertencia' | 'fallo';

interface LecturaSensor {
  readonly id: number;
  readonly nombre: string;
  valor: number;
  unidad: string;
  estado: EstadoSensor;
  momento: Date;
}

// errores
class ErrorLectura extends Error {
  constructor(sensor: string) {
    super(`el sensor ${sensor} no devolvio lectura`);
    this.name = 'ErrorLectura';
  }
}

// datos remotos simulados
async function leerSensor(id: number, nombre: string, unidad: string, valor: number | null): Promise<LecturaSensor> {
  await new Promise((resolver) => setTimeout(resolver, 5));
  if (valor === null) throw new ErrorLectura(nombre);

  return {
    id,
    nombre,
    valor,
    unidad,
    estado: evaluarSensor(nombre, valor),
    momento: new Date(),
  };
}

// validacion
function evaluarSensor(nombre: string, valor: number): EstadoSensor {
  if (nombre === 'temperatura motor' && valor > 110) return 'fallo';
  if (nombre === 'nivel de aceite' && valor < 30) return 'advertencia';
  return 'ok';
}

// calculos
function resumenLecturas(lecturas: LecturaSensor[]): Record<EstadoSensor, number> {
  return lecturas.reduce<Record<EstadoSensor, number>>((conteo, lectura) => {
    conteo[lectura.estado] += 1;
    return conteo;
  }, { ok: 0, advertencia: 0, fallo: 0 });
}

// dom
function renderizarPanel(lecturas: LecturaSensor[]): void {
  if (typeof document === 'undefined') return;

  const panel = document.createElement('div');
  panel.id = 'panel-sensores';
  lecturas.forEach((lectura) => {
    const fila = document.createElement('p');
    fila.textContent = `${lectura.nombre}: ${lectura.valor} ${lectura.unidad} (${lectura.estado})`;
    panel.appendChild(fila);
  });
  document.body.appendChild(panel);
}

// salida
function mostrarResumen(): void {
  console.log('=== Panel DOM de sensores moto ===');

  void (async () => {
    const solicitudes: Promise<LecturaSensor>[] = [
      leerSensor(1, 'velocidad', 'km/h', 96),
      leerSensor(2, 'temperatura motor', 'C', 115),
      leerSensor(3, 'nivel de aceite', '%', 22),
      leerSensor(4, 'presion neumaticos', 'psi', null),
    ];

    const resultados = await Promise.allSettled(solicitudes);
    const lecturas: LecturaSensor[] = [];

    resultados.forEach((resultado) => {
      if (resultado.status === 'fulfilled') {
        lecturas.push(resultado.value);
        console.log(`${resultado.value.nombre}: ${resultado.value.valor} ${resultado.value.unidad} (${resultado.value.estado})`);
      } else {
        console.log(`Sin lectura: ${resultado.reason instanceof Error ? resultado.reason.message : 'desconocido'}`);
      }
    });

    console.log('Resumen:', JSON.stringify(resumenLecturas(lecturas)));
    renderizarPanel(lecturas);
  })();
}

mostrarResumen();
