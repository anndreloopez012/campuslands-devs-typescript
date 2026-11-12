export {};

// tipos
type HerramientaCanvas = 'lapiz' | 'borrador' | 'rectangulo' | 'limpiar';

interface Trazo {
  readonly herramienta: HerramientaCanvas;
  puntos: { x: number; y: number }[];
}

// persistencia simulada
interface AlmacenDibujo {
  guardar(trazos: Trazo[]): void;
  leer(): Trazo[] | null;
}

class AlmacenDibujoMemoria implements AlmacenDibujo {
  private dibujo: Trazo[] | null = null;

  guardar(trazos: Trazo[]): void {
    this.dibujo = JSON.parse(JSON.stringify(trazos)) as Trazo[];
  }

  leer(): Trazo[] | null {
    return this.dibujo ? JSON.parse(JSON.stringify(this.dibujo)) as Trazo[] : null;
  }
}

// clases
class CanvasDibujo {
  private trazos: Trazo[] = [];
  private herramientaActiva: HerramientaCanvas = 'lapiz';

  constructor(private readonly almacen: AlmacenDibujo) {}

  seleccionar(herramienta: HerramientaCanvas): void {
    this.herramientaActiva = herramienta;
  }

  trazar(x: number, y: number): void {
    if (this.herramientaActiva === 'limpiar') {
      this.trazos = [];
      this.almacen.guardar(this.trazos);
      return;
    }

    const ultimo = this.trazos[this.trazos.length - 1];
    if (ultimo && ultimo.herramienta === this.herramientaActiva) {
      ultimo.puntos.push({ x, y });
    } else {
      this.trazos.push({ herramienta: this.herramientaActiva, puntos: [{ x, y }] });
    }
  }

  deshacer(): boolean {
    if (this.trazos.length === 0) return false;
    this.trazos.pop();
    return true;
  }

  guardar(): void {
    this.almacen.guardar(this.trazos);
  }

  restaurar(): boolean {
    const dibujo = this.almacen.leer();
    if (!dibujo) return false;
    this.trazos = dibujo;
    return true;
  }
}

// dom
function dibujarEnCanvas(trazos: Trazo[], canvasId: string): void {
  if (typeof document === 'undefined') return;

  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!canvas) return;

  const contexto = canvas.getContext('2d');
  if (!contexto) return;

  contexto.clearRect(0, 0, canvas.width, canvas.height);
  trazos.forEach((trazo) => {
    contexto.beginPath();
    trazo.puntos.forEach((punto, indice) => {
      if (indice === 0) contexto.moveTo(punto.x, punto.y);
      else contexto.lineTo(punto.x, punto.y);
    });
    contexto.stroke();
  });
}

// salida
function mostrarResumen(): void {
  console.log('=== Canvas de dibujo basico ===');
  const canvas = new CanvasDibujo(new AlmacenDibujoMemoria());

  canvas.trazar(10, 10);
  canvas.trazar(20, 25);
  canvas.trazar(30, 40);
  console.log(`Trazo continuo acumulado: 3 puntos`);

  canvas.seleccionar('rectangulo');
  canvas.trazar(50, 50);
  console.log(`Deshacer rectangulo: ${canvas.deshacer() ? 'aplicado' : 'sin trazo'}`);
  console.log(`Deshacer extra: ${canvas.deshacer() ? 'aplicado' : 'sin trazo'}`);

  canvas.guardar();
  canvas.restaurar();
  console.log('Dibujo restaurado desde almacenamiento');

  dibujarEnCanvas([], 'canvas-dibujo');
}

mostrarResumen();
