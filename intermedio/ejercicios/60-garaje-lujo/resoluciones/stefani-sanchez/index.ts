// Solución Ejercicio Intermedio 60 - Stefani Sánchez
export {};

interface Auto {
  readonly placa: string;
  readonly marca: string;
  readonly modelo: string;
  readonly anio: number;
}

class GarajeError extends Error {
  constructor(
    readonly motivo: "lleno" | "duplicado" | "no-existe" | "tasacion-fallida",
    mensaje: string,
  ) {
    super(mensaje);
    this.name = "GarajeError";
  }
}

const esperar = (ms: number): Promise<void> => new Promise((resolver) => setTimeout(resolver, ms));

const valoresBase: Record<string, number> = {
  "Ferrari Roma": 245000,
  "Bentley Continental": 230000,
  "Rolls-Royce Ghost": 340000,
  "Mercedes AMG GT": 160000,
};

let fallosRestantes = 2;

const tasar = async (auto: Auto): Promise<number> => {
  await esperar(5);
  // El servicio de tasacion falla las primeras veces para probar el reintento.
  if (auto.marca === "Bentley" && fallosRestantes > 0) {
    fallosRestantes--;
    throw new GarajeError("tasacion-fallida", "Servicio de tasacion no disponible");
  }
  const base = valoresBase[`${auto.marca} ${auto.modelo}`];
  if (base === undefined) throw new GarajeError("tasacion-fallida", `Sin tasacion para ${auto.marca} ${auto.modelo}`);
  const depreciacion = Math.max(0.6, 1 - (2026 - auto.anio) * 0.04);
  return Math.round(base * depreciacion);
};

const tasarConReintento = async (auto: Auto, intentos = 3): Promise<number> => {
  for (let i = 1; ; i++) {
    try {
      return await tasar(auto);
    } catch (error) {
      const reintentable = error instanceof GarajeError && error.message.includes("no disponible");
      if (!reintentable || i >= intentos) throw error;
      console.log(`    (reintento ${i} para ${auto.placa})`);
      await esperar(5);
    }
  }
};

class Garaje {
  private readonly autos = new Map<string, Auto>();

  constructor(private readonly capacidad: number) {}

  async ingresar(auto: Auto): Promise<void> {
    await esperar(2);
    if (this.autos.has(auto.placa)) throw new GarajeError("duplicado", `${auto.placa} ya esta en el garaje`);
    if (this.autos.size >= this.capacidad) throw new GarajeError("lleno", `Garaje lleno (${this.capacidad} lugares)`);
    this.autos.set(auto.placa, auto);
  }

  async retirar(placa: string): Promise<Auto> {
    await esperar(2);
    const auto = this.autos.get(placa);
    if (!auto) throw new GarajeError("no-existe", `${placa} no esta en el garaje`);
    this.autos.delete(placa);
    return auto;
  }

  async valorTotal(): Promise<number> {
    const valores = await Promise.all([...this.autos.values()].map((a) => tasarConReintento(a)));
    return valores.reduce((acc, v) => acc + v, 0);
  }

  get ocupacion(): string {
    return `${this.autos.size}/${this.capacidad}`;
  }
}

const main = async (): Promise<void> => {
  console.log("Ejercicio 60: Garaje de lujo");
  const garaje = new Garaje(3);
  const entrantes: Auto[] = [
    { placa: "LUX-001", marca: "Ferrari", modelo: "Roma", anio: 2023 },
    { placa: "LUX-002", marca: "Bentley", modelo: "Continental", anio: 2021 },
    { placa: "LUX-001", marca: "Ferrari", modelo: "Roma", anio: 2023 },
    { placa: "LUX-003", marca: "Rolls-Royce", modelo: "Ghost", anio: 2020 },
    { placa: "LUX-004", marca: "Mercedes", modelo: "AMG GT", anio: 2022 },
  ];

  for (const auto of entrantes) {
    try {
      await garaje.ingresar(auto);
      console.log(`  + ${auto.placa} ${auto.marca} ${auto.modelo} | ocupacion ${garaje.ocupacion}`);
    } catch (error) {
      console.log(`  x ${auto.placa}: ${error instanceof GarajeError ? `[${error.motivo}] ${error.message}` : "error desconocido"}`);
    }
  }

  console.log(`Valor total estimado: $${await garaje.valorTotal()}`);
  try {
    const retirado = await garaje.retirar("LUX-002");
    console.log(`  - retirado ${retirado.placa}`);
    await garaje.retirar("LUX-002");
  } catch (error) {
    console.log(`  x ${error instanceof GarajeError ? `[${error.motivo}] ${error.message}` : "error desconocido"}`);
  }
  console.log(`Ocupacion final: ${garaje.ocupacion} | valor: $${await garaje.valorTotal()}`);
};

void main();
