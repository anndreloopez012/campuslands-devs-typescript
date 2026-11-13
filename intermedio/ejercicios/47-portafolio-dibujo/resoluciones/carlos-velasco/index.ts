export {};

// tipos
type TecnicaDibujo = 'lapiz' | 'carboncillo' | 'digital' | 'acua';

interface Obra {
  readonly id: number;
  readonly titulo: string;
  tecnica: TecnicaDibujo;
  horasTrabajo: number;
  terminada: boolean;
  fechaTermino: Date | null;
}

// clases
class Portafolio<T extends Obra> {
  private readonly obras = new Map<number, T>();

  agregar(obra: T): void {
    this.obras.set(obra.id, obra);
  }

  terminar(id: number, fecha: Date): boolean {
    const obra = this.obras.get(id);
    if (!obra || obra.terminada) return false;
    obra.terminada = true;
    obra.fechaTermino = fecha;
    return true;
  }

  terminadas(): T[] {
    return [...this.obras.values()].filter((obra) => obra.terminada);
  }

  promedioHoras(): number {
    const obras = [...this.obras.values()];
    if (obras.length === 0) return 0;
    const suma = obras.reduce((total, obra) => total + obra.horasTrabajo, 0);
    return Number((suma / obras.length).toFixed(1));
  }

  porTecnica(): Record<TecnicaDibujo, number> {
    return [...this.obras.values()].reduce<Record<TecnicaDibujo, number>>((conteo, obra) => {
      conteo[obra.tecnica] += 1;
      return conteo;
    }, { lapiz: 0, carboncillo: 0, digital: 0, acua: 0 });
  }

  tiempoDePortafolio(): number {
    return this.terminadas().reduce((total, obra) => total + obra.horasTrabajo, 0);
  }
}

// datos
const obras: Obra[] = [
  { id: 1, titulo: 'Manos de hierro', tecnica: 'lapiz', horasTrabajo: 8, terminada: true, fechaTermino: new Date('2026-09-12') },
  { id: 2, titulo: 'Tormenta digital', tecnica: 'digital', horasTrabajo: 14, terminada: false, fechaTermino: null },
  { id: 3, titulo: 'Retrato humo', tecnica: 'carboncillo', horasTrabajo: 6, terminada: false, fechaTermino: null },
  { id: 4, titulo: 'Bodegon cero', tecnica: 'acua', horasTrabajo: -3, terminada: false, fechaTermino: null },
];

// salida
function mostrarResumen(): void {
  console.log('=== Portafolio de dibujo ===');
  const portafolio = new Portafolio<Obra>();
  obras.forEach((obra) => portafolio.agregar(obra));

  console.log(`Cierre de "Tormenta digital": ${portafolio.terminar(2, new Date()) ? 'registrado' : 'rechazado'}`);
  console.log(`Cierre duplicado de "Tormenta digital": ${portafolio.terminar(2, new Date()) ? 'registrado' : 'rechazado'}`);
  console.log('Por tecnica:', JSON.stringify(portafolio.porTecnica()));
  console.log(`Promedio de horas por obra: ${portafolio.promedioHoras()}`);
  console.log(`Horas invertidas en terminadas: ${portafolio.tiempoDePortafolio()}`);
  console.log('Terminadas:', portafolio.terminadas().map((obra) => obra.titulo).join(', '));

  obras.forEach((obra) => {
    if (obra.horasTrabajo <= 0) console.log(`Alerta: obra ${obra.id} con horas invalidas`);
  });
}

mostrarResumen();
