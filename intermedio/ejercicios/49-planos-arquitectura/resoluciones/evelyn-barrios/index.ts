export {};

type DisciplinaPlano = "Estructural" | "Arquitectonico" | "Electrico" | "Hidraulico";

interface PlanoArquitectura {
  readonly codigoPlano: string;
  readonly disciplina: DisciplinaPlano;
  readonly version: number;
  readonly revisadoPorIngeniero: boolean;
  readonly areaMetrosCuadrados: number;
}

class GestorPlanosProyecto<T extends PlanoArquitectura> {
  private planos: T[] = [];

  registrarPlano(plano: T): void {
    this.planos.push(plano);
  }

  obtenerPlanosAprobados(): T[] {
    return this.planos.filter((p) => p.revisadoPorIngeniero);
  }

  obtenerPorDisciplina(disciplina: DisciplinaPlano): T[] {
    return this.planos.filter((p) => p.disciplina === disciplina);
  }

  calcularAreaTotalProyectada(): number {
    return this.planos.reduce((acc, p) => acc + p.areaMetrosCuadrados, 0);
  }
}

const controlProyecto = new GestorPlanosProyecto<PlanoArquitectura>();
controlProyecto.registrarPlano({ codigoPlano: "PL-ARQ-01", disciplina: "Arquitectonico", version: 2, revisadoPorIngeniero: true, areaMetrosCuadrados: 180 });
controlProyecto.registrarPlano({ codigoPlano: "PL-EST-01", disciplina: "Estructural", version: 1, revisadoPorIngeniero: true, areaMetrosCuadrados: 180 });
controlProyecto.registrarPlano({ codigoPlano: "PL-ELE-01", disciplina: "Electrico", version: 1, revisadoPorIngeniero: false, areaMetrosCuadrados: 180 });

console.log("=== CONTROL DE PLANOS 3D DE ARQUITECTURA ===");
console.log(`Planos visados por ingenieria: ${controlProyecto.obtenerPlanosAprobados().length}`);
console.log(`Area total acumulada: ${controlProyecto.calcularAreaTotalProyectada()} m2`);