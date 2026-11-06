export {};

// Ejercicio 10: Generics
// Contexto: Inventario Genérico de Videojuegos

interface Identificable {
  readonly id: string;
  nombre: string;
  pesoKg: number;
}

interface Arma extends Identificable {
  danio: number;
  durabilidad: number;
}

interface Pocion extends Identificable {
  efecto: "curacion" | "mana" | "velocidad";
  potencia: number;
}

class InventarioGenerico<T extends Identificable> {
  private elementos: T[] = [];
  private readonly capacidadMaxima: number;

  constructor(capacidadMaxima: number = 10) {
    this.capacidadMaxima = capacidadMaxima;
  }

  agregar(item: T): boolean {
    if (this.elementos.length >= this.capacidadMaxima) {
      console.log(`⚠️ Inventario lleno. No se puede añadir ${item.nombre}.`);
      return false;
    }
    this.elementos.push(item);
    console.log(`✅ Item añadido: ${item.nombre} (ID: ${item.id})`);
    return true;
  }

  obtenerPorId(id: string): T | undefined {
    return this.elementos.find((i) => i.id === id);
  }

  listarTodos(): readonly T[] {
    return [...this.elementos];
  }

  calcularPesoTotal(): number {
    return this.elementos.reduce((total, i) => total + i.pesoKg, 0);
  }
}

const baulArmas = new InventarioGenerico<Arma>(5);
baulArmas.agregar({ id: "WPN-01", nombre: "Espada de Obsidiana", pesoKg: 4.5, danio: 110, durabilidad: 100 });
baulArmas.agregar({ id: "WPN-02", nombre: "Arco Estelar", pesoKg: 2.1, danio: 85, durabilidad: 90 });

const bolsaPociones = new InventarioGenerico<Pocion>(3);
bolsaPociones.agregar({ id: "POT-01", nombre: "Elixir Mayor de Vida", pesoKg: 0.5, efecto: "curacion", potencia: 150 });

console.log(`Peso total en baúl de armas: ${baulArmas.calcularPesoTotal()} kg`);
console.log(`Total armas registradas: ${baulArmas.listarTodos().length}`);
