export {};

// tipos
type ResultadoSalto = 'completado' | 'con_desviacion' | 'abortado';

interface SaltoRegistrado {
  readonly id: number;
  readonly fecha: Date;
  alturaMetros: number;
  segundosCaida: number;
  resultado: ResultadoSalto;
}

interface ReporteLog {
  totalSaltos: number;
  alturaTotal: number;
  porResultado: Record<ResultadoSalto, number>;
  mejorDesviacionSegundos: number;
}

// clases
class LogSaltos {
  private readonly saltos: SaltoRegistrado[] = [];

  registrar(salto: SaltoRegistrado): boolean {
    if (salto.alturaMetros <= 0 || salto.segundosCaida <= 0) return false;
    this.saltos.push(salto);
    return true;
  }

  reportar(): ReporteLog {
    return {
      totalSaltos: this.saltos.length,
      alturaTotal: Number(this.saltos.reduce((total, salto) => total + salto.alturaMetros, 0).toFixed(0)),
      porResultado: contarPorResultado(this.saltos),
      mejorDesviacionSegundos: this.mejorDesviacion(),
    };
  }

  private mejorDesviacion(): number {
    const completados = this.saltos.filter((salto) => salto.resultado === 'completado');
    if (completados.length === 0) return 0;
    return Math.max(...completados.map((salto) => desviacionEsperada(salto)));
  }

  filtrarPorMes(mes: number): SaltoRegistrado[] {
    return this.saltos.filter((salto) => salto.fecha.getMonth() === mes);
  }
}

// validacion
function desviacionEsperada(salto: SaltoRegistrado): number {
  const caidaTeorica = Math.sqrt((2 * salto.alturaMetros) / 9.81);
  return Number((salto.segundosCaida - caidaTeorica).toFixed(2));
}

function contarPorResultado(saltos: SaltoRegistrado[]): Record<ResultadoSalto, number> {
  return saltos.reduce<Record<ResultadoSalto, number>>((conteo, salto) => {
    conteo[salto.resultado] += 1;
    return conteo;
  }, { completado: 0, con_desviacion: 0, abortado: 0 });
}

// datos
const saltos: SaltoRegistrado[] = [
  { id: 1, fecha: new Date('2026-10-05'), alturaMetros: 4000, segundosCaida: 28.6, resultado: 'completado' },
  { id: 2, fecha: new Date('2026-10-19'), alturaMetros: 3200, segundosCaida: 25.2, resultado: 'con_desviacion' },
  { id: 3, fecha: new Date('2026-11-02'), alturaMetros: 4500, segundosCaida: 30.4, resultado: 'completado' },
  { id: 4, fecha: new Date('2026-11-09'), alturaMetros: 0, segundosCaida: 0, resultado: 'abortado' },
];

// salida
function mostrarResumen(log: LogSaltos): void {
  console.log('=== Log avanzado de saltos ===');

  saltos.forEach((salto) => {
    const registrado = log.registrar(salto);
    console.log(`Salto ${salto.id}: ${registrado ? 'registrado' : 'rechazado'} | Desviacion: ${desviacionEsperada(salto)}s`);
  });

  const reporte = log.reportar();
  console.log(`Total: ${reporte.totalSaltos} | Altura acumulada: ${reporte.alturaTotal} m | Por resultado: ${JSON.stringify(reporte.porResultado)}`);
  console.log(`Saltos de octubre: ${log.filtrarPorMes(9).length}`);
  console.log(`Mejor desviacion (completados): ${reporte.mejorDesviacionSegundos}s`);
}

mostrarResumen(new LogSaltos());
