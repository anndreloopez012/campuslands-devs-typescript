export {};

// Ejercicio 15: Proyecto Final Integrador

type ClaseRPG = "Maga" | "Guerrero" | "Arquera" | "Asesino";
type Rareza = "comun" | "raro" | "epico" | "legendario";
interface EntidadConId {
  id: string;
}
interface Equipo {
  nombre: string;
  rareza: Rareza;
}
interface PersonajeRPG extends EntidadConId {
  nombre: string;
  clase: ClaseRPG;
  nivel: number;
  puntosVida: number;
  inventario: Equipo[];
}
const poderRareza: Record<Rareza, number> = {
  comun: 1,
  raro: 3,
  epico: 6,
  legendario: 10,
};
const buscarPorId = <T extends EntidadConId>(
  items: T[],
  id: string,
): T | undefined => items.find((i) => i.id === id);
class GestorPersonajes {
  private personajes: PersonajeRPG[] = [];
  registrar(p: PersonajeRPG): void {
    if (p.nivel < 1)
      throw new Error("El nivel inicial debe ser mayor o igual a 1.");
    this.personajes.push(p);
  }
  listarPorClase(clase: ClaseRPG): PersonajeRPG[] {
    return this.personajes.filter((p) => p.clase === clase);
  }
  subirNivel(id: string): PersonajeRPG {
    const p = buscarPorId(this.personajes, id);
    if (!p) throw new Error(`No existe un personaje con id ${id}.`);
    p.nivel += 1;
    p.puntosVida += 10;
    return p;
  }
  poderTotal(id: string): number {
    const p = buscarPorId(this.personajes, id);
    if (!p) throw new Error(`No existe un personaje con id ${id}.`);
    return (
      p.nivel * 10 + p.inventario.reduce((s, e) => s + poderRareza[e.rareza], 0)
    );
  }
  obtenerResumen(): string[] {
    return this.personajes.map(
      (p) =>
        `${p.nombre} [${p.clase}] nivel ${p.nivel}, vida ${p.puntosVida}, poder ${this.poderTotal(p.id)}, items: ${p.inventario.map((e) => `${e.nombre} (${e.rareza})`).join(", ")}`,
    );
  }
}
const cargarPersonajesIniciales = async (): Promise<PersonajeRPG[]> => [
  {
    id: "P-01",
    nombre: "Lyra",
    clase: "Maga",
    nivel: 8,
    puntosVida: 90,
    inventario: [{ nombre: "Baston arcano", rareza: "epico" }],
  },
  {
    id: "P-02",
    nombre: "Roth",
    clase: "Guerrero",
    nivel: 11,
    puntosVida: 145,
    inventario: [
      { nombre: "Espada pesada", rareza: "raro" },
      { nombre: "Escudo", rareza: "comun" },
    ],
  },
  {
    id: "P-03",
    nombre: "Sena",
    clase: "Arquera",
    nivel: 7,
    puntosVida: 95,
    inventario: [{ nombre: "Arco compuesto", rareza: "raro" }],
  },
];
const gestor = new GestorPersonajes();
(await cargarPersonajesIniciales()).forEach((p) => gestor.registrar(p));
gestor.registrar({
  id: "P-04",
  nombre: "Nyra",
  clase: "Asesino",
  nivel: 6,
  puntosVida: 82,
  inventario: [{ nombre: "Dagas gemelas", rareza: "legendario" }],
});
gestor.subirNivel("P-01");
console.log("Magas registradas:", gestor.listarPorClase("Maga"));
console.log("Resumen del equipo RPG:");
gestor.obtenerResumen().forEach((l) => console.log(l));