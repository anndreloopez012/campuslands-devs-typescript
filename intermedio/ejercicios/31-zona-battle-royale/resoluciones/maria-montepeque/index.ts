export {};

interface Punto {
  readonly x: number;
  readonly y: number;
}

class Jugador {
  vida = 100;

  constructor(
    readonly nombre: string,
    readonly posicion: Punto,
  ) {}

  get vivo(): boolean {
    return this.vida > 0;
  }

  recibirDano(dano: number): void {
    this.vida = Math.max(this.vida - dano, 0);
  }
}

class Zona {
  constructor(
    readonly centro: Punto,
    public radio: number,
    readonly danoPorRonda: number,
  ) {
    if (radio <= 0) throw new Error("El radio inicial debe ser positivo");
  }

  contiene(punto: Punto): boolean {
    return Math.hypot(punto.x - this.centro.x, punto.y - this.centro.y) <= this.radio;
  }

  reducir(factor: number): void {
    this.radio = Math.round(this.radio * factor * 100) / 100;
  }
}

const zona = new Zona({ x: 50, y: 50 }, 80, 15);
const jugadores: Jugador[] = [
  new Jugador("Alfa", { x: 50, y: 55 }),
  new Jugador("Bravo", { x: 20, y: 30 }),
  new Jugador("Charlie", { x: 90, y: 90 }),
  new Jugador("Delta", { x: 60, y: 40 }),
  new Jugador("Eco", { x: 0, y: 0 }),
];

const simularRonda = (numero: number): void => {
  zona.reducir(0.7);
  const afectados = jugadores.filter((j) => j.vivo && !zona.contiene(j.posicion));
  afectados.forEach((j) => j.recibirDano(zona.danoPorRonda * numero));
  const caidos = afectados.filter((j) => !j.vivo).map((j) => j.nombre);
  console.log(
    `Ronda ${numero}: radio ${zona.radio} | fuera de zona: ${afectados.length} | eliminados: ${caidos.join(", ") || "ninguno"}`,
  );
};

console.log("Ejercicio 31: Simulador de zona battle royale");
for (let ronda = 1; ronda <= 5; ronda++) {
  simularRonda(ronda);
}
jugadores.forEach((j) => console.log(`  ${j.nombre}: ${j.vivo ? `vivo con ${j.vida} HP` : "eliminado"}`));
console.log(`Supervivientes: ${jugadores.filter((j) => j.vivo).length}`);
