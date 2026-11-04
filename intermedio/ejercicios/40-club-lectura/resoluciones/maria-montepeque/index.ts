export {};

interface Libro {
  readonly titulo: string;
  readonly autor: string;
  readonly paginas: number;
}

class ClubLectura<T extends Libro> {
  private readonly miembros = new Set<string>();
  private readonly votos = new Map<string, string>();

  constructor(private readonly candidatos: readonly T[]) {}

  inscribir(miembro: string): boolean {
    if (miembro.trim().length === 0 || this.miembros.has(miembro)) return false;
    this.miembros.add(miembro);
    return true;
  }

  votar(miembro: string, titulo: string): string {
    if (!this.miembros.has(miembro)) return `${miembro}: no esta inscrito`;
    if (this.votos.has(miembro)) return `${miembro}: ya voto`;
    if (!this.candidatos.some((libro) => libro.titulo === titulo)) return `${miembro}: "${titulo}" no es candidato`;
    this.votos.set(miembro, titulo);
    return `${miembro}: voto por "${titulo}"`;
  }

  conteo(): Map<string, number> {
    return [...this.votos.values()].reduce(
      (mapa, titulo) => mapa.set(titulo, (mapa.get(titulo) ?? 0) + 1),
      new Map<string, number>(),
    );
  }

  ganador(): T | null {
    const ordenado = [...this.conteo()].sort((a, b) => b[1] - a[1]);
    if (ordenado.length === 0) return null;
    // Empate en el primer lugar: se resuelve por el libro mas corto.
    const maximo = ordenado[0][1];
    const empatados = this.candidatos.filter((libro) => (this.conteo().get(libro.titulo) ?? 0) === maximo);
    return empatados.sort((a, b) => a.paginas - b.paginas)[0] ?? null;
  }

  participacion(): number {
    return this.miembros.size === 0 ? 0 : Math.round((this.votos.size / this.miembros.size) * 100);
  }
}

const club = new ClubLectura<Libro>([
  { titulo: "Dune", autor: "Frank Herbert", paginas: 688 },
  { titulo: "Neuromante", autor: "William Gibson", paginas: 320 },
  { titulo: "Fundacion", autor: "Isaac Asimov", paginas: 255 },
]);

console.log("Ejercicio 40: Club de lectura");
["Ana", "Beto", "Cami", "Dani", "Ana", ""].forEach((nombre) => {
  if (!club.inscribir(nombre)) console.log(`  ! inscripcion rechazada: "${nombre}"`);
});

[
  club.votar("Ana", "Dune"),
  club.votar("Beto", "Neuromante"),
  club.votar("Cami", "Fundacion"),
  club.votar("Dani", "Neuromante"),
  club.votar("Ana", "Fundacion"),
  club.votar("Eli", "Dune"),
  club.votar("Beto", "Libro Inventado"),
].forEach((linea) => console.log(`  ${linea}`));

club.conteo().forEach((votos, titulo) => console.log(`  "${titulo}": ${votos} voto(s)`));
const ganador = club.ganador();
console.log(`Participacion: ${club.participacion()}%`);
console.log(ganador ? `Libro del mes: ${ganador.titulo} de ${ganador.autor}` : "Sin ganador");
