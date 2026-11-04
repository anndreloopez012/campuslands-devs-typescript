export {};

interface Cancion {
  readonly titulo: string;
  readonly artista: string;
  readonly duracionMin: number;
  readonly energia: number;
}

class Setlist<T extends Cancion> {
  private readonly canciones: T[] = [];

  constructor(private readonly limiteMin: number) {}

  get duracion(): number {
    return this.canciones.reduce((acc, c) => acc + c.duracionMin, 0);
  }

  agregar(cancion: T): boolean {
    const repetida = this.canciones.some((c) => c.titulo === cancion.titulo);
    const cabe = this.duracion + cancion.duracionMin <= this.limiteMin;
    const valida = cancion.duracionMin > 0 && cancion.energia >= 1 && cancion.energia <= 10;
    if (repetida || !cabe || !valida) return false;
    this.canciones.push(cancion);
    return true;
  }

  ordenarPorCurva(): T[] {
    // Calienta, sube a un pico y cierra con una balada: orden ascendente y la ultima baja.
    const ordenadas = [...this.canciones].sort((a, b) => a.energia - b.energia);
    const cierre = ordenadas.shift();
    return cierre ? [...ordenadas, cierre] : [];
  }

  energiaPromedio(): number {
    if (this.canciones.length === 0) return 0;
    const suma = this.canciones.reduce((acc, c) => acc + c.energia, 0);
    return Math.round((suma / this.canciones.length) * 10) / 10;
  }
}

const repertorio: readonly Cancion[] = [
  { titulo: "Amanecer", artista: "Banda Sol", duracionMin: 4, energia: 5 },
  { titulo: "Fuego Lento", artista: "Banda Sol", duracionMin: 5, energia: 9 },
  { titulo: "Marea Alta", artista: "Banda Sol", duracionMin: 6, energia: 7 },
  { titulo: "Cenizas", artista: "Banda Sol", duracionMin: 5, energia: 3 },
  { titulo: "Trueno", artista: "Banda Sol", duracionMin: 4, energia: 10 },
  { titulo: "Amanecer", artista: "Banda Sol", duracionMin: 4, energia: 5 },
  { titulo: "Maraton", artista: "Banda Sol", duracionMin: 20, energia: 6 },
  { titulo: "Silencio", artista: "Banda Sol", duracionMin: 0, energia: 2 },
  { titulo: "Ruido", artista: "Banda Sol", duracionMin: 3, energia: 14 },
];

const setlist = new Setlist<Cancion>(25);

console.log("Ejercicio 38: Setlist de concierto (limite 25 min)");
repertorio.forEach((cancion) => {
  const aceptada = setlist.agregar(cancion);
  console.log(`  ${aceptada ? "+" : "x"} ${cancion.titulo} (${cancion.duracionMin} min, energia ${cancion.energia})`);
});
console.log("Orden final:");
setlist.ordenarPorCurva().forEach((c, i) => console.log(`${i + 1}. ${c.titulo} - energia ${c.energia}`));
console.log(`Duracion: ${setlist.duracion} min | energia promedio: ${setlist.energiaPromedio()}`);
