export {};

// tipos
type MomentoSetlist = 'apertura' | 'medio' | 'cierre';

interface CancionSetlist {
  readonly titulo: string;
  readonly artista: string;
  momento: MomentoSetlist;
  energia: number;
  duracionSegundos: number;
}

// clases
class Setlist {
  private readonly canciones: CancionSetlist[];

  constructor(canciones: CancionSetlist[]) {
    this.canciones = [...canciones];
  }

  agregar(cancion: CancionSetlist): void {
    if (cancion.energia < 0 || cancion.energia > 10) return;
    this.canciones.push(cancion);
  }

  duracionTotal(): number {
    return Number(this.canciones.reduce((total, cancion) => total + cancion.duracionSegundos, 0).toFixed(2));
  }

  energiaPromedio(): number {
    if (this.canciones.length === 0) return 0;
    const suma = this.canciones.reduce((total, cancion) => total + cancion.energia, 0);
    return Number((suma / this.canciones.length).toFixed(1));
  }

  porMomento(): Record<MomentoSetlist, number> {
    return this.canciones.reduce<Record<MomentoSetlist, number>>((conteo, cancion) => {
      conteo[cancion.momento] += 1;
      return conteo;
    }, { apertura: 0, medio: 0, cierre: 0 });
  }

  ordenPorEnergia(): string[] {
    return [...this.canciones].sort((a, b) => b.energia - a.energia).map((cancion) => cancion.titulo);
  }
}

// generics
function primeroQue<T>(items: T[], condicion: (item: T) => boolean): T | null {
  return items.find(condicion) ?? null;
}

// datos
const canciones: CancionSetlist[] = [
  { titulo: 'Encendido', artista: 'Kai Steel', momento: 'apertura', energia: 7, duracionSegundos: 210 },
  { titulo: 'Fiebre Neon', artista: 'Kai Steel', momento: 'medio', energia: 9, duracionSegundos: 240 },
  { titulo: 'Susurro', artista: 'Vega Nix', momento: 'medio', energia: 4, duracionSegundos: 190 },
  { titulo: 'Ultima Senal', artista: 'Vega Nix', momento: 'cierre', energia: 10, duracionSegundos: 260 },
];

// salida
function mostrarResumen(): void {
  console.log('=== Setlist de concierto ===');
  const setlist = new Setlist(canciones);

  setlist.agregar({ titulo: 'Callejon Oscuro', artista: 'Kai Steel', momento: 'apertura', energia: 8, duracionSegundos: 180 });
  setlist.agregar({ titulo: 'Cancion Invalida', artista: 'Nux', momento: 'medio', energia: -1, duracionSegundos: 180 });
  console.log(`Duracion total: ${setlist.duracionTotal()}s | Energia promedio: ${setlist.energiaPromedio()}`);
  console.log('Por momento:', setlist.porMomento());
  console.log('Orden por energia:', setlist.ordenPorEnergia().join(', '));

  const apertura = primeroQue(canciones, (cancion) => cancion.momento === 'apertura');
  console.log(`Apertura elegida: ${apertura ? apertura.titulo : 'ninguna'}`);
}

mostrarResumen();
