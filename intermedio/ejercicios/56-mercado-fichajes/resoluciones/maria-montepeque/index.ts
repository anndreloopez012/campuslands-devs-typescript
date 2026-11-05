export {};

type Posicion = "portero" | "defensa" | "medio" | "delantero";

interface Jugador {
  readonly id: number;
  readonly nombre: string;
  readonly posicion: Posicion;
  readonly precio: number;
  readonly club: string;
}

class FondosInsuficientes extends Error {
  constructor(
    readonly necesario: number,
    readonly disponible: number,
  ) {
    super(`Fondos insuficientes: necesita ${necesario} M y tiene ${disponible} M`);
    this.name = "FondosInsuficientes";
  }
}

class JugadorNoDisponible extends Error {
  constructor(id: number) {
    super(`El jugador ${id} no esta en el mercado`);
    this.name = "JugadorNoDisponible";
  }
}

const esperar = (ms: number): Promise<void> => new Promise((resolver) => setTimeout(resolver, ms));

const mercado: Jugador[] = [
  { id: 1, nombre: "Leandro Vidal", posicion: "delantero", precio: 45, club: "Rayo Norte" },
  { id: 2, nombre: "Ivan Cortes", posicion: "medio", precio: 28, club: "Union Sur" },
  { id: 3, nombre: "Pablo Mena", posicion: "defensa", precio: 15, club: "Rayo Norte" },
  { id: 4, nombre: "Hugo Reyes", posicion: "portero", precio: 22, club: "Atletico Este" },
  { id: 5, nombre: "Tomas Ibarra", posicion: "delantero", precio: 80, club: "Union Sur" },
];

class Club {
  private presupuesto: number;
  readonly plantilla: Jugador[] = [];

  constructor(
    readonly nombre: string,
    presupuesto: number,
  ) {
    this.presupuesto = presupuesto;
  }

  get fondos(): number {
    return this.presupuesto;
  }

  async fichar(id: number): Promise<Jugador> {
    await esperar(5);
    const indice = mercado.findIndex((j) => j.id === id);
    if (indice === -1) throw new JugadorNoDisponible(id);
    const jugador = mercado[indice];
    if (jugador.precio > this.presupuesto) throw new FondosInsuficientes(jugador.precio, this.presupuesto);

    this.presupuesto -= jugador.precio;
    this.plantilla.push(jugador);
    mercado.splice(indice, 1);
    return jugador;
  }
}

const main = async (): Promise<void> => {
  console.log("Ejercicio 56: Mercado de fichajes");
  const club = new Club("Cometas FC", 100);

  // Los fichajes se hacen en secuencia: cada uno depende del presupuesto que dejo el anterior.
  for (const id of [1, 5, 3, 3, 99, 4]) {
    try {
      const jugador = await club.fichar(id);
      console.log(`  + ${jugador.nombre} (${jugador.posicion}) por ${jugador.precio} M | fondos: ${club.fondos} M`);
    } catch (error) {
      if (error instanceof FondosInsuficientes || error instanceof JugadorNoDisponible) {
        console.log(`  x #${id}: ${error.message}`);
      } else {
        throw error;
      }
    }
  }
  console.log(`Plantilla: ${club.plantilla.map((j) => j.nombre).join(", ")}`);
  console.log(`Fondos restantes: ${club.fondos} M | aun en el mercado: ${mercado.length}`);
};

void main();
