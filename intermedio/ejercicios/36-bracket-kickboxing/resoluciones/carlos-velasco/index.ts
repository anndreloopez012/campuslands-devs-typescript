export {};

// tipos
type EstadoCombate = 'pendiente' | 'finalizado' | 'cancelado';

interface Combate {
  readonly ronda: number;
  readonly luchadorA: string;
  readonly luchadorB: string;
  ganador: string | null;
  estado: EstadoCombate;
}

// clases
class BracketKickboxing {
  private readonly combates: Combate[];

  constructor(combates: Combate[]) {
    this.combates = [...combates];
  }

  registrarGanador(ronda: number, luchadorA: string, luchadorB: string, ganador: string): boolean {
    if (ganador !== luchadorA && ganador !== luchadorB) return false;

    const combate = this.combates.find((item) => item.ronda === ronda && item.luchadorA === luchadorA && item.luchadorB === luchadorB);
    if (!combate || combate.estado === 'finalizado') return false;

    combate.ganador = ganador;
    combate.estado = 'finalizado';
    return true;
  }

  ganadores(): string[] {
    return this.combates.filter((combate) => combate.ganador !== null).map((combate) => combate.ganador as string);
  }

  siguientesEnfrentamientos(): Combate[] {
    return this.combates.filter((combate) => combate.estado === 'pendiente');
  }

  estaCompleto(): boolean {
    return this.combates.every((combate) => combate.estado !== 'pendiente');
  }
}

// generics
function unicos<T>(items: T[]): T[] {
  return [...new Set(items)];
}

// datos
const combatesIniciales: Combate[] = [
  { ronda: 1, luchadorA: 'Velas', luchadorB: 'Rios', ganador: null, estado: 'pendiente' },
  { ronda: 1, luchadorA: 'Mena', luchadorB: 'Nux', ganador: null, estado: 'pendiente' },
  { ronda: 2, luchadorA: 'ganador-1a', luchadorB: 'ganador-1b', ganador: null, estado: 'cancelado' },
];

// salida
function mostrarResumen(combates: Combate[]): void {
  console.log('=== Bracket de kickboxing ===');
  const bracket = new BracketKickboxing(combates);

  console.log(`Vencedores de Velas: ${bracket.registrarGanador(1, 'Velas', 'Rios', 'Velas') ? 'registrado' : 'rechazado'}`);
  console.log(`Vencedor falso de Mena: ${bracket.registrarGanador(1, 'Mena', 'Nux', 'Fantasma') ? 'registrado' : 'rechazado'}`);
  console.log(`Vencedor de Mena: ${bracket.registrarGanador(1, 'Mena', 'Nux', 'Mena') ? 'registrado' : 'rechazado'}`);

  console.log('Ganadores:', unicos(bracket.ganadores()).join(', '));
  console.log('Combates pendientes:');
  bracket.siguientesEnfrentamientos().forEach((combate) => {
    console.log(`- Ronda ${combate.ronda}: ${combate.luchadorA} vs ${combate.luchadorB}`);
  });
  console.log(`Bracket completo: ${bracket.estaCompleto() ? 'si' : 'no'}`);
}

mostrarResumen(combatesIniciales);
